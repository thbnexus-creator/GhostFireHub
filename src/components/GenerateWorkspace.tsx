import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Layout, Smartphone, Crosshair, Sparkles } from 'lucide-react';

import RecommendationEngine from './RecommendationEngine';
import HUDCanvas from './HUDCanvas';
import DeviceDB from './DeviceDB';
import WeaponsDB from './WeaponsDB';

import { Device, Weapon, UserProfile } from '../types';

interface GenerateWorkspaceProps {
  userEmail?: string;
  currentUser: UserProfile | null;
  onSaveSuccess?: () => void;
  weaponsList: Weapon[];
  devicesList: Device[];
  selectedDeviceFromDB: Device | null;
  clearSelectedDevice: () => void;
  selectedWeaponFromDB: string | null;
  clearSelectedWeapon: () => void;
  onToggleBookmark: (type: 'preset' | 'product', id: string) => void;
  bookmarkedPresetIds: string[];
  isAdmin: boolean;
  handleAddDevice: (newDevice: Partial<Device>) => Promise<boolean>;
  useDeviceSpecs: (device: Device) => void;
}

export default function GenerateWorkspace({
  userEmail,
  currentUser,
  onSaveSuccess,
  weaponsList,
  devicesList,
  selectedDeviceFromDB,
  clearSelectedDevice,
  selectedWeaponFromDB,
  clearSelectedWeapon,
  onToggleBookmark,
  bookmarkedPresetIds,
  isAdmin,
  handleAddDevice,
  useDeviceSpecs
}: GenerateWorkspaceProps) {
  // Sub-navigation state
  const [activeSubTab, setActiveSubTab] = useState<'sensitivity' | 'hud' | 'devices' | 'weapons'>('sensitivity');

  // Handle immediate device redirection from database to calibration tab
  React.useEffect(() => {
    if (selectedDeviceFromDB) {
      setActiveSubTab('sensitivity');
    }
  }, [selectedDeviceFromDB]);

  // Handle immediate weapon redirection from database to calibration tab
  React.useEffect(() => {
    if (selectedWeaponFromDB) {
      setActiveSubTab('sensitivity');
    }
  }, [selectedWeaponFromDB]);

  const subTabs = [
    { id: 'sensitivity', label: 'AI CALIBRATION', icon: Sliders, color: 'text-cyan-400 border-cyan-500/40' },
    { id: 'hud', label: 'HUD CANVAS', icon: Layout, color: 'text-purple-400 border-purple-500/40' },
    { id: 'devices', label: 'DEVICES specs', icon: Smartphone, color: 'text-emerald-400 border-emerald-500/40' },
    { id: 'weapons', label: 'WEAPONS calibration', icon: Crosshair, color: 'text-rose-400 border-rose-500/40' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. FUTURISTIC GENERATOR CONTROL SWITCHER */}
      <div className="bg-slate-900/60 border border-slate-850 p-2 rounded-2xl backdrop-blur-xl flex flex-wrap gap-1.5 justify-center md:justify-start">
        {subTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-slate-950 font-black shadow-lg shadow-cyan-600/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. SUBTABS ROUTING CANVAS */}
      <div className="min-h-[400px]">
        {activeSubTab === 'sensitivity' && (
          <div className="animate-fadeIn">
            <RecommendationEngine 
              userEmail={userEmail}
              currentUser={currentUser}
              onSaveSuccess={onSaveSuccess || (() => {})}
              weaponsList={weaponsList}
              devicesList={devicesList}
              selectedDeviceFromDB={selectedDeviceFromDB}
              clearSelectedDevice={clearSelectedDevice}
              selectedWeaponFromDB={selectedWeaponFromDB}
              clearSelectedWeapon={clearSelectedWeapon}
              onToggleBookmark={onToggleBookmark}
              bookmarkedPresetIds={bookmarkedPresetIds}
            />
          </div>
        )}

        {activeSubTab === 'hud' && (
          <div className="animate-fadeIn">
            <HUDCanvas 
              userEmail={userEmail}
            />
          </div>
        )}

        {activeSubTab === 'devices' && (
          <div className="animate-fadeIn">
            <DeviceDB 
              devices={devicesList}
              onDeviceSelected={(device) => {
                useDeviceSpecs(device);
                setActiveSubTab('sensitivity');
              }}
              onAddDevice={handleAddDevice}
              isAdmin={isAdmin}
              initialSearchQuery=""
            />
          </div>
        )}

        {activeSubTab === 'weapons' && (
          <div className="animate-fadeIn">
            <WeaponsDB 
              weapons={weaponsList}
              isAdmin={isAdmin}
              userEmail={userEmail}
            />
          </div>
        )}
      </div>

    </div>
  );
}
