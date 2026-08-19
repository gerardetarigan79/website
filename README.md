# Draven Portfolio — latest fixes

React + Vite + Vercel-ready portfolio.

## Included fixes
- Removed the Home page Contact / Biolinks / Website pills.
- Discord presence now maps the current public Discord user flags correctly and also shows Nitro when `premium_type` reports Nitro.
- Last.fm top artists are enriched with `artist.getinfo` images when `user.gettopartists` returns empty image data.
- Recent Last.fm plays are displayed in a horizontal, scrollable strip with up to 12 tracks.
- Setup only contains the requested hardware; the extra My Stack pills were removed.
- Roblox avatar now goes through `/api/roblox` so the JSON thumbnail response is converted into an actual image URL.
- Steam data uses the official Web API when configured, with a public Steam XML fallback for public profiles.
- F1 data now uses the correct Jolpica driver/constructor filter routes and refreshes every 60 seconds; the next race endpoint is included.
- F1 sidebar navigation explicitly scrolls to the section, and IntersectionObserver uses the viewport center so the active icon follows scrolling.
- Contact Open button points directly to `https://discord.com/users/715076381293150288`.

## Environment variables
- `LASTFM_USER=drva7`
- `LASTFM_API_KEY=...`
- Optional Steam API: `STEAM_API_KEY`, `STEAM_ID`

The uploaded `public/VideoMed.otf` font is included.
