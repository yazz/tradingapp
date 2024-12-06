const   fs                                      = require('fs');
const   { Client }                              = require('pg');
let     tr                                      = require('./helpers.js')
let     cookieParser                            = require('cookie-parser')
let     uuidv1                                  = require('uuid').v1;
const   { Worker, isMainThread, parentPort }    = require('worker_threads');
const   express                                 = require('express')
const   path                                    = require('path')

const app                   = express()
const port                  = 3000
const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let tas = {
    vars:       {
        dbConnection:           null,
        processes:              {
            getprices:              {processHandle: null, status: null, fileName: "get_prices.js"   , runOnStartup: true},
            dotrades:               {processHandle: null, status: null, fileName: "trade.js"        , runOnStartup: true}
        },
        debugMode:              null
    },
    processes:  {
        startAllProcesses:          async function (  tas  )    {
            let listOfProcesses = Object.keys(tas.vars.processes)
            //debugger
            for (let processItemName of listOfProcesses) {
                let processItem = tas.vars.processes[processItemName]
                if (processItem.runOnStartup) {
                    let processPath = path.join(__dirname, '/' + processItem.fileName )
                    processItem.processHandle = new Worker(
                        processPath,
                    );
                    processItem.status = "STARTED"
                }
            }
        },
        runGetPricesChildProcess:   async function (  tas  )    {
            let getPricesPath = path.join(__dirname, '/get_prices.js')
            /*tas.vars.processes.getprices = fork.fork(
                getPricesPath,
                [],
                {
                    execArgv: [],
                    env: {}
                });*/

            tas.vars.processes.getprices.processHandle = new Worker(
                getPricesPath,
                );
            /*forkedProcesses[exeProcName].send({  message_type:          "init" ,
                user_data_path:        userData,
                child_process_name:    exeProcName,
                show_debug:            showDebug,
                show_progress:         showProgress,
                yazz_instance_id:      yazzInstanceId,
                jaeger_collector:      jaegercollector,
                env_vars:              envVars
            });

            forkedProcesses[processName].on('close', async function() {*/
        },
        isMainServerRunning:        async function (  )         {
            try {
                let ret = await tr.helpers.execCommand("ps aux | grep -i zalgo_server | grep -v grep")
                return true
            } catch (err) {
                return false
            }
        },
        killMainServer:             async function (  )         {
            try {
                let ret = await tr.helpers.execCommand("pkill -9 -f zalgo_server ")
                console.log("server killed")
            } catch (err) {
                console.log("Could not kill server")
            }
        },
        startMainServer:            async function (  )         {
            try {
                if (await tas.processes.isMainServerRunning()) {
                    console.log("server already running")
                } else {
                    let ret = await tr.helpers.execCommand("./zalgo_server")
                    console.log("server started: " + ret)
                }
            } catch (err) {
                console.log("Could not start server")
            }
        }
    },
    server:     {
        createCookieInDb:   async function                              (  cookie )     {
            //stmtInsertCookie.run(uuidv1(),timestampNow,"yazz",cookie,newSessionid, hostCookieSentTo, from_device_type)
            await tas.vars.dbConnection.query("insert into   cookies  (cookie_name, cookie_value)  values  ($1,$2)",
                ["tradingapp",cookie])
        },
        getCookieRecord:    async function                              (  cookie  )    {
            let res = await tas.vars.dbConnection.query("select * from cookies  where cookie_value = $1",
                [cookie])
            if (res.rows.length > 0) {
                return res.rows[0]
            }
            return null
        },
        setUserLoggedIn:    async function                              (  cookie  )    {
            await tas.vars.dbConnection.query("update cookies set logged_in = $1 where cookie_value = $2",
                ["TRUE",cookie])
        },
        browserRequests:    {
            loginRequest:               async function (req, res, next) {
                let cookie = req.cookies.tradingapp;

                let enteredPassword    = req.query.password
                console.log("enteredPassword: " + enteredPassword)
                let actualPassword = config.web.website_password

                let retVal = {}
                if (enteredPassword == actualPassword) {
                    retVal.loggedIn = true
                    await tas.server.setUserLoggedIn(cookie)
                } else {
                    retVal.error = "Invalid password"
                }

                //let listOfHashes = await yz.getReleasedHashesAfterTimestamp( dbsearch  ,  maxMasterMillis )
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(retVal));
            },
            initSettingsRequest:        async function (req, res, next) {
                let cookie = req.cookies.tradingapp;
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: "ok" , value: {debug: tas.vars.debugMode} }));
            },
            getPricesRequest:           async function (req, res, next) {
                let cookie = req.cookies.tradingapp;
                await tas.processes.runGetPricesChildProcess(tas)

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: "ok"}));
            },
            getProcessStatuses:         async function (req, res, next) {
                let cookie = req.cookies.tradingapp;
                let processes = []
                for (let processName of Object.keys(tas.vars.processes)) {
                    let process = tas.vars.processes[processName]
                    processes.push({
                        name:   process.fileName,
                        status:  process.status
                    })
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: "ok", value: processes}));
            }
        },
        setHttpHeader:      async function                              (req, res, next)    {
            console.log("In app.use(async function (req, res, next) {")
            let oneof = false;
            if(req.headers.origin) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                oneof = true;
            }
            if(req.headers['access-control-request-method']) {
                res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
                oneof = true;
            }
            if(req.headers['access-control-request-headers']) {
                res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
                oneof = true;
            }
            if(oneof) {
                res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
            }


            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);


            let userAgentString = req.headers['user-agent']
            let hostCookieSentTo = req.host
            let cookie = req.cookies.tradingapp;


            let from_device_type = userAgentString
            if (typeof userAgentString  !== 'undefined') {
                console.log("Browser cookie := " + cookie)
                if (cookie === undefined) {
                    // no: set a new cookie
                    let randomNumber =  uuidv1()
                    res.cookie('tradingapp',randomNumber, { maxAge: 900000, httpOnly: false });
                    await tas.server.createCookieInDb(randomNumber)
                    //console.log('cookie created successfully');


                } else {
                    // yes, cookie was already present
                    console.log('cookie exists', cookie);

                    //
                    // check if cookie exists in the DB. If not then set a new cookie
                    //
                    let cookieRecord = await tas.server.getCookieRecord(cookie)
                    if (cookieRecord == null) {
                        let randomNumber =  uuidv1()
                        res.cookie('tradingapp',randomNumber, { maxAge: 900000, httpOnly: false });
                        await tas.server.createCookieInDb(randomNumber)
                        console.log('No cookie found in Trading app DB, cookie created successfully');
                    }
                }
            }



            // Pass to next layer of middleware
            next();
        }
    },
    main:               async function  (  ) {
        let tas = this
        tas.vars.dbConnection = await tr.helpers.connectDb(config)
        if (config.system) {
            tas.vars.debugMode = config.system.debug
        }

        app.use(cookieParser());
        app.use(tas.server.setHttpHeader);

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })

        console.log(path.join(__dirname, '/trading_app.html'))
        app.use("/a",express.static(path.join(__dirname, '/trading_app.html')));
        app.use('/js', express.static(path.join(__dirname, 'js')));

        app.get(    '/login',                 tas.server.browserRequests.loginRequest)
        app.get(    '/get_init_settings',     tas.server.browserRequests.initSettingsRequest)
        app.get(    '/run_get_prices',        tas.server.browserRequests.getPricesRequest)
        app.get(    '/get_process_statuses',  tas.server.browserRequests.getProcessStatuses)



        await tas.processes.startAllProcesses(  tas  )
    }
}

tas.main()