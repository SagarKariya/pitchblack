import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  ArrowRight,
  Cpu,
  CreditCard,
  Stethoscope,
  Radio,
  UploadCloud,
  Database,
  Trash2,
  Sparkles,
  Loader2,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Lock,
  Shield,
} from 'lucide-react';
import { DiligenceFrameworkExplainer } from './components/DiligenceFrameworkExplainer';
import { PersistentDeal } from './types';

interface HomePageProps {
  deals: PersistentDeal[];
  onSelectDeal: (dealId: string) => void;
  onDeleteDeal?: (dealId: string) => void;
  isLoadingDeals?: boolean;
  onOpenCustomPitchModal?: () => void;
  onNavigateToIngest?: () => void;
  onNavigateToBenchmarks?: (framework?: 'all' | 'a16z' | 'sequoia' | 'bessemer' | 'benchmark') => void;
  onNavigateToPillarTab?: (pillarId: number) => void;
  isLoggedIn?: boolean;
  onOpenAuthModal?: (prompt?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  deals = [],
  onSelectDeal,
  onDeleteDeal,
  isLoadingDeals = false,
  onOpenCustomPitchModal,
  onNavigateToIngest,
  onNavigateToPillarTab,
  isLoggedIn = false,
  onOpenAuthModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'preset'>('all');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbWidthPercent, setThumbWidthPercent] = useState(30);

  // Delete Deal Confirmation Pop-up Modal State
  const [dealPendingDelete, setDealPendingDelete] = useState<{ id: string; companyName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!dealPendingDelete || !onDeleteDeal) return;
    try {
      setIsDeleting(true);
      await onDeleteDeal(dealPendingDelete.id);
    } catch (e) {
      console.error('Delete deal error:', e);
    } finally {
      setIsDeleting(false);
      setDealPendingDelete(null);
    }
  };

  useEffect(() => {
    if (!dealPendingDelete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setDealPendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dealPendingDelete, isDeleting]);

  const updateScrollMetrics = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);
      const overflowing = maxScroll > 8;
      setIsOverflowing(overflowing);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

      if (overflowing) {
        const visiblePercent = Math.max(15, Math.min(80, (clientWidth / scrollWidth) * 100));
        setThumbWidthPercent(visiblePercent);
        const ratio = maxScroll > 0 ? Math.max(0, Math.min(1, scrollLeft / maxScroll)) : 0;
        setScrollRatio(ratio);
      } else {
        setScrollRatio(0);
        setThumbWidthPercent(100);
      }
    }
  };

  const handleScrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleScrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !scrollContainerRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickFraction = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: clickFraction * maxScroll,
      behavior: 'smooth',
    });
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!trackRef.current || !scrollContainerRef.current) return;
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startScrollLeft = scrollContainerRef.current.scrollLeft;
    const trackWidth = trackRef.current.clientWidth;
    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      const deltaX = moveEvent.clientX - startX;
      const usableTrackWidth = trackWidth * (1 - thumbWidthPercent / 100);
      const scrollDelta = usableTrackWidth > 0 ? (deltaX / usableTrackWidth) * maxScroll : 0;
      scrollContainerRef.current.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + scrollDelta));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!trackRef.current || !scrollContainerRef.current || e.touches.length === 0) return;
    isDraggingRef.current = true;
    const startX = e.touches[0].clientX;
    const startScrollLeft = scrollContainerRef.current.scrollLeft;
    const trackWidth = trackRef.current.clientWidth;
    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current || moveEvent.touches.length === 0) return;
      const deltaX = moveEvent.touches[0].clientX - startX;
      const usableTrackWidth = trackWidth * (1 - thumbWidthPercent / 100);
      const scrollDelta = usableTrackWidth > 0 ? (deltaX / usableTrackWidth) * maxScroll : 0;
      scrollContainerRef.current.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + scrollDelta));
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleIngestClick = () => {
    if (!isLoggedIn && onOpenAuthModal) {
      onOpenAuthModal('Sign in to ingest pitch decks and generate real-time AI diligence audits.');
      return;
    }
    if (onNavigateToIngest) onNavigateToIngest();
    else if (onOpenCustomPitchModal) onOpenCustomPitchModal();
  };

  const filteredDeals = deals.filter((deal) => {
    if (filterType === 'custom') return !deal.isPreset;
    if (filterType === 'preset') return Boolean(deal.isPreset);
    return true;
  });

  const customCount = deals.filter((d) => !d.isPreset).length;
  const presetCount = deals.filter((d) => d.isPreset).length;

  useEffect(() => {
    updateScrollMetrics();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);
    const timeoutId = setTimeout(updateScrollMetrics, 120);
    return () => {
      clearTimeout(timeoutId);
      el.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [filteredDeals]);

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-transparent text-zinc-900">
      {/* Hero Header */}
      <div className="text-center mb-12 max-w-3xl mt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-zinc-900 mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span>Venture Intelligence Copilot & Senior Diligence Director</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight mb-5 font-serif leading-[1.15]">
          Pitch Black, your institutional <span className="inline-block pr-2.5 -mr-1.5 pb-0.5 -mb-0.5 tracking-normal text-emerald-600 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent font-bold italic font-serif">venture diligence</span> terminal
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Perform institutional-grade startup investment audits across the proven frameworks of a16z, Sequoia, Bessemer, and Benchmark.
        </p>

        {/* CTA Launch Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => {
              if (!isLoggedIn && onOpenAuthModal) {
                onOpenAuthModal('Sign in with your Google or investor account to access the Deal Room.');
                return;
              }
              if (deals.length > 0) {
                onSelectDeal(deals[0].id);
              }
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Launch Active Deal Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleIngestClick}
            className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-black text-white font-semibold text-xs rounded-xl border border-zinc-800 shadow-md hover:shadow-zinc-900/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Ingest Custom Startup Pitch</span>
          </button>
        </div>
      </div>

      {/* Live Deal Rooms & Seed Portfolio Diligence Vault Section (Visible only when logged in) */}
      {isLoggedIn && (
        <div className="w-full mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="text-xs uppercase font-bold text-zinc-900 tracking-wider">
                My Diligence Vault:
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {deals.length} Active Deals
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All ({deals.length})
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'custom'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Ingested Pitches ({customCount})</span>
              </button>
              <button
                onClick={() => setFilterType('preset')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'preset'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Seed Portfolio ({presetCount})
              </button>
            </div>
          </div>

          {isLoadingDeals ? (
            <div className="p-12 text-center bg-white/70 rounded-2xl border border-zinc-200 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-medium text-zinc-600">
                Syncing your persistent portfolio from Firebase Firestore...
              </p>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-10 text-center bg-white/80 rounded-2xl border border-dashed border-zinc-300">
              <p className="text-xs font-medium text-zinc-600 mb-3">
                {filterType === 'custom'
                  ? 'No uploaded startup pitches in your Firestore vault yet.'
                  : 'No deals found in this category.'}
              </p>
              <button
                onClick={handleIngestClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Ingest a Pitch Deck</span>
              </button>
            </div>
          ) : (
            <div className="w-full">
              {/* Single Horizontal Row of Startup Cards */}
              <div
                ref={scrollContainerRef}
                onScroll={updateScrollMetrics}
                className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1 w-full snap-x snap-mandatory scroll-pl-1 scroll-pr-1"
              >
                {filteredDeals.map((deal) => {
                  const signalColor =
                    deal.signal === 'HIGH_CONVICTION'
                      ? 'text-emerald-700 border-emerald-500/30 bg-emerald-500/10 shadow-2xs'
                      : deal.signal === 'CONDITIONAL'
                      ? 'text-blue-700 border-blue-500/30 bg-blue-500/10 shadow-2xs'
                      : 'text-rose-700 border-rose-500/30 bg-rose-500/10 shadow-2xs';

                  const sectorIcon =
                    deal.sector === 'ENTERPRISE_AI' ? (
                      <Cpu className="w-4 h-4 text-blue-600" />
                    ) : deal.sector === 'FINTECH' ? (
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                    ) : deal.sector === 'HEALTHTECH' ? (
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Radio className="w-4 h-4 text-emerald-600" />
                    );

                  return (
                    <div
                      key={deal.id}
                      onClick={() => onSelectDeal(deal.id)}
                      className={`shrink-0 snap-start bg-white/90 border border-zinc-200/90 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between transform hover:-translate-y-0.5 relative ${
                        filteredDeals.length === 1
                          ? 'w-[280px] sm:w-[300px] max-w-[320px]'
                          : filteredDeals.length < 4
                          ? 'w-[260px] sm:w-[280px] lg:w-[290px]'
                          : 'w-[260px] sm:w-[280px] lg:w-[calc((100%-3*1rem)/4)] lg:min-w-[calc((100%-3*1rem)/4)] lg:max-w-[calc((100%-3*1rem)/4)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100/90 rounded-lg border border-zinc-200/80">
                              {sectorIcon}
                            </div>
                            <span className="text-xs font-semibold text-zinc-500">
                              {deal.stage}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {!deal.isPreset && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                Ingested
                              </span>
                            )}
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${signalColor}`}>
                              {deal.signal === 'HIGH_CONVICTION' ? 'Conviction' : deal.signal === 'CONDITIONAL' ? 'Conditional' : 'Pass'}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                          {deal.companyName}
                        </h3>

                        <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed line-clamp-2">
                          {deal.tagline || deal.deckSummary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-zinc-100/80 flex items-center justify-between text-xs">
                        <div className="text-zinc-700 font-medium flex items-center gap-1.5">
                          <span className="text-zinc-400">Score: </span>
                          <span className="tabular-nums font-bold text-emerald-700">
                            {deal.convictionScore}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {onDeleteDeal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDealPendingDelete({
                                  id: deal.id,
                                  companyName: deal.companyName,
                                });
                              }}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={`Delete "${deal.companyName}" from Diligence Vault`}
                              aria-label={`Delete "${deal.companyName}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="flex items-center gap-1 text-blue-600 text-xs font-bold group-hover:text-emerald-600 transition-colors">
                            <span>Audit</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Interactive Scrollbar Element */}
              {isOverflowing && (
                <div className="mt-4 pt-1 flex items-center justify-center w-full select-none">
                  {/* Scrollbar Track, Draggable Thumb & Mini End Controls */}
                  <div className="flex items-center gap-2.5 w-full max-w-xs sm:max-w-md justify-center">
                    <button
                      type="button"
                      onClick={handleScrollPrev}
                      disabled={!canScrollLeft}
                      className={`p-1.5 rounded-lg border transition-all ${
                        canScrollLeft
                          ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 shadow-2xs cursor-pointer'
                          : 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed opacity-40'
                      }`}
                      title="Scroll left"
                      aria-label="Scroll left in row"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Scrollbar Track */}
                    <div
                      ref={trackRef}
                      onClick={handleTrackClick}
                      className="relative flex-1 h-2 sm:h-2.5 bg-zinc-200/90 hover:bg-zinc-300/90 rounded-full cursor-pointer transition-colors overflow-hidden select-none"
                      title="Click or drag to scrub through deals"
                    >
                      {/* Draggable Thumb */}
                      <div
                        onMouseDown={handleThumbMouseDown}
                        onTouchStart={handleThumbTouchStart}
                        style={{
                          left: `${scrollRatio * (100 - thumbWidthPercent)}%`,
                          width: `${thumbWidthPercent}%`,
                        }}
                        className="absolute top-0 bottom-0 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full transition-colors shadow-xs cursor-grab active:cursor-grabbing"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleScrollNext}
                      disabled={!canScrollRight}
                      className={`p-1.5 rounded-lg border transition-all ${
                        canScrollRight
                          ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 shadow-2xs cursor-pointer'
                          : 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed opacity-40'
                      }`}
                      title="Scroll right"
                      aria-label="Scroll right in row"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Institutional 9-Pillar Diligence Framework Explainer Component */}
      <DiligenceFrameworkExplainer
        onNavigateToPillarTab={onNavigateToPillarTab}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Delete Deal Confirmation Pop-up Modal */}
      {dealPendingDelete && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDealPendingDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-deal-dialog-title"
        >
          <div
            className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isDeleting && setDealPendingDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
              disabled={isDeleting}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <h3
                  id="delete-deal-dialog-title"
                  className="text-base font-bold text-zinc-900 leading-tight tracking-tight"
                >
                  Delete Deal from Diligence Vault?
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  This will remove the deal from your Firestore database and portfolio.
                </p>
              </div>
            </div>

            {/* Target Deal Details Box */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 mb-5">
              <div className="text-xs font-semibold text-zinc-800 truncate">
                {dealPendingDelete.companyName}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                Deal ID: <span className="font-mono text-zinc-600">{dealPendingDelete.id}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed mb-5">
              Are you sure you want to permanently delete <strong className="text-zinc-900">{dealPendingDelete.companyName}</strong>? All associated 9-pillar audit benchmarks, quantitative scores, and memorandum data will be removed from your Firestore vault.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDealPendingDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
