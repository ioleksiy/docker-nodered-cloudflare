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
3. Docker Swarm initialized (Portainer handles this automatically)
4. Portainer installed

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
2. Give your stack a **unique name** (e.g., `nodered-production`, `nodered-dev`, `nodered-test`)
   - This stack name will automatically prefix all volumes and networks
3. Choose **Git Repository**
4. Enter your repository URL: `https://github.com/ioleksiy/docker-nodered-cloudflare`
5. In the **Environment variables** section, add:
   ```
   TUNNEL_TOKEN=your_actual_tunnel_token_here
   ```
6. Click **Deploy the stack**

**Note**: Portainer deploys stacks using Docker Swarm mode, which provides automatic service discovery and load balancing.

### Multiple Stack Deployments

To deploy multiple instances from this repository:

1. Each Portainer stack **must** have a unique name
2. Each stack needs its own Cloudflare Tunnel token
3. Examples:
   ```
   Stack Name: nodered-production
   TUNNEL_TOKEN=token_for_prod
   
   Stack Name: nodered-development
   TUNNEL_TOKEN=token_for_dev
   
   Stack Name: nodered-testing
   TUNNEL_TOKEN=token_for_test
   ```

Portainer automatically ensures each deployment has:
- Separate persistent volumes (prefixed with stack name: `nodered-production_nodered_data`, etc.)
- Isolated overlay networks (prefixed with stack name: `nodered-production_internal_network`, etc.)
- Independent service instances
- Complete isolation between deployments

### 3. Access Node-RED

Once deployed, access Node-RED through your Cloudflare Tunnel URL:
- `https://nodered.yourdomain.com`

## Configuration

### Environment Variables

Set these in the Portainer stack interface:

- `TUNNEL_TOKEN` (required): Your Cloudflare Tunnel token
- `NODE_RED_CREDENTIAL_SECRET` (optional): Secret key for encrypting credentials in flows
  - If not set, a default will be used
  - Use a strong random string for production

Note: Volumes and networks are automatically prefixed by Portainer using the stack name you provide in the UI.

### Securing Node-RED with Password

Node-RED doesn't use environment variables for user authentication. To add password protection:

**Method 1: Using the Node-RED Admin Tool (Recommended)**

1. After deploying, get shell access to the Node-RED container via Portainer:
   - Go to **Containers** > find your Node-RED container > click **Console**
   - Or use: `docker exec -it <container_name> /bin/sh`

2. Generate a password hash:
   ```bash
   node-red admin hash-pw
   ```
   Enter your desired password when prompted and copy the generated hash.

3. Edit the settings file in the container or on your host:
   ```bash
   vi /data/settings.js
   ```

4. Add the authentication configuration:
   ```javascript
   adminAuth: {
       type: "credentials",
       users: [{
           username: "admin",
           password: "$2b$08$YOUR_GENERATED_HASH",
           permissions: "*"
       }]
   }
   ```

5. Restart the Node-RED service in Portainer

**Method 2: Pre-configure Settings File**

1. Before deploying, create a `settings.js` file with your configuration
2. Use the example `settings.js` provided in this repository
3. Generate password hash locally (requires Node.js):
   ```bash
   npx node-red admin hash-pw
   ```
4. Mount the settings file by adding to docker-compose.yml:
   ```yaml
   volumes:
     - nodered_data:/data
     - ./settings.js:/data/settings.js
   ```

See the included `settings.js` file for a complete example with comments.

### Multiple Users

You can configure multiple users with different permission levels:
- `*` - Full access (admin)
- `read` - Read-only access (viewer)

Example:
```javascript
adminAuth: {
    type: "credentials",
    users: [
        {
            username: "admin",
            password: "$2b$08$ADMIN_HASH",
            permissions: "*"
        },
        {
            username: "viewer",
            password: "$2b$08$VIEWER_HASH",
            permissions: "read"
        }
    ]
}
```

### Persistent Storage

Node-RED data is stored in the `nodered_data` Docker volume, which includes:
- Flow configurations
- Installed nodes
- Settings and credentials

This data persists even when containers are updated or reset.

### Network Security

Each stack creates its own isolated overlay network (automatically prefixed by Portainer) configured with:
- No ports exposed to the host
- Internal communication between services within the same stack
- Outbound internet access allowed (for Node-RED to install packages, etc.)
- Complete isolation between different stack deployments
- Swarm-scoped networking for service discovery

To completely isolate the network (no internet access), set `internal: true` in the docker-compose.yml network configuration.

## Useful Commands

### View logs (Docker Swarm)
```bash
# List services
docker service ls

# View service logs
docker service logs <stack_name>_nodered
docker service logs <stack_name>_cloudflared
```

### Scale services
```bash
# Scale Node-RED (usually keep at 1 for stateful apps)
docker service scale <stack_name>_nodered=1
```

### Update services
```bash
# Update to latest images
docker service update --image nodered/node-red:latest <stack_name>_nodered
docker service update --image cloudflare/cloudflared:latest <stack_name>_cloudflared
```

### Backup Node-RED data
```bash
# Replace 'nodered-production' with your actual Portainer stack name
docker run --rm -v nodered-production_nodered_data:/data -v $(pwd):/backup alpine tar czf /backup/nodered-backup.tar.gz -C /data .
```

### Restore Node-RED data
```bash
# Replace 'nodered-production' with your actual Portainer stack name
docker run --rm -v nodered-production_nodered_data:/data -v $(pwd):/backup alpine tar xzf /backup/nodered-backup.tar.gz -C /data
```

## Troubleshooting

### Service won't start
- Check logs: `docker service logs <stack_name>_cloudflared`
- Verify TUNNEL_TOKEN is correctly set
- Ensure Cloudflare Tunnel is active in the dashboard
- Check service status: `docker service ps <stack_name>_nodered`

### Can't access Node-RED
- Verify the services are running: `docker service ls`
- Check Cloudflare Tunnel status in the Zero Trust dashboard
- Ensure public hostname is correctly configured to point to `nodered:1880`
- Check service tasks: `docker service ps <stack_name>_cloudflared`

### Node-RED flows not persisting
- Check volume exists: `docker volume ls | grep <your_portainer_stack_name>`
- Verify volume is mounted: Check in Portainer UI under the stack's volumes tab
- Volumes in Docker Swarm persist across service updates

### Managing Multiple Deployments
- List all volumes: `docker volume ls`
- Each stack's volume will be named: `<portainer_stack_name>_nodered_data`
- To remove a specific deployment's data: `docker volume rm <portainer_stack_name>_nodered_data`
- List all networks: `docker network ls`
- Each stack's network will be named: `<portainer_stack_name>_internal_network`

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
