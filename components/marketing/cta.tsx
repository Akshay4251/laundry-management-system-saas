// app/components/marketing/cta.tsx

"use client";

import { Shield, CheckCircle2, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

const CTA = () => {
  const features = [
    "Setup in 10 minutes",
    "No credit card required",
    "Cancel anytime",
    "24/7 support included",
  ];

  const trustBadges = [
    { icon: Shield, text: "Bank-level security" },
    { icon: CheckCircle2, text: "GDPR compliant" },
    { icon: Zap, text: "99.9% uptime" },
  ];

  return (
    <>
      {/* Poppins Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          
          {/* Main Hero CTA - Centered with Background */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div 
              className="relative flex flex-col items-center justify-center mx-auto max-w-6xl w-full text-center rounded-2xl sm:rounded-3xl py-12 sm:py-16 md:py-20 lg:py-24 bg-cover bg-center bg-no-repeat overflow-hidden shadow-2xl border border-gray-200"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1600&h=900&fit=crop&q=80')`,
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-cyan-900/95" />
              
              {/* Animated Gradient Orbs */}
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
                className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-cyan-400/30 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-400/30 rounded-full blur-3xl"
              />

              {/* Content */}
              <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 w-full">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-6 flex justify-center"
                >
                  <Badge className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 bg-white/20 backdrop-blur-md text-white border-white/30 text-xs sm:text-sm md:text-base font-semibold shadow-xl inline-flex items-center">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="whitespace-nowrap">Complete Laundry Platform</span>
                  </Badge>
                </motion.div>

                {/* Main Heading */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white max-w-4xl mx-auto mb-3 sm:mb-4 md:mb-5 leading-tight px-2"
                >
                  Transform Your Laundry Business with
                  <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Next-Gen Automation
                  </span>
                </motion.h1>

                {/* Decorative Gradient Line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-0.5 sm:h-1 w-24 sm:w-32 md:w-40 mx-auto my-3 sm:my-4 md:my-5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
                />

                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed font-medium px-2"
                >
                  Streamline orders, manage staff, and delight customers with our all-in-one platform. 
                  Join hundreds of successful laundry businesses growing with LaundryPro.
                </motion.p>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-8 md:mb-10 px-2"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center space-x-1.5 sm:space-x-2 bg-white/15 backdrop-blur-md border border-white/30 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-full text-white font-semibold text-xs sm:text-sm shadow-lg"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={2.5} />
                      <span className="whitespace-nowrap">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-4 sm:mb-5 md:mb-6 px-2"
                >
                  <Link href="/register" className="w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-6 py-5 sm:px-8 sm:py-5 md:px-10 md:py-6 text-sm sm:text-base md:text-lg font-bold bg-white text-blue-600 hover:bg-gray-100 shadow-2xl shadow-white/30 rounded-full group transition-all duration-300"
                      >
                        <span className="whitespace-nowrap">Start 14-Day Free Trial</span>
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/login" className="w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto px-6 py-5 sm:px-8 sm:py-5 md:px-10 md:py-6 text-sm sm:text-base md:text-lg font-bold border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Trust Line */}
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="text-blue-200 text-xs sm:text-sm font-medium px-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-1"
                >
                  <span className="inline-flex items-center">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 flex-shrink-0" />
                    No credit card required
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Cancel anytime</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden md:inline">30-day money-back guarantee</span>
                  <span className="md:hidden">30-day guarantee</span>
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges - Below Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8 shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 group w-auto"
              >
                <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:scale-110 transition-transform flex-shrink-0">
                  <badge.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">{badge.text}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs">Enterprise-grade</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof / Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-10 md:mt-12 mb-8 sm:mb-10 md:mb-12 bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 sm:mb-2"
                >
                  10min
                </motion.div>
                <p className="text-gray-600 font-semibold text-[10px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight">
                  Average Setup<span className="hidden sm:inline"> Time</span>
                </p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2"
                >
                  24/7
                </motion.div>
                <p className="text-gray-600 font-semibold text-[10px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight">
                  Support<span className="hidden sm:inline"> Available</span>
                </p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2"
                >
                  99.9%
                </motion.div>
                <p className="text-gray-600 font-semibold text-[10px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight">
                  Uptime<span className="hidden sm:inline"> Guarantee</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CTA;