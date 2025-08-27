import Cart, { ICart, ICartItem } from '../schema/cart';
import Product from '../schema/product';
import User from '../schema/user';

class CartService {
  private static instance: CartService;

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  public async getCart(userId: string): Promise<ICart> {
    try {
      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          totalItems: 0,
          subtotal: 0
        });
        await cart.save();
      }

      return cart;
    } catch (error) {
      console.error('Get cart failed:', error);
      throw error;
    }
  }

  public async addToCart(userId: string, productId: string, quantity: number = 1): Promise<ICart> {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'buyer') {
        throw new Error('Only buyers can add items to cart');
      }
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.availability !== 'available') {
        throw new Error('Product is not available');
      }
      if (product.sellerId === userId) {
        throw new Error('Cannot add your own product to cart');
      }
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.productId === productId
      );

      if (existingItemIndex > -1 && cart.items[existingItemIndex]) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        const newItem: ICartItem = {
          productId: product._id.toString(),
          title: product.title,
          price: product.price,
          image: product.images[0] || '',
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          quantity,
          addedAt: new Date()
        };
        cart.items.push(newItem);
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error('Add to cart failed:', error);
      throw error;
    }
  }

  public async updateCartItem(
    userId: string, 
    productId: string, 
    quantity: number
  ): Promise<ICart> {
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      const product = await Product.findById(productId);
      if (!product || product.availability !== 'available') {
        return await this.removeFromCart(userId, productId);
      }

      if (cart.items[itemIndex]) {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      return cart;
    } catch (error) {
      console.error('Update cart item failed:', error);
      throw error;
    }
  }

  public async removeFromCart(userId: string, productId: string): Promise<ICart> {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = cart.items.filter(item => item.productId !== productId);
      await cart.save();
      return cart;
    } catch (error) {
      console.error('Remove from cart failed:', error);
      throw error;
    }
  }

  public async clearCart(userId: string): Promise<ICart> {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = [];
      await cart.save();
      return cart;
    } catch (error) {
      console.error('Clear cart failed:', error);
      throw error;
    }
  }

  public async validateCart(userId: string): Promise<{
    valid: boolean;
    removedItems: string[];
    cart: ICart;
  }> {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const removedItems: string[] = [];
      const validItems: ICartItem[] = [];

      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        
        if (!product || product.availability !== 'available') {
          removedItems.push(item.title);
        } else {
          if (item.price !== product.price) {
            item.price = product.price;
          }
          validItems.push(item);
        }
      }

      if (removedItems.length > 0) {
        cart.items = validItems;
        await cart.save();
      }

      return {
        valid: removedItems.length === 0,
        removedItems,
        cart
      };
    } catch (error) {
      console.error('Validate cart failed:', error);
      throw error;
    }
  }

  public async getCartSummary(userId: string): Promise<{
    totalItems: number;
    subtotal: number;
    itemCount: number;
  }> {
    try {
      const cart = await this.getCart(userId);
      
      return {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        itemCount: cart.items.length
      };
    } catch (error) {
      console.error('Get cart summary failed:', error);
      throw error;
    }
  }

  public async mergeCarts(guestCartItems: ICartItem[], userId: string): Promise<ICart> {
    try {
      const cart = await this.getCart(userId);

      for (const guestItem of guestCartItems) {
        const product = await Product.findById(guestItem.productId);
        if (!product || product.availability !== 'available') {
          continue;
        }
        if (product.sellerId === userId) {
          continue;
        }

        const existingItemIndex = cart.items.findIndex(
          item => item.productId === guestItem.productId
        );

        if (existingItemIndex > -1 && cart.items[existingItemIndex]) {
          cart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
 
          cart.items.push({
            ...guestItem,
            price: product.price, 
            addedAt: new Date()
          });
        }
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error('Merge carts failed:', error);
      throw error;
    }
  }
}

export default CartService;