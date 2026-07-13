# Design Audit — AI HTML → Figma Fixes

Source folder: `almulhim-admin-web-desgin/`  
**Primary Figma file:** https://www.figma.com/design/C9llNwGWfmvXRdTbZpHU9c/AlMulhim-Admin-Panel  
Reference/scratch file (deprecated): https://www.figma.com/design/3siUYTszCY3Etmf27nLDWF

## Component instance swap pass (done — AlMulhim Admin Panel)

Applied to **C9llNwGWfmvXRdTbZpHU9c** (user design file). Components live on **Components** page.

### StatusBadge
| Screen | Instances | Notes |
| --- | --- | --- |
| Dashboard | 5 | Active, Pending Review, Pending Approval, Free, Expired |
| Subscriptions | 3 | PENDING_APPROVAL, PENDING_REVIEW, FREE |
| Students | 3 | Active, Pending Approval, Expired |
| Support | 0 | Ticket labels are `Open` / `Closed` — **not** subscription status enum |

### Sidebar (all 8 screens)
| Screen | Active item | OK |
| --- | --- | --- |
| Settings | Settings | ✓ |
| Dashboard | Dashboard | ✓ |
| Subscriptions | Subscriptions | ✓ |
| Content | Content | ✓ |
| Students | Students | ✓ |
| Plans | Plans | ✓ |
| Announcements | Announcements | ✓ |
| Support | Support | ✓ |

Old capture sidebars hidden (not deleted) for rollback.

### KpiCard
| Screen | Instances | Variants |
| --- | --- | --- |
| Dashboard | 4 | 3× standard + 1× highlighted (Pending Approvals) |
| Subscriptions | 4 | 1× highlighted (Total Pending) + 3× standard |

### DataTable
- Library component remains on **Components** page.
- Subscriptions live table **kept** with StatusBadge instances (sample DataTable swap deferred — would have orphaned badge instances).
- Follow-up: compose `StatusBadge` into `DataTableRow` and migrate row mock data.

---

## Flags — mock data / enum mismatches

| Screen | Label / value | Issue |
| --- | --- | --- |
| **Support** | `Open`, `Closed` | Support ticket statuses — **not** in subscription StatusBadge enum (`free`…`suspended`). Need a separate `TicketStatusBadge` or extend the system. |
| **Dashboard** | `Urgent` (Pending Approvals KPI trend) | Trend chip text, not a status enum — OK as KpiCard `Trend` prop; not a Kinetic status color token. |
| **Dashboard** | `verified` (icon/label noise) | Material icon name leaked as text in capture — not a domain status. |
| **Subscriptions** | KPI trends `94% AI`, `Critical`, `Fast` | Not status enums; OK as trend strings. `Critical` is not a Kinetic status token. |
| **Students** | `verified` | Same icon-name leak as Dashboard. |
| **Subscriptions** table | Sample row plan `Free Tier` (text) | Plan name, not status — fine; status cell correctly uses `FREE` badge. |

Valid StatusBadge enum (all covered by component):  
`free` · `pending_review` · `pending_approval` · `active` · `expired` · `rejected` · `suspended`

---

## Kinetic variables + components (from prior pass)

- Collection `Kinetic`: 34 colors + 11 floats, scoped + CSS syntax
- Components: StatusBadge, KpiCard, SidebarNavItem, Sidebar, DataTableRow, DataTable

## Optional next

1. Build `TicketStatusBadge` (`open` / `reviewed` / `closed`) for Support
2. Nest StatusBadge inside DataTableRow; migrate Subscriptions/Students tables fully
3. Delete hidden capture sidebars/KPIs after visual QA sign-off
