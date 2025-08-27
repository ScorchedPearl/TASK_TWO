"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Eye, 
  Share2, 
  MessageCircle,
  Shield,
  Truck,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GridBackground } from "../../_components/bg";
import { useUser } from '@/providers/userprovider';
import Link from 'next/link';
import Loader from '../../loading';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  location: {
    city: string;
    state: string;
  };
  availability: string;
  views: number;
  likes: string[];
  sku: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { currentUser } = useUser();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product && currentUser) {
      setLiked(product.likes.includes(currentUser.email));
      fetchRelatedProducts();
    }
  }, [product, currentUser]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('__Pearl_Token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/products/${productId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data.data.product);
      } else if (response.status === 404) {
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product) return;

    try {
      const response = await fetch(`/api/products?category=${product.category}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.data.products.filter((p: Product) => 
          p._id !== product._id && p.sellerId !== product.sellerId
        );
        setRelatedProducts(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const toggleLike = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('__Pearl_Token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.data.liked);
        setProduct(prev => prev ? {
          ...prev,
          likes: data.data.liked 
            ? [...prev.likes, currentUser.email]
            : prev.likes.filter(email => email !== currentUser.email)
        } : prev);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addToCart = async () => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    if (currentUser.role !== 'buyer') {
      alert('Only buyers can add products to cart');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('__Pearl_Token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Product added to cart successfully!');
      } else {
        alert(data.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `Check out this product: ${product?.title}`,
          url: window.location.href
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard!');
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />
        <Card className="p-8 text-center bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
          <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/marketplace">
            <Button className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white">
              Back to Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white pt-20">
      <GridBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon" 
            className="border-gray-300 dark:border-emerald-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/marketplace" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Marketplace
              </Link>
              <span>›</span>
              <span className="capitalize">{product.category}</span>
              <span>›</span>
              <span className="text-black dark:text-white font-medium truncate max-w-[200px]">
                {product.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <div className="relative">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                    Featured
                  </div>
                )}

                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? 'border-emerald-500'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{product.price.toLocaleString()}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.availability === 'available'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {product.availability === 'available' ? 'Available' : 'Sold Out'}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views} views
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {product.likes.length} likes
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location.city}, {product.location.state}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                <span className="ml-2 font-medium capitalize text-black dark:text-white">
                  {product.condition}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <span className="ml-2 font-medium capitalize text-black dark:text-white">
                  {product.category}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Seller:</span>
                <span className="ml-2 font-medium text-black dark:text-white">
                  {product.sellerName}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                <span className="ml-2 font-medium text-black dark:text-white">
                  {product.sku}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {currentUser?.role === 'buyer' && product.availability === 'available' && product.sellerId !== currentUser?.email && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-2">
                    <label className="text-sm font-medium text-black dark:text-white">Qty:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="bg-transparent text-black dark:text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {currentUser?.role === 'buyer' && product.availability === 'available' && product.sellerId !== currentUser?.email && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white py-3 shadow-soft hover:shadow-glow transition-all duration-300"
                    onClick={addToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </div>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                )}

                {currentUser && (
                  <Button
                    variant="outline"
                    className={`px-4 py-3 border-gray-300 dark:border-gray-700 ${
                      liked 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-300 dark:border-red-700'
                        : 'text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={toggleLike}
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="px-4 py-3 border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={shareProduct}
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                {currentUser?.role === 'buyer' && product.sellerId !== currentUser?.email && (
                  <Button
                    variant="outline"
                    className="px-4 py-3 border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Buyer Protection</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Fast Delivery</span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Easy Returns</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
                More from this category
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct._id} href={`/product/${relatedProduct._id}`}>
                    <Card className="overflow-hidden hover:shadow-glow transition-shadow duration-300 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                      <img
                        src={relatedProduct.images[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-black dark:text-white line-clamp-2 mb-2">
                          {relatedProduct.title}
                        </h3>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{relatedProduct.price.toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}