# TripNest – Frontend for Reminders & Budget Alerts

Implemented frontend support for the two pending tasks:

1. **Trip & Activity Reminders**
   - New `/reminders` page.
   - Shows trips starting tomorrow.
   - Shows activities starting tomorrow when their `startTime` includes a date.
   - Added `Reminders & Alerts` navigation item.

2. **Budget Alerts**
   - Expense section now visibly warns at 80% budget usage.
   - Shows a critical alert at 100% or above.
   - Uses the existing `/api/trips/{tripId}/expenses/remaining-budget` endpoint.

## Files changed/added
- `app/reminders/page.tsx` (new)
- `components/AppShell.tsx` (modified)
- `components/trips/ExpenseSection.tsx` (modified)
- `lib/types.ts` (modified)
- `lib/api.ts` (modified)

No existing backend endpoints were renamed or removed.
