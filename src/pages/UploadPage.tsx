import { useState, useRef, useCallback } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Page } from '@/App';
import type { ExtractedMedicine } from '@/data/demoData';
import { analyzePrescription } from '@/services/gemini';
import MedicineCard from '@/components/MedicineCard';
import {
  UploadCloud,
  ImageIcon,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Keyboard,
  Info,
  ScanLine,
  FileImage,
} from 'lucide-react';

interface UploadPageProps {
  onNavigate: (page: Page) => void;
  onResults: (medicines: ExtractedMedicine[]) => void;
  results: ExtractedMedicine[];
}

export default function UploadPage({
  onNavigate,
  onResults,
  results,
}: UploadPageProps) {
  const { t } = useLang();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(results.length > 0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(t.upload.badImage);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    },
    [t.upload.badImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleAnalyze = async () => {
    if (!image) {
      setError(t.upload.noImage);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePrescription(image, (msg) => {
        setLoadingMsg(msg);
      });
      if (result.error) {
        setError(result.error);
      } else if (result.unclear) {
        setError(t.upload.unclearDesc);
      } else {
        onResults(result.medicines);
        setHasResults(true);
      }
    } catch {
      setError(t.upload.genericError);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleRemove = () => {
    setImage(null);
    setHasResults(false);
    onResults([]);
  };

  const loadingMessages: Record<string, string> = {
    loading1: t.upload.loading1,
    loading2: t.upload.loading2,
    loading3: t.upload.loading3,
  };

  // Results view
  if (hasResults && results.length > 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {t.upload.resultsTitle}
          </h1>
          <p className="text-slate-500">
            <span className="font-semibold text-teal-600">
              {results.length}
            </span>{' '}
            {t.upload.resultsCount}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {results.map((med, i) => (
            <MedicineCard
              key={i}
              medicine={med}
              onComparePrices={() => onNavigate('price')}
              onFindNearby={() => onNavigate('nearby')}
            />
          ))}
        </div>
        <button
          onClick={handleRemove}
          className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t.upload.uploadAnother}
        </button>
      </div>
    );
  }

  // Upload form view
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t.upload.title}
        </h1>
        <p className="text-slate-500">{t.upload.subtitle}</p>
      </div>

      {/* Dropzone */}
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-teal-500 bg-teal-50 scale-[1.01]'
              : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/30'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
              isDragging ? 'bg-teal-100' : 'bg-teal-50'
            }`}
          >
            <UploadCloud
              className={`w-8 h-8 transition-colors ${
                isDragging ? 'text-teal-700' : 'text-teal-600'
              }`}
            />
          </div>
          <p className="text-slate-600 font-medium mb-1">
            {isDragging ? t.upload.dropzoneActive : t.upload.dropzone}
          </p>
          <p className="text-sm text-slate-400 mb-4">{t.upload.or}</p>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium">
            <ImageIcon className="w-4 h-4" />
            {t.upload.chooseFile}
          </span>
          <p className="text-xs text-slate-400 mt-4">
            {t.upload.supportedFormats}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={image}
            alt="Prescription"
            className="w-full max-h-96 object-contain"
          />
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 shadow text-xs text-slate-600 font-medium">
            <FileImage className="w-3.5 h-3.5" />
            {t.upload.supportedFormats}
          </div>
        </div>
      )}

      {/* Hint */}
      {image && (
        <div className="flex items-start gap-2 mt-4 text-sm text-slate-500">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{t.upload.hint}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            {error === t.upload.unclearDesc && (
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button
                  onClick={handleAnalyze}
                  className="px-4 py-2 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.upload.checkAgain}
                </button>
                <button
                  onClick={() => onNavigate('search')}
                  className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  {t.upload.enterManually}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-teal-700 font-medium">
            {loadingMsg ? loadingMessages[loadingMsg] : t.upload.loading1}
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <div className={`w-2 h-2 rounded-full transition-colors ${loadingMsg === 'loading1' || loadingMsg === 'loading2' || loadingMsg === 'loading3' ? 'bg-teal-500' : 'bg-teal-200'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${loadingMsg === 'loading2' || loadingMsg === 'loading3' ? 'bg-teal-500' : 'bg-teal-200'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${loadingMsg === 'loading3' ? 'bg-teal-500' : 'bg-teal-200'}`} />
          </div>
        </div>
      )}

      {/* Analyze button */}
      {image && !loading && (
        <button
          onClick={handleAnalyze}
          className="mt-6 w-full px-6 py-3.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <ScanLine className="w-5 h-5" />
          {t.upload.analyze}
        </button>
      )}
    </div>
  );
}
