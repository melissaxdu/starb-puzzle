import assert from 'assert';

const BOX_SIZE = 16;

// categorical colors from
// https://github.com/d3/d3-scale-chromatic/tree/v2.0.0#schemeCategory10
const COLORS: Array<string> = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
];

// semitransparent versions of those colors
const BACKGROUNDS = COLORS.map( (color) => color + '60' );

/**
 * Draw a black square filled with a random color.
 * 
 * @param canvas canvas to draw on
 * @param x x position of center of box
 * @param y y position of center of box
 */
function drawBox(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');

    // save original context settings before we translate and change colors
    context.save();

    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate(x, y);

    // draw the outer outline box centered on the origin (which is now (x,y))
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeRect(-BOX_SIZE/2, -BOX_SIZE/2, BOX_SIZE, BOX_SIZE);

    // fill with a random semitransparent color
    context.fillStyle = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)] ?? assert.fail();
    context.fillRect(-BOX_SIZE/2, -BOX_SIZE/2, BOX_SIZE, BOX_SIZE);

    // reset the origin and styles back to defaults
    context.restore();
}


/**
 * Draw a 10x10 grid on the canvas.
 * 
 * @param canvas canvas to draw on
 */
function drawGrid(canvas: HTMLCanvasElement): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = 10;
    const numCols = 10;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    context.strokeStyle = 'black';
    // draw box outline
    context.lineWidth = 3;
    for (const dest of [{x: 0, y: height}, {x: width, y: 0}]) {
        for (const start of [{x: 0, y: 0}, {x: width, y: height}]) {
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(dest.x, dest.y);
        context.stroke();
        }
    }
    // draw grid lines
    context.lineWidth = 0.5;
    for (let i = 1; i < numCols; i++) {
        context.beginPath();
        context.moveTo(xIncrement*i, 0);
        context.lineTo(xIncrement*i, height);
        context.stroke();
    }
    for (let i = 1; i < numRows; i++) {
        context.beginPath();
        context.moveTo(0, yIncrement*i);
        context.lineTo(width, yIncrement*i);
        context.stroke();
    }
}

/**
 * Draw the puzzle lines.
 * 
 * @param canvas canvas to draw on
 * @param lines an array of start and end points of lines
 */
function drawPuzzle(canvas: HTMLCanvasElement, lines: Array<{start: {x: number, y: number}, end: {x: number, y: number}}>): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = 10;
    const numCols = 10;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    for (const line of lines) {
        context.beginPath();
        context.moveTo(line.start.x*xIncrement, line.start.y*yIncrement);
        context.lineTo(line.end.x*xIncrement, line.end.y*yIncrement);
        context.stroke();
    }
}

/**
 * Draw stars.
 * 
 * @param canvas canvas to draw on
 * @param stars (row, column) of stars
 */
function drawStars(canvas: HTMLCanvasElement, stars: Array<{row: number, column: number}>): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = 10;
    const numCols = 10;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    const starOffset = 0.5;
    for (const star of stars) {
        const x = (star.column-starOffset)*xIncrement;
        const y = (star.row-starOffset)*yIncrement;
        drawBox(canvas, x, y);
    }
}

/**
 * Set up the main page.
 */
function main(): void {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
    
    const lines = [
        {start: {x:0, y:2}, end: {x:4, y:2}},
        {start: {x:1, y:2}, end: {x:1, y:3}},
        {start: {x:1, y:3}, end: {x:7, y:3}},
        {start: {x:7, y:3}, end: {x:7, y:4}},
        {start: {x:7, y:4}, end: {x:8, y:4}},
        {start: {x:4, y:2}, end: {x:4, y:4}},
        {start: {x:5, y:2}, end: {x:5, y:4}},
        {start: {x:5, y:2}, end: {x:6, y:2}},
        {start: {x:6, y:2}, end: {x:6, y:1}},
        {start: {x:6, y:1}, end: {x:7, y:1}},
        {start: {x:7, y:1}, end: {x:7, y:2}},
        {start: {x:7, y:2}, end: {x:8, y:2}},
        {start: {x:8, y:0}, end: {x:8, y:9}},
        {start: {x:8, y:9}, end: {x:9, y:9}},
        {start: {x:9, y:9}, end: {x:9, y:10}},
        {start: {x:8, y:6}, end: {x:9, y:6}},
        {start: {x:9, y:6}, end: {x:9, y:8}},
        {start: {x:9, y:8}, end: {x:10, y:8}},
        {start: {x:4, y:4}, end: {x:3, y:4}},
        {start: {x:3, y:4}, end: {x:3, y:6}},
        {start: {x:3, y:6}, end: {x:6, y:6}},
        {start: {x:6, y:6}, end: {x:6, y:4}},
        {start: {x:6, y:4}, end: {x:5, y:4}},
        {start: {x:3, y:5}, end: {x:2, y:5}},
        {start: {x:2, y:5}, end: {x:2, y:7}},
        {start: {x:2, y:7}, end: {x:6, y:7}},
        {start: {x:5, y:6}, end: {x:5, y:7}},
        {start: {x:6, y:7}, end: {x:6, y:8}},
        {start: {x:0, y:9}, end: {x:1, y:9}},
        {start: {x:1, y:9}, end: {x:1, y:8}},
        {start: {x:1, y:8}, end: {x:8, y:8}},
    ];

    const stars = [
        {row:3, column:2},
        {row:3, column:4},
        {row:7, column:5},

    ];
    drawGrid(canvas);
    drawPuzzle(canvas, lines);
    drawStars(canvas, stars);
}

main();
