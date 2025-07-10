import { motion } from "framer-motion";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import assets from "../../assets/assets";

const Footer = () => {
  const footerLinks = [
    { title: "About us", href: "#about" },
    { title: "Features", href: "#features" },
    { title: "Contact us", href: "#contact" },
    { title: "Privacy Policy", href: "#privacy" },
    { title: "Terms of Service", href: "#terms" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <img
              src={assets.logo_icon}
              alt="Company Logo"
              className="h-10 w-auto"
            />
            <p className="text-blue-100/80 max-w-sm">
              Connect with industry leaders and accelerate your professional growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.title}>
                  <motion.a
                    href={link.href}
                    className="text-blue-100/80 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.title}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Connect With Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <form className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-100/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-blue-100/60">
                Subscribe to our newsletter for updates and insights.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-blue-100/60">
              © {new Date().getFullYear()} Company Name. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#privacy"
                className="text-sm text-blue-100/60 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-sm text-blue-100/60 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 grid grid-cols-2 -skew-y-12 opacity-5 pointer-events-none">
        <div className="bg-gradient-to-r from-blue-400 to-transparent"></div>
        <div className="bg-gradient-to-l from-blue-400 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer;
