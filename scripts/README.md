## Deploy via docker-machine

1. Deploy
 - AWS ECR 환경설정 : aws configure --profile openpal-webrtc-docker
 - docker-machine 생성: docker-machine create --driver generic --generic-ip-address=13.209.187.48 --generic-ssh-user ubuntu  openpal-webrtc-dev
 - pem 파일을 ~/.ssh/openpal-webrtc.pem 에 저장
 - npm run deploy

2. Development
 - API: npm run dev:server
 - WEB: npm run dev:client
 - 동시: npm run dev



Unable to query docker version: 나올때
docker-machine regenerate-certs openpal-webrtc-dev


# ssh


