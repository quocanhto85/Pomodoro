"use client";

import { useEffect, useRef } from 'react';

type AnimationFrameCallback = (currentTime: number) => boolean;

export default function useAnimationFrameTimer(
  callback: AnimationFrameCallback,
  isActive: boolean
) {
  // Store the animation frame ID for cleanup
  const frameRef = useRef<number | undefined>(undefined);
  
  // Store the callback in a ref to avoid re-creating the animation loop
  // Initialize with the provided callback
  const callbackRef = useRef<AnimationFrameCallback>(callback);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Animation loop function
  const animate = (currentTime: number) => {
    // Call the callback and check if we should continue
    const shouldContinue = callbackRef.current(currentTime);
    
    // If the animation should continue and is still active, schedule the next frame
    if (shouldContinue && isActive) {
      frameRef.current = requestAnimationFrame(animate);
    }
  };

  // Set up and clean up the animation loop
  useEffect(() => {
    if (isActive) {
      // Start the animation loop
      frameRef.current = requestAnimationFrame(animate);
      
      // Cleanup function
      return () => {
        if (frameRef.current !== undefined) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = undefined;
        }
      };
    }
  }, [isActive]); // Only re-run when isActive changes
}