import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Cpu, 
  Sparkles, 
  Compass, 
  Play, 
  Info, 
  Save, 
  Check, 
  Flame, 
  Crosshair, 
  Smartphone,
  Zap,
  RotateCcw,
  BookOpen,
  User,
  Crown,
  ShieldAlert,
  Gamepad2,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  X,
  Wifi,
  Globe,
  Settings,
  Send,
  MessageCircle,
  Bookmark,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Device, SensitivityProfile, Weapon, UserProfile } from '../types';
import { BRANDS_LIST, DEVICE_MODELS_MAP, detectProcessor } from '../data/deviceModels';
import PerformanceHeatMap from './PerformanceHeatMap';
import SponsorAdPopup from './SponsorAdPopup';
import { trackMissionProgress } from '../utils';

interface EngineProps {
  userEmail?: string;
  currentUser?: UserProfile | null;
  onSaveSuccess?: () => void;
  weaponsList: Weapon[];
  devicesList: Device[];
  selectedDeviceFromDB: Device | null;
  clearSelectedDevice: () => void;
  selectedWeaponFromDB?: string | null;
  clearSelectedWeapon?: () => void;
  onToggleBookmark?: (type: 'preset' | 'product', id: string) => void;
  bookmarkedPresetIds?: string[];
}

export default function RecommendationEngine({ 
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
  bookmarkedPresetIds = []
}: EngineProps) {
  
  // Input fields state
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('Galaxy S24 Ultra');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');

  const [processor, setProcessor] = useState('Snapdragon 8 Gen 3');

  // Auto-detect processor dynamically whenever device selections or custom text changes
  const lastDetectedRef = useRef('');
  useEffect(() => {
    const currentDeviceKey = `${brand}::${isCustomModel ? customModelText : model}`;
    if (lastDetectedRef.current !== currentDeviceKey) {
      const detected = detectProcessor(brand, isCustomModel ? customModelText : model);
      setProcessor(detected);
      lastDetectedRef.current = currentDeviceKey;
    }
  }, [brand, model, customModelText, isCustomModel]);
  const [os, setOs] = useState('Android 14');
  const [ram, setRam] = useState('12 GB');
  const [refreshRate, setRefreshRate] = useState('120Hz');
  const [touchSamplingRate, setTouchSamplingRate] = useState('240Hz');
  const [resolution, setResolution] = useState('QHD+');
  const [screenSize, setScreenSize] = useState('6.8"');
  const [gyroscope, setGyroscope] = useState(true);
  const [internetQuality, setInternetQuality] = useState('Excellent');
  const [hudLayout, setHudLayout] = useState('Claw Balanced');
  
  const [fingerSetup, setFingerSetup] = useState<'2-Finger' | '3-Finger' | '4-Finger' | '5-Finger'>('3-Finger');
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Professional'>('Intermediate');

  // Multi-select lists states (Default play styles exactly as requested)
  const [selectedPlayStyles, setSelectedPlayStyles] = useState<string[]>(['Balanced']);
  const [selectedGameModes, setSelectedGameModes] = useState<string[]>(['Battle Royale']);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);

  // Outputs state
  const [output, setOutput] = useState<SensitivityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [saved, setSaved] = useState(false);

  // History state for trend chart
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) return;
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/recommend/history/${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setHistoryData(data || []);
        }
      } catch (err) {
        console.error('Failed to load history for trend chart:', err);
      } finally {
        setTimeout(() => {
          setLoadingHistory(false);
        }, 500); // graceful minimal animation transition time
      }
    };
    fetchHistory();
  }, [userEmail, output]);

  const getChartData = () => {
    const activeVal = output ? output.general : 85;
    const activeRedDot = output ? output.redDot : 90;
    
    const baseData = [
      { name: 'Initial', userGeneral: Math.round(activeVal * 0.8), userRedDot: Math.round(activeRedDot * 0.82), globalAvg: 95 },
      { name: 'Calib #1', userGeneral: Math.round(activeVal * 0.88), userRedDot: Math.round(activeRedDot * 0.85), globalAvg: 95 },
      { name: 'Calib #2', userGeneral: Math.round(activeVal * 0.93), userRedDot: Math.round(activeRedDot * 0.91), globalAvg: 95 },
      { name: 'Calib #3', userGeneral: Math.round(activeVal * 0.96), userRedDot: Math.round(activeRedDot * 0.94), globalAvg: 95 },
      { name: 'Optimized', userGeneral: activeVal, userRedDot: activeRedDot, globalAvg: 95 },
    ];

    if (historyData && historyData.length > 1) {
      const sortedHistory = [...historyData]
        .reverse()
        .slice(-6);
      
      return sortedHistory.map((h, i) => ({
        name: `Calib #${i + 1}`,
        userGeneral: h.general,
        userRedDot: h.redDot,
        globalAvg: 95
      }));
    }

    return baseData;
  };

  // Presets State
  const [presets, setPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any | null>(null);

  // Preset Form State
  const [presetName, setPresetName] = useState('');
  const [presetBrand, setPresetBrand] = useState('Samsung');
  const [presetModel, setPresetModel] = useState('Galaxy S24 Ultra');
  const [presetGeneral, setPresetGeneral] = useState(100);
  const [presetRedDot, setPresetRedDot] = useState(95);
  const [presetScope2x, setPresetScope2x] = useState(90);
  const [presetScope4x, setPresetScope4x] = useState(85);
  const [presetSniper, setPresetSniper] = useState(55);
  const [presetFreeLook, setPresetFreeLook] = useState(75);
  const [presetPlayStyle, setPresetPlayStyle] = useState('Tapper, Sniper');
  const [presetGameMode, setPresetGameMode] = useState('Clash Squad, CS Ranked');
  const [presetDesc, setPresetDesc] = useState('');
  const [presetStatus, setPresetStatus] = useState('published');

  // Guest share tracking states
  const [guestShareCount, setGuestShareCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showForcedVideoAd, setShowForcedVideoAd] = useState(false);
  const [hasWatchedVideoAd, setHasWatchedVideoAd] = useState(false);

  // Quick Setup Walkthrough states
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [showWalkthroughBanner, setShowWalkthroughBanner] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('ghostcore_walkthrough_completed');
    if (completed !== 'true') {
      setShowWalkthroughBanner(true);
    }
  }, []);

  const selectPopularDevice = (b: string, m: string) => {
    setBrand(b);
    setModel(m);
    setIsCustomModel(false);
    const modelsList = DEVICE_MODELS_MAP[b] || [];
    const found = modelsList.find(x => x.model === m);
    if (found) {
      setOs(found.os);
      setRam(found.ram);
      setRefreshRate(found.refreshRate);
      setTouchSamplingRate(found.touchSamplingRate);
      setResolution(found.resolution);
      setScreenSize(found.screenSize);
      setGyroscope(found.gyroscope);
      const detectedProc = detectProcessor(b, m);
      setProcessor(detectedProc);
    }
  };

  // Check roles
  const isPlatformAdmin = userEmail === 'ghostfirehub@gmail.com' || currentUser?.role === 'Administrator' || currentUser?.role === 'Staff';
  const isPremiumUser = currentUser?.isPremium || isPlatformAdmin;

  const loadingSteps = [
    "Scanning Device...",
    "Reading Hardware...",
    "Detecting Touch Characteristics...",
    "Analyzing Play Style...",
    "Processing Weapon Preferences...",
    "Calculating GhostCore™ Parameters...",
    "Optimizing Sensitivity...",
    "Finalizing Profile..."
  ];

  // Fetch presets on load
  const fetchPresets = async () => {
    try {
      setLoadingPresets(true);
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch presets:', err);
    } finally {
      setLoadingPresets(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  // Auto-populate first weapons on load if list is loaded
  useEffect(() => {
    if (weaponsList && weaponsList.length > 0 && selectedWeapons.length === 0) {
      setSelectedWeapons([weaponsList[0].name]);
    }
  }, [weaponsList]);

  // Handle selected device from specifications directory page
  useEffect(() => {
    if (selectedDeviceFromDB) {
      setBrand(selectedDeviceFromDB.brand);
      setModel(selectedDeviceFromDB.model);
      setIsCustomModel(false);
      setOs(selectedDeviceFromDB.os);
      setRam(selectedDeviceFromDB.ram);
      setRefreshRate(selectedDeviceFromDB.refreshRate);
      setTouchSamplingRate(selectedDeviceFromDB.touchSamplingRate);
      setResolution(selectedDeviceFromDB.resolution);
      setScreenSize(selectedDeviceFromDB.screenSize);
      setGyroscope(selectedDeviceFromDB.gyroscope);
      // Auto-detect processor
      const detectedProc = detectProcessor(selectedDeviceFromDB.brand, selectedDeviceFromDB.model);
      setProcessor(detectedProc);
      clearSelectedDevice();
    }
  }, [selectedDeviceFromDB]);

  // Handle selected weapon from specifications catalog page
  useEffect(() => {
    if (selectedWeaponFromDB && clearSelectedWeapon) {
      // Toggle or insert weapon into selected list
      if (!selectedWeapons.includes(selectedWeaponFromDB)) {
        // Multi-select supports up to 7 weapons, reset to this one as primary
        setSelectedWeapons([selectedWeaponFromDB]);
      }
      clearSelectedWeapon();
    }
  }, [selectedWeaponFromDB]);

  // Handle brand dropdown triggers
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const modelsList = DEVICE_MODELS_MAP[newBrand] || [];
    if (modelsList.length > 0) {
      const firstModel = modelsList[0];
      setModel(firstModel.model);
      setIsCustomModel(false);
      setOs(firstModel.os);
      setRam(firstModel.ram);
      setRefreshRate(firstModel.refreshRate);
      setTouchSamplingRate(firstModel.touchSamplingRate);
      setResolution(firstModel.resolution);
      setScreenSize(firstModel.screenSize);
      setGyroscope(firstModel.gyroscope);
      // Auto-detect processor
      const detectedProc = detectProcessor(newBrand, firstModel.model);
      setProcessor(detectedProc);
    } else {
      setModel('Custom Model');
      setIsCustomModel(true);
      setCustomModelText('');
    }
  };

  // Handle individual model dropdown triggers
  const handleModelChange = (selectedModel: string) => {
    if (selectedModel === 'custom-other') {
      setIsCustomModel(true);
      setModel('Custom Model');
    } else {
      setIsCustomModel(false);
      setModel(selectedModel);
      const modelsList = DEVICE_MODELS_MAP[brand] || [];
      const found = modelsList.find(m => m.model === selectedModel);
      if (found) {
        setOs(found.os);
        setRam(found.ram);
        setRefreshRate(found.refreshRate);
        setTouchSamplingRate(found.touchSamplingRate);
        setResolution(found.resolution);
        setScreenSize(found.screenSize);
        setGyroscope(found.gyroscope);
        // Auto-detect processor
        const detectedProc = detectProcessor(brand, selectedModel);
        setProcessor(detectedProc);
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent, bypassCheck = false) => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent duplicate clicks

    // Require unregistered guest to watch a promotional ad first!
    if (!userEmail && !bypassCheck && !hasWatchedVideoAd) {
      setShowForcedVideoAd(true);
      return;
    }

    // Require unregistered guest to share 1 time first!
    if (!userEmail && !bypassCheck && guestShareCount < 1) {
      setShowShareModal(true);
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Dynamic timer sequence for the high-fidelity tactical progress analysis (8 distinct steps)
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= 7) {
          clearInterval(stepInterval);
          return 7;
        }
        return prev + 1;
      });
    }, 550);

    const actualModelName = isCustomModel ? (customModelText || 'Custom Model') : model;
    const finalPlayStylesStr = selectedPlayStyles.length > 0 ? selectedPlayStyles.join(', ') : 'Balanced';
    const finalGameModesStr = selectedGameModes.length > 0 ? selectedGameModes.join(', ') : 'Battle Royale';
    const finalWeaponsStr = selectedWeapons.length > 0 ? selectedWeapons.join(', ') : 'General Weapons';

    try {
      // Trigger backend recommendation generator
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model: actualModelName,
          processor,
          os,
          ram,
          refreshRate,
          touchSamplingRate,
          resolution,
          screenSize,
          gyroscope,
          internetQuality,
          hudLayout,
          fingerSetup,
          playStyle: finalPlayStylesStr,
          gameMode: finalGameModesStr,
          chosenWeapon: finalWeaponsStr,
          experience,
          email: userEmail || '',
          benchmarkFps: currentUser?.benchmarkFps,
          benchmarkTouchLatency: currentUser?.benchmarkTouchLatency
        })
      });

      const data = await response.json();
      
      // Keep loading active for beautiful immersive tactical animations across all 8 steps
      setTimeout(() => {
        clearInterval(stepInterval);
        if (response.ok) {
          setOutput(data);
          if (onSaveSuccess && userEmail) {
            onSaveSuccess();
          }
          if (userEmail) {
            trackMissionProgress(userEmail, 'calibrate');
          }
        }
        setLoading(false);
      }, 4500);

    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleGuestShare = (channel: 'whatsapp' | 'telegram') => {
    const text = 'I just calibrated my Free Fire sensitivity using GhostCore™ AI! Calibrate your phone for free at:';
    const url = 'https://ghostfirehub.com';
    let shareUrl = '';
    
    if (channel === 'whatsapp') {
      // Must open Web WhatsApp and go to share to group
      shareUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    } else {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    }
    
    window.open(shareUrl, '_blank');
    
    setGuestShareCount(prev => {
      const next = Math.min(prev + 1, 1);
      if (next >= 1) {
        setTimeout(() => {
          setShowShareModal(false);
          // Trigger the actual calibration now that they shared 1 time!
          handleGenerate(undefined, true);
        }, 1200);
      }
      return next;
    });
  };

  const saveCurrentToProfile = async () => {
    if (!userEmail || !output) return;
    setSaved(true);
    trackMissionProgress(userEmail, 'save_sens');
    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const exportPDFReport = () => {
    if (!output) return;
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [15, 23, 42]; // Slate 900
      const secondaryColor = [249, 115, 22]; // Orange 500
      const textColor = [51, 65, 85]; // Slate 700
      const headingColor = [15, 23, 42]; // Slate 900

      // 1. Header block background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, 12, 180, 26, 'F');

      // Header Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("GHOSTCORE(TM) AI HARDWARE CALIBRATION REPORT", 20, 22);

      // Header Tagline
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // light gray
      doc.text("High-Precision Device Performance & Game-Engine Sensitivity Matrix", 20, 29);

      // Confidence badge
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(153, 19, 36, 12, 'F');
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`${output.confidenceScore}% ACCURACY`, 156, 27);

      // Metadata & Generation info
      const dateStr = new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate 500
      doc.text(`Generated on: ${dateStr}`, 15, 45);
      
      const accountStr = userEmail ? `Account: ${userEmail}` : "Account: Guest Player (Standard calibration)";
      doc.text(accountStr, 15, 49);

      // Section 1: DEVICE COMPUTE SPECIFICATIONS
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(headingColor[0], headingColor[1], headingColor[2]);
      doc.text("1. ACTIVE DEVICE HARDWARE PROFILE", 15, 58);
      
      // Draw orange separator line
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(15, 60, 180, 0.8, 'F');

      // Helper grid drawing
      doc.setFontSize(9);
      
      // Rows metadata
      const actualModel = isCustomModel ? (customModelText || 'Custom Model') : model;
      
      const leftColumn = [
        { label: "Device Model", value: `${brand} ${actualModel}` },
        { label: "Processor/Chipset", value: processor },
        { label: "System Memory (RAM)", value: ram },
        { label: "Operating System", value: os }
      ];

      const rightColumn = [
        { label: "Display Refresh Rate", value: refreshRate },
        { label: "Touch Polling Rate", value: touchSamplingRate },
        { label: "Screen Configuration", value: `${resolution} (${screenSize})` },
        { label: "Hardware Gyroscope", value: gyroscope ? "Active / Dedicated IMU" : "Not Detected (Software Emulation)" }
      ];

      let currentY = 68;
      for (let i = 0; i < leftColumn.length; i++) {
        // Left Col
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(leftColumn[i].label, 15, currentY);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(leftColumn[i].value), 55, currentY);

        // Right Col
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(rightColumn[i].label, 110, currentY);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(rightColumn[i].value), 148, currentY);

        // subtle separator line
        if (i < leftColumn.length - 1) {
          doc.setDrawColor(241, 245, 249);
          doc.line(15, currentY + 3, 195, currentY + 3);
        }
        currentY += 8;
      }

      // Section 2: GHOSTCORE(TM) SENSITIVITY CALIBRATION
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(headingColor[0], headingColor[1], headingColor[2]);
      doc.text("2. GHOSTCORE(TM) ENGINE SENSITIVITY CALIBRATION", 15, 107);
      
      // Draw orange separator line
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(15, 109, 180, 0.8, 'F');

      const sensitivitySettings = [
        { key: "General", val: output.general, desc: "Controls all general camera swipes, tracking speeds, and overall response." },
        { key: "Red Dot", val: output.redDot, desc: "Calibrated precision speed for un-scoped aiming and red dot sights." },
        { key: "2x Scope", val: output.scope2x, desc: "Optimal baseline ratio for medium-range target tracking and recoil." },
        { key: "4x Scope", val: output.scope4x, desc: "Advanced magnification friction dampening for long-range sprays." },
        { key: "Sniper Scope", val: output.sniper, desc: "Ultra-fine physical travel multipliers designed for steady drag shots." },
        { key: "Free Look", val: output.freeLook, desc: "Independent ocular tracking speed for dynamic spatial awareness." }
      ];

      let sensY = 117;
      for (const sens of sensitivitySettings) {
        // Label
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(sens.key, 15, sensY);

        // Value
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(String(sens.val), 55, sensY);

        // Visual slider bar
        // Background track
        doc.setFillColor(241, 245, 249); // slate 100
        doc.rect(70, sensY - 3.2, 100, 4, 'F');
        // Active track
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        const barWidth = (sens.val / 200) * 100; // max value is 200
        doc.rect(70, sensY - 3.2, barWidth, 4, 'F');

        // Description
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(sens.desc, 15, sensY + 4);

        // divider
        doc.setDrawColor(241, 245, 249);
        doc.line(15, sensY + 6.5, 195, sensY + 6.5);

        sensY += 12;
      }

      // Section 3: AI DIAGNOSTIC ANALYSIS
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(headingColor[0], headingColor[1], headingColor[2]);
      doc.text("3. AI-POWERED PERFORMANCE DIAGNOSTIC ANALYSIS", 15, 196);
      
      // Draw orange separator line
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(15, 198, 180, 0.8, 'F');

      // Box background for diagnostic text
      doc.setFillColor(255, 247, 237); // extremely light warm orange background
      doc.setDrawColor(254, 215, 170); // orange 200 border
      doc.rect(15, 203, 180, 64, 'FD');

      // Header in Box
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(234, 88, 12); // deep warm orange
      doc.text("GHOSTCORE(TM) HARDWARE DIAGNOSTICS & SYSTEM REMEDY:", 20, 209);

      // Diagnostics text split to size (170mm width)
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate 700
      const lines = doc.splitTextToSize(output.explanation, 170);
      let diagY = 215;
      for (let j = 0; j < Math.min(lines.length, 9); j++) {
        doc.text(lines[j], 20, diagY);
        diagY += 4.8;
      }

      // Footer
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("GHOSTCORE(TM) CHIPSET SENSITIVITY CALIBRATOR", 15, 282);
      doc.setFont("Helvetica", "normal");
      doc.text("|   Optimized for Free Fire Mobile Engine v4.2   |   www.ghostfirehub.com", 85, 282);
      
      doc.setFont("Helvetica", "bold");
      doc.text("CONFIDENTIAL - PASSIVE PLAYBACK OK", 155, 282);

      // Save PDF
      const filename = `GhostCore_${brand}_${actualModel.replace(/\s+/g, '_')}_Calibration.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  // Save Generated Profile as a Global Preset (Admin action)
  const saveGeneratedAsPreset = async () => {
    if (!output) return;
    const actualModelName = isCustomModel ? (customModelText || 'Custom Model') : model;
    const finalPlayStylesStr = selectedPlayStyles.length > 0 ? selectedPlayStyles.join(', ') : 'Balanced';
    const finalGameModesStr = selectedGameModes.length > 0 ? selectedGameModes.join(', ') : 'Battle Royale';
    
    try {
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${brand} ${actualModelName} Optimized Config`,
          deviceBrand: brand,
          deviceModel: actualModelName,
          general: output.general,
          redDot: output.redDot,
          scope2x: output.scope2x,
          scope4x: output.scope4x,
          sniper: output.sniper,
          freeLook: output.freeLook,
          playStyle: finalPlayStylesStr,
          gameMode: finalGameModesStr,
          description: `Custom calculated preset published via Administrator on the fly. Fits ${brand} specifications.`,
          status: 'published'
        })
      });

      if (res.ok) {
        alert('Successfully published as a Global Preset Calibration!');
        fetchPresets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Determine current user's tactical access authorization level
  const getAccessLevelInfo = () => {
    if (isPlatformAdmin) {
      return {
        label: 'System Administrator Override',
        color: 'text-red-400 border-red-500/30 bg-red-500/5 ring-1 ring-red-500/30',
        badge: 'ADMIN',
        icon: <ShieldAlert className="w-4 h-4" />
      };
    }
    if (isPremiumUser) {
      return {
        label: 'Premium GhostCore™ VIP Member',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/30',
        badge: 'PRO',
        icon: <Crown className="w-4 h-4 fill-current" />
      };
    }
    if (userEmail) {
      return {
        label: 'Registered Tactical Member',
        color: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
        badge: 'STANDARD',
        icon: <Sparkles className="w-4 h-4" />
      };
    }
    return {
      label: 'Registered Guest Tier',
      color: 'text-slate-400 border-slate-800 bg-slate-900/50',
      badge: 'BASIC',
      icon: <User className="w-4 h-4" />
    };
  };

  const accessLevel = getAccessLevelInfo();

  // Multi-select togglers
  const togglePlayStyle = (style: string) => {
    if (selectedPlayStyles.includes(style)) {
      if (selectedPlayStyles.length > 1) {
        setSelectedPlayStyles(selectedPlayStyles.filter(s => s !== style));
      }
    } else {
      setSelectedPlayStyles([...selectedPlayStyles, style]);
    }
  };

  const toggleGameMode = (mode: string) => {
    if (selectedGameModes.includes(mode)) {
      if (selectedGameModes.length > 1) {
        setSelectedGameModes(selectedGameModes.filter(m => m !== mode));
      }
    } else {
      setSelectedGameModes([...selectedGameModes, mode]);
    }
  };

  const toggleWeapon = (weaponName: string) => {
    if (selectedWeapons.includes(weaponName)) {
      if (selectedWeapons.length > 1) {
        setSelectedWeapons(selectedWeapons.filter(w => w !== weaponName));
      }
    } else {
      setSelectedWeapons([...selectedWeapons, weaponName]);
    }
  };

  const loadPresetIntoInputs = (preset: any) => {
    setBrand(preset.deviceBrand);
    setModel(preset.deviceModel);
    setIsCustomModel(false);
    
    // Set matching or default specs
    const modelsList = DEVICE_MODELS_MAP[preset.deviceBrand] || [];
    const found = modelsList.find(m => m.model === preset.deviceModel);
    if (found) {
      setOs(found.os);
      setRam(found.ram);
      setRefreshRate(found.refreshRate);
      setTouchSamplingRate(found.touchSamplingRate);
      setResolution(found.resolution);
      setScreenSize(found.screenSize);
      setGyroscope(found.gyroscope);
    }

    // Set styles & modes from preset
    if (preset.playStyle) {
      setSelectedPlayStyles(preset.playStyle.split(',').map((s: string) => s.trim()));
    }
    if (preset.gameMode) {
      setSelectedGameModes(preset.gameMode.split(',').map((s: string) => s.trim()));
    }

    // Directly set calculated output to match preset
    setOutput({
      general: preset.general,
      redDot: preset.redDot,
      scope2x: preset.scope2x,
      scope4x: preset.scope4x,
      sniper: preset.sniper,
      freeLook: preset.freeLook,
      confidenceScore: 98,
      explanation: `Loaded directly from preset config: "${preset.name}". \n\n${preset.description}`,
      created_at: preset.created_at || new Date().toISOString()
    });

    // Smooth scroll down to output if mobile
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handlePresetFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingPreset;
    const url = isEdit ? `/api/presets/${editingPreset.id}` : '/api/presets';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName,
          deviceBrand: presetBrand,
          deviceModel: presetModel,
          general: presetGeneral,
          redDot: presetRedDot,
          scope2x: presetScope2x,
          scope4x: presetScope4x,
          sniper: presetSniper,
          freeLook: presetFreeLook,
          playStyle: presetPlayStyle,
          gameMode: presetGameMode,
          description: presetDesc,
          status: presetStatus
        })
      });

      if (res.ok) {
        fetchPresets();
        setShowPresetForm(false);
        setEditingPreset(null);
        // Reset form
        setPresetName('');
        setPresetDesc('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save preset config');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPresetClick = (preset: any) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetBrand(preset.deviceBrand);
    setPresetModel(preset.deviceModel);
    setPresetGeneral(preset.general);
    setPresetRedDot(preset.redDot);
    setPresetScope2x(preset.scope2x);
    setPresetScope4x(preset.scope4x);
    setPresetSniper(preset.sniper);
    setPresetFreeLook(preset.freeLook);
    setPresetPlayStyle(preset.playStyle);
    setPresetGameMode(preset.gameMode);
    setPresetDesc(preset.description);
    setPresetStatus(preset.status);
    setShowPresetForm(true);
  };

  const handleDeletePresetClick = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this preset?')) return;
    try {
      const res = await fetch(`/api/presets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPresets();
      } else {
        alert('Failed to delete preset');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const modelsListForSelectedBrand = DEVICE_MODELS_MAP[brand] || [];

  return (
    <div className="space-y-6">
      {/* Walkthrough Greeting Banner */}
      {showWalkthroughBanner && (
        <div className="bg-gradient-to-r from-orange-950/35 via-slate-900/90 to-slate-950/90 border border-orange-500/20 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl backdrop-blur-md animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-orange-400" /> New User Guide
              </span>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">GhostCore™ Quick Setup Walkthrough</h3>
            </div>
            <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
              New to the platform? Learn how to automatically calibrate your game sensitivity by selecting calibrated models from our devices database, fine-tuning your touch configurations, and downloading professional PDF reports!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setWalkthroughStep(0);
                setShowWalkthrough(true);
              }}
              className="py-2 px-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 hover:text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/10"
            >
              Start Walkthrough
            </button>
            <button
              type="button"
              onClick={() => {
                setShowWalkthroughBanner(false);
                localStorage.setItem('ghostcore_walkthrough_completed', 'true');
              }}
              className="py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 uppercase font-bold text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Questionnaire Form - LEFT/TOP */}
      <form onSubmit={handleGenerate} className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col gap-5 relative">
        
        {/* Animated AI Analysis Screen Overlay when generating */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-3xl z-40 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            {/* Pulsing circular grid radar */}
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-orange-500/10 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border border-orange-500/20 animate-pulse"></div>
              <div className="absolute inset-6 rounded-full border border-orange-500/30"></div>
              <Cpu className="w-10 h-10 text-orange-500 animate-spin [animation-duration:8s]" />
              
              {/* Dynamic crosshair elements */}
              <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full top-0 left-1/2 -translate-x-1/2"></div>
              <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full bottom-0 left-1/2 -translate-x-1/2"></div>
              <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full left-0 top-1/2 -translate-y-1/2"></div>
              <div className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full right-0 top-1/2 -translate-y-1/2"></div>
            </div>

            <div className="space-y-4 max-w-sm w-full">
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-3 py-1 rounded-full uppercase font-black tracking-widest animate-pulse">
                Simulation Running
              </span>
              <h3 className="text-md font-black text-white uppercase tracking-tight">GhostCore™ Calibration</h3>
              
              {/* Step indicators - exactly 8 steps */}
              <div className="flex flex-col gap-2 text-left text-xs bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono">
                {loadingSteps.map((step, idx) => {
                  const isActive = loadingStep === idx;
                  const isCompleted = loadingStep > idx;
                  return (
                    <div 
                      key={step} 
                      className={`flex items-center gap-2.5 transition-all duration-300 ${
                        isActive ? 'text-orange-400 font-bold scale-[1.01]' : isCompleted ? 'text-emerald-500 opacity-60' : 'text-slate-600'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                        isActive ? 'border-orange-500 text-orange-400 animate-pulse' : isCompleted ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-slate-800 text-slate-600'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 via-red-600 to-amber-500 rounded-full transition-all duration-300 ease-out animate-pulse" 
                  style={{ width: `${((loadingStep + 1) / 8) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500">Processing simulation matrix. Standby...</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center pb-2 border-b border-slate-800/80 gap-2">
          <div>
            <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-500" />
              Device Specifications
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select your exact smartphone model or enter specifications manually</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setWalkthroughStep(0);
                setShowWalkthrough(true);
              }}
              className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer border border-orange-500/20 bg-orange-500/5 px-2.5 py-1 rounded-xl hover:border-orange-500/40 transition-all"
            >
              <Sparkles className="w-3 h-3 text-orange-400" />
              Quick Guide
            </button>
            <button
              type="button"
              onClick={() => {
                setBrand('Samsung');
              setModel('Galaxy S24 Ultra');
              setProcessor('Snapdragon 8 Gen 3');
              setIsCustomModel(false);
              setOs('Android 14');
              setRam('12 GB');
              setRefreshRate('120Hz');
              setTouchSamplingRate('240Hz');
              setResolution('QHD+');
              setScreenSize('6.8"');
              setGyroscope(true);
              setInternetQuality('Excellent');
              setHudLayout('Claw Balanced');
            }}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Specs
          </button>
          </div>
        </div>

        {/* Brand and Model Selector */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Device Brand</label>
            <select
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              {BRANDS_LIST.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Model Select</label>
            <select
              value={isCustomModel ? 'custom-other' : model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              {modelsListForSelectedBrand.map(m => (
                <option key={m.model} value={m.model}>{m.model}</option>
              ))}
              <option value="custom-other">-- Other / Custom Model --</option>
            </select>
          </div>
        </div>

        {/* Custom model text field if selected Custom */}
        {isCustomModel && (
          <div className="space-y-1 animate-slideIn">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Input Custom Model Name</label>
            <input
              type="text"
              value={customModelText}
              onChange={(e) => setCustomModelText(e.target.value)}
              placeholder="e.g., Spark 20 Pro Plus"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        )}

        {/* Processor Selector */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Mobile Processor / SoC</label>
            <span className="text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shrink-0">
              <Cpu className="w-3 h-3 text-orange-400" /> Auto-Detected
            </span>
          </div>
          <input
            type="text"
            value={processor}
            onChange={(e) => setProcessor(e.target.value)}
            placeholder="Auto-detecting chipset..."
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder-slate-700 font-mono"
          />
        </div>

        {/* RAM, Refresh Rate, Touch sampling */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">RAM Capacity</label>
            <select
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
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

          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Refresh Rate</label>
            <select
              value={refreshRate}
              onChange={(e) => setRefreshRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="60Hz">60 Hz</option>
              <option value="90Hz">90 Hz</option>
              <option value="120Hz">120 Hz</option>
              <option value="144Hz">144 Hz</option>
              <option value="165Hz">165 Hz</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Touch Sampling</label>
            <select
              value={touchSamplingRate}
              onChange={(e) => setTouchSamplingRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="120Hz">120 Hz</option>
              <option value="180Hz">180 Hz</option>
              <option value="240Hz">240 Hz</option>
              <option value="360Hz">360 Hz</option>
              <option value="480Hz">480 Hz</option>
              <option value="2500Hz">2500 Hz</option>
            </select>
          </div>
        </div>

        {/* OS, Resolution, Size */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Android/OS Version</label>
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer animate-fadeIn"
            >
              <option value="Android 10">Android 10</option>
              <option value="Android 11">Android 11</option>
              <option value="Android 12">Android 12</option>
              <option value="Android 13">Android 13</option>
              <option value="Android 14">Android 14</option>
              <option value="Android 15">Android 15</option>
              <option value="iOS 15">iOS 15</option>
              <option value="iOS 16">iOS 16</option>
              <option value="iOS 17">iOS 17</option>
              <option value="iOS 18">iOS 18</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Resolution</label>
            <input
              type="text"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="FHD+ / QHD+"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Screen Size</label>
            <input
              type="text"
              value={screenSize}
              onChange={(e) => setScreenSize(e.target.value)}
              placeholder='e.g. 6.7"'
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Gyroscope and Network Quality */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-3 flex justify-between items-center h-full">
            <div>
              <div className="text-xs font-semibold text-slate-200">Gyroscope Sensor</div>
              <p className="text-[9px] text-slate-500 mt-0.5">Physical tilt adjustments</p>
            </div>
            <input
              type="checkbox"
              checked={gyroscope}
              onChange={(e) => setGyroscope(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-orange-500"
            />
          </div>

          <div className="space-y-1">
            <select
              value={internetQuality}
              onChange={(e) => setInternetQuality(e.target.value)}
              className="w-full h-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors cursor-pointer flex items-center"
            >
              <option value="Excellent">⚡ Excellent Ping (5-20ms)</option>
              <option value="Good">🟢 Good Connection (25-60ms)</option>
              <option value="Average">🟡 Average Signal (70-120ms)</option>
              <option value="Poor">🔴 Poor Ping / Lag (150ms+)</option>
            </select>
          </div>
        </div>

        {/* Preference Settings Header */}
        <div className="pt-3 border-t border-slate-800/80">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Tactical Preferences
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Optimize based on active gameplay modes, weapons and HUD layouts</p>
        </div>

        {/* Finger Setup & HUD Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Finger Setup</label>
            <select
              value={fingerSetup}
              onChange={(e) => setFingerSetup(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="2-Finger">2-Finger (Thumbs)</option>
              <option value="3-Finger">3-Finger Claw</option>
              <option value="4-Finger">4-Finger Advanced</option>
              <option value="5-Finger">5-Finger Esports Pro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Active HUD Profile</label>
            <select
              value={hudLayout}
              onChange={(e) => setHudLayout(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="Classic HUD">Classic HUD Layout</option>
              <option value="Claw Balanced">Claw Balanced</option>
              <option value="Speed Trigger Pro">Speed Trigger Pro</option>
              <option value="Double Fire Matrix">Double Fire Matrix</option>
            </select>
          </div>
        </div>

        {/* Multiple Playstyles Select Badges - Prominently Displaying Requested 5 */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
            Play Style Optimization (Select one or multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {['Tapper', 'Spammer', 'Tap & Spam Hybrid', 'Sniper', 'Balanced'].map(style => {
              const isSelected = selectedPlayStyles.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => togglePlayStyle(style)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-mono transition-all uppercase cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-orange-600 border-orange-500 text-slate-950 font-black ring-2 ring-orange-500/20' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-850'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>}
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Mode optimization select badges */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
            Game Mode Optimization (Select one or multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {['Battle Royale', 'Clash Squad', 'CS Ranked', 'Lone Wolf', 'Headshot Room', 'Custom Room', 'Training Ground'].map(mode => {
              const isSelected = selectedGameModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleGameMode(mode)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-mono transition-all uppercase cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-black ring-2 ring-amber-500/20' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-850'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>}
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred weapons multiple badges selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
            Preferred Weapons Catalog (Combined Multi-Select)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {weaponsList.map(w => {
              const isSelected = selectedWeapons.includes(w.name);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWeapon(w.name)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-14 ${
                    isSelected 
                      ? 'bg-slate-950 border-orange-500 text-orange-400 ring-1 ring-orange-500/30' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:border-slate-850'
                  }`}
                >
                  <span className="text-sm absolute right-1.5 top-1 opacity-70">
                    {w.image && (w.image.startsWith('http') || w.image.startsWith('/')) ? (
                      <img 
                        src={w.image} 
                        alt={w.name}
                        className="w-5 h-5 object-cover rounded-md" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      w.image || '🔫'
                    )}
                  </span>
                  <div className="text-[10px] font-bold truncate pr-6 text-slate-300">{w.name}</div>
                  <div className="text-[8px] uppercase tracking-widest font-mono text-slate-500">{w.category}</div>
                  {isSelected && (
                    <div className="absolute bottom-1 right-1.5 text-orange-500">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-slate-950" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Select */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Your Tactical Experience</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-orange-500 transition-colors cursor-pointer"
          >
            <option value="Beginner">Beginner (Tactile Smoothing)</option>
            <option value="Intermediate">Intermediate (Standard Deviation)</option>
            <option value="Professional">Professional (Esports Custom Tolerances)</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-600 via-red-600 to-amber-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-red-600/10 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Flame className="w-4.5 h-4.5 text-slate-950" />
          <span>Launch GhostCore™ Analysis</span>
        </button>
      </form>

      {/* Results Display Panel - RIGHT/BOTTOM */}
      <section className="lg:col-span-6 flex flex-col gap-6">
        
        {/* Access Level Authorization Card */}
        <div className={`p-4 rounded-3xl border backdrop-blur-md flex items-center justify-between transition-all ${accessLevel.color}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950/80 rounded-2xl border border-current">
              {accessLevel.icon}
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500">Calibration Access Status</span>
              <h3 className="text-xs font-black text-white uppercase tracking-tight mt-0.5">{accessLevel.label}</h3>
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-mono bg-slate-950/60 px-3 py-1 rounded-full border border-current">
            {accessLevel.badge}
          </span>
        </div>

        {output ? (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 animate-fadeIn">
            {/* Corner highlight */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {currentUser?.benchmarkTouchLatency !== undefined && currentUser?.benchmarkFps !== undefined && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-orange-400 font-extrabold uppercase tracking-wider block">PREMIUM QUANTUM BENCHMARK CALIBRATION ACTIVE</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Sensitivity engine adjustments optimized based on measured hardware. Pacing: <strong className="text-white">{currentUser.benchmarkFps}Hz</strong> | Input delay: <strong className="text-white">{currentUser.benchmarkTouchLatency}ms</strong>.
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Active
                </div>
              </div>
            )}

            <div className="flex justify-between items-start pb-4 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-1 rounded uppercase font-bold flex items-center gap-1.5 w-max">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" /> GhostCore™ AI Results
                </span>
                <h3 className="text-md font-extrabold text-white mt-1.5 uppercase tracking-tight">Active Calibration Parameters</h3>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Confidence</span>
                <span className="text-2xl font-black font-mono text-orange-400">{output.confidenceScore}%</span>
                {output.confidenceScore === 35 && (
                  <span className="text-[8px] text-amber-500 font-mono font-bold uppercase tracking-wider animate-pulse bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1">
                    Simulating 50%
                  </span>
                )}
              </div>
            </div>

            {/* Sensitivity Sliders Grid - Max value 200 */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">General Sensitivity</span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.general : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.general / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-orange-600 to-amber-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Red Dot Aim Assist</span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.redDot : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.redDot / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-orange-600 to-amber-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">2× Scope Sensi</span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.scope2x : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.scope2x / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-orange-600 to-amber-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">4× Scope Sensi</span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.scope4x : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.scope4x / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-orange-600 to-amber-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl col-span-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-red-500" /> Sniper Scope Calibration
                  </span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.sniper : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.sniper / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-red-600 to-orange-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl col-span-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Free Look (360° Cam)</span>
                  <span className="font-mono font-bold text-white text-sm">{isPremiumUser ? output.freeLook : '🔒 Locked'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: `${isPremiumUser ? (output.freeLook / 200) * 100 : 12}%` }} className={`h-full bg-gradient-to-r ${isPremiumUser ? 'from-orange-600 to-amber-500' : 'from-slate-700 to-slate-800'} rounded-full`}></div>
                </div>
              </div>

              {!isPremiumUser && (
                <div className="bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4 shadow-xl col-span-2 mt-2">
                  <div className="flex justify-center">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full animate-pulse">
                      <Crown className="w-6 h-6 fill-amber-500/20 text-amber-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">💎 Diamond Champion License Required</h4>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      You are running on a Free calibrator license. To unlock precision micro-stutter tracking, thermal diagnostics, and premium calibration matrices, upgrade to the elite Diamond Champion status.
                    </p>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                    Contact our Administrator directly on WhatsApp / Telegram for manual activation!
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const contactMsg = "Hello GhostFireHub Admin! I would like to upgrade my account to Diamond Champion membership subscription level. My email is: " + (currentUser?.email || 'guest@gmail.com');
                        const url = "https://wa.me/2349015112108?text=" + encodeURIComponent(contactMsg);
                        window.open(url, '_blank');
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬 Contact Admin to Upgrade</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Performance Heat Map Visualizer */}
            <PerformanceHeatMap selectedProcessor={processor} selectedDevice={selectedDeviceFromDB} />

            {/* Esports Calibration Trend Chart */}
            <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] text-orange-500 uppercase font-black tracking-wider flex items-center gap-1.5 font-sans">
                    <Sliders className="w-3.5 h-3.5" />
                    Sensitivity Trend Analysis
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">Calibrations vs. Global Top-Player Averages</h4>
                </div>
                <div className="flex gap-2.5 text-[9px] font-mono">
                  <span className="flex items-center gap-1 text-orange-400">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> General
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Red Dot
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span> Global Pro Avg
                  </span>
                </div>
              </div>

              <div className="w-full h-44 md:h-48">
                {loadingHistory ? (
                  <div className="w-full h-full flex flex-col justify-between py-2 pl-4 pr-2 animate-pulse font-mono">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[8px] text-slate-700">200 —</span>
                      <div className="h-[1px] flex-1 border-t border-dashed border-slate-850/60 mx-2"></div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[8px] text-slate-700">150 —</span>
                      <div className="h-[1px] flex-1 border-t border-dashed border-slate-850/60 mx-2"></div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[8px] text-slate-700">100 —</span>
                      <div className="h-[1px] flex-1 border-t border-dashed border-slate-850/60 mx-2"></div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[8px] text-slate-700">50 —</span>
                      <div className="h-[1px] flex-1 border-t border-dashed border-slate-850/60 mx-2"></div>
                    </div>
                    <div className="flex justify-between w-full mt-2 pl-10 pr-4 text-[8px] text-slate-600">
                      <span>Calib #1</span>
                      <span>Calib #2</span>
                      <span>Calib #3</span>
                      <span>Optimized</span>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getChartData()}
                      margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={9} 
                        tickLine={false} 
                      />
                      <YAxis 
                        domain={[50, 200]} 
                        stroke="#475569" 
                        fontSize={9} 
                        tickLine={false} 
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '10px',
                          fontFamily: 'sans-serif'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="userGeneral" 
                        name="Your General Sensi" 
                        stroke="#f97316" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="userRedDot" 
                        name="Your Red Dot Sensi" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 2.5, fill: '#10b981', strokeWidth: 0 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="globalAvg" 
                        name="Global Pro Average" 
                        stroke="#64748b" 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <p className="text-[9.5px] text-slate-500 leading-relaxed font-sans">
                📊 <strong>Calibration Analytics:</strong> The solid lines display your customized calibration metrics over recent iterations. The dashed line represents the global pro average benchmark (95). Notice how the GhostCore™ algorithm aligns your device hardware variables closer to elite tournament standards over time.
              </p>
            </div>

            {/* Smart Diagnostics explanation */}
            {isPremiumUser ? (
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[10px] text-orange-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  AI-Powered Diagnostic Analysis
                </span>
                <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {output.explanation}
                </div>
                <p className="text-[10px] text-slate-500 border-t border-slate-900 pt-2 mt-1">
                  This sensitivity profile was generated based on your device specifications, selected weapons, game modes, and play style using the GhostCore™ optimization engine.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-4 text-center text-[11px] text-slate-500 italic">
                🔒 AI Diagnostic Analysis report is locked. Upgrade to Diamond Champion to read.
              </div>
            )}

            {/* Save Buttons & Trigger */}
            {isPremiumUser ? (
              <div className="flex flex-col gap-3 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userEmail ? (
                    <button
                      type="button"
                      onClick={saveCurrentToProfile}
                      className="py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold uppercase tracking-wider rounded-xl text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                      <span>{saved ? 'Recorded to Profile' : 'Record to Profile'}</span>
                    </button>
                  ) : (
                    <div className="text-center text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-slate-900 leading-relaxed flex items-center justify-center">
                      ⚠️ Log in to save to Profile.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={exportPDFReport}
                    className="py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 hover:text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF Report</span>
                  </button>
                </div>

                {isPlatformAdmin && (
                  <button
                    type="button"
                    onClick={saveGeneratedAsPreset}
                    className="py-3 w-full bg-slate-900 hover:bg-slate-800 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish as Preset</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-4 text-center text-[11px] text-slate-500 italic">
                🔒 Saving and PDF exporting is restricted to Diamond Champion members.
              </div>
            )}

            {/* Absolute Objective Disclaimer */}
            <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-xl text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <span>
                <strong>Competitive Integrity:</strong> Custom sensitivity recommendations generated by GhostCore™ are safe calibration modifications computed to optimize native touch friction coefficients. This system does NOT contain, execute, or integrate cheats, automated trigger-bots, wallhacks, or unapproved script configurations.
              </span>
            </div>

          </div>
        ) : (
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[460px]">
            <div className="p-4 bg-slate-900/80 border border-slate-850 rounded-full text-slate-600 mb-4 animate-pulse">
              <Sliders className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Awaiting Calibration</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed font-sans">
              Choose your device model, setup preferences, favorite weapons, and styles on the left, then click <strong>Launch GhostCore™ Analysis</strong> to compute your optimized sensitivities.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
              <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono uppercase">
                <Zap className="w-3 h-3 text-orange-500" /> instant drags
              </span>
              <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono uppercase">
                <Smartphone className="w-3 h-3 text-amber-500" /> multi-model DB
              </span>
              <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono uppercase">
                <Crosshair className="w-3 h-3 text-red-500" /> legitimate precision
              </span>
            </div>
          </div>
        )}

        {/* Global Preset configurations */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" /> Global Expert Presets
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Pre-verified high tier sensitivity files. Tap to import into generator specs.</p>
            </div>
            {isPlatformAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingPreset(null);
                  setPresetName('');
                  setPresetDesc('');
                  setShowPresetForm(true);
                }}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-mono uppercase tracking-wider flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Preset
              </button>
            )}
          </div>

          {/* Admin Preset Editor form (Inline when shown) */}
          {showPresetForm && isPlatformAdmin && (
            <form onSubmit={handlePresetFormSubmit} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 animate-slideIn">
              <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">
                  {editingPreset ? 'Edit Preset Config' : 'Publish New Preset Calibration'}
                </h5>
                <button type="button" onClick={() => setShowPresetForm(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Preset Name</label>
                  <input
                    type="text"
                    required
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g. Esports Shotgun Magic"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Device Brand</label>
                  <input
                    type="text"
                    value={presetBrand}
                    onChange={(e) => setPresetBrand(e.target.value)}
                    placeholder="Apple, Samsung..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Device Model</label>
                  <input
                    type="text"
                    value={presetModel}
                    onChange={(e) => setPresetModel(e.target.value)}
                    placeholder="iPhone 15 Pro Max..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">General Sensi (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetGeneral}
                    onChange={(e) => setPresetGeneral(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Red Dot Sensi (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetRedDot}
                    onChange={(e) => setPresetRedDot(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">2x Scope (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetScope2x}
                    onChange={(e) => setPresetScope2x(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">4x Scope (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetScope4x}
                    onChange={(e) => setPresetScope4x(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Sniper Sensi (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetSniper}
                    onChange={(e) => setPresetSniper(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Free Look Sensi (1-200)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={presetFreeLook}
                    onChange={(e) => setPresetFreeLook(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-400 font-bold">Status</label>
                  <select
                    value={presetStatus}
                    onChange={(e) => setPresetStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 cursor-pointer text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[9px] uppercase text-slate-400 font-bold">Tactical Description / Context</label>
                <textarea
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  placeholder="Explain device compatibility or drag shot mechanics..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-orange-500 text-slate-950 font-black uppercase text-[10px] rounded-lg tracking-widest hover:brightness-110 cursor-pointer">
                  Save Preset Configuration
                </button>
                <button type="button" onClick={() => { setShowPresetForm(false); setEditingPreset(null); }} className="px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Preset list */}
          {loadingPresets ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div 
                  key={n} 
                  className="p-3.5 bg-slate-950/30 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-850 rounded-md"></div>
                    <div className="h-3 w-48 bg-slate-800/60 rounded-md"></div>
                    <div className="flex gap-2">
                      <div className="h-3.5 w-24 bg-slate-800/40 rounded border border-slate-850"></div>
                      <div className="h-3.5 w-20 bg-slate-800/40 rounded border border-slate-850"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 font-mono text-[9px]">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-3 w-8 bg-slate-800/60 rounded"></div>
                      ))}
                    </div>
                    <div className="h-7 w-12 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : presets.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-850">No published presets found.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {presets.map((preset) => (
                <div 
                  key={preset.id} 
                  onClick={isPlatformAdmin ? () => handleEditPresetClick(preset) : undefined}
                  className={`p-3.5 bg-slate-950/60 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${isPlatformAdmin ? 'cursor-pointer hover:border-orange-500/40 border-slate-850/80' : 'border-slate-850/80'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        {preset.name}
                        {isPlatformAdmin && (
                          <span className="text-[8px] bg-orange-500/10 border border-orange-500/25 text-orange-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Edit preset</span>
                        )}
                      </h5>
                      {preset.status === 'draft' && (
                        <span className="text-[8px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Draft</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">{preset.description || 'Pre-calibrated model preset.'}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[8px] font-mono uppercase bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-850">
                        📱 {preset.deviceBrand} {preset.deviceModel}
                      </span>
                      <span className="text-[8px] font-mono uppercase bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-850">
                        🎯 Style: {preset.playStyle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 font-mono text-[9px] text-right">
                      <div><span className="text-slate-500">GEN:</span> <strong className="text-orange-400">{preset.general}</strong></div>
                      <div><span className="text-slate-500">RED:</span> <strong className="text-orange-400">{preset.redDot}</strong></div>
                      <div><span className="text-slate-500">2X:</span> <strong className="text-orange-400">{preset.scope2x}</strong></div>
                      <div><span className="text-slate-500">4X:</span> <strong className="text-orange-400">{preset.scope4x}</strong></div>
                      <div><span className="text-slate-500">SNP:</span> <strong className="text-orange-400">{preset.sniper}</strong></div>
                      <div><span className="text-slate-500">FRE:</span> <strong className="text-orange-400">{preset.freeLook}</strong></div>
                    </div>

                    <div className="flex flex-col gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => loadPresetIntoInputs(preset)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Use
                      </button>

                      {onToggleBookmark && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!userEmail) {
                              alert('Please register or log in to bookmark presets.');
                              return;
                            }
                            onToggleBookmark('preset', preset.id);
                          }}
                          className={`px-3 py-1 border text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${bookmarkedPresetIds.includes(preset.id) ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                        >
                          <Bookmark className={`w-2.5 h-2.5 ${bookmarkedPresetIds.includes(preset.id) ? 'fill-current' : ''}`} />
                          {bookmarkedPresetIds.includes(preset.id) ? 'Saved' : 'Save'}
                        </button>
                      )}
                      
                      {isPlatformAdmin && (
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditPresetClick(preset)}
                            className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md cursor-pointer"
                            title="Edit preset"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePresetClick(preset.id)}
                            className="p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-md cursor-pointer"
                            title="Delete preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informative Article - bento */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-4 flex gap-4 items-start">
          <div className="p-2.5 bg-orange-600/10 rounded-xl text-orange-500 mt-1 shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">What is GhostCore™?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-sans">
              It is our proprietary sensory tactile simulation model. By studying finger surface friction, resolution pixel density, screen response refresh delays, and finger setups (such as the standard thumbs vs. complex claw setups), we compute the golden friction-to-glide ratio for the smoothest drag headshots.
            </p>
          </div>
        </div>

        {/* FUTURE CHARACTER SYSTEM ARCHITECTURE PREPARATION */}
        <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/20 rounded-3xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start pb-2 border-b border-indigo-500/10">
            <div>
              <span className="text-[8px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                GHOSTCORE™ V2.0 CALIBRATION MODULE PREVIEW
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-indigo-400 animate-pulse" /> Character Skill & Pet Synchronizer
              </h4>
            </div>
            <span className="text-[8px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
              Q3 2026 Integration
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Database models have been successfully prepared for dynamic skill modifiers. In the next minor release, character skills will automatically scale recommended screen sensitivity multipliers (e.g., compensating for active mobility bursts or tracking assistance buffs).
          </p>
        </div>

      </section>
      
      </div>

      {/* Guest Forced Video Ad */}
      {showForcedVideoAd && (
        <SponsorAdPopup 
          currentUser={currentUser}
          onAdClose={() => {
            setHasWatchedVideoAd(true);
            setShowForcedVideoAd(false);
            // Auto generate after watching
            handleGenerate(undefined, true);
          }}
        />
      )}

      {/* Guest Share to Complete modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5">
            
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <Crown className="w-6 h-6 fill-current" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Share to Complete Calibration</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                As an unregistered guest player, you must share our high-precision sensitivity simulator with WhatsApp or Telegram groups to complete hardware matrix calibration.
              </p>
            </div>

            {/* Sharing verification progress */}
            <div className="space-y-2 p-4 bg-slate-950 border border-slate-850 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Calibration Progress</span>
                <span className="font-bold text-orange-400">{guestShareCount >= 1 ? 100 : 0}% verified</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${guestShareCount >= 1 ? 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                ></div>
              </div>
              <p className="text-[9px] text-slate-500 text-center italic">
                {guestShareCount < 1 
                  ? `Share to WhatsApp Web or Telegram groups to complete`
                  : 'Calibration unlocked! Launching simulator...'}
              </p>
            </div>

            {/* Share launchers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGuestShare('whatsapp')}
                className="py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp Group</span>
              </button>

              <button
                type="button"
                onClick={() => handleGuestShare('telegram')}
                className="py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 fill-current shrink-0" />
                <span>Telegram Group</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] text-slate-500">
                Tip: Creating a free account bypasses guest sharing checks and unlocks standard personalized calibrations.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Quick Setup Walkthrough Modal */}
      {showWalkthrough && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Quick Setup Walkthrough</h3>
                  <p className="text-[10px] text-slate-500">Step {walkthroughStep + 1} of 4</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowWalkthrough(false)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with step contents */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {walkthroughStep === 0 && (
                <div className="space-y-4 animate-slideIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                      <Smartphone className="w-4 h-4" /> 1. Select Device Specifications
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      GhostCore™ builds specialized sensitivity ratios based on actual screen resolution, thermal limits, and touch sampling rates. Selecting an accurate device configuration is the single most important step.
                    </p>
                  </div>

                  {/* Popular picks */}
                  <div className="space-y-2 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                      ⚡ Quick Pick: Popular esports phone presets
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { b: 'Samsung', m: 'Galaxy S24 Ultra' },
                        { b: 'Apple', m: 'iPhone 16 Pro Max' },
                        { b: 'Infinix', m: 'GT 20 Pro' },
                        { b: 'TECNO', m: 'Camon 30 Premier' }
                      ].map(item => {
                        const isSelected = brand === item.b && model === item.m;
                        return (
                          <button
                            key={item.m}
                            type="button"
                            onClick={() => selectPopularDevice(item.b, item.m)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-[11px] ${
                              isSelected 
                                ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="font-bold truncate pr-2">{item.b} {item.m}</span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            ) : (
                              <span className="text-[8px] font-mono text-slate-500 uppercase shrink-0">Select</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {brand && model && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Successfully loaded: <strong>{brand} {model}</strong>
                      </p>
                    )}
                  </div>

                  {/* Device Database reference */}
                  <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3 items-start">
                    <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      💡 <strong>Can't find your phone?</strong> Navigate to the central <strong className="text-white uppercase font-mono text-[10px]">Devices</strong> tab at the top of the hub, where you can browse and search hundreds of pre-loaded Android and iOS specifications, then tap <strong className="text-orange-400 uppercase font-mono text-[9px]">Use Specifications</strong> to instantly sync its telemetry!
                    </p>
                  </div>
                </div>
              )}

              {walkthroughStep === 1 && (
                <div className="space-y-4 animate-slideIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                      <Sliders className="w-4 h-4" /> 2. Personalize Touch Controls
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sensitivity isn't just about the screen—it's about how you hold it. Tailor your control profile to match your real-world gameplay style:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-5 h-5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-orange-400 shrink-0 mt-0.5">
                        A
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-200">Your Finger Setup & Grip</h5>
                        <p className="text-[10px] text-slate-500">
                          Select 2-Finger Thumbs, 3-Finger, or 4-Finger Claw setups. More fingers require faster drag smoothing to avoid crosshair drift during intense spraying.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-5 h-5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-orange-400 shrink-0 mt-0.5">
                        B
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-200">Weapons Catalog Select</h5>
                        <p className="text-[10px] text-slate-500">
                          Choose your favorite firearms. Sub-machine guns like MP40 need faster high-refresh drag multipliers, while sniper rifles like AWM require fine friction decay.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-5 h-5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-orange-400 shrink-0 mt-0.5">
                        C
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-200">Game Mode Bias</h5>
                        <p className="text-[10px] text-slate-500">
                          Select Battle Royale or Clash Squad. Close-range CS Ranked requires swift general camera turning, whereas BR benefits from long-range scoped spray control.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {walkthroughStep === 2 && (
                <div className="space-y-4 animate-slideIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                      <Cpu className="w-4 h-4" /> 3. Run Analysis & Inspect Heatmap
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Now that your profile setup is complete, it's time to let the calibrator calculate your esports configurations:
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-black">Calibration Mechanism</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Click the large gradient button <strong className="text-white font-black text-[10px] uppercase font-mono">Launch GhostCore™ Analysis</strong>. The engine will run an 8-step physical simulation modeling touch friction indices and CPU throttle constraints.
                    </p>
                    <div className="border-t border-slate-800/80 pt-2">
                      <h5 className="text-[10px] font-bold text-white uppercase mb-1">🔍 Pro Tip: Live Heatmap Inspection</h5>
                      <p className="text-[9.5px] text-slate-500 leading-relaxed">
                        After calibration finishes, scroll down to the <strong>Hardware Bottleneck Heat Map</strong>. Hover or tap on CPU, GPU, Thermal or Touch segments to read a detailed diagnostic analysis of hardware weaknesses and our direct optimization remedy!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {walkthroughStep === 3 && (
                <div className="space-y-4 animate-slideIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                      <Download className="w-4 h-4" /> 4. Record History & Export PDF
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Don't lose your configurations. GhostCore™ supports persistent storage and portable exports so you can carry your calibrations anywhere:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between h-32">
                      <div>
                        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">Save Profile</span>
                        <h5 className="text-[11px] font-black text-white uppercase">Cloud Synchronization</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Synchronize the calibrated sensitivity numbers straight to your personal account history for instant future retrieval.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-col justify-between h-32">
                      <div>
                        <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider block mb-1">Export PDF</span>
                        <h5 className="text-[11px] font-black text-white uppercase">Calibrated pdf report</h5>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Click <strong>Export PDF Report</strong> to download a clean, professional, multi-colored PDF with system specs, slider gauges, and diagnosis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-2 text-slate-400 text-[11px]">
                    🚀 You are fully trained! Let's get that Booyah!
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <button
                type="button"
                disabled={walkthroughStep === 0}
                onClick={() => setWalkthroughStep(walkthroughStep - 1)}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map(step => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setWalkthroughStep(step)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      walkthroughStep === step ? 'bg-orange-500 w-4' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  ></button>
                ))}
              </div>

              {walkthroughStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWalkthroughStep(walkthroughStep + 1)}
                  className="py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 hover:text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-orange-500/10"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowWalkthrough(false);
                    setShowWalkthroughBanner(false);
                    localStorage.setItem('ghostcore_walkthrough_completed', 'true');
                  }}
                  className="py-2.5 px-5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 hover:text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/10"
                >
                  <span>Finish Walkthrough</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
