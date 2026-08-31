# Incident Response

Severity 1 incidents include suspected account compromise, exposed secrets, payment integrity issues, unauthorized admin access or major data exposure.

Response: detect → contain → preserve evidence → revoke/rotate affected credentials → assess scope → remediate → validate → communicate appropriately → document lessons learned.

Never paste production secrets into GitHub issues or chat. Compromised credentials must be rotated at the provider, not merely removed from source code.

Maintain an incident record containing timeline, affected systems, actions, owner and follow-up controls.