# Architectural level: the product model

The model translates intent and image into a precise description of how
the product is built. Without it, good ideas remain descriptions of
screens, the team keeps rules in their heads, and every next case
becomes an argument.

## Entities and relationships

First, name what exists in the system, for whom, and how it connects.
Don't confuse a visible interface block with a product entity.

Ask:

- What objects really exist, and what distinguishes them?
- Who creates, changes and sees them, and what do they depend on?
- Is this a separate entity, a property of another entity, a scenario,
  or just a way of displaying something?

## States and scenarios

A drawn screen is one snapshot of the system. The model must describe
what came before it, what happens after, and how the system behaves
under real edge conditions.

Ask:

- What states can an entity be in?
- What actions and conditions change the state?
- What happens when there is no data, the action failed, permissions are
  missing, or the result has already changed?
- Which scenario spans several screens and therefore must be considered
  as a whole?

## Components as isolated knowledge

A component is not just a repeated visual block. It gathers knowledge
about an element: purpose, inputs, states, behaviour rules, events,
visual variants. Extract it when the shared pattern is proven — not
because the element could potentially repeat.

Ask:

- What knowledge about the interface does this component isolate?
- Where is the boundary between an abstract component and a domain
  feature?
- What rule lets the next person use it without guessing?

## Connection to image and technology

The model is not neutral: it must express the product's image, not just
fit technical constraints. Technology checks cost and feasibility but
must not silently become the source of meaning.

Name the layer explicitly when introducing a trade-off: is this a change
to the image, the model, or the implementation. "It's easier in code" is
a sufficient reason only after the price for the person and the product
has been named.
