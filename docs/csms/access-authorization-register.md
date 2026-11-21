# CSMS Access Authorization & Review Register

**Document ID:** TNCV-CSMS-REG-SEC-003  
**Version:** 0.1 — Draft template  
**Related procedure:** [Data Governance & Information Security Procedure](data-governance-information-security-procedure.md)  
**Related remediation:** RA-08 / MGT-07

> Blank template. Populate only in an approved system with restricted access. Never record passwords, recovery codes, secret keys or access tokens in this register.

## 1. Access request and approval

| Request ID | Person / unique account | Employer / supplier | Engagement / purpose | System / dataset | Classification | Role / permissions | Start / expiry | Approver / date | MFA / security conditions | Confidentiality / training ref. | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ACC-[NNN] | [Name/account ID] | [Organization] | [Purpose] | [System/asset ID] | [Level] | [Read/write/admin] | [Dates] | [Reference] | [Verified condition] | [Reference] | [Pending/Active/Denied] |

## 2. Periodic and event-driven access review

| Review ID | Account / person | System / engagement | Current access | Still required? | Least-privilege change | Conflict / role change checked | Reviewer / date | Approval / action ticket | Completion evidence |
|---|---|---|---|---|---|---|---|---|---|
| ACR-[NNN] | [Account] | [System] | [Permissions] | [Yes/No] | [Retain/reduce/remove] | [Details] | [Reference] | [Reference] | [Reference] |

Review at engagement start and close, role/employment change, supplier termination, suspected compromise and at the interval formally approved by management.

## 3. Access revocation and credential response

| Revocation ID | Person / account | Trigger | Systems / data | Requested by / date | Revoked by / date | Sessions/tokens/devices addressed | Confirmation evidence | Residual copies / actions |
|---|---|---|---|---|---|---|---|---|
| REV-[NNN] | [Account] | [Close/role change/incident] | [List] | [Reference] | [Reference] | [Details] | [Ticket/log] | [Details] |

Revoke access promptly when the business need ends. For suspected compromise, follow incident response and invalidate credentials/sessions using the approved security process. Record delays and compensating controls.

## 4. External sharing and transfer log

| Transfer ID | Engagement / asset | Sender | Recipient / organization | Purpose / authority | Classification / minimum data | Approved channel | Access expiry / restrictions | Approver | Sent / received date | Confirmation / evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| XFER-[NNN] | [ID] | [Name] | [Recipient] | [Reference] | [Details] | [Approved channel] | [Details] | [Reference] | [Date] | [Reference] |

Verify recipient identity and authorization through a trusted route. Do not use public links, personal email or unapproved messaging/storage. Record failed, misdirected or suspicious transfers as incidents.

## 5. Privileged access and exceptions

| Exception ID | Person / account | Elevated permission | Business need | Risk / compensating controls | Start / expiry | Approver | Monitoring / review evidence | Closure |
|---|---|---|---|---|---|---|---|---|
| PAX-[NNN] | [Account] | [Permission] | [Reason] | [Controls] | [Dates] | [Reference] | [Reference] | [Reference] |

Exceptions must be time-bound, approved by an authorized role and reviewed. Shared accounts and permanent elevated access are not default options. Any technical exception must preserve accountability and traceability.

## 6. Minimum control verification checklist

- [ ] Unique named accounts; no routine shared credentials.
- [ ] Access granted only after engagement appointment and confidentiality requirements.
- [ ] Permissions match role and data classification.
- [ ] MFA and authentication settings verified where supported.
- [ ] External users and suppliers are time-limited and scoped.
- [ ] Access logs are enabled and protected where supported.
- [ ] Periodic and event-driven access reviews completed.
- [ ] Role changes and engagement closure trigger access review/revocation.
- [ ] Revocation evidence includes active sessions/tokens where applicable.
- [ ] External transfers have recipient verification, purpose, approval and receipt evidence.
- [ ] No secrets are stored in this register or sent with protected data.
- [ ] Exceptions have an owner, expiry, compensating controls and approval.

A checklist tick must link to actual configuration, system log, ticket or approval evidence. A planned control is not an implemented control.
