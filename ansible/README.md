# SetMeld Pod – Ansible deploy

Deploy SetMeld Pod (Nginx, Blazegraph, app) using Ansible. All configuration lives in the **inventory file**; there are no command-line flags.

## Usage

From the repo root:

```bash
./ansible/deploy.sh <inventory.yml>
```

Example:

```bash
./ansible/deploy.sh ansible/inventory/inventory-gcp.yml
```

## Inventory

Copy and edit an inventory file from `ansible/inventory/`. Each file defines hosts, connection settings, and deployment variables.

### Connection (required)

| Variable | Required | Description |
|----------|----------|-------------|
| `ansible_host` | Yes* | IP or hostname to SSH to (*unless the host key is the real hostname) |
| `ansible_user` | Yes | SSH user |
| `ansible_ssh_private_key_file` | No | Path to SSH key (default: `~/.ssh/id_rsa`) |

### Deployment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `base_url` | Yes | – | Domain or IP for nginx and CSS_BASE_URL (must match how users reach the pod) |
| `nginx_port` | No | 80 | HTTP port |
| `ssl_enabled` | No | false | Use Let's Encrypt for HTTPS |
| `ssl_email` | When ssl | – | Email for Let's Encrypt (required if `ssl_enabled: true`) |
| `pod_ready_timeout_seconds` | No | 600 | Wait time for port 3000 (increase for slow instances) |

### Example

```yaml
all:
  hosts:
    myserver:
      ansible_host: 192.168.1.100
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/id_rsa

      base_url: myserver.com
      nginx_port: 80
      ssl_enabled: true
      ssl_email: you@example.com

  vars:
    ansible_python_interpreter: /usr/bin/python3
    ansible_become: yes
    ansible_become_method: sudo
```

See `inventory/inventory-gcp.yml` and `inventory/inventory-uliege.yml` for full examples (including jump hosts).

## Prerequisites

- Ansible: `brew install ansible` (macOS) or `sudo apt install ansible` (Ubuntu)
- `.deb` package: run `npm run bundle` from the repo root before deploying

## What the playbook does

1. Installs the SetMeld Pod `.deb`
2. Installs Docker and runs Blazegraph (SPARQL triplestore on port 8889)
3. Installs and configures Nginx as reverse proxy to the app (port 3000)
4. Sets `config.env` (CSS_BASE_URL, CSS_SPARQL_ENDPOINT) and starts services

## Troubleshooting

- **Nginx shows default page** – Re-run the playbook or on the server: `sudo systemctl restart nginx`
- **SSH errors** – Check `ansible_host`, keys, and any proxy/jump settings in the inventory
- **Missing .deb** – Run `npm run bundle` from the repo root
- **Permission denied** – Ensure the Ansible user has sudo on the target host
- **Deployment fails at “Wait for ports” (port 3000)** – The pod can take 5–10 minutes on small instances. Add `pod_ready_timeout_seconds: 900` (or higher) in the inventory vars.
