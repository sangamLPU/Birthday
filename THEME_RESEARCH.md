# Birthday Spark theme research

Research snapshot: 3 October 2026. I looked across award galleries, design portfolios, invitation platforms, interactive demos, and contemporary web design guidance before choosing the directions in the gallery. The references below informed visual and interaction choices; the Birthday Spark compositions are original implementations, not reproductions of those works.

## References and observations

- [Awwwards: Editorial New variable typeface case study](https://www.awwwards.com/editorial-new-variable-typeface-by-locomotive-wins-site-of-the-month-october.html) — an editorial art direction built around variable typography, folding/spinning newspaper motion, pinned elements, and scroll-triggered transitions. This informed *The Birthday Edit*'s magazine cover and typography-led hierarchy.
- [Awwwards: Bright Biotech interactive story elements](https://www.awwwards.com/inspiration/team-interactive-scrolling-story-bright-biotech) — archived examples of navigation/story transitions, animated icons, and scroll-based chapters. This supported using motion to guide a page's reveal rather than applying one effect everywhere.
- [Dribbble: birthday website design gallery](https://dribbble.com/tags/birthday-website) — a range of RSVP and event page compositions, useful for seeing birthday-specific conventions and where this project could move beyond a single invitation-card layout.
- [Behance: interactive 15th-birthday invitation](https://www.behance.net/gallery/243825489/Invitacion-interactiva-Cumpleanos-15) — combines an occasion-specific visual identity with event information and interactive details. The useful pattern was treating an invitation as a complete, personal experience.
- [Behance: NOVA scrollytelling](https://www.behance.net/gallery/189235647/NOVA-scrollytelling) — a narrative progressively revealed by scrolling; this informed the page-long storytelling structure and reveal pacing.
- [Pinterest: birthday website invitation board](https://ca.pinterest.com/tinart0118/birthday-website-invitation-templates/) — surfaced through search as a broad invitation-inspiration board. Pinterest did not expose the board contents to the browser, so it was used only as a discovery lead, not as a source for inspected designs.
- [CodePen: 3D CSS Birthday Card](https://codepen.io/jh3y/pen/YzGgdyw) — a card that opens through a user action, using CSS 3D transforms and a small celebration effect. This informed the sealed-letter interaction and the choice to make the wish action user-triggered.
- [GitHub: interactive birthday celebration template](https://github.com/VisionStack-404/Birthday-template) — documents responsive birthday experiences with personal photos, story sections, and optional interactive cake/music. It reinforced the importance of carrying custom content through the final page.
- [Partiful birthday invitation pages](https://partiful.com/invitations/free-online-birthday-invitation-templates) and [Paperless Post invitations](https://www.paperlesspost.com/cards/section/invitations?coins=0) — live invitation products demonstrate clear personalization, legible event details, and a useful distinction between invitation art and the complete event page.
- [Figma: 2026 web design trends](https://www.figma.com/resource-library/web-design-trends/) — guidance describing bold typography, motion, collage, vibrant palettes, and dark-mode directions. I treated these as options for distinct art directions, not a checklist to apply uniformly.

## Directions selected

The gallery retains the existing seven theme IDs so old drafts and birthday links continue to resolve. Each ID now maps to a different composition: editorial cover, botanical garden, tactile scrapbook, typographic party poster, opened letter, retro dessert-club menu, and night-sky observatory. The cards use miniature compositions of those same layouts, while the full preview calls the same page renderer used for a generated birthday site.

Animation is lightweight CSS plus an `IntersectionObserver` for the memory and wish sections. The letter opens on tap, the wish and confetti respond to a tap, and the other directions use their own entrance, drift, or type treatments. There are no animation-library or image-host dependencies; reduced-motion preferences bypass the scroll reveal and shorten motion.
