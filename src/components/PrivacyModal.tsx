import React from 'react';
import { X, ShieldCheck, Cookie, Lock, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { CookiePreferences } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cookiePreferences: CookiePreferences;
  onUpdatePreferences: (preferences: CookiePreferences) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  cookiePreferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const handleAcceptAll = () => {
    onUpdatePreferences({
      essential: true,
      analytics: true,
      advertising: true,
      answered: true,
    });
    onClose();
  };

  const handleRejectNonEssential = () => {
    onUpdatePreferences({
      essential: true,
      analytics: false,
      advertising: false,
      answered: true,
    });
    onClose();
  };

  return (
    <div
      id="modal-privacy-cookies"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                سياسة الخصوصية وملفات تعريف الارتباط (Privacy Policy & Cookies)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متوافقة مع معايير Google AdSense واللائحة العامة لحماية البيانات (GDPR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 mb-1.5">
              <Lock className="w-4 h-4 text-amber-500" />
              1. مقدمة والتزامنا بالخصوصية
            </h4>
            <p>
              نحن في منصة <strong>"لغز ترتيب الصور المقطعة السريع"</strong>، التي أسسها <strong>Taha Setri</strong>، نولي أقصى درجات الأهمية لخصوصية بيانات زوارنا. توضح هذه السياسة طبيعة البيانات غير الشخصية التي قد تُجمع عند استخدامك للمنصة، وكيف نستخدمها لتقديم خدمة سريعة ومجانية تماماً عبر المتصفح.
            </p>
          </div>

          {/* Section 2: AdSense compliance */}
          <div className="bg-amber-550/5 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-3.5 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Cookie className="w-4 h-4" />
              2. سياسة Google AdSense وملفات تعريف الارتباط (Cookies)
            </h4>
            <p>
              قد نستخدم شركاء إعلانيين من طرف ثالث، وفي مقدمتهم <strong>Google AdSense</strong>، لعرض الإعلانات عندما تزور موقعنا.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pr-2">
              <li>
                تستخدم Google بصفتها مورداً لطرف ثالث ملفات تعريف الارتباط (بما في ذلك ملف تعريف ارتباط <strong>DoubleClick DART</strong>) لعرض الإعلانات للمستخدمين استناداً إلى زيارتهم لهذا الموقع ومواقع أخرى على الإنترنت.
              </li>
              <li>
                تساعد ملفات تعريف الارتباط هذه Google وشركاءها في تقديم إعلانات مخصصة تناسب اهتمامات المستخدمين.
              </li>
              <li>
                يمكن للمستخدمين إلغاء الاشتراك في الإعلانات المخصصة عن طريق زيارة إعدادات الإعلانات في Google عبر الرابط:{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 dark:text-amber-400 underline font-medium"
                >
                  إعدادات إعلانات Google
                </a>.
              </li>
            </ul>
          </div>

          {/* Section 3: Local Storage */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 mb-1.5">
              <Eye className="w-4 h-4 text-indigo-500" />
              3. التخزين المحلي (Local Storage)
            </h4>
            <p>
              تستخدم اللعبة التخزين المحلي لمتصفحك فقط لحفظ أفضل أرقامك القياسية (Best Score) وتفضيلاتك (مثل الوضع الداكن أو تفضيل كتم الصوت وحالة الموافقة على ملفات تعريف الارتباط)، ولا يتم إرسال أي من هذه البيانات إلى أي خوادم خارجية أو تتبع هويتك الشخصية.
            </p>
          </div>

          {/* Section 4: User rights & Cookie preferences */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              4. خياراتك والتحكم في ملفات تعريف الارتباط
            </h4>
            <p className="mb-2">
              نمنحك التحكم الكامل في قبول أو رفض ملفات تعريف الارتباط غير الأساسية (الإعلانية والتحليلية) في أي وقت:
            </p>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">ملفات تعريف الارتباط الأساسية (Essential)</span>
                  <span className="text-[11px] text-slate-400">ضرورية لعمل اللعبة وحفظ الأرقام القياسية والتفضيلات.</span>
                </div>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                  مفعلة دائماً
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">ملفات الإعلانات والتحليلات (Google AdSense & Analytics)</span>
                  <span className="text-[11px] text-slate-400">تساعدنا في تغطية تكاليف الخوادم وعرض إعلانات ملائمة.</span>
                </div>
                <input
                  type="checkbox"
                  checked={cookiePreferences.advertising}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...cookiePreferences,
                      advertising: e.target.checked,
                      analytics: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Copyright and contact */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <p>
              <strong>حقوق الملكية الفكرية:</strong> جميع الحقوق محفوظة باسم المؤسس والمطور <strong>Taha Setri - © 2026</strong>.
            </p>
            <p className="mt-1">
              إذا كانت لديك أي استفسارات بخصوص سياسة الخصوصية، يرجى التواصل معنا عبر منصاتنا الرسمية.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            رفض غير الأساسية
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all cursor-pointer"
          >
            الموافقة على جميع ملفات تعريف الارتباط
          </button>
        </div>
      </div>
    </div>
  );
};
