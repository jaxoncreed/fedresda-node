# SetMeld Pod Ansible Deployment

Simple Ansible deployment for SetMeld Pod with Nginx and Blazegraph triplestore. CSS, triplestore, and reverse proxy.

## Quick Start

### 1. Install Ansible

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update && sudo apt install ansible
```

### 2. Deploy

```bash
# Basic deployment (port 80)
./deploy.sh user@myserver.com myserver.com

# Custom port
./deploy.sh user@myserver.com myserver.com 8080

# Using SSH alias from ~/.ssh/config
./deploy.sh sandbox myserver.com
```

## What It Does

1. **Installs SetMeld Pod** – Copies and installs the .deb package
2. **Installs Docker + Blazegraph** – Builds Blazegraph 2.1.6 RC (multi-arch) and runs it on port 8889; pod uses `http://127.0.0.1:8889/blazegraph/sparql` – SPARQL triplestore (port 8889) for pod data storage; Blazegraph uses a unified endpoint compatible with CSS (Oxigraph’s separate `/query` and `/update` causes 415 errors)
3. **Installs Nginx** – Reverse proxy
4. **Configures Nginx** – Proxies traffic to the app (port 3000)
5. **Sets config.env** – CSS_BASE_URL and CSS_SPARQL_ENDPOINT
6. **Starts services** – Triplestore, app, and Nginx

## Manual Ansible

```bash
ansible-playbook -i inventory.yml deploy.yml

# With custom variables
ansible-playbook -i inventory.yml deploy.yml \
  -e "base_url=myserver.com" \
  -e "nginx_port=8080"
```

## Inventory

Edit `inventory.yml`:

```yaml
all:
  hosts:
    myserver:
      ansible_host: 192.168.1.100
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/id_rsa
      base_url: myserver.com
      nginx_port: 80
```

## HTTPS (Let's Encrypt)

Use the **`--ssl`** flag to configure HTTPS with Certbot (Let's Encrypt). You must provide an email for expiry notices and use a **domain name** (not an IP); the domain must point to the server. Port 80 is used for the ACME challenge.

```bash
./deploy.sh --ssl --ssl-email you@example.com user@myserver.com myserver.com
```

Without `--ssl`, the playbook configures HTTP only.

## Troubleshooting

- **"Welcome to nginx!" instead of the pod** – Re-run the playbook so nginx restarts with the SetMeld config, or on the server run `sudo systemctl restart nginx`.
- **SSH failed** – Check key permissions, server reachability
- **Package missing** – Run `npm run bundle` first to build the .deb
- **Permission denied** – Ensure user has sudo access
