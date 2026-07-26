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

# 4. ERROR: raw <img> bypasses the Next image optimizer (§15.2). All
#    violations were converted in July 2026; new ones are regressions.
#    Satori og:image JSX (components/og/, opengraph-image.tsx) legitimately
#    uses <img>; it never reaches the DOM.
rule "Raw <img> tags (§15.2: use next/image with sizes)"
IMG_HITS=$(grep -rn "<img" app components --include='*.tsx' 2>/dev/null \
  | grep -vE 'components/og/|opengraph-image' || true)
if [ -n "$IMG_HITS" ]; then
  say "ERROR: raw <img>:"
  say "$IMG_HITS"
  errors=$((errors + 1))
else
  say "ok"
fi

# 4b. WARNING: <Image> without a sizes attribute (§15.2). Without sizes, a
#     fixed-width image makes 2x-DPR phones fetch transforms at double the
#     width prop (the nav elephants shipped ~2000px wide for a 32px slot
#     before this was caught). Flags fill images and width >= 200.
rule "next/image missing sizes (§15.2: accurate sizes on every big Image)"
SIZES_HITS=$(perl -0777 -ne '
  while (m{<Image\b([^>]*?)/>}gs) {
    my $props = $1;
    next if $props =~ /\bsizes=/;
    my $big = ($props =~ /\bfill\b/) || ($props =~ /\bwidth=\{(\d+)\}/ && $1 >= 200);
    next unless $big;
    my $line = 1 + (substr($_, 0, pos()) =~ tr/\n//);
    print "$ARGV:$line: <Image> without sizes\n";
  }
' $(git ls-files 'app/**/*.tsx' 'app/*.tsx' 'components/**/*.tsx' 'components/*.tsx' | grep -vE 'components/og/|opengraph-image') 2>/dev/null || true)
if [ -n "$SIZES_HITS" ]; then
  say "WARNING: missing sizes:"
  say "$SIZES_HITS"
  warnings=$((warnings + 1))
else
  say "ok"
fi

# 4c. WARNING: eager video loading (§15.3). preload="auto" is reserved for
#     the hero curtain in heldi-homepage.tsx; everything else mounts on
#     demand with preload="none" and a poster. pdp-review-teasers.tsx is
#     allowed preload="metadata" because its video mounts inside a
#     click-to-open popup, never on page load.
rule "Eager video preload (§15.3: only the hero curtain may preload)"
PRELOAD_HITS=$(grep -rn 'preload="auto"\|preload="metadata"' app components --include='*.tsx' 2>/dev/null \
  | grep -vE 'components/heldi-homepage.tsx|components/shop/pdp-review-teasers.tsx' || true)
if [ -n "$PRELOAD_HITS" ]; then
  say "WARNING: eager video preload:"
  say "$PRELOAD_HITS"
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

# Shared asset-reference index for checks 6 and 7.
#
# Every /images or /videos path written in app/ or components/, resolved to the
# file it actually loads. imageSrc() in heldi-homepage.tsx rewrites
# "/images/foo.webp" to the ink-blue variant directory, so a literal that looks
# absent is usually being redirected; resolve that before reporting anything.
VARIANT_BASE="public/images/variants/ink-blue"

resolve_asset() {
  ref="$1"
  if [ -f "public$ref" ]; then
    printf '%s\n' "public$ref"
    return 0
  fi
  case "$ref" in
    /images/*)
      variant="$VARIANT_BASE/${ref#/images/}"
      if [ -f "$variant" ]; then
        printf '%s\n' "$variant"
        return 0
      fi
      ;;
  esac
  return 1
}

ASSET_REFS=$(grep -rhoE '"/(images|videos)/[A-Za-z0-9._/-]+\.(webp|png|jpg|jpeg|avif|gif|mp4|webm|mov)"' \
  app components --include='*.tsx' --include='*.ts' 2>/dev/null \
  | tr -d '"' | sort -u || true)

REFERENCED_FILES=$(while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  resolve_asset "$ref" || true
done < <(printf '%s\n' "$ASSET_REFS") | sort -u)

# 6. WARNING: assets over budget (§15.1: images ≤ 400KB, videos ≤ 8MB).
#    Checks everything git tracks (all of which deploys) plus any untracked
#    file that code actually references. Using git ls-files alone used to let an
#    untracked monster pass silently, which is how a 29MB hero video and a
#    5.7MB poster were both reported "ok". Untracked master art that nothing
#    references is deliberately ignored: it never ships, so it is not a budget
#    problem, and listing it buries the findings that matter.
rule "Asset budgets (§15.1)"
OVER=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    *.DS_Store|*.md) continue ;;
  esac
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
  case "$f" in
    public/videos/*) limit=$((8 * 1024 * 1024)) ;;
    *) limit=$((400 * 1024)) ;;
  esac
  if [ "$size" -gt "$limit" ]; then
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      note="deployed"
    else
      note="untracked but referenced in code"
    fi
    printf 'WARNING: %6.1fMB  %s  (%s)\n' \
      "$(echo "$size / 1048576" | bc -l)" "$f" "$note"
    OVER=$((OVER + 1))
  fi
done < <( { git ls-files public/images public/videos; printf '%s\n' "$REFERENCED_FILES"; } | sort -u)
if [ "$OVER" -gt 0 ]; then
  warnings=$((warnings + 1))
else
  say "ok"
fi

# 7. WARNING: an asset path in code that will 404 in production.
#    Vercel deploys from git, so a component pointing at a gitignored file
#    ships a broken image or video with no clue why. This is what the video
#    hero does today: heroLayout="video" is a selectable layout whose film and
#    poster are both excluded from the repo.
rule "Referenced assets missing from the repo (§15)"
MISSING=0
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  if ! resolved=$(resolve_asset "$ref"); then
    printf 'WARNING: referenced but absent:    %s\n' "$ref"
    MISSING=$((MISSING + 1))
  elif ! git ls-files --error-unmatch "$resolved" >/dev/null 2>&1; then
    printf 'WARNING: referenced but untracked: %s  (will 404 in production)\n' "$ref"
    MISSING=$((MISSING + 1))
  fi
done < <(printf '%s\n' "$ASSET_REFS")
if [ "$MISSING" -gt 0 ]; then
  warnings=$((warnings + 1))
else
  say "ok"
fi

printf '\nbrand-lint: %d error group(s), %d warning group(s)\n' "$errors" "$warnings"
[ "$errors" -eq 0 ] || exit 1
