---
name: Calculator architecture
description: How the global calculator button and sheet are wired up across the app
---

## Architecture
- `CalculatorProvider` wraps everything in `main.tsx` (outside AuthProvider, AppDataProvider, RouterProvider)
- `AppBar` component imports `useCalculator()` and renders a calculator icon button on the right of every AppBar — no `hideCalculator` prop needed by default
- `AppShell` imports `useCalculator()` for `{ isOpen: calcOpen, openCalculator, closeCalculator }` — no more local `useState` for calculator
- `CalculatorSheet` is a custom fixed-positioned modal (NOT using `BottomSheet` component) with backdrop, slide-in animation, and "Gunakan nilai ini" button
- `AppOutletContext` still exposes `openCalculator` for pages that don't have AppBar and need to trigger it programmatically

## Why
Previously the calculator was a `fixed top-0 right-0 z-40` button floating over the AppBar, causing overlap with page-specific AppBar actions. The context approach integrates it cleanly into every AppBar.

## How to apply
Any new AppBar usage automatically gets the calculator button. If a page needs to suppress it: pass `hideCalculator` prop to AppBar.
