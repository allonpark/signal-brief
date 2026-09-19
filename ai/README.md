# Quality-First AI Orchestrator

This repository uses a **quality-first** model-routing policy. Token and cost reduction are secondary objectives and may never remove critical engineering evidence.

## Core rule

Use the minimum model tier that satisfies the required answer quality — not the cheapest model first.

For semiconductor reliability and physics work, automatically escalate to a frontier reasoning tier when the task includes competing mechanisms, coupled physics, novel failure hypotheses, cross-paper synthesis, DOE design, physical-model derivation, or a high-consequence engineering decision.

## Evidence preservation

Never compress away numbers, units, equations, bias conditions, temperatures, durations, geometry, materials, process conditions, negation, tables, figure captions, measurement conditions, or citation links.

Prefer:

1. document/section selection,
2. protected-span construction,
3. optional safe compression,
4. strong reasoning,
5. deterministic numerical verification,
6. independent physics critic.

## Quality gates

Every complex-physics answer should pass:

1. Input integrity
2. Physics consistency
3. Competing-mechanism check
4. Numerical/unit verification
5. Evidence consistency
6. Boundary/sensitivity check

If evidence does not discriminate mechanisms, the valid output is **insufficient evidence**, followed by the experiment or measurement needed to separate the hypotheses.

## New-model policy

A newly released model is never promoted automatically. It enters shadow evaluation against the Physics Golden Set. Promotion is task-specific and requires no critical-domain regression, preserved numerical/condition fidelity, and acceptable calibration. Cost and latency are evaluated only after quality gates pass.

See:
- `ai/routing_policy.yaml`
- `ai/model_registry.yaml`
- `ai/physics_golden_set.yaml`
