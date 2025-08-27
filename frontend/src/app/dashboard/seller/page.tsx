"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GridBackground } from "../../_components/bg";
import { useUser } from '@/providers/userprovider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  availability: string;
  views: number;
  likes: string[];
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  totalViews: number;
  totalLikes: number;
  totalRevenue: number;
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { currentUser, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.role !== 'seller') {
      router.push('/flow');
      return;
    }
    fetchSellerData();
  }, [currentUser]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('__Pearl_Token');
      
      const productsResponse = await fetch(`/api/products/seller/${currentUser?.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data.products);
        
        const totalProducts = productsData.data.products.length;
        const totalViews = productsData.data.products.reduce((sum: number, p: Product) => sum + p.views, 0);
        const totalLikes = productsData.data.products.reduce((sum: number, p: Product) => sum + p.likes.length, 0);
        
        setStats({
          totalProducts,
          totalViews,
          totalLikes,
          totalRevenue: 0         });
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('__Pearl_Token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black">
        <GridBackground />
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <GridBackground />
      
      <div className="relative z-10 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-300 dark:border-emerald-900 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PearlStore Seller</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {currentUser?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddProduct(true)}
              className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.totalProducts}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Likes
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.totalLikes}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-black dark:text-white">
                    Your Products
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage your product listings
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    No products yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start selling by adding your first product
                  </p>
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={product.images[0] || '/placeholder-product.jpg'}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                          <Badge
                            className={`absolute top-2 left-2 ${
                              product.availability === 'available'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {product.availability}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-black dark:text-white line-clamp-2 mb-2">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{product.price.toLocaleString()}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {product.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {product.likes.length}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/product/${product._id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProduct(product._id)}
                              className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Product Modal - You can implement this as a separate component */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[500px] max-w-[90vw] bg-white dark:bg-black border border-gray-300 dark:border-emerald-900">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddProduct(false)}
                className="absolute right-4 top-4"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                Product creation form would go here.
                <br />
                <Button
                  variant="link"
                  onClick={() => setShowAddProduct(false)}
                  className="mt-2"
                >
                  Close for now
                </Button>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}