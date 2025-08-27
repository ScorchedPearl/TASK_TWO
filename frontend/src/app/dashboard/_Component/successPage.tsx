"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GridBackground } from "../../_components/bg";
import Link from 'next/link';
import Loader from '../../loading';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

interface Order {
  _id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('__Pearl_Token');
      
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.data.order);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
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

  if (error || !order) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />
        <Card className="p-8 text-center bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The order you\'re looking for doesn\'t exist.'}
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
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your purchase, {order.buyerName}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Order ID: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {order.orderId}
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">Order Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-black dark:text-white">Order Placed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Processing</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Shipped</p>
                    <p className="text-xs text-gray-400">Estimated 2-3 days</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
              <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">Order Details</h2>
              
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-black dark:text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sold by {item.sellerName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({order.items.length} items)</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform Fee</span>
                    <span>₹{order.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-black dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Shipping Address</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <p className="font-medium text-black dark:text-white">{order.shippingAddress.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.street}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-gray-600 dark:text-gray-400">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          <Link href="/marketplace">
            <Button 
              variant="outline" 
              className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          
          <Link href="/dashboard/buyer">
            <Button className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              📧 Order confirmation email sent to {order.buyerEmail}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              You can track your order status in your dashboard. Estimated delivery: 2-3 business days.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}