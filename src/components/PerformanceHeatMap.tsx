import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Cpu, Info, Sparkles, AlertCircle } from 'lucide-react';
import { Device } from '../types';

interface PerformanceHeatMapProps {
  selectedProcessor: string;
  selectedDevice: Device | null;
}

interface CellData {
  rowId: string;
  rowLabel: string;
  colId: 'Entry' | 'Mid' | 'High' | 'Elite';
  colLabel: string;
  score: number;
  description: string;
}

export default function PerformanceHeatMap({ selectedProcessor, selectedDevice }: PerformanceHeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 320 });
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    cell: CellData;
    bottleneck: string;
    remedy: string;
  } | null>(null);

  // Helper bottleneck and remedy generator
  const getBottleneckDetails = (rowId: string, colId: string, score: number) => {
    let bottleneck = "";
    let remedy = "";
    
    if (rowId === 'cpu') {
      if (score < 40) {
        bottleneck = "Heavy single-core micro-stuttering under high particle action, leading to frame time spikes (jitter > 12ms).";
        remedy = "Boost General sensitivity by +15% to compensate for visual frame lag. Enable standard graphic compression.";
      } else if (score < 70) {
        bottleneck = "Thermal throttling of active cores during sustained 4v4 encounters. Occasional clock cycle drop.";
        remedy = "Keep general sensitivity at standard levels. Clean memory cache before launching.";
      } else if (score < 90) {
        bottleneck = "Extremely minor core synchronization decay during long tournament play sessions.";
        remedy = "Ideal calibration. Keep sensitivity low for maximum precision.";
      } else {
        bottleneck = "No CPU compute bottleneck. Steady sub-millisecond game state calculations (jitter < 1ms).";
        remedy = "Supports raw low-sensitivity fine control. Calibrations optimized for perfect physical translation.";
      }
    } else if (rowId === 'gpu') {
      if (score < 40) {
        bottleneck = "Low vertex processing speeds limit render pipeline to 30-40 FPS. Severe input response delay.";
        remedy = "Increase camera speeds significantly to offset the slower display refresh interval.";
      } else if (score < 70) {
        bottleneck = "60 FPS rendering limit. Minor visual tearing when turning rapidly.";
        remedy = "Enable vertical sync or apply Red Dot calibration modifiers to ease targeting transitions.";
      } else if (score < 90) {
        bottleneck = "90 FPS thermal ceiling. Minor shadow casting latency under high graphic detail presets.";
        remedy = "Use 90Hz performance mode; decrease scope speeds by -4% to secure steady long-range recoil.";
      } else {
        bottleneck = "Perfect 120 FPS render pipeline. Flawless frame generation with near-zero latency.";
        remedy = "Uncapped visual accuracy. Lower scoping values to eliminate pixel-overshoot.";
      }
    } else if (rowId === 'thermal') {
      if (score < 40) {
        bottleneck = "Severe heat dissipation limits. Core clock speeds throttle by up to 40% within 15 minutes.";
        remedy = "Avoid long sessions. Add sensitivity buffs of +8% to offset tactile stiffness during throttle.";
      } else if (score < 70) {
        bottleneck = "Standard aluminum heat spreader. Throttles peak performance after 30-40 minutes of heavy play.";
        remedy = "Cool down device between matches. Target stable medium resolution settings.";
      } else if (score < 90) {
        bottleneck = "Excellent multi-layer cooling layout. Thermal throttling is capped at maximum 10% decay.";
        remedy = "Durable performance. Settings remain steady throughout prolonged sessions.";
      } else {
        bottleneck = "Vapor chamber or cooling fan integrated. Zero thermal performance decay under continuous extreme load.";
        remedy = "Ultra stable settings. No physical environment correction modifiers needed.";
      }
    } else if (rowId === 'touch') {
      if (score < 50) {
        bottleneck = "120Hz Touch Sampling Rate limits touch coordinate updates to every 8.3ms. Feels muddy.";
        remedy = "Raise touch multiplier by +20% to help register rapid flick shots correctly.";
      } else if (score < 75) {
        bottleneck = "240Hz touch polling rate (4.1ms polling intervals). Decent responsiveness but minor dragging lag.";
        remedy = "Standard profile calibrated for comfortable tracking during medium-range fights.";
      } else if (score < 90) {
        bottleneck = "360Hz high-fidelity touch polling (2.7ms response). Highly accurate swipe interpretation.";
        remedy = "Slightly decrease swipe thresholds to prevent accidental over-flicking during stressful sprays.";
      } else {
        bottleneck = "Elite 480Hz+ touch sampling (sub-2ms response). Instant cursor updates. Jitters are highly visible.";
        remedy = "Apply a dampening modifier to eliminate hand-tremor transfer. Low sensitivity settings excel here.";
      }
    } else if (rowId === 'gyro') {
      if (score < 40) {
        bottleneck = "No dedicated hardware gyroscope sensor. Relies on software sensor emulation with 50ms+ latency.";
        remedy = "Disable tilt-to-aim entirely. Scale up 2x/4x scope settings to rely purely on manual thumb drags.";
      } else if (score < 70) {
        bottleneck = "Standard MEMS gyroscope with moderate poll rates. Minor directional drift over time.";
        remedy = "Recalibrate sensor often in-game. Standard gyro multiplier calibration applied.";
      } else if (score < 90) {
        bottleneck = "High-precision low-noise gyroscope with rapid polling. Crisp orientation tracking.";
        remedy = "Ideal for micro-aim adjustments. Lower sniper scope values to permit steady breathing holds.";
      } else {
        bottleneck = "Elite 6-axis hardware IMU with sub-millisecond polling. Imperceptible tracking drift.";
        remedy = "Elite tilt-to-aim support. Perfect for continuous recoil neutralization. Use highly precise gyro multipliers.";
      }
    }
    
    return { bottleneck, remedy };
  };

  // Classify current processor into performance tier
  const getProcessorTier = (proc: string): 'Entry' | 'Mid' | 'High' | 'Elite' => {
    const p = proc.toLowerCase();
    
    // Elite Tier
    if (
      p.includes('snapdragon 8 gen 3') || 
      p.includes('snapdragon 8 gen 2') || 
      p.includes('apple a18') || 
      p.includes('apple a17') || 
      p.includes('apple a16') || 
      p.includes('dimensity 9300') || 
      p.includes('dimensity 9200') ||
      p.includes('bionic') && (p.includes('15') || p.includes('16') || p.includes('17'))
    ) {
      return 'Elite';
    }

    // High Tier
    if (
      p.includes('snapdragon 8 gen 1') || 
      p.includes('snapdragon 888') || 
      p.includes('dimensity 8200') || 
      p.includes('dimensity 8050') || 
      p.includes('dimensity 8020') || 
      p.includes('apple a15') || 
      p.includes('apple a14') || 
      p.includes('apple a13') || 
      p.includes('exynos 2400') || 
      p.includes('exynos 2200')
    ) {
      return 'High';
    }

    // Mid Tier
    if (
      p.includes('helio g99') || 
      p.includes('helio g96') || 
      p.includes('helio g95') || 
      p.includes('helio g88') || 
      p.includes('helio g85') || 
      p.includes('helio g80') || 
      p.includes('exynos 1480') || 
      p.includes('exynos 1380') || 
      p.includes('snapdragon 6') || 
      p.includes('snapdragon 7') || 
      p.includes('dimensity 7020') || 
      p.includes('dimensity 6080') || 
      p.includes('dimensity 6300') || 
      p.includes('unisoc t610') || 
      p.includes('apple a12') || 
      p.includes('apple a11') || 
      p.includes('apple a10')
    ) {
      return 'Mid';
    }

    // Default Entry Tier
    return 'Entry';
  };

  const currentTier = getProcessorTier(selectedProcessor);

  // Performance dimensions and scores
  const rows = [
    { id: 'cpu', label: 'CPU Compute' },
    { id: 'gpu', label: 'GPU Graphics' },
    { id: 'thermal', label: 'Thermal Resistance' },
    { id: 'touch', label: 'Touch Latency' },
    { id: 'gyro', label: 'Gyro Response' }
  ];

  const columns: { id: 'Entry' | 'Mid' | 'High' | 'Elite'; label: string }[] = [
    { id: 'Entry', label: 'Entry Tier' },
    { id: 'Mid', label: 'Mid Tier' },
    { id: 'High', label: 'High Tier' },
    { id: 'Elite', label: 'Elite Tier' }
  ];

  // Specific cell performance matrices & descriptions
  const cellsData: CellData[] = [
    // CPU
    { 
      rowId: 'cpu', rowLabel: 'CPU Compute', colId: 'Entry', colLabel: 'Entry Tier', score: 32,
      description: 'Struggles under high action. Requires higher general sensitivity baseline to prevent choppy input tracking.'
    },
    { 
      rowId: 'cpu', rowLabel: 'CPU Compute', colId: 'Mid', colLabel: 'Mid Tier', score: 58,
      description: 'Moderate frame rate stability. Standard sensitivity scale is optimized for balanced execution.'
    },
    { 
      rowId: 'cpu', rowLabel: 'CPU Compute', colId: 'High', colLabel: 'High Tier', score: 82,
      description: 'High framing stability. Sensi calibrations can scale lower as micro-stutters are non-existent.'
    },
    { 
      rowId: 'cpu', rowLabel: 'CPU Compute', colId: 'Elite', colLabel: 'Elite Tier', score: 98,
      description: 'Ultra-fast clock speeds. Zero framing latency, permitting tight, highly-focused micro-calibrations.'
    },
    // GPU
    { 
      rowId: 'gpu', rowLabel: 'GPU Graphics', colId: 'Entry', colLabel: 'Entry Tier', score: 25,
      description: 'Low frame rendering rate. GhostCore raises sensitivity values to compensate for screen movement lag.'
    },
    { 
      rowId: 'gpu', rowLabel: 'GPU Graphics', colId: 'Mid', colLabel: 'Mid Tier', score: 54,
      description: 'Stable 45-60 FPS performance. Safe baseline. Moderate camera rotation scales recommended.'
    },
    { 
      rowId: 'gpu', rowLabel: 'GPU Graphics', colId: 'High', colLabel: 'High Tier', score: 84,
      description: '90 FPS capability. Smooth visuals allow you to lower red dot sensitivity for precise headshot alignment.'
    },
    { 
      rowId: 'gpu', rowLabel: 'GPU Graphics', colId: 'Elite', colLabel: 'Elite Tier', score: 100,
      description: '120+ FPS capability. Ideal visuals allow for ultra-clean targeting. Low sensitivities work best for pure raw aim.'
    },
    // Thermal
    { 
      rowId: 'thermal', rowLabel: 'Thermal Resistance', colId: 'Entry', colLabel: 'Entry Tier', score: 65,
      description: 'Low thermal output keeps framing mostly stable, though absolute compute limits are low.'
    },
    { 
      rowId: 'thermal', rowLabel: 'Thermal Resistance', colId: 'Mid', colLabel: 'Mid Tier', score: 58,
      description: 'Can suffer minor frame drops after 30 minutes of continuous high-load play.'
    },
    { 
      rowId: 'thermal', rowLabel: 'Thermal Resistance', colId: 'High', colLabel: 'High Tier', score: 74,
      description: 'Equipped with basic vapor cooling systems. Holds peak performance tiers longer.'
    },
    { 
      rowId: 'thermal', rowLabel: 'Thermal Resistance', colId: 'Elite', colLabel: 'Elite Tier', score: 90,
      description: 'Elite cooling designs sustain 120Hz refresh rates without performance throttling.'
    },
    // Touch Latency
    { 
      rowId: 'touch', rowLabel: 'Touch Latency', colId: 'Entry', colLabel: 'Entry Tier', score: 40,
      description: 'Higher touch lag (120Hz touch sampling). Boosted touch multiplier is applied to maintain swift drag movements.'
    },
    { 
      rowId: 'touch', rowLabel: 'Touch Latency', colId: 'Mid', colLabel: 'Mid Tier', score: 66,
      description: 'Standard touch lag (180Hz - 240Hz sampling). Reliable and smooth drag mechanics.'
    },
    { 
      rowId: 'touch', rowLabel: 'Touch Latency', colId: 'High', colLabel: 'High Tier', score: 86,
      description: 'Minimal touch latency (240Hz - 360Hz sampling). Tighter sensitivity provides superior high-speed recoil control.'
    },
    { 
      rowId: 'touch', rowLabel: 'Touch Latency', colId: 'Elite', colLabel: 'Elite Tier', score: 97,
      description: 'Ultra-responsive touch input (360Hz - 480Hz+ sampling). Slight hand jitters can throw off aim; lower sensitivity is recommended.'
    },
    // Gyro
    { 
      rowId: 'gyro', rowLabel: 'Gyro Response', colId: 'Entry', colLabel: 'Entry Tier', score: 15,
      description: 'No hardware gyro or virtual gyro emulation. Highly unstable. Sensi multiplier adjusted for manual finger recoil control.'
    },
    { 
      rowId: 'gyro', rowLabel: 'Gyro Response', colId: 'Mid', colLabel: 'Mid Tier', score: 52,
      description: 'Standard hardware gyro present. Good tilt-to-aim capabilities with default calibrations.'
    },
    { 
      rowId: 'gyro', rowLabel: 'Gyro Response', colId: 'High', colLabel: 'High Tier', score: 88,
      description: 'High precision low-latency hardware gyroscope. Highly recommended to use tilt-to-aim with low 4x scope multipliers.'
    },
    { 
      rowId: 'gyro', rowLabel: 'Gyro Response', colId: 'Elite', colLabel: 'Elite Tier', score: 98,
      description: 'Professional grade gyroscope with sub-millisecond poll rates. Perfect for micro-recoil calibration patterns.'
    }
  ];

  // Set up container size listener using ResizeObserver (as mandated)
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Keep ratio 1.6:1 or minimum height
      const calculatedHeight = Math.max(260, Math.min(320, width * 0.55));
      setDimensions({
        width: width,
        height: calculatedHeight
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Draw Heatmap using D3
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 35, right: 15, bottom: 35, left: 105 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Define main drawing group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // D3 Scales
    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(columns.map(c => c.id))
      .padding(0.06);

    const yScale = d3.scaleBand()
      .range([0, height])
      .domain(rows.map(r => r.id))
      .padding(0.06);

    // Multi-color linear scale representing performance density (Dark slate -> Deep Indigo -> Vibrant Orange -> Warm Amber)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 40, 75, 100])
      .range(['#0b0f19', '#312e81', '#ea580c', '#fbbf24']);

    // Draw grid rects
    g.selectAll('.cell')
      .data(cellsData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.colId) || 0)
      .attr('y', d => yScale(d.rowId) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', d => colorScale(d.score))
      .attr('stroke', d => d.colId === currentTier ? 'rgba(249, 115, 22, 0.5)' : '#1e293b')
      .attr('stroke-width', d => d.colId === currentTier ? 1.5 : 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
        setHoveredCell(d);

        const [mx, my] = d3.pointer(event, containerRef.current);
        const { bottleneck, remedy } = getBottleneckDetails(d.rowId, d.colId, d.score);
        setTooltip({
          x: mx,
          y: my,
          visible: true,
          cell: d,
          bottleneck,
          remedy
        });
      })
      .on('mousemove', function (event, d) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        const { bottleneck, remedy } = getBottleneckDetails(d.rowId, d.colId, d.score);
        setTooltip({
          x: mx,
          y: my,
          visible: true,
          cell: d,
          bottleneck,
          remedy
        });
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', d.colId === currentTier ? 'rgba(249, 115, 22, 0.7)' : '#1e293b')
          .attr('stroke-width', d.colId === currentTier ? 2 : 0.5);
        setTooltip(null);
      });

    // Draw active values as small text overlays on cells
    g.selectAll('.score-text')
      .data(cellsData)
      .enter()
      .append('text')
      .attr('class', 'score-text')
      .attr('x', d => (xScale(d.colId) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.rowId) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .attr('fill', d => d.score < 45 ? '#94a3b8' : '#ffffff')
      .style('pointer-events', 'none')
      .text(d => d.score);

    // Draw Y-axis labels (Metrics)
    g.selectAll('.y-label')
      .data(rows)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', d => (yScale(d.id) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('font-weight', 'semibold')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'sans-serif')
      .text(d => d.label);

    // Draw X-axis labels (Tiers)
    g.selectAll('.x-label')
      .data(columns)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', d => (xScale(d.id) || 0) + xScale.bandwidth() / 2)
      .attr('y', height + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.id === currentTier ? '#f97316' : '#64748b')
      .attr('font-family', 'sans-serif')
      .text(d => d.label);

    // Draw glowing outline around matching active processor tier column
    const activeColX = xScale(currentTier) || 0;
    const colWidth = xScale.bandwidth();
    
    // Draw "Active SoC" tag on top of the column
    g.append('rect')
      .attr('x', activeColX)
      .attr('y', -24)
      .attr('width', colWidth)
      .attr('height', 16)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(249, 115, 22, 0.15)')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 1);

    g.append('text')
      .attr('x', activeColX + colWidth / 2)
      .attr('y', -13)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', '900')
      .attr('font-family', 'monospace')
      .attr('fill', '#f97316')
      .text('ACTIVE SoC');

  }, [dimensions, currentTier, selectedProcessor]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-inner space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
            <Cpu className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              SoC Density Heat Map
              <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono px-1.5 py-0.5 rounded uppercase">
                {currentTier} Tier
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Tactile benchmark response mapped per chipset performance density</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-950 border border-slate-800 rounded-sm"></span> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-900 rounded-sm"></span> Mid</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-600 rounded-sm"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span> Elite</span>
        </div>
      </div>

      {/* Grid container */}
      <div ref={containerRef} className="w-full overflow-hidden flex items-center justify-center relative">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="mx-auto"
        />

        {tooltip && tooltip.visible && (
          <div 
            className="absolute z-50 pointer-events-none bg-slate-950/95 border border-orange-500/50 rounded-2xl p-4 shadow-2xl max-w-[280px] sm:max-w-xs text-xs font-sans transition-all duration-75 animate-fade-in"
            style={{ 
              left: `${tooltip.x + 15}px`, 
              top: `${tooltip.y + 15}px`,
              transform: `translate(${tooltip.x + 15 + 280 > dimensions.width ? '-100%' : '0'}, ${tooltip.y + 15 + 180 > dimensions.height ? '-100%' : '0'})`
            }}
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-start gap-3 border-b border-slate-800 pb-1.5">
                <div>
                  <h5 className="font-extrabold text-white text-[11px] uppercase tracking-wider">{tooltip.cell.rowLabel}</h5>
                  <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider font-mono">{tooltip.cell.colLabel}</p>
                </div>
                <span className="font-mono text-[10px] font-black bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded shrink-0">
                  Score: {tooltip.cell.score}/100
                </span>
              </div>
              
              <div className="space-y-1.5">
                <div>
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">⚠️ Hardware Bottleneck</span>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">{tooltip.bottleneck}</p>
                </div>
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">⚙️ GhostCore Remedy</span>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">{tooltip.remedy}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip & Calibration Explainer Panel */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 space-y-2 text-[11px] min-h-[96px] flex flex-col justify-between">
        {hoveredCell ? (
          <div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-1.5">
              <span className="font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                {hoveredCell.rowLabel} &gt; {hoveredCell.colLabel}
              </span>
              <span className="font-mono font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Score: {hoveredCell.score}/100
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans font-medium">{hoveredCell.description}</p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-slate-400 py-1">
            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-slate-300 text-[10px]">Interactive Diagnostics</p>
              <p className="leading-relaxed">
                Hover over any cell in the heat map to analyze how different performance criteria vary across SoC tiers, and why we scale settings accordingly. Your current processor is labeled as the <strong className="text-orange-400 font-bold">{selectedProcessor} ({currentTier} Tier)</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Educational Linkage */}
      <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 flex gap-2 text-[10.5px] leading-relaxed text-slate-400">
        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Calibration Rule:</strong> Entry-tier chipsets feature higher input delays and frame jitter, requiring higher sensitivity scales to overcome physical lags. Elite chipsets register continuous 120Hz micro-movements perfectly, calling for slightly lower, highly precise sensitivity parameters to secure maximum headshot precision.
        </p>
      </div>
    </div>
  );
}
