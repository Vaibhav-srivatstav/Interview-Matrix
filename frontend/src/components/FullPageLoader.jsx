import React from 'react';

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center 
                    bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      
      {/* Container for the spinner and logo pulse */}
      <div className="relative flex items-center justify-center">
        {/* The Outer Spinning Ring */}
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
        
        {/* The Inner Pulsing Dot */}
        <div className="absolute h-4 w-4 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></div>
      </div>

      {/* Modern Subtitle */}
      <div className="mt-6 text-center">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase 
                       text-slate-800 dark:text-slate-200">
          Interview <span className="text-indigo-600 dark:text-indigo-400">Matrix</span>
        </h2>
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Setting up your session...
        </p>
      </div>

    </div>
  );
};

export default FullPageLoader;