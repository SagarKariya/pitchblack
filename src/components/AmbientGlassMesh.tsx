import React from 'react';

/**
 * AmbientGlassMesh:
 * Behind the frosted cards lives a chromatic radial light mesh that cards catch and refract through:
 * Orb 1 (Top-Left): Emerald / Mint tint (radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%))
 * Orb 2 (Top-Right): Sapphire / Sky Blue tint (radial-gradient(circle, rgba(59, 130, 246, 0.20) 0%, transparent 70%))
 * Orb 3 (Mid-Page): Amethyst / Violet tint (radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%))
 * Orb 4 (Bottom-Right): Warm Amber / Rose tint (radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 70%))
 */
export const AmbientGlassMesh: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Orb 1: Top-Left Emerald / Mint tint */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
        }}
        className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full blur-[110px] pointer-events-none"
      />

      {/* Orb 2: Top-Right Sapphire / Sky Blue tint */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.20) 0%, transparent 70%)',
        }}
        className="absolute top-10 -right-32 w-[680px] h-[680px] rounded-full blur-[130px] pointer-events-none"
      />

      {/* Orb 3: Mid-Page Amethyst / Violet tint */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%)',
        }}
        className="absolute top-[40%] left-[10%] w-[640px] h-[640px] rounded-full blur-[140px] pointer-events-none"
      />

      {/* Orb 4: Bottom-Right Warm Amber / Rose tint */}
      <div
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 70%)',
        }}
        className="absolute bottom-10 right-[8%] w-[560px] h-[560px] rounded-full blur-[120px] pointer-events-none"
      />
    </div>
  );
};
