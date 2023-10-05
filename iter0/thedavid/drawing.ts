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
 * Draw a square
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
    const context = canvas.getContext('2d') ?? assert.fail("Context not found")

    const box_height = height/10;
    const box_width = width/10;

    context.lineWidth = 3;

    for (let i=0; i<10; i++) {
        for (let j=0; j<10; j++) {
            const startY = i*box_height;
            const startX = j*box_width;

            drawSquare(i, j, startX, startY, box_height, box_width, canvas);
        }
    }
}

function drawSquare(i: number, j: number, startX: number, startY: number, boxHeight:number, boxWidth:number, canvas: HTMLCanvasElement): void {
    const walls = data[i*10 + j];
    const context = canvas.getContext('2d') ?? assert.fail("Context not found")

    context.lineWidth = walls[0] === 1 ? 3 : 0.5;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(startX + boxWidth, startY);
    context.stroke();

    context.lineWidth = walls[1] === 1 ? 3 : 0.5;
    context.beginPath();
    context.moveTo(startX + boxWidth, startY);
    context.lineTo(startX + boxWidth, startY - boxHeight);
    context.stroke();

    context.lineWidth = walls[2] === 1 ? 3 : 0.5;
    context.beginPath();
    context.moveTo(startX + boxWidth, startY - boxHeight);
    context.lineTo(startX, startY - boxHeight);
    context.stroke();

    context.lineWidth = walls[3] === 1 ? 3 : 0.5;
    context.beginPath();
    context.moveTo(startX, startY - boxHeight);
    context.lineTo(startX, startY);
    context.stroke();
}

const data = [
    [1,0,0,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,1,0],
    [1,1,0,0],
    [1,0,0,1],
    [1,1,0,0],
    
    [0,0,1,1],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,0,0],
    [0,1,1,0],
    [1,1,0,1],
    [0,1,1,1],
    [0,0,0,1],
    [0,1,0,0],

    [1,1,0,1],
    [1,0,1,1],
    [1,0,1,0],
    [1,1,1,0],
    [0,1,1,1],
    [1,0,1,1],
    [0,0,1,0],
    [1,1,0,0],
    [0,0,0,1],
    [0,1,0,0],
    
    [0,0,0,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,1,0],
    [1,1,0,1],
    [1,0,1,1],
    [1,1,0,0],
    [0,1,1,1],
    [0,0,0,1],
    [0,1,0,0],
    
    [0,0,0,1],
    [0,0,0,0],
    [0,1,1,0],
    [1,0,0,1],
    [0,0,0,0],
    [1,1,0,0],
    [0,0,0,1],
    [1,1,0,0],
    [0,0,0,1],
    [0,1,0,0],
    
    [0,0,0,1],
    [0,1,0,0],
    [1,1,0,1],
    [0,0,1,1],
    [0,0,1,0],
    [0,1,1,0],
    [0,0,0,1],
    [0,1,0,0],
    [0,0,1,1],
    [0,1,0,0],
    
    [0,0,0,1],
    [0,1,0,0],
    [0,0,1,1],
    [1,0,1,0],
    [1,1,1,0],
    [1,0,1,1],
    [0,0,0,0],
    [0,1,0,0],
    [1,1,0,1],
    [0,1,0,1],
    
    [0,0,0,1],
    [0,0,1,0],
    [1,0,1,0],
    [1,0,1,0],
    [1,0,1,0],
    [1,1,1,0],
    [0,0,1,1],
    [0,1,1,0],
    [0,1,0,1],
    [0,1,1,1],
    
    [0,1,1,1],
    [1,0,0,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,0,0],
    [0,0,1,1],
    [1,1,0,0],
    
    [1,0,1,1],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [1,1,1,0],
    [0,1,1,1],
]

/**
 * Set up the main page.
 */
function main(): void {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
    
    drawGrid(canvas);
}

main();