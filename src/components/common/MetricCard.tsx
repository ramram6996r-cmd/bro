import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  calculation: string;
  reportingPeriod: string;
  dataSource: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label: string;
  };
  severityLevel?: 'normal' | 'warning' | 'critical' | 'success';
  onDrilldown?: () => void;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  calculation,
  reportingPeriod,
  dataSource,
  trend,
  severityLevel = 'normal',
  onDrilldown,
  icon,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const borderClass =
    severityLevel === 'critical'
      ? 'border-rose-800/80 hover:border-rose-600 bg-slate-900/90 shadow-sm shadow-rose-950/40'
      : severityLevel === 'warning'
      ? 'border-amber-700/70 hover:border-amber-500 bg-slate-900/90 shadow-sm shadow-amber-950/30'
      : severityLevel === 'success'
      ? 'border-emerald-800/70 hover:border-emerald-500 bg-slate-900/90'
      : 'border-slate-800 hover:border-slate-700 bg-slate-900/80';

  const valueColor =
    severityLevel === 'critical'
      ? 'text-rose-400'
      : severityLevel === 'warning'
      ? 'text-amber-400'
      : severityLevel === 'success'
      ? 'text-emerald-400'
      : 'text-slate-100';

  return (
    <div
      className={`relative rounded-lg p-4 border transition-all duration-150 flex flex-col justify-between group ${borderClass}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
          </div>
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition-colors"
            title="View calculation formula and data provenance"
            aria-label="Metric calculation info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-2xl font-bold tracking-tight font-mono ${valueColor}`}>{value}</span>
          {subtitle && <span className="text-xs text-slate-400 font-normal">{subtitle}</span>}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 text-xs mt-1">
            <span
              className={`font-semibold font-mono ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-slate-500 text-[11px]">{trend.label}</span>
          </div>
        )}
      </div>

      {/* Expandable Formula & Data Source Info */}
      {showFormula && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded">
          <p className="font-semibold text-slate-200 mb-0.5">Formula:</p>
          <p className="text-cyan-300/90 font-mono text-[10px] mb-1.5">{calculation}</p>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            <span>Period: {reportingPeriod}</span>
            <span className="text-emerald-400/90">{dataSource}</span>
          </div>
        </div>
      )}

      {/* Drill-down action bar */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 text-[10px]">{dataSource}</span>
        {onDrilldown && (
          <button
            type="button"
            onClick={onDrilldown}
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline font-medium cursor-pointer"
          >
            Drill-down
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
