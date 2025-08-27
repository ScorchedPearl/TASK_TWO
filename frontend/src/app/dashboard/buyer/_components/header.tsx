"use client";

import {  Heart, ShoppingCart, Bell, ChevronDown } from 'lucide-react';
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

export const BuyerHeader = () => {
  const {logout}=useUser();
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
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white">
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-[#0a0e1a] dark:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>
          
  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 ml-2 text-[#0a0e1a] dark:text-white">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black font-semibold">
                    MJ
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-[#0a0e1a] dark:text-white">Maria Johnson</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">VIP Member</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111827] text-[#0a0e1a] dark:text-white border border-gray-200 dark:border-[#1f2937]">
              <DropdownMenuItem>My Account</DropdownMenuItem>
              <DropdownMenuItem>Order History</DropdownMenuItem>
              <DropdownMenuItem>Wishlist</DropdownMenuItem>
              <DropdownMenuSeparator />
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
