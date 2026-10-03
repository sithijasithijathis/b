import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ResolvedStream, Channel } from '../types';
import { useStore } from '../store/useStore';
import { Volume2, VolumeX, Maximize, Minimize, Play, Pause, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  streamInfo: ResolvedStream | null;
  channel: Channel;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamInfo, channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { volume, muted, setVolume, setMuted } = useStore();
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamInfo || !videoRef.current) return;
    const video = videoRef.current;
    
    setIsLoading(true);
    setError(null);

    // Widevine DRM handling would go here via Shaka Player or Dash.js if isWidevine is true.
    // For now we implement HLS playback since it's the most common fallback.
    
    if (Hls.isSupported() && streamInfo.streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamInfo.streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(e => console.error(e));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError('Failed to play stream');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (macOS Safari, some mobile browsers)
      video.src = streamInfo.streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(e => console.error(e));
      });
      video.addEventListener('error', () => {
        setError('Failed to play stream natively');
      });
    } else {
      // Direct MP4 or other native formats
      video.src = streamInfo.streamUrl;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        video.play().catch(e => console.error(e));
      });
      video.addEventListener('error', () => {
        setError('Unsupported stream format');
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeAttribute('src');
      video.load();
    };
  }, [streamInfo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={playerContainerRef} className="relative w-full h-full bg-black flex flex-col group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={togglePlay}
        autoPlay
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {isLoading && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
        {error && (
          <div className="bg-red-500/80 px-4 py-2 rounded text-white font-medium shadow-lg backdrop-blur pointer-events-auto">
            {error}
            <button onClick={onClose} className="ml-4 underline">Close</button>
          </div>
        )}
      </div>
      
      {/* Controls Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white hover:text-primary transition-colors text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20">
            Back
          </button>
          {channel.logo && <img src={channel.logo} alt={channel.name} className="h-8 w-8 object-contain bg-white/5 rounded p-1" />}
          <h2 className="text-white font-semibold text-lg">{channel.name}</h2>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors focus:outline-none">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <div className="flex items-center gap-2 group/volume relative">
          <button onClick={() => setMuted(!muted)} className="text-white hover:text-primary transition-colors">
            {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input 
            type="range" 
            min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (muted) setMuted(false);
            }}
            className="w-20 accent-primary cursor-pointer opacity-0 w-0 group-hover/volume:opacity-100 group-hover/volume:w-20 transition-all duration-300"
          />
        </div>
        
        <div className="flex-1" />
        
        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
