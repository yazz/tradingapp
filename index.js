const   fs                  = require('fs');
const   { Client }          = require('pg');
const   ps                  = require('ps-node');
let     tr                  = require('./helpers.js')
var     blessed             = require('blessed');

const config                = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let app = {
    listNodeProcesses: async function () {
        let promise = new Promise((resolve, reject) => {
            ps.lookup({ command: 'node' }, (err, resultList) => {
                if (err) {
                    return reject(err);
                }
                resolve(resultList);
            });
        });
        let res = await promise
        return res
    }

}





async function main() {
    let processes = await app.listNodeProcesses()
    let table
    let client = await tr.helpers.connectDb(config)


// Create a screen object.
    var screen = blessed.screen({
        smartCSR: true
    });

    screen.title = 'my window title';

// Create a box perfectly centered horizontally and vertically.
    var box = blessed.box({
        top: 'top',
        left: 'left',
        width: '50%',
        height: '50%',
        content: "Zubair's {bold}Trading system{/bold}!",
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
    screen.append(box);
    box.on('click', function (data) {
        box.setContent(tr.helpers.getDemoText());
        screen.render();
    });
    box.key('enter', function (ch, key) {
        box.setContent(tr.helpers.getDemoText());
        screen.render();
    });


// Create a button
    const button = blessed.button({
        parent: box,  // Attach button to the box
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
        box.setContent('Button was clicked!');
        processes = await app.listNodeProcesses()
        console.log(processes)
        table.setData(tr.helpers.convertToArrayOfArrays(processes))
        screen.render()
        screen.render(); // Re-render the screen to show changes
    });


// Create a button
    const button2 = blessed.button({
        parent: box,  // Attach button to the box
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

// Create a box perfectly centered horizontally and vertically.
    var positionsWindow = blessed.box({
        top: 'bottom',
        right: '0',
        width: '50%',
        height: '50%',
        content: "Positions",
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
    screen.append(positionsWindow);
// Create a listtable widget



let positions = await client.query("select  *  from  trading_positions",[])

    const positionsTable = blessed.listtable({
        parent: positionsWindow,
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
        data: tr.helpers.convertToArrayOfArrays(positions.rows),
    });


// Create a box perfectly centered horizontally and vertically.
    var box2 = blessed.box({
        bottom: '0',
        right: '0',
        width: '50%',
        height: '50%',
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
    screen.append(box2);


// Create a box perfectly centered horizontally and vertically.
    var box3 = blessed.box({
        bottom: '0',
        left: '0',
        width: '50%',
        height: '50%',
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
    screen.append(box3);


    
// Create a listtable widget
    table = blessed.listtable({
        parent: box3,
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
    processes = await app.listNodeProcesses()
    table.setData(tr.helpers.convertToArrayOfArrays(processes))
    screen.render()


// Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });

// Focus our element.
    box.focus();

// Render the screen.
    screen.render();
}

main()