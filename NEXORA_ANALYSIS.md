# Nexora Repository Analysis

## Executive Summary

Nexora is a React/Vite web app for a personal AI assistant. It has a real frontend application with authentication screens, protected app routes, dashboard, AI chat, tasks, notes, goals, expenses, study planner, profile, settings, and premium-plan UI.

It is not currently a full production SaaS. Most user data is stored in browser `localStorage`. Supabase is optional and currently only supports auth/profile storage when configured. AI chat is designed to call a real Hugging Face server-side API proxy, but it only works if `HF_API_KEY` is configured and the local Express server is running. Billing, payments, social modules, wallet, integrations, and several future platform areas are scaffolded only.

## Architecture Overview

### Tech Stack

- Frontend: React 19, TypeScript, Vite
- Styling/UI: Tailwind CSS 4, shadcn/ui, Radix UI, lucide-react, next-themes
- Routing: React Router 7
- Forms/validation: react-hook-form, zod
- Charts: Recharts
- Drag and drop: dnd-kit
- Animation/polish: framer-motion dependency present, though not heavily used in inspected feature pages
- Server: Express 5 with CORS, dotenv, tsx
- AI API: Hugging Face Inference API via server proxy
- Optional backend/auth: Supabase JS client
- Persistence today: mostly browser `localStorage`
- Package managers/locks: `packageManager` says Bun, but both `bun.lock` and `package-lock.json` exist

### Main Structure

- `src/App.tsx`: app providers, router, splash screen, toaster
- `src/routes/index.tsx`: public auth routes and protected app routes
- `src/components/layout`: sidebar, mobile nav, protected route wrapper
- `src/pages`: dashboard and feature pages
- `src/hooks`: local persistence logic for chat, tasks, notes, goals, expenses, planner, voice
- `src/contexts`: auth, subscription, memory, theme
- `src/services`: AI client and billing scaffold
- `server`: Express API server and Hugging Face chat proxy
- `supabase/schema.sql`: profile table schema only

### Project Type

- Web App: yes
- PWA: partial metadata only, not a real PWA. There is no manifest, service worker, offline caching, or install strategy.
- Mobile App: no native mobile project
- Hybrid App: no Capacitor/Cordova/Electron/Tauri setup found

## Current Features

Implemented today:

- Signup, login, logout, forgot-password flow
- Local development auth using browser storage
- Optional Supabase auth/profile mode when env vars are configured
- Protected dashboard layout with desktop sidebar and mobile bottom navigation
- Startup splash shown once per browser session
- Dashboard summary for tasks, notes, goals, expenses, planner sessions, and recent activity
- AI chat UI with multiple chat sessions, delete/new/select chat, streamed response display, and persisted chat history
- Server-side `/api/chat` proxy to Hugging Face
- `/api/health` endpoint reporting whether AI is configured
- AI memory entries stored locally and injected into chat system prompt
- Voice input and speech output using browser Web Speech APIs where supported
- Tasks: add, complete/reopen, delete, priority tags
- Notes: add/edit/delete/search, categories, markdown preview
- Goals: add/delete, slider-based progress update, milestone data model
- Expenses: income/expense entry, delete, category totals, balance, bar chart
- Study planner: default subjects, add sessions, drag reorder, reminder toggle
- Profile: view/update name, avatar fallback, plan badge
- Settings: dark/light/colorblind theme selection, local AI memory manager, auth-provider status
- Premium page: plan comparison and local plan switching for testing

### AI Integration Status

Real pieces:

- `server/ai.ts` calls `https://api-inference.huggingface.co/models/{model}`.
- Uses `HF_API_KEY`, `HF_MODEL`, `HF_PREMIUM_MODEL`, and `HF_PREMIUM_PLUS_MODEL`.
- Free/premium/premium-plus affect selected model and max tokens.
- Frontend calls `/api/chat` through `src/services/ai.service.ts`.

Limitations:

- AI does not work unless `.env` has a real `HF_API_KEY` and the Express server is running.
- Streaming handling assumes line-delimited JSON from Hugging Face; this may not match all Hugging Face response formats.
- No server-side user auth enforcement, rate limiting, billing validation, audit logs, or abuse protection.
- `PLAN_LIMITS.maxTokens` exists on the frontend, but server token limits are hardcoded by plan.

Simulated/local pieces:

- AI memory is local browser data.
- Subscription plan upgrades are local/test-only.
- Premium model access is trusted from the client-provided plan.

### Supabase Status

Supabase is optional, not fully integrated.

Current status:

- `src/lib/supabase.ts` creates a client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are real values.
- `src/contexts/AuthContext.tsx` supports Supabase sign in, sign up, sign out, reset password, and profile update.
- `supabase/schema.sql` only defines `profiles` with RLS policies.
- Tasks, notes, goals, expenses, planner sessions, chat sessions, messages, memory, subscriptions, and billing are not stored in Supabase.

Important issue:

- `src/contexts/SubscriptionContext.tsx` and `src/pages/PremiumPage.tsx` update subscriptions through local auth helpers, so subscription upgrades are not truly cloud-backed in Supabase mode.

## Missing Features

- Real billing/payment integration
- Real subscription enforcement on the server
- Supabase database persistence for core app data
- Production password reset flow in local mode
- Real reminders/notifications for planner sessions
- Calendar integration
- Task due-date UI, task editing, descriptions, swipe actions
- Goal editing and milestone creation UI
- Expense editing, recurring expenses, budgets, currency settings
- Notes autosave/versioning/export
- Chat export, model selection UI, attachment support, server-side conversation storage
- PWA manifest, service worker, offline support, installability
- Native/hybrid mobile packaging
- Tests are not apparent from the repo structure
- Future modules in `src/modules/registry.ts` are disabled scaffolds only: social, messaging, groups, feeds, taxi, food, flights, shopping, wallet, payments, etc.

## Risks

- Local auth stores password hashes using `btoa(password + salt)`, which is not secure.
- Most data is browser-local, so clearing storage loses user data.
- Client can claim any subscription plan when calling AI unless server validation is added.
- Billing UI can upgrade locally without payment.
- Supabase mode is partial and may create inconsistent auth/subscription behavior.
- Hugging Face key must stay server-only; current design does that, but deployment must preserve it.
- TypeScript strictness is largely disabled in `tsconfig.app.json`, increasing regression risk.
- README is still a generic starter-template README and does not describe the real Nexora app.

## Environment Variables And External Dependencies

Environment variables from `.env.example`:

- `HF_API_KEY`
- `HF_MODEL`
- `HF_PREMIUM_MODEL`
- `HF_PREMIUM_PLUS_MODEL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `API_PORT`

External services/APIs:

- Hugging Face Inference API
- Supabase Auth/Profile storage, optional
- Browser Web Speech APIs for voice recognition/synthesis

## Development Status

Nexora today can run as a local web app with a polished multi-page personal assistant interface. A user can create a local account, sign in, manage tasks, notes, goals, expenses, study sessions, settings, memory, profile, and chat history in browser storage. If a Hugging Face API key and server are configured, the chat can call a real model through the Express proxy. If Supabase env vars and schema are configured, auth/profile can move to Supabase, but feature data remains local.

It is best described as a functional frontend prototype with partial real AI integration and optional partial Supabase auth, not yet a production-ready cloud app.

## Recommended Next Steps

1. Decide product direction: local-first assistant, Supabase-backed SaaS, or installable PWA.
2. Replace local auth with Supabase-only auth for production, or clearly isolate local mode as dev/demo.
3. Add Supabase tables for tasks, notes, goals, expenses, planner, chat sessions/messages, memory, and subscriptions.
4. Move subscription enforcement to the server and integrate real billing, likely Stripe.
5. Harden the AI server: authenticate requests, validate plan server-side, add rate limits, normalize Hugging Face streaming, and log failures safely.
6. Add PWA basics if mobile-web installability matters: manifest, icons, service worker, offline/cache strategy.
7. Update README to match Nexora instead of the starter template.
8. Add tests around auth mode switching, local persistence, chat API failure paths, and critical feature hooks.
