//--------------------
// TRADING APP 
//--------------------


let tr                  = require('./helpers.js')
const fs                = require('fs');
const { Client }        = require('pg');
const yahooFinance      = require('yahoo-finance2').default;
const config            = JSON.parse(fs.readFileSync('config.json', 'utf8'));
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
    





  



(async function() {
    client = await   tr.helpers.connectDb(config)
    await main()
    console.log('Connected to PostgreSQL');
})()
