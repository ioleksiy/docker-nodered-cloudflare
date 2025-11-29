/**
 * Node-RED Settings File
 * 
 * Place this file in your Node-RED data directory to configure authentication.
 * The data directory is mounted as a volume in the container at /data
 * 
 * To use this file:
 * 1. Generate a password hash by running in Node-RED container:
 *    docker exec -it <container_name> node-red admin hash-pw
 * 2. Copy the generated hash and paste it in the password field below
 * 3. Copy this file to your Node-RED data volume
 * 4. Restart the Node-RED service
 */

module.exports = {
    // Uncomment and configure the adminAuth section to enable password protection
    /*
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            password: "$2b$08$YOUR_HASHED_PASSWORD_HERE",
            permissions: "*"
        }]
    },
    */

    // You can add multiple users with different permissions
    /*
    adminAuth: {
        type: "credentials",
        users: [
            {
                username: "admin",
                password: "$2b$08$ADMIN_HASHED_PASSWORD",
                permissions: "*"
            },
            {
                username: "viewer",
                password: "$2b$08$VIEWER_HASHED_PASSWORD",
                permissions: "read"
            }
        ]
    },
    */

    // The title of the Node-RED editor
    editorTheme: {
        page: {
            title: "Node-RED"
        },
        header: {
            title: "Node-RED"
        }
    },

    // Uncomment to disable the editor
    // httpAdminRoot: false,

    // Uncomment to secure the HTTP nodes endpoints
    /*
    httpNodeAuth: {
        user: "user",
        pass: "$2b$08$YOUR_HASHED_PASSWORD_HERE"
    },
    */

    // Context storage configuration
    contextStorage: {
        default: {
            module: "localfilesystem"
        }
    },

    // Logging level: fatal, error, warn, info, debug, trace
    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    }
}
