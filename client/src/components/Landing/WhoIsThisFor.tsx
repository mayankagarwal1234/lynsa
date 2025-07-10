import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import assets from '../../assets/assets';

const WhoIsThisFor = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const cards = [
    {
      title: "Ambitious Professionals",
      description: "Seeking career guidance, mentorship, or collaboration.",
      icon: assets.card5,
    },
    {
      title: "Students & Graduates",
      description: "Hoping to learn from seasoned professionals.",
      icon: assets.card1,
    },
    {
      title: "Entrepreneurs",
      description: "Looking for investors, partners, or expert advice.",
      icon: assets.card2,
    },
    {
      title: "Industry Leaders",
      description: "Who want to inspire, connect, and grow their network.",
      icon: assets.card3,
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
    id='about'
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className="rounded-3xl bg-gradient-to-br from-blue-50/50 to-white/50 p-8 md:p-12 backdrop-blur-md border border-white/20"
    >
      <motion.div
        variants={itemVariants}
        className="text-center mb-16"
      >
        <h2 className="inline-block text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text mb-6">
          Who is this for?
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Professionals seeking genuine connections and impactful networking.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <img
                  src={card.icon}
                  alt={`Icon for ${card.title}`}
                  className="w-12 h-12 rounded-full bg-blue-100 p-2"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600">
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhoIsThisFor;
