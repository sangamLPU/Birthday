# Birthday Spark

A guest-first birthday story creator with seven distinct interactive themes, a five-step editor, live desktop/mobile preview, photo memories, original Web Audio soundscapes, and shareable public pages.

## Run locally

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm start
```

Open [http://localhost:4173](http://localhost:4173). Set `PORT` to use another port.

## Deploying to Vercel (Free & Instant)

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your **Birthday** repository.
4. Keep all default build settings (Framework Preset: **Other**, Root Directory: `./`).
5. Click **Deploy**!

Your birthday website will be live with full SSL, global CDN edge caching, and indestructible share links with zero configuration or environment variables needed.

## How it is organized

- `server.mjs` serves the app and implements validation, image storage, page persistence, public lookup, and token-protected edits/deletion.
- `public/app.js` contains the route handling, story editor, shared preview/public renderer, and browser interactions.
- `public/themes.js` defines the seven birthday worlds, their openings, memory scenes, interactions, and endings.
- `public/music.js` composes fourteen original Web Audio soundscapes and short interaction cues in the browser.
- `public/styles.css` contains the Birthday Spark design system and editor/gallery styles; `public/themes.css` styles the theme gallery; `public/experience.css` contains the responsive birthday-story layouts and motion.
- `storage/` is created on first run. Birthday records are stored in `birthdays.json`; resized uploads are stored under `uploads/`.

Theme research and selected creative directions are documented in [THEME_RESEARCH.md](THEME_RESEARCH.md). Interaction references and product decisions are in [EXPERIENCE_RESEARCH.md](EXPERIENCE_RESEARCH.md).

The public link uses a random slug. A separate random edit token stays on the creator's browser and is required for editing or deleting a page. There is no account service or external database in this starter, so the JSON store and local upload folder are intended for a single server instance rather than a multi-instance production deployment.

Photos are resized in the browser before upload and validated by file signature and size on the server. Creators can add dates, captions and notes to each photo, then readers can swipe through memories or open them individually. Original soundtrack moods vary in tempo, harmony, melody and timbre; audio starts only after a user gesture and has play/pause and volume controls. Birthday pages contain plain text only; user messages are escaped before rendering. Existing saved pages and edit tokens remain compatible.
