"use client";

import React from "react";
import { Feather } from "lucide-react";

interface FloatingLeavesProps {
  count?: number;
}

export const FloatingLeaves: React.FC<FloatingLeavesProps> = ({ count = 12 }) => {
  return (
    <div className="floating-leaves-area">
      <style dangerouslySetInnerHTML={{ __html: `
        .floating-leaves-area {
          width: 100vw;
          height: 100vh;
          position: fixed;
          z-index: 0;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .floating-leaves-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        .floating-leaves-circles li {
          position: absolute;
          display: block;
          list-style: none;
          width: 20px;
          height: 20px;
          animation: float-up 22s linear infinite;
          bottom: -150px;
          color: #50c878;
          opacity: 0.35;
          filter: drop-shadow(0 0 6px rgba(80, 200, 120, 0.4));
        }
        .floating-leaves-circles li:nth-child(1) { left: 5%; width: 50px; height: 50px; animation-delay: 0s; animation-duration: 20s; }
        .floating-leaves-circles li:nth-child(2) { left: 15%; width: 24px; height: 24px; animation-delay: 2s; animation-duration: 14s; }
        .floating-leaves-circles li:nth-child(3) { left: 28%; width: 65px; height: 65px; animation-delay: 4s; animation-duration: 22s; }
        .floating-leaves-circles li:nth-child(4) { left: 40%; width: 35px; height: 35px; animation-delay: 1s; animation-duration: 17s; }
        .floating-leaves-circles li:nth-child(5) { left: 52%; width: 80px; height: 80px; animation-delay: 5s; animation-duration: 25s; }
        .floating-leaves-circles li:nth-child(6) { left: 63%; width: 28px; height: 28px; animation-delay: 3s; animation-duration: 19s; }
        .floating-leaves-circles li:nth-child(7) { left: 75%; width: 90px; height: 90px; animation-delay: 7s; animation-duration: 23s; }
        .floating-leaves-circles li:nth-child(8) { left: 88%; width: 40px; height: 40px; animation-delay: 2s; animation-duration: 16s; }
        .floating-leaves-circles li:nth-child(9) { left: 93%; width: 70px; height: 70px; animation-delay: 6s; animation-duration: 26s; }
        .floating-leaves-circles li:nth-child(10) { left: 33%; width: 45px; height: 45px; animation-delay: 8s; animation-duration: 21s; }
        .floating-leaves-circles li:nth-child(11) { left: 68%; width: 30px; height: 30px; animation-delay: 9s; animation-duration: 15s; }
        .floating-leaves-circles li:nth-child(12) { left: 82%; width: 60px; height: 60px; animation-delay: 4s; animation-duration: 24s; }

        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.45;
          }
          100% {
            transform: translateY(-1200px) rotate(720deg);
            opacity: 0;
          }
        }
      `}} />
      <ul className="floating-leaves-circles">
        {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
          <li key={i}>
            <Feather style={{ width: "100%", height: "100%", strokeWidth: 1.5 }} />
          </li>
        ))}
      </ul>
    </div>
  );
};
