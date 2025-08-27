import { Router, Request, Response } from 'express';
import CartService from '../services/cartservice';
import AuthMiddleware from '../middleware/auth';

const cartRouter = Router();
const cartService = CartService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();


cartRouter.use(authMiddleware.authenticate);

cartRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Cart retrieved successfully'
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cart',
      code: 'SERVER_ERROR'
    });
  }
});

// Add item to cart
cartRouter.post('/items', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1',
        code: 'INVALID_QUANTITY'
      });
    }

    const cart = await cartService.addToCart(userId, productId, parseInt(quantity));

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Item added to cart successfully'
    });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    
    if (error.message.includes('Only buyers')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    if (error.message.includes('not found') || error.message.includes('not available')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    if (error.message.includes('your own product')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'INVALID_OPERATION'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      code: 'SERVER_ERROR'
    });
  }
});


cartRouter.put('/items/:productId', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
        code: 'INVALID_QUANTITY'
      });
    }

    const cart = await cartService.updateCartItem(userId, productId, parseInt(quantity));

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Cart item updated successfully'
    });
  } catch (error: any) {
    console.error('Update cart item error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'ITEM_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      code: 'SERVER_ERROR'
    });
  }
});

cartRouter.delete('/items/:productId', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID'
      });
    }

    const cart = await cartService.removeFromCart(userId, productId);

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
      code: 'SERVER_ERROR'
    });
  }
});

cartRouter.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cart = await cartService.clearCart(userId);

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      code: 'SERVER_ERROR'
    });
  }
});

cartRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await cartService.validateCart(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Cart validated successfully'
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate cart',
      code: 'SERVER_ERROR'
    });
  }
});

cartRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const summary = await cartService.getCartSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
      message: 'Cart summary retrieved successfully'
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cart summary',
      code: 'SERVER_ERROR'
    });
  }
});

cartRouter.post('/merge', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { guestCartItems } = req.body;

    if (!Array.isArray(guestCartItems)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid guest cart items',
        code: 'INVALID_DATA'
      });
    }

    const cart = await cartService.mergeCarts(guestCartItems, userId);

    res.status(200).json({
      success: true,
      data: { cart },
      message: 'Carts merged successfully'
    });
  } catch (error) {
    console.error('Merge carts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to merge carts',
      code: 'SERVER_ERROR'
    });
  }
});

export default cartRouter;