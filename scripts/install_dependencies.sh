#!/bin/bash
echo "Installing dependencies..."
cd /home/ec2-user/app || exit
npm install --prefix backend
npm install --prefix frontend
