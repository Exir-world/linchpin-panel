pipeline {
    agent any

    environment {
        DOCKER_REGISTRY_URL = 'docker.exirtu.be'
        IMAGE_NAME = 'admin.linchpin'
        GIT_REPO_URL = 'git@github.com:Exir-world/linchpin-panel.git'
        TELEGRAM_CHAT_ID = '-1002585379912'
        TELEGRAM_BOT_TOKEN = '8027466900:AAG6Q_0p6rSeEXtg8e0gDcYJmIJ_R7zBVew'
    }

    stages {
        stage('Cleanup') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm 
            }
        }

        stage('Get Latest Image Tag') {
            steps {
                script {
                    def tagsJson = sh(
                        script: "curl -s -X GET https://${DOCKER_REGISTRY_URL}/v2/${IMAGE_NAME}/tags/list",
                        returnStdout: true
                    ).trim()

                    def latestTag = "1"
                    try {
                        def tags = readJSON text: tagsJson
                        def numericTags = []

                        for (tag in tags.tags) {
                            if (tag ==~ /^\d+$/) {
                                numericTags << tag.toInteger()
                            }
                        }

                        numericTags.sort()
                        if (numericTags && numericTags.size() > 0) {
                            latestTag = (numericTags[-1] + 1).toString()
                        }
                    } catch (Exception e) {
                        echo "⚠️ Failed to parse tags. Defaulting to tag 1. Error: ${e.message}"
                    }

                    env.IMAGE_TAG = latestTag
                    echo "🚀 Using image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm cache clean --force'
                sh 'npm install --legacy-peer-deps'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    def customImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}", "-f Dockerfile .")

                    withCredentials([usernamePassword(credentialsId: 'DOCKER_REGISTRY_CREDENTIALS_ID', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin ${DOCKER_REGISTRY_URL}'
                    }

                    docker.withRegistry("https://${DOCKER_REGISTRY_URL}", 'DOCKER_REGISTRY_CREDENTIALS_ID') {
                        customImage.push()
                        customImage.push("latest")
                    }
                }
            }
        }

        stage('Cleanup Old Docker Images') {
            steps {
                script {
                    sh """
                    docker images --format '{{.Repository}}:{{.Tag}} {{.CreatedAt}}' \\
                        | grep ${IMAGE_NAME} \\
                        | sort -k2 -r \\
                        | awk 'NR>4 {print \$1}' \\
                        | xargs -r docker rmi
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                def lastCommitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                def message = "✅ your container is alive!!! \n" +
                              "Commit: ${lastCommitMessage} \n" +
                              "Image Name: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"

                sh """
                curl -s -X POST https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage \\
                    -d chat_id=${env.TELEGRAM_CHAT_ID} \\
                    -d text="${message}" \\
                    -d parse_mode=Markdown
                """
            }
        }

        failure {
            script {
                def lastCommitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                def message = "❌ Pipeline is dead! \n" +
                              "Commit: ${lastCommitMessage} \n" +
                              "Image Name: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"

                sh """
                curl -s -X POST https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage \\
                    -d chat_id=${env.TELEGRAM_CHAT_ID} \\
                    -d text="${message}" \\
                    -d parse_mode=Markdown
                """
            }
        }
    }
}
