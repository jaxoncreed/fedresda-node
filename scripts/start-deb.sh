#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing SetMeld Pod .deb package in Docker"

# Find the .deb file in bundle directory
DEB_FILE=$(find ./bundle -name "setmeld-pod_*arm64.deb" | head -1)

if [[ ! -f "$DEB_FILE" ]]; then
    echo "❌ No .deb file found. Run 'npm run bundle' first."
    exit 1
fi

echo "📦 Found package: $DEB_FILE"

# Clean up any existing test containers and images
echo "🧹 Cleaning up any existing test containers..."
docker rm -f setmeld-pod-test-container setmeld-blazegraph-test 2>/dev/null || true
docker rmi setmeld-pod-test setmeld-blazegraph-test 2>/dev/null || true

# Create a Dockerfile for testing
cat > Dockerfile.test << 'DOCKERFILE'
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    container=docker

# Minimal systemd
RUN apt-get update && apt-get install -y --no-install-recommends systemd systemd-sysv dbus && \
    rm -rf /var/lib/apt/lists/*

# Install your package
COPY bundle/setmeld-pod_*_arm64.deb /tmp/pkg.deb
RUN apt-get update && apt-get install -y /tmp/pkg.deb && \
    rm -rf /var/lib/apt/lists/* /tmp/pkg.deb

# Configure pod to use Blazegraph (sidecar hostname 'blazegraph'; 2.1.6 RC uses port 9999 and path /blazegraph/)
RUN sed -i 's|^CSS_SPARQL_ENDPOINT=.*|CSS_SPARQL_ENDPOINT=http://blazegraph:9999/blazegraph/sparql|' /etc/setmeld-pod/config.env || \
    echo 'CSS_SPARQL_ENDPOINT=http://blazegraph:9999/blazegraph/sparql' >> /etc/setmeld-pod/config.env

# Ensure journald can persist and forward to console (so `docker logs` works)
RUN mkdir -p /var/log/journal && \
    sed -i 's/^#\?Storage=.*/Storage=persistent/' /etc/systemd/journald.conf && \
    sed -i 's/^#\?ForwardToConsole=.*/ForwardToConsole=yes/' /etc/systemd/journald.conf

# Enable setmeld-pod target at boot
RUN ln -sf /lib/systemd/system/setmeld-pod.target \
           /etc/systemd/system/multi-user.target.wants/setmeld-pod.target

EXPOSE 3000
STOPSIGNAL SIGRTMIN+3
ENTRYPOINT ["/sbin/init"]
DOCKERFILE

# Create docker-compose for pod + Blazegraph (use built image for native arm64/amd64)
cat > docker-compose.test.yml << 'COMPOSE'
services:
  blazegraph:
    image: setmeld-blazegraph-test
    container_name: setmeld-blazegraph-test
    ports:
      - "8889:9999"

  pod:
    build:
      context: .
      dockerfile: Dockerfile.test
    image: setmeld-pod-test
    container_name: setmeld-pod-test-container
    privileged: true
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    ports:
      - "3000:3000"
    depends_on:
      - blazegraph
COMPOSE

echo "Building Blazegraph (native for this platform)..."
docker build -f scripts/Dockerfile.blazegraph.test -t setmeld-blazegraph-test .

echo "Building pod image..."
docker build -f Dockerfile.test -t setmeld-pod-test .

echo "Starting Blazegraph and pod..."
docker-compose -f docker-compose.test.yml up -d

# Wait for Blazegraph (Java) to be ready before starting the pod
echo "⏳ Waiting for Blazegraph to be ready (may take 30–60s)..."
BLAZEGRAPH_URL="http://127.0.0.1:8889/blazegraph/sparql"
sleep 10
for i in $(seq 1 75); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$BLAZEGRAPH_URL" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^[0-9]{3}$ ]]; then
    echo "Blazegraph is ready (HTTP $code)."
    break
  fi
  if [[ $i -eq 75 ]]; then
    echo "⚠️ Blazegraph did not become ready in time; starting pod anyway."
  elif [[ $((i % 10)) -eq 0 ]]; then
    echo "  ... still waiting (${i}/75)"
  fi
  sleep 2
done

# Wait a moment for systemd to fully boot up in the pod container
echo "⏳ Waiting for systemd to boot up..."
sleep 5

# Start the setmeld-pod target inside the pod container
echo "🚀 Starting setmeld-pod.target..."
docker exec setmeld-pod-test-container systemctl start setmeld-pod.target

# Cleanup on Ctrl+C
trap 'echo; echo "🧹 Cleaning up..."; \
      docker-compose -f docker-compose.test.yml down 2>/dev/null || true; \
      docker rm -f setmeld-pod-test-container setmeld-blazegraph-test 2>/dev/null || true; \
      docker rmi setmeld-pod-test setmeld-blazegraph-test 2>/dev/null || true; \
      rm -f Dockerfile.test docker-compose.test.yml; \
      echo "✅ Test completed!"; exit 0' INT

# Follow logs from the pod container
docker logs -f setmeld-pod-test-container
