import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full  flex flex-col items-center justify-center text-center bg-gradient-to-b from-blue-100 to-white px-4 py-2  ">
      {/* Logo + Brand */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center mb-6"
      >
        <img src={assets.logo_icon} alt="Logo" className="h-12 md:h-28 w-auto" />
        <h1 className="text-5xl md:text-8xl font-bold text-blue-900">ynsa</h1>
      </motion.div>

      {/* Tagline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-2xl md:text-3xl mt-4 font-bold text-gray-800 max-w-2xl"
      >
        Guaranteed Replies, Authentic Connection, Meaningful Growth
      </motion.h2>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm md:text-base text-gray-600 mt-6 mb-10"
      >
        Tired of unanswered cold outreach? Connect directly with industry leaders, starting at just ₹50.
      </motion.p>

      {/* Mindmap Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-10 w-full max-w-full"
      >
        <img
          src={assets.network}
          alt="Mindmap Graphic"
          className="w-full h-auto"
        />
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex items-center justify-center gap-6"
      >
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 text-sm md:text-base font-medium text-white rounded-full bg-gradient-to-r from-blue-700 to-blue-900 hover:shadow-lg transition-all"
        >
          Join now
        </button>
        <button
          onClick={() => navigate("/login")}
          className="relative text-sm md:text-base text-blue-600 hover:text-blue-800 group"
        >
          Learn More
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
        </button>
      </motion.div>
    </div>
  );
};

export default Hero;
