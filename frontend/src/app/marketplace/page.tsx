"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Heart, ShoppingCart, Star, MapPin, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GridBackground } from "../_components/bg";
import { useUser } from '@/providers/userprovider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuyerHeader } from '../dashboard/buyer/_components/header';

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
  createdAt: string;
}

interface Filters {
  category: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  search: string;
  featured: boolean;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'health-beauty', label: 'Health & Beauty' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'other', label: 'Other' }
];

const conditions = [
  { value: '', label: 'Any Condition' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState<Filters>({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    search: '',
    featured: false
  });

  const { currentUser } = useUser();
  const router = useRouter();
  // useEffect(() => {
  //   if (!currentUser) {
  //     router.push('/auth');
  //   }
  // }
  // ,[currentUser]);
  useEffect(() => {
    fetchProducts();
  }, [filters, page]);
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.append(key, value.toString());
        }
      });
      
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`${backendUrl}/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setProducts(data.data.products);
        } else {
          setProducts(prev => [...prev, ...data.data.products]);
        }
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const toggleLike = async (productId: string) => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('__Pearl_Token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProducts(prev => prev.map(product => 
          product._id === productId 
            ? {
                ...product,
                likes: product.likes.includes(currentUser.email)
                  ? product.likes.filter(id => id !== currentUser.email)
                  : [...product.likes, currentUser.email]
              }
            : product
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-soft hover:shadow-glow transition-all duration-300 border border-gray-300 dark:border-emerald-900">
        <div className="relative">
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Featured
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black"
            onClick={(e) => {
              e.preventDefault();
              toggleLike(product._id);
            }}
          >
            <Heart 
              className={`h-4 w-4 ${
                currentUser && product.likes.includes(currentUser.email)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`} 
            />
          </Button>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-black dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {product.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{product.price.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Eye className="h-3 w-3" />
              {product.views}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {product.location.city}, {product.location.state}
            </div>
            <div className="capitalize font-medium">
              {product.condition}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              By {product.sellerName}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {product.likes.length}
              </span>
            </div>
          </div>

          <Link href={`/product/${product._id}`}>
            <Button className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-soft hover:shadow-glow transition-all duration-300">
              View Details
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <GridBackground />
      
      <BuyerHeader></BuyerHeader>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-2">
              Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover amazing products from local sellers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-300 dark:border-emerald-900">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search products, categories, or sellers..."
            className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white py-3 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>


        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 rounded-lg text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 rounded-lg text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Price</label>
                  <Input
                    type="number"
                    placeholder="₹0"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Price</label>
                  <Input
                    type="number"
                    placeholder="₹10000"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured products only
                  </label>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      category: '',
                      condition: '',
                      minPrice: '',
                      maxPrice: '',
                      location: '',
                      search: '',
                      featured: false
                    });
                    setPage(1);
                  }}
                  className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {loading && page === 1 && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 shadow-soft hover:shadow-glow transition-all duration-300"
            >
              {loading ? 'Loading...' : 'Load More Products'}
            </Button>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 dark:text-gray-700 mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}