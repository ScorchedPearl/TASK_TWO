import User from '../schema/user';

class UserService {
  public static async updateUser(
  userId: string,
  updateData: {
    name?: string;
    profileImage?: string;
  }
) {
  try {
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

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      profileImageURL: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error('Update user failed:', error);
    throw error;
  }
}

  public static async getCurrentUser(id: string) {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
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
        users: users.map(user => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          profileImageURL: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          provider: user.provider,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
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
  ) {
    try {
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

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }

  public static async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Get user by email failed:', error);
      throw error;
    }
  }

  public static async verifyUserEmail(userId: string): Promise<boolean> {
    try {
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
}

export default UserService;