"use client";
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const RecommendationsGrid = (recommendations:{
  products: any[]
}
) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-[#f59e0b] fill-[#f59e0b]' 
            : i < rating
            ? 'text-[#f59e0b] fill-[#f59e0b]/50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-white dark:bg-[#0f1311]/90 border border-gray-200 dark:border-[#1f2937] rounded-lg shadow">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="text-xl font-bold text-[#0a0e1a] dark:text-white">
              Recommended for You
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your browsing history and preferences
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div
          className="grid grid-flow-col auto-cols-[75%] gap-4 overflow-x-auto md:grid-cols-2 lg:grid-cols-4 md:auto-cols-auto md:overflow-visible snap-x snap-mandatory"
        >
          {recommendations.products.map((product, index) => (
            <Card
              key={product.id}
              className="group bg-white dark:bg-[#0b0d0c] border border-gray-100 dark:border-[#111827] rounded-lg shadow-sm hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-50 dark:bg-[#0b0d0c]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {product.tag && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#15825d] dark:bg-[#34d399] text-white text-xs">
                        {product.tag}
                      </Badge>
                    </div>
                  )}

                  {product.discount && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-600 text-white text-xs">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center gap-3">
                    <Button
                      size="icon"
                      className="bg-white/90 text-[#0a0e1a] hover:bg-white shadow-sm"
                      title="Quick View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-white/90 text-[#0a0e1a] hover:bg-white shadow-sm"
                      title="Add to Wishlist"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#0a0e1a] dark:text-white line-clamp-2 text-sm leading-tight">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#15825d] dark:text-[#34d399]">
                        {formatCurrency(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black rounded-md px-3 py-2 font-medium hover:bg-[#116d4c] dark:hover:bg-[#2fc28d] transition"
                      title="Add to cart"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>

                    <Button
                      variant="ghost"
                      className="hidden md:flex items-center gap-2 border border-gray-100 dark:border-[#111827] rounded-md px-3 py-2"
                      title="View product"
                    >
                      <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
