'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

import type { Product } from '../page';

interface ProductCardProps {
  product: Product;
  onUnlike: (productId: string) => void;
}

export default function ProductCard({ product, onUnlike }: ProductCardProps) {
  const handleUnlike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUnlike(product._id);
  };

  return (
    <div
      className={clsx(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-gray-900/80 border border-gray-800',
        'shadow-md hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.03]',
        'backdrop-blur-xl'
      )}
    >
      <Link href={`/products/${product._id}`} className="block">
  
        <div className="relative w-full h-56 bg-gray-800 overflow-hidden">
          <img
            src={product.images[0] || '/placeholder.png'}
            alt={product.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-colors"></div>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-medium text-gray-200 bg-gray-800 rounded-full capitalize">
              {product.condition}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-800 rounded-full">
              {product.category}
            </span>
          </div>

          <h3
            className={clsx(
              'text-lg font-semibold line-clamp-1',
              'text-gray-100'
            )}
          >
            {product.title}
          </h3>

          <p className="text-2xl font-bold text-emerald-400">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-400">
            Sold by <span className="text-gray-200">{product.sellerName}</span>
          </p>
        </div>
      </Link>
      <button
        onClick={handleUnlike}
        aria-label="Remove from Wishlist"
        title="Remove from Wishlist"
        className={clsx(
          'absolute top-3 right-3 p-2 rounded-full backdrop-blur-lg',
          'bg-gray-900/70 text-red-500 hover:text-red-400 hover:bg-gray-800/90',
          'transition-all duration-300 hover:scale-110 active:scale-95'
        )}
      >
        <Heart fill="currentColor" size={22} />
      </button>
    </div>
  );
}
