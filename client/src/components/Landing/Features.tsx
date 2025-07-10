// components/Landing/Features/Features.tsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import assets from '../../assets/assets';

const Features = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const featureData = [
    {
      img: assets.message,
      title: "Direct Messaging",
      description: "Personalized conversations with no middlemen.",
      features: [
        "Engage directly with industry leaders and professionals.",
        "Eliminate the hassle of intermediaries for quicker communication.",
        "Industry-specific configs",
      ],
      buttonText: "Start Chatting",
    },
    {
      img: assets.fast,
      title: "Fast Responses",
      description: "Get quick, meaningful replies every time.",
      features: [
        "No more waiting indefinitely for replies.",
        "Receive responses within 48 hours.",
        "Save time with streamlined communication.",
      ],
      buttonText: "Get Started Now",
    },
    {
      img:assets.safe,
      title: "Safe & Secure",
      description: "Your privacy and security are our top priorities.",
      features: [
        "End-to-end encrypted communications.",
        "Verified professional profiles.",
        "Secure payment processing.",
      ],
      buttonText: "Learn More About Security",
    },
    {
      video: assets.global,
      title: "Global Network",
      description: "Connect with professionals worldwide.",
      features: [
        "Access a diverse network of professionals.",
        "Cross-border networking opportunities.",
        "Multiple language support.",
      ],
      buttonText: "Explore Network",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
    id='features'
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4"
    >
      {featureData.map((feature, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          className={`flex flex-col ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          } gap-8 mb-20 items-center`}
        >
          {/* Media (Image or Video) */}
          <div className="w-full md:w-1/2">
            {feature.video ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-2xl shadow-lg bg-white/70 backdrop-blur-xs p-4"
              >
                <source src={feature.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={feature.img}
                alt={feature.title}
                className="w-full h-auto rounded-2xl shadow-lg bg-white/70 backdrop-blur-xs p-4"
              />
            )}
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2">
            <motion.div
              className="bg-white/70 backdrop-blur-xs rounded-2xl p-8 shadow-lg border border-white/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-4 mb-8">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full 
                  hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 
                  flex items-center justify-center gap-2 group"
              >
                {feature.buttonText}
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Features;
