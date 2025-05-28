#!/bin/bash
cd /home/kavia/workspace/code-generation/tetramaster-24353-0c87ffc6/tetramaster
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

