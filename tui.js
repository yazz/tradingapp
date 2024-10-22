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




// Create a box perfectly centered horizontally and vertically.
var box2 = blessed.box({
    top: 'bottom',
    right: 'right',
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
screen.append(box2);




// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();