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
            await app.screen.createTopPane()
            await app.screen.createLeftPane()
            await app.screen.createMainPane()
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

        createTopPane:      async function() {

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


            // Create a button
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
        },
        createLeftPane:     async function() {

            if ((!app.vars.uiMode.main) || (app.vars.uiMode.main == "home")) {
            } else if (app.vars.uiMode.main == "demo") {
            }
        }
        ,
        createMainPane:     async function() {
            app.vars.uiPaneMain.children.forEach(child => child.detach());
            if ((!app.vars.uiMode.main) || (app.vars.uiMode.main == "home")) {
                // Create a box perfectly centered horizontally and vertically.


                // Create a listtable widget
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
            } else if (app.vars.uiMode.main == "demo") {

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