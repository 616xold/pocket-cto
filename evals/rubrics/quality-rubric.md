# Pocket CTO Real-LLM Eval Rubric

Score each dimension from `0` to `5`.

## Dimensions

- `constraintCompliance`: The output follows the prompt contract, preserves explicit boundaries, avoids forbidden actions, and does not invent unsafe scope.
- `clarity`: The output is easy for an operator or engineer to scan, uses the requested structure, and communicates the core idea without noise.
- `evidenceReadiness`: The output preserves verification, risk, rollback, replay, or proof expectations strongly enough that later evidence collection will stay honest.
- `actionability`: The output gives concrete next steps, files, checks, or handoff guidance instead of generic filler.

## Score guide

- `5`: Strong and decision-ready. The output is specific, compliant, and useful with no important gap.
- `4`: Good. One small gap or omission exists, but the output is still clearly usable.
- `3`: Mixed. The output is partly useful, but an operator or engineer would need to fill in visible gaps.
- `2`: Weak. The output misses major requirements, blurs scope, or leaves evidence or handoff too vague.
- `1`: Very weak. The output barely follows the task and would create confusion or unsafe follow-on work.
- `0`: Fails the task or violates core constraints.
