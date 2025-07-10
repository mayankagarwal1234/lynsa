import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
    if (isMenuOpen) setIsMenuOpen(false); // close mobile menu on scroll
  }, [isMenuOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const navLinks = [
    { title: "About us", href: "#about" },
    { title: "Features", href: "#features" },
    { title: "Contact us", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/50 backdrop-blur-lg shadow-lg border-b border-white/30"
          : "bg-white/30 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
            <img
              src={assets.logo}
              alt="Logo"
              className="h-8 w-auto md:h-10"
            />
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.title}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                className="relative text-gray-800 hover:text-blue-600 transition-colors duration-300 text-sm font-medium 
                  after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 
                  after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.title}
              </motion.a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
          
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full
                hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300
                border border-white/20 backdrop-blur-xs"
            >
              Join Us
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden p-2 rounded-full bg-white/50 backdrop-blur-xs border border-white/50
              text-gray-700 hover:text-blue-600 hover:bg-white/70 transition-all duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 md:hidden bg-white backdrop-blur-md
              border-t border-b border-white/30 shadow-lg"
          >
            <div className="absolute inset-0 bg-white/50 backdrop-blur-lg"></div>
            <div className="relative px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto bg-white/30 rounded-lg">
              {navLinks.map((link) => (
                <motion.a
                  key={link.title}
                  href={link.href}
                  whileHover={{ x: 10 }}
                  className="block px-4 py-3 text-blue-600 rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </motion.a>
              ))}
              <div className="flex flex-col gap-3 pt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700
                    text-white rounded-xl shadow-lg shadow-blue-500/30
                    transition-all duration-300 border border-white/20 backdrop-blur-xs"
                >
                  Join US
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default LandingNavbar;
