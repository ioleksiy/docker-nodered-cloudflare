# docker-nodered-cloudflare

Docker Compose project that deploys Node-RED behind a Cloudflare Tunnel for secure remote access without exposing ports on the host machine.

## Features

- **Node-RED**: Low-code programming for event-driven applications
- **Cloudflare Tunnel**: Secure access without port forwarding or firewall configuration
- **Persistent Storage**: Node-RED flows and data persist across container restarts
- **Internal Network**: All services communicate through a private Docker network
- **No Exposed Ports**: No direct IP/port access from the host machine

## Prerequisites

1. A Cloudflare account with a domain
2. Cloudflare Zero Trust account (free tier available)
3. Docker and Docker Compose installed

## Setup Instructions

### 1. Create a Cloudflare Tunnel

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** > **Tunnels**
3. Click **Create a tunnel**
4. Choose **Cloudflared** as the connector
5. Give your tunnel a name (e.g., "nodered-tunnel")
6. Copy the tunnel token that's generated
7. Configure a public hostname:
   - **Public hostname**: Your desired subdomain (e.g., `nodered.yourdomain.com`)
   - **Service type**: HTTP
   - **URL**: `nodered:1880` (the internal Docker service name and port)

### 2. Deploy with Portainer

1. In Portainer, go to **Stacks** > **Add stack**
2. Choose **Git Repository**
3. Enter your repository URL: `https://github.com/yourusername/docker-nodered-cloudflare`
4. In the **Environment variables** section, add:
   ```
   STACK_NAME=nodered_production
   TUNNEL_TOKEN=your_actual_tunnel_token_here
   ```
   **Important**: Use a unique `STACK_NAME` for each stack deployment to avoid volume conflicts
5. Click **Deploy the stack**

### Multiple Stack Deployments

If you need to deploy multiple instances from this repository:

1. Each stack **must** have a unique `STACK_NAME` value
2. Each stack needs its own Cloudflare Tunnel token
3. Examples:
   ```
   Stack 1:
   STACK_NAME=nodered_production
   TUNNEL_TOKEN=token_for_prod
   
   Stack 2:
   STACK_NAME=nodered_development
   TUNNEL_TOKEN=token_for_dev
   
   Stack 3:
   STACK_NAME=nodered_testing
   TUNNEL_TOKEN=token_for_test
   ```

This ensures each deployment has:
- Separate persistent volumes (`nodered_production_data`, `nodered_development_data`, etc.)
- Unique container names (no conflicts)
- Isolated networks (`nodered_production_network`, `nodered_development_network`, etc.)
- Independent data storage

### 3. Access Node-RED

Once deployed, access Node-RED through your Cloudflare Tunnel URL:
- `https://nodered.yourdomain.com`

## Configuration

### Environment Variables

Set these in the Portainer stack interface:

- `STACK_NAME` (recommended): Unique identifier for this stack deployment (e.g., `nodered_production`, `nodered_dev`)
  - If not set, defaults to `nodered`
  - **Required when deploying multiple stacks to avoid conflicts**
- `TUNNEL_TOKEN` (required): Your Cloudflare Tunnel token

### Persistent Storage

Node-RED data is stored in the `nodered_data` Docker volume, which includes:
- Flow configurations
- Installed nodes
- Settings and credentials

This data persists even when containers are updated or reset.

### Network Security

Each stack creates its own isolated network (`${STACK_NAME}_network`) configured with:
- No ports exposed to the host
- Internal communication between containers within the same stack
- Outbound internet access allowed (for Node-RED to install packages, etc.)
- Complete isolation between different stack deployments

To completely isolate the network (no internet access), set `internal: true` in the docker-compose.yml network configuration.

## Useful Commands

### View logs
```bash
docker-compose logs -f
```

### Restart services
```bash
docker-compose restart
```

### Update containers
```bash
docker-compose pull
docker-compose up -d
```

### Backup Node-RED data
```bash
# Replace 'nodered_production' with your actual STACK_NAME
docker run --rm -v nodered_production_data:/data -v $(pwd):/backup alpine tar czf /backup/nodered-backup.tar.gz -C /data .
```

### Restore Node-RED data
```bash
# Replace 'nodered_production' with your actual STACK_NAME
docker run --rm -v nodered_production_data:/data -v $(pwd):/backup alpine tar xzf /backup/nodered-backup.tar.gz -C /data
```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs cloudflared`
- Verify TUNNEL_TOKEN is correctly set
- Ensure Cloudflare Tunnel is active in the dashboard

### Can't access Node-RED
- Verify the tunnel is running: `docker-compose ps`
- Check Cloudflare Tunnel status in the Zero Trust dashboard
- Ensure public hostname is correctly configured to point to `nodered:1880`

### Node-RED flows not persisting
- Check volume exists: `docker volume ls | grep <your_stack_name>`
- Verify volume mount: `docker-compose config`

### Managing Multiple Deployments
- List all volumes: `docker volume ls`
- Each stack's volume will be named: `<STACK_NAME>_data`
- To remove a specific deployment's data: `docker volume rm <STACK_NAME>_data`
- List all networks: `docker network ls`
- Each stack's network will be named: `<STACK_NAME>_network`

## Security Notes

- HTTPS is automatically handled by Cloudflare
- No local ports are exposed
- Access is controlled through Cloudflare Zero Trust
- Consider adding Cloudflare Access policies for additional authentication
- Keep Node-RED and Cloudflared images updated

## Additional Resources

- [Node-RED Documentation](https://nodered.org/docs/)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Free to use, modify, and fork by anyone!
