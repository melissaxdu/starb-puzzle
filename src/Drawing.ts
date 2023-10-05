import assert from 'assert';
import { Puzzle, parseFile } from './Puzzle';
import { Image, createCanvas, loadImage } from 'canvas';
export type { Canvas, Image } from 'canvas';
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
export function drawBox(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = canvas.getContext('2d');
    assert(context !== null, 'unable to get canvas drawing context');

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
export function drawGrid(canvas: HTMLCanvasElement, puzzle: Puzzle): void {
    
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');

    assert(context, 'unable to get canvas drawing context');

    context.save();

    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
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

    // reset the origin and styles back to defaults
    context.restore();
}

/**
 * Draw the puzzle lines.
 * 
 * @param canvas canvas to draw on
 * @param lines an array of start and end points of lines
 */
export function drawPuzzle(canvas: HTMLCanvasElement, puzzle: Puzzle): Map<number, string> {
    const blockLines: Array<{start: {x: number, y: number}, end: {x: number, y: number}}> = new Array();
    const regions = puzzle.getRegions();
    const coordColors: Map<number, string> = new Map();

    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');

    context.save();

    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    

    for(let i=0; i<regions.length; i++) {
        
        const region = regions[i];
        assert(region);
        const rowStarts: Map<number, number> = new Map();
        const rowEnds: Map<number, number> = new Map();
        const colStarts: Map<number, number> = new Map();
        const colEnds: Map<number, number> = new Map();

        for(const coord of region) {
            const col = coord.row-1;
            const row = coord.column-1;

            context.translate(xIncrement*(row), yIncrement*(col));
            context.fillStyle = BACKGROUNDS[i] ?? assert.fail("couldn't get background color");
            context.fillRect(0, 0, xIncrement, yIncrement);
            context.translate(-xIncrement*(row), -yIncrement*(col));

            coordColors.set(row*numRows+col, BACKGROUNDS[i] ?? assert.fail("couldn't get background color"));
            
            if(colStarts.has(row)) {
                colStarts.set(row, Math.min(colStarts.get(row)!, col));
            } else {
                colStarts.set(row, col);
            }
            if(colEnds.has(row)) {
                colEnds.set(row, Math.max(colEnds.get(row)!, col+1));
            } else {
                colEnds.set(row, col+1);
            }
            if(rowStarts.has(col)) {
                rowStarts.set(col, Math.min(rowStarts.get(col)!, row));
            } else {
                rowStarts.set(col, row);
            }
            if(rowEnds.has(col)) {
                rowEnds.set(col, Math.max(rowEnds.get(col)!, row+1));
            } else {
                rowEnds.set(col, row+1);
            }
        }

        context.strokeStyle = 'black';
        context.lineWidth = 3;

        // draw blocklines 
        for(const [row, rowStart] of rowStarts) {
            context.beginPath();
            context.moveTo(rowStart*xIncrement, row*yIncrement);
            context.lineTo(rowStart*xIncrement, (row+1)*yIncrement);
            context.stroke();
        }
        for(const [col, colStart] of colStarts) {
            context.beginPath();
            context.moveTo(col*xIncrement, colStart*yIncrement);
            context.lineTo((col+1)*xIncrement, colStart*yIncrement);
            context.stroke();
        }
        for(const [row, rowEnd] of rowEnds) {
            context.beginPath();
            context.moveTo(rowEnd*xIncrement, row*yIncrement);
            context.lineTo(rowEnd*xIncrement, (row+1)*yIncrement);
            context.stroke();
        }
        for(const [col, colEnd] of colEnds) {
            context.beginPath();
            context.moveTo(col*xIncrement, colEnd*yIncrement);
            context.lineTo((col+1)*xIncrement, colEnd*yIncrement);
            context.stroke();
        }
    }

    return coordColors;
}

/**
 * Draw stars.
 * 
 * @param canvas canvas to draw on
 * @param star (row, column) of stars
 */
export function drawStar(canvas: HTMLCanvasElement, puzzle: Puzzle, starCoord: {row: number, column: number}): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;

    const font = '30pt bold';

    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = createCanvas(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('⭐️');

    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();

    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const starWidth = fontMetrics.width;
    const starHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
    const row = starCoord.column-1;
    const col = starCoord.row-1;
    const xOffset = (xIncrement-starWidth)/2;
    const yOffset = (yIncrement-starHeight)/2;
    context.translate(row*xIncrement+xOffset, col*yIncrement+yOffset);

    context.font = font;
    context.fillStyle = 'white';
    context.fillText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);

    context.strokeStyle = 'black';
    context.strokeText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);

    context.translate(-(row*xIncrement+xOffset), -(col*yIncrement+yOffset));
}

export function removeStar(canvas: HTMLCanvasElement, puzzle: Puzzle, starCoord: {row: number, column: number}, coordColors: Map<number, string>): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    const blockOffset = 1.0;

    const row = starCoord.row-1;
    const col = starCoord.column-1;

    context.translate(yIncrement*(col), xIncrement*(row));
    context.fillStyle = 'white';
    context.fillRect(blockOffset, blockOffset, xIncrement-2*blockOffset, yIncrement-2*blockOffset);
    context.translate(-yIncrement*(col), -xIncrement*(row));

    context.translate(yIncrement*(col), xIncrement*(row));
    context.fillStyle = coordColors.get(col*numRows+row) ?? assert.fail('all blocks must be assigned color');    
    context.fillRect(blockOffset, blockOffset, xIncrement-2*blockOffset, yIncrement-2*blockOffset);
    context.translate(-yIncrement*(col), -xIncrement*(row));
    

}

export function drawBlock(canvas: HTMLCanvasElement, puzzle: Puzzle, blockCoord: {row: number, column: number}): void {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height/numRows;
    const yIncrement = width/numCols;
    const blockOffset = 0.1;

    const font = '30pt bold';

    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = createCanvas(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('🚫');

    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();

    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const blockWidth = fontMetrics.width;
    const blockHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
    const row = blockCoord.column-1;
    const col = blockCoord.row-1;
    const xOffset = (xIncrement-blockWidth)/2;
    const yOffset = (yIncrement-blockHeight)/2;
    context.translate(row*xIncrement+xOffset, col*yIncrement+yOffset);

    context.font = font;
    context.fillStyle = 'white';
    context.fillText('🚫', 0, fontMetrics.actualBoundingBoxAscent);

    context.strokeStyle = 'black';
    context.strokeText('🚫', 0, fontMetrics.actualBoundingBoxAscent);

    context.translate(-(row*xIncrement+xOffset), -(col*yIncrement+yOffset));
}

/**
 * Set up the main page.
 */
async function main(): Promise<void> {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
    const puzzle: Puzzle = await parseFile('../puzzles/kd-1-1-1.starb');
    drawGrid(canvas, puzzle);
    drawPuzzle(canvas, puzzle);

}

main();
