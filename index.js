const   fs                                      = require('fs');
const   { Client }                              = require('pg');
const   ps                                      = require('ps-node');
let     tr                                      = require('./helpers.js')
var     blessed                                 = require('blessed');
let     cookieParser                            = require('cookie-parser')
let     uuidv1                                  = require('uuid').v1;
let     fork                                    = require('node:child_process');
const   { Worker, isMainThread, parentPort }    = require('worker_threads');
const   express                                 = require('express')
const   path                                    = require('path')

const app                   = express()
const port                  = 3000
const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let tas = {
    vars:       {
        screen:                 null,
        uiTableOfNames:         null,
        uiPaneTop:              null,
        uiPaneLeftMenu:         null,
        uiPaneMain:             null,
        uiMode:                 {},
        dbConnection:           null,
        processes:              {
            //getprices:              {processHandle: null, status: null, fileName: "get_prices.js"},
            //dotrades:               {processHandle: null, status: null, fileName: "trade.js"}
        },
        debugMode:              null
    },
    panes:      {
        createHomePane: async function() {
            tas.vars.uiTableOfNames = blessed.listtable({
                parent: tas.vars.uiPaneMain,
                top: 'center',
                left: 'center',
                width: '80%',
                height: '50%',
                border: {type: 'line'},
                align: 'center', // Align text in the cells
                style: {
                    header: {fg: 'blue', bold: true},
                    cell: {fg: 'white', selected: {bg: 'blue'}},
                },
                keys: true, // Allows navigation using arrow keys
                mouse: true, // Allows interaction using the mouse
                data: [
                    ['ID', 'Name', 'Country'], // Headers
                    ['1', 'John Doe', 'USA'],  // Row 1
                    ['2', 'Jane Smith', 'Canada'], // Row 2
                    ['3', 'Foo Bar', 'UK'],    // Row 3
                ],
            });
            //processes = await tas.listNodeProcesses()
            //table.setData(tr.helpers.convertToArrayOfArrays(processes))
        },
        createProcessesPane: async function() {
            let returnResults = await tas.vars.dbConnection.query("select * from  node_processes")

            tas.vars.uiTableOfNames = blessed.listtable({
                parent: tas.vars.uiPaneMain,
                top: 'center',
                left: 'center',
                width: '80%',
                height: '50%',
                border: {type: 'line'},
                align: 'center', // Align text in the cells
                style: {
                    header: {fg: 'blue', bold: true},
                    cell: {fg: 'white', selected: {bg: 'blue'}},
                },
                keys: true, // Allows navigation using arrow keys
                mouse: true, // Allows interaction using the mouse
                data: [
                ],
            });
            //console.log(returnResults.rows)
            let uiDContent = tr.helpers.convertToArrayOfArrays(returnResults.rows)
            //console.log(uiDContent)
            tas.vars.uiTableOfNames.setData(uiDContent)
        },
        createServerPane: async function() {
            //
            // server button
            //
            tas.vars.uiPaneMain.setContent("Server")
            const serverRunningButton = blessed.button({
                parent: tas.vars.uiPaneMain,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 15,
                top: 0,  // Position within the box
                name: 'submit',
                content: 'Server running?',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            serverRunningButton.on('mousedown', async function () {
                let ret = await tas.processes.isMainServerRunning()
                console.log("Server running: " + ret)

            })

            const killServerButton = blessed.button({
                parent: tas.vars.uiPaneMain,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 35,
                top: 0,  // Position within the box
                name: 'submit',
                content: 'Kill Server',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            killServerButton.on('mousedown', async function () {
                await tas.processes.killMainServer()
            })


            const startServerButton = blessed.button({
                parent: tas.vars.uiPaneMain,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 55,
                top: 0,  // Position within the box
                name: 'submit',
                content: 'Start Server',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            startServerButton.on('mousedown', async function () {
                await tas.processes.startMainServer()
            })

        }
    },
    screen:     {
        createScreen:       async function() {
            // Create a screen object.
            tas.vars.screen = blessed.screen({
                smartCSR: true
            });

            tas.vars.screen.title = 'ZAlgoHedgeFund';
        },
        setUpScreen:        async function() {
            // Quit on Escape, q, or Control-C.
            tas.vars.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            // Focus our element.
            tas.vars.uiPaneTop.focus();

            // Render the screen.
            tas.vars.screen.render();
        },
        changeMode:         async function() {
            await tas.screen.reloadTopPane()
            await tas.screen.reloadLeftPane()
            await tas.screen.reloadMainPane()

            await tas.screen.setUpScreen()
        },
        createBoxes:        async function() {
            //
            // top pane
            //
            tas.vars.uiPaneLeftMenu = blessed.box({
                bottom: '0',
                left: '0',
                width: '20%',
                height: '80%',
                content: "Trades",
                tags: true,
                border: {
                    type: 'line'
                },
                style: {
                    fg: 'white',
                    bg: 'magenta',
                    border: {
                        fg: '#f0f0f0'
                    },
                    hover: {
                        bg: 'green'
                    }
                }
            });
            tas.vars.screen.append(tas.vars.uiPaneLeftMenu);


            //
            // left pane
            //
            tas.vars.uiPaneMain = blessed.box({
                bottom: '0',
                right: '0',
                width: '80%',
                height: '80%',
                content: "Other",
                tags: true,
                border: {
                    type: 'line'
                },
                style: {
                    fg: 'white',
                    bg: 'magenta',
                    border: {
                        fg: '#f0f0f0'
                    },
                    hover: {
                        bg: 'green'
                    }
                }
            });
            tas.vars.screen.append(tas.vars.uiPaneMain);

        },

        reloadTopPane:      async function() {

            // Create a box perfectly centered horizontally and vertically.
            tas.vars.uiPaneTop = blessed.box({
                top: 'top',
                left: 'left',
                width: '100%',
                height: '20%',
                content: "{bold}ZAlgoHedgeFund{/bold}!",
                tags: true,
                border: {
                    type: 'line'
                },
                style: {
                    fg: 'white',
                    bg: 'magenta',
                    border: {
                        fg: '#f0f0f0'
                    },
                    hover: {
                        bg: 'green'
                    }
                }
            });
            tas.vars.screen.append(tas.vars.uiPaneTop);

            // Create a button
            const homeButton = blessed.button({
                parent: tas.vars.uiPaneTop,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 0,
                bottom: 0,  // Position within the box
                name: 'submit',
                content: 'Home',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            homeButton.on('mousedown', async function (data) {
                tas.vars.uiMode.main = "home"
                await tas.screen.changeMode()
            });


            //
            // demo button
            //
            const demoButton = blessed.button({
                parent: tas.vars.uiPaneTop,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 15,
                bottom: 0,  // Position within the box
                name: 'submit',
                content: 'Demo',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            demoButton.on('mousedown', async function () {
                tas.vars.uiMode.main = "demo"
                await tas.screen.changeMode()
            })



            //
            // processesButton button
            //
            const processesButton = blessed.button({
                parent: tas.vars.uiPaneTop,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 25,
                bottom: 0,  // Position within the box
                name: 'submit',
                content: 'Processes',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            processesButton.on('mousedown', async function () {
                tas.vars.uiMode.main = "processes"
                await tas.screen.changeMode()
            })


            //
            // serverButton button
            //
            const serverButton = blessed.button({
                parent: tas.vars.uiPaneTop,  // Attach button to the box
                mouse: true,
                keys: true,
                shrink: true,
                padding: {
                    left: 2,
                    right: 2,
                },
                left: 41,
                bottom: 0,  // Position within the box
                name: 'submit',
                content: 'server',
                style: {
                    bg: 'blue',
                    fg: 'white',
                    focus: {
                        bg: 'green',
                    },
                    hover: {
                        bg: 'green',
                    },
                },
            });
            serverButton.on('mousedown', async function () {
                tas.vars.uiMode.main = "server"
                await tas.screen.changeMode()
            })
        },
        reloadLeftPane:     async function() {

            if ((!tas.vars.uiMode.main) || (tas.vars.uiMode.main == "home")) {
            } else if (tas.vars.uiMode.main == "demo") {
            }
        },
        reloadMainPane:     async function() {
            tas.vars.uiPaneMain.children.forEach(child => child.detach());
            if ((!tas.vars.uiMode.main) || (tas.vars.uiMode.main == "home")) {
                await tas.panes.createHomePane()
            } else if (tas.vars.uiMode.main == "demo") {

            } else if (tas.vars.uiMode.main == "processes") {
                await tas.panes.createProcessesPane()
            } else if (tas.vars.uiMode.main == "server") {
                await tas.panes.createServerPane()
            }


        }

    },
    processes:  {
        startAllProcesses:   async function (  tas  )    {
            let listOfProcesses = Object.keys(tas.vars.processes)
            //debugger
            for (let processItemName of listOfProcesses) {
                let processItem = tas.vars.processes[processItemName]
                let processPath = path.join(__dirname, '/' + processItem.fileName )
                processItem.processHandle = new Worker(
                    processPath,
                );
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
        createCookieInDb: async function                          (  cookie ) {
            //stmtInsertCookie.run(uuidv1(),timestampNow,"yazz",cookie,newSessionid, hostCookieSentTo, from_device_type)
            await tas.vars.dbConnection.query("insert into   cookies  (cookie_name, cookie_value)  values  ($1,$2)",
                ["tradingapp",cookie])
        },
        getCookieRecord: async function                           (  cookie  ) {
            let res = await tas.vars.dbConnection.query("select * from cookies  where cookie_value = $1",
                [cookie])
            if (res.rows.length > 0) {
                return res.rows[0]
            }
            return null
        },
        setUserLoggedIn: async function                           (  cookie  ) {
            await tas.vars.dbConnection.query("update cookies set logged_in = $1 where cookie_value = $2",
                ["TRUE",cookie])
        }
    },
    main:               async function  (  ) {
        let tas = this
        tas.vars.dbConnection = await tr.helpers.connectDb(config)
        if (config.system) {
            tas.vars.debugMode = config.system.debug
        }

        //await tas.screen.createScreen()
        //await tas.screen.createBoxes()
        //await tas.screen.changeMode()

        //expressApp.get('/', (req, res) => {
        //    res.send('Hello World!')
        //})
        app.use(cookieParser());

        app.use(async function (req, res, next) {
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
        });

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })

        console.log(path.join(__dirname, '/trading_app.html'))
        app.use(
                "/a"
                ,
                express.static(path.join(__dirname, '/trading_app.html'))
        );

        app.use('/js', express.static(path.join(__dirname, 'js')));
        //process.exit()

        app.get(    '/login',                 async function (req, res, next) {
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
        })


        app.get(    '/get_init_settings',                 async function (req, res, next) {
            let cookie = req.cookies.tradingapp;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "ok" , value: {debug: tas.vars.debugMode} }));
        })

        app.get(    '/run_get_prices',                 async function (req, res, next) {
            let cookie = req.cookies.tradingapp;
            await tas.processes.runGetPricesChildProcess(tas)

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "ok"}));
        })

        await tas.processes.startAllProcesses(  tas  )

    }
}

tas.main()