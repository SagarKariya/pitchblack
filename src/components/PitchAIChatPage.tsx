import React, { useState, useEffect } from 'react';
import { FullDiligenceReport } from '../types';
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  Mail,
  FileCheck,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Trash2,
  Download,
  Cloud,
  AlertTriangle,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import {
  loadChatThreadFromFirestore,
  saveChatThreadToFirestore,
  deleteChatThreadFromFirestore,
  ChatMessage,
} from '../services/chatService';

interface PitchAIChatPageProps {
  activeReport: FullDiligenceReport;
  selectedPresetId: string;
  onSelectDeal: (dealId: string) => void;
  onNavigateToDealRoom: () => void;
  isEmbeddedInDealRoom?: boolean;
}

export const PitchAIChatPage: React.FC<PitchAIChatPageProps> = ({
  activeReport,
  selectedPresetId,
  onSelectDeal,
  onNavigateToDealRoom,
  isEmbeddedInDealRoom = false,
}) => {
  const { companyName, baseline, signal, sector, stage, targetRaise, valuationClaim } = activeReport;
  const { currentUser, requireAuth } = useAuth();

  const [query, setQuery] = useState<string>('');
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isClearedRecently, setIsClearedRecently] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [apiIssueWarning, setApiIssueWarning] = useState<string | null>(null);

  const buildInitialMessage = (): ChatMessage => ({
    role: 'assistant',
    content: `### Welcome to PitchAI Partner Chat\n\nI am your **Senior Diligence Director**, grounded in the investment frameworks of **a16z** (16 Metrics), **Sequoia** (Crucible & Defensibility), **Bessemer** (Cloud Benchmarks), and **Benchmark** (Organic Pull).\n\nCurrently analyzing: **${companyName}** (${stage} · ${sector})\n* **Conviction Verdict**: ${signal.signal.replace('_', ' ')} (${signal.convictionScore}/100)\n* **Contracted ARR**: $${baseline.arr}M | **Cash Runway**: ${baseline.runwayMonths} months\n* **Partner Directive**: ${signal.partnerDirective}\n\nAsk me anything: draft a formal **IC Memo**, generate a **hardball founder follow-up email**, stress-test **unit economics**, or investigate **forensic red flags**.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Initial welcome message from PitchAI
  const [messages, setMessages] = useState<ChatMessage[]>([buildInitialMessage()]);

  // Persistent Firestore Chat History Synchronizer
  useEffect(() => {
    let isSubscribed = true;

    if (!currentUser?.uid) {
      // Guest or logged-out: reset to fresh initial welcome message
      setMessages([buildInitialMessage()]);
      return;
    }

    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const savedMessages = await loadChatThreadFromFirestore(
          currentUser.uid,
          selectedPresetId || 'active'
        );
        if (isSubscribed) {
          if (savedMessages && savedMessages.length > 0) {
            setMessages(savedMessages);
          } else {
            setMessages([buildInitialMessage()]);
          }
        }
      } catch (err) {
        console.warn('[PitchAIChatPage] Could not restore chat history:', err);
        if (isSubscribed) setMessages([buildInitialMessage()]);
      } finally {
        if (isSubscribed) setIsHistoryLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser?.uid, selectedPresetId, companyName]);

  const quickPrompts = [
    {
      category: 'Follow-Up & Interrogation',
      label: 'Draft Founder Hardball Email',
      icon: Mail,
      prompt: `Draft a firm, institutional follow-up email from our Investment Committee to ${companyName}'s CEO requesting raw unblended cohort decay data, channel-specific paid CAC, and top-3 customer contract terms.`,
    },
    {
      category: 'IC Memo & Valuation',
      label: 'Draft 2-Page IC Memo',
      icon: FileCheck,
      prompt: `Draft a formal 2-page Investment Committee (IC) Memo for ${companyName}. Include executive thesis, valuation multiple defense against public comps, proposed tranche milestone conditions, and governance terms.`,
    },
    {
      category: 'Market & Moat Defensibility',
      label: 'Sequoia Crucible Moat Audit',
      icon: ShieldAlert,
      prompt: `Perform a rigorous Sequoia Crucible moat audit for ${companyName}. Address whether a hyperscaler or open-source model could replicate their stack in 6 months, and assess true workflow switching costs.`,
    },
    {
      category: 'Downturn & Runway Stress',
      label: '2023 Downturn Stress Test',
      icon: TrendingDown,
      prompt: `Simulate a severe tech downturn scenario for ${companyName}: 50% valuation multiple compression, 2x longer enterprise sales cycles, and 20% higher customer churn. Detail survival roadmap and needed capital.`,
    },
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isCopilotLoading) return;

    if (!currentUser) {
      requireAuth(
        () => handleSend(customPrompt),
        'Sign in with an approved partner account to consult the AI Diligence Copilot.'
      );
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const messagesWithUser = [...messages, userMsg];
    setMessages(messagesWithUser);
    setQuery('');
    setIsCopilotLoading(true);

    if (currentUser?.uid) {
      saveChatThreadToFirestore(
        currentUser.uid,
        selectedPresetId || 'active',
        companyName,
        messagesWithUser
      ).catch((e) => console.warn('Failed to save user message to Firestore:', e));
    }

    try {
      const idToken = await currentUser.getIdToken();
      const resp = await fetch('/api/pitch-copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          query: textToSend,
          reportContext: activeReport,
        }),
      });

      const data = await resp.json();
      let assistantMsg: ChatMessage;

      if (resp.ok && data.success && data.answer) {
        assistantMsg = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setApiIssueWarning(null);
      } else {
        const errorText = data?.error || (resp.status ? `Gemini API issue(${resp.status})` : 'Gemini API issue(400)');
        setApiIssueWarning(errorText);
        assistantMsg = {
          role: 'assistant',
          content: `⚠️ **${errorText}**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      const allMessages = [...messagesWithUser, assistantMsg];
      setMessages(allMessages);

      if (currentUser?.uid) {
        await saveChatThreadToFirestore(
          currentUser.uid,
          selectedPresetId || 'active',
          companyName,
          allMessages
        );
      }
    } catch (err: any) {
      const errorText = err?.message && err.message.includes('Gemini API issue')
        ? err.message
        : 'Gemini API issue(400)';
      setApiIssueWarning(errorText);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ **${errorText}**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const allMessages = [...messagesWithUser, errorMsg];
      setMessages(allMessages);

      if (currentUser?.uid) {
        await saveChatThreadToFirestore(
          currentUser.uid,
          selectedPresetId || 'active',
          companyName,
          allMessages
        );
      }
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = async () => {
    const freshInitial = [buildInitialMessage()];
    setMessages(freshInitial);
    setQuery('');
    setIsClearedRecently(true);

    if (currentUser?.uid) {
      try {
        await deleteChatThreadFromFirestore(currentUser.uid, selectedPresetId || 'active');
      } catch (err) {
        console.warn('Could not clear Firestore chat:', err);
      }
    }

    setTimeout(() => setIsClearedRecently(false), 2000);
  };

  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n\n`)
      .join('---\n\n');
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitchai-chat-${companyName.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {/* Unified Chatbot UI with Integrated Diligence Prompt Accelerators */}
      <div className="w-full bg-white border border-zinc-200/90 rounded-2xl shadow-sm min-h-[660px] flex flex-col overflow-hidden">
        {/* Chat Stream Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-900">
                  PitchAI Diligence Channel
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-zinc-600 font-semibold">
                  {companyName} Thread
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">
                {stage} · {sector} · Conviction: <span className="font-semibold text-zinc-800">{signal.convictionScore}/100</span> ({signal.signal.replace(/_/g, ' ')})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <span
                title="Your conversation is safely persisted in Firestore for your partner session"
                className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium hidden sm:flex items-center gap-1 shadow-2xs"
              >
                <Cloud className="w-3 h-3 text-emerald-600" /> Database Synced
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium hidden sm:inline">
                Guest Mode
              </span>
            )}

            <span className="text-[11px] text-zinc-400 font-medium mr-1 hidden sm:inline">
              {messages.length} message{messages.length === 1 ? '' : 's'}
            </span>

            <button
              onClick={handleExportChat}
              aria-label="Export chat transcript as markdown"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-lg border border-zinc-200 transition-all cursor-pointer shadow-2xs"
              title="Export Chat as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear chat conversation"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                isClearedRecently
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-rose-50 text-zinc-600 hover:text-rose-700 border-zinc-200 hover:border-rose-200'
              }`}
              title="Clear Chat History"
            >
              {isClearedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cleared</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gemini API Issue Warning Banner */}
        {apiIssueWarning && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in duration-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold text-rose-950">{apiIssueWarning}</span>
            </div>
            <button
              onClick={() => setApiIssueWarning(null)}
              className="text-rose-500 hover:text-rose-800 p-1 rounded transition-colors"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[580px]">
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-medium text-zinc-600">Restoring PitchAI session from database...</span>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  msg.role === 'user'
                    ? 'bg-zinc-100 border-zinc-300 ml-6 sm:ml-16 shadow-2xs'
                    : 'bg-zinc-50/80 border-zinc-200 mr-2 sm:mr-12 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2 pb-1.5 border-b border-zinc-200/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        msg.role === 'user' ? 'text-blue-700' : 'text-emerald-700'
                      }`}
                    >
                      {msg.role === 'user' ? 'Partner Inquiry' : 'PitchAI Director Synthesis'}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-[11px] text-zinc-400">{msg.timestamp}</span>
                  </div>

                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.content, index)}
                      className="text-zinc-500 hover:text-zinc-900 p-1 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
                      title="Copy Response"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="prose prose-zinc prose-xs max-w-none text-zinc-800 text-xs leading-relaxed space-y-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}

          {isCopilotLoading && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mr-12 flex items-center gap-3 text-xs text-zinc-600">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>PitchAI is synthesizing investment committee analysis against venture benchmarks...</span>
            </div>
          )}
        </div>

        {/* Integrated Diligence Prompt Accelerators + Input Box */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-3.5">
          {/* Diligence Prompt Accelerators */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-zinc-900 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diligence Prompt Accelerators</span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Click any prompt to run instant committee synthesis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {quickPrompts.map((chip, idx) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.prompt)}
                    disabled={isCopilotLoading}
                    className="flex items-start gap-2.5 p-3 bg-white hover:bg-emerald-50/40 text-left rounded-xl border border-zinc-200/90 hover:border-emerald-300 transition-all cursor-pointer group disabled:opacity-50 shadow-2xs"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-50 group-hover:bg-emerald-100/60 border border-zinc-200 text-emerald-600 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                        {chip.label}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {chip.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Query Input Box */}
          <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-xl p-2 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900 transition-all shadow-2xs">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Ask PitchAI about ${companyName} (e.g., "Draft tranche milestones", "Calculate true payback if gross margin is 50%")...`}
              aria-label={`Ask PitchAI partner director about ${companyName}`}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
              disabled={isCopilotLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || isCopilotLoading}
              aria-label="Send message to PitchAI"
              className="px-4 py-2 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              {isCopilotLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] text-zinc-400 text-center">
            Powered by Google Gemini · Grounded in a16z, Sequoia, Bessemer, and Benchmark institutional venture frameworks.
          </div>
        </div>
      </div>
    </div>
  );
};
