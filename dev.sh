#!/bin/bash

pgpassword=1234
pguser=1234
dbname=cmupa


docker run -d --name cmupa-db -p 5432:5432 -e POSTGRES_PASSWORD=$pgpassword -e POSTGRES_USER=$pguser -e POSTGRES_DB=$dbname postgres:16-alpine