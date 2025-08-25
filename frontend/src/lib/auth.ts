import type { User } from "../types/auth_interface";
import axios from "axios";

export const currentUserFetcher = async (): Promise<User | null> => {
  try {
    const rawToken = localStorage.getItem('__Pearl_Token');
    if (!rawToken) return null;

    const token = `Bearer ${rawToken}`;
    const response = await axios.get(`${process.env.BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: token,
      },
    });

    if (response.status === 200) {
      console.log("User data fetched successfully:", response);
      const { name, email,profileImage } = response.data.data.user;

      return {
        name,
        email,
        profileImage: profileImage || '', 
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};






