#!/bin/bash

# Ce script vérifie l'état de santé des services Docker via /api/health
# Il attend la liste des services:ports en argument.

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
DEFAULT="\033[0m"


# check args
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <HOST_IP> <service1:port1 service2:port2 ...>${DEFAULT}"
    exit 1
fi

HOST_IP="$1"
SERVICES_PORTS_LIST="$2"

IFS=' ' read -r -a SERVICES_PORTS <<< "$SERVICES_PORTS_LIST"

printf "${YELLOW}%-17s | %-4s | STATUS${DEFAULT}\n" "SERVICE" "PORT"

for service_port in "${SERVICES_PORTS[@]}"; do

    service=$(echo "$service_port" | cut -d':' -f1)
    port=$(echo "$service_port" | cut -d':' -f2)

    curl_output=$(curl -k --fail -s "http://${HOST_IP}:${port}/api/health")
    curl_exitcode=$?
    max_length=25
    printf "${BLUE}%-17s | %-4s | ${DEFAULT}" "$service" "$port"

    if [[ $curl_exitcode == "0" ]]; then
        if [[ $curl_output == *"healthy"* ]]; then
            echo -e "${GREEN}healthy${DEFAULT}"
        else
            echo -e "${RED}not healty${DEFAULT}"
            echo "Receive: $curl_output"
        fi
    else
        if [ -n "$curl_output" ]; then
            echo -e "${RED}HTTP error${DEFAULT}"
            echo "Receive: $curl_output"
        else
            echo -e "${RED}connection error to${DEFAULT} http://${HOST_IP}:${port}/api/health"
        fi
    fi
done
