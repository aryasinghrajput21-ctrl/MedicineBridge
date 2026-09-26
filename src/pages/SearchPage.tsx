import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Page } from '@/App';
import { searchMedicines } from '@/services/medicineService';
import type { Medicine } from '@/data/demoData';
import {
  Search,
  Pill,
  Beaker,
  Building2,
  Tag,
  Calendar,
  Store,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react';

interface SearchPageProps {
  onNavigate: (page: Page) => void;
  onSelectMedicine?: (med: Medicine) => void;
}

export default function SearchPage({ onNavigate, onSelectMedicine }: SearchPageProps) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(searchMedicines(query));
    setSearched(true);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {t.search.title}
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors whitespace-nowrap"
        >
          {t.search.searchBtn}
        </button>
      </form>

      {/* Demo data label */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
          {t.search.demoLabel}
        </span>
      </div>

      {/* Initial empty state */}
      {!searched && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-teal-400" />
          </div>
          <p className="text-slate-500 max-w-md mx-auto">{t.search.initialHint}</p>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 mb-4">{t.search.noResults}</p>
          <button
            onClick={handleClear}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            {t.search.clearBtn}
          </button>
        </div>
      )}

      {/* Result count */}
      {searched && results.length > 0 && (
        <p className="text-sm text-slate-500 mb-4">
          <span className="font-semibold text-slate-700">{results.length}</span>{' '}
          {t.search.resultCount}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-800">
                  {med.name}
                </h3>
                <span className="text-sm font-semibold text-teal-600 shrink-0">
                  ₹{med.reference_price}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {med.generic_name}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <DetailItem
                  icon={Beaker}
                  label={t.medicine.strength}
                  value={med.strength}
                />
                <DetailItem
                  icon={Pill}
                  label={t.medicine.form}
                  value={med.dosage_form}
                />
                <DetailItem
                  icon={Building2}
                  label={t.medicine.manufacturer}
                  value={med.manufacturer}
                />
                <DetailItem
                  icon={Store}
                  label={t.medicine.source}
                  value={med.source}
                />
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {t.medicine.lastUpdated}: {formatDate(med.updated_at)}
              </div>

              <button
                onClick={() => onSelectMedicine?.(med)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                {t.medicine.viewDetails}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigate to upload hint */}
      {searched && results.length === 0 && (
        <div className="text-center mt-4">
          <button
            onClick={() => onNavigate('upload')}
            className="text-teal-600 text-sm font-medium hover:underline"
          >
            {t.nav.upload}
          </button>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
