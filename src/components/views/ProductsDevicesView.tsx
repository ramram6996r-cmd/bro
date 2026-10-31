import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Device } from '../../types';
import { VerificationBadge } from '../common/Badges';
import {
  Smartphone,
  Search,
  ExternalLink,
  ShieldAlert,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  Cpu,
  FileDown,
  GitCompare,
  X,
} from 'lucide-react';

export const ProductsDevicesView: React.FC = () => {
  const {
    filteredDevices,
    setSelectedDevice,
    setSelectedCVE,
    cves,
    platforms,
    updateFilter,
    filters,
  } = usePlatform();

  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Device>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Search filter
  const displayedDevices = useMemo(() => {
    let list = filteredDevices.filter((d) => {
      if (!localSearch) return true;
      const q = localSearch.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.modelNumber.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.supportedOS.some((os) => os.toLowerCase().includes(q)) ||
        d.components.some((c) => c.toLowerCase().includes(q))
      );
    });

    list = [...list].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredDevices, localSearch, sortField, sortAsc]);

  const handleSort = (field: keyof Device) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare a maximum of 3 devices simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const devicesToCompare = filteredDevices.filter((d) =>
    selectedForComparison.includes(d.id)
  );

  const exportCSV = () => {
    const headers = [
      'Device ID',
      'Name',
      'Model Number',
      'Product Family',
      'Platform',
      'Verification State',
      'Lifecycle Status',
      'Latest Release',
      'Open CVEs',
      'Open Defects',
    ];
    const rows = displayedDevices.map((d) => [
      `"${d.id}"`,
      `"${d.name}"`,
      `"${d.modelNumber}"`,
      `"${d.productFamily}"`,
      `"Platform ${d.platformNumericId}"`,
      `"${d.verificationState}"`,
      `"${d.lifecycleStatus}"`,
      `"${d.latestVerifiedRelease}"`,
      d.openRelevantCVECount,
      d.openRelevantDefectCount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zebra-devices-catalog-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Zebra Products & Device Catalog
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {displayedDevices.length} Mapped
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified commercial devices & internal candidate identifiers (e.g. 4490, 33605, 5841) with explicit verification confidence states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedForComparison.length > 0 && (
            <button
              type="button"
              onClick={() => setIsComparing(true)}
              className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-purple-950 cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForComparison.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Candidate Notice */}
      <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-600/60 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-200/90 text-[11px] leading-relaxed">
            <strong>Candidate Identifiers Notice:</strong> Example hardware identifiers (e.g. 4490, 33605, 5841) originate from internal Jira engineering branch bring-ups. They are flagged as <em>Requires Verification</em> until formal BOM reconciliation.
          </span>
        </div>
        <button
          type="button"
          onClick={() => updateFilter('deviceIds', ['4490', '33605', '5841'])}
          className="px-2.5 py-1 rounded bg-amber-950 border border-amber-600 text-amber-300 font-bold text-[10px] hover:bg-amber-900 shrink-0 cursor-pointer"
        >
          Filter Candidates Only
        </button>
      </div>

      {/* Local Filter / Search bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by device ID, name, silicon model, or OS..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {displayedDevices.length} of {filteredDevices.length} devices
        </div>
      </div>

      {/* Devices Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3 w-10 text-center">Compare</th>
                <th
                  onClick={() => handleSort('id')}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Device ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Device Name / Family</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Platform</th>
                <th className="p-3">Verification State</th>
                <th className="p-3">Supported OS / FW</th>
                <th className="p-3">Latest Release</th>
                <th className="p-3 text-center">CVEs</th>
                <th className="p-3 text-center">Jira Defects</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedDevices.map((dev) => {
                const plat = platforms.find((p) => p.id === dev.platformId);
                const isSelectedForComp = selectedForComparison.includes(dev.id);

                return (
                  <tr
                    key={dev.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelectedForComp}
                        onChange={() => toggleComparison(dev.id)}
                        className="rounded border-slate-700 text-purple-600 bg-slate-950 focus:ring-0 cursor-pointer"
                        title="Select to compare"
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-cyan-300 text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {dev.id}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <span
                          onClick={() => setSelectedDevice(dev)}
                          className="font-bold text-slate-100 hover:text-cyan-300 cursor-pointer transition-colors block"
                        >
                          {dev.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {dev.modelNumber} • {dev.productFamily}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
                        {plat ? `P${plat.numericId}: ${plat.codeName}` : `P${dev.platformNumericId}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <VerificationBadge state={dev.verificationState} size="sm" />
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      <div className="truncate max-w-[180px]" title={dev.supportedOS.join(', ')}>
                        {dev.supportedOS[0] || 'Standard'}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {dev.supportedFirmware[0]}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-purple-300 text-[11px] font-semibold">
                      {dev.latestVerifiedRelease}
                    </td>
                    <td className="p-3 text-center">
                      {dev.openRelevantCVECount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[11px] font-bold border border-rose-800 font-mono">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          {dev.openRelevantCVECount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">0</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {dev.openRelevantDefectCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[11px] font-bold border border-amber-800 font-mono">
                          <GitPullRequest className="w-3 h-3 text-amber-400" />
                          {dev.openRelevantDefectCount}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">0</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDevice(dev)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-side Device Comparison Modal */}
      {isComparing && devicesToCompare.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-5xl max-h-[90vh] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Side-by-Side Hardware & Platform Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComparing(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {devicesToCompare.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
                  >
                    <div className="border-b border-slate-800 pb-3">
                      <span className="font-mono text-cyan-300 font-extrabold text-base px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {d.id}
                      </span>
                      <h4 className="font-bold text-slate-100 text-sm mt-2">{d.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{d.modelNumber}</p>
                      <div className="mt-2">
                        <VerificationBadge state={d.verificationState} size="sm" />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 text-[11px] block uppercase">
                        Platform Architecture
                      </span>
                      <p className="text-cyan-300 font-semibold">
                        Platform {d.platformNumericId}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 text-[11px] block uppercase">
                        Hardware Generation
                      </span>
                      <p className="text-slate-300 font-mono text-[11px]">
                        {d.hardwareGeneration}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 text-[11px] block uppercase">
                        Supported OS
                      </span>
                      <ul className="text-slate-300 text-[11px] space-y-0.5">
                        {d.supportedOS.map((os) => (
                          <li key={os}>• {os}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 text-[11px] block uppercase">
                        Key Components
                      </span>
                      <p className="text-slate-400 text-[11px] font-mono">
                        {d.components.join(', ')}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 text-[11px] block uppercase">
                        Open CVE Vulnerabilities
                      </span>
                      <span className="font-bold text-rose-400 font-mono">
                        {d.openRelevantCVECount} CVEs
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsComparing(false);
                          setSelectedDevice(d);
                        }}
                        className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Open Full Specification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
