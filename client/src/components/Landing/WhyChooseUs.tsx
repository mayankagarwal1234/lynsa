import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import assets from '../../assets/assets';

const WhyChooseUs = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const cards = [
    {
      title: "Direct Communication",
      description: "Connect instantly with industry leaders without intermediaries.",
      icon: assets.card1,
    },
    {
      title: "Guaranteed Responses",
      description: "Get meaningful replies within 48 hours, guaranteed.",
      icon: assets.card2,
    },
    {
      title: "Verified Profiles",
      description: "Connect with authenticated professionals and mentors.",
      icon: assets.card3,
    },
    {
      title: "Affordable Networking",
      description: "Build valuable connections without breaking the bank.",
      icon: assets.card4,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
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
        variants={cardVariants}
        className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 text-transparent bg-clip-text"
      >
        Why Choose Us?
      </motion.h2>

      <motion.p
        variants={cardVariants}
        className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto"
      >
        We provide a seamless platform for meaningful professional connections.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <img
                src={card.icon}
                alt={`Icon for ${card.title}`}
                className="w-12 h-12 rounded-full bg-blue-100 p-2"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhyChooseUs;
