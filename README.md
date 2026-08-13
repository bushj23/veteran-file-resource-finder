# The Veteran File V3.1 — Native Mobile Controls

This build keeps the VA ZIP finder and replaces the two mobile problem areas with controls that do not rely on JavaScript:

- Top-right Menu uses a native checkbox + label CSS toggle.
- "Where Do I Start?" uses native HTML details/summary cards.
- Page load clears a leftover URL hash so reopening the site does not jump straight to `#start`.
- GA4 and the VA server-side API route remain included.

Required Vercel environment variable:
`VA_API_KEY`
