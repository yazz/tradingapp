//--------------------
// TRADING APP 
//--------------------


let tr                  = require('./helpers.js')
const fs                = require('fs');
const { Client }        = require('pg');
const yahooFinance      = require('yahoo-finance2').default;
const config            = JSON.parse(fs.readFileSync('config.json', 'utf8'));
let postgresConnected   = false
let stockList           = tr.data.stockList
let prices
let client              = null



async function main() {
    for (let stock of stockList) {
        try {
            prices = await tr.trade.getHistoricalStockPrices(stock, '2000-9-01', '2024-9-7');
            for (let price of prices) {
                try {
                    let stock_date = price.stock_date
                    console.log(stock + ": " + JSON.stringify(price));
                    while (!postgresConnected) {
                        console.log("waiting for postgres (disconnected)")
                        await delay(10000);  // Waits for 20 seconds (20000 milliseconds)
                        await connectDb()
        
                    }
                    console.error('1');
                    const memoryUsage = process.memoryUsage();

                    console.log('Memory Usage:');
                    console.log(`- RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
                    console.log(`- Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
                    console.log(`- Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
                    console.log(`- External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);

                    let exists = await client.query("select  id  from  source_yahoo_finance_daily_stock_data  where  symbol = $1  and stock_date = $2",
                        [stock,price.date])
                        console.error('2');
                        if (exists.rowCount == 0) {
                            console.error('3');
                            await client.query("insert into source_yahoo_finance_daily_stock_data (id,symbol,stock_date,stock_adj_close,stock_volume,stock_open,stock_close,stock_high,stock_low) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                            [tr.helpers.uuidv4(),stock,price.date, price.adjClose, price.volume, price.open, price.close,  price.high, price.low])
                            console.error('4');
                        }
                    
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error(error);
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
    console.log('Connected to PostgreSQL');
})()
