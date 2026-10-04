You are a senior full-stack engineer, product designer, UX architect, frontend specialist, and design-system engineer.

Your task is to design and implement a **complete Birthday Website Generator** that allows users to create personalized, visually impressive, shareable birthday websites for friends, family members, partners, or anyone they want to celebrate.

This must not feel like a simple form that generates a static greeting card.

The final product should feel like a polished consumer web application where someone can create a beautiful personalized birthday experience in a few minutes and share it through a unique URL.

The visual direction should be:

- Kawaii
- Cute
- Playful
- Soft
- Premium
- Emotional
- Celebration-focused
- Highly polished
- Mobile-first
- Social-media friendly

Avoid creating a generic SaaS dashboard or plain form interface.

The generator should feel fun from the very first screen.

---

# 1. PRIMARY PRODUCT GOAL

Build a complete workflow where a visitor can:

1. Open the birthday generator homepage.
2. Start creating a birthday page.
3. Enter the birthday person's name.
4. Upload one or more photos.
5. Select or generate a birthday message.
6. Optionally write a custom message.
7. Select a kawaii visual theme.
8. Choose optional birthday music.
9. Customize several presentation options.
10. Preview the birthday page in real time.
11. Generate the final birthday website.
12. Receive a unique shareable URL.
13. Share that URL with the birthday person.
14. When the recipient opens the URL, they should see a polished birthday experience rather than the editor.

Example generated URL:

`https://example.com/birthday/7gx82k`

or a readable slug such as:

`https://example.com/birthday/happy-birthday-prachi-x82k`

Do not expose editor configuration in query parameters.

Generated pages must be persisted properly in the backend/database.

---

# 2. FIRST STEP — AUDIT THE EXISTING PROJECT

Before implementing anything, inspect the existing project structure.

Identify:

- Framework and frontend architecture
- Routing system
- Backend/API architecture
- Database
- Authentication system, if present
- Storage solution
- Existing UI components
- Theme/design system
- State-management approach
- Existing animation libraries
- Existing media/music handling
- Current homepage
- Existing reusable form components
- Existing modal, toast, card, button, uploader, tabs, and dialog components

Reuse good existing architecture where appropriate.

Do not unnecessarily rewrite stable parts of the application.

If an existing implementation conflicts with the new birthday generator experience, refactor it cleanly instead of layering hacks on top.

---

# 3. CORE USER EXPERIENCE PRINCIPLE

The creation process should feel:

**fast → fun → visual → emotional → shareable**

Avoid forcing the user through large complicated forms.

Instead, use a visually guided multi-step creation experience.

The user should always understand:

- what they are currently editing,
- what the final result will look like,
- how far they are in the process,
- what they need to do next.

Whenever practical, show the live birthday preview alongside the editor.

On desktop:

Use a two-column layout.

Example:

LEFT:

Customization controls

RIGHT:

Live birthday-page preview

On mobile:

Show the editor first with a clearly accessible:

**Preview Birthday Page**

button or collapsible preview mode.

---

# 4. COMPLETE PRODUCT INFORMATION ARCHITECTURE

The application should contain at minimum:

## Public pages

- Homepage
- Birthday Generator
- Theme Gallery
- Generated Birthday Page
- Optional About / FAQ
- Optional Privacy / Terms

## Generator states

- Creation form
- Theme selection
- Message selection
- Photo customization
- Music selection
- Live preview
- Final confirmation
- Generation/loading state
- Success/share screen

Generated birthday pages must have a completely separate presentation from the generator interface.

---

# 5. HOMEPAGE REDESIGN

The homepage is extremely important.

It should immediately communicate that the product creates beautiful personalized birthday webpages.

Do not make the homepage look like an admin dashboard.

---

# 6. HOMEPAGE — VISUAL HIERARCHY

## First section — Hero

The first thing users should see:

Large playful headline such as:

**Create a Birthday Website They’ll Never Forget 🎂**

Supporting copy:

**Turn your photos, memories, music, and birthday wishes into a beautiful personalized webpage in minutes.**

Primary CTA:

**Create a Birthday Page**

Secondary CTA:

**Explore Themes**

Include a visually impressive animated preview of an example birthday webpage.

The preview may contain:

- Floating balloons
- Stars
- Hearts
- Confetti
- Cute characters
- Cake illustration
- Polaroid photos
- Birthday message
- Music indicator

The hero should instantly demonstrate what the final result can look like.

---

# 7. HOMEPAGE — SECONDARY SECTIONS

After the hero, add:

## How It Works

Show three or four illustrated steps.

Example:

1. Add Their Details
2. Choose a Cute Theme
3. Personalize the Message
4. Share the Birthday Surprise

Keep this visual and concise.

---

## Theme Preview Gallery

Show several birthday theme cards.

Examples:

- Strawberry Dream
- Sakura Birthday
- Teddy Bear Party
- Pastel Clouds
- Starry Night
- Candy Wonderland
- Kitty Celebration
- Peach Blossom
- Magical Bunny
- Lavender Dreams

Each card should visually demonstrate the theme.

Provide:

**View All Themes**

and

**Use This Theme**

actions.

---

## Example Birthday Pages

Show realistic preview cards representing generated birthday pages.

This gives users confidence about the quality of the final result.

---

## Emotional / Social Sharing Section

Explain that generated birthday websites can be shared through:

- WhatsApp
- Instagram
- Telegram
- Messenger
- Email
- Copy Link

---

## Final CTA

Finish the homepage with another strong CTA:

**Make Someone Smile Today 💕**

Button:

**Create Their Birthday Page**

---

# 8. WHAT SHOULD RECEIVE THE MOST VISUAL IMPORTANCE

Highest visual priority:

1. Birthday-page preview
2. Theme selection
3. Recipient name
4. Photo
5. Birthday message
6. Generate/share button

Medium priority:

- Music
- Animations
- Font selection
- Decorations

Lower priority:

- Advanced configuration
- Technical options
- Secondary settings

Do not overwhelm first-time users with customization settings.

Advanced settings should be placed behind:

**More Customization**

or expandable sections.

---

# 9. WHAT SHOULD BE REMOVED OR AVOIDED

Remove or avoid:

- Generic admin dashboard layouts
- Huge forms containing every option simultaneously
- Excessive technical labels
- Plain Bootstrap-looking UI
- Dense configuration panels
- Multiple nested settings screens
- Unnecessary navigation
- Too many colors competing simultaneously
- Hard-to-read decorative fonts
- Large empty sections
- Excessive gradients
- Excessive glassmorphism
- Animations that reduce readability
- Forced signup before users can experiment
- Auto-playing music immediately on initial page load

The product should feel simple even though the underlying functionality is powerful.

---

# 10. BIRTHDAY GENERATOR WORKFLOW

Create a clear multi-step flow.

Recommended steps:

### Step 1 — Who Are We Celebrating?

Fields:

Birthday person's name

Optional nickname

Optional relationship:

- Friend
- Best Friend
- Partner
- Sibling
- Parent
- Cousin
- Colleague
- Other

The relationship value may be used to improve automatically generated birthday messages.

Show friendly microcopy.

Example:

**Who deserves some birthday magic? ✨**

---

# 11. STEP 2 — ADD PHOTOS

Allow users to upload:

- Primary portrait image
- Optional additional photos

Provide:

- Drag-and-drop upload
- File picker
- Image preview
- Replace image
- Delete image
- Crop
- Reposition
- Zoom

Validate:

- Accepted file formats
- Maximum file size
- Image dimensions where necessary

Compress images before upload where appropriate.

Do not upload huge raw images directly if client-side compression can safely reduce them.

The main portrait should appear prominently inside the generated birthday page.

Optional secondary photos may appear inside:

- Polaroid cards
- scrapbook sections
- memory galleries
- animated carousels

depending on the theme.

---

# 12. STEP 3 — BIRTHDAY MESSAGE

Give the user three message options.

## Option A — Suggested Messages

Provide professionally written birthday messages grouped by style.

Examples:

- Sweet
- Funny
- Romantic
- Emotional
- Best Friend
- Family
- Short & Cute
- Heartfelt

---

## Option B — Generate Message

Allow the system to generate a birthday message using:

- person's name,
- relationship,
- tone,
- optional memory/context provided by the creator.

Example controls:

Tone:

- Cute
- Romantic
- Emotional
- Funny
- Wholesome
- Playful

Message length:

- Short
- Medium
- Long

---

## Option C — Write Your Own

Provide a rich text area for the user.

Support reasonable formatting such as:

- Paragraphs
- Line breaks
- Emoji

Avoid allowing unsafe HTML injection.

Sanitize all user-generated text.

---

# 13. STEP 4 — THEME SELECTION

Themes are one of the most important features.

Create a reusable theme architecture instead of hardcoding entire pages separately.

Each theme should define configurable design tokens such as:

- Background
- Card colors
- Text colors
- Accent colors
- Heading font
- Body font
- Decorative illustrations
- Background pattern
- Particle type
- Animation style
- Photo frame style
- Button style
- Celebration effects

Theme metadata should be data-driven.

For example:

```ts
interface BirthdayTheme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  background: string;
  accentColors: string[];
  headingFont: string;
  bodyFont: string;
  illustrationSet: string;
  animationPreset: string;
  particlePreset: string;
  photoFrameStyle: string;
  musicRecommendation?: string;
}
```

Do not duplicate entire page implementations for every theme unless absolutely necessary.

---

# 14. INITIAL KAWAII THEMES

Implement several high-quality themes.

At minimum:

### Strawberry Dream

Visuals:

- Soft pink
- Strawberries
- Cream
- Hearts
- Cute cake
- Rounded typography

---

### Sakura Birthday

Visuals:

- Pale pink
- Sakura blossoms
- Floating petals
- Japanese-inspired decorative details

---

### Teddy Bear Party

Visuals:

- Warm cream
- Brown
- Teddy bears
- Balloons
- Gift boxes

---

### Pastel Cloud

Visuals:

- Baby blue
- Lavender
- Soft clouds
- Stars
- Rainbows

---

### Magical Bunny

Visuals:

- White bunny character
- Pink
- Lavender
- Hearts
- Sparkles

---

### Candy Wonderland

Visuals:

- Pastel candy
- Lollipops
- Cupcakes
- Confetti

---

### Starry Birthday

Visuals:

- Dark navy
- Purple
- Gold stars
- Moon
- Sparkling particles

This theme should demonstrate that kawaii does not always need a bright pastel background.

---

# 15. THEME PREVIEW INTERACTION

When the user selects a theme:

- Update the live preview immediately.
- Preserve the user's photos and message.
- Preserve selected music.
- Preserve customization settings.
- Animate the theme transition smoothly.

Do not reload the entire page.

The theme gallery should support:

- Preview
- Select
- Favorite
- Category filtering

Potential categories:

- Cute
- Romantic
- Minimal
- Pastel
- Dark Cute
- Floral
- Funny

---

# 16. STEP 5 — MUSIC

Allow users to add optional birthday music.

Do not autoplay music before user interaction because browsers frequently block it and unexpected audio creates poor UX.

Instead, generated pages should show an elegant control such as:

**Tap to Start the Birthday Surprise 🎵**

After interaction, music may begin.

Music controls should include:

- Play
- Pause
- Mute
- Volume

Allow the creator to select from a curated royalty-free music library.

Possible categories:

- Happy
- Cute
- Piano
- Romantic
- Lofi
- Celebration
- Magical

Display duration and preview controls.

Do not use copyrighted commercial music unless the project has appropriate licensing.

---

# 17. ASSET SOURCING

Use legally reusable assets.

Search public/free libraries where appropriate.

Potential asset sources include:

- OpenMoji
- unDraw
- Storyset
- LottieFiles
- Pixabay
- Pexels
- Unsplash
- Openverse
- Google Fonts
- Fontshare

Before including assets, verify their license and attribution requirements.

Do not blindly hotlink external images.

Download or properly reference allowed assets according to licensing terms.

Prefer reusable assets stored within the project or an approved CDN/storage system.

Maintain an asset credits file if attribution is required.

---

# 18. ANIMATIONS

Animations should make the site feel magical without making it slow.

Potential effects:

- Floating balloons
- Confetti
- Sparkles
- Hearts
- Sakura petals
- Falling stars
- Floating clouds
- Soft entrance transitions
- Polaroid tilt animations
- Cake candle animation

Use performant CSS transforms, canvas, or optimized animation libraries.

Avoid creating hundreds of DOM nodes for particles.

Support:

`prefers-reduced-motion`

Users who disable animations at operating-system level must receive a reduced-motion experience.

---

# 19. LIVE PREVIEW

The birthday generator should include a live preview.

The preview should update whenever the creator modifies:

- Name
- Photo
- Message
- Theme
- Music
- Decorative settings

Desktop layout:

Approximately:

40% editor

60% preview

The preview can optionally be displayed inside a device/browser mockup.

Provide:

**Desktop**

and

**Mobile**

preview modes if practical.

---

# 20. GENERATED BIRTHDAY PAGE

The generated birthday page should feel cinematic and emotionally meaningful.

Do not simply render:

Name + image + message.

Instead create a short visual journey.

Recommended structure:

## Scene / Section 1

Full viewport opening.

Examples:

**🎂 Happy Birthday, Prachi! 🎂**

with animations around the name.

Primary image appears elegantly.

CTA:

**Open Your Birthday Surprise**

This user interaction can enable music playback.

---

## Scene / Section 2

Birthday message.

Present the message inside a beautiful card or scrapbook section.

Use subtle scroll animations.

---

## Scene / Section 3

Memory Gallery

If multiple photos were uploaded, display them as:

- Polaroids
- stacked cards
- carousel
- scrapbook collage

depending on theme.

---

## Scene / Section 4

Celebration Moment

Show:

- cake,
- candles,
- confetti,
- stars,
- balloons,
- theme character.

Potential interaction:

**Make a Wish ✨**

When clicked:

- candle flames disappear,
- confetti launches,
- optional animation plays.

---

## Final Section

A closing line such as:

**Made with lots of love for you 💕**

Do not reveal creator/editing UI on the generated page.

---

# 21. OPTIONAL INTERACTIVE ELEMENTS

Add tasteful interactions where appropriate.

Examples:

### Blow Out Candles

User taps birthday cake.

Candles extinguish.

Confetti launches.

---

### Open Gift

Animated gift box reveals a final message.

---

### Reveal Memory

Photo cards flip or unfold.

---

### Make a Wish

Button triggers stars or particles.

These features should be reusable theme components.

---

# 22. FINAL GENERATION FLOW

When the creator clicks:

**Generate Birthday Website**

Perform validation.

Required minimum fields:

- Recipient name
- Main image OR supported image-less theme
- Message
- Theme

Show a polished generation state.

Do not simply show a spinner.

Example loading stages:

**Wrapping the gifts… 🎁**

**Adding some birthday magic… ✨**

**Preparing the cake… 🎂**

**Your birthday surprise is ready!**

Actual generation should happen immediately; these messages are presentation only and must not artificially delay completion.

---

# 23. GENERATED PAGE DATA MODEL

Create a maintainable data structure.

Example:

```ts
interface BirthdayPage {
  id: string;
  slug: string;

  recipient: {
    name: string;
    nickname?: string;
    relationship?: string;
  };

  message: {
    text: string;
    type: 'custom' | 'generated' | 'template';
  };

  themeId: string;

  photos: {
    primary?: string;
    gallery?: string[];
  };

  music?: {
    trackId: string;
    enabled: boolean;
  };

  customization?: {
    animationIntensity?: 'low' | 'normal' | 'high';
    showConfetti?: boolean;
    showCake?: boolean;
    showGallery?: boolean;
  };

  creatorId?: string;

  createdAt: string;
  updatedAt: string;

  visibility: 'public-link' | 'private';
}
```

Adapt the model to the existing backend/database architecture.

---

# 24. UNIQUE SHAREABLE URL

Every generated birthday website must receive a unique slug or ID.

Do not use predictable sequential IDs.

Possible approaches:

- nanoid
- UUID
- cryptographically secure random token

Example:

`/birthday/prachi-x8P4w`

The server must retrieve birthday-page data using the slug.

Handle:

- invalid URL
- deleted page
- expired page
- unavailable page

with a friendly kawaii error page.

---

# 25. SUCCESS / SHARE SCREEN

After generation, show:

**Your Birthday Surprise Is Ready! 🎉**

Display:

- generated URL
- page preview
- QR code
- copy link
- open birthday page

Share actions:

- WhatsApp
- Telegram
- Facebook/Messenger where supported
- Email
- native Web Share API

Primary button:

**Share Birthday Surprise**

Secondary:

**Copy Link**

Tertiary:

**Edit Birthday Page**

---

# 26. OPTIONAL QR CODE

Generate a QR code for the birthday page.

This is useful for:

- printed cards,
- gifts,
- posters,
- party decorations.

Allow QR download as PNG/SVG if practical.

---

# 27. EDITING GENERATED PAGES

If the architecture supports accounts:

Logged-in creators should be able to reopen and edit generated pages.

If accounts are not required:

Generate a secure edit token separate from the public slug.

Never allow someone to edit a page merely because they know the public URL.

Example concept:

Public URL:

`/birthday/prachi-x82k`

Private edit token:

stored securely or tied to authenticated creator session.

---

# 28. GUEST-FIRST EXPERIENCE

Do not require registration before someone can try the generator.

Allow visitors to:

- enter details,
- upload photos,
- select a theme,
- preview the page.

If authentication is needed for permanent storage, editing, or account history, request it at the appropriate late stage rather than blocking exploration.

---

# 29. RESPONSIVE DESIGN

The generated pages will often be opened through WhatsApp or Instagram on mobile phones.

Therefore mobile quality is extremely important.

Test at minimum:

- 320px
- 360px
- 390px
- 430px
- 768px
- 1024px
- 1440px+

Ensure:

- text does not overflow,
- buttons remain tappable,
- animations do not block content,
- images crop correctly,
- decorative elements do not cover text,
- music controls remain accessible.

---

# 30. VISUAL DESIGN SYSTEM

Create reusable design tokens.

Examples:

Spacing

```css
--space-xs
--space-sm
--space-md
--space-lg
--space-xl
```

Radius

```css
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-pill
```

Typography

- display font
- heading font
- body font
- handwritten accent font

Use decorative fonts carefully.

Long messages must remain readable.

---

# 31. KAWAII UI DETAILS

Use:

- Rounded cards
- Soft shadows
- Sticker-like illustrations
- Soft pastel accents
- Cute iconography
- Floating decorations
- Sparkles
- Hearts
- Clouds
- Stars
- Confetti
- Balloons
- Cake
- Gifts

However, maintain spacing and hierarchy.

Kawaii does not mean cluttered.

---

# 32. ACCESSIBILITY

Implement proper accessibility.

Include:

- Semantic HTML
- Accessible buttons
- Keyboard navigation
- Proper labels
- Focus states
- ARIA attributes where appropriate
- Sufficient contrast
- Image alt text
- Reduced-motion support

Music controls must be keyboard accessible.

---

# 33. IMAGE HANDLING

Use proper image optimization.

Consider:

- WebP/AVIF conversion
- responsive `srcset`
- lazy loading
- image compression
- storage CDN
- upload progress indicators

Display upload states:

Uploading…

Processing…

Uploaded successfully.

Handle upload errors gracefully.

---

# 34. SECURITY

Protect all user-generated content.

Implement:

- File MIME validation
- File size limits
- Sanitized text
- XSS prevention
- Secure upload URLs
- Server-side input validation
- Rate limiting where necessary
- Secure random public IDs

Never trust client validation alone.

If HTML formatting is supported in messages, sanitize it using a mature sanitizer.

---

# 35. PERFORMANCE

Target strong mobile performance.

Avoid:

- huge initial bundles,
- loading all theme assets upfront,
- full-size uploaded photos,
- hundreds of particle DOM elements,
- unnecessary rerenders.

Use:

- code splitting
- lazy loading
- dynamic imports
- optimized animation handling
- responsive images
- caching

Load assets for the selected theme when required rather than downloading assets for every theme immediately.

---

# 36. SEO AND SOCIAL SHARING

Generated birthday pages should provide useful metadata where appropriate.

Examples:

```html
<title>Happy Birthday Prachi 🎂</title>
<meta
  name="description"
  content="A special birthday surprise made just for Prachi."
/>
```

If architecture supports server-side metadata generation, add Open Graph metadata.

Example:

```html
<meta property="og:title" content="Happy Birthday Prachi 🎂" />
<meta
  property="og:description"
  content="Someone made you a special birthday surprise!"
/>
```

Use a safe generated preview image where feasible.

Do not publicly expose private message content through metadata unless the product intentionally allows this.

---

# 37. ANALYTICS

If analytics exist, track useful product events.

Examples:

```text
homepage_create_clicked
generator_started
photo_uploaded
message_generated
theme_selected
music_selected
preview_opened
birthday_page_generated
share_clicked
birthday_page_opened
wish_interaction_clicked
```

Do not collect unnecessary sensitive information.

---

# 38. ERROR STATES

Design friendly error states.

Examples:

Upload failure:

**Oops! That photo didn’t upload. Try again 💕**

Generation failure:

**The birthday magic got interrupted ✨  
Nothing was lost — try again.**

Invalid birthday link:

**This birthday surprise couldn’t be found 🎈**

Never expose raw backend errors to users.

---

# 39. EMPTY STATES

If no photo has been uploaded:

Show an illustrated placeholder.

If no message has been selected:

Show a sample preview message.

If no theme has been selected:

Automatically select the recommended default theme.

This ensures the preview never looks broken.

---

# 40. COMPONENT ARCHITECTURE

Use reusable components.

Potential structure:

```text
BirthdayGenerator
 ├── GeneratorHeader
 ├── ProgressIndicator
 ├── RecipientStep
 ├── PhotoUploadStep
 ├── MessageStep
 ├── ThemeSelector
 ├── MusicSelector
 ├── CustomizationPanel
 ├── BirthdayPreview
 └── GenerateBirthdayButton
```

Generated page:

```text
BirthdayPage
 ├── BirthdayIntro
 ├── BirthdayHero
 ├── MessageSection
 ├── MemoryGallery
 ├── InteractiveCake
 ├── CelebrationEffects
 ├── MusicPlayer
 └── BirthdayFooter
```

Shared:

```text
ThemeProvider
BirthdayRenderer
AnimationLayer
PhotoFrame
KawaiiButton
Sticker
ConfettiLayer
ShareDialog
```

Adapt naming to the current codebase.

---

# 41. STATE MANAGEMENT

Maintain a single generator state model rather than letting every step independently manage conflicting data.

Example:

```ts
interface BirthdayGeneratorState {
  recipientName: string;
  nickname?: string;
  relationship?: string;

  photos: UploadedPhoto[];

  message: string;
  messageSource: 'template' | 'generated' | 'custom';

  selectedTheme: string;
  selectedMusic?: string;

  customization: BirthdayCustomization;
}
```

Use whatever state system already exists in the project.

Do not introduce a complex global state library solely for this feature unless it provides clear value.

---

# 42. PREVIEW ARCHITECTURE

The editor preview and final public birthday page should use the same birthday rendering components.

Do not create one implementation for the preview and another completely separate implementation for the generated page.

Ideally:

```tsx
<BirthdayRenderer
  birthday={birthdayData}
  preview={true}
/>
```

and:

```tsx
<BirthdayRenderer
  birthday={birthdayData}
  preview={false}
/>
```

This prevents visual inconsistency.

---

# 43. DATABASE AND BACKEND

Implement proper backend persistence.

Required capabilities:

Create birthday page

Fetch birthday page by slug

Update page when authorized

Delete page when authorized

Upload images

Validate generated data

Generate unique slug

Potential endpoints:

```text
POST   /api/birthdays
GET    /api/birthdays/:slug
PATCH  /api/birthdays/:id
DELETE /api/birthdays/:id
```

Adapt these to the existing project's API conventions.

Do not create redundant APIs if backend services already exist.

---

# 44. LOADING STRATEGY

When someone visits a generated birthday page:

1. Load minimum page shell.
2. Fetch birthday data.
3. Load selected theme assets.
4. Prioritize primary portrait.
5. Lazy-load gallery images.
6. Initialize animation system.
7. Wait for user interaction before starting audio.

Show a pleasant skeleton/loading experience.

---

# 45. MUSIC IMPLEMENTATION

Centralize music state.

Example:

```ts
interface MusicState {
  trackId: string;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
}
```

The floating music player should not cover primary content.

On mobile, use a small circular or pill-shaped control.

---

# 46. THEME EXTENSIBILITY

Adding a new theme should require very little implementation work.

Ideal process:

1. Add theme metadata.
2. Add theme assets.
3. Add optional theme-specific decorations.
4. Register theme.

The developer should not need to rebuild the entire birthday page.

Create a scalable theme registry.

Example:

```ts
const birthdayThemes = {
  strawberry: strawberryTheme,
  sakura: sakuraTheme,
  teddy: teddyTheme,
  clouds: cloudTheme,
};
```

---

# 47. DESIGN POLISH

Pay attention to details such as:

- Hover states
- Press states
- Skeletons
- Upload progress
- Smooth theme transitions
- Page transitions
- Toast notifications
- Empty states
- Loading states
- Mobile spacing
- Typography balance
- Image cropping
- Decorative element positioning

The difference between an acceptable implementation and a great implementation will be these details.

---

# 48. DO NOT PRODUCE PLACEHOLDER-QUALITY UI

Do not ship:

- generic grey cards,
- default Material buttons everywhere,
- stock form fields without styling,
- random emojis as the entire design system,
- incomplete placeholder theme previews,
- broken mobile layouts,
- fake share buttons,
- hardcoded birthday data,
- fake upload functionality.

The features should actually work.

---

# 49. IMPLEMENTATION PRIORITY

Prioritize work in this order:

### Phase 1

Architecture and data model

### Phase 2

Generator workflow

### Phase 3

Live preview

### Phase 4

Birthday renderer

### Phase 5

Theme system

### Phase 6

Image uploading/storage

### Phase 7

Music

### Phase 8

Persistence and shareable URLs

### Phase 9

Sharing

### Phase 10

Homepage polish

### Phase 11

Animations and interactions

### Phase 12

Responsive/accessibility/performance refinement

---

# 50. EXPECTED RESPONSE FROM YOU

Do not immediately dump large amounts of code without understanding the project.

First inspect the relevant codebase.

Then provide a concise implementation assessment covering:

### Existing System

Explain what currently exists and which parts can be reused.

### UX Problems

Explain which parts of the current experience should be changed.

### New Architecture

Explain how the birthday generator will be structured.

### Pages / Routes

List all new or changed routes.

### Components

List the major components that will be created or refactored.

### Data Model

Explain how generated birthday pages will be stored.

### Theme Architecture

Explain how themes remain reusable and extensible.

### Media Architecture

Explain photo and music handling.

Then implement the feature.

---

# 51. IMPLEMENTATION REQUIREMENTS

While coding:

- Follow existing repository conventions.
- Use strong typing where supported.
- Avoid duplicated logic.
- Avoid giant monolithic files.
- Extract reusable components.
- Keep components focused.
- Use meaningful variable names.
- Add comments only where logic is genuinely non-obvious.
- Maintain backward compatibility where reasonable.
- Remove dead code created by replaced implementations.
- Avoid introducing unnecessary dependencies.
- Handle failure states.
- Ensure all primary user paths work.

Do not simply provide pseudocode when actual implementation is possible.

---

# 52. TESTING CHECKLIST

Verify the complete workflow.

Test:

- Homepage CTA
- Generator navigation
- Name entry
- Photo upload
- Photo replacement
- Photo deletion
- Message template selection
- Generated message
- Custom message
- Theme switching
- Music preview
- Live preview
- Mobile preview
- Birthday generation
- Database save
- Generated URL
- Public page load
- Music activation
- Confetti/animations
- Share link
- Copy link
- QR code
- Invalid URL
- Missing images
- Failed upload
- Slow network
- Mobile responsiveness
- Keyboard navigation
- Reduced-motion behavior

---

# 53. DEFINITION OF DONE

The feature is complete only when a normal non-technical user can:

1. Open the homepage.
2. Understand what the product does immediately.
3. Start creating a birthday page.
4. Enter the recipient's information.
5. Upload photos.
6. Select or write a message.
7. Browse and select a kawaii theme.
8. Select optional music.
9. See a live preview.
10. Generate the birthday page.
11. Receive a unique working URL.
12. Open that URL on another device.
13. Experience the correctly themed birthday page.
14. Play the selected music after interaction.
15. Interact with birthday animations.
16. Share the page through messaging/social platforms.

The final experience should feel like a **beautiful digital birthday gift**, not a form submission followed by a static webpage.

Approach every implementation decision with that product standard in mind.