# Plan: License Management Dashboard (Incremental)

Implement a full-stack dashboard for managing license keys using a Supabase Edge Function API, delivered in phases.

## User Review Required

> [!IMPORTANT]
> The application will use a dark modern theme (grey/blue). The initial admin credentials are `admin@lovable.dev` / `Admin@Lovable2026`.

- We will proceed phase by phase as requested.

## Proposed Changes

### Phase 1: API Client & Auth
- Create `src/lib/api.ts` for the `POST` + `action` pattern.
- Implement `src/hooks/use-auth.ts` for token management.
- Create `src/routes/login.tsx` (Login UI + logic).
- Setup `src/routes/__root.tsx` with `<Toaster />`.

### Phase 2: Dashboard Layout & Protected Routes
- Implement `src/routes/_authenticated.tsx` layout.
- Build the Dashboard home in `src/routes/index.tsx`.
- Add the 4 Stats Cards (Total, Active, Expired, Lifetime).

### Phase 3: License Table
- Implement the main license table with search and status filtering.
- Add status badges and date formatting.
- Implement "Copy to Clipboard" for license keys.

### Phase 4: License Management (CRUD)
- Create/Edit/Delete modals.
- Implement "Clear Device" functionality.
- Mutate data and refresh the list using TanStack Query.

### Phase 5: User Account & Final Polish
- "Change Password" and "Register New Admin" modals.
- Polish UI (loading states, transitions, dark theme refinement).

## Technical Details

- **API**: Fetch-based `apiCall` helper.
- **State**: TanStack Query (Query/Mutation).
- **UI**: shadcn/ui components (Radix + Tailwind v4).
- **Date**: `date-fns`.

## Verification Plan

### Phase 1 Verification
- Navigate to `/login`.
- Enter credentials and verify redirect to `/`.
- Check `localStorage` for `admin_token`.

### Phase 2 Verification
- Verify stats display correct numbers from the API.
- Check layout responsiveness.

### Phase 3 Verification
- See license list.
- Test search and filters.
- Verify "Copy" toast.

### Phase 4 Verification
- Create a license, edit it, delete it.
- Confirm real-time updates in the table.

### Phase 5 Verification
- Test password change.
- Verify 401 logout flow.