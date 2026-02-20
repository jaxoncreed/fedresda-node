#!/bin/bash

# Simple SetMeld Pod deployment script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 SetMeld Pod Deployment${NC}"

# Parse flags and positional args
SSL_ENABLED=
SSL_EMAIL=
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --ssl)
            SSL_ENABLED=1
            shift
            ;;
        --ssl-email)
            SSL_EMAIL="$2"
            shift 2
            ;;
        *)
            POSITIONAL+=("$1")
            shift
            ;;
    esac
done

if [ ${#POSITIONAL[@]} -lt 2 ]; then
    echo "Usage: $0 [--ssl] [--ssl-email EMAIL] <server> <domain> [port]"
    echo "Example: $0 user@myserver.com myserver.com 80"
    echo "         $0 --ssl --ssl-email admin@myserver.com user@myserver.com myserver.com"
    echo ""
    echo "Options:"
    echo "  --ssl           Configure HTTPS with Let's Encrypt (Certbot)"
    echo "  --ssl-email E   Email for Let's Encrypt expiry notices (required with --ssl)"
    echo ""
    echo "Note: <server> can be:"
    echo "  - user@hostname (e.g., jackson@192.168.1.100)"
    echo "  - hostname (e.g., myserver.com)"
    echo "  - SSH alias (e.g., sandbox) - from ~/.ssh/config"
    exit 1
fi

SERVER="${POSITIONAL[0]}"
BASE_URL="${POSITIONAL[1]}"
PORT="${POSITIONAL[2]:-80}"

if [ -n "$SSL_ENABLED" ] && [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}❌ --ssl requires an email for Let's Encrypt. Use --ssl-email you@example.com${NC}"
    exit 1
fi

# Use the server parameter directly - let SSH handle aliases and config
SSH_CONNECTION="$SERVER"

echo -e "${BLUE}📋 Deploying to: $SERVER${NC}"
echo -e "${BLUE}🌐 Domain: $BASE_URL${NC}"
echo -e "${BLUE}🔌 Port: $PORT${NC}"
[ -n "$SSL_ENABLED" ] && echo -e "${BLUE}🔒 SSL: Certbot (Let's Encrypt)${NC}"

# Check if Ansible is installed
if ! command -v ansible-playbook &> /dev/null; then
    echo -e "${RED}❌ Ansible not found. Install with:${NC}"
    echo "  # macOS: brew install ansible"
    echo "  # Ubuntu: sudo apt install ansible"
    exit 1
fi

# Create simple inventory
if [ -n "$SSL_ENABLED" ]; then
cat > inventory-temp.yml << EOF
all:
  hosts:
    myserver:
      ansible_host: $SSH_CONNECTION
      base_url: $BASE_URL
      nginx_port: $PORT
      ssl_enabled: true
      ssl_email: "$SSL_EMAIL"
  vars:
    ansible_python_interpreter: /usr/bin/python3
    ansible_become: yes
    ansible_become_method: sudo
EOF
else
cat > inventory-temp.yml << EOF
all:
  hosts:
    myserver:
      ansible_host: $SSH_CONNECTION
      base_url: $BASE_URL
      nginx_port: $PORT
  vars:
    ansible_python_interpreter: /usr/bin/python3
    ansible_become: yes
    ansible_become_method: sudo
EOF
fi

echo -e "${BLUE}📜 Running deployment...${NC}"
echo "   (Use -vv or -vvv for more detail if it hangs or fails)"
echo ""

# Pass SSL as extra vars so they always take effect (highest precedence)
EXTRA_VARS=()
if [ -n "$SSL_ENABLED" ]; then
    EXTRA_VARS+=(-e "ssl_enabled=true" -e "ssl_email=$SSL_EMAIL")
fi

# Run deployment with verbose so you can see which task is running (helps find where it hangs)
if ansible-playbook -i inventory-temp.yml deploy.yml -v "${EXTRA_VARS[@]}"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    if [ -n "$SSL_ENABLED" ]; then
        echo -e "${GREEN}🌐 Your SetMeld Pod is available at: https://$BASE_URL${NC}"
    elif [ "$PORT" = "80" ]; then
        echo -e "${GREEN}🌐 Your SetMeld Pod is available at: http://$BASE_URL${NC}"
    else
        echo -e "${GREEN}🌐 Your SetMeld Pod is available at: http://$BASE_URL:$PORT${NC}"
    fi
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Clean up
rm inventory-temp.yml
