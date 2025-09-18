#!/bin/bash

# Default values are 'development'
NODE_ENV=${NODE_ENV:-development}

if [[ "$NODE_ENV" == "production" ]]; then
  DOCKER_COMPOSE_FILE="docker-compose-prod.yml"
  BACKEND_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-api-prod
  # ADMIN_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-admin-prod
  # WEB_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-web-prod
else
  DOCKER_COMPOSE_FILE="docker-compose-dev.yml"
  BACKEND_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-api-dev
  # ADMIN_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-admin-dev
  # WEB_URL=506876573492.dkr.ecr.ap-northeast-2.amazonaws.com/aurumworks-web-dev
fi

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin ${BACKEND_URL}

docker pull ${BACKEND_URL}
# docker pull ${ADMIN_URL}
# docker pull ${WEB_URL}


docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

docker images --quiet --filter=dangling=true | xargs --no-run-if-empty docker rmi