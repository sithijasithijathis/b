import React from 'react';
import { Home, Heart, Settings, Tv } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Live TV' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-surface/50 border-r border-white/10 h-full flex flex-col pt-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 mb-12">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Tv className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">ST TV</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-[inset_4px_0_0_0_rgba(6,182,212,1)]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-6 text-xs text-white/30 text-center">
        ST TV Desktop v1.0.0<br/>
        Premium Streaming
      </div>
    </div>
  );
};
