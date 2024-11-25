const   fs                  = require('fs');
const   { Client }          = require('pg');
const   ps                  = require('ps-node');
let     tr                  = require('./helpers.js')

const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let app = {
    vars: {
        processes: [],//["process_get_prices", "process_trade"],
        dbConnection:           null
    },
    createInitialProcessesInTable: async function() {
        for (let processName of app.vars.processes) {
            console.log(processName)
            let returnResults = await app.vars.dbConnection.query("select * from  node_processes where process_name = $1", [processName])
            if (returnResults.rows.length == 0 ) {
                await app.vars.dbConnection.query("insert into node_processes (process_name,process_status) values ($1,$2)",
                    [processName,"CREATED"])
            }
        }
    },
    main:               async function  (  ) {
        app.vars.dbConnection = await tr.helpers.connectDb(config)
        await app.createInitialProcessesInTable()
        console.log("System ended")
    }
}






app.main()