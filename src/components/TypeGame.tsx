import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Clock, Flag, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getChineseName } from '../lib/countryMap';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type GameStatus = 'idle' | 'playing' | 'gameover';

interface Country {
  id: string;
  name: string;
  chineseName: string;
}

interface TypeGameProps {
  lang: 'zh' | 'en';
  theme: 'light' | 'dark';
}

export default function TypeGame({ lang, theme }: TypeGameProps) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [countries, setCountries] = useState<Country[]>([]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [input, setInput] = useState('');
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        const geometries = data.objects.countries.geometries;
        const validCountries = geometries
          .filter((g: any) => g.properties && g.properties.name && g.properties.name !== 'Antarctica')
          .map((g: any) => ({
            id: g.id || g.properties.name,
            name: g.properties.name,
            chineseName: getChineseName(g.properties.name)
          }));
        setCountries(validCountries);
      });
  }, []);

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) =>
      lang === 'zh'
        ? a.chineseName.localeCompare(b.chineseName, 'zh-TW')
        : a.name.localeCompare(b.name)
    );
  }, [countries, lang]);

  const startGame = useCallback(() => {
    setStatus('playing');
    setGuessed(new Set());
    setInput('');
    setTimeLeft(900);
    setPosition({ coordinates: [0, 0], zoom: 1 });
  }, []);

  const giveUp = useCallback(() => {
    setStatus('gameover');
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (status === 'playing' && timeLeft === 0) {
      setStatus('gameover');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  useEffect(() => {
    if (status === 'playing' && countries.length > 0 && guessed.size === countries.length) {
      setStatus('gameover');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  }, [guessed.size, countries.length, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (status !== 'playing') return;

    const normalizedInput = val.trim().toLowerCase();
    if (!normalizedInput) return;

    const match = countries.find(c => {
      if (guessed.has(c.id)) return false;
      const enName = c.name.toLowerCase();
      const zhName = c.chineseName;
      
      const aliases: Record<string, string[]> = {
        "United States of America": ["usa", "us", "美國", "美国"],
        "United Kingdom": ["uk", "britain", "英國", "英国"],
        "China": ["prc", "中國", "中国", "大陸"],
        "Taiwan": ["roc", "台灣", "台湾", "中華民國"],
        "South Korea": ["korea", "韓國", "韩国", "南韓"],
        "North Korea": ["北韓", "北朝鲜", "朝鲜"],
        "Russia": ["俄國"],
        "United Arab Emirates": ["uae", "阿聯酋", "阿聯"],
        "Central African Rep.": ["中非"],
        "Dem. Rep. Congo": ["民主剛果", "剛果民主共和國", "drc"],
        "Congo": ["剛果"],
        "Dominican Rep.": ["多明尼加"],
        "Eq. Guinea": ["赤道幾內亞"],
        "Bosnia and Herz.": ["波赫", "波士尼亞"],
      };

      const countryAliases = aliases[c.name] || [];

      return enName === normalizedInput ||
             zhName === normalizedInput ||
             countryAliases.some(a => a.toLowerCase() === normalizedInput);
    });

    if (match) {
      setGuessed(prev => {
        const newSet = new Set(prev);
        newSet.add(match.id);
        return newSet;
      });
      setInput('');
    }
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top: Input & Controls */}
      <div className="w-full p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 text-xl font-mono font-bold">
          <span className="text-blue-600 dark:text-blue-400">{guessed.size} <span className="text-sm text-slate-500 dark:text-slate-400">/ {countries.length}</span></span>
          <span className={timeLeft < 60 && status === 'playing' ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-slate-800 dark:text-white'}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {status === 'playing' ? (
          <div className="flex-1 max-w-xl flex gap-2 w-full">
            <input
              type="text"
              autoFocus
              value={input}
              onChange={handleInputChange}
              placeholder={lang === 'zh' ? "輸入國家名稱 (中/英)..." : "Type country name..."}
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-center text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner text-slate-900 dark:text-slate-100"
            />
            <button
              onClick={giveUp}
              className="px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 rounded-xl transition-colors whitespace-nowrap"
            >
              {lang === 'zh' ? '放棄挑戰' : 'Give Up'}
            </button>
          </div>
        ) : (
          <div className="flex-1 max-w-xl flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            {status === 'gameover' && (
              <div className="text-center sm:text-right">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'zh' ? '遊戲結束！' : 'Game Over!'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === 'zh' ? `你猜出了 ${guessed.size} 個國家` : `You guessed ${guessed.size} countries`}
                </div>
              </div>
            )}
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              {status === 'idle' ? <Play className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              {status === 'idle' ? (lang === 'zh' ? '開始遊戲' : 'Start Game') : (lang === 'zh' ? '再玩一次' : 'Play Again')}
            </button>
          </div>
        )}
      </div>

      {/* Middle: Map */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-950 cursor-move relative min-h-[30vh]">
        <ComposableMap
          projectionConfig={{ scale: 140 }}
          width={800}
          height={600}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={handleMoveEnd}
            maxZoom={8}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isGuessed = guessed.has(geo.id || geo.properties.name);
                  const isMissed = status === 'gameover' && !isGuessed && geo.properties.name !== 'Antarctica';
                  
                  const defaultFill = theme === 'dark' ? "#1e293b" : "#cbd5e1"; // slate-800 : slate-300
                  const guessedFill = theme === 'dark' ? "#22c55e" : "#4ade80"; // green-500 : green-400
                  const missedFill = theme === 'dark' ? "#ef4444" : "#f87171"; // red-500 : red-400
                  const strokeColor = theme === 'dark' ? "#0f172a" : "#f8fafc"; // slate-900 : slate-50
                  const hoverDefault = theme === 'dark' ? "#334155" : "#94a3b8"; // slate-700 : slate-400

                  let fill = defaultFill;
                  if (isGuessed) fill = guessedFill;
                  else if (isMissed) fill = missedFill;
                  else if (geo.properties.name === 'Antarctica') fill = "transparent";

                  const hoverFill = isGuessed ? guessedFill : isMissed ? missedFill : hoverDefault;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: fill,
                          stroke: strokeColor,
                          strokeWidth: 0.5,
                          outline: "none",
                          transition: "fill 0.3s ease"
                        },
                        hover: {
                          fill: hoverFill,
                          stroke: strokeColor,
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        pressed: {
                          fill: fill,
                          stroke: strokeColor,
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Bottom: Progress */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 shrink-0 flex flex-col max-h-[40vh]">
        <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
          <div className="flex justify-between items-end mb-2 shrink-0">
            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
              {lang === 'zh' ? '收集進度' : 'Progress'}
            </span>
            <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {countries.length > 0 ? Math.round((guessed.size / countries.length) * 100) : 0}%
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                ({guessed.size} / {countries.length})
              </span>
            </span>
          </div>
          <div className="w-full h-4 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner shrink-0">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${countries.length > 0 ? (guessed.size / countries.length) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="mt-4 flex-1 overflow-y-auto">
            {status === 'gameover' && guessed.size < countries.length && (
              <div className="mb-4">
                <h3 className="font-bold text-red-500 mb-2 sticky top-0 bg-white dark:bg-slate-800 py-1 z-10">
                  {lang === 'zh' ? '未猜出的國家：' : 'Missed Countries:'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sortedCountries.filter(c => !guessed.has(c.id)).map(c => (
                    <span key={c.name} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm border border-red-200 dark:border-red-800/50">
                      {lang === 'zh' ? c.chineseName : c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {guessed.size > 0 && (
              <div>
                <h3 className="font-bold text-green-600 dark:text-green-500 mb-2 sticky top-0 bg-white dark:bg-slate-800 py-1 z-10">
                  {lang === 'zh' ? '已猜出：' : 'Guessed:'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sortedCountries.filter(c => guessed.has(c.id)).map(c => (
                    <span key={c.name} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm border border-green-200 dark:border-green-800/50">
                      {lang === 'zh' ? c.chineseName : c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
