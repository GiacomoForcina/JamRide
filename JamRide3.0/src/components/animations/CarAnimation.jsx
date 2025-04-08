
import React from "react";
import { motion } from "framer-motion";
import { Car } from 'lucide-react';

function CarAnimation() {
  return (
    <div className="relative h-20 my-4">
      <div className="absolute w-full h-2 bottom-0 bg-gray-200 rounded-full">
        <motion.div
          className="h-full w-full bg-purple-200 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-2"
      >
        <Car className="h-8 w-8 text-purple-600" />
      </motion.div>
    </div>
  );
}

export default CarAnimation;
