'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
}

export default function FadeIn({ children }: FadeInProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.article>
  );
}
