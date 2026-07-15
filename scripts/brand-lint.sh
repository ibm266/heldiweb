#!/usr/bin/env bash
# brand-lint: fast greppable checks for the rules in BRAND.md (§5 copy, §8
# visuals, §15 assets). Run via `npm run brand-lint`. Exits non-zero only on
# ERROR-level findings; warnings are printed for judgement calls.
#
# Scope: copy surfaces are app/, components/, content/, lib/. Docs, legal
# markdown and the gitignored workspaces are not linted.

set -u
cd "$(dirname "$0")/.."

errors=0
warnings=0

say() { printf '%s\n' "$*"; }
rule() { printf '\n== %s ==\n' "$*"; }

INCLUDES=(--include='*.tsx' --include='*.ts' --include='*.html' --include='*.json')
COPY_DIRS=(app components content lib)

# 1. Em dashes in copy (BRAND.md §5). Allowed: code comments, the "—" table
#    placeholder, the founder signature, and label separators listed below.
rule "Em dashes in copy (§5: restructure the sentence instead)"
EMDASH_HITS=$(grep -rn "—" "${COPY_DIRS[@]}" "${INCLUDES[@]}" 2>/dev/null \
  | grep -vE ':[0-9]+:[[:space:]]*(//|\*|/\*)' \
  | grep -vE '"—"' \
  | grep -vE 'Mihir, founder|Add to basket —|— tap to switch' || true)
MDASH_HITS=$(grep -rn "&mdash;" "${COPY_DIRS[@]}" "${INCLUDES[@]}" 2>/dev/null \
  | grep -vE '&mdash; Mihir' || true)
if [ -n "$EMDASH_HITS$MDASH_HITS" ]; then
  say "ERROR: em dash in copy:"
  [ -n "$EMDASH_HITS" ] && say "$EMDASH_HITS"
  [ -n "$MDASH_HITS" ] && say "$MDASH_HITS"
  errors=$((errors + 1))
else
  say "ok"
fi

# 2. Banned vocabulary (§5): "scoop" in any form.
rule "Banned vocabulary (§5: stir/spoonful, never scoop)"
SCOOP_HITS=$(grep -rniE '(^|[^a-z])scoop' "${COPY_DIRS[@]}" "${INCLUDES[@]}" 2>/dev/null || true)
if [ -n "$SCOOP_HITS" ]; then
  say "ERROR: banned word:"
  say "$SCOOP_HITS"
  errors=$((errors + 1))
else
  say "ok"
fi

# 3. Literal black (§8.1: anything black must be ink #011246; the only
#    sanctioned blacks are low-alpha rgb() shadows, which this pattern skips).
rule "Literal #000 hex (§8.1: use ink, not black)"
BLACK_HITS=$(grep -rnE '#000([^0-9a-fA-F]|$)' app components --include='*.css' --include='*.tsx' 2>/dev/null || true)
if [ -n "$BLACK_HITS" ]; then
  say "ERROR: literal black:"
  say "$BLACK_HITS"
  errors=$((errors + 1))
else
  say "ok"
fi

# 4. WARNING: raw <img> bypasses the Next image optimizer (§15.2). Known
#    violations live in buy-box.tsx and cart-drawer.tsx until they are fixed.
#    Satori og:image JSX (components/og/, opengraph-image.tsx) legitimately
#    uses <img>; it never reaches the DOM.
rule "Raw <img> tags (§15.2: use next/image with sizes)"
IMG_HITS=$(grep -rn "<img" app components --include='*.tsx' 2>/dev/null \
  | grep -vE 'components/og/|opengraph-image' || true)
if [ -n "$IMG_HITS" ]; then
  say "WARNING: raw <img>:"
  say "$IMG_HITS"
  warnings=$((warnings + 1))
else
  say "ok"
fi

# 5. WARNING: hard-coded £ amounts outside lib/pricing.ts (§10). The delivery
#    FAQ answer in site-faqs.ts is a known legacy case (§11.3).
rule "Hard-coded £ amounts (§10: prices come from lib/pricing.ts)"
GBP_HITS=$(grep -rn "£[0-9]" app components lib --include='*.tsx' --include='*.ts' 2>/dev/null \
  | grep -v 'lib/pricing.ts' || true)
if [ -n "$GBP_HITS" ]; then
  say "WARNING: literal price:"
  say "$GBP_HITS"
  warnings=$((warnings + 1))
else
  say "ok"
fi

# 6. WARNING: tracked assets over budget (§15.1: images ≤ 400KB, videos ≤ 8MB;
#    the hero curtain is temporarily allowed until recompressed).
rule "Asset budgets (§15.1)"
OVER=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
  case "$f" in
    public/videos/*) limit=$((8 * 1024 * 1024)) ;;
    *) limit=$((400 * 1024)) ;;
  esac
  if [ "$size" -gt "$limit" ]; then
    printf 'WARNING: %6.1fMB  %s\n' "$(echo "$size / 1048576" | bc -l)" "$f"
    OVER=$((OVER + 1))
  fi
done < <(git ls-files public/images public/videos)
if [ "$OVER" -gt 0 ]; then
  warnings=$((warnings + 1))
else
  say "ok"
fi

printf '\nbrand-lint: %d error group(s), %d warning group(s)\n' "$errors" "$warnings"
[ "$errors" -eq 0 ] || exit 1
