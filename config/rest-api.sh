#!/usr/bin/env bash
# Creates a REST instance and optionally a database
curl --digest --user admin:'********' -i -X POST \
    -d'{"rest-api":{"name":"Logs-REST", "port": 3033, "database": "Logs", "modules-database": "Logs-Modules"}}' \
    -H "Content-type: application/json" \
    http://localhost:8002/LATEST/rest-apis