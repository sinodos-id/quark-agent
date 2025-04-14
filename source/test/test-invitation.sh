#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Replace this with your actual API token
API_TOKEN="your-api-token"

echo -e "${GREEN}Testing Issuance Flow${NC}"
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{"goalCode":"extrimian/waci/issuance"}' \
  | jq '.'

echo -e "\n${GREEN}Testing Presentation Flow${NC}"
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{"goalCode":"extrimian/waci/presentation"}' \
  | jq '.'