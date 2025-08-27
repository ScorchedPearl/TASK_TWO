import { Router, Request, Response } from 'express';
import OrderService from '../services/orderservice';
import AuthMiddleware from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const orderRouter = Router();
const orderService = OrderService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();
const checkoutRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 7, 
  message: {
    success: false,
    error: 'Too many checkout requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
orderRouter.use(authMiddleware.authenticate);
orderRouter.post('/checkout', checkoutRateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingAddress, idempotencyKey } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required',
        code: 'MISSING_SHIPPING_ADDRESS'
      });
    }

    const { name, street, city, state, zipCode, phone } = shippingAddress;
    if (!name || !street || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        error: 'All shipping address fields are required',
        code: 'INCOMPLETE_SHIPPING_ADDRESS'
      });
    }

    const checkoutPayload = {
      shippingAddress: {
        name: name.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        phone: phone?.trim()
      },
      idempotencyKey
    };

    const result = await orderService.checkout(userId, checkoutPayload, ipAddress);
    res.setHeader('X-Signature', result.hmacSignature);

    res.status(201).json({
      success: true,
      data: { order: result.order },
      message: 'Order created successfully'
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    if (error.message.includes('Only buyers')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    if (error.message.includes('Cart is empty') || error.message.includes('no longer available')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'INVALID_CART'
      });
    }

    if (error.message.includes('your own products')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'INVALID_OPERATION'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process checkout',
      code: 'SERVER_ERROR'
    });
  }
});
orderRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await orderService.getUserOrders(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders',
      code: 'SERVER_ERROR'
    });
  }
});

orderRouter.get('/seller', async (req: Request, res: Response) => {
  try {
    const sellerId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await orderService.getSellerOrders(
      sellerId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Seller orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve seller orders',
      code: 'SERVER_ERROR'
    });
  }
});
orderRouter.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      });
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    const hasPermission = order.buyerId === userId || 
      order.items.some(item => item.sellerId === userId);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this order',
        code: 'UNAUTHORIZED'
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order',
      code: 'SERVER_ERROR'
    });
  }
});

orderRouter.post('/:orderId/confirm', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      });
    }

    const order = await orderService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    if (order.buyerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to confirm this order',
        code: 'UNAUTHORIZED'
      });
    }

    const updatedOrder = await orderService.confirmOrder(orderId);

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
      message: 'Order confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm order',
      code: 'SERVER_ERROR'
    });
  }
});

orderRouter.post('/:orderId/cancel', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      });
    }

    const updatedOrder = await orderService.cancelOrder(orderId, userId);

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or unauthorized',
        code: 'ORDER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
      message: 'Order cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    
    if (error.message.includes('Cannot cancel')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'INVALID_OPERATION'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
      code: 'SERVER_ERROR'
    });
  }
});

orderRouter.patch('/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required',
        code: 'MISSING_ORDER_ID'
      });
    }

    if (!status || !['shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (shipped or delivered)',
        code: 'INVALID_STATUS'
      });
    }

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    const canUpdate = order.items.some(item => item.sellerId === userId);
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this order',
        code: 'UNAUTHORIZED'
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      code: 'SERVER_ERROR'
    });
  }
});

export default orderRouter;