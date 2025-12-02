'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-['Poppins']">
      <div className="max-w-3xl w-full text-center">
      
        <div className="mb-12">
          <img 
            src="/logo.jpg" 
            alt="Munhu Wese Logo" 
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto object-contain shadow-xl"
          />
        </div>

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-black mb-2">
          Unlock the future of
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black mb-6">
          Community Events
        </h2>

        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-xs sm:text-sm md:text-base text-black leading-relaxed">
            Welcome to Munhu Wese, where communities come together to create, discover, and participate in meaningful events.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/register"
          className="inline-block px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-gray-800 hover:bg-black text-white text-sm sm:text-base font-bold rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl mb-5"
        >
          Let's Get Started
        </Link>

        {/* Sign In Link */}
        <p className="text-xs sm:text-sm text-black">
          Already have an account?{' '}
          <Link
            href="/register"
            className="text-gray-800 hover:text-black font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}