# The Veteran File V3 — VA Finder + Mobile Fix

This build keeps the live VA ZIP finder and fixes the mobile interaction bug.

The cause was stale V2 JavaScript looking for ZIP controls that no longer exist in V3. That runtime error stopped the rest of the JavaScript, including the “Where Do I Start?” buttons.

Also included:
- Native mobile menu that does not depend on JavaScript to open
- VA sandbox facility finder
- GA4 tracking
- Vercel server-side VA API route

Required Vercel environment variable:
`VA_API_KEY`
