#!/bin/sh
set -e

# Apply any pending migrations before starting
node_modules/.bin/prisma migrate deploy

exec node dist/main.js
