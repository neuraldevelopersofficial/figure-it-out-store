#!/bin/bash

# Install dependencies
npm ci --legacy-peer-deps

# Build the application
npm run build

# Make sure the server can find the index.html file
cp -r dist/. .