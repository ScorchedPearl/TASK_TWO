"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/userprovider';
import Loader from '../loading';

export default function FlowPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push('/auth');
      } else {
        if (currentUser.role === 'buyer') {
          router.push('/dashboard/buyer');
        } else if (currentUser.role === 'seller') {
          router.push('/dashboard/seller');
        } else {
         
          console.error('Unknown user role:', currentUser.role);
          router.push('/auth');
        }
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <div className="flex flex-col items-center space-y-4">
       <Loader></Loader>
      </div>
    </div>
  );
}