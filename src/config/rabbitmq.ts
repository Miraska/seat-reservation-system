import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publishMessage(queue: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export default new RabbitMQService();
