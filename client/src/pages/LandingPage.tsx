import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import HowItWorks from "../components/Landing/HowItWorks";
import Footer from "../components/Landing/Footer";
import Hero from "../components/Landing/Hero";
import LandingNavbar from "../components/Landing/LandingNavbar";
import Features from "../components/Landing/Features";
import WhyChooseUs from "../components/Landing/WhyChooseUs";
import WhoIsThisFor from "../components/Landing/WhoIsThisFor";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-x-hidden">
       <Helmet>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YNLRKR5B36"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YNLRKR5B36');
          `}
        </script>
      </Helmet>
      {/* Navbar Section */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/20 to-transparent pointer-events-none" />
        <LandingNavbar />
      </motion.div>

      {/* Main Sections */}
      <motion.main
        className="container mx-auto px-4 py-20 md:py-32 relative z-10"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <motion.section variants={fadeInUp}>
          <Hero />
        </motion.section>

        <motion.section className="my-20" variants={fadeInUp}>
          <WhyChooseUs />
        </motion.section>

        <motion.section className="my-20" variants={fadeInUp}>
          <WhoIsThisFor />
        </motion.section>

        <motion.section className="my-20" variants={fadeInUp}>
          <HowItWorks />
        </motion.section>

        <motion.section className="my-20" variants={fadeInUp}>
          <Features />
        </motion.section>

        {/* CTA */}
        <motion.section className="my-20 text-center" variants={fadeInUp}>
          <div className="relative p-8 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/30 shadow-xl">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
             Ready to take your networking to the next level?
            </motion.h2>
            <motion.h5>Join the waitlist today and be the first to connect with top-tier mentors when we launch!</motion.h5>
            <motion.div
              className="flex flex-col md:flex-row gap-4 justify-center mt-4 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Sign Up
              </button>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Footer />
      </motion.footer>
    </div>
  );
};

export default HomePage;
