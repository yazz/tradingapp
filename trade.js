//---------------------------------
// TRADING APP TRADING SIMULATION
//--------------------------------

const fs                = require('fs');
const { Client }        = require('pg');
let tr = require('./helpers.js')

const config            = JSON.parse(fs.readFileSync('config.json', 'utf8'));
let postgresConnected   = false
let stockList           = tr.data.stockList 
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


async function          main        (  ) {
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
                    let listOfPositions = await client.query("select * from trading_positions",[])

                    for (let position in listOfPositions) {
                        let stockPrice = await client.query("select * from source_yahoo_finance_daily_stock_data where symbol = $1 and stock_date = $2",
                            [position.stock_symbol   ,  date])
                        if (stockPrice.rowCount > 0) {
                            let price = stockPrice.rows[0]
                            let StockValue = price.stock_open * position.amount
                            stockBalance = stockBalance + StockValue
                        }
                    }
                    totalBalance = cashBalance + stockBalance


                    let position = await client.query("select * from trading_positions where stock_symbol = $1",
                        [RandomStock])
                    if (position.rowCount == 0) {
                        currentPositions[RandomStock] = {
                            symbol:     RandomStock,
                            shares:     0,
                            cost:       0
                        }
                        await client.query("insert into trading_positions (stock_symbol,cost_usd,amount) values ($1,$2,$3)",
                            [RandomStock,0,0])
                    }
                    if (currentPositions[RandomStock]) {
                        currentPositions[RandomStock].shares++
                        currentPositions[RandomStock].cost += parseFloat(price.stock_open)
                        cashBalance -= parseInt(price.stock_open)
                        console.log(date.toDateString() + " BUY " + RandomStock + ": $" + price.stock_open + " ---- Cash $" + cashBalance + ", Stock $" + stockBalance + ", " + " = $" + totalBalance)
                    }
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

(async function() {
    client = await tr.helpers.connectDb(config)
    try {
        await main()
    } catch(err){
        debugger
    }
    console.log('Trading done');
    process.exit(0)
})()
