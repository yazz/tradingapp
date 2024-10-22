var blessed = require('blessed');

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
box.on('click', function(data) {
    box.setContent('Started');
    screen.render();
});
box.key('enter', function(ch, key) {
    box.setContent('Started');
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
button.on('click', function () {
    box.setContent('Button was clicked!');
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


// Create a box perfectly centered horizontally and vertically.
var box2 = blessed.box({
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
screen.append(box2);





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





// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();