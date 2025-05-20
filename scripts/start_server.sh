#!/bin/bash
echo "Starting the application..."
cd /home/ec2-user/app || exit
npm run start --prefix backend &
npm run start --prefix frontend &
