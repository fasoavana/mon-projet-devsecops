# Analyse des Risques STRIDE du Pipeline CI/CD

## Composants analysés
Jenkins → Git Repo → Harbor → Serveur déploiement

| Menace | Composant | Risque | Contre-mesure |
|--------|-----------|--------|---------------|
| **S**poofing | Harbor registry | Fausse image injectée | Cosign signature |
| **T**ampering | Code source | Modification malveillante | Gitleaks + SAST |
| **R**epudiation | Pipeline logs | Nier une action | Audit logs Jenkins |
| **I**nformation Disclosure | Secrets dans code | Fuite credentials | Gitleaks + Jenkins Creds |
| **D**enial of Service | Jenkins | Saturation pipeline | Limites ressources |
| **E**levation of Privilege | Container | Escalade root | no-new-privileges, USER non-root |
