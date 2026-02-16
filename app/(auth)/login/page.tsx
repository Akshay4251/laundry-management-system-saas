// app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/login-form";
import Link from "next/link";
import { 
  Sparkles, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  Users
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20"></div>
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
            
            <Link href="/register" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              Create account →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - SWAPPED LAYOUT */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-12 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left - Login Form (SWAPPED TO LEFT) */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10">
              
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign in to your account
                </h2>
                <p className="text-gray-600">
                  Access your dashboard and manage operations
                </p>
              </div>

              {/* Login Form */}
              <LoginForm />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                href="/register"
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
              >
                Start your free trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Terms */}
              <p className="mt-6 text-center text-xs text-gray-500">
                Protected by reCAPTCHA. See{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy
                </Link>
                {" "}and{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>
              </p>
            </div>
          </div>

          {/* Right - Content (SWAPPED TO RIGHT) */}
          <div className="text-center lg:text-left order-1 lg:order-2 lg:-mt-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">2,000+ Active Users</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Welcome Back to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                WashNDry
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Continue managing your laundry business with powerful analytics, streamlined operations, and happy customers.
            </p>

            {/* Key Benefits */}
            <div className="space-y-3">
              {[
                "Real-time order tracking & analytics",
                "Automated SMS & email notifications",
                "Multi-location management support",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" strokeWidth={3} />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}