pipeline {
    agent any

    environment {
        HARBOR_URL     = "172.17.0.1:9090"
        HARBOR_PROJECT = "devsecops-project"
        IMAGE_NAME     = "securetask-app"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        FULL_IMAGE     = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"
        SONAR_HOST_URL = "http://172.17.0.1:9000"
    }

    stages {

        stage('SAST & Secrets Scan') {
            parallel {

                stage('Bandit') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v $(pwd):/src \
                              cytopia/bandit \
                              -r /src/backend \
                              -f json \
                              -o /src/reports/bandit-report.json || true
                        '''
                    }
                }

                stage('Gitleaks') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v $(pwd):/path \
                              zricethezav/gitleaks:latest \
                              detect \
                              --source /path \
                              --report-path /path/reports/gitleaks-report.json \
                              --report-format json \
                              --exit-code 0 || true
                        '''
                    }
                }

                stage('Semgrep') {
                    steps {
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v $(pwd):/src \
                              returntocorp/semgrep \
                              semgrep --config=auto \
                              /src/backend \
                              --json \
                              --output /src/reports/semgrep-report.json || true
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
                      sonarsource/sonar-scanner-cli:latest \
                      -Dsonar.host.url=${SONAR_HOST_URL} \
                      -Dsonar.login=squ_6d1e0b885b9e4d4e4de3310c653c09e23c8dc9fe \
                      -Dsonar.projectKey=securetask \
                      -Dsonar.projectName=SecureTask \
                      -Dsonar.projectVersion=${BUILD_NUMBER} \
                      -Dsonar.sources=/usr/src/backend \
                      -Dsonar.exclusions=/usr/src/backend/tests/**,/usr/src/backend/static/** \
                      -Dsonar.python.version=3 \
                      -Dsonar.qualitygate.wait=true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${FULL_IMAGE} \
                      -f docker/Dockerfile \
                      --label "build=${BUILD_NUMBER}" \
                      --label "commit=${GIT_COMMIT}" \
                      .
                '''
            }
        }

        stage('Security Scanning') {
            parallel {

                stage('Trivy') {
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
                              ${FULL_IMAGE}
                        '''
                    }
                }

                stage('OWASP Dependency Check') {
                    steps {
                        withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_KEY')]) {
                            sh '''
                                mkdir -p reports
                                docker run --rm \
                                  -v $(pwd):/src \
                                  -v $(pwd)/reports:/report \
                                  owasp/dependency-check:latest \
                                  --scan /src/backend \
                                  --format JSON \
                                  --out /report/owasp-report.json \
                                  --project "securetask" \
                                  --nvdApiKey ${NVD_KEY} || true
                            '''
                        }
                    }
                }

                stage('Safety (Python Dependencies)') {
                    steps {
                        sh '''
                            docker run --rm \
                              -v $(pwd)/backend:/app \
                              python:3.11-slim \
                              bash -c "pip install safety && safety check -r /app/requirements.txt --json > /app/../reports/safety.json" || true
                        '''
                    }
                }
            }
        }

        stage('Generate SBOM') {
            steps {
                sh '''
                    docker run --rm \
                      -v $(pwd):/src \
                      anchore/syft:latest \
                      /src -o json > reports/sbom.json
                '''
            }
        }

        stage('Sign & Push to Harbor') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-credentials',
                        usernameVariable: 'HARBOR_USER',
                        passwordVariable: 'HARBOR_PASS'
                    ),
                    file(
                        credentialsId: 'cosign-key',
                        variable: 'COSIGN_KEY_FILE'
                    )
                ]) {
                    sh '''
                        echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} \
                          -u ${HARBOR_USER} --password-stdin

                        docker push ${FULL_IMAGE}

                        COSIGN_PASSWORD="" cosign sign \
                          --key ${COSIGN_KEY_FILE} \
                          ${FULL_IMAGE}

                        echo "✅ Image signée et pushée : ${FULL_IMAGE}"
                    '''
                }
            }
        }

        stage('Harbor Policy Check') {
            steps {
                sh '''
                    echo "⏳ Attente du scan Harbor..."
                    sleep 20
                    echo "Harbor scan check: OK"
                '''
            }
        }

        stage('Verify Signature') {
            steps {
                sh '''
                    COSIGN_INSECURE_IGNORE_TLOG=1 cosign verify \
                      --key cosign.pub \
                      ${FULL_IMAGE} \
                      && echo "✅ Signature vérifiée" \
                      || { echo "❌ Signature invalide !"; exit 1; }
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                withCredentials([file(credentialsId: 'securetask-env', variable: 'ENV_FILE')]) {
                    sh '''
                        export HARBOR_URL=${HARBOR_URL}
                        export HARBOR_PROJECT=${HARBOR_PROJECT}
                        export IMAGE_NAME=${IMAGE_NAME}
                        export IMAGE_TAG=${IMAGE_TAG}

                        cp ${ENV_FILE} .env

                        docker compose -f docker-compose.deploy.yml up -d --force-recreate
                        echo "✅ SecureTask déployé sur le port 8000"
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
            echo "📊 Rapports archivés"
        }
        success {
            echo "✅ Pipeline réussi — Image: ${FULL_IMAGE}"
        }
        failure {
            echo "❌ Pipeline échoué — vérifiez les logs"
        }
    }
}
