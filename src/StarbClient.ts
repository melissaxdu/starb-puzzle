/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.

import assert from 'assert';
import { CellStates, Puzzle, parseFile, parseString } from "./Puzzle";
import { drawBox, drawGrid, drawPuzzle, drawStar, removeStar, drawBlock} from "./Drawing";
import fetch from 'node-fetch';

/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE: string = "kd-6-31-6";

// see ExamplePage.ts for an example of an interactive web page

/**
 * ADT representing the client state
 */
export class Client {
    // Abstraction function:
    //   AF(button, canvas, puzzle, coordColors): the client that displays the `puzzle` on the `canvas` and allows users to click on the game board and add stars/blocks. `button` allows users to click a button to check if the puzzle is solved. `coordColors` represents the color of each cell on the game board. 
    // Representation invariant:
    //   true
    // Safety from rep exposure:
    //   all rep fields except `puzzle` are private and readonly
    //   `puzzle` is private and an immutable type and is created in the constructor, not passed in as an alias
    //   `canvas`, `button`, and `coordColors` are created in the constructor, not passed in as an alias
    //   no public methods return any aliases to the rep

    private readonly button: HTMLElement;
    private readonly canvas: HTMLCanvasElement;
    private puzzle: Puzzle;
    private readonly coordColors: Map<number, string>;

    /**
     * Sets up the game board and allows users to start playing.
     * 
     * @param puzzleString the string representation of the blank puzzle
     */
    public constructor(
        puzzleString: string
    ) {
        // gets the puzzle from the string representation
        this.puzzle = parseString(puzzleString);

        // get the elements of the webpage
        this.button = document.getElementById('button') ?? assert.fail('missing button');
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
        
        // draws the blank puzzle on the canvas
        drawGrid(this.canvas, this.puzzle);
        this.coordColors = drawPuzzle(this.canvas, this.puzzle);

        // add button functionality to check if solved
        this.button.addEventListener('click', (event: MouseEvent) => {
            if (this.checkSolved()) {
                window.alert("YAY! You've solved the puzzle :3");
            }
            else {
                window.alert("You have not solved the puzzle yet :(");

            }
        });

        // add clicking functionality to draw stars, remove stars, and add blocks
        this.canvas.addEventListener('click', (event: MouseEvent) => {
            this.click(this.getCell(event.x, event.y));
        });
    }

    // Asserts the rep invariant
    public checkRep(): void {
        return;
    }

    /**
     * Clicks a cell on the board and updates the state of the board.
     * 
     * @param cell the coordinate of the star to be placed on the board
     * @param cell.row the row of the coordinate (must be between 1 to 10 inclusive)
     * @param cell.column the column of the coordinate (must be between 1 to 10 inclusive)
     */
    public click(cell: {row: number, column: number}): void {
        this.puzzle = this.puzzle.cycleSquare([cell.row, cell.column]);
        const updatedCellState = this.puzzle.getStatus([cell.row, cell.column]);
        switch(updatedCellState) {
            case CellStates.Empty:
                removeStar(this.canvas, this.puzzle, cell, this.coordColors);
                break;
            case CellStates.Star:
                removeStar(this.canvas, this.puzzle, cell, this.coordColors);
                drawStar(this.canvas, this.puzzle, cell);
                break;
            case CellStates.Blocked:
                drawBlock(this.canvas, this.puzzle, cell);
                break;
            default:
                assert.fail();
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
    public getCell(x: number, y: number): {row: number, column: number} {
        return {row: this.getRow(y), column: this.getColumn(x)};
    }

    /**
     * computes the cell's row corresponding to the y-value of the user's mouse click
     * 
     * @param y the y-value of the user's mouse click
     * @returns the corresponding cell's row number (between 1 to 10 inclusive)
     * @throws error if the y value is outside of the range of the board
     */     
    private getRow(y: number): number {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const top = box.top;
        const bottom = box.bottom;
        const yIncrement = (bottom-top)/dimension;
        for (let row = 0; row < dimension; row++) {
            if (this.inRange(y, top+row*yIncrement, top+(row+1)*yIncrement)) {
                return row+1;
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
    private getColumn(x: number): number {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const left = box.left;
        const right = box.right;
        const xIncrement = (right-left)/dimension;
        for (let column = 0; column < dimension; column++) {
            if (this.inRange(x, left+column*xIncrement, left+(column+1)*xIncrement)) {
                return column+1;
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
    private inRange(target: number, start: number, end: number): boolean {
        return target >= start && target < end;
    }

    /**
     * Checks if the puzzle has been solved.
     * 
     * @returns true if the puzzle has been solved, false otherwise
     */
    public checkSolved(): boolean {
        return this.puzzle.isSolved();
    }
}

/**
 * Set up the website page.
 */
async function main(): Promise<void> {
    // connect to server to retrieve the puzzle's string representation
    const promise = fetch(`http://localhost:8789/getPuzzle/${PUZZLE}`);
    const response = await promise;
    const puzzleString = await response.text();

    // create a new client ADT instance
    const client = new Client(puzzleString);
}

main();