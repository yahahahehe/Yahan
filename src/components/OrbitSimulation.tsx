import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface OrbitSimulationProps {
  lang: 'zh' | 'en';
  theme: 'light' | 'dark';
}

const G = 2; // Gravitational constant
const DISTANCE = 250; // Initial distance

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  radius: number;
  trail: { x: number; y: number }[];
}

export default function OrbitSimulation({ lang, theme }: OrbitSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mass1, setMass1] = useState(2000);
  const [mass2, setMass2] = useState(200);
  const [isPlaying, setIsPlaying] = useState(true);
  const requestRef = useRef<number>(null);
  const frameCountRef = useRef(0);

  const stateRef = useRef<{ body1: Body; body2: Body }>({
    body1: { x: 0, y: 0, vx: 0, vy: 0, mass: 2000, color: '#3b82f6', radius: 20, trail: [] },
    body2: { x: 0, y: 0, vx: 0, vy: 0, mass: 200, color: '#ef4444', radius: 10, trail: [] },
  });

  const resetSimulation = useCallback(() => {
    const m1 = mass1;
    const m2 = mass2;
    const totalMass = m1 + m2;

    const r1 = DISTANCE * (m2 / totalMass);
    const r2 = DISTANCE * (m1 / totalMass);

    const v1 = m2 * Math.sqrt(G / (DISTANCE * totalMass));
    const v2 = m1 * Math.sqrt(G / (DISTANCE * totalMass));

    stateRef.current = {
      body1: {
        x: 400 - r1,
        y: 225,
        vx: 0,
        vy: -v1,
        mass: m1,
        color: '#3b82f6',
        radius: Math.max(12, Math.min(40, Math.cbrt(m1) * 2)),
        trail: [],
      },
      body2: {
        x: 400 + r2,
        y: 225,
        vx: 0,
        vy: v2,
        mass: m2,
        color: '#ef4444',
        radius: Math.max(8, Math.min(40, Math.cbrt(m2) * 2)),
        trail: [],
      },
    };
  }, [mass1, mass2]);

  // Initial setup
  useEffect(() => {
    resetSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update masses dynamically
  useEffect(() => {
    stateRef.current.body1.mass = mass1;
    stateRef.current.body1.radius = Math.max(12, Math.min(40, Math.cbrt(mass1) * 2));
  }, [mass1]);

  useEffect(() => {
    stateRef.current.body2.mass = mass2;
    stateRef.current.body2.radius = Math.max(8, Math.min(40, Math.cbrt(mass2) * 2));
  }, [mass2]);

  const updatePhysics = () => {
    const state = stateRef.current;
    const b1 = state.body1;
    const b2 = state.body2;

    // Sub-stepping for better stability
    const steps = 4;
    const dt = 1 / steps;

    for (let i = 0; i < steps; i++) {
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      const min_dist = (b1.radius + b2.radius) * 0.5;
      const effectiveDistSq = Math.max(distSq, min_dist * min_dist);

      const force = (G * b1.mass * b2.mass) / effectiveDistSq;

      const ax1 = (force * dx / dist) / b1.mass;
      const ay1 = (force * dy / dist) / b1.mass;

      const ax2 = (-force * dx / dist) / b2.mass;
      const ay2 = (-force * dy / dist) / b2.mass;

      b1.vx += ax1 * dt;
      b1.vy += ay1 * dt;
      b2.vx += ax2 * dt;
      b2.vy += ay2 * dt;

      b1.x += b1.vx * dt;
      b1.y += b1.vy * dt;
      b2.x += b2.vx * dt;
      b2.y += b2.vy * dt;
    }

    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0) {
      b1.trail.push({ x: b1.x, y: b1.y });
      b2.trail.push({ x: b2.x, y: b2.y });
      if (b1.trail.length > 200) b1.trail.shift();
      if (b2.trail.length > 200) b2.trail.shift();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const state = stateRef.current;

    // Draw trails
    const drawTrail = (body: Body) => {
      if (body.trail.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(body.trail[0].x, body.trail[0].y);
      for (let i = 1; i < body.trail.length; i++) {
        ctx.lineTo(body.trail[i].x, body.trail[i].y);
      }
      ctx.strokeStyle = body.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    };

    drawTrail(state.body1);
    drawTrail(state.body2);

    // Draw bodies
    const drawBody = (body: Body) => {
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      ctx.fill();
      
      // Add a little glow/highlight
      ctx.beginPath();
      ctx.arc(body.x - body.radius * 0.3, body.y - body.radius * 0.3, body.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    };

    drawBody(state.body1);
    drawBody(state.body2);
  };

  const animate = useCallback(() => {
    if (isPlaying) {
      updatePhysics();
    }
    draw();
    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-4xl w-full flex flex-col gap-4">
        
        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-center justify-between">
          
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {lang === 'zh' ? '藍星質量' : 'Blue Star Mass'}
                </label>
                <span className="text-sm font-mono text-slate-500">{mass1}</span>
              </div>
              <input 
                type="range" 
                min="10" max="5000" step="10"
                value={mass1} 
                onChange={(e) => setMass1(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-bold text-red-500 dark:text-red-400">
                  {lang === 'zh' ? '紅星質量' : 'Red Star Mass'}
                </label>
                <span className="text-sm font-mono text-slate-500">{mass2}</span>
              </div>
              <input 
                type="range" 
                min="10" max="5000" step="10"
                value={mass2} 
                onChange={(e) => setMass2(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors shadow-sm"
              title={isPlaying ? (lang === 'zh' ? '暫停' : 'Pause') : (lang === 'zh' ? '播放' : 'Play')}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
            </button>
            <button
              onClick={resetSimulation}
              className="w-14 h-14 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors shadow-sm"
              title={lang === 'zh' ? '重置為穩定軌道' : 'Reset to Stable Orbit'}
            >
              <RotateCcw className="w-7 h-7" />
            </button>
          </div>

        </div>

        {/* Canvas Container */}
        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 text-white/50 text-xs sm:text-sm pointer-events-none font-medium">
            {lang === 'zh' ? '💡 提示：隨時拖拉滑桿改變質量，觀察軌道如何被干擾！' : '💡 Hint: Adjust mass anytime to perturb the orbit!'}
          </div>
        </div>

      </div>
    </div>
  );
}
