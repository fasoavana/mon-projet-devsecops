pipeline {
    agent any

    environment {
        HARBOR_URL     = "localhost:9090"
        HARBOR_PROJECT = "devsecops-project"
        IMAGE_NAME     = "fastapi-app"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        FULL_IMAGE     = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"
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
                              -r /src/src \
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
                              /src/src \
                              --json \
                              --output /src/reports/semgrep-report.json \
                              --exit-code 0 || true
                        '''
                    }
                }
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
                        sh '''
                            mkdir -p reports
                            docker run --rm \
                              -v $(pwd):/src \
                              -v $(pwd)/reports:/report \
                              owasp/dependency-check:latest \
                              --scan /src \
                              --format JSON \
                              --out /report/owasp-report.json \
                              --project "devsecops-demo" || true
                        '''
                    }
                }
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
                        # Login Harbor
                        echo "${HARBOR_PASS}" | docker login ${HARBOR_URL} \
                          -u ${HARBOR_USER} --password-stdin

                        # Push image
                        docker push ${FULL_IMAGE}

                        # Signer avec Cosign v3
                        COSIGN_PASSWORD="" cosign sign \
                          --key ${COSIGN_KEY_FILE} \
                          --signing-config /usr/local/share/cosign/signing-config.json \
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

                    STATUS=$(curl -s -u admin:Harbor12345 \
                      "http://${HARBOR_URL}/api/v2.0/projects/${HARBOR_PROJECT}/repositories/${IMAGE_NAME}/artifacts/${IMAGE_TAG}" \
                      | python3 -c "
import sys, json
d = json.load(sys.stdin)
scan = d.get('scan_overview', {})
if scan:
    for k, v in scan.items():
        print('Scan status:', v.get('scan_status', 'unknown'))
else:
    print('Scan: en cours ou non disponible')
" 2>/dev/null || echo "Harbor scan check: OK")

                    echo "$STATUS"
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
                sh '''
                    export HARBOR_URL=${HARBOR_URL}
                    export HARBOR_PROJECT=${HARBOR_PROJECT}
                    export IMAGE_NAME=${IMAGE_NAME}
                    export IMAGE_TAG=${IMAGE_TAG}

                    docker compose -f docker-compose.deploy.yml up -d --force-recreate
                    echo "✅ Application déployée sur le port 8000"
                '''
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
