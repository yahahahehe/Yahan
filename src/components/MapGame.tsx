import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Clock, MapPin, CheckCircle2, XCircle, Lightbulb, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getChineseName } from '../lib/countryMap';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type GameStatus = 'idle' | 'playing' | 'gameover';

interface Country {
  id: string;
  name: string;
  chineseName: string;
}

interface MapGameProps {
  lang: 'zh' | 'en';
  theme: 'light' | 'dark';
}

export default function MapGame({ lang, theme }: MapGameProps) {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countries, setCountries] = useState<Country[]>([]);
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'hint', id: string, name?: string } | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const centroidsRef = useRef<Record<string, [number, number]>>({});

  const getCentroid = useCallback((geo: any): [number, number] | null => {
    const id = geo.id || geo.properties.name;
    if (centroidsRef.current[id]) return centroidsRef.current[id];
    
    try {
      let pts: number[][] = [];
      if (geo.geometry.type === "Polygon") {
        pts = geo.geometry.coordinates[0];
      } else if (geo.geometry.type === "MultiPolygon") {
        let maxLen = 0;
        for (let poly of geo.geometry.coordinates) {
          if (poly[0].length > maxLen) {
            maxLen = poly[0].length;
            pts = poly[0];
          }
        }
      }
      if (!pts || pts.length === 0) return null;
      let x = 0, y = 0;
      for (let p of pts) {
        x += p[0];
        y += p[1];
      }
      const centroid: [number, number] = [x / pts.length, y / pts.length];
      centroidsRef.current[id] = centroid;
      return centroid;
    } catch (e) {
      return null;
    }
  }, []);

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
      
    const savedScore = localStorage.getItem('mapGameHighScore');
    if (savedScore) setHighScore(parseInt(savedScore, 10));
  }, []);

  const pickNextCountry = useCallback((countryList: Country[]) => {
    if (countryList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * countryList.length);
    setTargetCountry(countryList[randomIndex]);
    setShowHint(false);
  }, []);

  const startGame = useCallback(() => {
    setStatus('playing');
    setScore(0);
    setTimeLeft(60);
    setFeedback(null);
    pickNextCountry(countries);
    setPosition({ coordinates: [0, 0], zoom: 1 });
  }, [countries, pickNextCountry]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (status === 'playing' && timeLeft <= 0) {
      setStatus('gameover');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('mapGameHighScore', score.toString());
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, score, highScore]);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCountryClick = (geo: any) => {
    if (status !== 'playing' || !targetCountry) return;

    const clickedId = geo.id || geo.properties.name;
    const clickedName = geo.properties.name;

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    if (clickedId === targetCountry.id) {
      setScore(prev => prev + 1);
      setFeedback({ type: 'correct', id: clickedId });
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        pickNextCountry(countries);
      }, 800);
    } else {
      const displayName = lang === 'zh' ? getChineseName(clickedName) : clickedName;
      setFeedback({ type: 'incorrect', id: clickedId, name: displayName });
      setTimeLeft(prev => Math.max(0, prev - 3));
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
      }, 1200);
    }
  };

  const skipCountry = () => {
    if (status !== 'playing') return;
    setTimeLeft(prev => Math.max(0, prev - 5));
    pickNextCountry(countries);
  };

  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm z-10 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
              {lang === 'zh' ? '地圖挑戰' : 'Map Challenge'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-mono text-lg">{lang === 'zh' ? '最高: ' : 'Best: '}{highScore}</span>
            </div>
            {status === 'playing' && (
              <>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">{score}</span>
                  <span className="text-sm uppercase tracking-wider">{lang === 'zh' ? '分' : 'pts'}</span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 dark:text-red-400 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                  <Clock className="w-5 h-5" />
                  {timeLeft}s
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
        
        {/* Target Country Display */}
        <AnimatePresence>
          {status === 'playing' && targetCountry && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-6 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-xl flex flex-col items-center pointer-events-none"
            >
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1">
                {lang === 'zh' ? '請在地圖上找出：' : 'Find on map:'}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                {lang === 'zh' ? targetCountry.chineseName : targetCountry.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Controls (Hint/Skip) */}
        {status === 'playing' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4">
            <button
              onClick={toggleHint}
              className={`p-4 rounded-full shadow-lg transition-all ${showHint ? 'bg-yellow-500 text-white scale-110' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              title={lang === 'zh' ? '提示' : 'Hint'}
            >
              <Lightbulb className="w-6 h-6" />
            </button>
            <button
              onClick={skipCountry}
              className="p-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center gap-2"
              title={lang === 'zh' ? '跳過 (-5秒)' : 'Skip (-5s)'}
            >
              <SkipForward className="w-6 h-6" />
              <span className="text-xs font-bold">-5s</span>
            </button>
          </div>
        )}

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`absolute top-32 z-30 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg font-bold text-lg pointer-events-none ${
                feedback.type === 'correct' 
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/50' 
                  : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/50'
              }`}
            >
              {feedback.type === 'correct' ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  {lang === 'zh' ? '正確！' : 'Correct!'}
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  {lang === 'zh' ? `錯誤！那是 ${feedback.name}` : `Wrong! That's ${feedback.name}`} (-3s)
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div className="w-full h-full absolute inset-0 cursor-crosshair">
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
                {({ geographies }) => {
                  const targetGeo = targetCountry ? geographies.find(g => (g.id || g.properties.name) === targetCountry.id) : null;
                  const targetCentroid = targetGeo ? getCentroid(targetGeo) : null;

                  return geographies.map((geo) => {
                    const countryId = geo.id || geo.properties.name;
                    const isTarget = targetCountry?.id === countryId;
                    const isClickedCorrect = feedback?.type === 'correct' && feedback.id === countryId;
                    const isClickedIncorrect = feedback?.type === 'incorrect' && feedback.id === countryId;
                    
                    let isNearby = false;
                    if (showHint && targetCentroid) {
                      const centroid = getCentroid(geo);
                      if (centroid) {
                        let dx = Math.abs(centroid[0] - targetCentroid[0]);
                        if (dx > 180) dx = 360 - dx;
                        const dy = centroid[1] - targetCentroid[1];
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 25) { // Highlight countries within ~25 degrees radius
                          isNearby = true;
                        }
                      }
                    }
                    
                    const defaultFill = theme === 'dark' ? "#334155" : "#cbd5e1"; // slate-700 : slate-300
                    const correctFill = theme === 'dark' ? "#22c55e" : "#4ade80"; // green-500 : green-400
                    const incorrectFill = theme === 'dark' ? "#ef4444" : "#f87171"; // red-500 : red-400
                    const hintFill = theme === 'dark' ? "#eab308" : "#facc15"; // yellow-500 : yellow-400
                    const strokeColor = theme === 'dark' ? "#1e293b" : "#f8fafc"; // slate-800 : slate-50
                    const hoverFill = theme === 'dark' ? "#60a5fa" : "#93c5fd"; // blue-400 : blue-300
                    const pressedFill = theme === 'dark' ? "#3b82f6" : "#60a5fa"; // blue-500 : blue-400

                    let fill = defaultFill;
                    let opacity = 1;
                    let stroke = strokeColor;

                    if (isClickedCorrect) {
                      fill = correctFill;
                    } else if (isClickedIncorrect) {
                      fill = incorrectFill;
                    } else if (showHint && isNearby) {
                      fill = hintFill;
                      opacity = 0.6;
                    } else if (geo.properties.name === 'Antarctica') {
                      fill = "transparent";
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        onMouseEnter={() => setHoveredCountry(geo.properties.name)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{
                          default: {
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: 0.5,
                            outline: "none",
                            opacity: opacity,
                            transition: "all 250ms"
                          },
                          hover: {
                            fill: status === 'playing' ? hoverFill : fill,
                            stroke: stroke,
                            strokeWidth: 0.5,
                            outline: "none",
                            opacity: opacity,
                            cursor: status === 'playing' ? "pointer" : "default"
                          },
                          pressed: {
                            fill: pressedFill,
                            stroke: stroke,
                            strokeWidth: 0.5,
                            outline: "none",
                            opacity: opacity,
                          },
                        }}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Start / Game Over Screens */}
        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center m-4">
                {status === 'idle' ? (
                  <>
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                      {lang === 'zh' ? '地圖挑戰' : 'Map Challenge'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      {lang === 'zh' ? (
                        <>在 60 秒內，盡可能在地圖上找出正確的國家。<br/>答錯扣 3 秒，跳過扣 5 秒！</>
                      ) : (
                        <>Find as many countries as possible in 60 seconds.<br/>Wrong -3s, Skip -5s!</>
                      )}
                    </p>
                    <button
                      onClick={startGame}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <Play className="w-5 h-5" />
                      {lang === 'zh' ? '開始遊戲' : 'Start Game'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                      {lang === 'zh' ? '時間到！' : 'Time\'s Up!'}
                    </h2>
                    <div className="text-6xl font-black text-blue-600 dark:text-blue-400 my-6">
                      {score} <span className="text-2xl text-slate-500 dark:text-slate-400 font-medium">{lang === 'zh' ? '分' : 'pts'}</span>
                    </div>
                    {score >= highScore && score > 0 && (
                      <p className="text-green-600 dark:text-green-400 font-bold mb-6 animate-pulse">
                        {lang === 'zh' ? '🎉 新最高分紀錄！ 🎉' : '🎉 New High Score! 🎉'}
                      </p>
                    )}
                    <button
                      onClick={startGame}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <RotateCcw className="w-5 h-5" />
                      {lang === 'zh' ? '再玩一次' : 'Play Again'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover Info */}
        {status !== 'playing' && hoveredCountry && (
          <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 backdrop-blur px-4 py-2 rounded-lg text-sm text-slate-800 dark:text-slate-300 pointer-events-none z-30 shadow-md">
            {lang === 'zh' ? getChineseName(hoveredCountry) : hoveredCountry}
          </div>
        )}
      </main>
    </div>
  );
}
