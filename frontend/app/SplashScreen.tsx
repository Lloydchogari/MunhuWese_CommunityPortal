'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full font-['Poppins']">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/logo.jpg" 
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          {/* overlay for dim effect */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

       
        <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 sm:p-12 shadow-2xl border border-gray-200/50 max-w-md mx-auto text-center space-y-8">
           
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mx-auto mb-6">
              <Image
                src="/logo.jpg"
                alt="Munhu Wese"
                width={80}
                height={80}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-black">
                Munhu Wese
              </h1>
              <p className="text-white text-lg max-w-sm mx-auto">
                Let's dive into new exciting events
              </p>
            </div>

            {/* Bouncing Dots Animation */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.2s]"></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.1s]"></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
            </div>

            <p className="text-sm text-white font-medium tracking-wide">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
