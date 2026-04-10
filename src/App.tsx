import { useState, useEffect } from 'react';
import MapGame from './components/MapGame';
import TypeGame from './components/TypeGame';
import SnakeGame from './components/SnakeGame';
import { MapPin, Keyboard, Sun, Moon, Languages, Gamepad2 } from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState<'map' | 'type' | 'snake'>('map');
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
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
        {tab === 'map' && <MapGame lang={lang} theme={theme} />}
        {tab === 'type' && <TypeGame lang={lang} theme={theme} />}
        {tab === 'snake' && <SnakeGame lang={lang} theme={theme} />}
      </div>
    </div>
  );
}
