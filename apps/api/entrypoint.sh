#!/bin/sh
set -e

# Apply any pending migrations before starting
node_modules/.bin/prisma db push

exec node dist/main.js
