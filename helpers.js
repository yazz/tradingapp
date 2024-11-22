const fs                = require('fs');
const { Client }        = require('pg');
const yahooFinance      = require('yahoo-finance2').default;
const { exec }          = require('child_process');

module.exports = {
    data: {
        stockList: [ "BTC-USD", "ADA-USD" , "ETH-USD" , "DOT-USD" , "SOL-USD" ,
            "BEN", "O", "TROW", "AMCR", "CVX", "FRT", "KVUE", "SJM", "HRL", "KMB", "IBM", "ESS", "ADM", "ED", "SWK", "XOM", "CLX", 
            "ABBV", "MDT", "PEP", "JNJ", "TGT", "GPC", "KO", "SYY", "NEE", "APD",
            "ATO",  "CINF", "CHRW", "ITW", "PG", "MCD", "PPG", "MMM", "MKC", "ADP", "EMR", "ABT", "GD", "BF.B", 
            "CL", "AFL", "CAH", "LOW", "ALB", "BDX", "CAT", "AOS", "NUE", "CB", "NDSN", "EXPD", "LIN", "DOV", "CHD", 
            "WMT", "PNR", "ECL", "GWW", "SHW", "CTAS", "SPGI", "ROP", "BRO", "WST" ]
    },
    trade: {
        getHistoricalStockPrices: async function (symbol, startDate, endDate) {
            try {
                // Fetch historical prices
                const queryOptions = { period1: startDate, period2: endDate };  // Dates in YYYY-MM-DD format
                const result = await yahooFinance.historical(symbol, queryOptions);
        
                return result;
            } catch (error) {
                console.error(error);
            }
        }
    },
    helpers: {
        delay: function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },  
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
                        client.on('error', (err) => {
                            console.error('Lost connection to PostgreSQL:', err.stack);
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
        ,
        uuidv4: function                    (  ) {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        convertToArrayOfArrays: function (data) {
            if (data.length === 0) return [];
        
            // Extract headers from the keys of the first object
            const headers = Object.keys(data[0]);
            const result = [headers];
        
            // Loop through each object to get the values
            for (const obj of data) {
                const row = headers.map(header => obj[header]);
                result.push(row);
            }
        
            return result;
        },
        execCommand: async function (command) {

            let ret = new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(`Error: ${stderr || error.message}`);
                        return;
                    }
                    resolve(stdout.trim());  // Remove trailing newlines or spaces
                });
            });
            let rv = await ret
            return rv
        }
    }
}