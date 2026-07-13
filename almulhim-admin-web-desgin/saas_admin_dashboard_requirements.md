# Admin SaaS Dashboard - Module Specification

## 1. Dashboard (Analytics)
- KPIs: Total Students, Active Subscriptions, Pending Approvals (Urgent), Open Support Tickets.
- Charts: Subscription growth (line), Region distribution (Gaza vs. West Bank - Pie/Bar).
- Context: Data driven by PostHog lifecycle events.

## 2. Subscriptions (Manual Approval Queue)
- Table Columns: Student Name, Plan, Submitted Date, Status Badge, AI Verification Result, Actions (View Receipt).
- Row Actions: Approve, Reject (with reason), Suspend.
- Filters: Dedicated "Pending Queue" tab (primary workload).
- Statuses: free, pending_review, pending_approval, active, expired, rejected, suspended.

## 3. Content Management (Hierarchy)
- Structure: Unit -> Chapter -> Lesson -> Media (Video/PDF).
- Controls: Publish toggle, Region selector (Gaza/West Bank/Both), Lock toggle (Free vs Subscriber).
- Media: Drag-and-drop upload for large files (1GB Video, 50MB PDF).

## 4. Students & Devices
- Students Table: Name, email, phone, Telegram, region, subscription status.
- Devices: Bound web/mobile devices per user (hashes), "Reset Device" or "Reset All" actions.

## 5. Plans, Announcements & Support
- Plans: Pricing tiers (name, price, duration, active toggle).
- Announcements: Rich-text composer + image upload + region targeting.
- Support: Inbox-style ticket list with reply box.