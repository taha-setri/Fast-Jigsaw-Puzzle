import React from 'react';
import { Sparkles, ExternalLink, Globe } from 'lucide-react';

export const NetworkBar: React.FC = () => {
  return (
    <header id="network-bar" className="sticky top-0 z-50 w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-200 text-xs sm:text-sm py-2 px-3 sm:px-6 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Network Welcome & Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline">شبكة منصات طه الستري:</span>
            <span className="text-slate-100 font-semibold">مرحباً بك في منصة ألعاب الألغاز الذكية</span>
          </div>
        </div>

        {/* Link to previous platform */}
        <div className="flex items-center gap-2">
          <a
            id="network-link-decoration"
            href="https://smart-decoration-platform-and-emoji-ten.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all text-xs font-semibold shadow-sm active:scale-95"
            title="الانتقال إلى المنصة السابقة: منصة الزخرفة والرموز التعبيرية"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>الانتقال للمنصة السابقة: منصة الزخرفة والرموز التعبيرية</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </header>
  );
};
