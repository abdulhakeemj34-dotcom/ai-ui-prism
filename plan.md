# Implementation Plan - Nexora AI Personal Assistant

Design and implement a modern, mobile-first AI personal assistant app called "Nexora" with a futuristic, clean, and premium aesthetic. The app will feature task management, note-taking, goal tracking, expense tracking, AI chat, and a study planner.

## Scope Summary
- **App Name:** Nexora
- **Visual Style:** Futuristic, premium, dark/light mode, mobile-first, single-hand usability.
- **Core Features:**
    - Bottom Navigation (Tasks, Notes, AI Chat, Goals, Expenses/Planner).
    - Task Management: Interactive lists with swipe-to-action.
    - Notes: Rich markdown-supported editor.
    - Goal Tracking: Visual progress indicators.
    - Expense Input: Graphical summaries and simple entry.
    - AI Chat: Dynamic interface with quick commands.
    - Study Planner: Drag-and-drop interface with calendar integration.
- **Interactions:** Micro-interactions, animations, and loading states.
- **Non-Goals:** Real-time backend sync (using LocalStorage for persistence in this session), actual AI LLM integration (simulated responses).

## Affected Areas
- **Frontend UI:** New components for each feature module, navigation bar, and layout container.
- **State Management:** React state + LocalStorage for persistent data across sessions.
- **Theming:** Tailwind CSS with CSS variables for dark/light mode switching.
- **Navigation:** Layout with bottom-tab navigation.

## Assumptions & Open Questions
- We will use `framer-motion` for animations and micro-interactions.
- Swipe actions will be implemented using `framer-motion` or simple CSS transitions.
- Markdown support in notes will use a library like `react-markdown`.
- LocalStorage will be used to simulate persistence since no database is available.

## Ordered Phases

### Phase 1: Layout & Theming
- Implement a `Layout` component with a fixed bottom navigation bar.
- Set up Theme provider for dark/light mode toggle.
- Create core UI atoms (futuristic buttons, cards, glassmorphism effects).
- **Owner:** `frontend_engineer`

### Phase 2: AI Chat & Quick Commands (The Core)
- Build the `Chat` view with a message stream.
- Implement "Quick Commands" buttons (e.g., /task, /note, /goal).
- Add simulated AI response logic.
- **Owner:** `frontend_engineer`

### Phase 3: Tasks & Notes
- `TaskView`: List with swipe-to-complete/delete functionality.
- `NoteView`: Rich editor with markdown preview toggle.
- Implement basic LocalStorage hooks for these entities.
- **Owner:** `frontend_engineer`

### Phase 4: Goals & Expenses
- `GoalView`: Dashboard with circular/linear progress bars.
- `ExpenseView`: Form for entry and a simple Recharts/SVG graphical summary.
- **Owner:** `frontend_engineer`

### Phase 5: Study Planner & Calendar
- `PlannerView`: Drag-and-drop task sorting (using `dnd-kit` or similar).
- Calendar integration (visual list/grid of days).
- **Owner:** `frontend_engineer`

### Phase 6: Refinement & Micro-interactions
- Add page transitions and loading skeletons.
- Polish the "premium" aesthetic (gradients, blurs, shadows).
- Fix any UI bugs and ensure mobile-first responsiveness.
- **Owner:** `quick_fix_engineer`

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. frontend_engineer — Build layout, navigation, and all core feature modules.
2. quick_fix_engineer — Polish UI, animations, and fix minor layout issues.

**Per-agent instructions:**

### 1. frontend_engineer
- **Phases:** 1, 2, 3, 4, 5
- **Scope:** 
    - Create a mobile-first layout with a bottom navigation bar (`/tasks`, `/notes`, `/chat`, `/goals`, `/planner`).
    - Implement the AI Chat as the home screen or central tab.
    - Use `framer-motion` for swipe actions in tasks and transitions.
    - Use `lucide-react` for minimalist iconography.
    - Use `localStorage` for data persistence.
    - Build specialized components: `MarkdownEditor`, `TaskItem` (swipeable), `GoalProgress`, `ExpenseChart`.
- **Files:** 
    - `src/App.tsx` (Routing/Layout)
    - `src/components/nexora/*` (Feature components)
    - `src/hooks/use-persistence.ts` (LocalStorage logic)
- **Depends on:** none
- **Acceptance criteria:** All 6 core features are navigable and functional with dummy/local data. Dark/light mode works seamlessly.

### 2. quick_fix_engineer
- **Phases:** 6
- **Scope:** 
    - Review the "premium" aesthetic: add glassmorphism where appropriate.
    - Ensure font sizes and hit targets are optimized for single-hand mobile use.
    - Fix any CSS inconsistencies in the theme switcher.
    - Add micro-animations to icons and buttons.
- **Files:** `src/index.css`, `src/components/ui/*`
- **Depends on:** frontend_engineer
- **Acceptance criteria:** UI feels "premium" and smooth; transitions are fluid.

**Do not dispatch:** supabase_engineer (no database requested/available).
