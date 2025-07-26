#!/bin/bash
echo "Starting the application..."
cd /var/www/myproject || exit
npm run start --prefix backend &
npm run start --prefix frontend &
