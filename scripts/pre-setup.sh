#!/usr/bin/env bash
set -e

# update instance
sudo apt-get update

# install docker
sudo apt-get install docker.io -y
sudo usermod -a -G docker $USER

# install docker-compose (v2 standalone binary)
COMPOSE_VERSION="v2.29.7"
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# awscli install
sudo apt-get install awscli -y

