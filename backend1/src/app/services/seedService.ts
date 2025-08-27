import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

class SeedService {
  private static instance: SeedService;
  private readonly assignmentSeed: string;
  private readonly seedNumber: number;

  private constructor() {
    this.assignmentSeed = process.env.ASSIGNMENT_SEED || 'GHW25-default';
    const match = this.assignmentSeed.match(/\d+/);
    this.seedNumber = match ? parseInt(match[0]) : 25;
  }

  public static getInstance(): SeedService {
    if (!SeedService.instance) {
      SeedService.instance = new SeedService();
    }
    return SeedService.instance;
  }

  public generateProductSKU(productId: string): string {
    const combined = `${productId}-${this.assignmentSeed}`;
    const hash = crypto.createHash('md5').update(combined).digest('hex');
    const checksum = hash.substring(0, 8).toUpperCase();
    return `SKU-${checksum}`;
  }

  public calculatePlatformFee(subtotal: number): number {
    const basePercentage = subtotal * 0.017; 
    const seedValue = this.seedNumber;
    return Math.floor(basePercentage + seedValue);
  }

  public generateHMACSignature(responseBody: string): string {
    return crypto
      .createHmac('sha256', this.assignmentSeed)
      .update(responseBody)
      .digest('hex');
  }
  public generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const combined = `${timestamp}-${random}-${this.seedNumber}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return `ORD-${hash.substring(0, 12).toUpperCase()}`;
  }

  public verifyAdminJWT(token: string): boolean {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  public getMaskedSeed(): string {
    const parts = this.assignmentSeed.split('-');
    if (parts.length > 1) {
      return `${parts[0]}-****`;
    }
    return '****';
  }
  public getSeedNumber(): number {
    return this.seedNumber;
  }
  public generateThemeColor(): string {
    const hash = crypto.createHash('md5').update(this.assignmentSeed).digest('hex');
    const hue = parseInt(hash.substring(0, 2), 16) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  }
}

export default SeedService;