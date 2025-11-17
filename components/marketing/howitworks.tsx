// app/components/marketing/howitworks.tsx

"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  Smartphone, 
  Truck, 
  Shirt, 
  PackageCheck, 
  Clock,
  CheckCircle,
  Bell,
  Star,
  Sparkles,
  Zap,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { useRef } from "react";

// ==================== TYPES ====================
interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  image: string;
  stats: { value: string; label: string };
}

interface Benefit {
  icon: LucideIcon;
  label: string;
  value: string;
  gradient: string;
}

// ==================== DATA ====================
const STEPS: Step[] = [
  {
    number: "01",
    icon: Smartphone,
    title: "Customer Places Order",
    description: "Customer schedules pickup via mobile app or website with instant confirmation.",
    features: [
      "Instant booking < 2 min",
      "Multiple payment options",
      "Real-time pricing"
    ],
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop&q=80",
    stats: { value: "< 2 min", label: "Booking Time" }
  },
  {
    number: "02",
    icon: Truck,
    title: "Smart Pickup",
    description: "Driver collects items and each piece gets a unique QR tag for tracking.",
    features: [
      "GPS live tracking",
      "QR code tagging",
      "Photo documentation"
    ],
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&h=800&fit=crop&q=80",
    stats: { value: "30 min", label: "Avg Pickup" }
  },
  {
    number: "03",
    icon: Shirt,
    title: "Processing",
    description: "Automated workflow with quality checkpoints at each stage by professionals.",
    features: [
      "Quality control",
      "Eco-friendly products",
      "Expert handling"
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=800&fit=crop&q=80",
    stats: { value: "6-8 hrs", label: "Processing" }
  },
  {
    number: "04",
    icon: PackageCheck,
    title: "Delivery",
    description: "Clean items delivered to your door with real-time notifications.",
    features: [
      "On-time guarantee",
      "Satisfaction promise",
      "Loyalty rewards"
    ],
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=800&fit=crop&q=80",
    stats: { value: "99.2%", label: "On-Time" }
  },
];

const BENEFITS: Benefit[] = [
  { 
    icon: Clock, 
    label: "Save Time", 
    value: "10+ Hrs/Week", 
    gradient: "from-blue-500 to-cyan-500" 
  },
  { 
    icon: CheckCircle, 
    label: "Accuracy", 
    value: "99.9%", 
    gradient: "from-green-500 to-emerald-500" 
  },
  { 
    icon: Bell, 
    label: "Real-time", 
    value: "Updates", 
    gradient: "from-purple-500 to-pink-500" 
  },
  { 
    icon: Star, 
    label: "Satisfaction", 
    value: "Guaranteed", 
    gradient: "from-orange-500 to-red-500" 
  },
];

// ==================== SUB-COMPONENTS ====================

// Animated Background
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        rotate: [0, 90, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
    />
    <motion.div 
      animate={{ 
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.4, 0.2],
        rotate: [90, 0, 90]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl"
    />
  </div>
);

// Modern Timeline Step Card - Alternating Design
const TimelineStepCard = ({ step, index, totalSteps }: { step: Step; index: number; totalSteps: number }) => {
  const isEven = index % 2 === 0;
  const isLast = index === totalSteps - 1;

  return (
    <div className="relative">
      {/* Timeline Container */}
      <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -80 : 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`relative ${isEven ? '' : 'lg:col-start-2'}`}
        >
          <div className="relative group">
            {/* Main Image Container with Modern Border */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[400px] lg:h-[500px]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index < 2}
                />
                {/* Gradient Overlay - Only visible on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
              </div>

              {/* Floating Stats Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="absolute bottom-6 right-6"
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border-2 border-white">
                  <p className={`text-3xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent text-center mb-1`}>
                    {step.stats.value}
                  </p>
                  <p className="text-xs text-gray-600 font-bold text-center uppercase tracking-wide">
                    {step.stats.label}
                  </p>
                </div>
              </motion.div>

              {/* Step Number Badge */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-6 -left-6"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}>
                  <span className="text-white font-black text-3xl">
                    {step.number}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Decorative Element */}
            <div className={`absolute -bottom-4 ${isEven ? '-right-4' : '-left-4'} w-32 h-32 bg-gradient-to-br ${step.color} rounded-full blur-3xl opacity-30 -z-10`} />
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? 80 : -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}
        >
          <div className="space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring" }}
              className="inline-flex"
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} shadow-xl`}>
                <step.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* Title */}
            <div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4"
              >
                {step.title}
              </motion.h3>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${step.color}`}
              />
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="text-lg lg:text-xl text-gray-600 leading-relaxed"
            >
              {step.description}
            </motion.p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              {step.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${step.color} group-hover:scale-110 transition-transform`}>
                    <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-base lg:text-lg text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1 }}
              className="pt-8"
            >
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  {Array.from({ length: totalSteps }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        idx === index 
                          ? `w-16 bg-gradient-to-r ${step.color}` 
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-semibold">
                  {index + 1}/{totalSteps}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Connection Line (Desktop Only) */}
      {!isLast && (
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-1 h-24 my-16 bg-gradient-to-b from-gray-300 to-gray-200 rounded-full"
        >
          {/* Animated Dot */}
          <motion.div
            animate={{ y: [0, 88, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`w-4 h-4 rounded-full bg-gradient-to-br ${STEPS[index + 1]?.color || step.color} shadow-lg absolute -left-1.5`}
          />
        </motion.div>
      )}

      {/* Mobile Divider */}
      {!isLast && (
        <div className="lg:hidden my-16 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className={`p-3 rounded-full bg-gradient-to-br ${STEPS[index + 1]?.color || step.color} shadow-xl`}
          >
            <ArrowRight className="w-6 h-6 text-white" strokeWidth={3} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Benefit Card (Simplified & Balanced)
const BenefitCard = ({ benefit, index }: { benefit: Benefit; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10, scale: 1.03 }}
    className="group relative h-full"
  >
    {/* Glow Effect */}
    <div className={`absolute -inset-1 bg-gradient-to-r ${benefit.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10`} />
    
    {/* Card */}
    <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100 overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#000_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Gradient Accent */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${benefit.gradient}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.1 }}
      />

      <div className="relative text-center space-y-6">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex"
        >
          <div className={`p-5 rounded-2xl bg-gradient-to-br ${benefit.gradient} shadow-xl`}>
            <benefit.icon className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Label */}
        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">
          {benefit.label}
        </p>

        {/* Value */}
        <p className={`text-4xl lg:text-5xl font-black bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}>
          {benefit.value}
        </p>
      </div>
    </div>
  </motion.div>
);

// ==================== MAIN COMPONENT ====================
const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      id="how-it-works"
      ref={containerRef}
      className="py-20 md:py-32 lg:py-40 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white"
    >
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20 lg:mb-32"
        >
          <Badge className="mb-8 px-8 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200 text-sm font-semibold shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            The Complete Journey
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 px-4 leading-tight">
            Your Laundry's{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Digital Transformation
            </span>
          </h2>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Experience seamless automation from order to delivery
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="space-y-32 lg:space-y-40 mb-32 lg:mb-40">
          {STEPS.map((step, index) => (
            <TimelineStepCard 
              key={step.number}
              step={step} 
              index={index} 
              totalSteps={STEPS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;