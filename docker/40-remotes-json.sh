#!/bin/sh
# runs when the container starts (scripts of /docker-entrypoint.d are run by the nginx image)
# generates remotes.json from the REMOTE_<APP_NAME> environment variables, so the urls of the remote apps
# can be changed without rebuilding the image, e.g. REMOTE_INNER_APP=https://inner-app.example.com
# => { "inner_app": "https://inner-app.example.com" } (used by src/js/constants/LoadRemote.js)
set -e

remotes=$(env | grep '^REMOTE_' || true)
# without REMOTE_* variables the remotes.json emitted by the build (urls of buildTools/constants.js) is kept
[ -z "$remotes" ] && exit 0

echo "$remotes" | awk '
  BEGIN { printf "{" }
  {
    name = tolower(substr($0, 8, index($0, "=") - 8))
    url = substr($0, index($0, "=") + 1)
    printf "%s\"%s\":\"%s\"", (NR > 1 ? "," : ""), name, url
  }
  END { print "}" }
' > /usr/share/nginx/html/remotes.json

echo "remotes.json: $(cat /usr/share/nginx/html/remotes.json)"
