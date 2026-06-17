# EcoSpend Mobile — App Functionality Guide

This document describes what a user can do on **every screen** in the EcoSpend mobile app. It covers navigation, actions, forms, and settings across the full product.

**Platform:** React Native (Expo)  
**Primary market:** Ghana (GH₵, MoMo providers)  
**User tiers:** Free and EcoSpend Plus

---

## Table of Contents

1. [How the app is organized](#how-the-app-is-organized)
2. [Authentication](#authentication)
3. [Main tabs](#main-tabs)
4. [Global modals & overlays](#global-modals--overlays)
5. [Screen-by-screen reference](#screen-by-screen-reference)
6. [Implementation status](#implementation-status)

---

## How the app is organized

After signing in, users land on **five bottom tabs**:

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Home overview: balance, quick actions, budgets, recent activity, weekly insight |
| **Transactions** | Full transaction list, search, and filters |
| **Goals** | Savings goals (active and completed) |
| **Vault** | Personal vaults, group vaults, and withdrawal approvals |
| **Profile** | Account, settings, subscription, help, and achievements |

Several flows open as **modals** over the tabs (add transaction, create goal, notifications, vault creation, etc.). Some screens open as **full-screen modals** (budget envelopes, MoMo calculator, weekly insights).

**Free vs Plus:** All users can use core tracking and savings features. **EcoSpend Plus** unlocks premium vault tools, group vaults, priority notifications, and vault analytics (managed from Profile → Subscription).

---

## Authentication

Available before the user reaches the main app.

### Splash Screen

- View the EcoSpend splash animation and branding.
- Automatically continues to **Login** after a short delay (no manual action).

### Login Screen

- Enter **phone number** and **password** (with show/hide toggle).
- **Log in** to access the main app.
- Tap **Forgot Password?** → Forgot Password screen.
- Tap **Sign up** → Register screen.

### Register Screen

- Enter **full name**, **phone**, **password**, and **confirm password**.
- Tap **Create Account**; on success, see confirmation and return to Login.
- Tap **Log in** if already registered.
- Terms / Privacy links are shown (placeholder handlers in current build).

### Forgot Password Screen *(placeholder)*

- Displays a stub screen only; password reset flow is not yet implemented.

### Reset Password Screen *(placeholder)*

- Displays a stub screen only; accepts a phone param but no form yet.

---

## Main tabs

### Dashboard Tab → Dashboard Screen

The home screen for daily money management.

**View**

- Personalized greeting and today’s date.
- **Total balance** card with weekly income and expenses.
- Horizontal **budget envelope** carousel (spending vs limit per category).
- **Recent transactions** list (latest activity).
- **Weekly insight** teaser card.

**Do**

- Open **Notifications** (bell icon).
- **Quick actions:**
  - **Add** → Add Transaction modal.
  - **Goals** → Goals tab (Savings Goals).
  - **Transfer** → MoMo Calculator.
- **Budget This Month → See all** → Budget Envelopes.
- **Recent Transactions → See all** → Transactions list.
- Tap any recent transaction → Transaction Details *(stub)*.
- Tap **View full report** on insight card → Weekly Insights.

---

### Transactions Tab → Transactions List Screen

Full history of income and expenses.

**View**

- Summary bar (income / expense / net).
- Filter tabs: All, Income, Expense.
- Searchable transaction list grouped by date.

**Do**

- Search by category, provider, or notes.
- Filter by type or category.
- Open **Notifications** or **MoMo Calculator** from header.
- Tap a transaction → Transaction Details *(stub)*.
- Tap **FAB (+)** → Add Transaction modal.

#### Add Transaction *(modal)*

- Choose **Income** or **Expense**.
- Enter **amount**, **category**, optional **MoMo provider** (expenses), **notes**, and date display.
- See live **MoMo fee preview** when applicable.
- **Save Transaction** → records entry and closes modal (success toast).

#### Transaction Details *(placeholder)*

- Stub only; intended for viewing a single transaction’s full details.

#### Edit Transaction *(placeholder)*

- Stub only; intended for editing an existing transaction.

---

### Goals Tab → Savings Goals Screen

Track personal savings targets.

**View**

- Summary hero: total saved and active goal count.
- Toggle between **My Goals** (active) and **Completed**.
- Goal cards with progress, deadline badges, and weekly targets.

**Do**

- Open **Notifications**.
- Tap **+** → Create Goal *(stub modal route)*.
- On an active goal:
  - **Add Money** → Add Goal Contribution *(stub)*.
  - **Details** → Goal Details *(stub)*.
- Completed goals are view-only celebration cards.

#### Create Goal *(placeholder)*

- Stub screen; goal creation UI not yet on this route.

#### Goal Details *(placeholder)*

- Stub screen; intended for goal history and management.

#### Edit Goal *(placeholder)*

- Stub screen; intended for editing goal name, target, or deadline.

#### Add Goal Contribution *(placeholder)*

- Stub screen; intended for contributing money to a goal.

---

### Vault Tab → Vault Dashboard Screen

Personal locked savings vaults.

**View**

- Vault summary (total balance, active count, next maturity).
- List of active vault cards with progress and maturity info.
- Quick actions row and empty state when no vaults exist.

**Do**

- Open **Notifications**.
- Tap **+** → Create Vault modal.
- Tap a vault card → Vault Details.
- **Create Vault** / **Vault History** / **Group Vaults** quick actions.
- **FAB (+)** → Create Vault (when vaults exist).
- Empty state **Create Vault** CTA.

#### Vault Details Screen

**View**

- Balance, target, maturity countdown, fees, stats, contribution timeline.

**Do**

- Go back to dashboard.
- **Add Funds** → Create Vault flow *(reuses create screen)*.
- **Withdraw** → Withdraw Vault.

#### Create Vault *(modal)*

- Set **vault name**, **target amount**, optional **initial deposit**.
- Pick **lock duration** presets (updates maturity date).
- Review fee breakdown and preview.
- **Create Vault** → Vault Success.

#### Vault History Screen

**View**

- Searchable, filterable list of all vaults (active, matured, withdrawn, etc.).

**Do**

- Search by vault name.
- Filter by status chips.
- Tap vault → Vault Details.
- **View Details** or **Withdraw** from cards where applicable.

#### Withdraw Vault *(modal)*

**View**

- Early vs on-time withdrawal summary and fee breakdown.

**Do**

- Cancel / go back.
- Confirm via checkbox, then **Confirm Withdrawal** → Vault Success.

#### Vault Success *(modal)*

**View**

- Success receipt for vault creation or withdrawal.

**Do**

- **View Vault History** → Vault History tab screen.
- **Back to Vault Dashboard** → Vault Dashboard.

---

#### Group Vault Dashboard Screen

Shared savings with other members.

**View**

- Group vault summary and cards.
- Pending withdrawal approval requests.
- Empty state when no groups exist.

**Do**

- Open **Notifications**.
- **Join** → Join Group Vault modal.
- **+** → Create Group Vault modal.
- Quick actions: Create Group / Join a Group.
- Tap approval card → Withdrawal Approval.
- Tap group card → Group Vault Details.

#### Create Group Vault *(modal)*

- Set group name, goal name, target, lock duration, member limit.
- Add invite members by phone (+233).
- Live preview card.
- **Create Group Vault** → Vault Success.

#### Join Group Vault *(modal)*

- Enter or pick demo **invite codes** (e.g. TRIP-2026).
- Preview group when code is valid.
- **Join Group Vault** → Vault Success.

#### Group Vault Details Screen

**View**

- Group balance, members, progress, pending approvals, contribution timeline.

**Do**

- Go back.
- Tap approval request → Withdrawal Approval.
- **Contribute Funds** *(placeholder routing)*.
- **Request Withdrawal** → Withdrawal Approval.

#### Withdrawal Approval Screen

**View**

- Withdrawal request details, vote counts, member vote status.

**Do**

- Go back.
- **Approve** or **Reject** (one vote per user; buttons disable after voting).

---

### Profile Tab → Profile Screen

Account hub and settings entry point.

**View**

- Profile header (initials, name, phone).
- **Membership card** — Free plan with upgrade CTA, or EcoSpend Plus active state.
- Activity stats: goals completed, vaults created, savings streak.

**Do**

- **Upgrade to Plus** (free users) → Subscription.
- Navigate via menu:
  - Edit Profile
  - Subscription
  - Security
  - Notifications *(notification preferences)*
  - Badges & Streaks
  - Help & Support
  - About
- **Log Out** → signs out and returns to auth flow.

#### Edit Profile Screen

- Edit **full name**; phone is read-only.
- **Change Photo** UI shown *(camera not wired)*.
- **Save Changes** or **Cancel** (back).

#### Subscription Screen

- View current plan (Free or Plus).
- Browse premium benefits, pricing (GH₵ 36/year), and Free vs Plus comparison.
- **Upgrade to Plus** (simulated payment; updates tier app-wide).
- Plus users see an active-plan banner instead of upgrade CTA.

#### Security Screen

- View security status (2FA on/off messaging).
- **Change Password** → bottom sheet with validated password form.
- **Two-Factor Authentication** toggle.
- **Active Sessions** → list devices; revoke non-current sessions.
- **Logout** → confirmation → sign out.
- **Delete Account** → destructive confirmation → simulated delete + sign out.

#### Notification Settings Screen

- **Enable all** / **Disable all** bulk actions.
- Toggle each preference:
  - Weekly Insights
  - Budget Alerts
  - Goal Reminders
  - Vault Reminders
  - Group Vault Updates
  - Marketing Updates

#### Help & Support Screen

- Expand/collapse **FAQ** items.
- **Contact Support** → opens email client.
- **Report Issue** → form sheet → opens prefilled email.
- **Privacy Policy** / **Terms of Service** → scrollable legal sheets.

#### About Screen

- View EcoSpend logo, **version number**, app description, and mission statement.
- Open **Privacy Policy** or **Terms** in modal sheets.

#### Badges & Streaks Screen

- View **current streak** (days active, savings consistency %).
- View **earned achievements** and **locked achievements** with progress bars.
- Summary: earned / locked / completion percentage.
- Display-only gamification (no manual unlock actions).

---

## Global modals & overlays

These screens are reachable from multiple places (dashboard header, notifications, quick actions, etc.).

### Notifications *(modal)*

**View**

- Notifications grouped as **Today**, **This Week**, and **Earlier**.
- Types: Vault Matured, Budget Alert, Goal Completed, Weekly Insight, Group Vault Vote Request.

**Do**

- Close modal.
- **Mark all read** when unread items exist.
- **Swipe left** to dismiss a notification.
- Tap notification → marks read, closes modal, navigates to related screen:
  - Weekly Insight → Weekly Insights
  - Budget → Budget Envelopes
  - Goal → Goal Details *(stub)*
  - Vault → Vault Details
  - Group vote → Withdrawal Approval

### Weekly Insights *(full-screen modal)*

**View**

- Weekly summary: income, expenses, savings.
- Insight cards: top spending category, largest transaction, spending trend chart, month-end projection.

**Do**

- Go back to previous screen.
- Read-only analytics (no drill-down from cards).

### Budget Envelopes *(full-screen modal)*

**View**

- Monthly budget hero summary.
- Envelope cards with spent vs limit and status.
- Filter: All / On track / Warning / Over.

**Do**

- **FAB (+)** → add envelope sheet (category + monthly limit).
- Tap envelope → edit envelope sheet (update limit).
- Month chevrons are display-only in current build.

#### Create / Edit Budget Envelope screens *(placeholders)*

- Standalone routes exist as stubs; create/edit is handled via sheets on Budget Envelopes.

### MoMo Calculator *(full-screen modal)*

**View**

- Provider selection (MTN, Telecel, AT).
- Fee result, large-transfer warning, saving tip, disclaimer.

**Do**

- Enter amount for instant tier-based fee calculation.
- No save or navigation — utility tool only.

---

## Screen-by-screen reference

Quick index of every screen and primary user intent.

| Screen | User can… |
|--------|-----------|
| Splash | Wait for auto-redirect to login |
| Login | Sign in, go to register or forgot password |
| Register | Create account, return to login |
| Forgot Password | *(stub)* |
| Reset Password | *(stub)* |
| Dashboard | Overview, quick actions, open budgets/transactions/insights/notifications |
| Transactions List | Search, filter, add transaction, open details |
| Add Transaction | Record income/expense with MoMo fee preview |
| Transaction Details | *(stub)* |
| Edit Transaction | *(stub)* |
| Savings Goals | Browse goals, switch active/completed, add money, open details |
| Create Goal | *(stub)* |
| Goal Details | *(stub)* |
| Edit Goal | *(stub)* |
| Add Goal Contribution | *(stub)* |
| Budget Envelopes | View/filter envelopes, add/edit via sheets |
| Create Budget Envelope | *(stub — use sheet)* |
| Edit Budget Envelope | *(stub — use sheet)* |
| Vault Dashboard | Manage personal vaults, open group vaults, create vault |
| Vault Details | View vault, withdraw, add funds |
| Vault History | Search/filter all vaults |
| Create Vault | Create locked savings vault |
| Withdraw Vault | Withdraw with fee confirmation |
| Vault Success | Confirm success, go to dashboard or history |
| Group Vault Dashboard | List groups, join/create, open approvals |
| Create Group Vault | Set up shared vault with members |
| Join Group Vault | Join via invite code |
| Group Vault Details | View group, vote on withdrawals |
| Withdrawal Approval | Approve or reject withdrawal request |
| MoMo Calculator | Calculate MoMo transfer fees |
| Profile | Account overview, settings menu, log out |
| Edit Profile | Update name |
| Subscription | View/upgrade EcoSpend Plus |
| Security | Password, 2FA, sessions, logout, delete account |
| Notification Settings | Toggle notification categories |
| Help & Support | FAQ, contact, report issue, legal docs |
| About | App info, version, legal links |
| Badges & Streaks | View streak and achievement progress |
| Notifications | Read/dismiss alerts, navigate to sources |
| Weekly Insights | View weekly analytics dashboard |

---

## Implementation status

As of this documentation pass:

| Status | Count | Notes |
|--------|-------|-------|
| **Fully interactive** | ~29 screens | Core flows for dashboard, transactions (add/list), vault, group vault, profile, notifications, insights, gamification, budget (via sheets) |
| **Placeholder / stub** | ~11 screens | Forgot/reset password, transaction detail/edit, goal create/edit/details/contribution, standalone budget create/edit routes |

Stub screens show a title only; related functionality may exist elsewhere (e.g. budget create/edit via sheets on Budget Envelopes).

---

## Typical user journeys

### New user

1. Splash → Register → Login  
2. Dashboard → Add Transaction → view on Transactions tab  
3. Goals → Create Goal *(when implemented)* or browse mock goals  
4. Profile → complete Edit Profile, review Subscription  

### Saver

1. Goals → contribute to goals, track progress  
2. Vault → Create Vault → monitor maturity on Vault Details  
3. Badges & Streaks → track streak and achievements  

### Group saver

1. Vault → Group Vaults → Join or Create Group Vault  
2. Group Vault Details → contribute *(when wired)*  
3. Withdrawal Approval → vote on member withdrawal requests  

### Budget-conscious user

1. Dashboard → budget carousel → Budget Envelopes  
2. Add/edit envelopes to set monthly limits  
3. Weekly Insights → review spending trends and month-end projection  
4. Notification Settings → enable budget alerts  

### Plus subscriber

1. Profile → Subscription → Upgrade to Plus  
2. Unlock group vaults, vault analytics, and priority notifications  
3. Full vault feature set on Vault tab  

---

*Generated from the EcoSpend mobile codebase (`ecospend-mobile`). Update this file when new screens ship or stub routes are completed.*
