# The Veteran File V3 — VA ZIP Finder

Uses the official VA Facilities API through a Vercel serverless function.

Current mode: VA sandbox/test data.

Required Vercel environment variable: `VA_API_KEY`

After VA production approval, change the upstream URL in `api/facilities.js` from:
`https://sandbox-api.va.gov/...`
to:
`https://api.va.gov/...`
and replace the Vercel environment variable with the production key.
