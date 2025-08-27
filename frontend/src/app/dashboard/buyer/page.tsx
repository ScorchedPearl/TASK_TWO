import { BuyerHeader } from './_components/header';
import { SpendingCard } from './_components/spendingCard';
import { OrderCard } from './_components/orderCard';
import { RecommendationsGrid } from './_components/recomendationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Heart, TrendingDown, Gift, CreditCard } from 'lucide-react';

const BuyerDashboard = () => {
  const spendingAnalytics = [
    {},
  ];

  const recentOrders = [
    {}.
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1311] transition-colors">
      <BuyerHeader />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spendingAnalytics.map((metric, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <SpendingCard {...metric} />
            </div>
          ))}
        </div>
        <Card className="bg-white dark:bg-[#0f1311] border border-gray-200 dark:border-[#1f2937] rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0a0e1a] dark:text-white">Recent Orders</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your purchases and delivery status</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentOrders.map((order, index) => (
                <div key={order.orderId} className="animate-scale-in" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                  <OrderCard {...order} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
 
        <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
          <RecommendationsGrid />
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
