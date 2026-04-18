# SecureTask - Backend Professionnel FastAPI

Une application de gestion de tâches (To-Do List) robuste, sécurisée et scalable, développée avec FastAPI et PostgreSQL.

## 🚀 Améliorations Backend

- **Architecture Modulaire** : Organisation en `routers`, `services`, `repositories`, `models` et `schemas`.
- **Sécurité Renforcée** : 
    - Authentification JWT complète (Access & Refresh tokens).
    - Hachage des mots de passe avec `bcrypt`.
    - Headers de sécurité (CORS, CSP, HSTS, XSS protection).
    - Gestion des rôles (Admin/User) avec permissions fines.
- **Base de Données PostgreSQL** :
    - Modèles enrichis (priority, status, created_at, updated_at, deadline).
    - Support du "Soft Delete" (`is_deleted`).
    - Relations User -> Tasks optimisées.
- **Performance** :
    - Utilisation intensive de `async/await` (SQLAlchemy 2.0 + asyncpg).
    - Pagination obligatoire sur les listes.
    - Support de Redis pour le cache et le rate limiting.
- **DevOps & CI/CD** :
    - Dockerfile multi-stage optimisé (non-root user).
    - Docker Compose complet avec PostgreSQL et Redis.
    - Pipeline GitLab CI/CD (Lint, Test, Security Scan, Build, Deploy).

## 🛠️ Installation & Lancement

### Avec Docker (Recommandé)

1. Copiez le fichier `.env` et configurez vos variables :
   ```bash
   cp .env.example .env
   ```
2. Lancez l'application :
   ```bash
   docker-compose up --build
   ```
3. L'application est accessible sur `http://localhost:8000`.
4. La documentation Swagger est sur `http://localhost:8000/api/v1/docs`.

### En local

1. Créez un environnement virtuel : `python -m venv venv`
2. Installez les dépendances : `pip install -r SecureTask/backend/requirements.txt`
3. Configurez votre base de données PostgreSQL locale dans `.env`.
4. Lancez l'application : `uvicorn SecureTask.backend.main:app --reload`

## 📁 Structure du Projet

```text
backend/
├── api/            # Endpoints API (v1)
├── core/           # Configuration, sécurité, exceptions
├── db/             # Session et base de données
├── models/         # Modèles SQLAlchemy
├── repositories/   # Logique d'accès aux données (CRUD)
├── schemas/        # Schémas Pydantic (Validation)
├── services/       # Logique métier (optionnel)
├── templates/      # Frontend Jinja2 (Inchangé)
└── main.py         # Point d'entrée de l'application
```

## 🧪 Tests

Lancez les tests avec pytest :
```bash
pytest SecureTask/tests/
```

## 🔒 Sécurité

- Les mots de passe sont hachés avant stockage.
- Les tokens JWT expirent régulièrement.
- Les cookies de session sont sécurisés (`httponly`, `samesite=lax`).
- Le système gère les permissions : un utilisateur ne peut voir/modifier que ses propres tâches (sauf admin).
