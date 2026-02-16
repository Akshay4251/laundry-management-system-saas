// components/marketing/pricing.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Star, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Shield,
  Building2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLANS, getPlanPrice, getSavingsPercentage, FEATURE_LIST } from "@/lib/plans";
import { BillingCycle, BusinessPlan } from "@prisma/client";

type BillingCycleOption = 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL';

const billingCycleLabels: Record<BillingCycleOption, string> = {
  MONTHLY: 'Monthly',
  SEMI_ANNUAL: '6 Months',
  ANNUAL: 'Yearly',
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycleOption>('MONTHLY');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const plans = [
    {
      ...PLANS.BASIC,
      icon: Sparkles,
      gradient: "from-gray-600 to-gray-800",
      accentColor: "gray",
    },
    {
      ...PLANS.PROFESSIONAL,
      icon: Zap,
      gradient: "from-blue-600 to-cyan-600",
      accentColor: "blue",
    },
    {
      ...PLANS.ENTERPRISE,
      icon: Building2,
      gradient: "from-purple-600 to-pink-600",
      accentColor: "purple",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
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
        <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-blue-50/65 to-cyan-50/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-xl shadow-blue-500/40 text-sm sm:text-base">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Simple Pricing
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1.5 border border-gray-200 shadow-lg">
            {(['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL'] as BillingCycleOption[]).map((cycle) => {
              const savings = cycle !== 'MONTHLY' ? getSavingsPercentage('PROFESSIONAL', cycle as BillingCycle) : 0;
              return (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    "relative px-4 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                    billingCycle === cycle
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {billingCycleLabels[cycle]}
                  {savings > 0 && (
                    <span className={cn(
                      "ml-1.5 text-xs font-bold",
                      billingCycle === cycle ? "text-blue-100" : "text-green-600"
                    )}>
                      Save {savings}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const price = plan.pricing ? getPlanPrice(plan.id, billingCycle as BillingCycle) : null;
            const isPopular = plan.popular;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={isPopular ? "lg:-mt-4" : ""}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card
                    className={cn(
                      "h-full relative overflow-hidden backdrop-blur-md transition-all duration-300",
                      isPopular
                        ? "bg-white/98 border-4 border-blue-500 shadow-2xl shadow-blue-500/30"
                        : "bg-white/95 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl"
                    )}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 shadow-xl border-2 border-white text-sm font-bold">
                          <Star className="h-4 w-4 mr-1.5 fill-white" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {/* Top Gradient Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.gradient}`} />

                    <CardHeader className="text-center pb-6 pt-8 px-6">
                      {/* Icon */}
                      <div className="inline-flex justify-center mb-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-xl`}>
                          <plan.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                      
                      {/* Price */}
                      <div className="mb-6">
                        {price !== null ? (
                          <>
                            <div className="flex items-baseline justify-center mb-1">
                              <span className="text-4xl sm:text-5xl font-black text-gray-900">
                                {formatPrice(price)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {billingCycle === 'MONTHLY' ? 'per month' : 
                               billingCycle === 'SEMI_ANNUAL' ? 'for 6 months' : 
                               'for 12 months'}
                            </p>
                          </>
                        ) : (
                          <div className={`text-4xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            Custom
                          </div>
                        )}
                      </div>
                      
                      {/* CTA Button */}
                      <Link href={plan.id === 'ENTERPRISE' ? '/contact' : '/register'} className="block">
                        <Button
                          className={cn(
                            "w-full h-12 text-sm font-bold group transition-all duration-300",
                            isPopular
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          )}
                          size="lg"
                        >
                          {plan.id === 'ENTERPRISE' ? 'Contact Sales' : 'Start Free Trial'}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardHeader>

                    <CardContent className="pb-8 px-6">
                      {/* Limits */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly Orders</span>
                          <span className="font-semibold text-gray-900">
                            {plan.limits.maxMonthlyOrders >= 999999 ? 'Unlimited' : plan.limits.maxMonthlyOrders.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Staff Accounts</span>
                          <span className="font-semibold text-gray-900">
                            {plan.limits.maxStaff >= 999 ? 'Unlimited' : plan.limits.maxStaff}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Store Locations</span>
                          <span className="font-semibold text-gray-900">
                            {plan.limits.maxStores >= 999 ? 'Unlimited' : plan.limits.maxStores}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3">
                        {[
                          { enabled: plan.features.pickupEnabled, label: 'Pickup & Delivery' },
                          { enabled: plan.features.workshopEnabled, label: 'Workshop Management' },
                          { enabled: plan.features.multiStoreEnabled, label: 'Multi-Store Support' },
                          { enabled: plan.features.smsNotifications, label: 'SMS Notifications' },
                          { enabled: plan.features.whatsappIntegration, label: 'WhatsApp Integration' },
                          { enabled: plan.features.advancedReports, label: 'Advanced Reports' },
                          { enabled: plan.features.prioritySupport, label: 'Priority Support' },
                          { enabled: plan.features.apiAccess, label: 'API Access' },
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className={cn(
                              "flex items-center justify-center h-5 w-5 rounded-full mr-3 flex-shrink-0",
                              feature.enabled ? 'bg-green-100' : 'bg-gray-100'
                            )}>
                              {feature.enabled ? (
                                <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                              ) : (
                                <X className="h-3 w-3 text-gray-400" strokeWidth={3} />
                              )}
                            </div>
                            <span className={cn(
                              "text-sm",
                              feature.enabled ? 'text-gray-700' : 'text-gray-400'
                            )}>
                              {feature.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">14-day money back guarantee</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">No setup fees</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-700">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;