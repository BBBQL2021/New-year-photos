import React, { ChangeEvent, useRef } from 'react';
import { useAppStore } from '../store';
import { GalleryItem, Orientation } from '../types';

const UIControls: React.FC = () => {
  const { 
    setBgMusicUrl, 
    setGalleryImages, 
    galleryImages,
    updateImageOrientation,
    watermarkText,
    setWatermarkText,
    setWatermarkIcon
  } = useAppStore();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleMusicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgMusicUrl(url);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: GalleryItem[] = [];
      
      // Process files sequentially to detect dimensions
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file as File);
        
        // Auto-detect orientation
        const orientation = await new Promise<Orientation>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.width >= img.height ? 'landscape' : 'portrait');
            img.onerror = () => resolve('landscape'); 
            img.src = url;
        });

        newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            url,
            orientation
        });
      }

      setGalleryImages([...galleryImages, ...newItems]);
      
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setWatermarkIcon(url);
    }
  };

  const removeImage = (id: string) => {
    const newImages = galleryImages.filter((img) => img.id !== id);
    setGalleryImages(newImages);
  };

  const toggleOrientation = (id: string, current: Orientation) => {
    updateImageOrientation(id, current === 'landscape' ? 'portrait' : 'landscape');
  };

  return (
    <div className="flex flex-col gap-4 mt-8 pointer-events-auto bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10 max-w-sm w-full mx-auto max-h-[50vh] overflow-y-auto custom-scrollbar">
      
      {/* Music */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-yellow-200 text-sm font-semibold">Background Music</label>
        <input 
          type="file" 
          accept="audio/*"
          onChange={handleMusicUpload}
          className="block w-full text-xs text-slate-300
            file:mr-2 file:py-1 file:px-2
            file:rounded-full file:border-0
            file:text-xs file:font-semibold
            file:bg-yellow-600 file:text-black
            hover:file:bg-yellow-500
            cursor-pointer"
        />
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-2 text-left">
        <label className="text-yellow-200 text-sm font-semibold">
           Gallery Photos ({galleryImages.length})
        </label>
        <div className="text-[10px] text-white/50 mb-1">
          Add photos. Use toggle to fix orientation.
        </div>
        <input 
          ref={imageInputRef}
          type="file" 
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="block w-full text-xs text-slate-300
            file:mr-2 file:py-1 file:px-2
            file:rounded-full file:border-0
            file:text-xs file:font-semibold
            file:bg-yellow-600 file:text-black
            hover:file:bg-yellow-500
            cursor-pointer"
        />
        
        <div className="grid grid-cols-3 gap-3 mt-2">
          {galleryImages.map((item, i) => (
            <div key={item.id} className="relative aspect-[3/4] rounded-md overflow-hidden border border-white/20 group bg-black/50">
              <img src={item.url} alt={`preview-${i}`} className="w-full h-full object-cover opacity-80" />
              
              {/* Remove Button */}
              <button 
                onClick={() => removeImage(item.id)}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white w-5 h-5 flex items-center justify-center text-[10px] rounded-full transition-colors z-10"
              >
                ✕
              </button>

              {/* Orientation Toggle */}
              <button
                onClick={() => toggleOrientation(item.id, item.orientation)}
                className={`absolute bottom-0 left-0 w-full py-1 text-[9px] font-bold tracking-wider text-center uppercase transition-colors ${
                  item.orientation === 'landscape' 
                    ? 'bg-blue-600/80 text-white hover:bg-blue-500' 
                    : 'bg-green-600/80 text-white hover:bg-green-500'
                }`}
              >
                {item.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Watermark Customization */}
      <div className="flex flex-col gap-2 text-left pt-4 border-t border-white/10">
        <label className="text-yellow-200 text-sm font-semibold">Photo Watermark</label>
        
        <div className="flex flex-col gap-1">
             <span className="text-xs text-white/50">Bottom Text</span>
             <input 
               type="text" 
               value={watermarkText}
               onChange={(e) => setWatermarkText(e.target.value)}
               className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-yellow-400"
             />
        </div>

        <div className="flex flex-col gap-1 mt-2">
             <span className="text-xs text-white/50">Logo Icon</span>
             <input 
               type="file" 
               accept="image/*"
               onChange={handleIconUpload}
               className="block w-full text-xs text-slate-300
                 file:mr-2 file:py-1 file:px-2
                 file:rounded-full file:border-0
                 file:text-xs file:font-semibold
                 file:bg-yellow-600 file:text-black
                 hover:file:bg-yellow-500
                 cursor-pointer"
             />
        </div>
      </div>

    </div>
  );
};

export default UIControls;