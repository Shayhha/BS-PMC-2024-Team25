pipeline {
    agent none
    stages {
        stage('Build') {
            agent {
                docker {
                    image 'python:3.9-slim'
                }
            }
            steps {
                sh 'python -m py_compile bugFixer.py test_bugFixer.py'
            }
        }
        stage('Test') {
            agent {
                docker {
                    image 'qnib/pytest'
                }
            }
            steps {
                sh 'py.test --verbose --junit-xml test-reports/results.xml test_bugFixer.py'
            }
            post {
                always {
                    junit 'test-reports/results.xml'
                }
            }
        }
    }
}