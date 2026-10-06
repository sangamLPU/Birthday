# Birthday Spark

A birthday story builder with **no accounts or signup**, seven handmade interactive worlds, a five-step creator, live desktop/mobile previews, photo memories and 21 Web Audio scores.

Anyone with the public birthday link can view and forward the page. Avoid including anything you would not want forwarded; tucked-away notes are also visible to anyone with the link. Generated pages have `noindex,nofollow`, which requests search-engine exclusion and is not access control. Link availability depends on deployment and storage; it is not guaranteed forever.

## Local development

Use Node.js 20.9+ (22/24 recommended), run `npm install`, then `npm start` and open [localhost:4173](http://localhost:4173). `PORT` changes the port. Without Redis credentials, local development stores JSON in `storage/birthdays.json` and photos in `storage/uploads/`; `STORAGE_DIR` can override the directory. Local writes are serialized and atomically replace the JSON file. This mode is intended for one local server instance.

Configured Redis is used exclusively; an outage fails instead of switching stores. Rate limits are skipped outside production. Local Blob uploads also require Redis for ownership tracking. Load environment variables through your shell, Vercel CLI, or Node's `--env-file`; `.env.example` is not loaded automatically.

## Vercel setup

Use the **Other** framework preset, repository root and Node 22/24. Commit the lockfile and retain `vercel.json`'s `public` output directory, function file inclusion and rewrites. Public birthday routes pass through the server function for initial metadata; creator routes remain SPA routes.

Connect [Upstash Redis](https://upstash.com/docs/redis/howto/connect-with-upstash-redis) and a **public** [Vercel Blob store](https://vercel.com/docs/vercel-blob). Configure server-only variables for Production and any Preview environment used, then redeploy:

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash HTTPS REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Read/write token allowing GET, SET, DEL and EVAL |
| `BLOB_READ_WRITE_TOKEN` | Token supplied by the connected public Blob store |
| `PUBLIC_ORIGIN` | Recommended canonical origin, e.g. `https://birthday.example.com` |

The existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` pair also works. Upstash names take precedence. Broad guessing of environment keys has been removed to avoid mixing credentials. Blob upload URLs are checked against Vercel’s public Blob hostname pattern, so no separate hostname variable is needed. Never expose server tokens to browser JavaScript or source control.

Vercel and `NODE_ENV=production` require durable Redis. Missing credentials, provider HTTP errors, malformed responses and timeouts return `503`. Creation, editing and deletion succeed only after acknowledged durable writes. `/api/health` reports `durableStorageReady` and storage mode without credentials or environment key lists. Text-only pages work without Blob; new production photo uploads fail clearly without it and never fall back to Base64.

Photos retain browser compression and server type/signature/decode checks. New uploads are limited to 2 MiB and 16 million pixels, keeping Base64 transport within Vercel's function payload budget. Blob uses unique UUID filenames under `birthdays/`; birthday records contain trusted Blob URLs only. See the [Blob SDK documentation](https://vercel.com/docs/vercel-blob/using-blob-sdk) for public access and store tokens.

New production photo uploads require `BLOB_READ_WRITE_TOKEN` and durable Redis. Upload URLs are taken from the authenticated Blob SDK response and must match the HTTPS Vercel public Blob URL pattern; no hostname setting is required. Blob is not needed for text-only pages.

## Durability and compatibility

Redis stores independent `birthday:<slug>` records. Existing per-page keys and the old `birthdays` array remain readable; editing an aggregate-only record migrates it to an independent key. Deletion atomically removes the independent record and any matching legacy array row, and leaves a separate tombstone to prevent resurrection from the old array. Preserve tombstones when restoring backups. Edit-token SHA-256 hashes remain unchanged; raw tokens are never stored in birthday records or returned by read/edit responses. New slugs have 128 random bits. Old slugs and all seven theme IDs remain supported.

Legacy Base64 and `/uploads/...` photos still render. Keep original local upload files available; Vercel cannot recover files already lost from an old ephemeral instance. Back up and import existing filesystem birthday records into Redis before migrating a filesystem deployment. Production never imports disk JSON automatically or uses `/tmp` as persistent storage. Existing bundled upload files can still be served by the function.

Atomic Redis scripts prevent concurrent edits from overwriting each other. `RATE_LIMITS` in `storage.mjs` sets one-hour IP limits: 10 creations, 50 uploads, 120 management requests and 1,200 public reads (including social HTML/images). Limits return friendly `429` JSON with `Retry-After`. On Vercel only its overwritten IP headers are trusted; elsewhere the socket peer is used. IPv6 addresses are grouped by /64, and IPs are hashed before becoming Redis keys. Self-hosted reverse proxies share their socket-peer limit unless you implement an explicitly trusted proxy policy. See [Vercel request headers](https://vercel.com/docs/headers/request-headers).

New Blob photos are claimed by one birthday. Removing a saved photo or page triggers best-effort cleanup after its durable mutation. Deleting markers prevent concurrent reuse. Legacy/shared/unknown ownership is left intact. Uploads abandoned before saving and failed Blob deletions may need manual cleanup in the store; pending photos must not be removed while active drafts use them.

## Recovery and management

The existing separate edit token remains on the creator's device. Ready and edit pages also offer **Copy private edit link** and **Download recovery info**. Recovery links use `/edit/<slug>#token=<edit-token>`. The fragment is removed from the address bar immediately; the token is validated only through the `x-edit-token` API header, then remembered on the new device. If localStorage is unavailable, recovery controls remain usable for the current session.

Anyone with the private link can edit or delete the page. Keep it safe; share only the public link with recipients. Losing both the saved recovery link and original device token still means losing editing access. Recovery controls never appear on recipient pages.

`/ready/:slug` recovers matching runtime state, then the saved local card, then the API. The editor's separate **Manage page** area provides deletion with a keyboard-accessible confirmation dialog. Successful deletion clears device token/card and related state, stops music and shows a friendly confirmation.

## Experience and organization

Step 5 highlights the recommended soundtrack and keeps story ordering, optional scenes, ending, motion, confetti, interaction sounds and photo memories under **Customize the experience**. The **21 scores** remain available from a compact picker, grouped by Birthday, Romantic, Playful, Cozy, Dreamy, Cinematic, Lo-fi, Energetic, Magical, Nostalgic, Elegant and Night-time moods. Recommendations follow theme changes until a creator manually selects a score. “A Quiet Kind of Love” keeps the existing `romantic_ballad` ID and composition.

Music opt-out prevents recipient player rendering, automatic soundtrack starts, theme soundtrack triggers and interaction audio. Creator Listen previews still work. Centralized relationship language changes fallback text only, preserving authored letters/reasons/signatures/closing/surprises/jokes/secrets. Reveals update expanded and screen-reader hidden states; keyboard and reduced-motion behavior remain.

Public HTML includes neutral personalized title/description, full OG/Twitter tags, an absolute social-image URL and privacy metadata. `/api/social/:slug.png` renders a 1200×630 PNG with world art/colors, recipient name, neutral copy and an optional primary photo. Missing photos fall back to the illustrated card. No story text or edit credentials enter previews. Sharp renders SVG/text without a browser framework; bundled Noto Sans uses the SIL Open Font License (`assets/OFL.txt`).

- `server.mjs`: HTTP routes, validation, Blob uploads/cleanup, HTML and token-authorized APIs.
- `storage.mjs`: checked Redis REST, durable/local records, atomic mutations and limiting.
- `social.mjs`, `assets/`: social PNG renderer and bundled font/license.
- `public/app.js`: creator, routing, recovery, sharing, management and interactions.
- `public/themes.js`, `public/relationship.js`: seven worlds and centralized safe defaults.
- `public/music.js`: Web Audio catalog and compositions.
- `public/styles.css`, `public/themes.css`, `public/experience.css`: existing creator/gallery/world styles.

The project remains plain ESM Node.js/browser JavaScript. Dependencies are `@vercel/blob` and `sharp`; Redis and rate limits use checked REST commands directly.
