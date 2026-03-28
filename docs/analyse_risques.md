# Analyse des Risques STRIDE

## Pipeline analysé
Développeur → GitHub → Jenkins → Harbor → Docker Compose

## Matrice STRIDE

| Menace | Composant | Risque | Contre-mesure | Statut |
|--------|-----------|--------|---------------|--------|
| Spoofing | Harbor registry | Fausse image injectée | Cosign signature | ✅ Implémenté |
| Tampering | Code source | Modification malveillante | Bandit + Semgrep | ✅ Implémenté |
| Tampering | Image Docker | Altération post-build | Cosign + digest SHA256 | ✅ Implémenté |
| Repudiation | Pipeline Jenkins | Nier une action | Audit logs Jenkins | ✅ Jenkins logs |
| Information Disclosure | Secrets dans code | Fuite credentials | Gitleaks scan | ✅ Implémenté |
| Information Disclosure | Jenkins credentials | Exposition des secrets | Jenkins Credentials Store | ✅ Implémenté |
| Denial of Service | Jenkins | Saturation pipeline | Limites ressources Docker | ✅ cap_drop |
| Elevation of Privilege | Container | Escalade root | no-new-privileges + USER appuser | ✅ Implémenté |
| Elevation of Privilege | Harbor | Accès non autorisé | Robot Account + RBAC | ✅ Implémenté |

## Conformité OWASP Top 10 CI/CD

| Risque OWASP CI/CD | Description | Mitigation |
|--------------------|-------------|------------|
| CICD-SEC-1 | Insufficient Flow Control | Stages séquentiels Jenkins |
| CICD-SEC-2 | Inadequate Identity | Robot Account Harbor |
| CICD-SEC-3 | Dependency Chain Abuse | Trivy + OWASP check |
| CICD-SEC-4 | Poisoned Pipeline Execution | SAST + Gitleaks |
| CICD-SEC-6 | Insufficient Credential Hygiene | Jenkins Credentials Store |
| CICD-SEC-8 | Ungoverned Usage of 3rd Party | Images Docker officielles uniquement |
| CICD-SEC-10 | Insufficient Artifact Integrity | Cosign signature + vérification |
