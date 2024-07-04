pipeline {
    agent any
    stages {
        stage('Build') {
            agent {
                docker {
                    // Use a specific version of Python
                    image 'python:3.9-alpine'
                    // Run Docker container as root (optional but may be necessary for some setups)
                    args '-u root'  
                    // Enable reuse of the container across stages if needed
                    reuseNode true
                }
            }
            steps {
                // Install dependencies and compile Python files
                sh '''
                pip install --no-cache-dir -r requirements.txt
                python -m py_compile bugFixer.py test_bugFixer.py
                '''
            }
            post {
                always {
                    // Archive compiled Python files if needed
                    archiveArtifacts artifacts: '**/*.pyc', allowEmptyArchive: true
                }
            }
        }
        stage('Test') {
            agent {
                docker {
                    // Use the same Python image and install pytest
                    image 'python:3.9-alpine'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                // Install pytest and run tests
                sh '''
                pip install --no-cache-dir pytest
                pytest --verbose --junit-xml test-reports/results.xml text_bugFixer.py
                '''
            }
            post {
                always {
                    // Publish test results
                    junit 'test-reports/results.xml'
                    // Clean up workspace
                    cleanWs()
                }
            }
        }
    }
}
