const fs                = require('fs');
const { Client }        = require('pg');

module.exports = {
    helpers: {
        getDemoText: function() {
            return "Some demo text"
        },
        connectDb: async function             (  config  ) {
            let client = null
            let promise = new Promise((resolve, reject) => {
                let client = new Client({
                    user: config.postgres.user,     // PostgreSQL username
                    host: config.postgres.host,         // Server hosting the PostgreSQL database
                    database: config.postgres.database, // Database name
                    password: config.postgres.password, // Password for the PostgreSQL user
                    port: parseInt(config.postgres.port),                // PostgreSQL port (default is 5432)
                });
                client.connect()
                    .then(async function() {
                        console.log('Connected to PostgreSQL');
                        postgresConnected = true
                        client.on('error', (err) => {
                            console.error('Lost connection to PostgreSQL:', err.stack);
                            postgresConnected = false
                            // Optionally, try reconnecting or take other actions
                        });
                    })
                    .then(result => {
                    })
                    .catch(err => {
                        console.error('Error connecting to PostgreSQL or running query:', err);
                        process.exit(1)
                    })
                    .finally(() => {
                        // Close the connection
                        //client.end();
                        resolve(client)
                    });
            });
            client = await promise
            return client
        }
        
    }
}
