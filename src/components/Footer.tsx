import React from 'react';
import { ShieldCheck, HelpCircle, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenHowToPlay: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenHowToPlay,
}) => {
  return (
    <footer id="app-footer" className="mt-12 w-full border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6 text-center">
        {/* Network & Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <button
            id="footer-link-how-to-play"
            type="button"
            onClick={onOpenHowToPlay}
            className="inline-flex items-center gap-1.5 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>كيفية اللعب وقواعد الألغاز</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <button
            id="footer-link-privacy"
            type="button"
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>سياسة الخصوصية وملفات تعريف الارتباط (AdSense)</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <a
            id="footer-link-previous-platform"
            href="https://smart-decoration-platform-and-emoji-ten.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-amber-500 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>منصة الزخرفة والرموز التعبيرية</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* SEO Explanatory Paragraph for Google AdSense & Search Crawlers */}
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          منصة "لغز ترتيب الصور المقطعة وألعاب الذكاء السريعة" هي منصة ويب ترفيهية وتعليمية خفيفة وتفاعلية، تضم ألعاب الألغاز المنطقية مثل لغز المربعات المنزلقة (15-Puzzle)، ولعبة تطابق الذاكرة الصورية (Memory Match)، ولعبة توصيل الأنابيب والتدفق الذكي (Smart Pipes Flow)، صُممت لتنمية سرعة البديهة والذكاء المكاني، وتعمل مباشرة على المتصفح بدون تحميل ومتوافقة تماماً مع شاشات الهواتف والحواسيب.
        </p>

        {/* Clear Copyright Notice */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80">
          <p
            id="copyright-notice"
            className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide"
          >
            Taha Setri - © 2026 جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};
