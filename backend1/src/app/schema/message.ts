import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  productId?: string;
  productTitle?: string;
  messages: IMessage[];
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: {
    buyer: number;
    seller: number;
  };
  status: 'active' | 'archived' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const conversationSchema = new Schema<IConversation>({
  conversationId: {
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
  sellerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  sellerName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    ref: 'Product'
  },
  productTitle: {
    type: String
  },
  messages: [messageSchema],
  lastMessage: {
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    senderId: {
      type: String,
      required: true
    }
  },
  unreadCount: {
    buyer: {
      type: Number,
      default: 0
    },
    seller: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  }
}, {
  timestamps: true
});

conversationSchema.set('toJSON', {
  transform: function(doc, ret: Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

conversationSchema.index({ buyerId: 1 });
conversationSchema.index({ sellerId: 1 });
conversationSchema.index({ conversationId: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;