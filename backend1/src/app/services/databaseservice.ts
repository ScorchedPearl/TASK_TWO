import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUrl = process.env.MONGODB_URL;
      
      if (!mongoUrl) {
        throw new Error('env ni h');
      }

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        w: "majority" as const
      };

      await mongoose.connect(mongoUrl, options);
      
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');

      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('docker chlale bhai', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnection() {
    return mongoose.connection;
  }
}

export default DatabaseService;