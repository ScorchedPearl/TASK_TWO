"use client"
import { motion } from "framer-motion"
import { ArrowRight, ShoppingBag, Truck, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/isMobile"

export function HeroSection() {
  const isM = useIsMobile()
  return (
    <section className="relative  flex items-center justify-center overflow-hidden lg:top-[300px] top-[330px]">
      <div className="container mx-auto px-4 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Fresh Groceries
                <span className="block bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Delivered Daily
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0">
                Shop the freshest produce, organic foods, and everyday essentials. 
                Get everything delivered to your doorstep in under 2 hours.
              </p>
            </motion.div>
       
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="shadow-glow group">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="hover:shadow-soft transition-shadow">
                View Deals
              </Button>
            </motion.div>
     {!isM&&
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 justify-items-center lg:justify-items-start"
            >
              {[
                { icon: Truck, title: "Fast Delivery", subtitle: "Under 2 hours" },
                { icon: Leaf, title: "Fresh & Organic", subtitle: "Farm to table" },
                { icon: ShoppingBag, title: "Best Prices", subtitle: "Guaranteed low" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-3 group"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <feature.icon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{feature.title}</p>
                    <p className="text-xs text-gray-400">{feature.subtitle}</p>
                  </div>
                </motion.div>
              ))}

            </motion.div>
                 }
          </motion.div>
          {!isM&&
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-0 shadow-soft hover:shadow-glow transition-shadow duration-300">
                <img 
                  src="grocery.jpg" 
                  alt="Fresh fruits and vegetables" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="absolute -bottom-6 -left-6 p-6 shadow-glow bg-gray-800/90 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.4 }}
                      className="text-2xl font-bold text-emerald-400"
                    >
                      10K+
                    </motion.p>
                    <p className="text-xs text-gray-400">Happy Customers</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.6 }}
                      className="text-2xl font-bold text-emerald-400"
                    >
                      2hrs
                    </motion.p>
                    <p className="text-xs text-gray-400">Avg Delivery</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.8 }}
                      className="text-2xl font-bold text-emerald-400"
                    >
                      99%
                    </motion.p>
                    <p className="text-xs text-gray-400">Fresh Guarantee</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
}
        </div>
      </div>
    </section>
  )
}