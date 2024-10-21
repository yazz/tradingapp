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

    let startCashBalance = 100000
    let cashBalance = startCashBalance
    let shares = 0
    let sharesPrice = 0
    let sharesCost = 0
    let sharesValue = 0
    let sharesProfit = 0
    let sharesProfitPercent = 0

    let currentPositions = {}
    
    while (date < new Date("2024-01-01")) {
        date.setDate(date.getDate() + 1)
        let chooseStockRandomly = Math.floor(Math.random() * stockList.length)
        if (cashBalance > 0) {
            let RandomStock = stockList[chooseStockRandomly]
            let stockPrice = await client.query("select * from source_yahoo_finance_daily_stock_data where symbol = $1 and stock_date = $2",
                                [RandomStock   ,  date])
            if (stockPrice.rowCount == 0) {
                //console.log("No data for " + RandomStock + " on " + date)
                continue
            } else {
                let price = stockPrice.rows[0]
                if (cashBalance - price.stock_open > 0) {
                        if (currentPositions[RandomStock] == undefined) {
                        currentPositions[RandomStock] = {
                            shares: 0,
                            cost: 0
                        }
                    } else {
                        currentPositions[RandomStock].shares ++
                        currentPositions[RandomStock].cost += price.stock_open
                        cashBalance -= price.stock_open
                    }
                    console.log(date.toDateString() + " " + RandomStock + ": $" + price.stock_open + " ---- " + cashBalance)
                }
            }
        }
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
