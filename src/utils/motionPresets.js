const smoothEase = [0.22, 1, 0.36, 1];

export const pageVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.28,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.18,
      ease: smoothEase,
    },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.055,
    },
  },
};

export const surfaceItem = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: smoothEase,
    },
  },
};

export const tableRowItem = {
  hidden: {
    opacity: 0,
    x: -8,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: smoothEase,
    },
  },
};

export const interactiveTap = {
  whileTap: {
    scale: 0.98,
  },
};
