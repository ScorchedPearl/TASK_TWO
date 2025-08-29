import { Router, Request, Response } from 'express';
import ProductService from '../services/productservice';
import AuthMiddleware from '../middleware/auth';
import RoleMiddleware from '../middleware/role';

const productRouter = Router();
const productService = ProductService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();
const roleMiddleware = RoleMiddleware.getInstance();

productRouter.get('/', authMiddleware.optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const filters: any = {};
    if (category) filters.category = category as string;
    if (condition) filters.condition = condition as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (location) filters.location = location as string;
    if (search) filters.search = search as string;
    if (featured !== undefined) filters.featured = featured === 'true';

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'createdAt' | 'price' | 'views' | 'title',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await productService.getProducts(filters, pagination);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/featured', async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const products = await productService.getFeaturedProducts(parseInt(limit as string));

    res.status(200).json({
      success: true,
      data: { products },
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve featured products',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories();

    res.status(200).json({
      success: true,
      data: { categories },
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/seller/my-products', authMiddleware.authenticate, roleMiddleware.requireSeller, async (req: Request, res: Response) => {
  try {
    const sellerId = req.user!.id; 
    const {
      page = 1,
      limit = 12
    } = req.query;

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await productService.getSellerProducts(sellerId, pagination);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Seller products retrieved successfully'
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve seller products',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const {
      page = 1,
      limit = 12
    } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID is required',
        code: 'MISSING_SELLER_ID'
      });
    }

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await productService.getSellerProducts(sellerId, pagination);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Seller products retrieved successfully'
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve seller products',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/user/liked', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 12
    } = req.query;

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await productService.getUserLikedProducts(userId, pagination);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Liked products retrieved successfully'
    });
  } catch (error) {
    console.error('Get liked products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve liked products',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.post('/', authMiddleware.authenticate, roleMiddleware.requireSeller, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      tags
    } = req.body;

    if (!title || !description || !price || !category || !condition || !images || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, price, category, condition, images, location',
        code: 'MISSING_FIELDS'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0',
        code: 'INVALID_PRICE'
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image is required',
        code: 'MISSING_IMAGES'
      });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images,
      location: {
        city: location.city?.trim(),
        state: location.state?.trim(),
        zipCode: location.zipCode?.trim()
      },
      tags: tags || []
    };

    const product = await productService.createProduct(userId, payload);

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created successfully'
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.message.includes('Only sellers')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED_ROLE'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.get('/:id', authMiddleware.optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id;

    const product = await productService.getProductById(id as string, viewerId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.put('/:id', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0',
        code: 'INVALID_PRICE'
      });
    }

    const product = await productService.updateProduct(id as string, userId, updateData);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or unauthorized',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.delete('/:id', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const success = await productService.deleteProduct(id as string, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or unauthorized',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      code: 'SERVER_ERROR'
    });
  }
});

productRouter.post('/:id/like', authMiddleware.authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await productService.toggleLike(id as string, userId);

    res.status(200).json({
      success: true,
      data: result,
      message: result.liked ? 'Product liked' : 'Product unliked'
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like',
      code: 'SERVER_ERROR'
    });
  }
});

export default productRouter;