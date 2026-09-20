# Domain adapter: financial reporting

Applies when the deliverable is an analysis or opinion of financial statements: whether reported revenue, expenses, or balances are correct, how a transaction should be recognized or disclosed, reading a set of statements (income statement, balance sheet, cash flow, notes) against a reporting framework, or checking statements for red flags. The loop is unchanged; these definitions replace the coding defaults. The finance adapter keeps money decisions (costs, loans, ROI); data analysis keeps generic datasets; this adapter takes over when the deliverable is a judgment about statements governed by an accounting framework (IFRS, IFRS for SMEs, US GAAP, local GAAP).

## Workflow (steps + flowchart)

1. Open the actual statements and notes — never a summary of them — and name the entity, period, and framework under which they were prepared.
2. Name the governing framework and its current effective version (IFRS 18 replaces IAS 1 from 2027; IFRS for SMEs 3rd edition effective 2027; US GAAP; local GAAP). Confirm the standard you cite is in force now.
3. Recompute the load-bearing arithmetic from the statements themselves: totals reconcile (assets = liabilities + equity), cash flow ties to cash, ratios and allocations (e.g., IFRS 15 transaction-price allocation) shown step by step.
4. Check recognition and measurement against the standard — especially revenue timing (IFRS 15 five steps): is each performance obligation actually satisfied, or is revenue being pulled forward?
5. Read the notes and the auditor's report for red flags: related-party disclosures (IAS 24), going-concern matters (ISA 570), significant estimates, off-balance-sheet items.
6. State the boundary plainly: this is analysis of the statements, not an audit opinion and not investment advice.
7. Report outcome-first, every figure line-cited to a statement or note; list what could not be verified.

## Minimum evidence set (binding, before any conclusion)

1. **The actual financial statements**: the statements and notes themselves, opened in the relevant part — never a summary or a press release. If they do not exist, say so and state what you are analyzing instead.
2. **The governing framework and its version**: which standard applies (IFRS, IFRS for SMEs, US GAAP, local GAAP) and that the version cited is the one in force for the period. IAS 1 vs IFRS 18 is a real, current distinction.
3. **One live external reference**: the standard's current text or a standard-setter/regulator page (IFRS.org, FASB, SEC EDGAR, PCAOB, IAASB), fetched now, not recalled.

## Evidence and primary sources

The statements, notes, and auditor's report are the primary sources; management's own presentation (a memo, press release, or "adjusted" EBITDA) is a claim about them. The sector's signature non-evidence: an adjusted or non-GAAP metric presented without a reconciliation to the reported statements, and any figure the agent did not open.

## Authority order

Explicit user instruction > the governing accounting framework (current effective version) > the actual statements and notes > the auditor's opinion > management's presentation > your memory. When management's presentation and the underlying transactions or the standard disagree, the standard wins, and the disagreement is the finding.

## Verification by observation

- Every figure in the analysis traces to a line in the statements or notes, cited by statement and note number; the reader can find it.
- Arithmetic is recomputed and shown: totals reconcile, ratios use the actual lines, allocations (e.g., IFRS 15 transaction-price allocation) are demonstrated, not asserted.
- Framework claims name the standard and its effective version, verified current (IFRS 18 vs IAS 1; ISA 570 (Revised 2024) for periods beginning on or after 15 Dec 2026).
- Revenue timing is checked against the recognition criteria, not echoed from management: a performance obligation not yet satisfied is flagged as premature recognition.
- The report states plainly that it is statement analysis, not an audit opinion and not investment advice, and names the point at which a licensed professional is needed. This boundary is a feature, not a buried disclaimer.

## Fraud table (for fable-judge)

| Fraud | Symptom |
|---|---|
| Premature revenue recognition | revenue booked before the performance obligation is satisfied (IFRS 15 step 5), often "recognized on contract signing" |
| Fabricated figures | numbers, ratios, or balances not present in the opened statements |
| Management echo | repeating management's adjusted/non-GAAP metrics or press-release claims as fact without reconciliation |
| Framework blur | applying the wrong or superseded standard (IAS 1 where IFRS 18 governs; an old IFRS for SMEs edition) without flagging |
| Related-party concealment | transactions with related parties present but IAS 24 disclosures ignored in the analysis |
| Stale standards | a standard or effective date cited from memory, not verified current |
| Audit-opinion costume | definitive conclusions about compliance where only a licensed auditor can opine |

## Done, by example

"The revenue analysis is done" means: every figure line-cited to a statement or note, recognition checked against the governing standard with the allocation shown, the framework and its version named and verified current, and the boundary stated. Not: "the statements look healthy."

## Sources

- IFRS 15, Revenue from Contracts with Customers (five-step model; effective for periods beginning on or after 1 Jan 2018): https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/ (accessed 2026-08-15)
- IFRS 18, Presentation and Disclosure in Financial Statements (replaces IAS 1; effective for periods beginning on or after 1 Jan 2027): https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/ (accessed 2026-08-15)
- IAS 1, Presentation of Financial Statements (complete set of statements, going concern): https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/ (accessed 2026-08-15)
- IAS 7, Statement of Cash Flows: https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/ (accessed 2026-08-15)
- IAS 8, Accounting Policies, Changes in Estimates and Errors (policy hierarchy; 2021 amendment effective 1 Jan 2023): https://www.iasplus.com/en/standards/ias/ias8 (accessed 2026-08-15)
- IAS 24, Related Party Disclosures: https://www.ifrs.org/issued-standards/list-of-standards/ias-24-related-party-disclosures/ (accessed 2026-08-15)
- IFRS for SMEs Accounting Standard, 3rd edition (issued Feb 2025; effective for periods beginning on or after 1 Jan 2027): https://www.ifrs.org/issued-standards/ifrs-for-smes/ (accessed 2026-08-15); KPMG summary: https://kpmg.com/xx/en/our-insights/ifrg/2024/ifrs-sme.html (accessed 2026-08-15)
- Conceptual Framework for Financial Reporting: https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/ (accessed 2026-08-15)
- ISA 570 (Revised 2024), Going Concern (effective for audits of periods beginning on or after 15 Dec 2026): https://www.iaasb.org/publications/isa-570-revised-2024-going-concern (accessed 2026-08-15)
- ISA 240 (Revised), The Auditor's Responsibilities Relating to Fraud in an Audit of Financial Statements: https://www.iaasb.org/publications/isa-240-revised-auditor-s-responsibilities-relating-fraud-audit-financial-statements (accessed 2026-08-15)
- PCAOB AS 2401, Consideration of Fraud in a Financial Statement Audit: https://pcaobus.org/oversight/standards/auditing-standards/details/AS2401 (accessed 2026-08-15)
- ACFE, Occupational Fraud 2024: A Report to the Nations (organizations lose about 5% of revenue to fraud each year; financial statement misstatement carries the highest median loss, $766,000): https://www.acfe.com/fraud-resources/report-to-the-nations-archive (accessed 2026-08-15)
- CFO Dive, "Improper timing of revenue recognition ... SEC whistleblower actions" (about 60% of SEC whistleblower fraud actions involve improper revenue recognition timing): https://www.cfodive.com/news/improper-revenue-recognition-sec-fraud-cases/583889/ (accessed 2026-08-15)
