"use strict";
/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const Drawing_1 = require("./Drawing");
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE = "kd-1-1-1";
// see ExamplePage.ts for an example of an interactive web page
/**
 * ADT representing the client state
 */
class Client {
    /**
     * @param canvas the canvas to draw the puzzle on
     * @param puzzleString the string representation of the blank puzzle
     */
    constructor(canvas, puzzleString) {
        this.canvas = canvas;
        this.coordColors = new Map();
        this.puzzle = (0, Puzzle_1.parseString)(puzzleString);
    }
    // Asserts the rep invariant
    checkRep() {
        return;
    }
    /***
     * Set the board display to a blank puzzle.
     */
    displayBlankPuzzle() {
        (0, Drawing_1.drawGrid)(this.canvas, this.puzzle);
        this.coordColors = (0, Drawing_1.drawPuzzle)(this.canvas, this.puzzle);
    }
    /**
     * Clicks a cell on the board and updates the state of the board.
     *
     * @param cell the coordinate of the star to be placed on the board
     * @param cell.row the row of the coordinate (must be between 1 to 10 inclusive)
     * @param cell.column the column of the coordinate (must be between 1 to 10 inclusive)
     */
    click(cell) {
        const updatedCellState = this.puzzle.cycleSquare([cell.row, cell.column]);
        switch (updatedCellState) {
            case Puzzle_1.CellStates.Empty:
                (0, Drawing_1.removeStar)(this.canvas, this.puzzle, cell, this.coordColors);
                break;
            case Puzzle_1.CellStates.Star:
                (0, Drawing_1.removeStar)(this.canvas, this.puzzle, cell, this.coordColors);
                (0, Drawing_1.drawStar)(this.canvas, this.puzzle, cell);
                break;
            case Puzzle_1.CellStates.Blocked:
                (0, Drawing_1.drawBlock)(this.canvas, this.puzzle, cell);
                break;
            default:
                assert_1.default.fail();
        }
    }
    /**
     * Computes the cell's row and column corresponding to the position of a user's mouse click.
     *
     * @param x the x value of the position of the click
     * @param y the y value of the position of the click
     * @returns an object containing the row and column on the board corresponding to the click (between 1 and 10 inclusive)
     * @throws error if x or y values are out of the range of the board
     */
    getCell(x, y) {
        return { row: this.getRow(y), column: this.getColumn(x) };
    }
    /**
     * computes the cell's row corresponding to the y-value of the user's mouse click
     *
     * @param y the y-value of the user's mouse click
     * @returns the corresponding cell's row number (between 1 to 10 inclusive)
     * @throws error if the y value is outside of the range of the board
     */
    getRow(y) {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const top = box.top;
        const bottom = box.bottom;
        const yIncrement = (bottom - top) / dimension;
        for (let row = 0; row < dimension; row++) {
            if (this.inRange(y, top + row * yIncrement, top + (row + 1) * yIncrement)) {
                return row + 1;
            }
        }
        throw Error("y value is not in valid range of the board");
    }
    /**
     * computes the cell's column corresponding to the x-value of the user's mouse click
     *
     * @param x the x-value of the user's mouse click
     * @returns the corresponding cell's column number (between 1 to 10 inclusive)
     * @throws error if the x value is outside of the range of the board
     */
    getColumn(x) {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const left = box.left;
        const right = box.right;
        const xIncrement = (right - left) / dimension;
        for (let column = 0; column < dimension; column++) {
            if (this.inRange(x, left + column * xIncrement, left + (column + 1) * xIncrement)) {
                return column + 1;
            }
        }
        throw Error("x value is not in valid range of the board");
    }
    /**
     * Checks if the target value is in the range
     *
     * @param target the target value to check
     * @param start the starting value of the range inclusive
     * @param end the ending value of the range exclusive
     * @returns true if the target value is in the range, false otherwise
     */
    inRange(target, start, end) {
        return target >= start && target < end;
    }
    /**
     * Checks if the puzzle has been solved.
     *
     * @returns true if the puzzle has been solved, false otherwise
     */
    checkSolved() {
        return this.puzzle.isSolved();
    }
}
exports.Client = Client;
/**
 * Set up the website page.
 */
async function main() {
    // get the elements of the webpage
    const button = document.getElementById('button') ?? assert_1.default.fail('missing button');
    const canvas = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
    // connect to server to retrieve the puzzle's string representation
    const promise = (0, node_fetch_1.default)(`http://localhost:8789/getPuzzle/kd-1-1-1`);
    const response = await promise;
    const puzzleString = await response.text();
    // create a new client ADT instance and display the blank puzzle
    const client = new Client(canvas, puzzleString);
    client.displayBlankPuzzle();
    // add button functionality to check if solved
    button.addEventListener('click', (event) => {
        if (client.checkSolved()) {
            window.alert("YAY! You've solved the puzzle :3");
        }
        else {
            window.alert("You have not solved the puzzle yet :(");
        }
    });
    // add clicking functionality to draw stars, remove stars, and add blocks
    canvas.addEventListener('click', (event) => {
        client.click(client.getCell(event.x, event.y));
    });
}
main();
//# sourceMappingURL=StarbClient.js.map