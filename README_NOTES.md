**Project Notes — Fairness, Edge Cases, Limitations**

- **Project:** RealTime Poll (Applyo_assignment)
- **Purpose:** Short operational notes for reviewers and maintainers describing anti-abuse mechanisms, the edge cases handled, and known limitations / next improvements.

**Two Fairness / Anti-Abuse Mechanisms**
- **Device fingerprint (client-side UUID):**
  - A UUID fingerprint is generated on first visit and stored in `localStorage` (`poll_fingerprint`).
  - The frontend sends this `fingerprint` with each vote request.
  - The backend records `fingerprint` in the `Vote` document and enforces uniqueness (compound index) to block duplicate device votes.
  - Rationale: prevents casual repeat votes from the same browser/device without requiring user accounts.

- **IP address tracking (server-side):**
  - The backend captures the request IP (`req.ip` / `x-forwarded-for`) and stores it in each `Vote` document.
  - In production mode (`NODE_ENV=production`) the backend checks for an existing `Vote` with same `pollId` + `ipAddress` and rejects duplicates.
  - Rationale: provides a second line of defense against easy repeat voting when fingerprints are cleared.

**Edge Cases & Defensive Handling Implemented**
- **Duplicate vote attempts:**
  - Compound unique index on `{ pollId, ipAddress, fingerprint }` prevents exact duplicate inserts.
  - Controller inspects `MongoServerError` code `11000` and returns a user-friendly `400` response.

- **Race conditions / concurrent voting:**
  - Votes use MongoDB atomic `$inc` (via `findByIdAndUpdate` with `$inc`) to safely increment option vote counters under concurrency.

- **Missing / invalid input handling:**
  - Validation on the frontend and backend: question and option text validation (min/max lengths), at least 2 options required.
  - Vote route validates both `optionId` and `fingerprint` are present.
  - ObjectId format (`/^[0-9a-fA-F]{24}$/`) checks for poll IDs to return `404` for invalid ids.

- **Pre-save vote validation:**
  - `Vote` model has a `pre('save')` hook that ensures `pollId` exists; this protects against recording votes for deleted polls.

- **Socket.IO circular dependency fix:**
  - Replaced direct `require('../server').getIO()` with a `config/socket.js` module exposing `setIO()` / `getIO()` to avoid circular require issues.

- **CORS for multiple origins:**
  - Backend configured to allow dev (`http://localhost:3000`), Render, Railway and Vercel frontend origins for seamless deployments.

- **Clear error reporting & logging:**
  - Controllers log key steps and errors (creation/vote attempts) to help debugging in production logs (Railway logs).

**Known Limitations & Suggested Improvements**
- **Fingerprint is client-controlled and removable:**
  - Users can clear localStorage or use different browsers to bypass fingerprint protection.
  - Improvement: store a hashed device fingerprint server-side combined with browser fingerprinting heuristics, or require optional lightweight authentication for higher-trust polls.

- **IP-based protection is imperfect:**
  - Users behind NAT or corporate proxies may share IPs; conversely, malicious users can use VPNs or proxies to rotate IPs.
  - Improvement: add rate-limiting (sliding window) per-IP and per-poll with exponential backoff; use third-party abuse-detection services.

- **No strong bot protection:**
  - Automated scripts can simulate votes. Currently the app has no CAPTCHA or behavioral bot detection.
  - Improvement: add optional CAPTCHA for high-risk polls or use a server-side behavior analysis (request patterns, JS capability checks).

- **Data model & performance at scale:**
  - Storing every `Vote` document is helpful for auditing but may grow large; reads aggregate vote counts from the `Poll` document.
  - Improvement: move vote counters to a fast in-memory store (Redis) for very high throughput, with periodic persistence to MongoDB for durability.

- **Cold-start on free platform (Render):**
  - Deployments on free tiers (Render) may spin down and cause initial latency or temporary network errors for users.
  - Improvement: use Railway/paid plans or add a lightweight warm-up ping (or schedule wake-ups) for production reliability.

- **Limited abuse metrics & observability:**
  - No analytics or dashboards to monitor suspicious behavior (rapid votes, many different fingerprints from same IP, etc.).
  - Improvement: stream vote events to an analytics/alerting pipeline (e.g., Datadog, Sentry, or a simple aggregation service) and add alerts for anomalies.

- **No user accounts or admin controls:**
  - Poll creators cannot moderate votes or remove suspected fraudulent votes.
  - Improvement: add optional authentication, administrative endpoints, and an audit UI for creators to review votes and moderate.

- **Security hardening:**
  - Poll IDs are predictable object ids and URLs are public; optionally obfuscate IDs or provide expiring tokens for private polls.
  - Improvement: implement signed share tokens for private polls and use HTTPS strictly (already enforced via deployment URLs).

**Operational Notes**
- Environment variables to set in production:
  - `MONGODB_URI` — MongoDB Atlas connection string
  - `NODE_ENV=production`
  - `PORT` — optional, platform assigns port
- Deployment choices tested: Render (backend), Railway (backend alternative), Vercel (frontend). Backend currently reachable at `https://applyoassignment-production.up.railway.app` in this workspace.

**Next high-value work (prioritized)**
1. Add optional CAPTCHA or rate-limiting for vote endpoints.
2. Add metrics & alerts for suspicious voting patterns.
3. Move real-time counters to Redis for high scale.
4. Add simple admin UI for poll owners to flag or remove votes.
5. Improve fingerprint defensibility (hashing + device features + server-side heuristics).

---
File: `README_NOTES.md` created at repository root. Share any additions you want included (e.g., deployment checklist, links to dashboards, or sample admin flows).