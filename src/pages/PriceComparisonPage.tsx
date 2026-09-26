import { useLang } from '@/context/LanguageContext';
import type { Page } from '@/App';
import type { Medicine } from '@/data/demoData';
import { demoPrices } from '@/data/demoData';
import { getNearbySourcesForMedicine, getGoogleMapsEmbed, getGoogleMapsLink } from '@/services/mapsService';
import {
  Store,
  Calendar,
  MapPin,
  Navigation,
  AlertCircle,
  Route,
  TrendingUp,
} from 'lucide-react';

interface PriceComparisonPageProps {
  selectedMedicine: Medicine | null;
  onNavigate: (page: Page) => void;
}

export default function PriceComparisonPage({
  selectedMedicine,
  onNavigate,
}: PriceComparisonPageProps) {
  const { t } = useLang();

  if (!selectedMedicine) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t.price.title}
        </h1>
        <p className="text-slate-500 mb-6">{t.price.subtitle}</p>
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 mb-4 max-w-sm mx-auto">
            {t.price.noMedicineSelected}
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
          >
            {t.nav.search}
          </button>
        </div>
      </div>
    );
  }

  const prices = demoPrices[selectedMedicine.id] || [];
  const nearbySources = getNearbySourcesForMedicine(selectedMedicine.id);
  const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {t.price.title}
      </h1>
      <p className="text-slate-500 mb-6">{t.price.subtitle}</p>

      {/* Medicine header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedMedicine.name} {selectedMedicine.strength}
            </h2>
            <p className="text-sm text-slate-500">{selectedMedicine.generic_name}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium shrink-0">
            {t.price.demoLabel}
          </span>
        </div>
      </div>

      {/* Price table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h2 className="font-semibold text-slate-700">
            {t.price.referencePrice}
          </h2>
        </div>
        {/* Desktop table */}
        <table className="w-full hidden sm:table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-sm font-semibold text-slate-600">
                {t.price.source}
              </th>
              <th className="text-right px-5 py-3 text-sm font-semibold text-slate-600">
                {t.price.referencePrice}
              </th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 ${
                  p.price === lowestPrice ? 'bg-green-50/50' : ''
                }`}
              >
                <td className="px-5 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-slate-400" />
                    {p.source}
                    {p.price === lowestPrice && (
                      <span className="text-xs font-medium text-green-600">
                        ★
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800 text-right">
                  ₹{p.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {prices.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-3 ${
                p.price === lowestPrice ? 'bg-green-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{p.source}</span>
                {p.price === lowestPrice && (
                  <span className="text-xs font-medium text-green-600">★</span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                ₹{p.price}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-slate-50 flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          {t.price.lastUpdated}: {formatDate(selectedMedicine.updated_at)}
        </div>
      </div>

      {/* Compare Before You Go */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-800">
            {t.price.compareBeforeYouGo}
          </h2>
        </div>

        {/* Flow: Medicine → Price → Nearby Source */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-white text-slate-700 font-medium border border-slate-200">
            {selectedMedicine.name}
          </span>
          <span className="text-teal-500">→</span>
          <span className="px-3 py-1 rounded-full bg-white text-slate-700 font-medium border border-slate-200">
            ₹{selectedMedicine.reference_price}
          </span>
          <span className="text-teal-500">→</span>
          <span className="px-3 py-1 rounded-full bg-white text-slate-700 font-medium border border-slate-200">
            {t.price.nearbySources}
          </span>
        </div>

        {/* Nearby sources list */}
        <div className="space-y-3">
          {nearbySources.slice(0, 3).map((src) => (
            <div
              key={src.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    src.type === 'jan_aushadhi'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {src.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {src.address}
                  </p>
                  <p className="text-xs text-teal-600 font-medium mt-1">
                    {t.price.distance}: {src.distance_km} km
                  </p>
                </div>
              </div>
              <a
                href={getGoogleMapsLink(src.lat, src.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                {t.nearby.getDirections}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Map embed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h2 className="font-semibold text-slate-700">{t.price.map}</h2>
        </div>
        <iframe
          title="map"
          src={getGoogleMapsEmbed(
            nearbySources[0]?.lat || 28.6139,
            nearbySources[0]?.lng || 77.209
          )}
          className="w-full h-64 border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
