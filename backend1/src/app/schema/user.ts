import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'buyer' | 'seller';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string; 
  profileImage?: string;
  isEmailVerified: boolean;
  provider: 'credentials' | 'google';
  googleId?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  password: {
    type: String,
    minlength: 6,
    required: function(this: IUser) {
      return this.provider === 'credentials';
    }
  },
  profileImage: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  googleId: {
    type: String,
    sparse: true, 
    default: null
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true,
    default: 'buyer'
  }
}, {
  timestamps: true
});
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; 
  user.id = user._id.toString();
  delete user._id;
  delete user.__v;
  return user;
};

userSchema.set('toObject', {
  transform: function (doc, ret) {
    const obj = ret as Record<string, any>;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj.password;
    return obj;
  }
});


userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByGoogleId = function(googleId: string) {
  return this.findOne({ googleId });
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;