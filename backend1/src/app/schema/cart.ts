import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  sellerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  sellerName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new Schema<ICart>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

cartSchema.pre('save', function(this: ICart) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.set('toJSON', {
  transform: function(doc, ret:Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;