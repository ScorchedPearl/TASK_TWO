"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  Lock,
  CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { GridBackground } from "../_components/bg";
import { useUser } from '@/providers/userprovider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../loading';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}
const backendUrl=process.env.BACKEND_URL||"http://localhost:8000";
export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const { currentUser, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push('/auth');
      }  else {
        fetchCart();
        setShippingAddress(prev => ({
          ...prev,
          name: currentUser.name
        }));
      }
    }
  }, [currentUser, isLoading, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('__Pearl_Token');
      
      const response = await fetch(`${backendUrl}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(productId);
      const token = localStorage.getItem('__Pearl_Token');
      
      const response = await fetch(`${backendUrl}/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const token = localStorage.getItem('__Pearl_Token');
      
      const response = await fetch(`${backendUrl}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('__Pearl_Token');
      
      const response = await fetch(`${backendUrl}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return { subtotal: 0, platformFee: 0, total: 0 };
    
    const subtotal = cart.subtotal;
    const platformFee = Math.floor(subtotal * 0.017 + 25); 
    const total = subtotal + platformFee;

    return { subtotal, platformFee, total };
  };

  const processCheckout = async () => {
    try {
      setProcessingOrder(true);
      const token = localStorage.getItem('__Pearl_Token');
      const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36)}`;
      
      const response = await fetch(`${backendUrl}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          shippingAddress,
          idempotencyKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        const hmacSignature = response.headers.get('X-Signature');
        console.log('Order created with HMAC signature:', hmacSignature);
        router.push(`/checkout/success?orderId=${data.data.order.orderId}`);
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to process order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
        <GridBackground />
        <Loader />
      </div>
    );
  }

  const { subtotal, platformFee, total } = calculateTotal();

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white pt-20">
      <GridBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace">
            <Button variant="outline" size="icon" className="border-gray-300 dark:border-emerald-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {cart?.items.length || 0} {cart?.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {!cart || cart.items.length === 0 ? (
          <Card className="p-12 text-center bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
            <div className="text-6xl text-gray-300 dark:text-gray-700 mb-4">🛒</div>
            <h3 className="text-2xl font-semibold mb-2 text-black dark:text-white">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Discover amazing products and add them to your cart
            </p>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-3 shadow-soft hover:shadow-glow transition-all duration-300">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    Cart Items ({cart.items.length})
                  </h2>
                  {cart.items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-500 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1">
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-semibold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 mb-1">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Sold by {item.sellerName}
                        </p>
                        <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updating === item.productId || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-12 text-center text-sm font-medium text-black dark:text-white">
                            {updating === item.productId ? '...' : item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updating === item.productId}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => removeItem(item.productId)}
                          disabled={updating === item.productId}
                        >
                          {updating === item.productId ? (
                            <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-gray-300 dark:border-emerald-900 sticky top-24">
                <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform Fee</span>
                    <span>₹{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                    <div className="flex items-center justify-between text-lg font-semibold text-black dark:text-white">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!showCheckout ? (
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white py-3 shadow-soft hover:shadow-glow transition-all duration-300"
                    onClick={() => setShowCheckout(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-black dark:text-white mb-4">Shipping Address</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-700 dark:text-gray-300">Street Address</Label>
                        <Input
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                          className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm text-gray-700 dark:text-gray-300">City</Label>
                          <Input
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700 dark:text-gray-300">State</Label>
                          <Input
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm text-gray-700 dark:text-gray-300">ZIP Code</Label>
                          <Input
                            value={shippingAddress.zipCode}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700 dark:text-gray-300">Phone</Label>
                          <Input
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-emerald-900 text-black dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-700"
                        onClick={() => setShowCheckout(false)}
                        disabled={processingOrder}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white"
                        onClick={processCheckout}
                        disabled={processingOrder || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode}
                      >
                        {processingOrder ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Place Order
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}