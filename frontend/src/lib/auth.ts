import type { User } from "../types/auth_interface";
import axios from "axios";

export const currentUserFetcher = async (): Promise<User | null> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  try {
    const rawToken = localStorage.getItem('__Pearl_Token');
    if (!rawToken) return null;

    const token = `Bearer ${rawToken}`;
    const response = await axios.get(`${backendUrl}/api/auth/me`, {
      headers: {
        Authorization: token,
      },
    });

    if (response.status === 200) {
      console.log("User data fetched successfully:", response.data);
      const { name, email, role, profileImage } = response.data.data.user;

      return {
        name,
        email,
        role: role || 'buyer',
        profileImage: profileImage || '', 
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};