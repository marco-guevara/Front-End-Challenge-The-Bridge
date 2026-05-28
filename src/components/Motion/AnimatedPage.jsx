import { motion, useReducedMotion } from "framer-motion";
import { pageVariants } from "../../utils/motionPresets";

const motionTags = {
  div: motion.div,
  main: motion.main,
};

function AnimatedPage({ as = "div", children, className }) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motionTags[as] || motion.div;

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      animate="show"
      className={className}
      exit="exit"
      initial="hidden"
      variants={pageVariants}
    >
      {children}
    </Component>
  );
}

export default AnimatedPage;
