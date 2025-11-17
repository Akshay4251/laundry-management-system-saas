"use client";

import { motion } from "framer-motion";
import {
  Package,
  Truck,
  Users,
  DollarSign,
  BarChart3,
  Bell,
  Smartphone,
  Clock,
  Shield,
  Zap,
  ArrowUpRight,
  QrCode,
  MapPin,
  TrendingUp,
  Star,
  Sparkles,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const Features = () => {
  // Fixed map pin positions (deterministic)
  const mapPins = [
    { top: "15%", left: "20%" },
    { top: "45%", left: "55%" },
    { top: "70%", left: "30%" },
    { top: "25%", left: "75%" },
    { top: "60%", left: "65%" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <section id="features" className="py-16 sm:py-24 md:py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <Badge className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Complete Solution
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Built for modern{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                laundry operations
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              From pickup to delivery, manage every aspect of your laundry business with powerful tools designed for scale.
            </p>
          </motion.div>

          {/* Feature 1: Order Management */}
          <div className="relative mx-auto max-w-6xl mb-16 sm:mb-24 md:mb-32">
            <div className="absolute -z-50 size-[300px] sm:size-[500px] -top-20 -left-20 aspect-square rounded-full bg-blue-500/20 blur-3xl"></div>
            <p className="text-slate-800 text-sm sm:text-base md:text-lg text-left max-w-3xl mb-6 sm:mb-8 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              LaundryPro helps you manage thousands of orders effortlessly with intelligent tracking and real-time updates that keep your customers informed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="md:col-span-2">
                {/* Large Feature Image */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  <div className="relative z-10">
                    {/* Dashboard Preview */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                        <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Today's Orders</h4>
                        <Badge className="bg-green-100 text-green-700 border-green-200 w-fit text-xs">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Live
                        </Badge>
                      </div>

                      {/* Order Cards */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        {[
                          { customer: "John Doe", order: "#12845", items: "5 items", status: "Processing", color: "blue", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                          { customer: "Sarah Smith", order: "#12844", items: "3 items", status: "Ready", color: "green", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                          { customer: "Mike Johnson", order: "#12843", items: "7 items", status: "Washing", color: "yellow", img: "https://randomuser.me/api/portraits/men/52.jpg" },
                        ].map((order, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 hover:bg-gray-100 transition-colors gap-2 sm:gap-3"
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                              <img 
                                src={order.img}
                                alt={order.customer}
                                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{order.customer}</p>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate">{order.order} • {order.items}</p>
                              </div>
                            </div>
                            <Badge className={`bg-${order.color}-100 text-${order.color}-700 border-${order.color}-200 text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0`}>
                              {order.status}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
                        {[
                          { value: "248", label: "Today" },
                          { value: "12.5K", label: "This Month" },
                          { value: "99.2%", label: "On-time" },
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center border border-blue-100">
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                {/* Small Feature Card - QR CODES */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 p-4 sm:p-6 md:p-8 shadow-xl hover:-translate-y-1 transition duration-300 mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="relative z-10">
                    <QrCode className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white mb-3 sm:mb-4" />
                    
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mt-3 sm:mt-4">
                      <div className="flex items-center justify-center mb-2 sm:mb-3">
                        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 md:p-6">
                          <QrCode className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-gray-900" strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-center text-[10px] sm:text-xs text-gray-600 font-mono">#ORD-12845</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-[24px] leading-tight text-slate-800 font-semibold mt-4 sm:mt-6 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Track every item with smart QR codes
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Never lose an item again. Our QR tagging system ensures 99.99% accuracy and complete visibility throughout the cleaning process.
                </p>
                <a href="#" className="group inline-flex items-center gap-2 mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 transition font-medium text-sm sm:text-base px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Learn more about order tracking
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Feature 2: Smart Logistics - Reversed Layout */}
          <div className="relative mx-auto max-w-6xl mb-16 sm:mb-24 md:mb-32">
            <div className="absolute -z-50 size-[300px] sm:size-[500px] -top-20 -right-20 aspect-square rounded-full bg-green-500/20 blur-3xl"></div>
            <p className="text-slate-800 text-sm sm:text-base md:text-lg text-left sm:text-right max-w-3xl sm:ml-auto mb-6 sm:mb-8 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Optimize your delivery routes with AI-powered planning that reduces fuel costs by 30% and ensures on-time deliveries.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="md:col-span-1 order-2 md:order-1">
                {/* Small Feature Card - MAP */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-6 md:p-8 shadow-xl hover:-translate-y-1 transition duration-300 mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff10_25%,transparent_25%,transparent_75%,#ffffff10_75%,#ffffff10)] bg-[size:20px_20px]"></div>
                  <div className="relative z-10">
                    <Truck className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white mb-3 sm:mb-4" />
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
                      <div className="relative h-28 sm:h-32 md:h-36 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden">
                        {mapPins.map((pin, idx) => (
                          <div
                            key={idx}
                            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg animate-pulse"
                            style={{
                              top: pin.top,
                              left: pin.left,
                              animationDelay: `${idx * 0.3}s`
                            }}
                          ></div>
                        ))}
                        <motion.div
                          animate={{
                            x: [0, 50, 100, 50, 0],
                            y: [0, 30, 60, 90, 0]
                          }}
                          transition={{ duration: 8, repeat: Infinity }}
                          className="absolute"
                        >
                          <div className="bg-white rounded-full p-1 sm:p-1.5 shadow-lg">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          </div>
                        </motion.div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 sm:mt-3">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">12</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Stops</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">24km</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Distance</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">1.8h</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-[24px] leading-tight text-slate-800 font-semibold mt-4 sm:mt-6 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI-powered route optimization
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Save time and money with intelligent routing that adapts to traffic, weather, and delivery priorities in real-time.
                </p>
                <a href="#" className="group inline-flex items-center gap-2 mt-3 sm:mt-4 text-green-600 hover:text-green-700 transition font-medium text-sm sm:text-base px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Explore logistics features
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
                </a>
              </div>

              <div className="md:col-span-2 order-1 md:order-2">
                {/* Large Feature Image */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  
                  <div className="relative z-10">
                    {/* Delivery Dashboard */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                        <h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Active Deliveries</h4>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          <span className="text-xs sm:text-sm text-gray-600">5 drivers online</span>
                        </div>
                      </div>

                      {/* Driver Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                        {[
                          { driver: "Alex Martinez", orders: "8", eta: "45 min", status: "On Route", img: "https://randomuser.me/api/portraits/men/22.jpg" },
                          { driver: "Sarah Kim", orders: "6", eta: "1.2 hrs", status: "Delivering", img: "https://randomuser.me/api/portraits/women/65.jpg" },
                        ].map((driver, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                <img 
                                  src={driver.img}
                                  alt={driver.driver}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{driver.driver}</p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">{driver.orders} orders</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                                {driver.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">ETA:</span>
                              <span className="font-semibold text-gray-900">{driver.eta}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Performance Stats */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Today's Performance</p>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">99.2%</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">On-time rate</p>
                              </div>
                              <div className="h-6 sm:h-8 w-px bg-gray-300"></div>
                              <div>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">2.4h</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Avg. time</p>
                              </div>
                            </div>
                          </div>
                          <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Customer Experience - FIXED PHONE MOCKUP */}
          <div className="relative mx-auto max-w-6xl mb-16 sm:mb-24 md:mb-32">
            <div className="absolute -z-50 size-[300px] sm:size-[500px] -top-20 -left-20 aspect-square rounded-full bg-purple-500/20 blur-3xl"></div>
            <p className="text-slate-800 text-sm sm:text-base md:text-lg text-left max-w-3xl mb-6 sm:mb-8 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Give your customers the power to manage everything from their phone. Schedule pickups, track orders, and earn rewards - all in one beautiful app.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="md:col-span-2">
                {/* Large Feature Image - Mobile App - RESPONSIVE */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl group hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  <div className="relative z-10 flex items-center justify-center">
                    {/* Phone Mockup - RESPONSIVE */}
                    <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto">
                      <div className="relative w-full" style={{ paddingBottom: '208%' }}>
                        <div className="absolute inset-0 bg-gray-900 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-2 sm:p-2.5 shadow-2xl">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 sm:w-28 md:w-32 h-5 sm:h-6 bg-gray-900 rounded-b-2xl z-20"></div>
                          
                          <div className="w-full h-full bg-white rounded-[1.75rem] sm:rounded-[2.25rem] md:rounded-[2.5rem] overflow-hidden relative">
                            {/* Status Bar */}
                            <div className="bg-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 flex justify-between items-center text-[10px] sm:text-xs border-b border-gray-100">
                              <span className="font-semibold text-gray-900">9:41</span>
                              <div className="flex space-x-1 items-center">
                                <div className="flex space-x-0.5">
                                  <div className="w-0.5 sm:w-1 h-2 sm:h-2.5 md:h-3 bg-gray-900 rounded-full"></div>
                                  <div className="w-0.5 sm:w-1 h-2 sm:h-2.5 md:h-3 bg-gray-900 rounded-full"></div>
                                  <div className="w-0.5 sm:w-1 h-2 sm:h-2.5 md:h-3 bg-gray-400 rounded-full"></div>
                                </div>
                              </div>
                            </div>

                            {/* App Content - SCROLLABLE */}
                            <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 md:space-y-5 pb-16 sm:pb-20 md:pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100% - 3.5rem)' }}>
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Welcome back,</p>
                                  <h5 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Sarah!</h5>
                                </div>
                                <div className="relative">
                                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
                                  <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5 bg-red-500 rounded-full border border-white sm:border-2"></div>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
                                  <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-1 sm:mb-2" />
                                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">New Order</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
                                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-1 sm:mb-2" />
                                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">Schedule</p>
                                </div>
                              </div>

                              {/* Active Orders */}
                              <div>
                                <h6 className="font-bold text-gray-900 mb-2 sm:mb-2.5 md:mb-3 text-xs sm:text-sm md:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Active Orders</h6>
                                {[
                                  { id: "#12845", status: "Processing", color: "bg-blue-500", progress: 60 },
                                  { id: "#12844", status: "Ready", color: "bg-green-500", progress: 100 },
                                ].map((order, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 mb-2 sm:mb-2.5 md:mb-3 shadow-sm">
                                    <div className="flex items-center justify-between mb-2 sm:mb-2.5 md:mb-3">
                                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">{order.id}</span>
                                      <div className={`${order.color} text-white text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full font-medium`}>
                                        {order.status}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                                        <div className={`${order.color} h-1.5 sm:h-2 rounded-full transition-all duration-500`} style={{ width: `${order.progress}%` }}></div>
                                      </div>
                                      <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-medium w-8 sm:w-10 text-right">{order.progress}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Rewards Card */}
                              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-1">Loyalty Points</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">2,450</p>
                                  </div>
                                  <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 opacity-30" />
                                </div>
                              </div>
                            </div>

                            {/* Bottom Nav */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-b-[1.75rem] sm:rounded-b-[2.25rem] md:rounded-b-[2.5rem]">
                              <div className="flex justify-around items-center">
                                {[
                                  { icon: Package, active: true },
                                  { icon: Clock, active: false },
                                  { icon: Star, active: false },
                                  { icon: Users, active: false },
                                ].map((item, idx) => (
                                  <button key={idx} className="relative">
                                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {item.active && (
                                      <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-blue-600 rounded-full"></div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                {/* Small Feature Card */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 p-4 sm:p-6 md:p-8 shadow-xl hover:-translate-y-1 transition duration-300 mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="relative z-10">
                    <Star className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white mb-3 sm:mb-4" />
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mt-3 sm:mt-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">4.9</p>
                        <p className="text-xs sm:text-sm text-gray-600">App Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-[24px] leading-tight text-slate-800 font-semibold mt-4 sm:mt-6 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Loved by customers worldwide
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Our mobile app makes it easy for customers to manage their laundry needs. Schedule pickups, track orders, and earn rewards - all in one place.
                </p>
                <a href="#" className="group inline-flex items-center gap-2 mt-3 sm:mt-4 text-purple-600 hover:text-purple-700 transition font-medium text-sm sm:text-base px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Download the app
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Feature 4: Analytics - Full Width */}
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute -z-50 size-[300px] sm:size-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
            <p className="text-slate-800 text-sm sm:text-base md:text-lg text-center max-w-3xl mx-auto mb-6 sm:mb-8 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Make informed decisions with powerful analytics and real-time insights into your business performance.
            </p>
            
            <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1.5 sm:p-2 shadow-2xl">
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
                  {[
                    { label: "Revenue", value: "$12.5K", change: "+12.5%", icon: DollarSign },
                    { label: "Orders", value: "248", change: "+8.2%", icon: Package },
                    { label: "Customers", value: "1,248", change: "+23.1%", icon: Users },
                    { label: "Avg. Time", value: "2.4h", change: "-15.3%", icon: Clock },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-6 border border-gray-100 sm:border-2 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1 sm:mb-2 md:mb-4">
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
                        <span className={`text-[10px] sm:text-xs md:text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-0.5 sm:mb-1">{stat.label}</p>
                      <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Revenue Overview</h4>
                    
                    {/* Period Buttons */}
                    <div className="flex gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      {["7D", "30D", "90D", "1Y"].map((period, idx) => (
                        <button
                          key={idx}
                          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                            idx === 1 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Bars */}
                  <div className="flex items-end justify-between h-24 sm:h-32 md:h-40 lg:h-48 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
                    {[65, 45, 75, 55, 85, 70, 90, 80, 95, 85, 100, 92].map((height, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm sm:rounded-t-md md:rounded-t-lg lg:rounded-t-xl relative group cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-colors min-w-0"
                      >
                        <div className="absolute -top-6 sm:-top-8 md:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          ${(height * 150).toFixed(0)}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Month Labels */}
                  <div className="grid grid-cols-12 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 mt-2 sm:mt-3 md:mt-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => (
                      <div key={idx} className="text-center">
                        <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 block">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      {/* Add scrollbar-hide utility */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Features;