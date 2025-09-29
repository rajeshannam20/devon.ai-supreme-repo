
"use client"

import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  className?: string;
  speed?: number;
  density?: number;
  color?: string;
  size?: number;
  opacity?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  className = "",
  speed = 1,
  density = 0.8,
  color = "#00FF41",
  size = 14,
  opacity = 0.8
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to full window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Matrix character set
    const chars = "01";
    
    // Calculate columns based on font size
    const fontSize = size;
    const columns = Math.floor(canvas.width / fontSize * density);
    
    // Array to track the y position of each column
    const drops: number[] = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      // Random starting position
      drops[i] = Math.floor(Math.random() * -canvas.height);
    }
    
    // Drawing function
    const draw = () => {
      // Set semi-transparent black background to create fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 / speed})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text color and font
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;
      ctx.globalAlpha = opacity;
      
      // Loop through each drop
      for (let i = 0; i < drops.length; i++) {
        // Choose a random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move the drop down
        drops[i]++;
        
        // Randomly reset some drops to create continuous flow
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = -1;
        }
      }
    };
    
    // Animation loop
    const interval = setInterval(draw, 33 / speed);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, size, speed, density, opacity]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed top-0 left-0 w-full h-full -z-10 pointer-events-none ${className}`}
    />
  );
};
