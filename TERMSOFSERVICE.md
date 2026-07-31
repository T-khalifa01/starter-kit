# Terms of Service — Template, NOT Legal Advice

> ⚠️ **READ THIS BEFORE USING ANYTHING BELOW.**
>
> This is a structural starting point, not a finished legal document.
> Claude is not a lawyer and this is not legal advice. Before this goes
> live on any real dealership site, it needs review by a licensed
> attorney — ideally one familiar with Egyptian law (the primary
> market) and any other jurisdiction a given dealership's visitors are
> likely to come from. Every `[BRACKETED]` placeholder needs a real
> value, and the attorney reviewing this may want to add, remove, or
> reword entire sections based on that specific dealership's actual
> situation.
>
> This document is deliberately scoped to what THIS type of site
> actually is — an informational brochure site that hands visitors off
> to WhatsApp, not an e-commerce platform. Don't pad it with generic
> SaaS/e-commerce boilerplate clauses (user accounts, subscriptions,
> refund policies, etc.) that don't apply — that would misrepresent
> what the site does, which is its own legal risk.

---

## Terms of Service

**Last updated:** [DATE]

These Terms of Service ("Terms") govern your use of the website located
at [SITE URL] (the "Site"), operated by [DEALERSHIP LEGAL NAME]
("we," "us," or "the Dealership"). By using the Site, you agree to
these Terms.

### 1. What This Site Is

This Site is an informational resource about [DEALERSHIP NAME] and the
vehicles/services we offer. **The Site does not process purchases,
payments, reservations, or any financial transaction of any kind.**
Any pricing, vehicle availability, or specification information shown
on the Site is for general informational purposes only and does not
constitute a binding offer.

### 2. How to Reach Us

The Site provides ways to contact us, including a WhatsApp link/button
and a contact form. **When you use the WhatsApp link, you leave this
Site and communicate with us directly through WhatsApp, a third-party
platform operated by WhatsApp LLC / Meta Platforms, Inc.** That
conversation is subject to WhatsApp's own terms of service and privacy
policy, not this Site's — we do not control WhatsApp's platform,
security, or availability.

The contact form on this Site sends your submitted information (name,
phone number, and any message you provide) to us via WhatsApp and
records a copy for our internal records. See our Privacy Policy
[LINK — separate document, also needs real drafting/review] for details
on what we collect and how it's used.

### 3. Vehicle & Pricing Information

Any information about vehicles, specifications, availability, or
pricing displayed on the Site is provided for general reference and may
not reflect current, complete, or accurate information at any given
moment. **All vehicle details, availability, and final pricing are
subject to confirmation directly with the Dealership** and are not
guaranteed by anything shown on this Site.

### 4. Intellectual Property

All content on this Site — including text, images, video, logos, and
design — is owned by [DEALERSHIP LEGAL NAME] or used with permission,
and is protected by applicable intellectual property law. You may not
copy, reproduce, or redistribute Site content without our written
permission.

### 5. No Warranty

The Site is provided "as is" without warranties of any kind, express or
implied, including but not limited to accuracy, completeness, or
availability of the Site or its content.

### 6. Limitation of Liability

To the fullest extent permitted by applicable law, [DEALERSHIP LEGAL
NAME] is not liable for any indirect, incidental, or consequential
damages arising from your use of the Site, including but not limited
to reliance on any information displayed on it.

### 7. Governing Law

[PLACEHOLDER — the attorney reviewing this determines the correct
governing law/jurisdiction clause, typically based on where the
Dealership is legally registered.]

### 8. Changes to These Terms

We may update these Terms from time to time. Continued use of the Site
after changes are posted constitutes acceptance of the updated Terms.

### 9. Contact

Questions about these Terms can be directed to [DEALERSHIP CONTACT
EMAIL/PHONE].

---

## Fields requiring real values before this can be used

- `[DATE]`
- `[SITE URL]` — maps to `seo.siteUrl` in `site.config.js`
- `[DEALERSHIP LEGAL NAME]` — maps to `dealership.legalName`
- `[DEALERSHIP NAME]` — maps to `dealership.name`
- `[DEALERSHIP CONTACT EMAIL/PHONE]` — maps to `contact.email`/`contact.phone`
- `[LINK]` to a Privacy Policy — **doesn't exist yet either**, same
  "needs real drafting" status as this file, referenced here but not
  written
- Section 7's governing law clause — cannot be filled in without actual
  legal review

## What this template deliberately does NOT cover

No user accounts, no e-commerce/checkout, no subscriptions, no refund
policy, no cookie-specific clauses (that's `CookieConsentBanner.jsx`'s
job, section 14) — none of that applies to what this site actually is.
If a real attorney reviewing this for a specific dealership determines
additional clauses are needed for that dealership's specific situation,
that's a case-by-case addition, not something to bake into the shared
template preemptively.