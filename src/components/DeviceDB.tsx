import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  Smartphone, 
  Filter, 
  Check, 
  Sparkles, 
  PlusCircle, 
  Trash2,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  GitCompare,
  Info,
  TrendingUp,
  Sliders,
  ArrowLeftRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Device } from '../types';
import { BRANDS_LIST, DEVICE_MODELS_MAP, detectProcessor } from '../data/deviceModels';
import { trackMissionProgress } from '../utils';

interface DeviceDBProps {
  devices: Device[];
  onDeviceSelected: (device: Device) => void;
  onAddDevice: (device: Partial<Device>) => Promise<boolean>;
  isAdmin?: boolean;
  initialSearchQuery?: string;
}

function getComparisonInsights(d1: Device, d2: Device, s1: any, s2: any) {
  const insights: string[] = [];
  
  // 1. Refresh rate
  const hz1 = parseInt(d1.refreshRate || '0') || 60;
  const hz2 = parseInt(d2.refreshRate || '0') || 60;
  if (hz1 > hz2) {
    insights.push(`Smoothness Advantage: ${d1.model} features a higher refresh rate (${d1.refreshRate}) than ${d2.model} (${d2.refreshRate}), offering more fluid rendering.`);
  } else if (hz2 > hz1) {
    insights.push(`Smoothness Advantage: ${d2.model} features a higher refresh rate (${d2.refreshRate}) than ${d1.model} (${d1.refreshRate}), offering more fluid rendering.`);
  }

  // 2. Touch Sampling
  const tsr1 = parseInt(d1.touchSamplingRate || '0') || 240;
  const tsr2 = parseInt(d2.touchSamplingRate || '0') || 240;
  if (tsr1 > tsr2) {
    insights.push(`Tactile Response: ${d1.model} has superior touch-sampling rate (${d1.touchSamplingRate}) translating to lower input latency.`);
  } else if (tsr2 > tsr1) {
    insights.push(`Tactile Response: ${d2.model} has superior touch-sampling rate (${d2.touchSamplingRate}) translating to lower input latency.`);
  }

  // 3. Gyroscope
  if (d1.gyroscope && !d2.gyroscope) {
    insights.push(`Aim Assist: ${d1.model} has hardware Gyroscope, allowing for elite recoil dampening that ${d2.model} lacks.`);
  } else if (d2.gyroscope && !d1.gyroscope) {
    insights.push(`Aim Assist: ${d2.model} has hardware Gyroscope, allowing for elite recoil dampening that ${d1.model} lacks.`);
  }

  // 4. General Sensitivity differences
  const diffGen = Math.abs(s1.general - s2.general);
  if (diffGen >= 15) {
    const faster = s1.general > s2.general ? d1.model : d2.model;
    const slower = s1.general > s2.general ? d2.model : d1.model;
    insights.push(`Sensitivity Scaling: ${faster} requires higher general sensitivity (+${diffGen} pts) to offset tactile micro-delays compared to ${slower}.`);
  }

  if (insights.length === 0) {
    insights.push("Tactile Match: These devices have highly identical structures. Baselines share close calibration parameters.");
  }

  return insights;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl font-mono text-[11px] space-y-1.5 z-50">
        <p className="font-extrabold text-slate-300 uppercase tracking-wider">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center gap-3 justify-between">
            <span style={{ color: p.color }} className="font-bold">{p.name}:</span>
            <span className="text-slate-200 font-extrabold text-xs">{p.value} pts</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DeviceDB({ devices, onDeviceSelected, onAddDevice, isAdmin, initialSearchQuery }: DeviceDBProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const [compareMode, setCompareMode] = useState(false);
  const [compareTab, setCompareTab] = useState<'bars' | 'curve'>('curve');
  const [device1Id, setDevice1Id] = useState<string>('');
  const [device2Id, setDevice2Id] = useState<string>('');

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  
  // Specs sliders/filter values
  const [selectedRam, setSelectedRam] = useState('All');
  const [selectedHz, setSelectedHz] = useState('All');

  // Helper sensitivity calculator based on standard spec rules
  function calculateDefaultSensitivity(device: Device) {
    let general = 100;
    let redDot = 95;
    let scope2x = 90;
    let scope4x = 85;
    let sniper = 60;
    let freeLook = 80;

    const processor = detectProcessor(device.brand || '', device.model || '');
    const procLower = processor.toLowerCase();

    // 1. Processor Recoil Adjustments
    if (procLower.includes('snapdragon 8') || procLower.includes('apple a') || procLower.includes('dimensity 9') || procLower.includes('bionic')) {
      general -= 12;
      redDot -= 8;
    } else if (procLower.includes('unisoc') || procLower.includes('helio') || procLower.includes('g99') || procLower.includes('snapdragon 4') || procLower.includes('snapdragon 6')) {
      general += 25;
      redDot += 18;
      scope2x += 12;
    } else {
      general += 5;
    }

    // 2. RAM Adjustments
    const ramNum = parseInt(device.ram || '8') || 8;
    if (ramNum <= 4) {
      general += 18;
      redDot += 14;
      scope2x += 8;
    } else if (ramNum >= 12) {
      general -= 8;
      redDot -= 4;
    }

    // 3. Refresh Rate Adjustments
    const hzNum = parseInt(device.refreshRate || '120') || 120;
    if (hzNum >= 120) {
      scope2x += 10;
      scope4x += 10;
      sniper += 6;
    } else if (hzNum <= 60) {
      general += 15;
      redDot += 12;
    }

    // 4. Touch Sampling Rate Adjustments
    const tsrNum = parseInt(device.touchSamplingRate || '240') || 240;
    if (tsrNum >= 360) {
      general -= 8;
      redDot -= 6;
    } else if (tsrNum <= 120) {
      general += 22;
      redDot += 16;
    }

    // 5. Screen Size & Resolution
    const sizeNum = parseFloat(device.screenSize || '6.5') || 6.5;
    if (sizeNum <= 6.1) {
      general += 10;
    }
    const resLower = (device.resolution || '').toLowerCase();
    if (resLower.includes('qhd') || resLower.includes('2k') || resLower.includes('retina') || resLower.includes('1.5k')) {
      general += 8;
      redDot += 6;
    }

    // 6. Gyroscope Availability
    if (device.gyroscope) {
      sniper -= 10;
      scope2x -= 6;
      scope4x -= 6;
    } else {
      general += 8;
      scope2x += 10;
      scope4x += 10;
    }

    const clamp = (val: number, min = 10, max = 200) => Math.max(min, Math.min(max, val));

    return {
      general: clamp(general, 50, 200),
      redDot: clamp(redDot, 40, 200),
      scope2x: clamp(scope2x, 40, 200),
      scope4x: clamp(scope4x, 30, 200),
      sniper: clamp(sniper, 20, 150),
      freeLook: clamp(freeLook, 30, 180)
    };
  }

  // Admin Form details
  const [adminBrand, setAdminBrand] = useState('Samsung');
  const [adminModel, setAdminModel] = useState('');
  const [adminOS, setAdminOS] = useState('Android 14');
  const [adminRAM, setAdminRAM] = useState('12 GB');
  const [adminHZ, setAdminHZ] = useState('120Hz');
  const [adminTouch, setAdminTouch] = useState('240Hz');
  const [adminResolution, setAdminResolution] = useState('FHD+');
  const [adminSize, setAdminSize] = useState('6.7"');
  const [adminGyro, setAdminGyro] = useState(true);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compile all models from pre-loaded deviceModels map
  const allTemplates: Device[] = [];
  let templateIdCounter = 10000;
  Object.entries(DEVICE_MODELS_MAP).forEach(([brandKey, modelTemplates]) => {
    modelTemplates.forEach(t => {
      allTemplates.push({
        id: `tmpl-${templateIdCounter++}`,
        brand: brandKey,
        model: t.model,
        os: t.os,
        ram: t.ram,
        refreshRate: t.refreshRate,
        touchSamplingRate: t.touchSamplingRate,
        resolution: t.resolution,
        screenSize: t.screenSize,
        gyroscope: t.gyroscope
      });
    });
  });

  // Merge database items and template profiles seamlessly (preventing model duplicates)
  const mergedDevices: Device[] = [...devices];
  allTemplates.forEach(tmpl => {
    const exists = devices.some(d => d && d.brand && d.model && d.brand.toLowerCase() === tmpl.brand.toLowerCase() && d.model.toLowerCase() === tmpl.model.toLowerCase());
    if (!exists) {
      mergedDevices.push(tmpl);
    }
  });

  // Filter calculation using normalized RAM matchers
  const filteredDevices = mergedDevices.filter(d => {
    if (!d) return false;
    const modelStr = d.model || '';
    const brandStr = d.brand || '';
    const searchVal = searchQuery || '';
    const matchesSearch = modelStr.toLowerCase().includes(searchVal.toLowerCase()) || 
                          brandStr.toLowerCase().includes(searchVal.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || d.brand === selectedBrand;
    
    let matchesRam = true;
    if (selectedRam !== 'All') {
      const dRamNorm = d.ram ? d.ram.replace(/\s/g, '').toLowerCase() : '';
      const sRamNorm = selectedRam.replace(/\s/g, '').toLowerCase();
      matchesRam = dRamNorm === sRamNorm;
    }
    
    const matchesHz = selectedHz === 'All' || d.refreshRate === selectedHz;

    return matchesSearch && matchesBrand && matchesRam && matchesHz;
  });

  useEffect(() => {
    if (mergedDevices.length >= 2) {
      if (!device1Id) {
        setDevice1Id(mergedDevices[0].id);
      }
      if (!device2Id) {
        setDevice2Id(mergedDevices[1].id);
      }
    }
  }, [mergedDevices, device1Id, device2Id]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');
    
    if (!adminModel) {
      setFormError('Please input a smartphone model name.');
      return;
    }

    setSubmitting(true);
    const success = await onAddDevice({
      brand: adminBrand,
      model: adminModel,
      os: adminOS,
      ram: adminRAM,
      refreshRate: adminHZ,
      touchSamplingRate: adminTouch,
      resolution: adminResolution,
      screenSize: adminSize,
      gyroscope: adminGyro
    });

    if (success) {
      setFormSuccess(`Device model "${adminBrand} ${adminModel}" registered into global database!`);
      setAdminModel('');
    } else {
      setFormError('Failed to register device.');
    }
    setSubmitting(false);
  };

  const compDevice1 = mergedDevices.find(d => d.id === device1Id) || mergedDevices[0];
  const compDevice2 = mergedDevices.find(d => d.id === device2Id) || mergedDevices[1];
  const sens1 = compDevice2 ? calculateDefaultSensitivity(compDevice1) : null;
  const sens2 = compDevice2 ? calculateDefaultSensitivity(compDevice2) : null;

  const model1Name = compDevice1 ? compDevice1.model : 'Device 1';
  const model2Name = compDevice2 ? compDevice2.model : 'Device 2';

  const chartData = [
    { name: 'General', [model1Name]: sens1?.general || 0, [model2Name]: sens2?.general || 0 },
    { name: 'Free Look', [model1Name]: sens1?.freeLook || 0, [model2Name]: sens2?.freeLook || 0 },
    { name: 'Red Dot', [model1Name]: sens1?.redDot || 0, [model2Name]: sens2?.redDot || 0 },
    { name: '2x Scope', [model1Name]: sens1?.scope2x || 0, [model2Name]: sens2?.scope2x || 0 },
    { name: '4x Scope', [model1Name]: sens1?.scope4x || 0, [model2Name]: sens2?.scope4x || 0 },
    { name: 'Sniper', [model1Name]: sens1?.sniper || 0, [model2Name]: sens2?.sniper || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Device Directory Catalog - LEFT */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Filter Toolbar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-800/80">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                Smartphone Specifications Directory
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Quick search and filter model tactile profiles</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCompareMode(!compareMode)}
                className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  compareMode 
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>{compareMode ? 'Exit Compare' : 'Compare Mode'}</span>
              </button>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-2 py-1 rounded uppercase">
                {filteredDevices.length} models active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone models..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
              />
            </div>

             {/* Brand Filter */}
            <div className="space-y-1">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="All">All Brands</option>
                {BRANDS_LIST.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* RAM Filter */}
            <div className="space-y-1">
              <select
                value={selectedRam}
                onChange={(e) => setSelectedRam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="All">All RAM Capacities</option>
                <option value="2 GB">2 GB RAM</option>
                <option value="3 GB">3 GB RAM</option>
                <option value="4 GB">4 GB RAM</option>
                <option value="6 GB">6 GB RAM</option>
                <option value="8 GB">8 GB RAM</option>
                <option value="12 GB">12 GB RAM</option>
                <option value="16 GB">16 GB RAM</option>
                <option value="24 GB">24 GB RAM</option>
              </select>
            </div>

          </div>
        </div>

        {compareMode && (
          <div className="bg-slate-900/60 border border-orange-500/30 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden space-y-5 animate-fade-in">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl -z-10" />

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <GitCompare className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tactile Comparison Dashboard</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Dual-device hardware benchmark & baseline sensitivity calibration</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setCompareMode(false)}
                className="text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-wider bg-slate-800/60 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Close Compare
              </button>
            </div>

            {/* Dual Select Row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850/60">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Device Slot 1 (Orange)</label>
                <select
                  value={device1Id}
                  onChange={(e) => setDevice1Id(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-orange-400 outline-none focus:border-orange-500/60 transition-colors"
                >
                  {mergedDevices.map(d => (
                    <option key={`d1-${d.id}`} value={d.id} className="text-slate-300 bg-slate-950">
                      [{d.brand}] {d.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const temp = device1Id;
                    setDevice1Id(device2Id);
                    setDevice2Id(temp);
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 text-slate-400 hover:text-orange-400 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 group w-full sm:w-auto"
                  title="Swap Slots (Quick Swap)"
                >
                  <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                  <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider">Quick Swap Slots</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Device Slot 2 (Blue)</label>
                <select
                  value={device2Id}
                  onChange={(e) => setDevice2Id(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-indigo-400 outline-none focus:border-indigo-500/60 transition-colors"
                >
                  {mergedDevices.map(d => (
                    <option key={`d2-${d.id}`} value={d.id} className="text-slate-300 bg-slate-950">
                      [{d.brand}] {d.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compare Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Specs Comparison Columns */}
              <div className="md:col-span-5 space-y-3.5 bg-slate-950/20 rounded-2xl p-4 border border-slate-850/40">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-850 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                  Hardware Spec Confrontation
                </h4>
                
                {/* Specs Table */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 pb-2 border-b border-slate-850/60 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Specification</span>
                    <span className="text-orange-500 truncate" title={compDevice1?.model}>{compDevice1 ? compDevice1.model.split(' ').slice(-2).join(' ') : 'Slot 1'}</span>
                    <span className="text-indigo-400 truncate" title={compDevice2?.model}>{compDevice2 ? compDevice2.model.split(' ').slice(-2).join(' ') : 'Slot 2'}</span>
                  </div>

                  {[
                    { label: 'Brand', key: 'brand' },
                    { label: 'Model', key: 'model' },
                    { label: 'RAM Capacity', key: 'ram' },
                    { label: 'Refresh Rate', key: 'refreshRate' },
                    { label: 'Touch Sampling', key: 'touchSamplingRate' },
                    { label: 'Screen Size', key: 'screenSize' },
                    { label: 'Resolution', key: 'resolution' },
                    { label: 'OS Version', key: 'os' },
                    { label: 'Gyroscope', key: 'gyroscope', isBool: true }
                  ].map((row, idx) => {
                    const val1Raw = compDevice1 ? compDevice1[row.key as keyof Device] : '';
                    const val2Raw = compDevice2 ? compDevice2[row.key as keyof Device] : '';
                    const val1 = compDevice1 ? (row.isBool ? (val1Raw ? 'Hardware Gyro' : 'No Gyro') : String(val1Raw || '')) : '';
                    const val2 = compDevice2 ? (row.isBool ? (val2Raw ? 'Hardware Gyro' : 'No Gyro') : String(val2Raw || '')) : '';
                    
                    // Calculate winner for highlighting
                    let winner = 0;
                    if (row.key === 'ram') {
                      const num1 = parseInt(String(val1Raw || '0')) || 0;
                      const num2 = parseInt(String(val2Raw || '0')) || 0;
                      winner = num1 > num2 ? 1 : num2 > num1 ? 2 : 0;
                    } else if (row.key === 'refreshRate') {
                      const num1 = parseInt(String(val1Raw || '0')) || 0;
                      const num2 = parseInt(String(val2Raw || '0')) || 0;
                      winner = num1 > num2 ? 1 : num2 > num1 ? 2 : 0;
                    } else if (row.key === 'touchSamplingRate') {
                      const num1 = parseInt(String(val1Raw || '0')) || 0;
                      const num2 = parseInt(String(val2Raw || '0')) || 0;
                      winner = num1 > num2 ? 1 : num2 > num1 ? 2 : 0;
                    } else if (row.key === 'gyroscope') {
                      winner = val1Raw && !val2Raw ? 1 : !val1Raw && val2Raw ? 2 : 0;
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`grid grid-cols-3 py-1.5 border-b border-slate-900/20 font-mono text-[11px] items-center transition-all ${
                          winner > 0 ? 'bg-slate-900/20 px-1 rounded' : ''
                        }`}
                      >
                        <span className="text-slate-500 self-center font-sans">{row.label}</span>
                        <span className={`truncate pr-1 flex items-center gap-1 ${
                          winner === 1 
                            ? 'text-emerald-400 font-extrabold' 
                            : winner === 2 
                            ? 'text-slate-600 font-normal line-through opacity-60' 
                            : 'text-orange-400 font-semibold'
                        }`}>
                          {val1}
                          {winner === 1 && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </span>
                        <span className={`truncate pr-1 flex items-center gap-1 ${
                          winner === 2 
                            ? 'text-emerald-400 font-extrabold' 
                            : winner === 1 
                            ? 'text-slate-600 font-normal line-through opacity-60' 
                            : 'text-indigo-400 font-semibold'
                        }`}>
                          {val2}
                          {winner === 2 && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </span>
                      </div>
                    );
                  })}

                  {/* Processor spec */}
                  <div className="grid grid-cols-3 py-1.5 font-mono text-[11px] items-center">
                    <span className="text-slate-500 self-center font-sans">Processor/SoC</span>
                    <span className="text-orange-400 font-semibold truncate pr-1" title={detectProcessor(compDevice1?.brand || '', compDevice1?.model || '')}>
                      {detectProcessor(compDevice1?.brand || '', compDevice1?.model || '')}
                    </span>
                    <span className="text-indigo-400 font-semibold truncate pr-1" title={detectProcessor(compDevice2?.brand || '', compDevice2?.model || '')}>
                      {detectProcessor(compDevice2?.brand || '', compDevice2?.model || '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensitivity Baseline Calibration Side-by-Side */}
              <div className="md:col-span-7 space-y-4 bg-slate-950/30 rounded-2xl p-4 border border-slate-850/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-850 gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Sensitivity Comparison
                  </h4>
                  
                  {/* Tab Toggles */}
                  <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-slate-900/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCompareTab('curve')}
                      className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                        compareTab === 'curve'
                          ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Visual Curves
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompareTab('bars')}
                      className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                        compareTab === 'bars'
                          ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Calibration Gauges
                    </button>
                  </div>
                </div>

                {/* Sub-tab 1: Interactive Recharts curves */}
                {compareTab === 'curve' && sens1 && sens2 && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 italic">
                      Tactile curve decay relative to scope zoom. Lower values at higher magnification prevent over-steering.
                    </p>
                    <div className="w-full h-64 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorD1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorD2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontFamily="monospace"
                            domain={[0, 200]}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: '#94a3b8' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey={model1Name} 
                            stroke="#f97316" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorD1)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey={model2Name} 
                            stroke="#6366f1" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorD2)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Calibration Gauges (Horizontal Progress Bars) */}
                {compareTab === 'bars' && sens1 && sens2 && (
                  <div className="space-y-3.5">
                    {[
                      { label: 'General Camera Sensitivity', key: 'general' },
                      { label: 'Red Dot / Holographic', key: 'redDot' },
                      { label: '2x Scope Baseline', key: 'scope2x' },
                      { label: '4x Scope Baseline', key: 'scope4x' },
                      { label: 'Sniper Scope Precision', key: 'sniper' },
                      { label: 'Free Look (Camera/Eye)', key: 'freeLook' }
                    ].map((item, idx) => {
                      const v1 = sens1[item.key as keyof typeof sens1] || 100;
                      const v2 = sens2[item.key as keyof typeof sens2] || 100;
                      
                      // Max values for normal scaling
                      const maxVal = 200;
                      const pct1 = Math.min(100, (v1 / maxVal) * 100);
                      const pct2 = Math.min(100, (v2 / maxVal) * 100);

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400">
                            <span>{item.label}</span>
                            <div className="flex gap-2 font-mono">
                              <span className="text-orange-400">{v1}</span>
                              <span className="text-slate-600">vs</span>
                              <span className="text-indigo-400">{v2}</span>
                            </div>
                          </div>
                          
                          {/* Pair of bars side-by-side inside matching track */}
                          <div className="space-y-1">
                            {/* Device 1 Bar */}
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct1}%` }}
                              />
                            </div>
                            {/* Device 2 Bar */}
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct2}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Smart Insights summary box */}
            {compDevice1 && compDevice2 && sens1 && sens2 && (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 space-y-2 text-[11px] text-slate-300">
                <h5 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 text-[9px]">
                  <Info className="w-3.5 h-3.5 text-orange-500" />
                  GhostCore™ Compare Diagnostics
                </h5>
                <div className="space-y-1.5 font-mono text-slate-400 leading-relaxed pl-1.5 border-l border-orange-500/40">
                  {getComparisonInsights(compDevice1, compDevice2, sens1, sens2).map((insight, idx) => (
                    <p key={idx} className="relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-orange-500">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDevices.map(device => (
            <div
              key={device.id}
              className="bg-slate-900/40 border border-slate-800 hover:border-orange-500/30 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all duration-200 shadow-lg relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 font-mono px-2 py-0.5 rounded uppercase">
                      {device.brand}
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1.5">{device.model}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0 items-end">
                    <button
                      type="button"
                      onClick={() => {
                        onDeviceSelected(device);
                        const savedUser = localStorage.getItem('ghostfire_user');
                        if (savedUser) {
                          try {
                            const email = JSON.parse(savedUser).email;
                            trackMissionProgress(email, 'view_device');
                          } catch (e) {}
                        }
                      }}
                      className="text-[10px] bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Use Specs
                    </button>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setDevice1Id(device.id);
                          setCompareMode(true);
                          const savedUser = localStorage.getItem('ghostfire_user');
                          if (savedUser) {
                            try {
                              const email = JSON.parse(savedUser).email;
                              trackMissionProgress(email, 'view_device');
                            } catch (e) {}
                          }
                        }}
                        className={`text-[9px] px-2 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                          device1Id === device.id 
                            ? 'bg-orange-500 text-slate-950' 
                            : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-orange-400'
                        }`}
                        title="Compare as Device 1"
                      >
                        Slot 1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDevice2Id(device.id);
                          setCompareMode(true);
                          const savedUser = localStorage.getItem('ghostfire_user');
                          if (savedUser) {
                            try {
                              const email = JSON.parse(savedUser).email;
                              trackMissionProgress(email, 'view_device');
                            } catch (e) {}
                          }
                        }}
                        className={`text-[9px] px-2 py-1 rounded font-bold uppercase transition-all cursor-pointer ${
                          device2Id === device.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-blue-400'
                        }`}
                        title="Compare as Device 2"
                      >
                        Slot 2
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specs List Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-3 text-slate-400">
                  <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded border border-slate-850/40">
                    <span className="text-slate-600">RAM:</span>
                    <span className="text-slate-300 font-semibold">{device.ram}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded border border-slate-850/40">
                    <span className="text-slate-600">HZ:</span>
                    <span className="text-slate-300 font-semibold">{device.refreshRate}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded border border-slate-850/40">
                    <span className="text-slate-600">Touch:</span>
                    <span className="text-slate-300 font-semibold">{device.touchSamplingRate}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded border border-slate-850/40">
                    <span className="text-slate-600">Screen:</span>
                    <span className="text-slate-300 font-semibold">{device.screenSize}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-orange-500/80" />
                    <span>Processor: <strong className="text-slate-300 font-bold">{detectProcessor(device.brand, device.model)}</strong></span>
                  </div>
                  <span>OS: {device.os} • Resolution: {device.resolution}</span>
                </div>
              </div>

              {/* Status footer */}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-850/60 text-[9px] text-slate-500">
                <span>Gyroscope: {device.gyroscope ? '✅ Hardware Enabled' : '❌ Disabled'}</span>
                <span className="text-indigo-400">Tactile verified</span>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Admin Panel add more device Form - RIGHT */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col gap-4">
        <div>
          <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-orange-500" />
            Add New Device
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isAdmin ? 'Administration database insert module' : 'Contribute specifications to community database'}
          </p>
        </div>

        {formSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Device Brand</label>
            <select
              value={adminBrand}
              onChange={(e) => setAdminBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
            >
              {BRANDS_LIST.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Model name</label>
            <input
              type="text"
              value={adminModel}
              onChange={(e) => setAdminModel(e.target.value)}
              placeholder="e.g., Phantom V Flip"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">RAM</label>
              <select
                value={adminRAM}
                onChange={(e) => setAdminRAM(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="2 GB">2 GB</option>
                <option value="3 GB">3 GB</option>
                <option value="4 GB">4 GB</option>
                <option value="6 GB">6 GB</option>
                <option value="8 GB">8 GB</option>
                <option value="12 GB">12 GB</option>
                <option value="16 GB">16 GB</option>
                <option value="24 GB">24 GB</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Refresh Rate</label>
              <select
                value={adminHZ}
                onChange={(e) => setAdminHZ(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="60Hz">60Hz</option>
                <option value="90Hz">90Hz</option>
                <option value="120Hz">120Hz</option>
                <option value="144Hz">144Hz</option>
                <option value="165Hz">165Hz</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Touch Sampling</label>
              <select
                value={adminTouch}
                onChange={(e) => setAdminTouch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="120Hz">120Hz</option>
                <option value="180Hz">180Hz</option>
                <option value="240Hz">240Hz</option>
                <option value="360Hz">360Hz</option>
                <option value="480Hz">480Hz</option>
                <option value="2500Hz">2500Hz</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Resolution</label>
              <input
                type="text"
                value={adminResolution}
                onChange={(e) => setAdminResolution(e.target.value)}
                placeholder="FHD+ / HD"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Screen Size</label>
              <input
                type="text"
                value={adminSize}
                onChange={(e) => setAdminSize(e.target.value)}
                placeholder='e.g., 6.8"'
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">OS</label>
              <input
                type="text"
                value={adminOS}
                onChange={(e) => setAdminOS(e.target.value)}
                placeholder="Android 14"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex justify-between items-center">
            <span className="font-semibold text-slate-400 text-[10px] uppercase">Hardware Gyro</span>
            <input
              type="checkbox"
              checked={adminGyro}
              onChange={(e) => setAdminGyro(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all mt-4 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'Registering...' : 'Register Specifications'}</span>
          </button>

        </form>
      </div>

    </div>
  );
}
