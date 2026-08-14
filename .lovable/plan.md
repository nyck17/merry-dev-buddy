# Plan: License Management Dashboard

Implement a full-stack dashboard for managing license keys using a Supabase Edge Function API.

## User Review Required

> [!IMPORTANT]
> The application will use a dark modern theme (grey/blue) as specified. The initial admin credentials are `admin@lovable.dev` / `Admin@Lovable2026`.

- Confirm if any additional stats or filters are needed beyond the spec.
- The app will use `localStorage` for `admin_token` as requested.

## Proposed Changes

### API & Auth
- Create `src/lib/api.ts` to handle all `POST` requests to the Edge Function with the `action` pattern and `x-admin-token` header.
- Create `src/hooks/use-auth.ts` to manage login state, token persistence, and 401 redirection logic.

### Routing & Layout
- Add `src/routes/login.tsx` for the authentication screen.
- Implement `src/routes/_authenticated.tsx` layout to protect the dashboard and handle redirects if not logged in.
- Update `src/routes/index.tsx` to be the Dashboard home (protected).
- Add `<Toaster />` to `src/routes/__root.tsx`.

### Dashboard Components
- **Stats Cards**: Display Total, Active, Expired, and Lifetime counts.
- **License Table**:
    - Search and status filtering.
    - Status badges (Active, Suspended, Inactive).
    - Copy-to-clipboard functionality.
    - Format dates as `dd/mm/yyyy HH:MM`.
- **Modals**:
    - **Create License**: Fields for user, type, duration (days/minutes), lifetime, and custom key.
    - **Edit License**: Update fields and "Clear device" option.
    - **Delete License**: Confirmation dialog.
    - **User Account**: Modals for "Change Password" and "Register New Admin".

### Visuals & UX
- Dark modern theme using Tailwind v4.
- Loading spinners for API actions.
- Toast notifications for success/error feedback.

## Technical Details

- **API Pattern**: `fetch(API_URL, { method: 'POST', headers: { 'x-admin-token': ... }, body: JSON.stringify({ action, ...payload }) })`.
- **State Management**: React Query (TanStack Query) for data fetching and mutations.
- **UI Components**: shadcn/ui (Radix + Tailwind).
- **Date Formatting**: `date-fns`.
- **Form Handling**: `react-hook-form` + `zod`.

## Verification Plan

### Automated Tests
- N/A (Manual verification via preview).

### Manual Verification
- Login with provided credentials.
- Verify stats cards load data.
- Create a new license and verify it appears in the table.
- Test "Copy" button.
- Edit a license (e.g., change status) and verify persistence.
- Test "Clear device" functionality.
- Confirm "Delete" works after confirmation.
- Test 401 handling by manually clearing the token or waiting for expiry.
- Verify password change and new admin registration.