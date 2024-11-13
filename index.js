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
            app.vars.uiPaneTop.on('click', function (data) {
                app.vars.uiPaneTop.setContent(tr.helpers.getDemoText());
                app.vars.screen.render();
            });
            app.vars.uiPaneTop.key('enter', function (ch, key) {
                app.vars.uiPaneTop.setContent(tr.helpers.getDemoText());
                app.vars.screen.render();
            });

            // Create a button
            const button = blessed.button({
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
                content: 'Click me!',
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

            // Button click event
            button.on('click', async function () {
                app.vars.uiPaneTop.setContent('Button was clicked!');
                //table.setData(tr.helpers.convertToArrayOfArrays(processes))
                app.vars.screen.render()
                app.vars.screen.render(); // Re-render the screen to show changes
            });

            // Create a button
            const button2 = blessed.button({
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
                content: '2ns!',
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
            button2.on('click', async function () {
                console.log("node ./get_prices.js")
                tr.helpers.execCommand("node ./get_prices.js")
            })
        },
        createLeftPane:     async function() {
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
        },
        createMainPane:     async function() {
            // Create a box perfectly centered horizontally and vertically.
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
        }
    },
    main:               async function  (  ) {
        let client = await tr.helpers.connectDb(config)

        await app.screen.createScreen()
        await app.screen.createTopPane()
        await app.screen.createLeftPane()
        await app.screen.createMainPane()
        await app.screen.setUpScreen()
    }
}






app.main()