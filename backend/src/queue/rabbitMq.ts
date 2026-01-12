import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';
import sendEmail from '../utils/sendEmail';
import { LicenseService } from '../services/license.service';
import { AssetService } from '../services/asset.service';
import uploadImage, { updateImage } from '../utils/imageVercel';
import { ASSET_QUEUE, EMAIL_QUEUE, UPDATE_ASSET_QUEUE, USER_PROFILE_QUEUE } from '../config/env';
import { UserProfileService } from '../services/userProfile.service';
import { generateThumbnail } from "../utils/convertToWebP.utils";
import logger from '../logger/app.logger';


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

      this.connection = await amqp.connect(this.url);

      if (!this.connection) {
        throw new Error('Failed to create RabbitMQ connection');
      }

      this.channel = await this.connection.createChannel();
      if (!ASSET_QUEUE) throw new Error("Asset queue environment variable not set")
      if (!EMAIL_QUEUE) throw new Error("Email queue environment variable not set")
      if (!UPDATE_ASSET_QUEUE) throw new Error("Asset update queue env var is not set")

      await this.channel.assertQueue(ASSET_QUEUE, { durable: true });
      await this.channel.assertQueue(EMAIL_QUEUE, { durable: true });
      await this.channel.assertQueue(UPDATE_ASSET_QUEUE, { durable: true })
      if (!USER_PROFILE_QUEUE) throw new Error("User profile queue env var is not set")
      await this.channel.assertQueue(USER_PROFILE_QUEUE, { durable: true })

    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async publish(queue: string, content: Buffer,): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    if (!content || !Buffer.isBuffer(content)) {
      throw new Error('Invalid content format')
    }
    // const content = Buffer.from(JSON.stringify(message));

    return this.channel.sendToQueue(queue, content, {
      persistent: true
    });
  }

  async publishImages(queue: string, content: Buffer): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    if (!content || !Buffer.isBuffer(content)) {
      throw new Error('Invalid content format')
    }

    return this.channel.sendToQueue(queue, content, {
      persistent: true,

    });
  }
  async publishUpdates(queue: string, content: Buffer, headers: any): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    if (!content || !Buffer.isBuffer(content)) {
      throw new Error('Invalid content format')
    }

    return this.channel.sendToQueue(queue, content, {
      persistent: true,
      headers
    });
  }

  async consumerCreateAsset(queue: string, assetObj: AssetService, licenseObj: LicenseService): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    await this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;
        const nullIndex = msg.content.indexOf(0);
        const headerStr = msg.content.slice(0, nullIndex).toString();
        const data = msg.content.slice(nullIndex + 1);

        const { files, assetId } = JSON.parse(headerStr);
        const original = data.slice(0, files[0].size);
        const thumbnail = await generateThumbnail(original);

        try {
          // 1. Upload
          const blob = await uploadImage(files[0].filename, original, 'asset');
          const tblob = await uploadImage(files[1].filename, thumbnail.buffer, 'asset');

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

          savedAsset.status = "approved";
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
  async consumerUpdateAsset(queue: string): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    await this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        const buffer = msg.content;
        const headers = msg.properties.headers;
        const {
          type,          // 'image' | 'video'
          assetId,
          filename,
          thumbnailUrl,
        } = headers as {
          type: 'image' | 'video';
          assetId: string;
          filename: string;
          thumbnailUrl: string;
        };
        const thumbnail = await generateThumbnail(buffer);


        try {
          const tblob = await updateImage(thumbnailUrl, thumbnail.buffer);
          const blob = await updateImage(filename, buffer);
          this.channel!.ack(msg);
        } catch (err) {
          console.error('Processing failed:', err);
          this.channel!.nack(msg, false, false); // don't requeue forever
        }
      },
      { noAck: false }
    );
  }

  async consumerUserProfile(queue: string, userProfileService: UserProfileService): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    await this.channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        const buffer = msg.content;
        const headers = msg.properties.headers;
        const {
          type, // 'avatar' | 'cover'
          userProfileId,
          filename,
        } = headers as {
          type: 'avatar' | 'cover';
          userProfileId: string;
          filename: string;
        };

        try {
          logger.info("Blob upload", type);
          const compressedBuffer = await generateThumbnail(buffer);
          const blob = await uploadImage(filename, compressedBuffer.buffer, 'user-profile');
          const profile = await userProfileService.getById(userProfileId);
          if (!profile) throw new Error('User profile not found');
          logger.info("profile found", type);


          if (type === 'avatar') {
            logger.info("Blob uploaded successfully", type);
            profile.avatarUrl = blob.url;
          } else if (type === 'cover') {
            logger.info("Blob uploaded successfully", type);

            profile.coverPhoto = blob.url;
          }
          await userProfileService.save(profile);

          this.channel!.ack(msg);
        } catch (err) {
          console.error('Processing user profile failed:', err);
          this.channel!.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }


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

  if (EMAIL_QUEUE) {
    await rabbitMq.consume(EMAIL_QUEUE, (to: string, subject: string, text: string) => {
      sendEmail(to, subject, text);
    });
  } else {
    throw new Error("Email queue environment variable is not set")
  }

  if (ASSET_QUEUE) {
    const assetObj = new AssetService();
    const licenseObj = new LicenseService();
    await rabbitMq.consumerCreateAsset(ASSET_QUEUE, assetObj, licenseObj)
  } else {
    throw new Error("Asset queue environment variable is not set")

  }
  if (UPDATE_ASSET_QUEUE) {

    await rabbitMq.consumerUpdateAsset(UPDATE_ASSET_QUEUE)
  } else {
    throw new Error("Asset queue environment variable is not set")

  }
  if (USER_PROFILE_QUEUE) {
    const userProfileService = new UserProfileService();
    await rabbitMq.consumerUserProfile(USER_PROFILE_QUEUE, userProfileService);
  } else {
    throw new Error("User profile queue environment variable is not set");
  }
}

export default rabbitMq;