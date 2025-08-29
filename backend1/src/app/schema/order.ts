import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: IOrderItem[];
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  idempotencyKey?: string;
  hmacSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
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
    min: 1
  }
}, { _id: false });

const shippingAddressSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
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
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  idempotencyKey: String,
  hmacSignature: String
}, {
  timestamps: true
});

orderSchema.set('toJSON', {
  transform: function(doc, ret:Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

orderSchema.index({ buyerId: 1 });
orderSchema.index({ 'items.sellerId': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ idempotencyKey: 1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;