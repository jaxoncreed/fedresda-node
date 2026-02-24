#!/bin/bash

# SetMeld Pod deployment – all configuration via inventory file.
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 SetMeld Pod Deployment${NC}"

INVENTORY=

while [[ $# -gt 0 ]]; do
    case $1 in
        -*)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            if [ -n "$INVENTORY" ]; then
                echo -e "${RED}❌ Single inventory file required. Found: $INVENTORY and $1${NC}"
                exit 1
            fi
            INVENTORY="$1"
            shift
            ;;
    esac
done

if [ -z "$INVENTORY" ]; then
    echo "Usage: $0 <inventory.yml>"
    echo ""
    echo "  <inventory.yml>   Path to Ansible inventory (required)."
    echo "                   All deployment options (base_url, nginx_port, ssl_enabled, etc.)"
    echo "                   are set in the inventory file."
    echo ""
    echo "Example:"
    echo "  $0 ansible/inventory/inventory-gcp.yml"
    exit 1
fi

if [ ! -f "$INVENTORY" ]; then
    echo -e "${RED}❌ Inventory file not found: $INVENTORY${NC}"
    exit 1
fi

# Resolve inventory to absolute path so we can cd to script dir and still find it
if [[ "$INVENTORY" != /* ]]; then
    INVENTORY="$(cd "$(dirname "$INVENTORY")" 2>/dev/null && pwd)/$(basename "$INVENTORY")"
fi
# Run from ansible dir so deploy.yml and ../bundle resolve correctly
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📂 Inventory: $INVENTORY${NC}"

# Use OVH the-bastion-ansible-wrapper when the inventory defines bastion_* variables
if grep -qE 'bastion_host|bastion_user|bastion_port' "$INVENTORY" 2>/dev/null; then
    if [ -f "$SCRIPT_DIR/ansible-bastion.cfg" ]; then
        export ANSIBLE_CONFIG="$SCRIPT_DIR/ansible-bastion.cfg"
        export BASTION_ANSIBLE_INV_OPTIONS="-i $INVENTORY"
        echo -e "${BLUE}🔐 Using bastion wrapper (ansible-bastion.cfg)${NC}"
    else
        echo -e "${RED}❌ Inventory has bastion_* vars but ansible-bastion.cfg not found.${NC}"
        exit 1
    fi
fi

if ! command -v ansible-playbook &> /dev/null; then
    echo -e "${RED}❌ Ansible not found. Install with: brew install ansible  (macOS) or sudo apt install ansible  (Ubuntu)${NC}"
    exit 1
fi

echo -e "${BLUE}📜 Running deployment...${NC}"
echo "   (-vv shows connection/setup activity; -vvv adds SSH-level debug)"
echo ""

if ansible-playbook -i "$INVENTORY" deploy.yml -vv; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}   Access URL is in your inventory (base_url, nginx_port, ssl_enabled).${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
