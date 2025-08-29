import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  sellerId: string;
  sellerName: string;
  location: {
    city: string;
    state: string;
    zipCode?: string;
  };
  availability: 'available' | 'sold' | 'reserved';
  views: number;
  likes: string[]; 
  tags: string[];
  sku: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
    max: 999999.99
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  images: [{
    type: String,
    required: true
  }],
  sellerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  sellerName: {
    type: String,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  tags: [String],
  sku: {
    type: String,
    required: true,
    unique: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

productSchema.set('toJSON', {
  transform: function(doc, ret:Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ availability: 1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ 'location.city': 1, 'location.state': 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;