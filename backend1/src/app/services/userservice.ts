import User from '../schema/user';
import mongoose from 'mongoose';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  isEmailVerified: boolean;
  provider: string;
  role: 'buyer' | 'seller';
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  private static isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  private static convertUserToResponse(user: any): UserResponse {
    return {
      id: user._id?.toString() || user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  public static async updateUser(
    userId: string,
    updateData: {
      name?: string;
      profileImage?: string;
    }
  ): Promise<UserResponse> {
    try {
      if (!this.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          ...updateData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return this.convertUserToResponse(user);
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  public static async getCurrentUser(id: string): Promise<UserResponse | null> {
    try {
      if (!this.isValidObjectId(id)) {
        return null;
      }

      const user = await User.findById(id).select('-password');
      if (!user) {
        return null;
      }

      return this.convertUserToResponse(user);
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }
  
  public static async getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;
      let query: any = {};

      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return {
        users: users.map(user => this.convertUserToResponse(user)),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Get all users failed:', error);
      throw error;
    }
  }

  public static async updateUserProfile(
    userId: string, 
    updateData: { name?: string; profileImage?: string }
  ): Promise<UserResponse> {
    try {
      if (!this.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { 
          ...updateData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return this.convertUserToResponse(user);
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!this.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }

  public static async getUserByEmail(email: string): Promise<UserResponse | null> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
      if (!user) {
        return null;
      }

      return this.convertUserToResponse(user);
    } catch (error) {
      console.error('Get user by email failed:', error);
      throw error;
    }
  }

  public static async getUserById(userId: string): Promise<UserResponse | null> {
    try {
      if (!this.isValidObjectId(userId)) {
        return null;
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return null;
      }

      return this.convertUserToResponse(user);
    } catch (error) {
      console.error('Get user by ID failed:', error);
      throw error;
    }
  }

  public static async verifyUserEmail(userId: string): Promise<boolean> {
    try {
      if (!this.isValidObjectId(userId)) {
        throw new Error('Invalid user ID format');
      }

      const result = await User.findByIdAndUpdate(
        userId,
        { isEmailVerified: true },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Verify user email failed:', error);
      return false;
    }
  }

  public static async getUserStats() {
    try {
      const [totalUsers, totalBuyers, totalSellers, verifiedUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'buyer' }),
        User.countDocuments({ role: 'seller' }),
        User.countDocuments({ isEmailVerified: true })
      ]);

      return {
        totalUsers,
        totalBuyers,
        totalSellers,
        verifiedUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : '0.00'
      };
    } catch (error) {
      console.error('Get user stats failed:', error);
      throw error;
    }
  }
}

export default UserService;