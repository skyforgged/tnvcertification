# CSMS Data Governance & Information Security Procedure

**Document ID:** TNCV-CSMS-PRO-DG-001  
**Version:** 0.1 — Draft for management, legal and security review  
**Status:** INTERNAL WORKING PROCEDURE — NOT APPROVED FOR OPERATIONAL USE  
**Related remediation:** RA-08 / Management decision MGT-07  
**Owner:** [Management to appoint]  
**Approval authority:** [Management to appoint]

> This procedure defines proposed controls for information handled by the CSMS Readiness Review & Documentation Support service. It is not evidence that systems, safeguards, contracts, personnel or legal assessments are already in place. Do not receive real client evidence until the required privacy, security, access, storage, transfer and retention arrangements have been approved and verified.

## 1. Purpose and scope

Protect client, contractor, principal and personnel information throughout its lifecycle: enquiry, contract review, collection, receipt, classification, access, use, analysis, storage, transfer, reporting, retention, return, deletion and incident response.

Applies to information in paper, email, messaging, portals, cloud services, endpoints, removable media, backups, exports, screenshots, meeting notes and printed reports, including:
- Personal data and personnel records.
- Health, safety, incident, disciplinary, identity and training records.
- Site, operational, asset, security and business-continuity information.
- Commercial, contractual and financial information.
- Principal criteria, confidential tender documents and portal extracts.
- Assessment evidence, working papers, findings, technical reviews and reports.
- Credentials, access tokens, keys and system/security configuration information.

This procedure supplements, but does not replace, applicable law, the company's enterprise security policies, contractual obligations or instructions from a principal/client.

## 2. Governance principles

1. **Purpose limitation:** collect and use information only for a defined, documented engagement purpose and agreed deliverable.
2. **Data minimization:** request the least information necessary; prefer redacted, masked, aggregated or sampled evidence where it can meet the review objective.
3. **Need-to-know:** access is limited to named, authorized people with a current task requirement.
4. **Accountability:** identify who decides the purpose and means of processing, who operates systems, and who handles information for another party; record the roles and instructions in contract review after legal assessment.
5. **Confidentiality and integrity:** prevent unauthorized disclosure, alteration, loss or destruction.
6. **Availability and resilience:** protect records against accidental loss and test recovery where approved systems support it.
7. **Transparency and rights:** provide accurate notices and route data-subject requests through the designated privacy/legal contact.
8. **Retention limitation:** retain only for approved legal, contractual and business purposes; delete or return securely when the approved trigger is met.
9. **No unsupported claims:** do not describe the service as certified, compliant, encrypted, secure, backed up or independently audited unless evidence supports the exact claim.

## 3. Roles and accountability

| Role | Minimum responsibility |
|---|---|
| Management / accountable service owner | Approve risk appetite, resources, policy, exceptions and MGT-07 decision; ensure stop-work authority |
| Privacy / legal responsible person | Review purpose, legal basis, notices, party roles, contracts, data-subject requests, disclosure and breach-notification duties |
| Information-security responsible person | Define security baseline, approve systems/channels, assess risks, monitor controls and coordinate incidents |
| Engagement owner | Define purpose, scope, data request, recipients, permitted use and client instructions |
| Document / data custodian | Maintain inventory, classification, access records, transfer log, retention and disposal evidence |
| Authorized user | Use information only for assigned purpose; protect credentials; report suspected incidents immediately |
| External processor / supplier | Operate only under documented due diligence, contract, instructions, access limits and incident obligations |

One person may hold multiple roles only where competence, authority and conflict controls are documented. A role title alone is not an appointment or proof of competence.

## 4. Pre-engagement data protection gate

Before requesting or receiving client evidence, the engagement owner and privacy/security responsible persons must record:

- Client legal entity, principal/project and engagement ID.
- Specific purpose, scope, deliverable, recipients and proposed processing activities.
- Data categories, data subjects, approximate volume, sensitivity and source.
- Whether personal, sensitive, regulated, confidential or third-party information is expected.
- Necessity of each requested data category and possible redaction/minimization.
- Applicable legal and contractual requirements, assessed by the responsible legal/privacy role; do not assume a lawful basis or rely on consent by default.
- Roles of each party (controller/processor or equivalent under applicable rules), documented instructions and responsibilities, subject to legal review.
- Notice, confidentiality, data-subject request, correction, access, retention, return and deletion arrangements.
- Approved systems, storage locations, transfer channels, access roles, external suppliers and any cross-border access/transfer.
- Risk assessment and required safeguards, owners and verification evidence.
- Incident contacts, escalation path and any client/principal notification clauses.
- Management/authorized engagement approval and evidence references.

**STOP:** no real evidence may be received if purpose/authority, required notice/contract, approved channel, access control, storage location, retention/return terms or responsible owner is unresolved. Do not use personal email, personal cloud drives, public file links, consumer messaging accounts or unapproved removable media for client evidence.

## 5. Data inventory and classification

Create an inventory entry for each material information asset or defined dataset using [Data Asset Inventory & Classification Register](data-asset-inventory-register.md). Assign an owner, purpose, source, data subjects/categories, sensitivity, location, users, suppliers, retention trigger, disposal method and approved controls.

Use the following proposed classification pending formal adoption of the company's classification scheme:

| Level | Description | Examples | Minimum handling |
|---|---|---|---|
| Public | Approved for unrestricted public release | Published service description | Verify approval and remove hidden metadata where appropriate |
| Internal | Non-public business information with limited impact | Internal procedures and routine planning | Authorized workforce access; controlled sharing |
| Confidential | Client/principal or business information whose disclosure could cause material harm | CSMS evidence, contracts, reports, personnel/training records | Named need-to-know access; approved storage and transfer; access logging where supported |
| Restricted | Highly sensitive personal, safety, security or credential information | Identity documents, health data, incident details, passwords, access tokens, sensitive site/security plans | Avoid collection where possible; segregated restricted access; enhanced approval and handling; no routine email attachment or uncontrolled local copy |

Classification is a proposed working model, not an approved enterprise classification. Management must align or replace it before use. If a dataset contains mixed categories, apply the highest applicable level or segregate it safely.

## 6. Collection and secure receipt

- Use a documented request list tied to the engagement purpose and evidence IDs.
- Explain acceptable formats, transfer method, naming convention, redaction options and prohibited content.
- Verify the sender and recipient before granting access or accepting a transfer.
- Use only a management/security-approved channel with appropriate authentication and access expiry.
- Record sender, recipient, date/time, channel, dataset, version, classification and transfer reference.
- Scan files using approved security tooling before opening where available; isolate suspicious files and escalate rather than bypassing controls.
- Do not request passwords in the same channel as protected files; use an approved credential exchange method.
- Record incomplete, unexpected or excessive data and arrange secure return/deletion where not required.
- Preserve original received content and provenance; conduct analysis on controlled working copies.

## 7. Access management

Access must be individually attributable and based on least privilege:

1. Use unique user accounts; shared accounts are prohibited except formally approved technical exceptions with compensating traceability.
2. Require strong authentication and multi-factor authentication where supported and approved.
3. Grant access only after named appointment, confidentiality commitment and task authorization.
4. Separate administration from ordinary user activity where practicable.
5. Review access at engagement start, role change, periodic intervals set by management, engagement close and termination.
6. Revoke access promptly when no longer required; record approver, date, systems and confirmation.
7. Prohibit credential sharing, unattended unlocked devices and copying to unauthorized locations.
8. Log access, download, change, sharing and deletion events where the system supports it; protect logs from unauthorized alteration.
9. Restrict privileged access and review administrative activity.
10. Record exceptions, risk acceptance, compensating controls, owner and expiry; no exception may override legal requirements or a hard-stop risk.

See the [Access Authorization & Review Register](access-authorization-register.md).

## 8. Storage, endpoint and technical safeguards

Only systems explicitly approved for the relevant classification may store or process client evidence. Before approval, assess:
- Supplier identity, service location, hosting/subprocessor chain and contractual commitments.
- Authentication, authorization, encryption capabilities, key ownership/management and secure configuration.
- Backup, recovery, availability, deletion, export and audit-log capabilities.
- Vulnerability/patch management, malware protection, endpoint security and administrative access.
- Data segregation, sharing controls, retention controls and incident notification.
- Contract termination, data return, deletion certification and exit arrangements.

Minimum proposed controls, subject to security approval and capability verification:
- Encryption in transit and at rest for confidential/restricted data where supported.
- MFA for accounts accessing client evidence.
- Managed and supported devices, screen lock, timely security updates and malware protection.
- Secure configuration, least privilege and no unnecessary local copies.
- Controlled backup and periodic restoration testing for records requiring recovery.
- Restricted removable media and controlled printing.
- Secure disposal of paper, media and devices.
- No use of production client data in development, demos, public AI tools or unrelated training without explicit documented authority and approved safeguards.

Do not claim a control is active until configuration or test evidence has been checked.

## 9. Use, analysis, disclosure and transfer

- Use data only for the agreed engagement; do not reuse for marketing, benchmarking, training or another client.
- Verify recipient identity, authorization, purpose and classification before disclosure.
- Share the minimum necessary data; redact unrelated personal identifiers and sensitive details.
- Use approved transfer channels and record the transfer, recipient, dataset, purpose, date and authorization.
- Do not place confidential evidence in public repositories, public issue trackers, open collaboration links or unapproved AI services.
- Obtain legal/privacy and management approval before new suppliers, sub-processors, external reviewers, new processing purposes or cross-border access/transfers.
- Disclose to authorities or other parties only under verified legal/contractual authority and documented approval, except where an applicable legal duty requires a different route; escalate to legal counsel.
- Record all approved and suspected unauthorized disclosures.

## 10. Data quality, integrity and change control

Preserve original evidence and record source, receipt time, version, hash or integrity reference where appropriate and supported, transformation, redaction and working-copy lineage. Restrict changes to authorized roles. Do not overwrite, fabricate, backdate or silently correct source evidence. Corrections to client records must be made by the source owner or clearly recorded as an annotation; retain audit history.

## 11. Retention, return and secure disposal

Apply the approved retention schedule and engagement/contract instructions. The existing [Document Control & Record Retention Framework](document-control-retention.md) contains placeholders only; this procedure does not make those periods effective.

At engagement close:
- Identify records to return, retain, archive or delete.
- Check contractual/legal retention duties and legal holds with legal counsel.
- Obtain approval for any retention exception.
- Return client materials using an approved channel and record receipt.
- Securely delete working copies, exports, temporary files and authorized replicas according to approved system capabilities.
- Address backup copies under the approved backup lifecycle; do not promise immediate deletion from immutable backups unless verified.
- Record what was returned/deleted/retained, by whom, when, method, system and evidence.
- Obtain supplier deletion confirmation where contractually required and available.

## 12. Security and privacy incident response

A suspected loss, misdirection, unauthorized access, malware event, credential compromise, alteration, unavailability, disclosure or privacy breach must be reported immediately through the approved internal route. Follow the [Data Incident Response Playbook](data-incident-response-playbook.md).

Priorities: protect people, contain the event, preserve evidence, assess impact, involve privacy/legal and security leads, meet applicable notification obligations, restore safely, communicate through authorized roles, and learn from the event. Do not independently contact clients, regulators, media or affected individuals unless authorized or legally required.

## 13. Suppliers and external reviewers

Before access is granted, complete documented due diligence proportionate to data sensitivity and risk. Verify service necessity, security controls, locations, subprocessors, confidentiality, access scope, incident notification, retention/deletion, audit evidence, contract terms and exit arrangements. External technical reviewers must receive only the minimum required data under an approved confidentiality and access arrangement. Reassess suppliers after material changes or incidents.

## 14. Monitoring, exceptions and review

Monitor access reviews, overdue revocations, unapproved transfers, incident trends, backup/restore results, deletion completion, supplier exceptions and training completion. Define metrics and review intervals after management approval. Exceptions must have documented risk, compensating controls, owner, approver and expiry. Review this procedure after incidents, legal/contract changes, supplier/system changes and at the approved management interval.

## 15. Required records

- [Data Asset Inventory & Classification Register](data-asset-inventory-register.md)
- [Access Authorization & Review Register](access-authorization-register.md)
- [Data Incident Response Playbook](data-incident-response-playbook.md)
- [Document Control & Record Retention Framework](document-control-retention.md)
- [Management Approval Register](management-approval-register.md)

## 16. Approval and operational readiness

This is a draft framework only. Before use, management/legal/privacy/security must approve the policy, classification scheme, data inventory, lawful-purpose review, access model, systems and channels, supplier controls, incident contacts, retention schedule, return/deletion method, monitoring and exception authority. Actual configurations and test records must be verified. Until then, the service must not accept real client evidence.
