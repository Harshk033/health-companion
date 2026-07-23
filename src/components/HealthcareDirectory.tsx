import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Search,
  Navigation,
  Clock,
  Building2,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';
import { HealthcareFacility, Language } from '../types';
import { MOCK_FACILITIES } from '../data/facilities';
import { t } from '../utils/i18n';

interface HealthcareDirectoryProps {
  language: Language;
}

export const HealthcareDirectory: React.FC<HealthcareDirectoryProps> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Hospital', 'Urgent Care', 'Clinic', 'Pharmacy', 'Diagnostic'];

  const filteredFacilities = MOCK_FACILITIES.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      fac.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || fac.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg space-y-2 text-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>Local Medical Directory & Emergency Services</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
          {t(language, 'directory.title')}
        </h2>
        <p className="text-xs text-slate-600 max-w-xl font-medium">
          {t(language, 'directory.subtitle')}
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="p-4 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 space-y-3 shadow-lg text-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, 'directory.searchPlaceholder')}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-600 shadow-2xs"
              id="directory-search-input"
            />
          </div>

          {/* Category Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white/70 text-slate-700 hover:bg-white border border-white/80 shadow-2xs'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.id}
            className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg hover:bg-white/60 transition-all flex flex-col justify-between space-y-4 text-slate-800"
          >
            <div className="space-y-3">
              {/* Header: Name, Distance & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200 uppercase">
                      {fac.type}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {fac.rating}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{fac.name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-teal-700">{fac.distanceKm} km away</div>
                  <div
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      fac.isOpen24_7 || fac.isOpenNow
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {fac.isOpen24_7 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t(language, 'directory.open247')}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>{t(language, 'directory.openNow')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{fac.address}</span>
              </p>

              {/* Specialty Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {fac.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-slate-700 border border-slate-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Call & Directions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <a
                href={`tel:${fac.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/80 hover:bg-white text-teal-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t(language, 'directory.call')} ({fac.phone})</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.name + ' ' + fac.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>{t(language, 'directory.directions')}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
