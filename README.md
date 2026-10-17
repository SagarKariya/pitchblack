# Pitch Black — Institutional AI Venture Capital Diligence Suite

> **Elite AI Venture Intelligence Copilot & Senior Diligence Director**  
> Performing institutional-grade investment audits across **a16z**, **Sequoia**, **Bessemer**, and **Benchmark** VC frameworks.

---

## 🏛️ Executive Overview

**Pitch Black** is an institutional venture capital diligence war-room that empowers investment teams, General Partners, and Investment Committees (IC) to underwrite early-stage and growth tech deals with forensic precision.

Instead of generic summaries, Pitch Black coordinates specialized AI diligence agents and deterministic financial heuristics to evaluate pitches across **9 Diligence Pillars**, stress-test valuation multiples, uncover forensic omissions, evaluate data grounding fidelity, and generate exportable 2-page IC memos.

---

## ⚡ Core Capabilities & Architecture

### 1. The 9 Diligence Pillars
Every uploaded startup pitch is audited against 9 rigorous VC underwriting pillars:

| Pillar | Name | Purpose & Framework |
| :---: | :--- | :--- |
| **01** | **Investment Signal & Verdict** | High Conviction / Conditional / Pass verdict, conviction score (out of 100), Lead Partner directives, and Bear/Base/Bull return waterfall payoff scenarios ($0.6\text{x}$, $2.8\text{x}$, $8.5\text{x}$). |
| **02** | **5-Factor Scorecard Radar** | Multi-axis evaluation across Founder & Team, Market TAM, Product Moat, Unit Economics, and Diligence Risk against institutional hurdles. |
| **03** | **Financial Trajectory** | Historical and projected quarterly revenue ramp, gross margins, cash burn, and Net Dollar Retention (NDR). |
| **04** | **Quantitative Metrics (a16z 16)** | Blended CAC, CAC Payback period, LTV/CAC ratio, Magic Number, Rule of 40, Gross Margin, Net Burn Multiplier, and ACV. |
| **05** | **Cohort Retention & Decay** | Month 1–12 retention decay curves comparing reported cohort numbers against top-quartile industry benchmarks. |
| **06** | **Forensic Omissions & Data Gaps** | Forensic detection of concealed liabilities, unstated customer churn, undisclosed cloud inference bills, and revenue recognition gaps. |
| **07** | **Subsector Diligence Lenses** | Vertical-specific checks tailored for Enterprise AI, Fintech, HealthTech, Connected Devices / IoT & HaaS, and General SaaS. |
| **08** | **Sensitivity Copilot** | Interactive burn multiplier, hiring elasticity, and cash runway scenario stress-testing. |
| **09** | **Diligence Question Bank** | Targeted partner interrogation questions across 5 clusters for founder meetings and data room requests. |

---

### 2. Data Grounding & Hallucination Evaluator

An institutional verification engine that cross-examines the generated audit against the raw uploaded pitch text (`rawPitchText`):

* **Numerical Score out of 10.0**: Authoritative faithfulness and grounding score (e.g., `9.2 / 10 · A Grade`).
* **Mathematical Derivations vs. Pure Synthesis**:
  * 🔵 **Mathematical Formulas (Valid)**: Financial derivations (e.g. $\text{Cash Runway} = \text{Cash} \div \text{Burn}$, $\text{Valuation Multiple} = \text{Valuation} \div \text{ARR}$, $\text{Rule of 40}$) are recognized as standard math and fully validated.
  * 🔴 **Purely Synthesized Out of Nowhere (Alert)**: If non-mathematical information (such as Founder/Team pedigree, specific customer brand logos, or compliance certs) was unmentioned in the pitch deck and synthesized by the LLM, it is prominently flagged for the investor.
  * 🟢 **Direct Pitch Quotes**: Direct disclosures verified with exact quotation excerpts.
* **Seamless Placement**: Positioned on the left side of the Pillar Navigation Footer for Pillar 01 in rich emerald green with hover glow effects.

---

### 3. PitchAI Interactive Diligence Copilot

* Conversational senior diligence partner embedded directly into the Deal Room.
* Answers partner queries grounded strictly in the deal metrics, SEC/contract filings, and forensic audit results.
* Powered by server-side Gemini Flash APIs with prompt-injection defenses and strict rate limiting.

---

### 4. Institutional IC Memo Export

* One-click generation of institutional 2-page Investment Committee Memos.
* Exportable directly to high-fidelity PDF.
* Ready for presentation at weekly partnership meetings.

---

### 5. Multi-Role Authentication & Access Control (RBAC)

* **Google OAuth & Email Credentials**: Seamless authentication powered by Firebase Auth.
* **Production HTTPS COOP Compatibility**: Configured with Helmet security headers allowing uninterrupted OAuth popup communication.
* **Administrator Review Workflow**: Gated user onboarding with real-time approval queue, Firestore persistence, and email notifications via Nodemailer.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Motion.
* **Backend**: Node.js, Express, tsx, esbuild.
* **AI Orchestration**: `@google/genai` TypeScript SDK (Gemini 2.5 Flash / Gemini 3.8 Flash).
* **Database & Auth**: Google Cloud Firestore, Firebase Authentication, Firebase Admin SDK.
* **Security**: Helmet, express-rate-limit, bearer token verification, input sanitization.

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+ installed
* Google AI Studio / Gemini API Key (`GEMINI_API_KEY`)
* Firebase Project credentials (`firebase-applet-config.json`)

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Ensure GEMINI_API_KEY is defined in your environment or .env file

# 3. Start development server (serves frontend & backend API proxy on port 3000)
npm run dev
```

Visit `http://localhost:3000` to access the Pitch Black Deal Room.

### Production Build & Deployment

```bash
# Build the React SPA bundle and bundle the Express server with esbuild
npm run build

# Start the production server
npm run start
```

---

## 🔒 Security & Environment Setup

* **Gemini API Key**: Never exposed to the client browser. All calls route through secure server-side proxies.
* **Firebase Authorized Domains**: When deploying to production domains (e.g., Cloud Run or custom domains), add your domain to **Firebase Console $\rightarrow$ Authentication $\rightarrow$ Settings $\rightarrow$ Authorized domains**.
* **COOP Policy**: Server allows seamless Google OAuth popup handshakes.

---

## 📄 License

Proprietary Institutional Diligence Software. All Rights Reserved.
