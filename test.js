const yahooFinance = require('yahoo-finance2').default;

async function getFOMCRate() {
    try {
        // Symbol for 13 Week Treasury Bill (^IRX)
        const symbol = '^IRX';
        const quote = await yahooFinance.quote(symbol);
        console.log(`Current FOMC-related rate for ${symbol}:`, quote);
    } catch (error) {
        console.error('Error fetching FOMC rate data:', error);
    }
}

getFOMCRate();