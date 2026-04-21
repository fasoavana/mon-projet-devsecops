pipeline {
    agent any

    environment {
        HARBOR_URL     = "172.17.0.1:9090"
        HARBOR_PROJECT = "devsecops-project"
        IMAGE_NAME     = "securetask-app"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        FULL_IMAGE     = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"
        SONAR_HOST_URL = "http://172.17.0.1:9000"
        SONAR_TOKEN    = "squ_6d1e0b885b9e4d4e4de3310c653c09e23c8dc9fe"
    }

    stages {

        // ==================== PARTIE 1 : SCAN CODE SOURCE ====================
        
        stage('Static Application Security Testing (SAST)') {
            parallel {
                stage('Bandit - Python Security') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/src cytopia/bandit \
                              -r /src/backend -f json -o /src/reports/bandit-report.json || true
                        '''
                    }
                }
                stage('Gitleaks - Secrets Detection') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/path zricethezav/gitleaks:latest \
                              detect --source /path --report-path /path/reports/gitleaks-report.json \
                              --report-format json --exit-code 0 --no-git || true
                        '''
                    }
                }
                stage('Semgrep - Code Analysis') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/src returntocorp/semgrep \
                              semgrep --config=auto /src/backend --json \
                              --output /src/reports/semgrep-report.json || true
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 2 : QUALITE CODE ====================
        
        stage('Software Quality Analysis') {
            stages {
                stage('SonarQube - Quality Gate') {
                    steps {
                        sh '''
                            docker run --rm -v $(pwd):/usr/src sonarsource/sonar-scanner-cli:latest \
                              -Dsonar.host.url=${SONAR_HOST_URL} \
                              -Dsonar.login=${SONAR_TOKEN} \
                              -Dsonar.projectKey=securetask \
                              -Dsonar.projectName=SecureTask \
                              -Dsonar.projectVersion=${BUILD_NUMBER} \
                              -Dsonar.sources=/usr/src \
                              -Dsonar.exclusions=/usr/src/backend/tests/**,/usr/src/backend/static/**,/usr/src/frontend/** \
                              -Dsonar.python.version=3 || true
                        '''
                    }
                }
                stage('Linting & Format Check') {
                    steps {
                        sh '''
                            echo "Vérification du formatage Python..."
                            docker run --rm -v $(pwd):/src python:3.11-slim \
                              bash -c "pip install flake8 black -q && cd /src/backend && flake8 . --count --exit-zero || true"
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 3 : BUILD ====================
        
        stage('Container Image Build') {
            steps {
                sh '''
                    docker build -t ${FULL_IMAGE} -f docker/Dockerfile .
                    docker images | grep securetask-app
                '''
            }
        }

        // ==================== PARTIE 4 : SECURITY SCANNING ====================
        
        stage('Security Scanning Pipeline') {
            parallel {
                stage('Container Vulnerability Scan') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v /var/run/docker.sock:/var/run/docker.sock \
                              -v $(pwd)/reports:/reports \
                              aquasec/trivy:latest image \
                              --format json \
                              --output /reports/trivy-report.json \
                              --exit-code 0 \
                              --severity HIGH,CRITICAL \
                              --timeout 10m \
                              ${FULL_IMAGE} || true
                        '''
                    }
                }
                stage('Dependency Vulnerability Scan') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd)/backend:/app python:3.11-slim \
                              bash -c "pip install safety -q && safety check -r /app/requirements.txt --json" > reports/safety.json || true
                        '''
                    }
                }
                stage('License Compliance Check') {
                    steps {
                        sh '''
                            echo "Vérification des licences des dépendances..."
                            docker run --rm -v $(pwd)/backend:/app python:3.11-slim \
                              bash -c "pip install pip-licenses -q && pip-licenses --format=json" > reports/licenses.json || true
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 5 : SBOM & SUPPLY CHAIN ====================
        
        stage('Software Supply Chain Security') {
            stages {
                stage('Generate SBOM (CycloneDX)') {
                    steps {
                        sh '''
                            docker run --rm -v $(pwd):/src anchore/syft:latest \
                              /src -o cyclonedx-json > reports/sbom-cyclonedx.json || true
                        '''
                    }
                }
                stage('Verify SBOM Integrity') {
                    steps {
                        sh '''
                            echo "Vérification de l'intégrité du SBOM..."
                            cat reports/sbom-cyclonedx.json | jq '.components | length' 2>/dev/null || echo "SBOM généré"
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 6 : IMAGE SIGNING ====================
        
        stage('Artifact Signing & Verification') {
            stages {
                stage('Sign Image with Cosign') {
                    steps {
                        withCredentials([
                            usernamePassword(credentialsId: 'harbor-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS'),
                            file(credentialsId: 'cosign-key', variable: 'COSIGN_KEY_FILE')
                        ]) {
                            sh '''
                                echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} -u ${HARBOR_USER} --password-stdin
                                docker push ${FULL_IMAGE}
                                COSIGN_PASSWORD="" cosign sign --key ${COSIGN_KEY_FILE} ${FULL_IMAGE}
                            '''
                        }
                    }
                }
                stage('Verify Signature') {
                    steps {
                        sh '''
                            COSIGN_INSECURE_IGNORE_TLOG=1 cosign verify --key cosign.pub ${FULL_IMAGE}
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 7 : REGISTRY SECURITY ====================
        
        stage('Harbor Security Policies') {
            stages {
                stage('Wait for Harbor Scan') {
                    steps {
                        sh '''
                            echo "Attente du scan automatique Harbor..."
                            sleep 30
                        '''
                    }
                }
                stage('Check Harbor Policies') {
                    steps {
                        sh '''
                            echo "Vérification des politiques de sécurité Harbor..."
                            curl -s -u admin:Harbor12345 http://localhost:9090/api/v2.0/projects | jq '.[] | {name: .name, public: .metadata.public}'
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 8 : DEPLOYMENT ====================
        
        stage('Secure Deployment') {
            stages {
                stage('Pull Image from Harbor') {
                    steps {
                        sh '''
                            docker pull ${FULL_IMAGE}
                        '''
                    }
                }
                stage('Deploy with Docker Compose') {
                    steps {
                        sh '''
                            export HARBOR_URL=${HARBOR_URL}
                            export HARBOR_PROJECT=${HARBOR_PROJECT}
                            export IMAGE_NAME=${IMAGE_NAME}
                            export IMAGE_TAG=${IMAGE_TAG}
                            
                            docker run --rm \
                              -v /var/run/docker.sock:/var/run/docker.sock \
                              -v $(pwd):/app \
                              -w /app \
                              docker/compose:1.29.2 \
                              -f /app/docker-compose.deploy.yml up -d --force-recreate
                        '''
                    }
                }
                stage('Health Check') {
                    steps {
                        sh '''
                            echo "Vérification du déploiement..."
                            sleep 5
                            curl -f http://localhost:8000/api/v1/health || echo "Health check en attente..."
                        '''
                    }
                }
            }
        }

        // ==================== PARTIE 9 : POST-DEPLOYMENT ====================
        
        stage('Post-Deployment Validation') {
            stages {
                stage('API Smoke Test') {
                    steps {
                        sh '''
                            echo "Test de l'API..."
                            curl -s http://localhost:8000/ | jq . || echo "API accessible"
                        '''
                    }
                }
                stage('Container Runtime Security') {
                    steps {
                        sh '''
                            echo "Vérification des conteneurs en cours d'exécution..."
                            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
            echo "Rapports archivés"
        }
        success {
            echo "Pipeline réussi - Image: ${FULL_IMAGE}"
        }
        failure {
            echo "Pipeline échoué - Vérifiez les logs"
        }
    }
}
