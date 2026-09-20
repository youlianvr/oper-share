# Examples: what it looks like in practice

Walkthroughs of real situations — how the "think like a human" cycle
applies in life.

---

## Example 1. "Why do we need this site?"

**Situation:** a player called "EFIR·3826" was built, a lot of time was
spent, and the user asks: "why do we need this site?"

**The calculator's mistake:** "The site provides video viewing with save
and recommendation features."

**The human's answer:**

1. **Step 1 (why):** honestly — nothing, by itself. YouTube exists. It's
   not a competitor.
2. **But:** it was needed as a training ground — research was drilled on
   it, adversarial review (7 bugs found), the design process (add — then
   strip the excess), taste (own brand instead of a copy).
3. **Conclusion:** "The site isn't needed. The process was — and it got
   drilled. The player stays as a trophy: yours personally, no ads, no
   tracking."

**Lesson:** a thing can be justified not by its own value but by what it
taught. Say so directly.

---

## Example 2. "What can it become"

**Situation:** the user asks what features and meaning the player has.

**The calculator's mistake:** a list of 20 features: "add dark mode,
comments, notifications, subscriptions…".

**The human's answer:**

1. **Meaning first:** "YouTube is a platform that decides what you watch.
   EFIR is a player where you decide. The meaning is intentional
   viewing."
2. **Then pluses from people's pain:** no ads (YouTube runs 2–3 clips
   before a video), no tracking (everything stays in localStorage), no
   bubble algorithm, nocookie domain.
3. **Then directions:** multiservice (Rutube/VK/local files), speed,
   playlists, cinema mode, sleep timer, PWA, collection export.
4. **Picking one:** multiservice — "an ad-free player for YouTube" is a
   niche, while "a player for everything people send you" is a habit.
   Plus it's technically simple.
5. **What NOT to do:** no comments, like-counters, trends,
   notifications — those turn the player back into a dump. EFIR's
   strength is its quiet.

**Lesson:** features are not a list but branches off the meaning. Each
answers a "why". And "what not to do" matters as much as "what to do".

---

## Example 3. Judging your own design ("look again, you're human")

**Situation:** a design with effects was built (glow, scanlines, springy
like button, staggered animations). The user asks to look at it with
human eyes.

**The calculator's mistake:** "The design matches 2026 trends: ambient
glow, micro-interactions, motion-led design."

**The human's answer:**

1. **Sat down as a viewer:** what do I see in 10 seconds? Everything
   glows, everything moves, scanlines flicker right on top of the video.
2. **What irritates:** glow for glow's sake (invisible while watching,
   eats GPU), scanlines (flicker), the springy like (by the third click —
   irritation), staggered (a delay before content), the logo, avatar and
   progress bar glow too — when everything glows, light means nothing.
3. **What stayed:** exactly two living details — the "ON AIR" pulse
   (character) and the equalizer while loading (function). The rest —
   static.
4. **A second pass found more:** the "ON AIR" indicator lied (it burned
   during pause and error) — fixed, made honest. No favicon — added. The
   title was in a display font — switched to a readable one.

**Lesson:** a human designer first adds everything they can, then removes
everything that doesn't serve. And checks the interface doesn't lie.

---

## Example 4. "As a human — what pluses do you see?"

**Situation:** the user asks to evaluate the project's pluses with a
human eye.

**The calculator's mistake:** "Pluses: modern design, convenient
interface, wide functionality."

**The human's answer:** concrete pluses that survive the "so what?"
question:

- "No ads" → so what? → "viewing is never interrupted"
- "Everything is stored in your browser" → so what? → "YouTube never
  learns what you watched"
- "No algorithm" → so what? → "you decide what to watch, not a feed"

**Lesson:** every plus is an answer to "so what?". No answer — no plus.
