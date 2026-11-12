#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
printf 'ORadar: acesse http://localhost:4173\n'
exec node server.mjs
