"use client";
import { ShoppingCart, Menu, X } from "lucide-react"
import { ThemeToggle } from "./toggle"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-[#0f1311]/90 backdrop-blur-lg border-b border-gray-200 dark:border-[#1f2937]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#15825d] dark:bg-[#34d399] rounded-md flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold text-[#0a0e1a] dark:text-white">
              PearlMart
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button className="hidden sm:flex px-4 py-2 bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black rounded-md font-medium hover:bg-[#116d4c] dark:hover:bg-[#2fc28d] transition">
              Login
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-[#0a0e1a] dark:text-white" />
              ) : (
                <Menu className="h-5 w-5 text-[#0a0e1a] dark:text-white" />
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-[#1f2937]">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2 pt-2">
                <button className="px-3 py-2 bg-[#15825d] dark:bg-[#34d399] text-white dark:text-black rounded-md">
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
