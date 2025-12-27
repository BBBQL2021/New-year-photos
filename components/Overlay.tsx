import React from 'react';
import { useAppStore } from '../store';
import { AppPhase } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import UIControls from './UIControls';

// Icons
const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const MuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4l-6 3.18"></path>
    <path d="M17 16.95A7 7 0 0 1 21 12v-2"></path>
    <circle cx="6" cy="18" r="3"></circle>
  </svg>
);

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const Overlay: React.FC = () => {
  const { 
    phase, setPhase, setAudioPlaying, audioPlaying,
    activePhotoIndex, nextPhoto, prevPhoto, galleryImages, watermarkText 
  } = useAppStore();

  const handleStart = () => {
    setAudioPlaying(true);
    
    // Start Sequence
    let count = 5;
    setPhase(AppPhase.COUNTDOWN_5);

    const timer = setInterval(() => {
      count--;
      if (count === 4) setPhase(AppPhase.COUNTDOWN_4);
      if (count === 3) setPhase(AppPhase.COUNTDOWN_3);
      if (count === 2) setPhase(AppPhase.COUNTDOWN_2);
      if (count === 1) setPhase(AppPhase.COUNTDOWN_1);
      
      if (count <= 0) {
        clearInterval(timer);
        setPhase(AppPhase.YEAR_REVEAL);
        
        // Tree after 3.5 seconds
        setTimeout(() => {
            setPhase(AppPhase.TREE_FORMATION);
            
            // Photo Wall after 7 seconds of tree
            setTimeout(() => {
                setPhase(AppPhase.PHOTO_WALL);
            }, 7000);
            
        }, 3500);
      }
    }, 1000);
  };

  return (
    <>
      {/* Persistent Audio Control */}
      <button
        onClick={() => setAudioPlaying(!audioPlaying)}
        className="absolute top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-yellow-400 hover:bg-white/20 transition-all pointer-events-auto"
        title="Toggle Music"
      >
        {audioPlaying ? <MusicIcon /> : <MuteIcon />}
      </button>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col items-center justify-center p-4">
        <AnimatePresence>
          {phase === AppPhase.IDLE && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
              className="w-full max-w-lg text-center max-h-screen overflow-y-auto py-8"
            >
              <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 font-bold mb-4 font-serif drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                Welcome to 2026
              </h1>
              
              <button
                onClick={handleStart}
                className="pointer-events-auto px-12 py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-xl rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,215,0,0.6)] border-2 border-yellow-200"
              >
                Start Celebration
              </button>

              {/* Customization Controls */}
              <UIControls />
            </motion.div>
          )}

          {phase === AppPhase.TREE_FORMATION && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: -150 }} 
              transition={{ duration: 1, delay: 1 }}
              className="absolute top-1/2 text-center w-full"
            >
               <h2 className="text-3xl md:text-5xl text-yellow-100 font-serif font-bold drop-shadow-lg tracking-widest">
                 2026 <span className="text-yellow-400">祝你开心</span>
               </h2>
            </motion.div>
          )}
          
          {phase === AppPhase.PHOTO_WALL && (
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 1 }}
               className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4 pointer-events-auto"
             >
                {/* Navigation Bar */}
                <div className="flex items-center gap-8 bg-black/40 backdrop-blur-md px-12 py-4 rounded-full border border-yellow-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <button 
                    onClick={prevPhoto}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-yellow-200 transition-colors border border-white/10"
                  >
                    <ArrowLeft />
                  </button>

                  <div className="flex flex-col items-center min-w-[200px]">
                      <h3 className="text-yellow-400 font-serif text-xl tracking-widest font-bold">
                        EVERGREEN ECHO
                      </h3>
                      <div className="text-white/60 text-xs tracking-[0.3em] mt-1">
                        {String(activePhotoIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
                      </div>
                      <div className="text-white/40 text-[10px] mt-1 italic">
                          {watermarkText}
                      </div>
                  </div>

                  <button 
                    onClick={nextPhoto}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/20 text-yellow-200 transition-colors border border-white/10"
                  >
                    <ArrowRight />
                  </button>
                </div>
                
                <p className="text-white/30 text-[10px] tracking-widest uppercase mt-2">
                  Drag or use arrow keys to browse
                </p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Overlay;