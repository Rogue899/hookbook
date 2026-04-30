---
date: "2026-04-29"
title: "Trust label system finalized"
type: site-update
related_recipes: []
---

Locked the four-tier trust system: 🟢 tested, 🟡 experimental, 🔵 from-source, ⚠️ theoretical. Every recipe carries exactly one label. CI requires `trust: experimental` on incoming PRs; the maintainer promotes to `tested` only after personal verification.

The methodology page documents the full rationale.
