const   fs                  = require('fs');
const   { Client }          = require('pg');
const   ps                  = require('ps-node');
let     tr                  = require('./helpers.js')

const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let app = {
    vars: {
    },
    main:               async function  (  ) {
        let client = await tr.helpers.connectDb(config)
        console.log("System ended")
    }
}






app.main()