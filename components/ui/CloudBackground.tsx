"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CloudBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = event.clientX - left;
        const y = event.clientY - top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculateTransform = (offset: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;

    const dx = mousePosition.x - centerX;
    const dy = mousePosition.y - centerY;

    return {
      x: -dx * offset,
      y: -dy * offset,
    };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Layer 1: Deepest, slowest movement */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-800 to-blue-800 opacity-70"
        style={{
          x: calculateTransform(0.01).x,
          y: calculateTransform(0.01).y,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Layer 2: Mid-ground, moderate movement */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-blue-600/50 opacity-60"
        style={{
          x: calculateTransform(0.02).x,
          y: calculateTransform(0.02).y,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Layer 3: Foreground, fastest movement, subtle cloud-like shapes */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-blue-400/30 opacity-50"
        style={{
          x: calculateTransform(0.03).x,
          y: calculateTransform(0.03).y,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Additional subtle elements for cloud effect */}
      <motion.div
        className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
        style={{
          top: "10%",
          left: "15%",
          x: calculateTransform(0.04).x,
          y: calculateTransform(0.04).y,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl"
        style={{
          bottom: "20%",
          right: "10%",
          x: calculateTransform(0.035).x,
          y: calculateTransform(0.035).y,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};

export default CloudBackground;
