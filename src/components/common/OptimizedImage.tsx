import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  className = '',
  aspectRatio = 'auto',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }[aspectRatio];

  const currentSrc = error || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-slate-900/60 ${aspectClasses} ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 animate-pulse z-10">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-600 p-2 text-center z-10">
          <ImageOff className="w-5 h-5 mb-1 text-slate-600" />
          <span className="text-[10px] font-mono">Image unavailable</span>
        </div>
      )}

      <img
        {...props}
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoaded(true);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
