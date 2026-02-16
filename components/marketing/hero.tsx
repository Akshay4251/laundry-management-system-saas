"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, CheckCircle2, TrendingUp, Users, Package, DollarSign, Clock, BarChart3, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  const features = [
    "No credit card required",
    "14-day free trial",
    "Cancel anytime",
  ];

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-3xl opacity-20"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block mb-6"
            >
              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 text-blue-700 border-blue-200 hover:bg-blue-100 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-blue-600 text-blue-600" />
                Trusted by Laundry Businesses
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Transform Your Laundry Business with{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  Smart Management
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-2 left-0 h-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 -z-10"
                />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Complete SaaS solution for laundry management. Track orders,
              manage inventory, optimize routes, and grow your business with
              powerful analytics.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg group shadow-lg shadow-blue-600/50 hover:shadow-xl hover:shadow-blue-600/60 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg group border-2 hover:border-blue-600 hover:bg-blue-50"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform fill-blue-600 text-blue-600" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex items-center justify-center lg:justify-start space-x-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {String.fromCharCode(65 + i - 1)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">2,000+</strong> happy customers
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Floating Stats Card 1 */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 z-20 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Revenue</p>
                    <p className="text-xl font-bold text-gray-900">+32%</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Stats Card 2 */}
              <motion.div
                animate={{
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-1/3 -left-4 bg-white rounded-2xl shadow-2xl p-4 z-20 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Customers</p>
                    <p className="text-xl font-bold text-gray-900">1,248</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Stats Card 3 */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-8 -right-6 bg-white rounded-2xl shadow-2xl p-4 z-20 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Orders Today</p>
                    <p className="text-xl font-bold text-gray-900">248</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Dashboard Mockup */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dashboard Overview</h3>
                    <p className="text-sm text-gray-500">Today's Performance</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: DollarSign, label: "Revenue", value: "$12,450", color: "from-green-500 to-emerald-600" },
                    { icon: Package, label: "Orders", value: "248", color: "from-blue-500 to-blue-600" },
                    { icon: Users, label: "Customers", value: "1,248", color: "from-purple-500 to-purple-600" },
                    { icon: Clock, label: "Avg Time", value: "2.4h", color: "from-orange-500 to-red-600" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-2`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 h-32 relative overflow-hidden">
                  <BarChart3 className="absolute bottom-2 right-2 w-8 h-8 text-blue-600/20" />
                  <div className="flex items-end justify-between h-full space-x-2">
                    {[40, 70, 45, 80, 60, 90, 75].map((height, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-600 rounded-t-lg"
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Last 7 days</span>
                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.5%</span>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20 -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;