import { MoreHorizontal, Package, Truck, CheckCircle, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderCardProps {
  orderId: string;
  orderDate: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  deliveryDate?: string;
}

export const OrderCard = ({ 
  orderId, 
  orderDate, 
  status, 
  total, 
  items,
  trackingNumber,
  deliveryDate 
}: OrderCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 flex items-center">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-white dark:bg-[#0f1311]/90 border border-gray-200 dark:border-[#1f2937] rounded-lg shadow hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">

        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">#{orderId}</span>
              {getStatusBadge()}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Ordered {formatDate(orderDate)}</span>
              {deliveryDate && (
                <span>• Delivered {formatDate(deliveryDate)}</span>
              )}
              {trackingNumber && (
                <span>• Tracking: {trackingNumber}</span>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] text-[#0a0e1a] dark:text-white">
              <DropdownMenuItem className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Track Package
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Write Review
              </DropdownMenuItem>
              <DropdownMenuItem>View Invoice</DropdownMenuItem>
              <DropdownMenuItem>Return Items</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-3">
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-lg">
                <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-gray-200 dark:bg-gray-700">
                  <Package className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0a0e1a] dark:text-white line-clamp-1">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {items.length > 2 && (
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
              +{items.length - 2} more items
            </div>
          )}
        </div>
        

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-[#1f2937]">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
          <div className="text-lg font-bold text-[#0a0e1a] dark:text-white">
            {formatCurrency(total)}
          </div>
        </div>
        
        {status === 'delivered' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1f2937]">
            <Button 
              size="sm" 
              className="w-full bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black hover:bg-[#116d4c] dark:hover:bg-[#2fc28d] transition"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate & Review Purchase
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
