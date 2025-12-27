import { create } from 'zustand';
import { AppPhase, GalleryItem, Orientation } from './types';

interface AppState {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  
  audioPlaying: boolean;
  setAudioPlaying: (playing: boolean) => void;

  // Media Management
  bgMusicUrl: string;
  setBgMusicUrl: (url: string) => void;
  
  galleryImages: GalleryItem[];
  setGalleryImages: (images: GalleryItem[]) => void;
  updateImageOrientation: (id: string, orientation: Orientation) => void;

  // Carousel State
  activePhotoIndex: number;
  setActivePhotoIndex: (index: number) => void;
  nextPhoto: () => void;
  prevPhoto: () => void;

  // Watermark Customization
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  watermarkIcon: string;
  setWatermarkIcon: (url: string) => void;
}

// Helper to create gallery items
const createItem = (url: string, orientation: Orientation): GalleryItem => ({
    id: Math.random().toString(36).substring(2, 9),
    url,
    orientation
});

// Default images using Picsum
const DEFAULT_IMAGES: GalleryItem[] = [
  createItem('https://picsum.photos/id/10/800/600', 'landscape'),
  createItem('https://picsum.photos/id/11/800/600', 'landscape'),
  createItem('https://picsum.photos/id/14/800/600', 'landscape'),
  createItem('https://picsum.photos/id/17/800/600', 'landscape'),
  createItem('https://picsum.photos/id/19/600/800', 'portrait'),
  createItem('https://picsum.photos/id/28/800/600', 'landscape')
];

// Generate a reliable default logo
const generateDefaultLogo = () => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.clearRect(0, 0, 128, 128);
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fillStyle = '#E3000f'; 
  ctx.fill();
  
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEICA', 64, 64);
  
  return canvas.toDataURL('image/png');
};

const DEFAULT_LOGO = generateDefaultLogo();

export const useAppStore = create<AppState>((set) => ({
  phase: AppPhase.IDLE,
  setPhase: (phase) => set({ phase }),
  
  audioPlaying: false,
  setAudioPlaying: (audioPlaying) => set({ audioPlaying }),

  bgMusicUrl: "https://cdn.pixabay.com/audio/2022/12/16/audio_1739c9472e.mp3",
  setBgMusicUrl: (url) => set({ bgMusicUrl: url }),

  galleryImages: DEFAULT_IMAGES,
  setGalleryImages: (images) => set({ galleryImages: images, activePhotoIndex: 0 }),
  
  updateImageOrientation: (id, orientation) => set((state) => ({
    galleryImages: state.galleryImages.map(img => 
      img.id === id ? { ...img, orientation } : img
    )
  })),

  activePhotoIndex: 0,
  setActivePhotoIndex: (index) => set({ activePhotoIndex: index }),
  nextPhoto: () => set((state) => ({ 
    activePhotoIndex: (state.activePhotoIndex + 1) % state.galleryImages.length 
  })),
  prevPhoto: () => set((state) => ({ 
    activePhotoIndex: (state.activePhotoIndex - 1 + state.galleryImages.length) % state.galleryImages.length 
  })),

  watermarkText: "2026 NEW YEAR | 记录美好瞬间",
  setWatermarkText: (text) => set({ watermarkText: text }),
  
  watermarkIcon: DEFAULT_LOGO, 
  setWatermarkIcon: (url) => set({ watermarkIcon: url }),
}));