# Pipeline CI/CD DevSecOps — Jenkins + Harbor + Cosign

## Architecture
```
Développeur → GitHub → Jenkins (CI/CD) → Harbor (registre) → Docker Compose (déploiement)
```

## Stack technique
- **Jenkins** : Orchestration CI/CD (remplace GitLab)
- **Harbor** : Registre privé + scan Trivy + politique de sécurité
- **Cosign v3** : Signature et vérification des images
- **Bandit / Gitleaks / Semgrep** : SAST et détection de secrets
- **Trivy** : Scan de vulnérabilités containers
- **FastAPI Python 3.11** : Application déployée
- **Docker Compose** : Déploiement sécurisé

## Stages du pipeline
1. SAST & Secrets Scan (Bandit, Gitleaks, Semgrep)
2. Build Docker Image
3. Security Scanning (Trivy, OWASP)
4. Sign & Push to Harbor (Cosign)
5. Harbor Policy Check
6. Verify Signature
7. Deploy with Docker Compose

## Lancer le projet
```bash
# Démarrer l'infrastructure
~/start-devsecops.sh

# Accès
# Jenkins : http://localhost:8080
# Harbor  : http://localhost:9090
# App     : http://localhost:8000
```
