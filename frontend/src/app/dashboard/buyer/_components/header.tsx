"use client";

import {  Heart, ShoppingCart, ChevronDown ,ShoppingBag} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/providers/userprovider';
import { ThemeToggle } from '@/app/_components/toggle';
import { redirect } from 'next/navigation';

export const BuyerHeader = () => {
  const {logout,currentUser}=useUser();
  return (
    <header className="bg-white dark:bg-[#0f1311]/90 backdrop-blur-lg border-b border-gray-200 dark:border-[#1f2937] sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#15825d] dark:bg-[#34d399] rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0a0e1a] dark:text-white">PearlStore</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white"onClick={()=>
              redirect('/wishlist')
            }>
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white" onClick={()=>
              redirect('/cart')
            }>
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white" onClick={()=>
              redirect('/marketplace')
            }>
            <ShoppingBag className="h-5 w-5" />
          </Button>
        
  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 ml-2 text-[#0a0e1a] dark:text-white">
                <Avatar className="h-8 w-8">
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.name || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black font-semibold">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#0a0e1a] dark:text-white">{currentUser?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Buyer</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111827] text-[#0a0e1a] dark:text-white border border-gray-200 dark:border-[#1f2937]">
              <DropdownMenuItem>My Account</DropdownMenuItem>
              <DropdownMenuItem>Order History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-500" onClick={()=>{
                logout();
              }}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
