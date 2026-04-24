import { useState, useEffect } from 'react';
import MapGame from './components/MapGame';
import TypeGame from './components/TypeGame';
import SnakeGame from './components/SnakeGame';
import OrbitSimulation from './components/OrbitSimulation';
import { MapPin, Keyboard, Sun, Moon, Languages, Gamepad2, Home, Globe2, Orbit } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState<'menu' | 'map' | 'type' | 'snake' | 'orbit'>('menu');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden transition-colors">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex justify-between items-center z-50 shadow-sm shrink-0">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('menu')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-xs sm:text-base whitespace-nowrap ${tab === 'menu' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" /> {lang === 'zh' ? '主目錄' : 'Menu'}
          </button>
          <button
            onClick={() => setTab('map')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-xs sm:text-base whitespace-nowrap ${tab === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> {lang === 'zh' ? '地圖挑戰' : 'Map'}
          </button>
          <button
            onClick={() => setTab('type')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-xs sm:text-base whitespace-nowrap ${tab === 'type' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" /> {lang === 'zh' ? '名稱默寫' : 'Typing'}
          </button>
          <button
            onClick={() => setTab('snake')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-xs sm:text-base whitespace-nowrap ${tab === 'snake' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" /> {lang === 'zh' ? '貪吃蛇' : 'Snake'}
          </button>
          <button
            onClick={() => setTab('orbit')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-xs sm:text-base whitespace-nowrap ${tab === 'orbit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Orbit className="w-4 h-4 sm:w-5 sm:h-5" /> {lang === 'zh' ? '雙星軌道' : 'Orbit'}
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <a
            href="https://www.youtube.com/watch?v=xvFZjo5PgG0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline px-1 sm:px-2 whitespace-nowrap transition-colors"
          >
            {lang === 'zh' ? '點我進個人網站' : 'My Website'}
          </a>
          <button
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-colors"
          >
            <Languages className="w-5 h-5" />
            <span className="text-sm uppercase hidden sm:inline">{lang}</span>
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>
      <div className="flex-1 relative overflow-hidden">
        {tab === 'menu' && (
          <div className="h-full overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-8 text-center tracking-tight">
                {lang === 'zh' ? '遊戲與模擬目錄' : 'Games & Simulations'}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <button 
                  onClick={() => setTab('map')}
                  className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {lang === 'zh' ? '地圖挑戰' : 'Map Challenge'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '在地圖上找出指定的國家，考驗你的地理直覺！' : 'Find the specified country on the map, test your geography intuition!'}
                  </p>
                </button>

                <button 
                  onClick={() => setTab('type')}
                  className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Keyboard className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {lang === 'zh' ? '國家默寫' : 'Typing Challenge'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '在限時內盡可能拼寫出所有國家的英文名稱！' : 'Type as many country names as you can within the time limit!'}
                  </p>
                </button>

                <button 
                  onClick={() => setTab('snake')}
                  className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {lang === 'zh' ? '貪吃蛇' : 'Snake Game'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '經典貪吃蛇遊戲，支援連續轉彎與最高分紀錄！' : 'Classic snake game with continuous turns and high score tracking!'}
                  </p>
                </button>

                <button 
                  onClick={() => setTab('orbit')}
                  className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Orbit className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {lang === 'zh' ? '雙星軌道模擬' : 'Orbit Simulation'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {lang === 'zh' ? '觀察兩顆星球的引力交互作用，並可即時調節質量！' : 'Observe the gravitational interaction of two stars and adjust their mass in real-time!'}
                  </p>
                </button>

              </div>
            </div>
          </div>
        )}
        {tab === 'map' && <MapGame lang={lang} theme={theme} />}
        {tab === 'type' && <TypeGame lang={lang} theme={theme} />}
        {tab === 'snake' && <SnakeGame lang={lang} theme={theme} />}
        {tab === 'orbit' && <OrbitSimulation lang={lang} theme={theme} />}
      </div>
    </div>
  );
}
