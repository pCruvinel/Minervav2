---
title: Fix Button Component Ref Forwarding
status: proposed
---

# Context
The user reported that the "Buscar Cliente ou Crie um novo" component in the "Novo Lead (OS 01-04)" workflow is not working.
Console logs show a warning: `Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`.
This is caused by the `Button` component in `src/components/ui/button.tsx` not using `React.forwardRef`, which is required when used as a child of `PopoverTrigger` (with `asChild`).

# Objective
Fix the `Button` component to correctly forward refs, ensuring compatibility with Radix UI primitives like `PopoverTrigger`.

# Implementation Plan
1.  Modify `src/components/ui/button.tsx`:
    *   Wrap the `Button` component with `React.forwardRef`.
    *   Pass the `ref` to the underlying `Comp` (either `Slot` or `button`).
    *   Update the component signature to include the ref type.

# Verification
1.  Open the "Novo Lead (OS 01-04)" page.
2.  Click on the "Buscar por nome, CPF ou CNPJ..." button (which is the `PopoverTrigger`).
3.  Verify that the Popover opens.
4.  Verify that the console warning is gone.
