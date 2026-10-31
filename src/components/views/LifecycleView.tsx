import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { ProductLifecycleRecord, LifecycleStatus } from '../../types';
import { VerificationBadge } from '../common/Badges';
import {
  History,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Smartphone,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const LifecycleView: React.FC = () => {
  const {
    filteredLifecycle,
    devices,
    platforms,
    setSelectedDevice,
    updateFilter,
  } = usePlatform();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const displayedRecords = filteredLifecycle.filter((rec) => {
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
      return false;
    }
    if (!localSearch) return true;
    const q = localSearch.toLowerCase();
    return (
      rec.productName.toLowerCase().includes(q) ||
      rec.successorProduct.toLowerCase().includes(q) ||
      rec.migrationNotes.toLowerCase().includes(q) ||
      rec.deviceIds.some((d) => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Zebra Product Lifecycle Intelligence
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {filteredLifecycle.length} Products Indexed
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Published end-of-sale (EOS), end-of-engineering-support (EOES), end-of-service-life (EOSL) dates and recommended successor migration hardware.
          </p>
        </div>
      </div>

      {/* Lifecycle Notice */}
      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-[11px] leading-relaxed">
          Official lifecycle policy: Published dates reflect Zebra Technologies formal Product Discontinuation Bulletins. Where dates are unavailable or for internal prototype candidate devices, the system labels records as <strong className="text-amber-300">Not Verified</strong> rather than estimating fictional dates.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by product name, successor, or device ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Lifecycle Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Lifecycle Stages</option>
            <option value="Active / GA">Active / GA</option>
            <option value="Mature">Mature</option>
            <option value="End of Sale">End of Sale</option>
            <option value="End of Engineering Support">End of Engineering Support</option>
            <option value="End of Service Life">End of Service Life</option>
            <option value="Not Verified">Not Verified (Internal/Prototype)</option>
          </select>
        </div>
      </div>

      {/* Lifecycle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedRecords.map((rec) => {
          const plat = platforms.find((p) => p.id === rec.platformId);
          return (
            <div
              key={rec.productId}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{rec.productName}</h3>
                    <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                      {plat ? plat.name.split(':')[0] : rec.platformId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        rec.status === 'Active / GA'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : rec.status === 'Mature'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : rec.status === 'Not Verified'
                          ? 'bg-slate-900 text-slate-400 border-slate-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                    <div className="mt-1">
                      <VerificationBadge state={rec.verificationState} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Milestone Dates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Intro Date
                    </span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {rec.introductionDate}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      End of Sale
                    </span>
                    <span className="font-mono text-amber-300 text-[11px]">
                      {rec.endOfSaleDate || 'Not Published'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Engineering EOS
                    </span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {rec.endOfEngineeringSupportDate || 'Active'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Service EOSL
                    </span>
                    <span className="font-mono text-rose-300 text-[11px]">
                      {rec.endOfServiceLifeDate || 'Supported'}
                    </span>
                  </div>
                </div>

                {/* Successor & Migration Notes */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-semibold text-slate-300 block text-[11px]">
                    Recommended Successor & Migration Path:
                  </span>
                  <p className="text-cyan-300 font-medium text-xs flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {rec.successorProduct}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {rec.migrationNotes}
                  </p>
                </div>
              </div>

              {/* Devices and Bulletin Link */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Hardware BOMs:</span>
                  {rec.deviceIds.map((dId) => (
                    <span
                      key={dId}
                      className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300"
                    >
                      {dId}
                    </span>
                  ))}
                </div>

                {rec.bulletinUrl && (
                  <a
                    href={rec.bulletinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    Official Bulletin
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
