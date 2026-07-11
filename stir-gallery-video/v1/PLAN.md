# Stir Gallery Video — v1 (Dal Tadka pilot)

## Goal
2.5–3s top-down clip: spoon enters → powder dropped → stir → powder dissolves. Deliver 1080p 1:1 for stir gallery circle crop.

## Pipeline (v4)
1. Clean start → heaped tbsp enters from right → **visible circular stirring arcs** + powder dissolving → spoon slides out right
2. Seedance 2.0: start + end + spoon + mid-stir refs, 4s @ 1080p — **no trim**
3. Prompt emphasis: spoon motion readable, powder fades with each stir, spoon exits horizontally right
4. UI: play full clip, fade to `dal-tadka.png`

## Learnings from hero-video v2
- One style anchor, edit forward — never regenerate scene from scratch
- Timeline prompt for multi-beat motion
- Generate 4s, trim in post (Seedance minimum)
