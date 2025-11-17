// app/components/marketing/pricing.tsx

"use client";

import { motion } from "framer-motion";
import { Check, Star, Sparkles, Zap, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Perfect for small laundry shops",
      features: [
        "Up to 100 orders/month",
        "2 staff accounts",
        "Basic analytics",
        "Email support",
        "Mobile app access",
        "QR code generation",
        "Customer management",
        "Basic invoicing",
      ],
      popular: false,
      cta: "Start Free Trial",
      icon: Sparkles,
      gradient: "from-gray-600 to-gray-800",
      accentColor: "gray",
    },
    {
      name: "Professional",
      price: "149",
      description: "For growing laundry businesses",
      features: [
        "Up to 500 orders/month",
        "10 staff accounts",
        "Advanced analytics",
        "Priority support",
        "Route optimization",
        "Inventory management",
        "Custom branding",
        "SMS notifications",
        "Workshop management",
        "Payment gateway integration",
      ],
      popular: true,
      cta: "Start Free Trial",
      icon: Zap,
      gradient: "from-blue-600 to-cyan-600",
      accentColor: "blue",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large operations & chains",
      features: [
        "Unlimited orders",
        "Unlimited staff accounts",
        "Custom analytics & reports",
        "24/7 dedicated support",
        "Multi-location support",
        "API access",
        "Custom integrations",
        "White-label solution",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom workflows",
        "Advanced security",
      ],
      popular: false,
      cta: "Contact Sales",
      icon: Star,
      gradient: "from-purple-600 to-pink-600",
      accentColor: "purple",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Background with Minimal Overlay - Image Clearly Visible */}
      <div className="absolute inset-0 z-0">
        {/* Professional Laundry Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920&h=1080&fit=crop&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* REDUCED Light Gradient Overlay - Much More Transparent */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-blue-50/65 to-cyan-50/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/40" />
        
        {/* Very Subtle Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl"
          />
        </div>

        {/* Very Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-xl shadow-blue-500/40">
              <Sparkles className="w-4 h-4 mr-2" />
              Flexible Pricing
            </Badge>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-gray-900 leading-tight drop-shadow-sm">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-900 max-w-3xl mx-auto leading-relaxed font-semibold drop-shadow-sm">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={plan.popular ? "lg:-mt-8 lg:mb-0" : "lg:mt-4"}
            >
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <Card
                  className={`h-full relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
                    plan.popular
                      ? "bg-white/98 border-4 border-blue-500 shadow-2xl shadow-blue-500/50"
                      : "bg-white/95 border-2 border-gray-300 hover:border-blue-400 hover:shadow-2xl hover:bg-white/98"
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      initial={{ y: -100 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20"
                    >
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 shadow-2xl shadow-blue-500/60 border-4 border-white text-base font-bold">
                        <Star className="h-5 w-5 mr-2 fill-white" />
                        Most Popular
                      </Badge>
                    </motion.div>
                  )}

                  {/* Top Gradient Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.gradient}`} />

                  <CardHeader className="text-center pb-8 pt-10">
                    {/* Icon - Simple Scale Effect */}
                    <div className="inline-flex justify-center mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative p-5 rounded-3xl bg-gradient-to-br ${plan.gradient} shadow-2xl`}
                      >
                        <plan.icon className="h-12 w-12 text-white" strokeWidth={2.5} />
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-3xl blur-xl opacity-50 -z-10`} />
                      </motion.div>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-3xl font-bold mb-3 text-gray-900">{plan.name}</h3>
                    <p className="text-gray-700 mb-8 leading-relaxed text-base font-medium">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-8">
                      {plan.price === "Custom" ? (
                        <div className={`text-6xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-2`}>
                          Custom
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-6xl font-black text-gray-900">${plan.price}</span>
                            <span className="text-gray-600 ml-3 text-xl font-semibold">/month</span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Billed monthly</p>
                        </>
                      )}
                    </div>
                    
                    {/* CTA Button */}
                    <Link href="/register" className="block">
                      <Button
                        className={`w-full h-14 text-base font-bold group relative overflow-hidden transition-all duration-300 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/70"
                            : "bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl"
                        }`}
                        size="lg"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {plan.cta}
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                      </Button>
                    </Link>
                  </CardHeader>

                  <CardContent className="pb-10">
                    {/* Features List */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + featureIndex * 0.05 }}
                          className="flex items-start group"
                        >
                          <div className="flex-shrink-0">
                            <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
                              plan.popular ? 'bg-blue-100' : 'bg-green-100'
                            } mt-0.5 transition-transform duration-200 group-hover:scale-110`}>
                              <Check className={`h-4 w-4 font-bold ${
                                plan.popular ? 'text-blue-600' : 'text-green-600'
                              }`} strokeWidth={3} />
                            </div>
                          </div>
                          <span className="ml-4 text-gray-800 leading-relaxed font-medium group-hover:text-gray-900 transition-colors duration-200">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Security Badge */}
                    {plan.popular && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 }}
                        className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200"
                      >
                        <div className="flex items-center justify-center space-x-2 text-blue-700">
                          <Shield className="w-5 h-5" />
                          <span className="text-sm font-bold">SSL Encrypted & Secure</span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          {/* Glass Card Container */}
          <div className="inline-block bg-white/96 backdrop-blur-xl border-2 border-gray-300 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <p className="text-gray-900 text-xl md:text-2xl mb-10 font-bold">
              All plans include free updates and standard support
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: Check, text: "No setup fees", color: "green" },
                { icon: Check, text: "Cancel anytime", color: "blue" },
                { icon: Shield, text: "14-day money back guarantee", color: "purple" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`flex items-center justify-center space-x-3 bg-gradient-to-br ${
                    item.color === 'green' ? 'from-green-50 to-emerald-50' :
                    item.color === 'blue' ? 'from-blue-50 to-cyan-50' :
                    'from-purple-50 to-pink-50'
                  } rounded-2xl p-5 border-2 ${
                    item.color === 'green' ? 'border-green-200' :
                    item.color === 'blue' ? 'border-blue-200' :
                    'border-purple-200'
                  } hover:shadow-xl transition-all duration-200 cursor-default`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    item.color === 'green' ? 'bg-green-500' :
                    item.color === 'blue' ? 'bg-blue-500' :
                    'bg-purple-500'
                  } shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-900 font-bold text-base">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;