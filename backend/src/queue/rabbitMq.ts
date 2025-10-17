// import { connect, Connection, Channel } from 'amqplib';
// import * as amqp from 'amqplib';
// import { RABBITMQ_URL } from '../config/env';

// let connection: Connection;
// let channel: Channel;

// const QUEUE_NAME = 'email_queue';

// export const initRabbitMQ = async () => {
//   if (RABBITMQ_URL === undefined) {
//     throw new Error('RABBITMQ_URL is not defined in environment variables');
//   }
//   connection = await amqp.connect(RABBITMQ_URL);
//   channel = await connection.createChannel();
//   await channel.assertQueue(QUEUE_NAME, { durable: true });

//   console.log('RabbitMQ connection ready');
// };

// export const getChannel = (): Channel => {
//   if (!channel) throw new Error('RabbitMQ channel not initialized');
//   return channel;
// };

// export const getQueueName = () => QUEUE_NAME;

import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

interface RabbitMQConfig {
  url: string;
  queues?: string[];
}

class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private url: string;

  constructor(config: RabbitMQConfig) {
    this.url = config.url;
  }

  async connect(): Promise<void> {
  console.log(this.url)

    try {
      
      // This MUST return amqp.Connection
      this.connection = await amqp.connect(this.url);

      if (!this.connection) {
        throw new Error('Failed to create RabbitMQ connection');
      }
      
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue('email_queue', { durable: true });
      
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) throw new Error('Channel not ready');
    
    // Example queue setup
    const queue = 'test_queue';
    const q = await this.channel.assertQueue(queue, {
      durable: true
    });
    console.log(`Queue ${queue} is ready. Max messages: ${q.messageCount}`);
  }

  async publish(queue: string, message: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    const content = Buffer.from(JSON.stringify(message));
    
    return this.channel.sendToQueue(queue, content, {
      persistent: true
    });
  }

  getQueueName(): string {
    return 'email_queue';
  }

  async consume(queue: string, sendEmail: Function): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const consumer = await this.channel.consume(queue, (msg) => {
      try {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          console.log('Received message:', content);
          
          // Process message
          sendEmail(content.to, content.subject, content.text);
          
          // Acknowledge message
          this.channel!.ack(msg);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        if (msg) this.channel!.nack(msg, false, false);
      }
    });

    console.log(`Consumer started for queue: ${queue}`);
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ:', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

const rabbitMq = new RabbitMQService({
  url: process.env.RABBITMQ_URL || 'amqp://localhost'
});

export default rabbitMq;