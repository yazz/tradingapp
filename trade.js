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
let date                = new Date("2020-01-01")
let startCashBalance    = 100000
let cashBalance         = startCashBalance
let shares              = 0
let sharesPrice         = 0
let sharesCost          = 0
let sharesValue         = 0
let sharesProfit        = 0
let sharesProfitPercent = 0
let currentPositions    = {}
let stockBalance        = 0
let totalBalance        = 0


function              uuidv4      (  ) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    console.log("Starting date: " + date)

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
                if ((price.stock_open > 0) && (cashBalance - price.stock_open) > 0) {
                    let stockBalance = 0
                    for (let stock in currentPositions) {
                        let stockPrice = await client.query("select * from source_yahoo_finance_daily_stock_data where symbol = $1 and stock_date = $2",
                            [stock   ,  date])
                        if (stockPrice.rowCount > 0) {
                            let price = stockPrice.rows[0]
                            let StockValue = price.stock_open * currentPositions[stock].shares
                            stockBalance = stockBalance + StockValue
                        }
                    }
                    totalBalance = cashBalance + stockBalance


                    if (currentPositions[RandomStock] == undefined) {
                        currentPositions[RandomStock] = {
                            symbol:     RandomStock,
                            shares:     0,
                            cost:       0
                        }
                    }
                    currentPositions[RandomStock].shares ++
                    currentPositions[RandomStock].cost += parseFloat(price.stock_open)
                    cashBalance -= parseInt(price.stock_open)
                    console.log(date.toDateString() + " BUY " + RandomStock + ": $" + price.stock_open + " ---- Cash $" + cashBalance + ", Stock $" + stockBalance + ", " + " = $" + totalBalance)
                }
            }
        }

        for (let stock in currentPositions) {
            console.log(stock   ,  date)
            let stockPrice = await client.query("select * from source_yahoo_finance_daily_stock_data where symbol = $1 and stock_date = $2",
                [stock   ,  date])
            if (stockPrice.rowCount > 0) {
                console.log(stock + ": " + currentPositions[stock].shares + " shares at $" + currentPositions[stock].cost.toFixed(4))
                let price = stockPrice.rows[0]
                let StockValue = price.stock_open * currentPositions[stock].shares

                if (StockValue > currentPositions[stock].shares) {
                    console.log(stock + " SELL for profit $" + StockValue - currentPositions[stock].cost)
                    currentPositions[stock].shares = 0
                    currentPositions[stock].cost = 0
                    cashBalance = cashBalance + StockValue
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
