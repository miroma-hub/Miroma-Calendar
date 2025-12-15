import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [text, setText] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const fullText = "MIROMA";

  useEffect(() => {
    let currentIndex = 0;
    
    // Typing delay
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Wait a moment after finishing typing before fading out
        setTimeout(() => {
          setIsExiting(true);
          // Wait for fade out animation to finish before unmounting
          setTimeout(onFinish, 800);
        }, 800);
      }
    }, 150); // Speed of typing per letter

    return () => clearInterval(typingInterval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
          {text}
          <span className="inline-block w-1 h-10 md:h-16 ml-2 bg-blue-400 animate-blink align-middle mb-2"></span>
        </h1>
        
        {/* Decorative elements that fade in */}
        <div className={`absolute -top-12 -right-12 transition-opacity duration-1000 ${text.length > 3 ? 'opacity-100' : 'opacity-0'}`}>
             <Sparkles className="text-purple-400 animate-pulse" size={48} />
        </div>
      </div>
      
      <p className={`mt-8 text-slate-500 text-sm uppercase tracking-widest transition-opacity duration-1000 ${text.length === fullText.length ? 'opacity-100' : 'opacity-0'}`}>
        AI Personal Assistant
      </p>
    </div>
  );
};

export default SplashScreen;
