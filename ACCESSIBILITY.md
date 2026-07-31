# Accessibility Checklist

## Why this file exists alongside `scripts/validate-config.mjs`

The automated check in `validate-config.mjs` catches exactly one thing:
whether `brand.colors.accent` has enough contrast against white text for
WCAG AA. That's genuinely all a script *can* reliably verify without
human judgment — it can't check whether a heading hierarchy makes
semantic sense, whether an image needs alt text and what that text
should say, or whether a custom dropdown is actually operable by
keyboard. Those require judgment applied while building each real
section design (`Hero.jsx`, `About.jsx`, etc.) — not something to
template as code.

So: **the contrast script is a narrow, automated safety net. This file
is the broader practice.** Use this checklist when building each new
dealership's actual section components, not as something enforced by a
script.

**Target: WCAG 2.2 Level AA as the baseline for every dealership site.**
AAA items are called out separately — reach for them where the design
allows, but AA is the non-negotiable floor, not AAA.

---

## Color & contrast

- [ ] Body text against its background: **4.5:1 minimum** (AA), **7:1**
      for AAA
- [ ] Large text (18pt+/24px+, or 14pt+/18.5px+ bold) and UI components
      (buttons, form borders): **3:1 minimum**
- [ ] Never rely on color alone to convey meaning (e.g. an error state
      shown only by a red border, with no icon or text) — a colorblind
      visitor needs another signal too
- [ ] `brand.colors.accent` against white is already checked by
      `validate-config.mjs` — but if a section uses accent as *text* on
      a *non-white* background, check that pairing separately; the
      script only checks the one combination `WhatsAppButton` actually
      uses

## Keyboard & focus

- [ ] Every interactive element (links, buttons, form fields, the
      country-code dropdown) must be reachable and operable via
      keyboard alone — tab through the whole page before considering a
      section done
- [ ] Visible focus indicator on every focusable element — never
      `outline: none` without a replacement focus style
- [ ] Focus order should follow visual/reading order, not DOM order if
      they diverge
- [ ] The honeypot field (`website`) is the one deliberate exception —
      `tabIndex={-1}` is correct there specifically because it must
      never be reachable, by design

## Semantic structure

- [ ] One `<h1>` per page, heading levels in order (don't skip from
      `<h2>` to `<h4>` for visual sizing — use CSS for size, headings
      for structure)
- [ ] Real `<button>`/`<a>` elements for real buttons/links — not a
      `<div onClick>` with no semantic role
- [ ] Form inputs always have an associated `<label>` (already the
      pattern in `components/ui/Input.jsx`/`TextArea.jsx` — keep it
      when customizing per project)
- [ ] Landmark regions (`<nav>`, `<main>`, `<footer>`) where they
      genuinely apply

## Images & media

- [ ] Every meaningful image needs real, specific alt text — not the
      filename, not "image of a car," but what it actually shows and
      why it's there
- [ ] Purely decorative images get `alt=""` (empty, not omitted) so
      screen readers skip them entirely
- [ ] The hero video (≤10s, per Model 1 scope) needs `muted` and
      `playsInline` if autoplaying, and shouldn't autoplay with sound
      under any circumstance — both an accessibility and a UX
      requirement

## Motion

- [ ] Respect `prefers-reduced-motion` for any scroll/entrance
      animation — relevant once `hooks/useGsapAnimation.js` gets built
      for a real design; the hook should check this media query before
      running any animation, not after

## Forms (the lead form specifically)

- [ ] Error messages are associated with their field via
      `aria-describedby` — already implemented in
      `components/ui/Input.jsx`/`TextArea.jsx`, don't remove this when
      customizing
- [ ] Error messages describe what's wrong and how to fix it, not just
      "invalid"

---

## What NOT to do

- Don't add `alt` text that just repeats the surrounding caption/heading
  verbatim
- Don't fix contrast by darkening/lightening a color slightly without
  re-checking the actual ratio — "looks fine to me" isn't a
  measurement
- Don't treat this checklist as a one-time pass — recheck after any
  visual redesign of a section, since accent colors, backgrounds, and
  layouts all change per dealership