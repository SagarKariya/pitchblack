import React, { useState } from 'react';
import { FullDiligenceReport, QuantitativeMetric } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  ArrowRight,
  Scale,
  Sliders,
  BarChart3,
} from 'lucide-react';
import { BENCHMARK_METRICS, BenchmarkFramework } from './BenchmarksPage';

interface MetricsPillarProps {
  report: FullDiligenceReport;
  onNavigateToBenchmarks?: (framework?: BenchmarkFramework) => void;
}

export const MetricsPillar: React.FC<MetricsPillarProps> = ({ report, onNavigateToBenchmarks }) => {
  const metrics = Array.isArray(report?.metrics) ? report.metrics : [];
  const companyName = report?.companyName || 'Target Startup';
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TOP_QUARTILE' | 'MEDIAN' | 'UNDERPERFORMING'>('ALL');

  const topQuartileCount = metrics.filter((m) => m?.status === 'TOP_QUARTILE').length;
  const medianCount = metrics.filter((m) => m?.status === 'MEDIAN').length;
  const underperformingCount = metrics.filter((m) => m?.status === 'UNDERPERFORMING').length;

  const getBenchmarkReference = (metric?: QuantitativeMetric | null) => {
    if (!metric) {
      return {
        id: 'metric-ref',
        framework: 'a16z' as BenchmarkFramework,
        name: 'Venture Benchmark',
        category: 'Venture Capital Benchmark',
        diligenceContext: 'Audited against institutional top-quartile standards in the Benchmark repository.',
        formula: '',
        topQuartile: 'Top 25%',
        median: 'Median',
        redFlag: '',
        auditQuestion: '',
      };
    }

    const metricIdStr = String(metric.id ?? '').toLowerCase();
    const metricNameStr = String(metric.name ?? '').toLowerCase();
    const norm = `${metricNameStr} ${metricIdStr}`.trim();
    
    const match = BENCHMARK_METRICS.find((bm) => {
      if (!bm) return false;
      const bmIdStr = String(bm.id ?? '').toLowerCase();
      const bmNameStr = String(bm.name ?? '').toLowerCase();
      const bmNorm = `${bmNameStr} ${bmIdStr}`.trim();

      if (metricIdStr && bmIdStr && (metricIdStr.includes(bmIdStr) || bmIdStr.includes(metricIdStr))) return true;
      if (norm.includes('rule of 40') && bmNorm.includes('rule of 40')) return true;
      if ((norm.includes('retention') || norm.includes('nrr') || norm.includes('ndr')) && (bmNorm.includes('retention') || bmNorm.includes('nrr') || bmNorm.includes('ndr'))) return true;
      if (norm.includes('gross margin') && bmNorm.includes('gross margin')) return true;
      if (norm.includes('cac payback') && bmNorm.includes('cac payback')) return true;
      if (norm.includes('burn multiple') && bmNorm.includes('burn multiple')) return true;
      if (norm.includes('churn') && bmNorm.includes('churn')) return true;
      if (norm.includes('magic number') && bmNorm.includes('magic number')) return true;
      if (norm.includes('growth') && bmNorm.includes('growth')) return true;
      if (norm.includes('gmv') && bmNorm.includes('gmv')) return true;
      return false;
    });

    return match || {
      id: String(metric.id ?? 'metric-ref'),
      framework: 'a16z' as BenchmarkFramework,
      name: metric.name || 'Venture Benchmark',
      category: 'Venture Capital Benchmark',
      diligenceContext: 'Audited against institutional top-quartile standards in the Benchmark repository.',
      formula: metric.formula || '',
      topQuartile: metric.topQuartile || 'Top 25%',
      median: metric.median || 'Median',
      redFlag: '',
      auditQuestion: '',
    };
  };

  const getFrameworkBadge = (framework?: string) => {
    switch (framework) {
      case 'a16z':
        return { label: 'a16z 16 Metrics', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'bessemer':
        return { label: 'Bessemer Cloud Standards', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'sequoia':
        return { label: 'Sequoia Crucible Framework', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'benchmark':
        return { label: 'Benchmark Capital Lens', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      default:
        return { label: 'Institutional Benchmark', color: 'text-zinc-800 bg-zinc-50 border-zinc-200' };
    }
  };

  const getStatusBadge = (status: 'TOP_QUARTILE' | 'MEDIAN' | 'UNDERPERFORMING') => {
    switch (status) {
      case 'TOP_QUARTILE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Top Quartile
          </span>
        );
      case 'MEDIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3 h-3 text-blue-600" /> Median
          </span>
        );
      case 'UNDERPERFORMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-600" /> Underperforming
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar 04 Banner Header - Institutional Visual Similarity */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full border border-zinc-200 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                Pillar 04 · Financial & Growth Metrics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              Institutional audit of 16 core metrics and SaaS benchmarks, evaluating reported operational figures against top-tier venture capital thresholds (a16z, Bessemer Cloud Index, and OpenView SaaS benchmarks).
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl self-start md:self-auto shadow-xs shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${underperformingCount === 0 ? 'bg-emerald-500 animate-pulse' : underperformingCount <= 2 ? 'bg-blue-500' : 'bg-rose-500 animate-pulse'}`} />
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Benchmark Audit</div>
              <span className="text-xs font-bold text-zinc-900">
                {topQuartileCount} Top Quartile · {underperformingCount} Flagged
              </span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-100">
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-500 block">Total Audited Metrics</span>
            <div className="text-lg font-black text-zinc-900 mt-0.5 tabular-nums">
              {metrics.length} Quantitative KPIs
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-700 block">Top Quartile (Outliers)</span>
            <div className="text-lg font-black text-emerald-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {topQuartileCount}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((topQuartileCount / (metrics.length || 1)) * 100)}%)</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-700 block">Median Standard</span>
            <div className="text-lg font-black text-blue-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {medianCount}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((medianCount / (metrics.length || 1)) * 100)}%)</span>
            </div>
          </div>
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-700 block">Underperforming Redlines</span>
            <div className="text-lg font-black text-rose-700 mt-0.5 tabular-nums flex items-baseline gap-1.5">
              {underperformingCount}
              <span className="text-[11px] font-normal text-zinc-500">({Math.round((underperformingCount / (metrics.length || 1)) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Status Filter Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200/90 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Metrics ({metrics.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('TOP_QUARTILE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'TOP_QUARTILE'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-zinc-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Top Quartile ({metrics.filter((m) => m.status === 'TOP_QUARTILE').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('MEDIAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'MEDIAN'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-zinc-600 hover:text-blue-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Median ({metrics.filter((m) => m.status === 'MEDIAN').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('UNDERPERFORMING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'UNDERPERFORMING'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-zinc-600 hover:text-rose-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Underperforming ({metrics.filter((m) => m.status === 'UNDERPERFORMING').length})</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 font-medium px-3 hidden md:block">
          Benchmarked against Series A/B quartile thresholds
        </div>
      </div>

      {/* PRIMARY METRICS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Core Benchmark Scorecards ({statusFilter === 'ALL' ? metrics.length : metrics.filter((m) => m.status === statusFilter).length} Displayed)
          </h3>
          <span className="text-[11px] text-zinc-400 font-medium">a16z & Bessemer Venture Standards</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(statusFilter === 'ALL'
            ? metrics
            : metrics.filter((m) => m.status === statusFilter)
          ).map((metric) => {
            const scorePct =
              metric.status === 'TOP_QUARTILE' ? 88 : metric.status === 'MEDIAN' ? 58 : 28;
            const barColor =
              metric.status === 'TOP_QUARTILE'
                ? 'bg-emerald-500'
                : metric.status === 'MEDIAN'
                ? 'bg-blue-500'
                : 'bg-rose-500';

            const bmRef = getBenchmarkReference(metric);
            const fwBadge = getFrameworkBadge(bmRef.framework);

            return (
              <div
                key={metric.id}
                className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-zinc-300"
              >
                <div>
                  {/* Header: Category Attribution & Status Badge */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-zinc-100">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate">
                      {bmRef.category}
                    </span>
                    {getStatusBadge(metric.status)}
                  </div>

                  {/* Metric Name */}
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                      {metric.name}
                    </h3>
                  </div>

                  {/* Reported Value */}
                  <div className="mb-3">
                    <div className="text-xs uppercase font-medium text-zinc-500">Company Reported</div>
                    <div className="text-2xl font-extrabold tabular-nums text-zinc-900 tracking-tight mt-0.5">
                      {metric.reported}
                    </div>
                  </div>

                  {/* Visual Position Gauge */}
                  <div className="mb-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-medium mb-1">
                      <span className={metric.status === 'UNDERPERFORMING' ? 'text-rose-700 font-bold' : ''}>Underperforming</span>
                      <span className={metric.status === 'MEDIAN' ? 'text-blue-700 font-bold' : ''}>Median</span>
                      <span className={metric.status === 'TOP_QUARTILE' ? 'text-emerald-700 font-bold' : 'text-emerald-700/80 font-semibold'}>Top Quartile</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Benchmark comparison row */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 mb-3 text-xs">
                    <div>
                      <div className="text-zinc-500 text-[10px]">Top Quartile</div>
                      <div className="text-emerald-700 font-bold mt-0.5 tabular-nums">{metric.topQuartile}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px]">Median Series A/B</div>
                      <div className="text-zinc-800 font-medium mt-0.5 tabular-nums">{metric.median}</div>
                    </div>
                  </div>

                  {/* Cross-Reference to Benchmark Tab */}
                  <div className="bg-zinc-50/90 border border-zinc-200/80 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-[11px] font-medium text-zinc-600 truncate">
                        Ref: <strong className="text-zinc-900">{fwBadge.label}</strong>
                      </span>
                    </div>
                    {onNavigateToBenchmarks && (
                      <button
                        type="button"
                        onClick={() => onNavigateToBenchmarks(bmRef.framework as BenchmarkFramework)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer shrink-0"
                        title="Inspect formula, quartile data & partner questions in Benchmark Tab"
                      >
                        <span>Benchmark Tab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Qualitative Analysis */}
                  <p className="text-xs text-zinc-700 leading-relaxed mb-3">
                    {metric.analysis}
                  </p>
                </div>

                {/* Institutional Standard Footer */}
                <div className="pt-3 border-t border-zinc-100 flex items-start gap-1.5 text-[11px] text-zinc-500">
                  <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{metric.institutionalStandard}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
