import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const steps = [
    {
      number: 1,
      title: "Choose Your Professional",
      subtitle: "Browse our network of verified industry leaders, thought leaders, and changemakers.",
    },
    {
      number: 2,
      title: "Send Your Message",
      subtitle: "Craft your pitch, query, or collaboration idea in just a few clicks.",
    },
    {
      number: 3,
      title: "Get Guaranteed Replies",
      subtitle: "Receive meaningful responses, guaranteed—no more waiting or uncertainty.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-8 md:p-12 shadow-lg backdrop-blur-sm border border-white/20"
    >
      <motion.h2
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 text-transparent bg-clip-text"
      >
        How it Works?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div
              className="text-6xl font-extrabold text-transparent bg-gradient-to-b from-blue-600 to-blue-300 bg-clip-text mb-4"
              aria-hidden="true"
            >
              {step.number}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 leading-tight">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {step.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HowItWorks;
