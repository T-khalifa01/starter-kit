## What Model 1 is

**Presence, trust, and a WhatsApp conversion path — no inventory.** A single-page brochure site whose entire job is to make a dealership look legitimate online and get a visitor into a WhatsApp conversation with the sales team, since that's how these dealerships actually close deals — not through forms, not through calls. No product catalog, no pricing display; that's what separates it from Model 2.

**Two conversion paths, both click-to-send WhatsApp, no Business API:**
- A CTA WhatsApp button, placed contextually in sections (Hero, Contact)
- A persistent floating WhatsApp button, visible across the whole scroll
- A lead form as a third path, which itself resolves into a WhatsApp redirect rather than emailing anyone

**Structurally:** one page, hand-assembled per dealership from `components/sections` — no config-driven section switching, no generic "variant" system. Which sections exist and in what order is decided by what that specific dealership actually does, not a fixed checklist.

## Style decisions

- **No template reuse.** Each dealership gets its own layout logic and visual language, not the same structure reskinned with different colors.
- **No CSS-simulated photography.** Hero backgrounds have to work cleanly without relying on faked-up code-generated imagery standing in for real photography.
- **Gradients used deliberately** — they read as premium when controlled, cheap when overused.
- **Fonts are hand-picked per project**, not config-driven — deliberately, so there's no architectural ceiling on design. When a dealership has a real logo/wordmark, match that lettering style rather than defaulting to a generic serif.
- **Colors:** a small brand token set (primary, secondary, accent, background, surface, text) in config, with one deliberate split — the CTA WhatsApp button uses the dealership's own accent color (blends into their palette), but the floating WhatsApp button is hardcoded to WhatsApp's actual green regardless of brand, since persistent/universal recognizability matters more there than brand consistency.
- **Research shows up directly in the copy** — verbatim taglines, actual vision statements, Instagram highlight structure — not generic dealership boilerplate. This is what makes each site read as built *for* that dealership specifically.
- **Media stays lightweight and self-hosted:** a hero video ≤10 seconds, up to ~5 images if needed — no external CDN, nothing pulled from Instagram/inventory feeds for Model 1.

## Language

- **Bilingual: English-dominant, Arabic included.** `i18n` config carries the default locale and text direction (LTR/RTL) per project.

That's the actual decided scope — anything about specific section designs (Hero, About, Location, Footer) beyond what's described above hasn't been built yet; only `Contact.jsx` exists as a real, working example so far.