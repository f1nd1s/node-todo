#!/bin/bash
sudo apt update
sudo apt install -y git nodejs npm
git clone https://github.com/scotch-io/node-todo.git
cd node-todo
npm install
nohup npm start &
PORT=8080 npm start &