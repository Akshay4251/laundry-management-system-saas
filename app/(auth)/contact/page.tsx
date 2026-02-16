// app/(auth)/contact/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  CheckCircle2,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  Headphones,
  Star,
  ExternalLink,
  Calendar,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const contactDetails = [
    {
      icon: Mail,
      label: "Email Us",
      value: "sales@washndry.com",
      description: "We'll respond within 24 hours",
      href: "mailto:sales@washndry.com",
      color: "blue",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 98765 43210",
      description: "Mon – Sat, 9 AM – 7 PM IST",
      href: "tel:+919876543210",
      color: "green",
    },
    {
      icon: MessageSquare,
      label: "WhatsApp",
      value: "+91 98765 43210",
      description: "Chat with our sales team",
      href: "https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20the%20Enterprise%20plan",
      color: "emerald",
    },
    {
      icon: MapPin,
      label: "Visit Us",
      value: "Mumbai, Maharashtra, India",
      description: "Schedule an in-person meeting",
      href: null,
      color: "purple",
    },
  ];

  const enterprisePerks = [
    "Unlimited orders & staff accounts",
    "Unlimited store locations",
    "Dedicated account manager",
    "Custom API integrations",
    "White-label mobile apps",
    "On-site training & onboarding",
    "99.9% uptime SLA",
    "Priority 24/7 phone support",
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Top Navigation */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WashNDry
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/#pricing"
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors hidden sm:block"
              >
                View Pricing
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Start Free Trial →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-12 lg:pb-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-xl shadow-purple-500/30 text-sm">
            <Building2 className="w-3.5 h-3.5 mr-2" />
            Enterprise Sales
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
            Let&apos;s Build Something{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Great Together
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Talk to our sales team about custom solutions for your laundry
            business. We&apos;ll craft the perfect plan for your needs.
          </p>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12"
        >
          {contactDetails.map((detail, idx) => {
            const Wrapper = detail.href ? "a" : "div";
            const wrapperProps = detail.href
              ? {
                  href: detail.href,
                  target: detail.href.startsWith("http") ? "_blank" : undefined,
                  rel: detail.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined,
                }
              : {};

            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Wrapper {...wrapperProps} className="block">
                  <Card
                    className={`h-full bg-white/95 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 ${
                      detail.href ? "cursor-pointer" : ""
                    }`}
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          colorMap[detail.color]
                        }`}
                      >
                        <detail.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-500 mb-0.5">
                          {detail.label}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {detail.value}
                          {detail.href && (
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {detail.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">
                  Enterprise Plan
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Everything you need to scale
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Our Enterprise plan is designed for large laundry businesses with
                multiple locations. Get a custom quote tailored to your specific
                requirements.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:sales@washndry.com">
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 rounded-xl h-12 px-6 font-bold"
                    size="lg"
                  >
                    <Mail className="mr-2 w-4 h-4" />
                    Email Sales Team
                  </Button>
                </a>
                <a href="tel:+919876543210">
                  <Button
                    variant="outline"
                    className="rounded-xl h-12 px-6 font-bold border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                    size="lg"
                  >
                    <Phone className="mr-2 w-4 h-4" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Right — Perks */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-sm font-bold text-purple-900 mb-4 uppercase tracking-wider">
                What&apos;s Included
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {enterprisePerks.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2
                        className="w-3 h-3 text-green-600"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 sm:gap-6 mb-12"
        >
          {[
            { value: "2,000+", label: "Businesses Trust Us", icon: Users },
            { value: "50K+", label: "Daily Orders Processed", icon: Zap },
            { value: "99.9%", label: "Uptime Guaranteed", icon: Shield },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="bg-white/90 backdrop-blur-sm border-gray-200"
            >
              <CardContent className="p-5 sm:p-6 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div> */}

        {/* Bottom CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl shadow-blue-500/30">
            <CardContent className="p-8 sm:p-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Not sure which plan is right?
              </h3>
              <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                Start with a 14-day free trial of our Professional plan. No
                credit card required. Upgrade or switch anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-12 px-8 shadow-lg"
                  >
                    <Zap className="mr-2 w-4 h-4" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl h-12 px-8 bg-transparent"
                  >
                    Compare Plans
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          //Trust Footer 
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { icon: Shield, text: "SSL Secure" },
              { icon: Headphones, text: "24/7 Support" },
              { icon: Clock, text: "Response within 24h" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-gray-600"
              >
                <item.icon
                  className="w-4 h-4 text-blue-600"
                  strokeWidth={2.5}
                />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </div>
  );
}