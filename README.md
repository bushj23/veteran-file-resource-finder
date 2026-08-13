# The Veteran File V3.3 — Bulletproof Mobile Navigation

This build removes the mobile hamburger/menu toggle entirely.

Mobile behavior:
- A direct `Find Help` button is always visible in the header.
- A sticky mobile quick-nav is always visible with Find Help, Where Do I Start, Benefits, and TikTok.
- The "Where Do I Start?" cards are plain links, not JavaScript buttons or expandable controls.
- The ZIP finder remains in place and still uses the Vercel `/api/facilities` route.
- GA4 remains installed.

This eliminates the two mobile interactions that were repeatedly failing.
