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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Hero CTA - Centered with Background */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div 
              className="relative flex flex-col items-center justify-center mx-auto max-w-6xl w-full text-center rounded-3xl py-16 md:py-24 bg-cover bg-center bg-no-repeat overflow-hidden shadow-2xl border border-gray-200"
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
                className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
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
                className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
              />

              {/* Content */}
              <div className="relative z-10 px-6 md:px-12">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <Badge className="px-6 py-3 bg-white/20 backdrop-blur-md text-white border-white/30 text-base font-semibold shadow-xl">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Complete Laundry Management Platform
                  </Badge>
                </motion.div>

                {/* Main Heading */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mx-auto mb-5 leading-tight"
                >
                  Transform Your Laundry Business with
                  <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Next-Gen Automation
                  </span>
                </motion.h1>

                {/* Decorative Gradient Line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-1 w-40 mx-auto my-5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
                />

                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed font-medium"
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
                  className="flex flex-wrap items-center justify-center gap-3 mb-10"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/30 px-4 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
                >
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="px-10 py-6 text-base md:text-lg font-bold bg-white text-blue-600 hover:bg-gray-100 shadow-2xl shadow-white/30 rounded-full group transition-all duration-300"
                      >
                        Start 14-Day Free Trial
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/login">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="px-10 py-6 text-base md:text-lg font-bold border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300"
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
                  className="text-blue-200 text-xs md:text-sm font-medium"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  No credit card required • Cancel anytime • 30-day money-back guarantee
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
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="flex items-center space-x-3 bg-white rounded-2xl px-6 md:px-8 py-4 md:py-5 shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 group"
              >
                <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:scale-110 transition-transform">
                  <badge.icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-bold text-sm md:text-base">{badge.text}</p>
                  <p className="text-gray-500 text-xs">Enterprise-grade</p>
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
            className="mt-12 mb-12 bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 rounded-3xl p-6 md:p-10 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                >
                  10min
                </motion.div>
                <p className="text-gray-600 font-semibold text-xs md:text-sm uppercase tracking-wide">
                  Average Setup Time
                </p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                >
                  24/7
                </motion.div>
                <p className="text-gray-600 font-semibold text-xs md:text-sm uppercase tracking-wide">
                  Support Available
                </p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2"
                >
                  99.9%
                </motion.div>
                <p className="text-gray-600 font-semibold text-xs md:text-sm uppercase tracking-wide">
                  Uptime Guarantee
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