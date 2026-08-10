# The Veteran File Resource Finder — V2 + GA4 + Mobile Fix

Google Analytics 4 Measurement ID: `G-9SM2Y9CTRG`

Fixes:
- Corrected a JavaScript syntax error that prevented interactive controls from working.
- Added mobile touch safeguards.
- Keeps GA4 page-view and interaction tracking.
- Keeps the TikTok creator embed.

Tracked custom events:
- `resource_click`
- `wizard_choice`
- `zip_search_used`

The ZIP code itself is not sent to Google Analytics.

Deploy by replacing the files inside the existing `veteran-file-site` folder in GitHub.
