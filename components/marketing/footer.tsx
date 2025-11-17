// app/components/marketing/footer.tsx

import Link from "next/link";
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const contactInfo = [
    { icon: Mail, text: "hello@laundrypro.com", href: "mailto:hello@laundrypro.com" },
    { icon: Phone, text: "1-800-555-1234", href: "tel:+18005551234" },
    { icon: MapPin, text: "San Francisco, CA", href: "#" },
  ];

  const services = [
    "Order Management",
    "Staff Management",
    "Customer Portal",
    "Pickup & Delivery",
    "Inventory Tracking",
    "Real-time Analytics",
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop&q=80",
      label: "Professional Washing"
    },
    {
      url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop&q=80",
      label: "Quality Control"
    },
    {
      url: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop&q=80",
      label: "Fresh Delivery"
    },
    {
      url: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop&q=80",
      label: "Customer Service"
    },
    {
      url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=300&fit=crop&q=80",
      label: "Modern Equipment"
    },
    {
      url: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop&q=80",
      label: "Clean & Organized"
    },
  ];

  return (
    <>
      {/* Poppins Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      <footer 
        className="bg-gray-900 text-gray-300 relative overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* ROW 1: Brand, Contact, Services */}
          <div className="py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              
              {/* Brand Logo & Name */}
              <div>
                <Link href="/" className="flex items-center space-x-3 group w-fit">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-2xl">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-white">LaundryPro</span>
                </Link>
                
                <p className="text-gray-400 mt-6 leading-relaxed text-sm">
                  Professional laundry management software trusted by businesses worldwide. 
                  Streamline operations and grow your revenue.
                </p>
              </div>

              {/* Contact Us */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
                <ul className="space-y-4">
                  {contactInfo.map((contact, index) => (
                    <li key={index}>
                      <a 
                        href={contact.href}
                        className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
                          <contact.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{contact.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Our Services */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Our Services</h3>
                <ul className="space-y-3">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-center space-x-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                      <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-default">
                        {service}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-800" />

          {/* ROW 2: Full Width Image Gallery */}
          <div className="py-12">
            <h3 className="text-white font-bold text-xl mb-8 text-center">Our Work in Action</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {galleryImages.map((image, index) => (
                <div 
                  key={index}
                  className="relative h-32 rounded-xl overflow-hidden border border-gray-800 hover:scale-105 hover:border-blue-500 transition-all duration-300 cursor-pointer group shadow-lg"
                  style={{
                    backgroundImage: `url('${image.url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-bold text-center">{image.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-800" />

          {/* ROW 3: Copyright & Social Media */}
          <div className="py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Copyright */}
              <p className="text-sm text-gray-400">
                © 2024 <Link href="/" className="text-white hover:text-blue-400 transition-colors font-semibold">LaundryPro</Link>. All rights reserved.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center space-x-5">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 group"
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;