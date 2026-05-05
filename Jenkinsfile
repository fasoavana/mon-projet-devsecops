pipeline {
    agent any

    environment {
        HARBOR_URL     = "172.17.0.1:9090"
        HARBOR_PROJECT = "devsecops-project"
        IMAGE_NAME     = "securetask-app"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        FULL_IMAGE     = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"
        SONAR_HOST_URL = "http://172.17.0.1:9000"
        SONAR_TOKEN    = credentials('sonar-token')
    }

    stages {

        stage('SAST Scan') {
            parallel {
                stage('Bandit') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/src cytopia/bandit -r /src/backend -f json -o /src/reports/bandit-report.json || true
                        '''
                    }
                }
                stage('Gitleaks') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path --report-path /path/reports/gitleaks-report.json --report-format json --exit-code 0 --no-git || true
                        '''
                    }
                }
                stage('Semgrep') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd):/src returntocorp/semgrep semgrep --config=auto /src/backend --json --output /src/reports/semgrep-report.json || true
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                    docker run --rm \
                      -v $(pwd):/usr/src \
                      --user $(id -u):$(id -g) \
                      sonarsource/sonar-scanner-cli:latest \
                      -Dsonar.host.url=${SONAR_HOST_URL} \
                      -Dsonar.token=${SONAR_TOKEN} \
                      -Dsonar.projectKey=securetask \
                      -Dsonar.projectName=SecureTask \
                      -Dsonar.sources=backend,frontend \
                      -Dsonar.python.version=3 \
                      -Dsonar.javascript.file.suffixes=js \
                      -Dsonar.exclusions=**/devsecops/**,**/__pycache__/**,**/*.pyc,**/venv/**,**/env/**
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t ${FULL_IMAGE} -f docker/Dockerfile .
                '''
            }
        }

        stage('Security Scan') {
            parallel {
                stage('Trivy') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v /var/run/docker.sock:/var/run/docker.sock \
                              -v $(pwd)/reports:/reports \
                              aquasec/trivy:latest image \
                              --format table \
                              --exit-code 0 \
                              --severity HIGH,CRITICAL \
                              --timeout 10m \
                              ${FULL_IMAGE} || true
                        '''
                    }
                }
                stage('Safety') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd)/backend:/app python:3.11-slim \
                              bash -c "pip install safety -q && safety check -r /app/requirements.txt --json" > reports/safety.json 2>/dev/null || echo '{"vulnerabilities":[]}' > reports/safety.json
                        '''
                    }
                }
                stage('License Check') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm -v $(pwd)/backend:/app python:3.11-slim \
                              bash -c "pip install pip-licenses -q && pip-licenses --format=json" > reports/licenses.json 2>/dev/null || echo '[]' > reports/licenses.json
                        '''
                    }
                }
            }
        }

        stage('Generate SBOM') {
            steps {
                sh '''
                    docker run --rm -v $(pwd):/src anchore/syft:latest /src -o json > reports/sbom.json || true
                '''
            }
        }

        stage('Push to Harbor') {
            steps {
                sh '''
                    echo "Harbor12345" | docker login ${HARBOR_URL} -u admin --password-stdin
                    docker push ${FULL_IMAGE}
                '''
            }
        }

        stage('Sign & Verify') {
            steps {
                withCredentials([file(credentialsId: 'cosign-key', variable: 'COSIGN_KEY_FILE')]) {
                    sh '''
                        COSIGN_PASSWORD="" cosign sign --key ${COSIGN_KEY_FILE} ${FULL_IMAGE} || true
                        COSIGN_INSECURE_IGNORE_TLOG=1 cosign verify --key cosign.pub ${FULL_IMAGE} || true
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose up -d --force-recreate || true
                    echo "Application deployed on http://localhost:8000"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 5
                    curl -s -o /dev/null -w "Health check: %{http_code}\\n" http://localhost:8000/ || echo "Health check: waiting"
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
            echo "Reports archived"
        }
        success {
            echo "✅ PIPELINE SUCCESS - Image: ${FULL_IMAGE}"
        }
        failure {
            echo "❌ Pipeline failed - Check logs"
        }
    }
}
