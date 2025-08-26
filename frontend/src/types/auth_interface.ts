export interface User {
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  profileImage: string;
}