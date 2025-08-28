'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BuyerHeader } from './_components/header';
import { SpendingCard } from './_components/spendingCard';
import { OrderCard } from './_components/orderCard';
import { RecommendationsGrid } from './_components/recomendationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/providers/userprovider';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthHeaders() {
  try {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('__Pearl_Token');
    if (!token) return {};
    return { Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}` };
  } catch {
    return {};
  }
}

const BuyerDashboard: React.FC = () => {
  const [spendingAnalytics, setSpendingAnalytics] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    }
  }
  ,[]);
  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders`, {
          headers: getAuthHeaders(),
        });
        if (!mounted) return;
        const payload = res?.data?.data ?? [];
        const items = Array.isArray(payload) ? payload : payload.items ?? payload.orders ?? payload.data ?? [];
        setOrders(items);
      } catch (err: any) {
        console.error('Get orders error', err);
       
        try {
          const prodRes = await axios.get(`${API_BASE}/products?page=1&limit=6&sortBy=createdAt&sortOrder=desc`);
          if (!mounted) return;
          const payload = prodRes?.data?.data;
          const items = Array.isArray(payload) ? payload : payload.items ?? payload.products ?? [];
          setOrders(items);
        } catch (err2) {
          console.error('Fallback products fetch failed', err2);
          if (!mounted) return;
          setError('Unable to load orders or products from server.');
        }
      }
    };

    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products/featured?limit=6`);
        if (!mounted) return;
        const products = res?.data?.data?.products ?? [];
        setRecommendedProducts(products);
      } catch (err) {
        console.warn('Failed to fetch featured products', err);
      }
    };

    Promise.all([fetchOrders(), fetchFeatured()]).finally(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const confirmOrder = async (orderId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/orders/${orderId}/confirm`, {}, { headers: getAuthHeaders() });
      const updated = res?.data?.data?.order;
      setOrders((prev) => prev.map(o => (o._id === updated._id || o.id === updated.id ? updated : o)));
      return { success: true };
    } catch (err: any) {
      console.error('Confirm order error', err);
      return { success: false, error: err?.response?.data?.error ?? 'Confirm failed' };
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/orders/${orderId}/cancel`, {}, { headers: getAuthHeaders() });
      const updated = res?.data?.data?.order;
      setOrders((prev) => prev.map(o => (o._id === updated._id || o.id === updated.id ? updated : o)));
      return { success: true };
    } catch (err: any) {
      console.error('Cancel order error', err);
      return { success: false, error: err?.response?.data?.error ?? 'Cancel failed' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'shipped' | 'delivered') => {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status }, { headers: getAuthHeaders() });
      const updated = res?.data?.data?.order;
      setOrders((prev) => prev.map(o => (o._id === updated._id || o.id === updated.id ? updated : o)));
      return { success: true };
    } catch (err: any) {
      console.error('Update status error', err);
      return { success: false, error: err?.response?.data?.error ?? 'Update status failed' };
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1311] transition-colors">
      <BuyerHeader />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spendingAnalytics.length > 0 ? (
            spendingAnalytics.map((metric, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <SpendingCard {...metric} />
              </div>
            ))
          ) : (
            [0, 1, 2].map(i => (
              <div key={i} className="animate-slide-up bg-white dark:bg-[#0f1311] border border-gray-200 dark:border-[#1f2937] rounded-xl p-4">
                <div className="h-6 w-3/4 bg-gray-100 dark:bg-[#111827] rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-[#111827] rounded" />
              </div>
            ))
          )}
        </div>

        <Card className="bg-white dark:bg-[#0f1311] border border-gray-200 dark:border-[#1f2937] rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0a0e1a] dark:text-white">Recent Orders</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your purchases and delivery status</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-500">No recent orders</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order: any, index: number) => (
                  <div key={order._id ?? order.id ?? index} className="animate-scale-in" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                    <OrderCard
                      {...order}
                      onConfirm={() => confirmOrder(order._id ?? order.id)}
                      onCancel={() => cancelOrder(order._id ?? order.id)}
                      onUpdateStatus={(status: 'shipped' | 'delivered') => updateOrderStatus(order._id ?? order.id, status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
          <RecommendationsGrid products={recommendedProducts} />
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
