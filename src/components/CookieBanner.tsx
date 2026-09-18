import React from 'react';
import { Cookie, ShieldAlert } from 'lucide-react';
import { CookiePreferences } from '../types';

interface CookieBannerProps {
  preferences: CookiePreferences;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onOpenPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  preferences,
  onAcceptAll,
  onRejectNonEssential,
  onOpenPolicy,
}) => {
  if (preferences.answered) return null;

  return (
    <div
      id="cookie-consent-banner"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-slide-up"
      role="region"
      aria-label="إشعار ملفات تعريف الارتباط"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              إشعار ملفات تعريف الارتباط والخصوصية (Google AdSense)
            </p>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed text-xs">
              نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك وتقديم إعلانات ملائمة ومتوافقة مع معايير Google AdSense وGDPR. يمكنك اختيار قبول جميع الملفات أو الاكتفاء بالأساسية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            id="btn-cookie-policy"
            type="button"
            onClick={onOpenPolicy}
            className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium text-xs underline cursor-pointer"
          >
            عرض السياسة
          </button>
          <button
            id="btn-cookie-reject"
            type="button"
            onClick={onRejectNonEssential}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            رفض غير الأساسية
          </button>
          <button
            id="btn-cookie-accept"
            type="button"
            onClick={onAcceptAll}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            موافق على الكل
          </button>
        </div>
      </div>
    </div>
  );
};
