import Order, { IOrder, IOrderItem } from '../schema/order';
import Cart from '../schema/cart';
import Product from '../schema/product';
import User from '../schema/user';
import SeedService from './seedService';
import RedisService from './redisservice';

export interface CheckoutPayload {
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  idempotencyKey?: string;
}

export interface CheckoutResponse {
  order: IOrder;
  hmacSignature: string;
}

class OrderService {
  private static instance: OrderService;
  private readonly seedService: SeedService;
  private readonly redisService: RedisService;
  private readonly RATE_LIMIT_KEY = 'checkout_rate_limit:';
  private readonly RATE_LIMIT_WINDOW = 60; 
  private readonly RATE_LIMIT_MAX_REQUESTS = 7;
  private readonly IDEMPOTENCY_EXPIRY = 5 * 60;

  private constructor() {
    this.seedService = SeedService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  public async checkRateLimit(ipAddress: string): Promise<boolean> {
    try {
      const key = `${this.RATE_LIMIT_KEY}${ipAddress}`;
      const current = await this.redisService.get(key);
      
      if (!current) {
        await this.redisService.set(key, '1', this.RATE_LIMIT_WINDOW);
        return true;
      }

      const count = parseInt(current, 10);
      if (count >= this.RATE_LIMIT_MAX_REQUESTS) {
        return false;
      }

      await this.redisService.incr(key);
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true;
    }
  }

  public async checkIdempotency(idempotencyKey: string): Promise<IOrder | null> {
    try {
      if (!idempotencyKey) return null;

      const key = `idempotency:${idempotencyKey}`;
      const existingOrderId = await this.redisService.get(key);
      
      if (existingOrderId) {
        return await Order.findOne({ orderId: existingOrderId });
      }
      
      return null;
    } catch (error) {
      console.error('Idempotency check failed:', error);
      return null;
    }
  }

  public async storeIdempotency(idempotencyKey: string, orderId: string): Promise<void> {
    try {
      if (!idempotencyKey) return;

      const key = `idempotency:${idempotencyKey}`;
      await this.redisService.set(key, orderId, this.IDEMPOTENCY_EXPIRY);
    } catch (error) {
      console.error('Store idempotency failed:', error);
    }
  }

  public async checkout(
    userId: string, 
    payload: CheckoutPayload, 
    ipAddress: string
  ): Promise<CheckoutResponse> {
    try {
      const rateLimitOk = await this.checkRateLimit(ipAddress);
      if (!rateLimitOk) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (payload.idempotencyKey) {
        const existingOrder = await this.checkIdempotency(payload.idempotencyKey);
        if (existingOrder) {
          const responseBody = JSON.stringify({ order: existingOrder });
          const hmacSignature = this.seedService.generateHMACSignature(responseBody);
          return { order: existingOrder, hmacSignature };
        }
      }
      const user = await User.findById(userId);
      if (!user || user.role !== 'buyer') {
        throw new Error('Only buyers can place orders');
      }
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      const orderItems: IOrderItem[] = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.productId);
        
        if (!product || product.availability !== 'available') {
          throw new Error(`Product "${cartItem.title}" is no longer available`);
        }

        if (product.sellerId === userId) {
          throw new Error('Cannot purchase your own products');
        }

        const orderItem: IOrderItem = {
          productId: cartItem.productId,
          title: cartItem.title,
          price: product.price,
          image: cartItem.image,
          sellerId: cartItem.sellerId,
          sellerName: cartItem.sellerName,
          quantity: cartItem.quantity
        };

        orderItems.push(orderItem);
        subtotal += orderItem.price * orderItem.quantity;
      }
      const platformFee = this.seedService.calculatePlatformFee(subtotal);
      const totalAmount = subtotal + platformFee;
      const orderId = this.seedService.generateOrderId();
      const order = new Order({
        orderId,
        buyerId: userId,
        buyerName: user.name,
        buyerEmail: user.email,
        items: orderItems,
        subtotal,
        platformFee,
        totalAmount,
        shippingAddress: payload.shippingAddress,
        idempotencyKey: payload.idempotencyKey,
        status: 'pending',
        paymentStatus: 'pending'
      });

      await order.save();
      if (payload.idempotencyKey) {
        await this.storeIdempotency(payload.idempotencyKey, order.orderId);
      }
      await Promise.all(
        orderItems.map(item =>
          Product.findByIdAndUpdate(item.productId, { availability: 'reserved' })
        )
      );
      cart.items = [];
      await cart.save();
      const responseBody = JSON.stringify({ order });
      const hmacSignature = this.seedService.generateHMACSignature(responseBody);
      order.hmacSignature = hmacSignature;
      await order.save();

      return { order, hmacSignature };

    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  public async confirmOrder(orderId: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({ orderId });
      if (!order) {
        throw new Error('Order not found');
      }
      order.status = 'confirmed';
      order.paymentStatus = 'completed';
      await order.save();
      await Promise.all(
        order.items.map(item =>
          Product.findByIdAndUpdate(item.productId, { availability: 'sold' })
        )
      );

      return order;
    } catch (error) {
      console.error('Confirm order failed:', error);
      throw error;
    }
  }

  public async cancelOrder(orderId: string, userId: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({ orderId, buyerId: userId });
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        throw new Error('Cannot cancel order that has been shipped or delivered');
      }
      order.status = 'cancelled';
      order.paymentStatus = 'refunded';
      await order.save();
      await Promise.all(
        order.items.map(item =>
          Product.findByIdAndUpdate(item.productId, { availability: 'available' })
        )
      );

      return order;
    } catch (error) {
      console.error('Cancel order failed:', error);
      throw error;
    }
  }

  public async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find({ buyerId: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments({ buyerId: userId })
      ]);

      return {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error('Get user orders failed:', error);
      throw error;
    }
  }

  public async getSellerOrders(
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find({ 'items.sellerId': sellerId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments({ 'items.sellerId': sellerId })
      ]);

      return {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error('Get seller orders failed:', error);
      throw error;
    }
  }

  public async getOrderById(orderId: string): Promise<IOrder | null> {
    try {
      return await Order.findOne({ orderId });
    } catch (error) {
      console.error('Get order failed:', error);
      return null;
    }
  }

  public async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<IOrder | null> {
    try {
      return await Order.findOneAndUpdate(
        { orderId },
        { status },
        { new: true }
      );
    } catch (error) {
      console.error('Update order status failed:', error);
      throw error;
    }
  }
}

export default OrderService;