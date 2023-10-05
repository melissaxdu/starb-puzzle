"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBlock = exports.removeStar = exports.drawStar = exports.drawPuzzle = exports.drawGrid = exports.drawBox = void 0;
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const canvas_1 = require("canvas");
const BOX_SIZE = 16;
// categorical colors from
// https://github.com/d3/d3-scale-chromatic/tree/v2.0.0#schemeCategory10
const COLORS = [
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
const BACKGROUNDS = COLORS.map((color) => color + '60');
/**
 * Draw a black square filled with a random color.
 *
 * @param canvas canvas to draw on
 * @param x x position of center of box
 * @param y y position of center of box
 */
function drawBox(canvas, x, y) {
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context !== null, 'unable to get canvas drawing context');
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate(x, y);
    // draw the outer outline box centered on the origin (which is now (x,y))
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);
    // fill with a random semitransparent color
    context.fillStyle = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)] ?? assert_1.default.fail();
    context.fillRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);
    // reset the origin and styles back to defaults
    context.restore();
}
exports.drawBox = drawBox;
/**
 * Draw a 10x10 grid on the canvas.
 *
 * @param canvas canvas to draw on
 */
function drawGrid(canvas, puzzle) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    context.save();
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    context.strokeStyle = 'black';
    // draw box outline
    context.lineWidth = 3;
    for (const dest of [{ x: 0, y: height }, { x: width, y: 0 }]) {
        for (const start of [{ x: 0, y: 0 }, { x: width, y: height }]) {
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
        context.moveTo(xIncrement * i, 0);
        context.lineTo(xIncrement * i, height);
        context.stroke();
    }
    for (let i = 1; i < numRows; i++) {
        context.beginPath();
        context.moveTo(0, yIncrement * i);
        context.lineTo(width, yIncrement * i);
        context.stroke();
    }
    // reset the origin and styles back to defaults
    context.restore();
}
exports.drawGrid = drawGrid;
/**
 * Draw the puzzle lines.
 *
 * @param canvas canvas to draw on
 * @param lines an array of start and end points of lines
 */
function drawPuzzle(canvas, puzzle) {
    const blockLines = new Array();
    const regions = puzzle.getRegions();
    const coordColors = new Map();
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    context.save();
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        (0, assert_1.default)(region);
        const rowStarts = new Map();
        const rowEnds = new Map();
        const colStarts = new Map();
        const colEnds = new Map();
        for (const coord of region) {
            const row = coord.row - 1;
            const col = coord.column - 1;
            context.translate(xIncrement * (row), yIncrement * (col));
            context.fillStyle = BACKGROUNDS[i] ?? assert_1.default.fail("couldn't get background color");
            context.fillRect(0, 0, xIncrement, yIncrement);
            context.translate(-xIncrement * (row), -yIncrement * (col));
            coordColors.set(row * numRows + col, BACKGROUNDS[i] ?? assert_1.default.fail("couldn't get background color"));
            if (colStarts.has(row)) {
                colStarts.set(row, Math.min(colStarts.get(row), col));
            }
            else {
                colStarts.set(row, col);
            }
            if (colEnds.has(row)) {
                colEnds.set(row, Math.max(colEnds.get(row), col));
            }
            else {
                colEnds.set(row, col);
            }
            if (rowStarts.has(col)) {
                rowStarts.set(col, Math.min(rowStarts.get(col), row));
            }
            else {
                rowStarts.set(col, row);
            }
            if (rowEnds.has(col)) {
                rowEnds.set(col, Math.max(rowEnds.get(col), row));
            }
            else {
                rowEnds.set(col, row);
            }
        }
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        // draw blocklines 
        for (const [col, colStart] of colStarts) {
            context.beginPath();
            context.moveTo(colStart * xIncrement, col * yIncrement);
            context.lineTo(colStart * xIncrement, (col + 1) * yIncrement);
            context.stroke();
        }
        for (const [row, rowStart] of rowStarts) {
            context.beginPath();
            context.moveTo(row * xIncrement, rowStart * yIncrement);
            context.lineTo((row + 1) * xIncrement, rowStart * yIncrement);
            context.stroke();
        }
        for (const [col, colEnd] of colEnds) {
            context.beginPath();
            context.moveTo((colEnd + 1) * xIncrement, col * yIncrement);
            context.lineTo((colEnd + 1) * xIncrement, (col + 1) * yIncrement);
            context.stroke();
        }
        for (const [row, rowEnd] of rowEnds) {
            context.beginPath();
            context.moveTo((row + 1) * xIncrement, (rowEnd + 1) * yIncrement);
            context.lineTo((row + 1) * xIncrement, (rowEnd + 1) * yIncrement);
            context.stroke();
        }
    }
    return coordColors;
}
exports.drawPuzzle = drawPuzzle;
/**
 * Draw stars.
 *
 * @param canvas canvas to draw on
 * @param star (row, column) of stars
 */
function drawStar(canvas, puzzle, starCoord) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    const starOffset = 0.1;
    const font = '30pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('⭐️');
    // console.log('metrics', fontMetrics);
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const starX = starCoord.column + starOffset - 1;
    const starY = starCoord.row + starOffset - 1;
    context.translate(starX * xIncrement, starY * yIncrement);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    context.translate(-starX * xIncrement, -starY * yIncrement);
}
exports.drawStar = drawStar;
function removeStar(canvas, puzzle, starCoord, coordColors) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    const blockOffset = 1.0;
    const row = starCoord.row - 1;
    const col = starCoord.column - 1;
    context.translate(yIncrement * (col), xIncrement * (row));
    context.fillStyle = 'white';
    context.fillRect(blockOffset, blockOffset, xIncrement - 2 * blockOffset, yIncrement - 2 * blockOffset);
    context.translate(-yIncrement * (col), -xIncrement * (row));
    context.translate(yIncrement * (col), xIncrement * (row));
    context.fillStyle = coordColors.get(col * numRows + row) ?? assert_1.default.fail('all blocks must be assigned color');
    context.fillRect(blockOffset, blockOffset, xIncrement - 2 * blockOffset, yIncrement - 2 * blockOffset);
    context.translate(-yIncrement * (col), -xIncrement * (row));
}
exports.removeStar = removeStar;
function drawBlock(canvas, puzzle, blockCoord) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    const blockOffset = 0.1;
    const font = '30pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('🚫');
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const blockX = blockCoord.column + blockOffset - 1;
    const blockY = blockCoord.row + blockOffset - 1;
    context.translate(blockX * xIncrement, blockY * yIncrement);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    context.translate(-blockX * xIncrement, -blockY * yIncrement);
}
exports.drawBlock = drawBlock;
/**
 * Set up the main page.
 */
async function main() {
    const canvas = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
    const puzzle = await (0, Puzzle_1.parseFile)('../puzzles/kd-1-1-1.starb');
    drawGrid(canvas, puzzle);
    drawPuzzle(canvas, puzzle);
}
main();
//# sourceMappingURL=Drawing.js.map