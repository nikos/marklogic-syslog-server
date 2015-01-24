#!/usr/bin/env bash

set -e

MANAGEADMIN='admin'
MANAGEPASS='********'

# add logs-reader role
curl -fS \
  --digest --user $MANAGEADMIN:$MANAGEPASS \
  -X POST --header "Content-Type:application/json" \
  -d '{ "role-name": "logs-reader", "role": [ "rest-reader", "alert-user" ] }'  \
  'http://localhost:8002/manage/v2/roles'
echo 'Created logs-reader'

# add logs-writer role
curl -fS \
  --digest --user $MANAGEADMIN:$MANAGEPASS  \
  -X POST --header "Content-Type:application/json" \
  -d '{ "role-name": "logs-writer", "role": [ "logs-reader", "rest-writer" ]}'  \
  'http://localhost:8002/manage/v2/roles'
  # -d '{ "role-name": "logs-writer", "role": [ "logs-reader", "rest-writer" ], "permission": [{"role-name": "logs-reader", "capability": "read"}, {"role-name": "logs-writer", "capability": "insert"}, {"role-name": "logs-writer", "capability": "update"}] }'  \
echo 'Created logs-writer'

# add logs-admin role
curl \
  --digest --user $MANAGEADMIN:$MANAGEPASS \
  -X POST --header "Content-Type:application/json" \
  -d '{ "role-name": "logs-admin", "role": [ "rest-admin", "alert-admin", "logs-writer" ] }' \
  'http://localhost:8002/manage/v2/roles'

# curl -fS \
#   --anyauth --user $MANAGEADMIN:$MANAGEPASS \
#   -X PUT  --header "Content-Type:application/json" \
#   -d '{"permission": [{"role-name": "logs-reader", "capability": "execute"}]}' \
#   'http://localhost:8002/manage/v2/roles/logs-admin/properties'
echo 'Created logs-admin'
  
########################################################


# Creates a REST instance and optionally a database
curl -fS \
  --digest --user $MANAGEADMIN:$MANAGEPASS \
  -X POST \
  -d'{"rest-api":{"name":"Logs-REST", "port": 3033, "database": "Logs", "modules-database": "Logs-Modules"}}' \
  -H "Content-type: application/json" \
  'http://localhost:8002/LATEST/rest-apis'


# curl \
#   --digest --user $MANAGEADMIN:$MANAGEPASS \
#   -X POST --header "Content-Type:application/json" \
#   -d '{ "database-name": "Logs" }' \
#   'http://localhost:8002/manage/v2/databases'

