# CSMS Data Asset Inventory & Classification Register

**Document ID:** TNCV-CSMS-REG-DG-002  
**Version:** 0.1 — Draft template  
**Related procedure:** [Data Governance & Information Security Procedure](data-governance-information-security-procedure.md)  
**Related remediation:** RA-08 / MGT-07

> Blank working register. Do not populate it with real client personal or confidential data until the procedure, classification, legal-purpose review and storage/access controls have been approved. Store this register itself in an approved restricted location.

## 1. Data asset inventory

| Asset ID | Engagement / process | Asset / dataset description | Source / owner | Data subjects / categories | Purpose and necessity | Classification | Volume / format | System / location | Authorized roles | External recipients / supplier | Cross-border access/transfer? | Retention trigger / schedule ref. | Return / disposal method | Risk / controls | Approval / review date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DATA-[NNN] | [ID] | [Description] | [Source/owner] | [Categories] | [Purpose + necessity] | [Public/Internal/Confidential/Restricted] | [Volume] | [Approved location] | [Role IDs] | [None / details] | [No / Yes + legal approval ref.] | [Trigger/ref.] | [Method] | [Controls/risk] | [Reference] |

## 2. Data request minimization review

| Request ID | Dataset / evidence requested | Review objective | Minimum fields needed | Fields to redact/mask | Alternative (summary/sample) | Sensitive/personal data? | Necessity decision | Approved by / date |
|---|---|---|---|---|---|---|---|---|
| DREQ-[NNN] | [Dataset] | [Objective] | [Fields] | [Fields] | [Alternative] | [Yes/No + category] | [Required / reduce / reject] | [Reference] |

## 3. Data flow and party-role mapping

| Flow ID | Sender / source | Recipient | Purpose | Data categories / classification | Channel / system | Location(s) | Party role (subject to legal review) | Contract / instruction reference | Transfer approval | Date / evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| FLOW-[NNN] | [Party] | [Party] | [Purpose] | [Categories] | [Approved channel] | [Locations] | [Role] | [Reference] | [Reference] | [Record] |

## 4. Supplier / system assessment

| Supplier / system ID | Service and necessity | Data accessed / classification | Hosting and support locations | Subprocessors | Security due diligence | Contract / DPA / confidentiality | Incident terms | Retention / deletion capability | Approval / expiry | Exit plan |
|---|---|---|---|---|---|---|---|---|---|---|
| SUP-[NNN] | [Service] | [Data] | [Locations] | [Details] | [Evidence] | [Reference] | [Reference] | [Evidence] | [Approver/date] | [Plan] |

## 5. Risk and control assessment

| Risk ID | Asset / flow | Threat / scenario | Likelihood | Impact | Inherent risk | Existing verified controls | Gap / treatment | Owner | Due date | Residual risk / acceptance authority |
|---|---|---|---|---|---|---|---|---|---|---|
| DGR-[NNN] | [ID] | [Scenario] | [Method/rating] | [Method/rating] | [Rating] | [Evidence ref.] | [Action] | [Owner] | [Date] | [Rating / authority] |

Do not label a control “implemented” without configuration, test or other objective evidence. Identify assumptions and unverified supplier statements.

## 6. Access and disclosure events

Use the [Access Authorization & Review Register](access-authorization-register.md) for individual access grants, reviews and revocations. Record each material external disclosure or transfer in the data-flow table and link its approval evidence.

## 7. Retention, return and deletion log

| Disposal ID | Asset / engagement | Retention trigger reached | Legal hold checked | Approved disposition | Data / copies / backups covered | Method / system | Executed by / date | Verification / certificate | Exceptions |
|---|---|---|---|---|---|---|---|---|---|
| DISP-[NNN] | [ID] | [Date/event] | [Yes/No + ref.] | [Return/retain/delete] | [Scope] | [Method] | [Name/date] | [Evidence] | [None/details] |

## 8. Periodic review and change triggers

Review inventory entries at engagement start and close, and after:
- New purpose, data category, source, recipient, system, supplier or processing location.
- Change in applicable legal or contractual requirements.
- New cross-border access or transfer.
- Security/privacy incident or material control failure.
- Change in retention, deletion, backup or legal-hold status.
- Material change in volume, sensitivity or access population.

Record reviewer, date, changes, risk reassessment and approvals. Remove obsolete entries only under controlled record-retention rules.

## 9. Minimum approval evidence before operational use

- [ ] Management-approved classification and handling scheme.
- [ ] Legal/privacy review of purpose, necessity, party roles, notices and applicable obligations.
- [ ] Approved data request and minimization decision for each engagement.
- [ ] Approved system, storage location and transfer channel for each classification.
- [ ] Named authorized users and access records.
- [ ] Supplier due diligence and contract approval where applicable.
- [ ] Approved retention schedule, return/deletion method and legal-hold process.
- [ ] Incident contacts and response route tested or otherwise verified.
- [ ] Risk treatment and residual-risk acceptance by authorized role.
- [ ] Independent review of the completed inventory and gate evidence.

A blank register or a populated draft without verified controls is not proof of operational readiness.
