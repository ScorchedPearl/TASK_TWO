'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './_components/card';
import WishlistSkeleton from './_components/skeleton';
import { HeartCrack } from 'lucide-react';
import { Button } from '@/components/ui/button'; 

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('__Pearl_Token');
  }
  return null;
};

export interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  condition: 'new' | 'used';
  category: string;
  sellerName: string;
}

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}
export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWishlist = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to view your wishlist.');
      setIsLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/products/user/liked?page=${currentPage}&limit=12`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your wishlist. Please try again.');
      }

      const data: PaginatedProducts = await response.json().then(res => res.data);
      setWishlist(data.products);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist(page);
  }, [page, fetchWishlist]);

  const handleUnlike = async (productId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      await fetch(`${backendUrl}/api/products/${productId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Failed to unlike product", err);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <WishlistSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg">{error}</p>
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <div className="text-center py-20">
          <HeartCrack className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="mt-2 text-2xl font-semibold text-white">Your Wishlist is Empty</h3>
          <p className="mt-2 text-base text-gray-400">
            Explore products and click the heart icon to save them for later.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} onUnlike={handleUnlike} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen text-gray-200">
        <div className="container mx-auto px-4 py-8 pt-24">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-10">
                My
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {' '}Wishlist
                </span>
            </h1>
            {renderContent()}
            
            {wishlist.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-4">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="hover:shadow-soft transition-shadow disabled:opacity-50"
                >
                    Previous
                </Button>
                <span className="font-semibold text-gray-400">Page {page} of {totalPages}</span>
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="hover:shadow-soft transition-shadow disabled:opacity-50"
                >
                    Next
                </Button>
            </div>
            )}
        </div>
    </div>
  );
}