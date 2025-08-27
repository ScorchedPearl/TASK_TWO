import Product, { IProduct } from '../schema/product';
import SeedService from './seedService';
import User from '../schema/user';

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  location: {
    city: string;
    state: string;
    zipCode?: string;
  };
  tags?: string[];
}

export interface ProductFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sellerId?: string;
  availability?: 'available' | 'sold' | 'reserved';
  featured?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'price' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

class ProductService {
  private static instance: ProductService;
  private readonly seedService: SeedService;

  private constructor() {
    this.seedService = SeedService.getInstance();
  }

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  public async createProduct(sellerId: string, payload: CreateProductPayload): Promise<IProduct> {
    try {
      const seller = await User.findById(sellerId);
      if (!seller) {
        throw new Error('Seller not found');
      }

      if (seller.role !== 'seller') {
        throw new Error('Only sellers can create products');
      }
      const product = new Product({
        ...payload,
        sellerId,
        sellerName: seller.name,
        sku: '', 
        tags: payload.tags || []
      });
      await product.save();
      product.sku = this.seedService.generateProductSKU(product._id.toString());
      await product.save();

      return product;
    } catch (error) {
      console.error('Create product failed:', error);
      throw error;
    }
  }

  public async updateProduct(
    productId: string, 
    sellerId: string, 
    payload: Partial<CreateProductPayload>
  ): Promise<IProduct | null> {
    try {
      const product = await Product.findOne({ _id: productId, sellerId });
      if (!product) {
        throw new Error('Product not found or unauthorized');
      }

      Object.assign(product, payload);
      await product.save();
      return product;
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    }
  }

  public async deleteProduct(productId: string, sellerId: string): Promise<boolean> {
    try {
      const result = await Product.findOneAndDelete({ _id: productId, sellerId });
      return !!result;
    } catch (error) {
      console.error('Delete product failed:', error);
      throw error;
    }
  }

  public async getProductById(productId: string, viewerId?: string): Promise<IProduct | null> {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return null;
      }
      if (viewerId !== product.sellerId) {
        product.views += 1;
        await product.save();
      }

      return product;
    } catch (error) {
      console.error('Get product failed:', error);
      return null;
    }
  }

  public async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ) {
    try {
      const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;
      let query: any = {};

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.condition) {
        query.condition = filters.condition;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
      }

      if (filters.location) {
        query.$or = [
          { 'location.city': { $regex: filters.location, $options: 'i' } },
          { 'location.state': { $regex: filters.location, $options: 'i' } }
        ];
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.sellerId) {
        query.sellerId = filters.sellerId;
      }

      if (filters.availability) {
        query.availability = filters.availability;
      } else {
        query.availability = 'available'; 
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(query)
      ]);

      return {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error('Get products failed:', error);
      throw error;
    }
  }

  public async toggleLike(productId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const isLiked = product.likes.includes(userId);

      if (isLiked) {
        product.likes = product.likes.filter(id => id !== userId);
      } else {
        product.likes.push(userId);
      }

      await product.save();

      return {
        liked: !isLiked,
        likesCount: product.likes.length
      };
    } catch (error) {
      console.error('Toggle like failed:', error);
      throw error;
    }
  }

  public async getFeaturedProducts(limit: number = 6): Promise<IProduct[]> {
    try {
      return await Product.find({ 
        featured: true, 
        availability: 'available' 
      })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Get featured products failed:', error);
      throw error;
    }
  }

  public async getSellerProducts(
    sellerId: string,
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ) {
    try {
      return await this.getProducts({ sellerId }, pagination);
    } catch (error) {
      console.error('Get seller products failed:', error);
      throw error;
    }
  }

  public async getUserLikedProducts(
    userId: string,
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find({ 
          likes: userId,
          availability: 'available'
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments({ 
          likes: userId,
          availability: 'available'
        })
      ]);

      return {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error('Get liked products failed:', error);
      throw error;
    }
  }

  public async updateProductAvailability(
    productId: string,
    availability: 'available' | 'sold' | 'reserved'
  ): Promise<boolean> {
    try {
      const result = await Product.findByIdAndUpdate(
        productId,
        { availability },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Update product availability failed:', error);
      throw error;
    }
  }

  public async getCategories(): Promise<string[]> {
    return [
      'electronics',
      'clothing',
      'home-garden',
      'sports',
      'books',
      'toys',
      'automotive',
      'health-beauty',
      'jewelry',
      'collectibles',
      'other'
    ];
  }
}

export default ProductService;