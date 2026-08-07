import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel } from 'amqplib';
import { ActivityLog } from '../../database/models/activity-log.model';

const QUEUE_NAME = 'employee_activity_logs';

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnected = false;

  constructor(
    @InjectModel(ActivityLog, 'loggingConnection')
    private readonly activityLogModel: typeof ActivityLog,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.connect();
    await this.startConsumer();
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      this.logger.error('Error closing RabbitMQ connection', err);
    }
  }

  private async connect() {
    let rabbitUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://127.0.0.1:5672');
    if (rabbitUrl.includes('localhost')) {
      rabbitUrl = rabbitUrl.replace('localhost', '127.0.0.1');
    }

    try {
      this.connection = await connect(rabbitUrl);
      if (this.connection) {
        this.channel = await this.connection.createChannel();
        if (this.channel) {
          await this.channel.assertQueue(QUEUE_NAME, { durable: true });
          this.isConnected = true;
          this.logger.log(`Connected to RabbitMQ at ${rabbitUrl} (Queue: ${QUEUE_NAME})`);
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.code || String(err);
      this.logger.warn(`Failed to connect to RabbitMQ at ${rabbitUrl}. Queue operations will fallback safely. Error: ${errMsg}`);
      this.isConnected = false;
    }
  }

  /**
   * Publish an activity log event to RabbitMQ message queue
   */
  async publishLog(eventName: string, serviceName: string, payload: Record<string, any>) {
    const message = {
      eventName,
      serviceName,
      payload: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    };

    if (!this.isConnected || !this.channel) {
      this.logger.warn(`RabbitMQ not connected. Writing log directly to DB fallback for event [${eventName}]`);
      try {
        await this.activityLogModel.create({
          eventName: message.eventName,
          serviceName: message.serviceName,
          payload: message.payload,
        } as any);
      } catch (dbErr) {
        this.logger.error('Failed to write log to DB fallback', dbErr);
      }
      return;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(QUEUE_NAME, buffer, { persistent: true });
      this.logger.log(`[RabbitMQ Stream] Event [${eventName}] published to queue '${QUEUE_NAME}'`);
    } catch (err) {
      this.logger.error(`Failed to publish event [${eventName}] to RabbitMQ`, err);
    }
  }

  /**
   * Consumer listening to RabbitMQ queue and persisting received log messages to ActivityLog DB
   */
  private async startConsumer() {
    if (!this.isConnected || !this.channel) return;

    try {
      await this.channel.consume(
        QUEUE_NAME,
        async (msg) => {
          if (!msg) return;

          try {
            const contentStr = msg.content.toString();
            const data = JSON.parse(contentStr);

            await this.activityLogModel.create({
              eventName: data.eventName,
              serviceName: data.serviceName,
              payload: data.payload,
            } as any);

            this.logger.log(`[RabbitMQ Consumer] Consumed event [${data.eventName}] and saved to ActivityLog DB`);
            this.channel?.ack(msg);
          } catch (consumeErr) {
            this.logger.error('Error processing RabbitMQ message from queue', consumeErr);
            this.channel?.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log(`[RabbitMQ Consumer] Subscribed to '${QUEUE_NAME}' queue for Activity Logs`);
    } catch (err) {
      this.logger.error('Failed to start RabbitMQ consumer', err);
    }
  }
}
