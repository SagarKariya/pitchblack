import React, { useState, useMemo } from 'react';
import { FullDiligenceReport } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  Target,
  Users,
  UserPlus,
  ChevronDown,
  Table as TableIcon,
} from 'lucide-react';

export type CohortFilterType = 'ALL_COHORTS' | 'NEW_CUSTOMERS' | 'EXPANSION_REVENUE';

export interface GrowthVelocityPoint {
  month: string;
  monthIndex: number;
  quarter: string;
  endingArr: number; // in $M
  netNewArr: number; // in $k
  momGrowthPct: number; // in %
  topQuartileBenchmark: number; // in %
  medianBenchmark: number; // in %
  varianceToTopQuartile: number; // in percentage points
  velocityTier: 'BREAKOUT' | 'TOP_QUARTILE' | 'MEDIAN' | 'MODERATE' | 'SLOWDOWN';
  velocityLabel: string;
  commentary: string;

  // Cohort-specific breakdown
  newCustomerNetNewArr: number;
  newCustomerMomPct: number;
  newCustomerTopQuartile: number;
  newCustomerMedian: number;

  expansionNetNewArr: number;
  expansionMomPct: number;
  expansionTopQuartile: number;
  expansionMedian: number;
}

export interface GrowthVelocityHeatmapProps {
  report: FullDiligenceReport;
  cohortFilter?: CohortFilterType;
  onCohortFilterChange?: (filter: CohortFilterType) => void;
}

// Color scale helper for Growth Velocity Heatmap calibrated by cohort segment
export function getHeatmapColor(
  momGrowthPct: number,
  cohortFilter: CohortFilterType = 'ALL_COHORTS'
): {
  bg: string;
  text: string;
  border: string;
  fill: string;
  badgeBg: string;
} {
  let breakoutThreshold = 9.5;
  let topQuartileThreshold = 7.5;
  let medianThreshold = 5.0;
  let moderateThreshold = 3.0;

  if (cohortFilter === 'NEW_CUSTOMERS') {
    breakoutThreshold = 6.8;
    topQuartileThreshold = 5.2;
    medianThreshold = 3.4;
    moderateThreshold = 2.0;
  } else if (cohortFilter === 'EXPANSION_REVENUE') {
    breakoutThreshold = 3.8;
    topQuartileThreshold = 2.8;
    medianThreshold = 1.8;
    moderateThreshold = 1.0;
  }

  if (momGrowthPct >= breakoutThreshold) {
    // Hypergrowth / Breakout
    return {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-700',
      fill: '#059669', // Emerald 600
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  } else if (momGrowthPct >= topQuartileThreshold) {
    // Top-Quartile
    return {
      bg: 'bg-emerald-500',
      text: 'text-white',
      border: 'border-emerald-600',
      fill: '#10b981', // Emerald 500
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  } else if (momGrowthPct >= medianThreshold) {
    // Median B2B SaaS
    return {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-600',
      fill: '#2563eb', // Blue 600
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  } else if (momGrowthPct >= moderateThreshold) {
    // Moderate Growth
    return {
      bg: 'bg-amber-400',
      text: 'text-zinc-950 font-semibold',
      border: 'border-amber-500',
      fill: '#f59e0b', // Amber 500
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else {
    // Sluggish / Deceleration
    return {
      bg: 'bg-rose-500',
      text: 'text-white',
      border: 'border-rose-600',
      fill: '#e11d48', // Rose 600
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }
}

function enrichWithCohortBreakdown(
  points: any[],
  sectorTopQuartile: number,
  sectorMedian: number,
  newRatio: number = 0.65
): GrowthVelocityPoint[] {
  return points.map((p, idx) => {
    const monthRatio = Math.min(0.85, Math.max(0.35, newRatio - (idx * 0.012)));
    const newNetNew = Math.round(p.netNewArr * monthRatio);
    const expNetNew = Math.max(0, p.netNewArr - newNetNew);
    const newMom = Number((p.momGrowthPct * monthRatio).toFixed(1));
    const expMom = Number((p.momGrowthPct * (1 - monthRatio)).toFixed(1));

    const newTQ = Number((sectorTopQuartile * 0.65).toFixed(1));
    const newMed = Number((sectorMedian * 0.65).toFixed(1));
    const expTQ = Number((sectorTopQuartile * 0.35).toFixed(1));
    const expMed = Number((sectorMedian * 0.35).toFixed(1));

    return {
      ...p,
      newCustomerNetNewArr: newNetNew,
      newCustomerMomPct: newMom,
      newCustomerTopQuartile: newTQ,
      newCustomerMedian: newMed,
      expansionNetNewArr: expNetNew,
      expansionMomPct: expMom,
      expansionTopQuartile: expTQ,
      expansionMedian: expMed,
    };
  });
}

// Generate realistic 12-month data tailored to the audited company
function generateGrowthVelocityData(report: FullDiligenceReport): GrowthVelocityPoint[] {
  const company = (report.companyName || '').toLowerCase();
  const sector = report.sector || 'ENTERPRISE_AI';

  // Sector benchmarks
  const sectorTopQuartile =
    sector === 'ENTERPRISE_AI' ? 8.5 :
    sector === 'FINTECH' ? 7.8 :
    sector === 'HEALTHTECH' ? 6.5 :
    sector === 'IOT_HAAS' ? 7.2 : 8.0;

  const sectorMedian =
    sector === 'ENTERPRISE_AI' ? 5.2 :
    sector === 'FINTECH' ? 4.5 :
    sector === 'HEALTHTECH' ? 3.8 :
    sector === 'IOT_HAAS' ? 4.2 : 4.8;

  // Preset 1: CognitiveMesh AI (Strong H1 2026, starting slight token margin drag in Q3)
  if (company.includes('cognitive') || company.includes('mesh')) {
    return enrichWithCohortBreakdown([
      {
        month: "Oct '25",
        monthIndex: 0,
        quarter: 'Q4 2025',
        endingArr: 1.35,
        netNewArr: 100,
        momGrowthPct: 8.0,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.5,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Initial inbound traction from legal workflow early adopters.',
      },
      {
        month: "Nov '25",
        monthIndex: 1,
        quarter: 'Q4 2025',
        endingArr: 1.40,
        netNewArr: 50,
        momGrowthPct: 3.7,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -4.8,
        velocityTier: 'MODERATE',
        velocityLabel: 'Moderate',
        commentary: 'Pre-holiday enterprise budget freeze slowed contract signoffs.',
      },
      {
        month: "Dec '25",
        monthIndex: 2,
        quarter: 'Q4 2025',
        endingArr: 1.45,
        netNewArr: 50,
        momGrowthPct: 3.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -4.9,
        velocityTier: 'MODERATE',
        velocityLabel: 'Moderate',
        commentary: 'Founder closes 2 pilot accounts to hit $1.45M Q4 ARR target.',
      },
      {
        month: "Jan '26",
        monthIndex: 3,
        quarter: 'Q1 2026',
        endingArr: 1.60,
        netNewArr: 150,
        momGrowthPct: 10.3,
        topQuartileBenchmark: sectorTopQuartile + 0.2,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.6,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout',
        commentary: 'Q1 corporate legal budget unlocks; major investment bank expands seats.',
      },
      {
        month: "Feb '26",
        monthIndex: 4,
        quarter: 'Q1 2026',
        endingArr: 1.76,
        netNewArr: 160,
        momGrowthPct: 10.0,
        topQuartileBenchmark: sectorTopQuartile + 0.1,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.4,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout',
        commentary: 'Fast expansion in compliance audit departments.',
      },
      {
        month: "Mar '26",
        monthIndex: 5,
        quarter: 'Q1 2026',
        endingArr: 1.95,
        netNewArr: 190,
        momGrowthPct: 10.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +2.3,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout',
        commentary: 'Quarter-end closing surge; ARR reaches $1.95M.',
      },
      {
        month: "Apr '26",
        monthIndex: 6,
        quarter: 'Q2 2026',
        endingArr: 2.14,
        netNewArr: 190,
        momGrowthPct: 9.7,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.2,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout',
        commentary: 'Sustained momentum with top law firm design partners.',
      },
      {
        month: "May '26",
        monthIndex: 7,
        quarter: 'Q2 2026',
        endingArr: 2.34,
        netNewArr: 200,
        momGrowthPct: 9.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +0.8,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Continued double-digit net new additions.',
      },
      {
        month: "Jun '26",
        monthIndex: 8,
        quarter: 'Q2 2026',
        endingArr: 2.55,
        netNewArr: 210,
        momGrowthPct: 9.0,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +0.5,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Mid-year target reached at $2.55M ARR.',
      },
      {
        month: "Jul '26",
        monthIndex: 9,
        quarter: 'Q3 2026',
        endingArr: 2.75,
        netNewArr: 200,
        momGrowthPct: 7.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.7,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Growth rate begins moderate taper as founder rolodex saturates.',
      },
      {
        month: "Aug '26",
        monthIndex: 10,
        quarter: 'Q3 2026',
        endingArr: 2.96,
        netNewArr: 210,
        momGrowthPct: 7.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.9,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Paid outbound rep hiring underway; ramp cycle in progress.',
      },
      {
        month: "Sep '26",
        monthIndex: 11,
        quarter: 'Q3 2026',
        endingArr: 3.20,
        netNewArr: 240,
        momGrowthPct: 8.1,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.4,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Fiscal Q3 closes at $3.20M ARR with 8.1% MoM velocity.',
      },
    ], sectorTopQuartile, sectorMedian, 0.68);
  }

  // Preset 2: PayNexus Global (Fintech clearing rails, steady median-to-top pace with regulatory drag)
  if (company.includes('paynexus') || company.includes('pay')) {
    return enrichWithCohortBreakdown([
      {
        month: "Oct '25",
        monthIndex: 0,
        quarter: 'Q4 2025',
        endingArr: 1.62,
        netNewArr: 70,
        momGrowthPct: 4.5,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -3.3,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Standard cross-border exporter onboarding cadence.',
      },
      {
        month: "Nov '25",
        monthIndex: 1,
        quarter: 'Q4 2025',
        endingArr: 1.71,
        netNewArr: 90,
        momGrowthPct: 5.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.2,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'B2B supply chain holiday clearing volume lift.',
      },
      {
        month: "Dec '25",
        monthIndex: 2,
        quarter: 'Q4 2025',
        endingArr: 1.80,
        netNewArr: 90,
        momGrowthPct: 5.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.5,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Q4 closes at $1.80M ARR.',
      },
      {
        month: "Jan '26",
        monthIndex: 3,
        quarter: 'Q1 2026',
        endingArr: 1.92,
        netNewArr: 120,
        momGrowthPct: 6.7,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.1,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'LatAm corridor expansion brings 14 mid-market importers.',
      },
      {
        month: "Feb '26",
        monthIndex: 4,
        quarter: 'Q1 2026',
        endingArr: 2.05,
        netNewArr: 130,
        momGrowthPct: 6.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.0,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Strong FX volume conversion.',
      },
      {
        month: "Mar '26",
        monthIndex: 5,
        quarter: 'Q1 2026',
        endingArr: 2.20,
        netNewArr: 150,
        momGrowthPct: 7.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.5,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Hits $2.20M ARR mark.',
      },
      {
        month: "Apr '26",
        monthIndex: 6,
        quarter: 'Q2 2026',
        endingArr: 2.35,
        netNewArr: 150,
        momGrowthPct: 6.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.0,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Steady clearing adoption across logistics partners.',
      },
      {
        month: "May '26",
        monthIndex: 7,
        quarter: 'Q2 2026',
        endingArr: 2.52,
        netNewArr: 170,
        momGrowthPct: 7.2,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.6,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'New freight forwarder treasury integration goes live.',
      },
      {
        month: "Jun '26",
        monthIndex: 8,
        quarter: 'Q2 2026',
        endingArr: 2.70,
        netNewArr: 180,
        momGrowthPct: 7.1,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.7,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Q2 finishes at $2.70M ARR.',
      },
      {
        month: "Jul '26",
        monthIndex: 9,
        quarter: 'Q3 2026',
        endingArr: 2.87,
        netNewArr: 170,
        momGrowthPct: 6.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.5,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Evolve bank compliance scrutiny delays 3 enterprise partner launches.',
      },
      {
        month: "Aug '26",
        monthIndex: 10,
        quarter: 'Q3 2026',
        endingArr: 3.05,
        netNewArr: 180,
        momGrowthPct: 6.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.5,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Default loss rates begin impacting underwriting margins.',
      },
      {
        month: "Sep '26",
        monthIndex: 11,
        quarter: 'Q3 2026',
        endingArr: 3.24,
        netNewArr: 190,
        momGrowthPct: 6.2,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.6,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Q3 ARR lands at $3.24M; growth settling into median tier.',
      },
    ], sectorTopQuartile, sectorMedian, 0.58);
  }

  // Preset 3: CardioVance Health (Lumpy hospital procurement cycles, FDA hold risk)
  if (company.includes('cardio') || company.includes('vance')) {
    return enrichWithCohortBreakdown([
      {
        month: "Oct '25",
        monthIndex: 0,
        quarter: 'Q4 2025',
        endingArr: 1.08,
        netNewArr: 30,
        momGrowthPct: 2.9,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -3.6,
        velocityTier: 'SLOWDOWN',
        velocityLabel: 'Sluggish',
        commentary: 'Long hospital VAC committee approval queues.',
      },
      {
        month: "Nov '25",
        monthIndex: 1,
        quarter: 'Q4 2025',
        endingArr: 1.11,
        netNewArr: 30,
        momGrowthPct: 2.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -3.7,
        velocityTier: 'SLOWDOWN',
        velocityLabel: 'Sluggish',
        commentary: 'Slow clinical trial onboarding.',
      },
      {
        month: "Dec '25",
        monthIndex: 2,
        quarter: 'Q4 2025',
        endingArr: 1.15,
        netNewArr: 40,
        momGrowthPct: 3.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.9,
        velocityTier: 'MODERATE',
        velocityLabel: 'Moderate',
        commentary: 'Year-end IRB research pilot grants.',
      },
      {
        month: "Jan '26",
        monthIndex: 3,
        quarter: 'Q1 2026',
        endingArr: 1.20,
        netNewArr: 50,
        momGrowthPct: 4.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.2,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Annual health system clinical contracts renew.',
      },
      {
        month: "Feb '26",
        monthIndex: 4,
        quarter: 'Q1 2026',
        endingArr: 1.25,
        netNewArr: 50,
        momGrowthPct: 4.2,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.3,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Epic EHR integration rollout in 2 regional clinics.',
      },
      {
        month: "Mar '26",
        monthIndex: 5,
        quarter: 'Q1 2026',
        endingArr: 1.32,
        netNewArr: 70,
        momGrowthPct: 5.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.9,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Hits $1.32M ARR; first multi-clinic cardiology group signs.',
      },
      {
        month: "Apr '26",
        monthIndex: 6,
        quarter: 'Q2 2026',
        endingArr: 1.38,
        netNewArr: 60,
        momGrowthPct: 4.5,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.0,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'CPT code billing training for nursing staff.',
      },
      {
        month: "May '26",
        monthIndex: 7,
        quarter: 'Q2 2026',
        endingArr: 1.45,
        netNewArr: 70,
        momGrowthPct: 5.1,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.4,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'RPM patch prescription volumes expand 18% MoM.',
      },
      {
        month: "Jun '26",
        monthIndex: 8,
        quarter: 'Q2 2026',
        endingArr: 1.54,
        netNewArr: 90,
        momGrowthPct: 6.2,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.3,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Q2 closes at $1.54M ARR.',
      },
      {
        month: "Jul '26",
        monthIndex: 9,
        quarter: 'Q3 2026',
        endingArr: 1.61,
        netNewArr: 70,
        momGrowthPct: 4.5,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -2.0,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'FDA deficiency clock stop received; commercial expansion paused.',
      },
      {
        month: "Aug '26",
        monthIndex: 10,
        quarter: 'Q3 2026',
        endingArr: 1.70,
        netNewArr: 90,
        momGrowthPct: 5.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.9,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Sales constrained to existing institutional pilot clinics.',
      },
      {
        month: "Sep '26",
        monthIndex: 11,
        quarter: 'Q3 2026',
        endingArr: 1.80,
        netNewArr: 100,
        momGrowthPct: 5.9,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -0.6,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Closing ARR at $1.80M with imminent cash runway pressure.',
      },
    ], sectorTopQuartile, sectorMedian, 0.72);
  }

  // Preset 4: SensorPulse Systems (Hardware delivery spikes disguised as recurring ARR)
  if (company.includes('sensor') || company.includes('pulse')) {
    return enrichWithCohortBreakdown([
      {
        month: "Oct '25",
        monthIndex: 0,
        quarter: 'Q4 2025',
        endingArr: 1.45,
        netNewArr: 80,
        momGrowthPct: 5.8,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: -1.4,
        velocityTier: 'MEDIAN',
        velocityLabel: 'Median',
        commentary: 'Initial acoustic gateway installations at pilot refineries.',
      },
      {
        month: "Nov '25",
        monthIndex: 1,
        quarter: 'Q4 2025',
        endingArr: 1.62,
        netNewArr: 170,
        momGrowthPct: 11.7,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +4.5,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Batch 1 hardware node upfront billings booked into revenue.',
      },
      {
        month: "Dec '25",
        monthIndex: 2,
        quarter: 'Q4 2025',
        endingArr: 1.80,
        netNewArr: 180,
        momGrowthPct: 11.1,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +3.9,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Year-end industrial maintenance capital expenditures.',
      },
      {
        month: "Jan '26",
        monthIndex: 3,
        quarter: 'Q1 2026',
        endingArr: 1.95,
        netNewArr: 150,
        momGrowthPct: 8.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.1,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Cloud monitoring subscription renewals.',
      },
      {
        month: "Feb '26",
        monthIndex: 4,
        quarter: 'Q1 2026',
        endingArr: 2.15,
        netNewArr: 200,
        momGrowthPct: 10.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +3.1,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Batch 2 sensor node fulfillment delivery.',
      },
      {
        month: "Mar '26",
        monthIndex: 5,
        quarter: 'Q1 2026',
        endingArr: 2.40,
        netNewArr: 250,
        momGrowthPct: 11.6,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +4.4,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Quarter-end hardware inventory shipments booked as ARR.',
      },
      {
        month: "Apr '26",
        monthIndex: 6,
        quarter: 'Q2 2026',
        endingArr: 2.60,
        netNewArr: 200,
        momGrowthPct: 8.3,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.1,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Factory acoustic sensors deployed in beverage canning plants.',
      },
      {
        month: "May '26",
        monthIndex: 7,
        quarter: 'Q2 2026',
        endingArr: 2.82,
        netNewArr: 220,
        momGrowthPct: 8.5,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.3,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Expansion across 8 customer plants.',
      },
      {
        month: "Jun '26",
        monthIndex: 8,
        quarter: 'Q2 2026',
        endingArr: 3.10,
        netNewArr: 280,
        momGrowthPct: 9.9,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +2.7,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Q2 revenue reaches $3.10M on heavy hardware mix.',
      },
      {
        month: "Jul '26",
        monthIndex: 9,
        quarter: 'Q3 2026',
        endingArr: 3.38,
        netNewArr: 280,
        momGrowthPct: 9.0,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +1.8,
        velocityTier: 'TOP_QUARTILE',
        velocityLabel: 'Top Quartile',
        commentary: 'Batch 3 shipments begin; RMA seal ingress failures reported.',
      },
      {
        month: "Aug '26",
        monthIndex: 10,
        quarter: 'Q3 2026',
        endingArr: 3.72,
        netNewArr: 340,
        momGrowthPct: 10.1,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +2.9,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Large upfront hardware deployment to paper mills.',
      },
      {
        month: "Sep '26",
        monthIndex: 11,
        quarter: 'Q3 2026',
        endingArr: 4.10,
        netNewArr: 380,
        momGrowthPct: 10.2,
        topQuartileBenchmark: sectorTopQuartile,
        medianBenchmark: sectorMedian,
        varianceToTopQuartile: +3.0,
        velocityTier: 'BREAKOUT',
        velocityLabel: 'Breakout Spike',
        commentary: 'Topline headline claims $4.1M ARR (68% non-recurring hardware).',
      },
    ], sectorTopQuartile, sectorMedian, 0.80);
  }

  // Fallback for custom audited pitches or generic companies
  const quarters = report.historicalQuarters || [];
  const baseArr = report.baseline?.arr || (quarters.length > 0 ? quarters[quarters.length - 1].arr : 2.5);
  const startArr = quarters.length > 0 ? quarters[0].arr : baseArr * 0.55;
  const monthLabels = ["Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26"];

  const points: any[] = [];
  let currentArr = startArr;
  const totalSteps = 12;
  const monthlyMultiplier = Math.pow(baseArr / startArr, 1 / (totalSteps - 1));

  for (let i = 0; i < totalSteps; i++) {
    // Add slight natural variance
    const varianceFactor = 1 + (Math.sin(i * 1.2) * 0.015);
    const stepArr = i === totalSteps - 1 ? baseArr : currentArr * varianceFactor;
    const priorArr = i === 0 ? startArr * 0.93 : points[i - 1].endingArr;
    const netNew = Math.max(20, Math.round((stepArr - priorArr) * 1000));
    const momPct = Number((((stepArr - priorArr) / priorArr) * 100).toFixed(1));

    let tier: GrowthVelocityPoint['velocityTier'] = 'MEDIAN';
    let label = 'Median';
    if (momPct >= 9.0) {
      tier = 'BREAKOUT';
      label = 'Breakout';
    } else if (momPct >= sectorTopQuartile - 0.5) {
      tier = 'TOP_QUARTILE';
      label = 'Top Quartile';
    } else if (momPct >= sectorMedian) {
      tier = 'MEDIAN';
      label = 'Median';
    } else if (momPct >= 3.0) {
      tier = 'MODERATE';
      label = 'Moderate';
    } else {
      tier = 'SLOWDOWN';
      label = 'Deceleration';
    }

    const quarterLabel =
      i < 3 ? 'Q4 2025' :
      i < 6 ? 'Q1 2026' :
      i < 9 ? 'Q2 2026' : 'Q3 2026';

    points.push({
      month: monthLabels[i],
      monthIndex: i,
      quarter: quarterLabel,
      endingArr: Number(stepArr.toFixed(2)),
      netNewArr: netNew,
      momGrowthPct: momPct,
      topQuartileBenchmark: sectorTopQuartile,
      medianBenchmark: sectorMedian,
      varianceToTopQuartile: Number((momPct - sectorTopQuartile).toFixed(1)),
      velocityTier: tier,
      velocityLabel: label,
      commentary: `Trailed performance during ${quarterLabel} execution sprint.`,
    });

    currentArr = currentArr * monthlyMultiplier;
  }

  return enrichWithCohortBreakdown(points, sectorTopQuartile, sectorMedian, 0.65);
}

export const GrowthVelocityHeatmap: React.FC<GrowthVelocityHeatmapProps> = ({
  report,
  cohortFilter: propCohortFilter,
  onCohortFilterChange,
}) => {
  const [internalCohortFilter, setInternalCohortFilter] = useState<CohortFilterType>('ALL_COHORTS');
  const activeCohortFilter = propCohortFilter !== undefined ? propCohortFilter : internalCohortFilter;

  const handleCohortFilterChange = (filter: CohortFilterType) => {
    if (propCohortFilter === undefined) {
      setInternalCohortFilter(filter);
    }
    if (onCohortFilterChange) {
      onCohortFilterChange(filter);
    }
  };

  const [timeRange, setTimeRange] = useState<'ALL_12M' | 'LAST_6M'>('ALL_12M');
  const [activeMetric, setActiveMetric] = useState<'MOM_PCT' | 'NET_NEW_ARR'>('MOM_PCT');
  const [showBenchmarkLines, setShowBenchmarkLines] = useState<boolean>(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState<'TOP_QUARTILE' | 'MEDIAN'>('TOP_QUARTILE');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [pinnedMonthIndex, setPinnedMonthIndex] = useState<number | null>(null);

  const rawData = useMemo(() => generateGrowthVelocityData(report), [report]);

  const getPointMetrics = (point: GrowthVelocityPoint) => {
    if (activeCohortFilter === 'NEW_CUSTOMERS') {
      const rate = point.newCustomerMomPct;
      const netNew = point.newCustomerNetNewArr;
      const tq = point.newCustomerTopQuartile;
      const med = point.newCustomerMedian;
      const target = selectedBenchmark === 'TOP_QUARTILE' ? tq : med;
      const variance = Number((rate - target).toFixed(1));
      return {
        rate,
        netNew,
        topQuartile: tq,
        median: med,
        targetBenchmark: target,
        variance,
        isAccelerating: variance >= 0,
        heat: getHeatmapColor(rate, 'NEW_CUSTOMERS'),
        segmentLabel: 'New Customers',
      };
    } else if (activeCohortFilter === 'EXPANSION_REVENUE') {
      const rate = point.expansionMomPct;
      const netNew = point.expansionNetNewArr;
      const tq = point.expansionTopQuartile;
      const med = point.expansionMedian;
      const target = selectedBenchmark === 'TOP_QUARTILE' ? tq : med;
      const variance = Number((rate - target).toFixed(1));
      return {
        rate,
        netNew,
        topQuartile: tq,
        median: med,
        targetBenchmark: target,
        variance,
        isAccelerating: variance >= 0,
        heat: getHeatmapColor(rate, 'EXPANSION_REVENUE'),
        segmentLabel: 'Expansion Revenue',
      };
    } else {
      const rate = point.momGrowthPct;
      const netNew = point.netNewArr;
      const tq = point.topQuartileBenchmark;
      const med = point.medianBenchmark;
      const target = selectedBenchmark === 'TOP_QUARTILE' ? tq : med;
      const variance = Number((rate - target).toFixed(1));
      return {
        rate,
        netNew,
        topQuartile: tq,
        median: med,
        targetBenchmark: target,
        variance,
        isAccelerating: variance >= 0,
        heat: getHeatmapColor(rate, 'ALL_COHORTS'),
        segmentLabel: 'All Cohorts',
      };
    }
  };

  const displayData = useMemo(() => {
    const base = timeRange === 'LAST_6M' ? rawData.slice(6) : rawData;
    return base.map((p) => {
      const m = getPointMetrics(p);
      return {
        ...p,
        activeRate: m.rate,
        activeNetNew: m.netNew,
        activeTopQuartile: m.topQuartile,
        activeMedian: m.median,
        activeTargetBenchmark: m.targetBenchmark,
        activeVariance: m.variance,
        activeIsAccelerating: m.isAccelerating,
        activeHeat: m.heat,
        segmentLabel: m.segmentLabel,
      };
    });
  }, [rawData, timeRange, activeCohortFilter, selectedBenchmark]);

  const selectedBenchmarkLabel = selectedBenchmark === 'TOP_QUARTILE' ? 'Top-Quartile SaaS' : 'Median SaaS Index';

  const cohortNameLabel =
    activeCohortFilter === 'NEW_CUSTOMERS'
      ? 'New Customers (First-Time)'
      : activeCohortFilter === 'EXPANSION_REVENUE'
      ? 'Expansion Revenue (NDR/Upsell)'
      : 'All Cohorts (Blended ARR)';

  // Key KPI stats calibrated to selected cohort
  const kpis = useMemo(() => {
    const last3 = rawData.slice(-3);
    const getRate = (d: GrowthVelocityPoint) =>
      activeCohortFilter === 'NEW_CUSTOMERS'
        ? d.newCustomerMomPct
        : activeCohortFilter === 'EXPANSION_REVENUE'
        ? d.expansionMomPct
        : d.momGrowthPct;

    const avg3mMoM = last3.reduce((sum, d) => sum + getRate(d), 0) / 3;
    const prior3 = rawData.slice(-6, -3);
    const avgPrior3 = prior3.reduce((sum, d) => sum + getRate(d), 0) / 3;
    const momDelta = avg3mMoM - avgPrior3;

    // Compound Annualized Growth Rate based on last 3 months: (1 + r)^12 - 1
    const annualizedRate = (Math.pow(1 + avg3mMoM / 100, 12) - 1) * 100;

    const lastPoint = rawData[rawData.length - 1];
    const targetBenchmarkValue =
      activeCohortFilter === 'NEW_CUSTOMERS'
        ? selectedBenchmark === 'TOP_QUARTILE'
          ? lastPoint.newCustomerTopQuartile
          : lastPoint.newCustomerMedian
        : activeCohortFilter === 'EXPANSION_REVENUE'
        ? selectedBenchmark === 'TOP_QUARTILE'
          ? lastPoint.expansionTopQuartile
          : lastPoint.expansionMedian
        : selectedBenchmark === 'TOP_QUARTILE'
        ? lastPoint.topQuartileBenchmark
        : lastPoint.medianBenchmark;

    const benchmarkVariance = avg3mMoM - targetBenchmarkValue;

    const breakoutCutoff = activeCohortFilter === 'EXPANSION_REVENUE' ? 3.5 : activeCohortFilter === 'NEW_CUSTOMERS' ? 6.0 : 9.0;

    let quartileStatus = 'Top Quartile (>85th Percentile)';
    let quartileColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (avg3mMoM >= breakoutCutoff) {
      quartileStatus = 'Hypergrowth Breakout (>95th Percentile)';
      quartileColor = 'text-emerald-800 bg-emerald-100/80 border-emerald-300';
    } else if (avg3mMoM >= targetBenchmarkValue) {
      quartileStatus = 'Top-Quartile SaaS Pace (75th-90th)';
      quartileColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (avg3mMoM >= targetBenchmarkValue * 0.7) {
      quartileStatus = 'Median Venture Velocity (45th-60th)';
      quartileColor = 'text-blue-700 bg-blue-50 border-blue-200';
    } else {
      quartileStatus = 'Decelerating / Sub-Median (<30th)';
      quartileColor = 'text-rose-700 bg-rose-50 border-rose-200';
    }

    return {
      avg3mMoM: avg3mMoM.toFixed(1),
      annualizedRate: Math.round(annualizedRate),
      momDelta: momDelta.toFixed(1),
      isAccelerating: momDelta >= 0,
      benchmarkVariance: (benchmarkVariance >= 0 ? '+' : '') + benchmarkVariance.toFixed(1),
      quartileStatus,
      quartileColor,
    };
  }, [rawData, activeCohortFilter, selectedBenchmark]);

  // Active point for inspection (pinned has priority over hovered)
  const activeMonthIndex = pinnedMonthIndex !== null ? pinnedMonthIndex : hoveredMonthIndex;
  const activePoint = activeMonthIndex !== null ? rawData[activeMonthIndex] : null;

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 lg:p-7 shadow-sm space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              <span>Growth Velocity Heatmap</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-500" />
              <span>{cohortNameLabel}</span>
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              Month-over-Month (MoM) ARR Acceleration vs Industry Rubrics
            </span>
          </div>

          <h3 className="text-lg lg:text-xl font-bold text-zinc-900 tracking-tight mt-1.5 flex items-center gap-2">
            <span>Monthly ARR Growth Velocity & Benchmark Variance</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
            Tracks trailing 12-month MoM net ARR additions and velocity cadence against Bessemer Cloud Index & a16z top-quartile standards.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cohort Stream Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs">
            <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] text-zinc-500 font-semibold hidden md:inline">Cohort:</span>
            <select
              value={activeCohortFilter}
              onChange={(e) => handleCohortFilterChange(e.target.value as CohortFilterType)}
              className="bg-transparent font-bold text-zinc-800 text-xs focus:outline-none cursor-pointer pr-1"
              aria-label="Filter Growth Velocity by Cohort Stream"
            >
              <option value="ALL_COHORTS">All Cohorts (Blended)</option>
              <option value="NEW_CUSTOMERS">New Customers</option>
              <option value="EXPANSION_REVENUE">Expansion Revenue</option>
            </select>
          </div>

          {/* Time range toggle */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setTimeRange('ALL_12M')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === 'ALL_12M'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              12M Trailing
            </button>
            <button
              onClick={() => setTimeRange('LAST_6M')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === 'LAST_6M'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              L6M Momentum
            </button>
          </div>

          {/* Metric toggle */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setActiveMetric('MOM_PCT')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMetric === 'MOM_PCT'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              MoM % Rate
            </button>
            <button
              onClick={() => setActiveMetric('NET_NEW_ARR')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMetric === 'NET_NEW_ARR'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Net New ($k)
            </button>
          </div>

          {/* Selected Benchmark Comparison Selector */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-xl p-0.5 text-xs">
            <span className="text-[10px] text-zinc-500 font-semibold px-2 hidden md:inline flex items-center gap-1">
              <Target className="w-3 h-3 text-zinc-400" />
              <span>Baseline:</span>
            </span>
            <button
              onClick={() => setSelectedBenchmark('TOP_QUARTILE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBenchmark === 'TOP_QUARTILE'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Compare against Top-Quartile SaaS Benchmark"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span>Top-Quartile ({displayData[0]?.activeTopQuartile}%)</span>
            </button>
            <button
              onClick={() => setSelectedBenchmark('MEDIAN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBenchmark === 'MEDIAN'
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Compare against Median SaaS Index Benchmark"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
              <span>Median Index ({displayData[0]?.activeMedian}%)</span>
            </button>
          </div>

          {/* Benchmark line toggle */}
          <button
            onClick={() => setShowBenchmarkLines(!showBenchmarkLines)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              showBenchmarkLines
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Lines</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
            Trailing 3M Velocity
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-extrabold tabular-nums text-zinc-900">
              +{kpis.avg3mMoM}%
            </span>
            <span className="text-xs font-semibold text-zinc-500">/mo</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">
            Average Monthly Compounding
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
            Annualized Growth Run-Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold tabular-nums text-emerald-700">
              +{kpis.annualizedRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">YoY Pace</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">
            Compounded Annual Equivalent
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
            Benchmark Delta (Alpha)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl font-extrabold tabular-nums ${
                Number(kpis.benchmarkVariance) >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {kpis.benchmarkVariance}%
            </span>
            <span className="text-xs font-medium text-zinc-500">vs Top Quartile</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">
            Industry Benchmark Variance
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
            Venture Tier Standing
          </span>
          <div className="mt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${kpis.quartileColor}`}
            >
              {kpis.quartileStatus}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
            {kpis.isAccelerating ? (
              <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
            )}
            <span>
              {kpis.isAccelerating ? `Accelerating (+${kpis.momDelta}% QoQ)` : `Decelerating (${kpis.momDelta}% QoQ)`}
            </span>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION: Composed Bar + Benchmark Line Chart */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 px-1 gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">
              {activeMetric === 'MOM_PCT'
                ? `${cohortNameLabel} Growth Rate (%) with Heatmap Intensity`
                : `${cohortNameLabel} Net New ARR ($ Thousands)`}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
              {activeCohortFilter === 'NEW_CUSTOMERS'
                ? 'Isolating New Bookings'
                : activeCohortFilter === 'EXPANSION_REVENUE'
                ? 'Isolating NDR / Uplift'
                : 'Blended Performance'}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 italic">
            Hover over bars to inspect cohort ARR & diligence flags
          </span>
        </div>

        <div className="h-72 w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl p-3 pt-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
              onMouseMove={(state: any) => {
                if (state && state.activeTooltipIndex !== undefined) {
                  const targetIndex = displayData[state.activeTooltipIndex]?.monthIndex;
                  if (targetIndex !== undefined) setHoveredMonthIndex(targetIndex);
                }
              }}
              onMouseLeave={() => setHoveredMonthIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.7} vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                unit={activeMetric === 'MOM_PCT' ? '%' : 'k'}
                domain={activeMetric === 'MOM_PCT' ? [0, activeCohortFilter === 'EXPANSION_REVENUE' ? 8 : activeCohortFilter === 'NEW_CUSTOMERS' ? 10 : 14] : [0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as any;
                    const heat = data.activeHeat;
                    const isAccelerating = data.activeIsAccelerating;
                    const priorPoint = data.monthIndex > 0 ? displayData.find((p) => p.monthIndex === data.monthIndex - 1) : null;
                    const priorRate = priorPoint ? priorPoint.activeRate : data.activeRate;
                    const paceDelta = Number((data.activeRate - priorRate).toFixed(1));
                    const isPaceAccelerating = paceDelta >= 0;

                    return (
                      <div className="bg-white border border-zinc-200/90 rounded-xl p-3.5 shadow-xl text-xs space-y-2.5 max-w-xs z-50">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2 gap-2">
                          <div>
                            <span className="font-bold text-zinc-900 text-sm">{data.month}</span>
                            <span className="text-[11px] text-zinc-400 ml-1.5">({data.quarter})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${heat.badgeBg}`}>
                            {cohortNameLabel}
                          </span>
                        </div>

                        {/* Benchmark Comparison Trend Indicator Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${
                            isAccelerating
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {isAccelerating ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-rose-600 stroke-[3] shrink-0" />
                          )}
                          <span>
                            {isAccelerating
                              ? `Accelerating: +${data.activeVariance}% vs ${selectedBenchmarkLabel}`
                              : `Decelerating: ${data.activeVariance}% vs ${selectedBenchmarkLabel}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-zinc-600">
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Total ARR</span>
                            <span className="font-extrabold text-zinc-900 text-sm tabular-nums">
                              ${data.endingArr.toFixed(2)}M
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Cohort Net New</span>
                            <span className="font-bold text-emerald-700 text-sm tabular-nums">
                              +${data.activeNetNew}k
                            </span>
                          </div>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200/70 rounded-lg p-2 space-y-1 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Cohort MoM Rate:</span>
                            <span className="font-bold text-zinc-900">+{data.activeRate}%</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-500">
                            <span>Benchmark ({selectedBenchmarkLabel}):</span>
                            <span className="font-semibold text-zinc-800">+{data.activeTargetBenchmark}%</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-zinc-200/60 font-medium">
                            <span>Spread:</span>
                            <span
                              className={`font-bold flex items-center gap-0.5 ${
                                isAccelerating ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isAccelerating ? (
                                <ArrowUp className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                              )}
                              <span>{data.activeVariance >= 0 ? '+' : ''}{data.activeVariance}%</span>
                            </span>
                          </div>
                          {data.monthIndex > 0 && (
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                              <span>Pace vs Prior Month:</span>
                              <span
                                className={`font-semibold flex items-center gap-0.5 ${
                                  isPaceAccelerating ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {isPaceAccelerating ? (
                                  <ArrowUp className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                                ) : (
                                  <ArrowDown className="w-2.5 h-2.5 text-rose-600 stroke-[2.5]" />
                                )}
                                <span>{paceDelta >= 0 ? '+' : ''}{paceDelta}%</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Revenue Stream Breakdown Pill */}
                        <div className="p-2 rounded-lg bg-zinc-100/80 border border-zinc-200/80 text-[10px] space-y-1">
                          <div className="font-bold text-zinc-700 uppercase tracking-wider text-[9px]">
                            Cohort Decomposition Breakdown
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>New Customers:</span>
                            <span className="font-semibold text-emerald-800">+${data.newCustomerNetNewArr}k ({data.newCustomerMomPct}%)</span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>Expansion Revenue:</span>
                            <span className="font-semibold text-blue-800">+${data.expansionNetNewArr}k ({data.expansionMomPct}%)</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-600 italic leading-snug border-t border-zinc-100 pt-1.5">
                          "{data.commentary}"
                        </p>

                        <div className="text-[10px] text-zinc-400 text-center font-medium pt-0.5">
                          Click to pin inspection panel
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                verticalAlign="bottom"
              />

              {/* Reference Lines for Benchmark Standards */}
              {showBenchmarkLines && activeMetric === 'MOM_PCT' && (
                <>
                  <ReferenceLine
                    y={displayData[0]?.activeTopQuartile}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    strokeWidth={selectedBenchmark === 'TOP_QUARTILE' ? 2.5 : 1.5}
                    label={{
                      value: `Top Quartile (${displayData[0]?.activeTopQuartile}%)`,
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  <ReferenceLine
                    y={displayData[0]?.activeMedian}
                    stroke="#0284c7"
                    strokeDasharray="3 3"
                    strokeWidth={selectedBenchmark === 'MEDIAN' ? 2.5 : 1.2}
                    label={{
                      value: `Median (${displayData[0]?.activeMedian}%)`,
                      fill: '#0284c7',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                </>
              )}

              {/* Primary Bar with Heatmap Color Cell Rendering */}
              <Bar
                dataKey={activeMetric === 'MOM_PCT' ? 'activeRate' : 'activeNetNew'}
                name={activeMetric === 'MOM_PCT' ? `${cohortNameLabel} MoM Rate (%)` : `${cohortNameLabel} Net New ($k)`}
                radius={[4, 4, 0, 0]}
                className="cursor-pointer"
                onClick={(entry: any) => {
                  if (entry && entry.monthIndex !== undefined) {
                    setPinnedMonthIndex(pinnedMonthIndex === entry.monthIndex ? null : entry.monthIndex);
                  }
                }}
              >
                {displayData.map((entry) => {
                  const isHovered = hoveredMonthIndex === entry.monthIndex;
                  const isPinned = pinnedMonthIndex === entry.monthIndex;
                  return (
                    <Cell
                      key={`cell-${entry.monthIndex}`}
                      fill={entry.activeHeat.fill}
                      opacity={activeMonthIndex !== null && !isHovered && !isPinned ? 0.45 : 1}
                      stroke={isPinned ? '#09090b' : isHovered ? '#18181b' : 'none'}
                      strokeWidth={isPinned ? 2.5 : isHovered ? 2 : 0}
                    />
                  );
                })}
              </Bar>

              {/* Secondary Trendline: Top-Quartile Benchmark Line */}
              {showBenchmarkLines && activeMetric === 'MOM_PCT' && (
                <Line
                  type="monotone"
                  dataKey="activeTopQuartile"
                  name="Top-Quartile Benchmark (%)"
                  stroke="#059669"
                  strokeWidth={selectedBenchmark === 'TOP_QUARTILE' ? 2.5 : 1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}

              {/* Secondary Trendline: Median Benchmark Line */}
              {showBenchmarkLines && activeMetric === 'MOM_PCT' && (
                <Line
                  type="monotone"
                  dataKey="activeMedian"
                  name="Median SaaS Benchmark (%)"
                  stroke="#0284c7"
                  strokeWidth={selectedBenchmark === 'MEDIAN' ? 2.5 : 1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2D INTERACTIVE HEATMAP MATRIX TABLE / GRID */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-700 px-1 gap-1">
          <div className="flex items-center gap-1.5 font-bold flex-wrap">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>2D Monthly Velocity Heatmap Matrix</span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-semibold border border-zinc-200">
              {cohortNameLabel}
            </span>
            <span className="text-[11px] font-normal text-zinc-400">
              (Comparing against {selectedBenchmarkLabel})
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>Accelerating above baseline</span>
            </span>
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-rose-600 stroke-[3]" />
              <span>Decelerating below baseline</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar border border-zinc-200/90 rounded-2xl bg-zinc-50/50 p-3 sm:p-4">
          <div className="min-w-[760px] space-y-2">
            {/* Header: Months */}
            <div className="grid grid-cols-13 gap-1.5 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide items-center pb-1 border-b border-zinc-200/70">
              <div className="text-left font-semibold text-zinc-700 col-span-1">Metric \ Month</div>
              {displayData.map((d) => {
                const isSelected = activeMonthIndex === d.monthIndex;
                return (
                  <button
                    key={`head-${d.monthIndex}`}
                    onClick={() => setPinnedMonthIndex(pinnedMonthIndex === d.monthIndex ? null : d.monthIndex)}
                    className={`py-1 rounded-md transition-colors cursor-pointer text-center ${
                      isSelected ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-2xs' : 'hover:bg-zinc-100'
                    }`}
                  >
                    {d.month}
                  </button>
                );
              })}
            </div>

            {/* Row 1: Company MoM Growth Heatmap Blocks with Trend Indicator Icons */}
            <div className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-left text-xs font-bold text-zinc-900 flex items-center gap-1 col-span-1">
                <span>{activeCohortFilter === 'NEW_CUSTOMERS' ? 'New Logo %' : activeCohortFilter === 'EXPANSION_REVENUE' ? 'Exp Rate %' : 'MoM Growth'}</span>
              </div>
              {displayData.map((d) => {
                const heat = d.activeHeat;
                const isHovered = hoveredMonthIndex === d.monthIndex;
                const isPinned = pinnedMonthIndex === d.monthIndex;
                const isAccelerating = d.activeIsAccelerating;

                return (
                  <button
                    key={`mom-${d.monthIndex}`}
                    onClick={() => setPinnedMonthIndex(pinnedMonthIndex === d.monthIndex ? null : d.monthIndex)}
                    onMouseEnter={() => setHoveredMonthIndex(d.monthIndex)}
                    onMouseLeave={() => setHoveredMonthIndex(null)}
                    className={`${heat.bg} ${heat.text} ${heat.border} border py-2 px-1 rounded-xl text-center text-xs font-bold transition-all transform cursor-pointer shadow-xs ${
                      isPinned
                        ? 'ring-3 ring-zinc-900 scale-105 shadow-md'
                        : isHovered
                        ? 'scale-105 ring-2 ring-zinc-800 shadow-md'
                        : 'hover:scale-[1.02]'
                    }`}
                    title={`${d.month}: +${d.activeRate}% MoM (${
                      isAccelerating ? 'Accelerating' : 'Decelerating'
                    } vs ${selectedBenchmarkLabel})`}
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <span>+{d.activeRate}%</span>
                      {isAccelerating ? (
                        <ArrowUp className="w-3.5 h-3.5 text-white drop-shadow-xs stroke-[3] shrink-0" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-white drop-shadow-xs stroke-[3] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Top-Quartile Benchmark */}
            <div className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-left text-[11px] font-medium text-emerald-800 col-span-1 flex items-center gap-1">
                <span>Top Quartile</span>
                {selectedBenchmark === 'TOP_QUARTILE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title="Active Baseline" />
                )}
              </div>
              {displayData.map((d) => (
                <div
                  key={`tq-${d.monthIndex}`}
                  className={`py-1 rounded-lg text-center text-[11px] font-semibold tabular-nums border ${
                    selectedBenchmark === 'TOP_QUARTILE'
                      ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-bold'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                  }`}
                >
                  {d.activeTopQuartile}%
                </div>
              ))}
            </div>

            {/* Row 3: Median Benchmark */}
            <div className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-left text-[11px] font-medium text-blue-800 col-span-1 flex items-center gap-1">
                <span>Median Index</span>
                {selectedBenchmark === 'MEDIAN' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Active Baseline" />
                )}
              </div>
              {displayData.map((d) => (
                <div
                  key={`med-${d.monthIndex}`}
                  className={`py-1 rounded-lg text-center text-[11px] tabular-nums border ${
                    selectedBenchmark === 'MEDIAN'
                      ? 'bg-blue-100/90 text-blue-900 border-blue-300 font-bold'
                      : 'bg-blue-50 text-blue-800 border-blue-200/80 font-medium'
                  }`}
                >
                  {d.activeMedian}%
                </div>
              ))}
            </div>

            {/* Row 4: Variance to Selected Benchmark (with Small Up/Down Trend Icons) */}
            <div className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-left text-[11px] font-medium text-zinc-700 col-span-1">
                Alpha vs {selectedBenchmark === 'TOP_QUARTILE' ? 'TQ' : 'Median'}
              </div>
              {displayData.map((d) => {
                const spread = d.activeVariance;
                const isAccelerating = d.activeIsAccelerating;

                return (
                  <button
                    key={`var-${d.monthIndex}`}
                    onClick={() => setPinnedMonthIndex(pinnedMonthIndex === d.monthIndex ? null : d.monthIndex)}
                    className={`py-1 px-1 rounded-lg text-center text-[10px] font-bold tabular-nums border flex items-center justify-center gap-0.5 cursor-pointer transition-transform hover:scale-105 ${
                      isAccelerating
                        ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                    title={`${isAccelerating ? 'Accelerating' : 'Decelerating'}: ${spread >= 0 ? '+' : ''}${spread}% vs ${selectedBenchmarkLabel}`}
                  >
                    {isAccelerating ? (
                      <ArrowUp className="w-2.5 h-2.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                    ) : (
                      <ArrowDown className="w-2.5 h-2.5 text-rose-600 shrink-0 stroke-[2.5]" />
                    )}
                    <span>{spread >= 0 ? '+' : ''}{spread}%</span>
                  </button>
                );
              })}
            </div>

            {/* Row 5: Cohort Net New ARR */}
            <div className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-left text-[11px] font-medium text-emerald-800 col-span-1">
                {activeCohortFilter === 'NEW_CUSTOMERS' ? 'New Logo ARR' : activeCohortFilter === 'EXPANSION_REVENUE' ? 'Expansion ARR' : 'Net New ARR'}
              </div>
              {displayData.map((d) => (
                <div
                  key={`net-${d.monthIndex}`}
                  className="py-1 text-center text-[11px] font-bold text-emerald-800 tabular-nums"
                >
                  +${d.activeNetNew}k
                </div>
              ))}
            </div>

            {/* Row 6: Ending ARR ($M) */}
            <div className="grid grid-cols-13 gap-1.5 items-center pt-1 border-t border-zinc-200/60">
              <div className="text-left text-[11px] font-medium text-zinc-500 col-span-1">
                Ending ARR
              </div>
              {displayData.map((d) => (
                <div
                  key={`arr-${d.monthIndex}`}
                  className="py-1 text-center text-[11px] font-bold text-zinc-800 tabular-nums"
                >
                  ${d.endingArr.toFixed(2)}M
                </div>
              ))}
            </div>

            {/* Row 7: Cohort Composition Ratio */}
            <div className="grid grid-cols-13 gap-1.5 items-center pt-1 border-t border-zinc-200/60 text-[10px]">
              <div className="text-left font-medium text-zinc-500 col-span-1 flex items-center gap-1">
                <span>New / Exp %</span>
              </div>
              {displayData.map((d) => {
                const total = d.netNewArr || 1;
                const newPct = Math.round((d.newCustomerNetNewArr / total) * 100);
                const expPct = 100 - newPct;
                return (
                  <div
                    key={`split-${d.monthIndex}`}
                    className="py-0.5 text-center text-[10px] text-zinc-600 font-mono tracking-tight"
                    title={`New Customers: ${newPct}% ($${d.newCustomerNetNewArr}k) | Expansion: ${expPct}% ($${d.expansionNetNewArr}k)`}
                  >
                    <span className="text-emerald-700 font-bold">{newPct}</span>
                    <span className="text-zinc-400">/</span>
                    <span className="text-blue-700 font-bold">{expPct}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DETAIL INSPECTOR CARD (PINNED OR HOVERED) */}
      {activePoint && (() => {
        const activeM = getPointMetrics(activePoint);
        const heat = activeM.heat;
        const targetBenchmarkVal = activeM.targetBenchmark;
        const spread = activeM.variance;
        const isAccelerating = activeM.isAccelerating;
        const priorPoint = activePoint.monthIndex > 0 ? rawData[activePoint.monthIndex - 1] : null;
        const priorRate = priorPoint ? getPointMetrics(priorPoint).rate : activeM.rate;
        const paceDelta = Number((activeM.rate - priorRate).toFixed(1));
        const isPaceAccelerating = paceDelta >= 0;

        return (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-bold text-zinc-900">
                    {activePoint.month} ({activePoint.quarter})
                  </span>
                </div>

                {/* Cohort & Velocity Badges */}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-white">
                  {cohortNameLabel}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${heat.badgeBg}`}>
                  +{activeM.rate}% MoM Velocity
                </span>

                {pinnedMonthIndex !== null && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-semibold flex items-center gap-1">
                    <span>Pinned Month</span>
                  </span>
                )}
              </div>

              {/* Navigation & Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setPinnedMonthIndex(Math.max(0, activePoint.monthIndex - 1))}
                  disabled={activePoint.monthIndex === 0}
                  className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-zinc-500 font-medium tabular-nums">
                  {activePoint.monthIndex + 1} of {rawData.length}
                </span>
                <button
                  onClick={() => setPinnedMonthIndex(Math.min(rawData.length - 1, activePoint.monthIndex + 1))}
                  disabled={activePoint.monthIndex === rawData.length - 1}
                  className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {pinnedMonthIndex !== null && (
                  <button
                    onClick={() => setPinnedMonthIndex(null)}
                    className="ml-2 text-xs text-zinc-500 hover:text-zinc-900 p-1 hover:bg-zinc-200 rounded-lg cursor-pointer"
                    title="Unpin Month"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Metric Comparison Strip with Up/Down Trend Indicator Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Benchmark Comparison with Trend Arrow */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                isAccelerating
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  {cohortNameLabel} vs {selectedBenchmarkLabel}
                </div>
                <div className="flex items-center gap-2 my-1">
                  <div className={`p-1.5 rounded-lg ${isAccelerating ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isAccelerating ? (
                      <ArrowUp className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <ArrowDown className="w-4 h-4 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xl font-extrabold tabular-nums">
                      {spread >= 0 ? '+' : ''}{spread}%
                    </span>
                    <span className="text-[11px] font-semibold ml-1.5">
                      {isAccelerating ? 'Accelerating' : 'Decelerating'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] opacity-80">
                  Cohort +{activeM.rate}% vs Benchmark +{targetBenchmarkVal}%
                </div>
              </div>

              {/* Card 2: MoM Pace vs Prior Month */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                isPaceAccelerating
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Cohort Momentum
                </div>
                <div className="flex items-center gap-2 my-1">
                  <div className={`p-1.5 rounded-lg ${isPaceAccelerating ? 'bg-blue-200 text-blue-900' : 'bg-rose-200 text-rose-900'}`}>
                    {isPaceAccelerating ? (
                      <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xl font-extrabold tabular-nums">
                      {paceDelta >= 0 ? '+' : ''}{paceDelta}%
                    </span>
                    <span className="text-[11px] font-semibold ml-1.5">
                      {isPaceAccelerating ? 'Pace Expanding' : 'Pace Decelerating'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] opacity-80">
                  Prior Month: +{priorRate}% → Current: +{activeM.rate}%
                </div>
              </div>

              {/* Card 3: Ending ARR & Net New */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Cohort Net ARR Additions
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-xl font-extrabold text-emerald-800 tabular-nums">
                    +${activeM.netNew}k
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    of ${activePoint.netNewArr}k total
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Ending Total Topline: ${activePoint.endingArr.toFixed(2)}M ARR
                </div>
              </div>
            </div>

            {/* Decomposition Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-zinc-200/80 rounded-xl p-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>New Customer Acquisition</span>
                </span>
                <div className="text-zinc-600 text-[11px]">
                  Added <strong className="text-zinc-900">+${activePoint.newCustomerNetNewArr}k</strong> net new ARR at a <strong className="text-emerald-700">+{activePoint.newCustomerMomPct}%</strong> monthly velocity pace (Top-Quartile: +{activePoint.newCustomerTopQuartile}%).
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Expansion & Net Retention</span>
                </span>
                <div className="text-zinc-600 text-[11px]">
                  Generated <strong className="text-zinc-900">+${activePoint.expansionNetNewArr}k</strong> from existing account expansion at <strong className="text-blue-700">+{activePoint.expansionMomPct}%</strong> monthly velocity (Top-Quartile: +{activePoint.expansionTopQuartile}%).
                </div>
              </div>
            </div>

            {/* Auditor Commentary */}
            <div className="bg-white border border-zinc-200/90 rounded-xl p-3 text-xs text-zinc-700 leading-relaxed">
              <span className="font-bold text-zinc-900">Institutional Audit Context: </span>
              <span>{activePoint.commentary}</span>
            </div>
          </div>
        );
      })()}

      {/* Heatmap Chromatic Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-600 pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-1 font-semibold text-zinc-700">
          <span>Heatmap Scale ({cohortNameLabel}):</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700" />
            <span>
              Breakout Velocity (&ge;{activeCohortFilter === 'EXPANSION_REVENUE' ? '3.5%' : activeCohortFilter === 'NEW_CUSTOMERS' ? '6.0%' : '9.5%'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
            <span>
              Top-Quartile ({activeCohortFilter === 'EXPANSION_REVENUE' ? '2.6 - 3.4%' : activeCohortFilter === 'NEW_CUSTOMERS' ? '4.8 - 5.9%' : '7.5 - 9.4%'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 border border-blue-600" />
            <span>
              Median Pace ({activeCohortFilter === 'EXPANSION_REVENUE' ? '1.6 - 2.5%' : activeCohortFilter === 'NEW_CUSTOMERS' ? '3.2 - 4.7%' : '5.0 - 7.4%'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500" />
            <span>
              Moderate ({activeCohortFilter === 'EXPANSION_REVENUE' ? '0.9 - 1.5%' : activeCohortFilter === 'NEW_CUSTOMERS' ? '1.8 - 3.1%' : '3.0 - 4.9%'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600" />
            <span>
              Deceleration (&lt;{activeCohortFilter === 'EXPANSION_REVENUE' ? '0.9%' : activeCohortFilter === 'NEW_CUSTOMERS' ? '1.8%' : '3.0%'})
            </span>
          </div>
        </div>

        <div className="text-zinc-400 italic">
          Bessemer Cloud Index & a16z Growth Rubric
        </div>
      </div>

      {/* STRUCTURED GROWTH VELOCITY TABLE */}
      <div className="space-y-3 pt-6 border-t border-zinc-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <TableIcon className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-zinc-900 tracking-tight">
                Growth Velocity Audit Table — Month-over-Month Details
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {cohortNameLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Specific month-over-month ARR values, net-new additions, benchmark comparisons, and percentage variances aligned with {activeCohortFilter === 'NEW_CUSTOMERS' ? 'First-Time Logo Acquisition' : activeCohortFilter === 'EXPANSION_REVENUE' ? 'Existing Account NDR / Upsell' : 'All Cohorts (Blended ARR)'}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="text-zinc-500 text-[11px] hidden sm:inline">
              Baseline: <strong className="text-zinc-800">{selectedBenchmarkLabel}</strong>
            </span>
            <span className="text-[10px] text-zinc-400 italic">
              Click row to inspect month in card above
            </span>
          </div>
        </div>

        {/* The Structured Table Container */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200/90 shadow-2xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-3.5">Month</th>
                <th className="py-3 px-3">Ending ARR</th>
                <th className="py-3 px-3">
                  {activeCohortFilter === 'NEW_CUSTOMERS'
                    ? 'New Customer Net New'
                    : activeCohortFilter === 'EXPANSION_REVENUE'
                    ? 'Expansion Net New'
                    : 'Total Net New ARR'}
                </th>
                <th className="py-3 px-3 text-center">MoM Growth</th>
                <th className="py-3 px-3 text-center">Benchmark ({selectedBenchmark === 'TOP_QUARTILE' ? 'Top Q' : 'Median'})</th>
                <th className="py-3 px-3 text-center">Variance (Alpha)</th>
                <th className="py-3 px-3 text-center">MoM Momentum</th>
                <th className="py-3 px-3">Cohort Breakdown</th>
                <th className="py-3 px-3.5 min-w-[220px]">Institutional Audit Takeaway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayData.map((row) => {
                const isSelected = activeMonthIndex === row.monthIndex;
                const priorPoint = row.monthIndex > 0 ? displayData.find((p) => p.monthIndex === row.monthIndex - 1) : null;
                const priorRate = priorPoint ? priorPoint.activeRate : row.activeRate;
                const paceDelta = Number((row.activeRate - priorRate).toFixed(1));
                const isPaceAccelerating = paceDelta >= 0;

                return (
                  <tr
                    key={row.month}
                    onClick={() => setPinnedMonthIndex(pinnedMonthIndex === row.monthIndex ? null : row.monthIndex)}
                    onMouseEnter={() => setHoveredMonthIndex(row.monthIndex)}
                    onMouseLeave={() => setHoveredMonthIndex(null)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 font-medium'
                        : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    {/* Month / Quarter */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{row.month}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200">
                          {row.quarter}
                        </span>
                      </div>
                    </td>

                    {/* Ending ARR */}
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums">
                      <span className="font-extrabold text-zinc-900">
                        ${row.endingArr.toFixed(2)}M
                      </span>
                    </td>

                    {/* Net New ARR */}
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-emerald-700">
                          +${row.activeNetNew}k
                        </span>
                        {activeCohortFilter !== 'ALL_COHORTS' && (
                          <span className="text-[10px] text-zinc-400">
                            of ${row.netNewArr}k
                          </span>
                        )}
                      </div>
                    </td>

                    {/* MoM Velocity Rate */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border tabular-nums ${row.activeHeat.badgeBg}`}>
                        +{row.activeRate}%
                      </span>
                    </td>

                    {/* Target Benchmark */}
                    <td className="py-3 px-3 text-center whitespace-nowrap text-zinc-700 font-semibold tabular-nums">
                      +{row.activeTargetBenchmark}%
                    </td>

                    {/* Variance to Benchmark */}
                    <td className="py-3 px-3 text-center whitespace-nowrap tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold border ${
                          row.activeVariance >= 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {row.activeVariance >= 0 ? (
                          <ArrowUp className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                        )}
                        <span>{row.activeVariance >= 0 ? '+' : ''}{row.activeVariance}%</span>
                      </span>
                    </td>

                    {/* MoM Momentum vs Prior Month */}
                    <td className="py-3 px-3 text-center whitespace-nowrap tabular-nums">
                      {row.monthIndex > 0 ? (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                            isPaceAccelerating ? 'text-blue-700' : 'text-rose-700'
                          }`}
                        >
                          {isPaceAccelerating ? (
                            <TrendingUp className="w-3 h-3 text-blue-600 shrink-0" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
                          )}
                          <span>{paceDelta >= 0 ? `+${paceDelta}%` : `${paceDelta}%`}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Baseline</span>
                      )}
                    </td>

                    {/* Cohort Composition Breakdown */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="text-emerald-700 font-semibold">New: +${row.newCustomerNetNewArr}k</span>
                          <span className="text-blue-700 font-semibold">Exp: +${row.expansionNetNewArr}k</span>
                        </div>
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80">
                          <div
                            style={{ width: `${Math.round((row.newCustomerNetNewArr / row.netNewArr) * 100)}%` }}
                            className="bg-emerald-500"
                            title={`New Customer: ${Math.round((row.newCustomerNetNewArr / row.netNewArr) * 100)}%`}
                          />
                          <div
                            style={{ width: `${Math.round((row.expansionNetNewArr / row.netNewArr) * 100)}%` }}
                            className="bg-blue-500"
                            title={`Expansion: ${Math.round((row.expansionNetNewArr / row.netNewArr) * 100)}%`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Diligence Commentary */}
                    <td className="py-3 px-3.5 text-zinc-600 text-[11px] leading-snug">
                      <span className="line-clamp-2" title={row.commentary}>
                        {row.commentary}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer with Summary Aggregates */}
            <tfoot className="bg-zinc-50/90 border-t-2 border-zinc-200 font-semibold text-zinc-800 text-xs">
              <tr>
                <td className="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px]">
                  Trailing {displayData.length}M Summary
                </td>
                <td className="py-3 px-3 tabular-nums font-extrabold text-zinc-900">
                  ${displayData[displayData.length - 1]?.endingArr.toFixed(2)}M
                </td>
                <td className="py-3 px-3 tabular-nums font-extrabold text-emerald-800">
                  +${displayData.reduce((acc, p) => acc + p.activeNetNew, 0)}k
                </td>
                <td className="py-3 px-3 text-center tabular-nums font-extrabold text-zinc-900">
                  +{(displayData.reduce((acc, p) => acc + p.activeRate, 0) / displayData.length).toFixed(1)}% avg
                </td>
                <td className="py-3 px-3 text-center tabular-nums text-zinc-700">
                  +{(displayData.reduce((acc, p) => acc + p.activeTargetBenchmark, 0) / displayData.length).toFixed(1)}% avg
                </td>
                <td className="py-3 px-3 text-center tabular-nums font-extrabold">
                  {(() => {
                    const avgVar = displayData.reduce((acc, p) => acc + p.activeVariance, 0) / displayData.length;
                    return (
                      <span className={avgVar >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {avgVar >= 0 ? `+${avgVar.toFixed(1)}%` : `${avgVar.toFixed(1)}%`}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-3 px-3 text-center text-[11px] text-zinc-500 font-normal">
                  CAGR: +{kpis.annualizedRate}%
                </td>
                <td className="py-3 px-3 text-[10px] text-zinc-500">
                  Total Added: +${displayData.reduce((acc, p) => acc + p.netNewArr, 0)}k
                </td>
                <td className="py-3 px-3.5 text-[11px] text-zinc-500 font-medium">
                  {kpis.quartileStatus}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
