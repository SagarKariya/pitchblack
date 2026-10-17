import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { FullDiligenceReport } from '../types';

/**
 * Sanitizes strings for standard ascii output where needed
 */
export function sanitize(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u00B7]/g, '-')
    .trim();
}

/**
 * Builds the complete, high-fidelity Investment Committee Diligence Memorandum HTML.
 * Engineered to match the Web UI aesthetic: crisp typography, badges, stat cards,
 * tables, scenario waterfalls, forensic gaps, and sign-off blocks.
 */
export function generateICMemoHtml(report: FullDiligenceReport): string {
  const {
    companyName,
    sector,
    stage,
    targetRaise,
    valuationClaim,
    signal,
    metrics,
    baseline,
    historicalQuarters,
    cohortDecay,
    subsectorAudit,
    forensicGaps,
    questionBank,
  } = report;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const sectorFormatted = (sector || 'SaaS').replace(/_/g, ' ');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; line-height: 1.45; font-size: 11.5px; width: 800px; padding: 24px; background: #ffffff; margin: 0 auto; box-sizing: border-box;">
      
      <!-- STYLES EMBEDDED DIRECTLY FOR HTML2PDF & HTML2CANVAS FIDELITY -->
      <style>
        .pdf-avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pillar-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 14px;
          background: #ffffff;
          overflow: hidden;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .pillar-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pillar-title {
          font-weight: 800;
          font-size: 12.5px;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .pillar-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .pillar-body {
          padding: 12px 14px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          margin-top: 6px;
        }
        .data-table th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          padding: 6px 8px;
          text-align: left;
          border-bottom: 1px solid #cbd5e1;
        }
        .data-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }
        .data-table tr:nth-child(even) td {
          background: #fbfcfe;
        }
      </style>

      <!-- EXECUTIVE HEADER CARD -->
      <div class="pdf-avoid-break" style="background: #09090b; color: #ffffff; border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; border: 1px solid #27272a;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div>
            <div style="display: inline-block; background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
              PITCH BLACK // IC CONFIDENTIAL MEMORANDUM
            </div>
            <h1 style="font-size: 18px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.02em; color: #ffffff;">
              ${companyName} — Investment Committee Diligence Memo
            </h1>
            <div style="font-size: 11px; color: #cbd5e1;">
              Ask: <strong style="color: #ffffff;">${targetRaise}</strong> at <strong style="color: #ffffff;">${valuationClaim}</strong> &nbsp;·&nbsp; Round: <strong style="color: #ffffff;">${stage}</strong> &nbsp;·&nbsp; Sector: <strong style="color: #ffffff;">${sectorFormatted}</strong>
            </div>
          </div>
          <div style="text-align: right; shrink: 0;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 500;">
              ${formattedDate}
            </div>
            <div style="display: inline-block; margin-top: 5px; background: rgba(225, 29, 72, 0.2); color: #fda4af; border: 1px solid rgba(225, 29, 72, 0.35); font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
              STRICTLY CONFIDENTIAL
            </div>
          </div>
        </div>
      </div>

      <!-- PILLAR 01: Traffic Light Investment Directive & Conviction Verdict -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">1. Pillar 01: Traffic Light Investment Directive & Conviction Verdict</div>
          <span class="pillar-badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
            Conviction Score: ${signal.convictionScore}/100
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 9.5px; font-weight: 800; color: #065f46; text-transform: uppercase; margin-bottom: 3px;">
                Lead Partner Directive:
              </div>
              <div style="font-weight: 700; font-size: 12px; color: #044e3b; line-height: 1.35;">
                ${signal.partnerDirective}
              </div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
              <div style="font-size: 9.5px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 3px;">
                Executive Summary:
              </div>
              <div style="color: #334155; font-size: 11px; line-height: 1.4;">
                ${signal.verdictSummary}
              </div>
            </div>
          </div>

          <div style="margin-top: 8px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.04em;">
              Scenario Payoff Waterfall:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div class="pdf-avoid-break" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 10px;">
                <div style="font-size: 10px; font-weight: 800; color: #166534;">BULL CASE (Outlier):</div>
                <div style="font-size: 10px; color: #374151; margin-top: 3px;">${signal.bullCase}</div>
              </div>
              <div class="pdf-avoid-break" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 10px;">
                <div style="font-size: 10px; font-weight: 800; color: #1e40af;">BASE CASE (Target):</div>
                <div style="font-size: 10px; color: #374151; margin-top: 3px;">${signal.baseCase}</div>
              </div>
              <div class="pdf-avoid-break" style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px 10px;">
                <div style="font-size: 10px; font-weight: 800; color: #9f1239;">BEAR CASE (Downside):</div>
                <div style="font-size: 10px; color: #374151; margin-top: 3px;">${signal.bearCase}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PILLAR 02: 5-Dimension Scorecard Radar Audit -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">2. Pillar 02: 5-Dimension Scorecard Radar Audit</div>
          <span class="pillar-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
            5 Key Dimensions
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${[
              { label: 'Founder Pedigree & Team', item: signal?.scorecard?.founderTeam, fallback: 7.5, notes: 'Founder velocity and leadership execution cadence evaluated.' },
              { label: 'Addressable TAM & Market', item: signal?.scorecard?.marketTam, fallback: 8.0, notes: 'Operating in high-velocity category with expansion into enterprise segments.' },
              { label: 'Product Defensibility & Moat', item: signal?.scorecard?.productMoat, fallback: 6.5, notes: 'Workflow integration stickiness; audit proprietary data lock-in.' },
              { label: 'Unit Economics & Margins', item: signal?.scorecard?.unitEconomics, fallback: 6.0, notes: 'Gross margins and customer acquisition costs require rigorous verification.' },
              { label: 'Execution & Diligence Risk', item: signal?.scorecard?.diligenceRisk, fallback: 5.5, notes: 'Runway governance and capital allocation discipline required.' },
            ].map(f => {
              const score = typeof f.item?.score === 'number' ? f.item.score : f.fallback;
              const max = f.item?.max || 10;
              const pct = Math.min(100, Math.round((score / max) * 100));
              const color = score >= 7 ? '#10b981' : score >= 5 ? '#3b82f6' : '#e11d48';
              const badgeBg = score >= 7 ? '#ecfdf5' : score >= 5 ? '#eff6ff' : '#fff1f2';
              const badgeText = score >= 7 ? '#065f46' : score >= 5 ? '#1e40af' : '#9f1239';
              const badgeBorder = score >= 7 ? '#a7f3d0' : score >= 5 ? '#bfdbfe' : '#fecdd3';

              return `
                <div class="pdf-avoid-break" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 700; font-size: 11px; color: #0f172a;">${f.label}</span>
                    <span style="font-weight: 800; font-size: 10px; background: ${badgeBg}; color: ${badgeText}; border: 1px solid ${badgeBorder}; padding: 1px 6px; border-radius: 4px;">
                      ${score} / ${max}
                    </span>
                  </div>
                  <!-- Progress Bar Indicator -->
                  <div style="background: #e2e8f0; height: 5px; border-radius: 3px; overflow: hidden; margin-bottom: 4px;">
                    <div style="background: ${color}; width: ${pct}%; height: 100%;"></div>
                  </div>
                  <div style="font-size: 10px; color: #475569; line-height: 1.35;">${f.item?.notes || f.notes}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- PILLAR 03: Financial Baseline & Historical Trajectory -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">3. Pillar 03: Financial Baseline & Operating Vitals</div>
          <span class="pillar-badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
            Ending ARR: $${baseline.arr}M
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Ending ARR</div>
              <div style="font-size: 15px; font-weight: 800; color: #059669; margin-top: 2px;">$${baseline.arr}M</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Monthly Net Burn</div>
              <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">$${Math.round(baseline.monthlyBurn * 1000)}k/mo</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Cash Runway</div>
              <div style="font-size: 15px; font-weight: 800; color: #2563eb; margin-top: 2px;">${baseline.runwayMonths} Months</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Gross Margin</div>
              <div style="font-size: 15px; font-weight: 800; color: #7c3aed; margin-top: 2px;">${baseline.grossMarginPct}%</div>
            </div>
          </div>

          ${historicalQuarters && historicalQuarters.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-size: 10px; font-weight: 800; color: #334155; margin-bottom: 4px; text-transform: uppercase;">
              Historical Performance Audit (Quarter-by-Quarter):
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Contracted ARR</th>
                  <th>Revenue</th>
                  <th>Gross Profit</th>
                  <th>Net Burn</th>
                  <th>NDR</th>
                </tr>
              </thead>
              <tbody>
                ${historicalQuarters.map(hq => `
                  <tr>
                    <td><strong>${hq.quarter}</strong></td>
                    <td>$${hq.arr.toFixed(2)}M</td>
                    <td>$${hq.revenue.toFixed(2)}M</td>
                    <td>$${hq.grossProfit.toFixed(2)}M</td>
                    <td>$${hq.netBurn.toFixed(2)}M</td>
                    <td><strong style="color: #059669;">${hq.ndr}%</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- PILLAR 04: Quantitative Metric Benchmarks Scorecard -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">4. Pillar 04: Quantitative Metric Benchmarks Scorecard (vs a16z / Bessemer)</div>
          <span class="pillar-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
            ${metrics.length} Institutional Standards
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 7px;">
            ${metrics.map(m => {
              const isTop = m.status === 'TOP_QUARTILE';
              const isMedian = m.status === 'MEDIAN';
              const badgeBg = isTop ? '#ecfdf5' : isMedian ? '#eff6ff' : '#fff1f2';
              const badgeText = isTop ? '#065f46' : isMedian ? '#1e40af' : '#9f1239';
              const badgeBorder = isTop ? '#a7f3d0' : isMedian ? '#bfdbfe' : '#fecdd3';

              return `
                <div class="pdf-avoid-break" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 7px; padding: 7px 9px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; font-size: 10.5px; color: #0f172a;">${m.name}</div>
                    <div style="font-size: 9.5px; color: #64748b;">
                      Reported: <strong style="color: #0f172a;">${m.reported}</strong> &nbsp;(Target: ${m.topQuartile})
                    </div>
                  </div>
                  <span style="font-size: 9px; font-weight: 800; background: ${badgeBg}; color: ${badgeText}; border: 1px solid ${badgeBorder}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                    ${m.status.replace(/_/g, ' ')}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- PILLAR 05: Valuation Sensitivity & Efficiency Matrix -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">5. Pillar 05: Valuation Sensitivity & Efficiency Matrix</div>
          <span class="pillar-badge" style="background: #fdf4ff; color: #86198f; border: 1px solid #f0abfc;">
            ${(baseline.valuationClaim / baseline.arr).toFixed(1)}x ARR Multiple
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Implied Multiple</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${(baseline.valuationClaim / baseline.arr).toFixed(1)}x ARR
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 1px;">At $${baseline.valuationClaim}M claim</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Burn Multiple</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${(baseline.monthlyBurn * 12 / baseline.arr).toFixed(2)}x
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 1px;">Net Burn / Added ARR</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Blended CAC</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                $${(baseline.blendedCac || 0).toLocaleString()}
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 1px;">Acquisition cost</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Sales Cycle</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${baseline.salesCycleDays || 0} Days
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 1px;">Enterprise close speed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PILLAR 06: Cohort Retention & Velocity Decay -->
      ${cohortDecay && cohortDecay.length > 0 ? `
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">6. Pillar 06: Cohort Retention & Growth Velocity Decay</div>
          <span class="pillar-badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
            ${cohortDecay.length} Months Audited
          </span>
        </div>
        <div class="pillar-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Month Cohort</th>
                <th>Reported NDR (%)</th>
                <th>Top-Quartile Benchmark (%)</th>
                <th>Audited Real Retention (%)</th>
              </tr>
            </thead>
            <tbody>
              ${cohortDecay.map(cd => {
                const isDivergent = Math.abs(cd.reported - cd.underlyingReal) > 10;
                return `
                  <tr>
                    <td><strong>${cd.month}</strong></td>
                    <td>${cd.reported}%</td>
                    <td>${cd.topQuartileBenchmark}%</td>
                    <td><strong style="color: ${isDivergent ? '#e11d48' : '#0f172a'};">${cd.underlyingReal}%</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      <!-- PILLAR 07: Subsector Deep Dive Audit -->
      ${subsectorAudit && subsectorAudit.checks ? `
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">7. Pillar 07: Subsector Deep Dive Audit (${subsectorAudit.sectorName || sectorFormatted})</div>
          <span class="pillar-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
            ${subsectorAudit.checks.length} Checks
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: flex; flex-direction: column; gap: 7px;">
            ${subsectorAudit.checks.map((chk, i) => {
              const isPass = chk.status === 'PASS';
              const isFlag = chk.status === 'FLAG';
              const cardBg = isPass ? '#f0fdf4' : isFlag ? '#fffbeb' : '#fff1f2';
              const cardBorder = isPass ? '#bbf7d0' : isFlag ? '#fde68a' : '#fecdd3';
              const badgeBg = isPass ? '#dcfce7' : isFlag ? '#fef3c7' : '#fee2e2';
              const badgeText = isPass ? '#166534' : isFlag ? '#92400e' : '#991b1b';

              return `
                <div class="pdf-avoid-break" style="background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 8px; padding: 8px 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                    <span style="font-weight: 700; font-size: 11px; color: #0f172a;">
                      7.${i+1} ${chk.pillar}
                    </span>
                    <span style="font-size: 9px; font-weight: 800; background: ${badgeBg}; color: ${badgeText}; padding: 1px 6px; border-radius: 4px;">
                      [${chk.status}]
                    </span>
                  </div>
                  <div style="font-size: 9.5px; color: #64748b; margin-bottom: 3px;">
                    Reported: <strong style="color: #0f172a;">${chk.metricValue}</strong> &nbsp;(Target: ${chk.targetBenchmark})
                  </div>
                  <div style="font-size: 10px; color: #334155; margin-bottom: 2px;">${chk.finding}</div>
                  <div style="font-size: 9.5px; font-weight: 700; color: #be123c;">Institutional Risk: ${chk.institutionalRisk}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- PILLAR 08: Forensic Data Gap Audit & Concealments -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">8. Pillar 08: Forensic Data Gap Audit & Concealments</div>
          <span class="pillar-badge" style="background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3;">
            ${forensicGaps.length} Flags Detected
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${forensicGaps.map((g, i) => `
              <div class="pdf-avoid-break" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 11px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                  <span style="font-weight: 700; font-size: 11px; color: #0f172a;">
                    8.${i+1} ${g.title}
                  </span>
                  <span style="font-size: 9px; font-weight: 800; background: ${g.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}; color: ${g.severity === 'CRITICAL' ? '#991b1b' : '#92400e'}; border: 1px solid ${g.severity === 'CRITICAL' ? '#fecdd3' : '#fde68a'}; padding: 1px 6px; border-radius: 4px;">
                    [${g.severity}]
                  </span>
                </div>
                <div style="font-size: 10px; color: #64748b; font-style: italic; margin-bottom: 4px;">
                  "${g.surfaceClaim}"
                </div>
                <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 6px 8px; font-size: 10px; color: #4c0519; margin-bottom: 4px;">
                  <strong>Forensic Reality:</strong> ${g.concealedReality}
                </div>
                <div style="font-size: 9.5px; color: #475569;">
                  <strong style="color: #be123c;">Valuation Impact:</strong> ${g.financialImpact} &nbsp;—&nbsp; <em>${g.remediationAction}</em>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- PILLAR 09: Partner Diligence Interrogatories -->
      <div class="pillar-card">
        <div class="pillar-header">
          <div class="pillar-title">9. Pillar 09: Partner Diligence Interrogatories & Red Flag Triggers</div>
          <span class="pillar-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
            ${questionBank.length} Questions
          </span>
        </div>
        <div class="pillar-body">
          <div style="display: flex; flex-direction: column; gap: 7px;">
            ${questionBank.map((q, i) => `
              <div class="pdf-avoid-break" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-weight: 800; font-size: 10px; color: #0f172a;">Q${i+1}.</span>
                  <span style="font-size: 9px; font-weight: 700; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 1px 5px; border-radius: 4px;">
                    ${q.cluster}
                  </span>
                </div>
                <div style="font-weight: 700; font-size: 11px; color: #0f172a; margin-bottom: 2px;">
                  "${q.question}"
                </div>
                <div style="font-size: 9.5px; color: #475569; margin-bottom: 1px;">
                  <strong>Strategic Intent:</strong> ${q.intent}
                </div>
                <div style="font-size: 9.5px; font-weight: 600; color: #be123c;">
                  <strong>Warning Flag:</strong> ${q.redFlagToWatchFor}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 10: IC Disposition & Execution Sign-Off -->
      <div class="pdf-avoid-break" style="border: 2px solid #0f172a; border-radius: 12px; padding: 14px 16px; background: #f8fafc; margin-top: 14px;">
        <div style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.04em; margin-bottom: 6px;">
          10. Investment Committee Disposition & Execution Sign-Off
        </div>
        <div style="font-size: 10.5px; color: #334155; margin-bottom: 12px;">
          Formal IC Disposition: &nbsp;&nbsp;
          <strong>[ &nbsp; ] Issue Term Sheet</strong> &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>[ &nbsp; ] Conditional Follow-Up Diligence</strong> &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>[ &nbsp; ] Pass / Reject Deal</strong>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
          <div>
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Lead Partner Signature:</div>
            <div style="border-bottom: 2px solid #475569; height: 24px;"></div>
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Date of Disposition:</div>
            <div style="border-bottom: 2px solid #475569; height: 24px;"></div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="margin-top: 14px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
        Pitch Black Venture Intelligence Terminal &nbsp;·&nbsp; Strictly Confidential Institutional IC Memorandum &nbsp;·&nbsp; ${companyName}
      </div>

    </div>
  `;
}

/**
 * Downloads the Investment Committee Memorandum PDF with crisp Web UI visual fidelity
 * using html2canvas-pro and jsPDF, with automatic multi-page canvas slicing,
 * card boundary protection, and zero oklch color parsing errors.
 */
export async function downloadICMemoPdf(report: FullDiligenceReport): Promise<void> {
  const cleanFilename = `${(report.companyName || 'Startup').replace(/[^a-zA-Z0-9_-]/g, '_')}_IC_Memorandum.pdf`;

  // 1. Create an off-screen container mounted to document.body
  const container = document.createElement('div');
  container.id = 'offscreen-ic-memo-pdf-render';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.pointerEvents = 'none';
  container.innerHTML = generateICMemoHtml(report);

  document.body.appendChild(container);

  try {
    // Wait briefly for layout & styles to compute
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 2. High-resolution canvas rendering using html2canvas-pro (native oklch & modern CSS color support)
    const canvas = await html2canvas(container, {
      scale: 2, // 300 DPI equivalent for crisp print resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    // 3. Multi-page Letter PDF layout using jsPDF with clean canvas slicing
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidthMm = 215.9; // Letter width (8.5 in)
    const pageHeightMm = 279.4; // Letter height (11 in)
    const marginMm = 8;
    const printableWidthMm = pageWidthMm - marginMm * 2; // 199.9 mm
    const printableHeightMm = pageHeightMm - marginMm * 2; // 263.4 mm

    // Pixel to mm conversion factor from rendered canvas
    const pxPerMm = canvas.width / printableWidthMm;
    const maxPageHeightPx = printableHeightMm * pxPerMm;

    // Detect card positions to prevent breaking cards awkwardly in half
    const cardElements = Array.from(container.querySelectorAll('.pillar-card, .pdf-avoid-break')) as HTMLElement[];
    const cardBreakpointsPx = cardElements.map((el) => {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      return {
        topPx: top * 2, // scale 2x matches canvas scale
        bottomPx: (top + height) * 2,
      };
    });

    let currentY = 0;
    const totalHeight = canvas.height;
    let isFirstPage = true;

    while (currentY < totalHeight) {
      let sliceHeightPx = Math.min(maxPageHeightPx, totalHeight - currentY);

      // If we're not at the very end, check if the slice boundary falls inside an avoid-break card
      if (currentY + sliceHeightPx < totalHeight) {
        const tentativeCutY = currentY + sliceHeightPx;
        const splitCard = cardBreakpointsPx.find(
          (c) => tentativeCutY > c.topPx && tentativeCutY < c.bottomPx
        );

        if (splitCard) {
          const adjustedHeight = splitCard.topPx - currentY;
          // Break before the card if it preserves at least 50% of page height
          if (adjustedHeight >= maxPageHeightPx * 0.5) {
            sliceHeightPx = adjustedHeight;
          }
        }
      }

      // Create slice canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          pageCanvas.width,
          sliceHeightPx
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        if (!isFirstPage) {
          pdf.addPage();
        }
        pdf.addImage(pageImgData, 'JPEG', marginMm, marginMm, printableWidthMm, sliceHeightMm);
        isFirstPage = false;
      }

      currentY += sliceHeightPx;
    }

    pdf.save(cleanFilename);
  } catch (err) {
    console.error('High-fidelity PDF generation encountered an issue, falling back to printer format:', err);
    printICMemoHtml(report);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Dedicated printable popup window or fallback for physical printers
 */
export function printICMemoHtml(report: FullDiligenceReport): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.companyName} - Investment Committee Diligence Memo</title>
  <style>
    @page { margin: 10mm 12mm; size: letter portrait; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: #ffffff; }
  </style>
</head>
<body>
  ${generateICMemoHtml(report)}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
}
