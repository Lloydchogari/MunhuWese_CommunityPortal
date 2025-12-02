'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        <img
          src="/logo.jpg"
          alt="Loading..."
          className="absolute w-48 h-48 opacity-20"
        />
        {/* Loading Spinner */}
        <div
          className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"
          style={{ transform: 'translateY(40px)' }}
        ></div>
      </div>
    </div>
  );
}