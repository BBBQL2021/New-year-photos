import React, { useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { useAppStore } from './store';

const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { audioPlaying, bgMusicUrl } = useAppStore();

  useEffect(() => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioPlaying]);

  return (
    <div className="w-full h-screen bg-black relative select-none">
      <Scene />
      <Overlay />
      
      {/* Dynamic Background Audio */}
      <audio 
        ref={audioRef} 
        loop 
        src={bgMusicUrl} 
      />
    </div>
  );
};

export default App;