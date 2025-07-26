#!/bin/bash
echo "Installing dependencies..."
cd /var/www/myproject || exit
npm install --prefix backend
npm install --prefix frontend
