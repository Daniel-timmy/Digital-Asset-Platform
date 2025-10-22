import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';
import sendEmail from '../utils/sendEmail';
import { LicenseService } from '../services/license.service';
import { AssetService } from '../services/asset.service';
import uploadImage from '../utils/imageVercel';
import { ASSET_QUEUE, EMAIL_QUEUE } from '../config/env';
import { redisClient } from "../database/redis_cache";


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
      if (!ASSET_QUEUE) throw new Error("Asset queue environment variable not set")
      if (!EMAIL_QUEUE) throw new Error("Email queue environment variable not set")

      await this.channel.assertQueue(ASSET_QUEUE, { durable: true });
      await this.channel.assertQueue(EMAIL_QUEUE, { durable: true });
      
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

  async publish(queue: string, content: Buffer, ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    if (!content || !Buffer.isBuffer(content)){
      throw new Error('Invalid content format')
    }
    // const content = Buffer.from(JSON.stringify(message));
    
    return this.channel.sendToQueue(queue, content, {
      persistent: true
    });
  }

  async publishImages(queue: string, content: Buffer ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    if (!content || !Buffer.isBuffer(content)){
      throw new Error('Invalid content format')
    }
    
    return this.channel.sendToQueue(queue, content, {
      persistent: true,
     
    });
  }
  // async publishImages(queue: string, content: Buffer, headers: any, correlationId: string ): Promise<boolean> {
  //   if (!this.channel) {
  //     throw new Error('RabbitMQ channel not initialized. Call connect() first.');
  //   }
  //   if (!content || !Buffer.isBuffer(content)){
  //     throw new Error('Invalid content format')
  //   }
    
  //   return this.channel.sendToQueue(queue, content, {
  //     persistent: true,
  //     correlationId,
  //     headers
  //   });
  // }


  getQueueName(): string {
    return 'email_queue';
  }



async consumerLicenseCreator(queue: string, assetObj: AssetService, licenseObj: LicenseService): Promise<void> {
  if (!this.channel) throw new Error('RabbitMQ channel not initialized');

  await this.channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;
      const nullIndex = msg.content.indexOf(0);
      const headerStr = msg.content.slice(0, nullIndex).toString();
      const data = msg.content.slice(nullIndex + 1);

      const { files, assetId } = JSON.parse(headerStr);
      let offset = 0;
      const original = data.slice(offset, offset + files[0].size);
      offset += files[0].size;
      const thumbnail = data.slice(offset, offset + files[1].size);

      try {
        // 1. Upload
        const blob = await uploadImage(files[0].filename, original, 'asset');
        const tblob = await uploadImage(files[1].filename, thumbnail, 'asset');

        const savedAsset = await assetObj.findOne(assetId);
        if (!savedAsset) throw new Error('Invalid asset ID');

        savedAsset.thumbnail_url = tblob.url;
        if (savedAsset.license === 'free') {
          savedAsset.file_url = blob.downloadUrl;
        } else {
          await licenseObj.create({
            asset: savedAsset,
            downloadUrl: blob.downloadUrl,
          });
        }

        await assetObj.save(savedAsset);
        this.channel!.ack(msg);
      } catch (err) {
        console.error('Processing failed:', err);
        this.channel!.nack(msg, false, false); // don't requeue forever
      }
    },
    { noAck: false }
  );
}
// async consumerLicenseCreator(queue: string, assetObj: AssetService, licenseObj: LicenseService): Promise<void> {
//   if (!this.channel) throw new Error('RabbitMQ channel not initialized');

//   await this.channel.consume(
//     queue,
//     async (msg) => {
//       if (!msg) return;

//       const buffer = msg.content;
//       const headers = msg.properties.headers;
//       const {
//         type,          // 'file' | 'thumbnail'
//         assetId,
//         correlationId,
//         filename,
//       } = headers as {
//         type: 'file' | 'thumbnail';
//         assetId: string;
//         correlationId: string;
//         filename: string;
//       };

//       try {
//         // 1. Upload
//         const blob = await uploadImage(filename, buffer, 'asset');

//         const savedAsset = await assetObj.findOne(assetId);
//         if (!savedAsset) throw new Error('Invalid asset ID');

//         if (type === "thumbnail"){
//           savedAsset.thumbnail_url = blob.url;
//         } else{
//           if (savedAsset.license === 'free') {
//             savedAsset.file_url = blob.downloadUrl;
//           } else {
//             await licenseObj.create({
//               asset: savedAsset,
//               downloadUrl: blob.downloadUrl,
//             });
//           }
//         }

//         await assetObj.save(savedAsset);
//         this.channel!.ack(msg);
//       } catch (err) {
//         console.error('Processing failed:', err);
//         this.channel!.nack(msg, false, false); // don't requeue forever
//       }
//     },
//     { noAck: false }
//   );
// }
  async consume(queue: string, sendEmail: Function): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const consumer = await this.channel.consume(queue, (msg) => {
      try {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
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

export const initializeQueues = async () => {
  await rabbitMq.connect()

  if (EMAIL_QUEUE){
    await rabbitMq.consume(EMAIL_QUEUE, (to: string, subject: string, text: string) => {
         sendEmail(to, subject, text);
       });
  } else {
    throw new Error("Email queue environment variable is not set")
  }

  if (ASSET_QUEUE) {
    const assetObj = new AssetService();
    const licenseObj = new LicenseService();
    await rabbitMq.consumerLicenseCreator(ASSET_QUEUE, assetObj, licenseObj)
  } else {
    throw new Error("Asset queue environment variable is not set")

  }
}

export default rabbitMq;