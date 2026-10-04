# Birthday Spark: interaction research

Research reviewed on 3 October 2026. The examples below informed the interaction and content decisions; Birthday Spark uses its own visual language and implementation.

## What the examples demonstrate

- [YoursToOpen's birthday card](https://yourstoopen.com/interactive-birthday-card/) builds a deliberate opening around one message and one meaningful photo. Its guidance favors a clear, skippable gesture and a reduced-motion and keyboard equivalent over friction for its own sake.
- [Invyt's interactive wedding invitations](https://invyt.io/interactive-wedding-invitations) combine an animated opening with fast, direct actions, then let a photo wall and memory book extend the experience beyond the first screen. The transferable lesson is to make each interaction reveal personal content or help someone act.
- [Shuffling Invites' scratch reveal](https://www.shufflinginvites.com/templates/save-the-date-scratch) puts the reveal inside a phone-friendly touch gesture and provides a direct reveal button. Its star and shutter examples show how the theme concept can determine the gesture itself.
- [FlippingBook's digital photo book](https://albm.com/) pairs page turns with high-resolution photo opens. Together with timeline and caption features in digital album products, this supports treating photos as authored memories rather than an unlabeled grid.
- [Birthday Surprise on GitHub](https://github.com/zyonify/birthday-surprise) brings together mini-games, an interactive music player, visualizations, a memory gallery, a relationship quiz and easter eggs. It is a useful feature survey; Birthday Spark keeps a smaller set of short, optional interactions so the personal note stays central.
- [Awwwards' My Little Storybook](https://www.awwwards.com/sites/my-little-storybook) uses an immersive storybook premise. The listing was reachable in search results but timed out when opened for detail, so it informed only the high-level storybook direction.
- [Scrollytelling design patterns](https://scrollytelling.ai/scrollytelling-design-patterns/) warns that transitions must carry meaning, touch layouts need deliberate design, and scroll should never be hijacked. It recommends `IntersectionObserver`, transform/opacity motion and reduced-motion alternatives. Birthday Spark keeps native scrolling and makes its main actions work as taps and keyboard controls.
- The [W3C Web Audio announcement](https://www.w3.org/press-releases/2021/webaudio/) describes Web Audio as a modular foundation for original soundtracks, interface sounds and visualization. [MDN's Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) requires starting or resuming audio from a user gesture and providing play/pause and volume control.

## Product decisions

1. **Make the content personal before making the motion elaborate.** Preserve the existing greeting as a backwards-compatible letter, then add an opening line, memories with captions and dates, short reasons/wishes, an inside joke, a private reveal, closing words and a signature.
2. **Offer a short guided story with an editable path.** Keep the opening and closing anchored, while creators can include, omit and reorder the note, memory, reasons and surprise scenes using accessible up/down controls. Empty scenes are skipped.
3. **Let the seven existing themes determine their experience.** Their opening gesture, memory presentation, player art, interaction and finale come from theme metadata and theme renderers, not just color tokens. Interactions remain optional and have an ordinary reading path.
4. **Use native touch and scroll.** Memory controls have buttons and swipeable scroll-snap surfaces; no forced scroll, drag-only control or hover-only reveal. Interactions provide status text, touch-sized targets and a reduced-motion path.
5. **Compose original, reusable soundscapes in Web Audio.** A user-selected mood changes harmony, tempo, instrumentation, arrangement and accent sounds. Theme metadata nudges the default mood and player appearance. The player has an explicit start/pause, volume, a lightweight animated meter, and stops scheduling when the page is hidden. No commercial songs or external audio service are used.
6. **Give the ending its own beat.** The creator can use the theme's finale, a classic candle cake, or a quiet closing. The seven theme finales use their own simple interaction, while the cake remains an available option.

