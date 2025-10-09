#!/bin/bash

CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --no-first-run \
  --no-default-browser-check \
  --disable-gpu \
  --user-data-dir=C:\\temp\\chrome-debug > /dev/null 2>&1 &

sleep 3

curl http://localhost:9222/json/version 2>/dev/null