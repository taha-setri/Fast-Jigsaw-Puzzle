import React from 'react';
import { X, HelpCircle, ArrowUpDown, MousePointerClick, Smartphone, Lightbulb } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-how-to-play"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-white">
              كيفية لعب لغز ترتيب الصور والأرقام
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <MousePointerClick className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                1. النقر للتحريك (Click & Tap)
              </h4>
              <p>
                انقر على أي قطعة مجاورة للمربع الفارغ، أو انقر على أي قطعة في نفس الصف أو العمود لتحريكها دفعة واحدة بسلاسة نحو الفراغ.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                2. لوحة المفاتيح (Keyboard Controls)
              </h4>
              <p>
                استخدم أسهم لوحة المفاتيح (↑ ↓ ← →) أو مفاتيح (W, A, S, D) لدفع القطع بسلاسة داخل الشبكة.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                3. السحب باللمس على الجوال (Swipe Gestures)
              </h4>
              <p>
                يمكنك التمرير بإصبعك في أي اتجاه على شاشة الهاتف لدفع القطع نحو الفراغ بسرعة وسهولة.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                4. نصيحة ذهبية للحل السريع
              </h4>
              <p>
                ابدأ بترتيب الصف العلوي أولاً من اليسار لليمين، ثم الصف الذي يليه، حتى تصل إلى آخر صفين وقم بحلهما سوياً. في نمط الصور، يمكنك تفعيل "أرقام المساعدة" لمعرفة الترتيب بسهولة!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800/60">
            <Lightbulb className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-0.5">
                5. قواعد لعبة الذاكرة (Memory Match)
              </h4>
              <p>
                اقلب بطاقتين في كل محاولة. إذا كان الرمز متطابقاً تظل البطاقتان مكشوفتين، وإذا اختلفا تنقلبان مجدداً. استخدم زر الكشف السريع للحصول على تلميح سريع لجميع البطاقات!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-cyan-50/70 dark:bg-cyan-950/40 p-3 rounded-xl border border-cyan-200 dark:border-cyan-800/60">
            <Lightbulb className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-cyan-900 dark:text-cyan-200 mb-0.5">
                6. قواعد لعبة الأنابيب (Smart Pipes Flow)
              </h4>
              <p>
                انقر على أي أنبوب لتدويره بزاوية 90 درجة. الهدف هو ربط خط أنابيب مستمر غير منقطع من نقطة "البداية" (أعلى اليمين) حتى نقطة "الهدف" (أسفل اليسار).
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
        >
          فهمت ذلك، هيا بنا نلعب!
        </button>
      </div>
    </div>
  );
};
