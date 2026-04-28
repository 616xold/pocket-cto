# F6F Monitor Demo Stack Fixture

This fixture is the first checked-in Pocket CFO demo stack for F6F.
It bootstraps one deterministic company key, `demo-monitor-stack`, from static raw source files and then runs only the shipped monitor families:

- `cash_posture`
- `collections_pressure`
- `payables_pressure`
- `policy_covenant_threshold`

The replay command must treat these files as immutable raw inputs.
It may register sources, upload source files, sync Finance Twin state, bind the policy document, compile the CFO Wiki, and compare normalized monitor output, but it must not rewrite the files in this directory.

## Source Files

- `sources/bank-cash.csv` is a bank-account-summary CSV with source-backed cash coverage and an intentional missing as-of date. It should produce a `cash_posture` alert from stored data-quality posture and enable the shipped cash alert-to-investigation handoff.
- `sources/receivables-aging.csv` is a receivables-aging CSV with 80 percent past due. It should produce a `collections_pressure` alert and enable the shipped F6G collections alert-to-investigation handoff.
- `sources/payables-aging.csv` is a payables-aging CSV with 80 percent past due. It should produce a `payables_pressure` alert without creating an investigation.
- `sources/policy-thresholds.md` is a policy document with one exact F6E threshold line. It should produce a `policy_covenant_threshold` alert by comparing the stored policy threshold to the stored collections posture without creating an investigation.

## Expected Output

`expected-monitor-results.json` records the normalized expected monitor posture.
Generated ids, raw source ids, snapshot ids, sync run ids, mission ids, and timestamps are intentionally excluded from the expected comparison.

The expected handoff boundary is cash plus collections after shipped F6G:

- one persisted alerting `cash_posture` monitor result can create or open one taskless investigation mission
- one persisted alerting `collections_pressure` monitor result can create or open one taskless investigation mission
- retrying that create/open call returns the same mission
- `payables_pressure` and `policy_covenant_threshold` monitor results must not create investigations

The fixture remains runtime-Codex-free, delivery-free, report-free, approval-free, payment-free, legal-advice-free, policy-advice-free, collection-instruction-free, customer-contact-instruction-free, and non-autonomous.
