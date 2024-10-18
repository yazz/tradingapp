//---------------------------------
// TRADING APP TRADING SIMULATION
//---------------------
const fs                = require('fs');
const { Client }        = require('pg');
const config            = JSON.parse(fs.readFileSync('config.json', 'utf8'));
let postgresConnected   = false
let stockList           = [ "BEN", "O", "TROW", "AMCR", "CVX", "FRT", "KVUE", "SJM", "HRL", "KMB", "IBM", "ESS", "ADM", "ED", "SWK", "XOM", "CLX", 
                            "ABBV", "MDT", "PEP", "JNJ", "TGT", "GPC", "KO", "SYY", "NEE", "APD",
                            "ATO",  "CINF", "CHRW", "ITW", "PG", "MCD", "PPG", "MMM", "MKC", "ADP", "EMR", "ABT", "GD", "BF.B", 
                            "CL", "AFL", "CAH", "LOW", "ALB", "BDX", "CAT", "AOS", "NUE", "CB", "NDSN", "EXPD", "LIN", "DOV", "CHD", 
                            "WMT", "PNR", "ECL", "GWW", "SHW", "CTAS", "SPGI", "ROP", "BRO", "WST" ]
let prices
let client              = null


function              uuidv4      (  ) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    let date = new Date("2020-01-01")
    console.log(date)

    let startBalance = 100000
    let balance = startBalance
    let shares = 0
    let sharesPrice = 0
    let sharesCost = 0
    let sharesValue = 0
    let sharesProfit = 0
    let sharesProfitPercent = 0
    
    while (date < new Date("2024-01-01")) {
        console.log(date)
        date.setDate(date.getDate() + 1)
    }
}
    



// Define the connection details

async function connectDb() {
    let promise = new Promise((resolve, reject) => {
        client = new Client({
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
            resolve()
        });
    });
    return promise
}   

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }
  



(async function() {
    await connectDb()
    await main()
    console.log('Trading done');
    process.exit(0)
})()
