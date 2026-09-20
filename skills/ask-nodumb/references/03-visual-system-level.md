# Visual-system level: an expressive, reproducible language

## When this level kicks in

This level works when the product's intent and the interaction model are
already clear. The task is not to decorate an unclear system but to
build an expressive and reproducible language. A language is a set of
rules by which any decision repeats deliberately, not accidentally.

## System before screen

Don't draw a screen and then "generalize". Rules first, screens as their
application second. The rules cover:

- colour pairs,
- typographic roles,
- corner radii,
- iconography,
- motion.

A rule exists for two things: similar situations get solved the same
way, different situations get explained different treatment. If two
similar places look different without cause — a system failure. If two
different places look the same — also a failure.

Distinguish three layers of meaning:

- fundamental values — physical quantities, scales;
- semantic roles — what an element means (text, background, danger);
- component rules — how a role applies in a specific detail.

Test the system with questions:

- Does the repetition have a shared reason to change? If not, it is
  coincidence, not a system.
- Is the exception explainable next to the decision? An explainable
  exception is allowed; a silent one is not.

Don't build a system "for the future" in an empty product. Extract
patterns from living screens, once repetition is proven and the cost of
a mass edit is real. A system created before the problem is speculation.

## Colour

Colour does several jobs at once:

- hierarchy — what matters more;
- accents — what is clickable;
- emotion — what tone;
- state distinction — what changed.

Test colour with questions:

- What specific job does this colour do?
- Is the difference sufficient without one hue (colour-blindness and
  poor-screen check)?
- Which colour relationships stay stable across a theme change?

State distinction must not rest on a single hue. If "off" differs from
"on" only by green, that is a fragile solution.

## OKLCH and perceived lightness

The OKLCH model is built on perception, not on channel math:

- L — perceived lightness, the basis of hierarchy;
- C — intensity (saturation);
- H — hue.

Equal L and C at different H give equally bright accents. HSL lacks
this: two "bright" colours of the same saturation can look very
different. L in OKLCH changes without hue drift — lightening a colour
doesn't turn it into a different colour.

Two constraints:

- Mathematical colour is not visible colour. Check the gamut: sRGB and
  Display-P3 are different spaces; the same value in P3 may fall outside
  sRGB.
- Gradients: OKLCH is expressive, but hue is circular — the path from
  one colour to another can pass through an unexpected shade. If you
  need a predictable straight transition, use OKLab: its interpolation
  is linear and predictable.

## Tokens: decisions, not numbers

Tokens store decisions and relationships. A token answers "why this
value here", not "a nice number". Three levels:

- base values — physical scales (spacing step, font size, radius);
- semantic roles — purpose (text, background, border, danger, success);
- component tokens — applying a role to a specific element (button,
  field, card).

A role survives a theme change: "text on background" stays "text on
background"; only its colour in the dark theme changes. A component
token is the element's contract: the component references roles, not
numbers.

Don't name tokens by appearance when function matters more. A token
`blue-500` says nothing. A token `color-action` says why it exists and
survives a repaint without renaming.

## Materials

Each material is chosen for the job, not for the effect:

- SVG — when the image must be structure: scalability, accessibility,
  editable parts;
- gradient — a controlled transition and depth;
- motion — when movement explains a connection or a change.

A flashy technique does not replace solving a product problem. A
gradient doesn't make a form clearer; animation doesn't make a journey
shorter. Solve the problem first, then pick the material.
