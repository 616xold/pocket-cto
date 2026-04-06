---
name: evidence-bundle-auditor
description: Use when a feature creates or modifies finance missions, approvals, artifacts, summaries, replay, reports, answers, or proof bundles. Checks that outputs include answer or report summary, sources, freshness posture, assumptions, conflicts, reviewer trace, and limitations.
---

# Evidence Bundle Auditor

Pocket CFO wins on trust, not on finance-themed chat polish.
Any mission-facing feature must produce reviewable decision evidence.

## Trigger when

Use this skill when the task touches:

- mission completion flows
- proof bundle creation
- replay event capture
- approval cards
- discovery answers
- memo, packet, or report outputs
- artifact manifests
- reviewer or operator-facing evidence

Do not use this skill when the change is only about:

- package manager setup
- CSS-only changes
- isolated internal refactors with no operator-visible evidence impact

## Required checks

1. The mission objective is preserved in the output.
2. The answer or report summary is explicit.
3. Evidence sources are listed or linkable.
4. Freshness posture is visible.
5. Assumptions are stated plainly.
6. Conflicting evidence or gaps are surfaced when relevant.
7. Reviewer or approval trace exists when the action changes external communication posture.
8. Replay events are sufficient to reconstruct the behavior.
9. Artifact metadata includes source linkage, timestamps, and task linkage when relevant.
10. Limitations are visible rather than buried.

## Finance-specific artifact expectations

Pocket CFO proof should usually answer these questions:

- What question or reporting goal was addressed?
- Which sources were used?
- How fresh or stale was the evidence?
- What assumptions shaped the result?
- What remains unresolved?
- Who reviewed or approved it?
- Could another operator reproduce the result later?

## Output expectation

If a feature is incomplete, add a clearly marked placeholder that keeps the evidence contract visible instead of silently omitting it.

## Final audit questions

- Could a human approve or reject this answer or report from the produced evidence?
- Could another operator understand the result without rereading the whole chat?
- Could this mission be replayed later for evaluation, audit, or a board packet refresh?
