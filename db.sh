#!/bin/bash

pgpassword=1234
pguser=1234
dbname=test


docker run -d --name test-db -p 5433:5432 -e POSTGRES_PASSWORD=$pgpassword -e POSTGRES_USER=$pguser -e POSTGRES_DB=$dbname postgres:16-alpine