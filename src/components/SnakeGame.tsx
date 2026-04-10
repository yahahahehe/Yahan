import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Apple } from 'lucide-react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const INITIAL_SPEED = 250;

interface SnakeGameProps {
  lang: 'zh' | 'en';
  theme: 'light' | 'dark';
}

export default function SnakeGame({ lang, theme }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'ready' | 'playing' | 'gameover'>('idle');
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const currentDirectionRef = useRef<Direction>(INITIAL_DIRECTION);
  const lastProcessedDirection = useRef<Direction>(INITIAL_DIRECTION);
  const directionQueue = useRef<Direction[]>([]);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(p => p.x === newFood.x && p.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    currentDirectionRef.current = INITIAL_DIRECTION;
    lastProcessedDirection.current = INITIAL_DIRECTION;
    directionQueue.current = [];
    setScore(0);
    setStatus('ready');
    setSpeed(INITIAL_SPEED);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const handleDirectionInput = useCallback((newDir: Direction) => {
    const lastQueued = directionQueue.current.length > 0
      ? directionQueue.current[directionQueue.current.length - 1]
      : lastProcessedDirection.current;

    if (
      (newDir === 'UP' && lastQueued === 'DOWN') ||
      (newDir === 'DOWN' && lastQueued === 'UP') ||
      (newDir === 'LEFT' && lastQueued === 'RIGHT') ||
      (newDir === 'RIGHT' && lastQueued === 'LEFT') ||
      newDir === lastQueued
    ) {
      return;
    }

    if (directionQueue.current.length < 3) {
      directionQueue.current.push(newDir);
    }
    
    if (statusRef.current === 'ready') {
      setStatus('playing');
    }
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      if (directionQueue.current.length > 0) {
        currentDirectionRef.current = directionQueue.current.shift()!;
      }
      const currentDir = currentDirectionRef.current;
      lastProcessedDirection.current = currentDir;

      const head = prevSnake[0];
      const newHead = { ...head };

      switch (currentDir) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions (exclude the tail since it will move forward)
      const isBodyCollision = prevSnake.slice(0, -1).some(p => p.x === newHead.x && p.y === newHead.y);

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        isBodyCollision
      ) {
        setStatus('gameover');
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(prev - 2, 60)); // Speed up
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood]);

  useEffect(() => {
    if (status === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, moveSnake, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': handleDirectionInput('UP'); break;
        case 'ArrowDown': handleDirectionInput('DOWN'); break;
        case 'ArrowLeft': handleDirectionInput('LEFT'); break;
        case 'ArrowRight': handleDirectionInput('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionInput]);

  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [score, highScore]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '當前得分' : 'Score'}</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '最高紀錄' : 'High Score'}</span>
            <div className="flex items-center gap-1 text-xl font-bold text-slate-700 dark:text-slate-300">
              <Trophy className="w-4 h-4 text-yellow-500" />
              {highScore}
            </div>
          </div>
        </div>

        <div className="relative aspect-square bg-slate-200 dark:bg-slate-900 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
          {/* Grid Rendering */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some(p => p.x === x && p.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className={`w-full h-full flex items-center justify-center transition-colors duration-200 ${
                    (x + y) % 2 === 0 ? 'bg-slate-100/50 dark:bg-slate-800/20' : 'bg-transparent'
                  }`}
                >
                  {isSnakeHead && (
                    <div className="w-[90%] h-[90%] bg-blue-600 rounded-sm shadow-sm z-10 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full mx-0.5" />
                      <div className="w-1 h-1 bg-white rounded-full mx-0.5" />
                    </div>
                  )}
                  {isSnakeBody && <div className="w-[80%] h-[80%] bg-blue-400 dark:bg-blue-500 rounded-sm" />}
                  {isFood && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Apple className="w-[80%] h-[80%] text-red-500 fill-red-500" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {(status === 'idle' || status === 'gameover') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-[80%]">
                  <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {status === 'idle' ? (lang === 'zh' ? '貪吃蛇大挑戰' : 'Snake Challenge') : (lang === 'zh' ? '遊戲結束' : 'Game Over')}
                  </h2>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {status === 'idle' ? <Play className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                    {status === 'idle' ? (lang === 'zh' ? '開始遊戲' : 'Start') : (lang === 'zh' ? '再試一次' : 'Try Again')}
                  </button>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '使用方向鍵控制' : 'Use arrow keys to control'}
                  </p>
                </div>
              </motion.div>
            )}
            {status === 'ready' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center z-20"
              >
                <div className="text-white text-lg sm:text-xl font-bold animate-pulse px-6 py-3 bg-slate-900/80 rounded-full shadow-lg text-center">
                  {lang === 'zh' ? '按下任意方向鍵開始' : 'Press any arrow key to start'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto mt-4 sm:hidden">
          <div />
          <button onClick={() => handleDirectionInput('UP')} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center justify-center"><ChevronUp/></button>
          <div />
          <button onClick={() => handleDirectionInput('LEFT')} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center justify-center"><ChevronLeft/></button>
          <button onClick={() => handleDirectionInput('DOWN')} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center justify-center"><ChevronDown/></button>
          <button onClick={() => handleDirectionInput('RIGHT')} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center justify-center"><ChevronRight/></button>
        </div>
      </div>
    </div>
  );
}
