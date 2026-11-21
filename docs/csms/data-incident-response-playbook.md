# CSMS Data Incident Response Playbook

**Document ID:** TNCV-CSMS-PRO-IR-004  
**Version:** 0.1 — Draft for security, privacy and legal review  
**Status:** INTERNAL WORKING PLAYBOOK — NOT APPROVED  
**Related procedure:** [Data Governance & Information Security Procedure](data-governance-information-security-procedure.md)  
**Related remediation:** RA-08 / MGT-07

> This playbook defines a proposed response workflow. It does not establish that an incident team, hotline, monitoring platform or response capability is currently operational. Contact details, notification obligations and response targets must be approved and verified before use.

## 1. Purpose and scope

Provide a controlled response to suspected or confirmed events affecting confidentiality, integrity or availability of CSMS information, including personal data, client evidence, principal documents, assessment records, credentials, reports and systems.

Examples include misdirected email/file sharing, lost devices or media, unauthorized account access, credential compromise, malware/ransomware, accidental deletion, altered evidence, public exposure, supplier incident, service outage and unauthorized disclosure.

## 2. Response principles

- Protect people and prevent further harm.
- Report promptly; do not wait for certainty or attempt to investigate alone.
- Contain safely while preserving evidence and business records.
- Involve security, privacy/legal, management and the affected engagement owner.
- Determine facts, affected data, people, systems, locations and likely consequences.
- Assess contractual, legal and regulatory notification duties with qualified legal/privacy personnel using current applicable requirements.
- Communicate only through authorized spokespeople and approved channels.
- Restore from verified clean sources and monitor for recurrence.
- Record decisions, timestamps, evidence, actions, approvals and lessons learned.

## 3. Severity and escalation

Initial severity is provisional and must be reassessed as facts emerge.

| Level | Indicative criteria | Minimum escalation |
|---|---|---|
| Critical | Active compromise, widespread exposure, restricted/highly sensitive data, privileged credential compromise, material impact to multiple clients or essential operations | Immediate security lead and management; privacy/legal; affected system owner; consider external incident support |
| High | Confirmed unauthorized access/disclosure, lost device with protected data, malware affecting engagement records, supplier incident with client data impact | Prompt security lead, privacy/legal and management; engagement owner informed |
| Moderate | Limited suspected disclosure, misdirected file caught before access, isolated integrity/availability issue with contained impact | Security responsible person and engagement owner; privacy/legal assessment where personal/confidential data may be involved |
| Low / near miss | Blocked attempt or procedural weakness with no evidence of access or impact | Record, assess and track corrective action; escalate if facts change |

Do not downgrade severity solely to avoid notification or reputational impact. Escalate uncertainty where the potential impact is material.

## 4. Immediate reporting and first response

Anyone who suspects an incident must:
1. Stop the affected activity if safe and practical.
2. Notify the designated internal incident contact immediately using the approved route; if unavailable, use the management escalation route.
3. State what happened, when detected, affected engagement/system, data types, recipients and actions already taken.
4. Preserve messages, headers, files, URLs, logs, screenshots and device details; do not delete or alter potential evidence.
5. Avoid forwarding exposed information or posting details in public channels.
6. Do not contact clients, principals, regulators, law enforcement, media or affected individuals unless directed by authorized management/legal personnel or legally required.

The incident coordinator records the initial report and acknowledges receipt.

## 5. Containment

The security lead or authorized system owner selects proportionate containment actions, which may include:
- Disable or suspend affected accounts, sessions, tokens or sharing links.
- Revoke access and rotate compromised credentials through approved processes.
- Isolate affected endpoints or systems from networks without destroying evidence.
- Stop a transfer, quarantine suspicious files or suspend a supplier connection.
- Restrict access to affected datasets and preserve audit logs.
- Pause evidence collection, assessment or report release where integrity/confidentiality is uncertain.
- Notify the relevant hosting/provider contact under approved contractual terms.

Record each action, who authorized it, timestamp, expected effect and any business impact. Do not make destructive changes before preserving available evidence unless immediate harm requires it; document the reason.

## 6. Investigation and impact assessment

The incident coordinator maintains an incident timeline and works with security and privacy/legal to determine:

- Incident start, discovery, containment and current status.
- Systems, accounts, suppliers, locations and engagements affected.
- Data categories, classification, volume, records and versions involved.
- Whether personal data or sensitive information is involved; categories of affected people where known.
- Whether data was viewed, copied, altered, deleted, encrypted, transferred or made unavailable.
- Recipient identity, access evidence, onward disclosure and recoverability.
- Likely consequences and risk to affected individuals, clients, principals and operations.
- Contractual notice clauses, applicable legal/regulatory requirements, decision-maker and deadline verified by legal counsel.
- Evidence preservation needs, investigation scope and any external support required.

Mark unknowns explicitly. Do not infer that no access occurred merely because no access log is available.

## 7. Notification and communications

Privacy/legal and authorized management determine whether, when, how and to whom notifications are required under applicable law and contract. Verify current requirements and deadlines; this playbook intentionally does not invent a universal notification period.

Maintain a decision record even when notification is not required, including facts, legal/contractual analysis, approver, rationale and reassessment trigger. Client/principal communications should state verified facts, known scope, containment, actions requested and next update timing without speculation or concealment. Use approved templates and a single authorized spokesperson.

## 8. Eradication, recovery and validation

Before restoring:
- Identify and remove the cause or disable the compromised path.
- Patch or reconfigure affected systems and verify credentials/access.
- Restore data from a verified clean backup or source where required.
- Confirm integrity and completeness of restored engagement records.
- Test security controls and monitor for recurrence.
- Obtain system-owner and security approval before reconnecting or resuming processing.
- Obtain engagement owner approval before resuming assessment or releasing affected reports.

If evidence integrity cannot be established, quarantine the affected records and assess whether the engagement must be repeated or the report withdrawn/reissued.

## 9. Closure and corrective action

Close an incident only when:
- Containment and recovery are verified.
- Impact and notification decisions are documented.
- Required communications are completed.
- Evidence and logs are preserved under legal hold/retention rules.
- Root cause and contributing factors are recorded.
- Corrective actions have owners, due dates and effectiveness checks.
- Residual risks are accepted by an authorized role.
- A post-incident review records lessons and updates to risk assessment, procedures, training, supplier controls and systems.

An incident cannot be closed solely because systems are back online.

## 10. Incident record template

| Field | Entry |
|---|---|
| Incident ID | INC-[NNN] |
| Reported by / contact | [Complete] |
| Date/time detected and timezone | [Complete] |
| Date/time suspected to have started | [Complete / unknown] |
| Engagement / client / principal | [Reference; restrict personal data] |
| System / supplier / location | [Complete] |
| Description and detection method | [Facts only] |
| Data categories / classification / estimated volume | [Complete / unknown] |
| Affected people / organizations | [Known / unknown] |
| Initial severity and rationale | [Complete] |
| Immediate containment and timestamps | [Complete] |
| Evidence preserved / location / custodian | [Complete] |
| Investigation owner and timeline | [Complete] |
| Impact and risk assessment | [Complete] |
| Legal/contract notification analysis | [Restricted reference] |
| Notification decision, approver and rationale | [Complete] |
| Recovery / validation evidence | [Complete] |
| Root cause and corrective actions | [Complete] |
| Residual risk acceptance | [Complete] |
| Closure reviewer / approval / date | [Complete] |

Use a restricted incident repository; do not place unnecessary personal data or credentials in the general register.

## 11. Roles and contact readiness

Before operational use, record and test:
- Primary and alternate incident coordinator.
- Security lead and system-owner escalation.
- Privacy/legal contact and management decision-maker.
- Client/principal contractual contact and authorized spokesperson.
- Critical supplier escalation contacts.
- Out-of-hours route and fallback if primary contacts are unavailable.

No names, telephone numbers or service-level targets are assumed by this draft.

## 12. Exercises and review

Before receiving real client evidence, conduct and document a tabletop exercise covering at least a misdirected evidence transfer, compromised account and supplier incident. Record participants, scenario, decisions, timing, communication, gaps and corrective actions. Re-test material corrective actions. Review this playbook after incidents, legal/contract changes, supplier changes and at the approved management interval.

## 13. Approval gate

Management, privacy/legal and information-security responsible roles must approve the playbook, severity/escalation model, incident contacts, response authority, evidence preservation, communication templates, legal assessment process and exercise schedule. Until then this is a draft only; it is not an operational incident-response service.
