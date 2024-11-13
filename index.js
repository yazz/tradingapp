const   fs                  = require('fs');
const   { Client }          = require('pg');
const   ps                  = require('ps-node');
let     tr                  = require('./helpers.js')
var     blessed             = require('blessed');

const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let app = {
    vars: {
        screen:                 null,
        uiTableOfNames:         null,
        uiPaneTop:              null,
        uiPaneLeftMenu:         null,
        uiPaneMain:             null,
        uiMode:                 {}
    },
    panes: {
        createHomePane: async function() {
            app.vars.uiTableOfNames = blessed.listtable({
                parent: app.vars.uiPaneMain,
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
            //processes = await app.listNodeProcesses()
            //table.setData(tr.helpers.convertToArrayOfArrays(processes))
        },
        createServerPane: async function() {
            //
            // server button
            //
            app.vars.uiPaneMain.setContent("Server")
            const serverRunningButton = blessed.button({
                parent: app.vars.uiPaneMain,  // Attach button to the box
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
                let ret = await app.processes.isMainServerRunning()
                console.log("Server running: " + ret)

            })

            const killServerButton = blessed.button({
                parent: app.vars.uiPaneMain,  // Attach button to the box
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
                await app.processes.killMainServer()
            })


            const startServerButton = blessed.button({
                parent: app.vars.uiPaneMain,  // Attach button to the box
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
                await app.processes.startMainServer()
            })

        }
    },
    screen: {
        createScreen:       async function() {
            // Create a screen object.
            app.vars.screen = blessed.screen({
                smartCSR: true
            });

            app.vars.screen.title = 'ZAlgoHedgeFund';
        },
        setUpScreen:        async function() {
            // Quit on Escape, q, or Control-C.
            app.vars.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            // Focus our element.
            app.vars.uiPaneTop.focus();

            // Render the screen.
            app.vars.screen.render();
        },
        changeMode:         async function() {
            await app.screen.reloadTopPane()
            await app.screen.reloadLeftPane()
            await app.screen.reloadMainPane()

            await app.screen.setUpScreen()
        },
        createBoxes:        async function() {
            //
            // top pane
            //
            app.vars.uiPaneLeftMenu = blessed.box({
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
            app.vars.screen.append(app.vars.uiPaneLeftMenu);


            //
            // left pane
            //
            app.vars.uiPaneMain = blessed.box({
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
            app.vars.screen.append(app.vars.uiPaneMain);

        },

        reloadTopPane:      async function() {

            // Create a box perfectly centered horizontally and vertically.
            app.vars.uiPaneTop = blessed.box({
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
            app.vars.screen.append(app.vars.uiPaneTop);

            // Create a button
            const homeButton = blessed.button({
                parent: app.vars.uiPaneTop,  // Attach button to the box
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
                app.vars.uiMode.main = "home"
                await app.screen.changeMode()
            });


            //
            // demo button
            //
            const demoButton = blessed.button({
                parent: app.vars.uiPaneTop,  // Attach button to the box
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
                app.vars.uiMode.main = "demo"
                await app.screen.changeMode()
            })



            //
            // processesButton button
            //
            const processesButton = blessed.button({
                parent: app.vars.uiPaneTop,  // Attach button to the box
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
                app.vars.uiMode.main = "processes"
                await app.screen.changeMode()
            })


            //
            // serverButton button
            //
            const serverButton = blessed.button({
                parent: app.vars.uiPaneTop,  // Attach button to the box
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
                app.vars.uiMode.main = "server"
                await app.screen.changeMode()
            })
        },
        reloadLeftPane:     async function() {

            if ((!app.vars.uiMode.main) || (app.vars.uiMode.main == "home")) {
            } else if (app.vars.uiMode.main == "demo") {
            }
        },
        reloadMainPane:     async function() {
            app.vars.uiPaneMain.children.forEach(child => child.detach());
            if ((!app.vars.uiMode.main) || (app.vars.uiMode.main == "home")) {
                await app.panes.createHomePane()
            } else if (app.vars.uiMode.main == "demo") {

            } else if (app.vars.uiMode.main == "processes") {

            } else if (app.vars.uiMode.main == "server") {
                await app.panes.createServerPane()
            }


        }

    },
    processes: {
        isMainServerRunning: async function () {
            try {
                let ret = await tr.helpers.execCommand("ps aux | grep -i zalgo_server | grep -v grep")
                return true
            } catch (err) {
                return false
            }
        },
        killMainServer: async function () {
            try {
                let ret = await tr.helpers.execCommand("pkill -9 -f zalgo_server ")
                console.log("server killed")
            } catch (err) {
                console.log("Could not kill server")
            }
        },
        startMainServer: async function () {
            try {
                if (await app.processes.isMainServerRunning()) {
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
    main:               async function  (  ) {
        let client = await tr.helpers.connectDb(config)

        await app.screen.createScreen()
        await app.screen.createBoxes()
        await app.screen.changeMode()
    }
}






app.main()