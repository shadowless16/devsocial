# Changelog

All notable changes to this project are documented in this file using [Semantic Versioning](https://semver.org/): **MAJOR.MINOR.PATCH**.

Because the Git history starts today, earlier dates are approximated from file timestamps and feature completeness. A feature is marked **completed** only when roughly ≥85 % of its implementation is present in the code-base (pages, components, API routes, tests, etc.).

---

## 1.8.0 • _Upcoming_
* **Messaging system (full release)** – backend persistence, real-time WebSocket support, reactions and read-receipts.
* Progressive-Web-App (PWA) install prompt and offline feed cache.

## 1.7.0 • 2025-07-29
* **Anonymous Confessions** – new `/confess` page & API routes.
* **Weekly-Challenge improvements** – badge rewards and tighter leaderboard integration.
* **Trending** – new page consuming `/api/trending`.

## 1.6.3 • 2025-07-25
* Fix: notification pop-over flicker on hover.
* Fix: `use-toast` hook now clears timers on unmount to avoid memory leaks.

## 1.6.0 • 2025-07-19
* **Notification Centre** – bulk mark-all-read (`/api/notifications/mark-all-read`).
* Real-time XP toast alerts using WebSockets.

## 1.5.2 • 2025-07-10
* Fix: referral-stats query performance (added index on `Referral.createdAt`).

## 1.5.0 • 2025-07-05
* **User Dashboard** – analytics widgets fed by `/api/analytics`.
* **Referral programme** – invite links & stats page.

## 1.4.1 • 2025-06-28
* Fix: moderator report-status update returning 500 on Mongo duplicate key.

## 1.4.0 • 2025-06-25
* **Moderation tools** – report queue, status workflow, `/mod` protected routes.

## 1.3.2 • 2025-06-12
* Fix: advanced-search date-range filter parsing.

## 1.3.0 • 2025-06-10
* **Advanced Search** – new `/search` page with facets, `/api/search/advanced`.
* **Leaderboard revamp** – real-time updates via WebSocket.

## 1.2.1 • 2025-05-30
* Fix: onboarding avatar-upload size validation.

## 1.2.0 • 2025-05-27
* **On-boarding flow** – avatar setup, tech-profile & starter-badge award.
* **XP & Rank display** – persistent XP bar and rank badge.

## 1.1.1 • 2025-05-14
* Fix: duplicate XP logs when rapidly liking/un-liking posts.
* Added `request-dedup` utility to debounce API calls.

## 1.1.0 • 2025-05-10
* **Gamification foundations** – XP system, weekly challenges, leaderboard (initial).

---
### Early 1.0.x Series – Bootstrapping the Core Social Features
The first eight patch releases rolled out the fundamental social-feed experience in small, testable increments.

| Version | Date | Key additions |
|---------|------|---------------|
| **1.0.8** | 2025-05-04 | Basic **notifications** for likes & comments (toast + `/api/notifications`). |
| **1.0.7** | 2025-05-02 | **User Settings** page (password change, theme toggle). |
| **1.0.6** | 2025-04-30 | **Profile page** – avatar, bio, follow stats. |
| **1.0.5** | 2025-04-28 | **Code-snippet posts** with syntax highlighting. |
| **1.0.4** | 2025-04-26 | **Likes** on posts & comments (`/api/likes`). |
| **1.0.3** | 2025-04-24 | **Comments** on posts (`/api/comments`). |
| **1.0.2** | 2025-04-22 | **Post creation** & core feed rendering. |
| **1.0.1** | 2025-04-21 | UI scaffolding, Tailwind setup, routing skeleton. |
| **1.0.0** | 2025-04-20 | **Project bootstrap** – Next.js 14, TypeScript, authentication (signup, login, email verification, password reset). |

---

> **Legend**  
> • **MAJOR** – incompatible API changes  
> • **MINOR** – backwards-compatible feature additions  
> • **PATCH** – backwards-compatible bug fixes and tweaks

