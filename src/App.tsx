import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayer } from './components/VideoPlayer';
import { LiveTvApi } from './api/liveTvApi';
import { Channel, ResolvedStream } from './types';
import { useStore } from './store/useStore';
import { Search, RefreshCw, Loader2 } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [streamInfo, setStreamInfo] = useState<ResolvedStream | null>(null);
  const { favorites, addToRecent } = useStore();

  const loadChannels = async () => {
    setLoading(true);
    const data = await LiveTvApi.fetchChannels();
    setChannels(data);
    setLoading(false);
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.category));
    return ['All', ...Array.from(cats)].filter(Boolean);
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      const matchesTab = currentTab === 'favorites' ? favorites.includes(c.id) : true;
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [channels, search, category, currentTab, favorites]);

  const handlePlayChannel = async (channel: Channel) => {
    setSelectedChannel(channel);
    addToRecent(channel);
    const resolved = await LiveTvApi.resolveStream(channel);
    setStreamInfo(resolved);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p>Connecting to api.viulk.xyz...</p>
        </div>
      );
    }

    if (currentTab === 'settings') {
      return (
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6">Settings</h2>
          <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-2xl">
            <h3 className="text-xl font-semibold mb-4 text-primary">About ST TV</h3>
            <p className="text-white/70 mb-2">Version: 1.0.0 (Windows)</p>
            <p className="text-white/70 mb-6">API Domain: https://api.viulk.xyz</p>
            
            <h3 className="text-xl font-semibold mb-4 text-primary">System Data</h3>
            <p className="text-white/70 mb-2">Total Channels: {channels.length}</p>
            <p className="text-white/70 mb-2">Favorite Channels: {favorites.length}</p>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => loadChannels()}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Force Refresh API
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col p-8 h-full overflow-hidden">
        <header className="flex items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {currentTab === 'home' ? 'Live TV' : 'Favorites'}
          </h2>
          
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <button 
              onClick={loadChannels}
              className="p-2 rounded-full bg-surface border border-white/10 hover:border-primary text-white/70 hover:text-primary transition-colors"
              title="Refresh channels"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {currentTab === 'home' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === c 
                    ? 'bg-primary text-white' 
                    : 'bg-surface border border-white/10 text-white/70 hover:text-white hover:border-white/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pb-12">
          {filteredChannels.length === 0 ? (
            <div className="text-center text-white/40 mt-20">
              <p className="text-xl">No channels found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredChannels.map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onClick={() => handlePlayChannel(channel)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {selectedChannel ? (
        <VideoPlayer 
          channel={selectedChannel} 
          streamInfo={streamInfo} 
          onClose={() => setSelectedChannel(null)} 
        />
      ) : (
        <>
          <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
          {renderContent()}
        </>
      )}
    </div>
  );
}

export default App;
