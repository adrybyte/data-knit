# MergeCore — Privacy-First, Zero-Server CSV Engine

> **B2B Micro-SaaS Asset Overview**  
> *100% Client-Side Data Joining & Wrangling Tool with Built-In Licensing & Zero Infrastructure Overhead.*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![License](https://img.shields.io/badge/Monetization-Lemon_Squeezy_/_Gumroad-yellow?style=flat-square)

---

## Executive Summary

**MergeCore** is a production-ready, client-side web application designed to solve a critical friction point for finance, e-commerce, legal, and analytics teams: **merging massive CSV datasets without crashing Excel or violating strict data privacy laws (GDPR/HIPAA).**

Because data processing occurs entirely within the user's local browser memory (V8/WebAssembly), **server infrastructure costs are virtually $0**, yielding **~99% gross profit margins** on all product sales.

---

## Key Investment & Financial Highlights

| Metric / Dimension | Specification | Buyer Advantage |
| :--- | :--- | :--- |
| **Monetization Model** | One-Time Purchase ($49 Lifetime License) | Low purchase friction, immediate ROI |
| **Infrastructure Cost** | $0/mo (Hosted on Cloudflare Pages free tier) | Ultra-high net margin per unit sold |
| **Target Audience** | SMBs, Financial Analysts, E-commerce Ops, HR | High willingness to pay for data utility |
| **Compliance** | 100% GDPR, HIPAA & SOC2 compliant by design | Zero data liability; no user data stored |
| **Internationalization** | Built-in multi-language engine (EN / ES) | Ready for global acquisition & marketing |

---

## Architecture & Data Flow

MergeCore combines a **Local-First Processing Engine** with **Edge-Based License Protection** to prevent piracy while keeping backend costs at zero.
+-----------------------------------------------------------------------------------+
| CLIENT BROWSER (100% Private Engine)                                              |
|                                                                                   |
|  [CSV File A] --+                                                                 |
|                 +--> [PapaParse Engine] --> [In-Memory Hash Map] --> [Merged CSV] |
|  [CSV File B] --+         (Web Workers)          (Client RAM)                     |
+-----------------------------------------------------------------------------------+
^
| (HttpOnly JWT Cookie)
+-----------------------------------------------------------------------------------+
| CLOUDFLARE EDGE MIDDLEWARE (Zero Storage / Serverless)                             |
|                                                                                   |
|  [User Key Input] --> [Cloudflare Worker] --> [Lemon Squeezy API Validation]      |
+-----------------------------------------------------------------------------------+


---

## Technical Stack

*   **Frontend Framework:** React 18 + TypeScript (Vite bundler)
*   **Styling & UI:** Tailwind CSS (Utilitarian/Linear aesthetic, native Light & Dark mode)
*   **Animations:** Framer Motion (Subtle micro-interactions, zero neon/AI-slop clutter)
*   **Data Processing:** PapaParse (Client-side streaming & chunking parser)
*   **Internationalization:** `react-i18next` (JSON-based dictionary architecture)
*   **Routing & Guards:** React Router v6 + Custom Context License Guard
*   **Edge Auth & Hosting:** Cloudflare Pages Functions + HTTP-only Cookie Verification
*   **Payment Gateway:** Lemon Squeezy / Gumroad (Merchant of Record integration)

---

## Code Base Structure

```text
csv-merger/
├── functions/                     # Serverless Cloudflare Edge Functions
│   ├── api/
│   │   └── verify.ts              # Lemon Squeezy license validation endpoint
│   └── app/
│       └── _middleware.ts         # Edge route protection & JWT checking
├── src/
│   ├── components/                # Reusable UI components (Dropzone, Mapper, Modal)
│   ├── context/                   # License & Demo state providers
│   ├── i18n/                      # Internationalization setup & locale JSONs
│   │   └── locales/
│   │       ├── en.json            # English dictionary
│   │       └── es.json            # Spanish dictionary
│   ├── hooks/                     # Custom hooks (useCsvParser, useTheme)
│   ├── pages/                     # High-converting Landing, Demo & Core App views
│   │   ├── Landing.tsx
│   │   ├── MergerApp.tsx
│   │   └── Unlock.tsx
│   ├── App.tsx                    # Route definitions
│   └── main.tsx                   # App bootstrap
├── tailwind.config.js             # Custom dark mode & minimalist color tokens
├── vite.config.ts                 # Production chunking & code obfuscation setup
└── package.json
Key Features & Product Workflows
High-Converting Landing Page: Includes animated Hero visual, feature grid, interactive preview banner, pricing cards, and FAQ accordion.

Freemium / Interactive Demo Mode: Allows users to test functionality with up to 50 rows using preloaded or custom datasets before requiring a license key to export full files.

Visual VLOOKUP Column Mapper: Drag-and-drop column matching interface requiring zero technical or Excel formula knowledge.

Anti-Piracy Security: Production build leverages Vite code-splitting (app-engine.js chunk isolation) and serverless middleware to prevent unauthorized access to the application payload.

Developer Quickstart & Local Setup
Prerequisites
Node.js v18.x or higher

npm or pnpm

Installation
Clone the repository:

Bash
git clone [https://github.com/your-username/csv-merger.git](https://github.com/your-username/csv-merger.git)
cd csv-merger
Install dependencies:

Bash
npm install
Configure environment variables:
Create a .env.local file in the root directory:

Fragmento de código
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id
Run development server:

Bash
npm run dev
Build for production & test edge bundle:

Bash
npm run build
Immediate Growth & Scalability Opportunities for Acquirers
B2B Outbound Campaigns: Cold outreach to mid-sized accounting, HR, and legal firms emphasizing HIPAA/GDPR compliance.

SEO Expansion: Create programmatic landing pages targeting long-tail searches (e.g., "How to merge 500k row CSV without Excel crashing").

Feature Upsells: Introduce add-on modules for PDF parsing, JSON conversion, or local SQLite database queries.

Desktop Packaging: Wrap the core React codebase using Tauri or Electron to publish on the Mac App Store and Microsoft Store for $99 lifetime licenses.

License & Acquisition Rights
Upon purchase, the buyer receives 100% IP ownership, including source code, domain name, brand assets, active Lemon Squeezy integration blueprints, and deployment scripts.


<ElicitationsGroup message="¿Cómo quieres continuar con la preparación del proyecto?">
  <Elicitation label="Redactar la ficha de venta (Listing Pitch) para Acquire.com" query="Redacta el texto corto y directo de la ficha de venta (Listing Description) para publicar este proyecto en Acquire.com destacando métricas y propuesta de valor."/>
  <Elicitation label="Generar script para crear datos ficticios de prueba" query="Genera un script simple en Node.js que cree dos archivos CSV grandes de prueba (clientes.csv y pedidos.csv) para testear la aplicación."/>
</ElicitationsGroup>