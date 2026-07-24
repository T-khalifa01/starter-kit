#!/usr/bin/env bash
# ------------------------------------------------------------------
# scripts/setup-firewall.sh
#
# Stages Vercel Firewall custom rules for this project to protect
# against request-volume abuse: a rate limit on the lead form
# endpoint specifically (the only route that runs real compute and
# calls out to Google Sheets), and a broad observability rule across
# the whole site so you have visibility into traffic spikes before
# deciding whether tighter rules are needed elsewhere.
#
# SAFE BY DESIGN — READ BEFORE RUNNING:
#   - Every rule below is staged with --action log, NOT deny or
#     rate_limit. Log mode observes and records matching traffic in
#     Firewall Observability without blocking anything. This script
#     deliberately does not decide to block real traffic on your
#     behalf.
#   - This script does NOT run `vercel firewall publish`. Rule
#     changes are staged as drafts until you explicitly publish them.
#     Review with `vercel firewall diff` before publishing.
#   - Run this once per dealership project (after `vercel link`),
#     not from the shared starter-kit repo itself.
#
# RECOMMENDED ROLLOUT (see comments per rule below for numbers):
#   1. Run this script (stages rules in log mode)
#   2. Review: vercel firewall diff
#   3. Publish:  vercel firewall publish --yes
#   4. Let it run for a few days, watch Firewall Observability in
#      the Vercel dashboard for real traffic patterns
#   5. Once you've confirmed the thresholds don't catch legitimate
#      visitors, tighten via the dashboard: change the Lead Form
#      rule's action from Log to Rate Limit (or Deny for repeat
#      offenders), and lower --rate-limit-requests if the real
#      legitimate rate is much lower than the generous starting
#      number below.
#
# PREREQUISITES:
#   - Vercel CLI installed and up to date: npm i -g vercel
#   - Project linked: vercel link
#   - Project is on a Pro or Enterprise plan (rate limiting rules
#     require this — see .env.example / README for plan notes)
#
# NOT COVERED BY THIS SCRIPT (dashboard-only, no CLI support found
# for these as of writing):
#   - Bot Protection managed ruleset (Firewall > Managed Rulesets)
#   - AI Bots managed ruleset (same location)
#   Turn both on in Log mode first, same rollout pattern as above,
#   before switching to Challenge mode.
# ------------------------------------------------------------------

set -euo pipefail

if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Install it first: npm i -g vercel"
  exit 1
fi

echo "Staging firewall rules for this project..."
echo "(Nothing is published yet — review with 'vercel firewall diff' after this runs.)"
echo ""

# --------------------------------------------------------------
# Rule 1: Lead form rate limit (POST /api/lead)
#
# This is the one route with real cost: a serverless function
# invocation plus an outbound call to Google Sheets on every hit.
# Starting threshold is deliberately generous (10x+ any realistic
# legitimate submission rate for a single dealership's contact form)
# per Vercel's own staged-rollout guidance — the goal right now is
# visibility, not blocking.
# --------------------------------------------------------------
vercel firewall rules add \
  --description "Lead form rate limit (staged, log-only)" \
  --condition '{"type":"path","op":"eq","value":"/api/lead"}' \
  --condition '{"type":"method","op":"eq","value":"POST"}' \
  --action log \
  --rate-limit-window 60 \
  --rate-limit-requests 20 \
  --rate-limit-keys ip \
  --rate-limit-algo fixed_window

echo "Staged: Lead form rate limit rule"

# --------------------------------------------------------------
# Rule 2: Site-wide traffic observability
#
# Matches every path. Action is log-only — this rule can NEVER
# block traffic as configured. Its only purpose is to give you
# request-volume-per-IP data across the whole site in Firewall
# Observability, so if a scraper is hammering pages other than the
# lead form, you'll actually see it before deciding whether a
# tighter rule is warranted. Threshold is intentionally high so it
# doesn't trip on normal browsing.
# --------------------------------------------------------------
vercel firewall rules add \
  --description "Site-wide traffic observability (log-only, never blocks)" \
  --condition '{"type":"path","op":"pre","value":"/"}' \
  --action log \
  --rate-limit-window 60 \
  --rate-limit-requests 300 \
  --rate-limit-keys ip \
  --rate-limit-algo fixed_window

echo "Staged: Site-wide observability rule"
echo ""
echo "Next steps:"
echo "  1. vercel firewall diff       # review what you're about to publish"
echo "  2. vercel firewall publish --yes"
echo "  3. In the Vercel dashboard, turn on the Bot Protection and AI Bots"
echo "     managed rulesets in Log mode (Firewall > Managed Rulesets)"
echo "  4. Watch Firewall Observability for a few days before tightening"
echo "     any rule's action from log to rate_limit/challenge/deny"