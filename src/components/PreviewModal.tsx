import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { PuzzleImage } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: PuzzleImage;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  image,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-image-preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              معاينة الصورة الأصلية: {image.name}
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

        <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          ركز في تفاصيل الصورة لمساعدتك على ترتيب القطع المقطعة وإعادتها لوضعها الطبيعي.
        </p>
      </div>
    </div>
  );
};
