import React from 'react';
import { Channel } from '../types';
import { useStore } from '../store/useStore';
import { Heart } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  const { favorites, toggleFavorite } = useStore();
  const isFavorite = favorites.includes(channel.id);

  return (
    <div 
      className="bg-surface rounded-xl p-4 border border-white/5 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer group flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative w-full aspect-video bg-black/40 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            }}
          />
        ) : (
          <div className="text-white/30 text-sm font-medium">No Logo</div>
        )}
        {channel.isLive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            LIVE
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-semibold line-clamp-1 group-hover:text-primary transition-colors" title={channel.name}>
            {channel.name}
          </h3>
          <p className="text-white/50 text-xs mt-1">{channel.category}</p>
        </div>
        
        {channel.currentProgram && (
          <div className="mt-2 text-primary/80 text-xs line-clamp-1 bg-primary/10 px-2 py-1 rounded">
            Now: {channel.currentProgram}
          </div>
        )}
      </div>

      <button 
        className="absolute top-6 left-6 p-1.5 rounded-full bg-black/50 text-white/50 hover:text-red-500 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 z-10"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(channel.id);
        }}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      </button>
    </div>
  );
};
