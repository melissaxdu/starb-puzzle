import assert from 'assert';
import { parsePuzzle } from './PuzzleParser';
import fs from 'fs';

export enum CellStates {
    Empty, Star, Blocked
}

/**
 * Immutable ADT for a Star Battle puzzle board
 */
export class Puzzle {    
    // Abstraction function:
    //   AF(rows, columns, regions, squares): an immutable Star Battle board with dimensions `rows` by `columns`, with `regions` representing all the cells in each region of the board and `squares` representing the cell state of every cell on the board (empty, star, or blocked).
    // Representation invariant:
    //   - `rows` and `columns` and size of `regions` === 10
    //   - total number of cells across `regions` === 100
    //   - each coordinate of a cell in `regions` is 1-indexed between 1 and 10 inclusive
    // Safety from rep exposure:
    //   - `rows` and `columns` are readonly and immutable
    //   - `squares` and `regions` are private and readonly
    //   - `squares` and `regions` will never be directly returned from instance methods
    //   - constructor makes a defensive copy of `regions`
    
    public readonly rows: number;
    public readonly columns: number;

    private readonly squares: Array<CellStates>;
    private readonly regions: Map<number, Array<[number, number]>>;

    /**
     * @param regions the map containing the coordinates of all the cells in the 10 regions of the puzzle
     * @throws error if any of the rep invariants are violated
     */
    public constructor(
        regions: Map<number, Array<[number, number]>>,
    ) {
        this.rows = 10;
        this.columns = 10;

        this.squares = new Array<CellStates>(this.rows*this.columns);
        this.regions = new Map<number, Array<[number, number]>>();

        for (let i = 0; i < this.rows*this.columns; ++i) {
            this.squares[i] = CellStates.Empty;
        }

        for (const key of regions.keys()) {
            this.regions.set(key, (regions.get(key) ?? assert.fail()).map(list => [list[0], list[1]]));
        }

        this.checkRep();
    }

    // Asserts the rep invariant
    private checkRep(): void {
        const dimension = 10;
        assert(this.rows === dimension, "number of rows must be 10");
        assert(this.columns === dimension, "number of columns must be 10");
        assert(this.regions.size === dimension, "number of regions must be 10");
        let totalCells = 0;
        for (const region of this.regions.values()) {
            for (const cell of region) {
                totalCells += 1;
                const row = cell[0] ?? assert.fail("cell is missing row value");
                const column = cell[1] ?? assert.fail("cell is missing row value");
                assert(row >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
                assert(column >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
            }
        }
        assert(totalCells === dimension*dimension, "must have total of 100 cells over all regions");
    }

    /** 
     * Getter function for this.regions
     * 
     * @returns Array<Array<{row: number, column: number}>> array of all the regions
     */
    public getRegions(): Array<Array<{row: number, column: number}>> {
        const regions = [];
        for(const [key, region] of this.regions) {
            const regionCoords = [];
            for(const coord of region) {
                regionCoords.push({row: coord[0], column: coord[1]});
            }
            regions.push(regionCoords);
        }
        return regions;
    }

    /**
     * Returns a new, empty puzzle
     * 
     * @returns a new puzzle with all the stars removed.
     */
    public emptyPuzzle(): Puzzle {
        return new Puzzle(this.regions);
    }

    /**
     * Checks if each region of the puzzle has exactly the needed number of stars, and no stars are 
     * vertically, horizontally, or diagonally adjacent.
     * 
     * @returns true if the puzzle is solved; false otherwise
     */
    public isSolved(): boolean {
        // Check that each row has the number of stars needed
        for (let i = 0; i < this.rows; ++i) {
            let totalStars = 0;
            for (let j = 0; j < this.columns; ++j) {
                totalStars += this.squares[this.columns*i + j] === CellStates.Star ? 1 : 0;
            }

            if (totalStars !== 2) return false;
        }
        
        // Check that each column has the number of stars needed
        for (let j = 0; j < this.columns; ++j) {
            let totalStars = 0;
            for (let i = 0; i < this.rows; ++i) {
                totalStars += this.squares[this.columns*i + j] === CellStates.Star ? 1 : 0;
            }

            if (totalStars !== 2) return false;
        }

        // Check that each region has the number of stars needed
        for (const region of this.regions.values()) {
            let totalStars = 0;
            for (const [row, column] of region) {
                totalStars += this.squares[this.columns*(row-1) + (column-1)] === CellStates.Star ? 1 : 0;
            }

            if (totalStars !== 2) return false;
        }

        // Check that no two stars are adjacent
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.columns; ++j) {
                if (this.squares[this.columns*i + j] === CellStates.Star &&this.starAdjacent([i+1, j+1])) return false;
            }
        }

        return true;
    }

    /**
     * Checks if any of the adjacent grid squares contains a star
     * 
     * @param position the position of the cell of which you want to check adjacent
     * @returns true if there is an adjacent star; false otherwise
     */
    private starAdjacent(position: [number, number]): boolean {
        const [row, column] = position;
        const deltas = [-1, 0, 1];

        for (const deltaRow of deltas) {
            for (const deltaColumn of deltas) {
                const cellRow = row + deltaRow;
                const cellColumn = column + deltaColumn;
                if (
                    (deltaRow === 0 && deltaColumn === 0) || 
                    (cellRow < 1 || cellRow > this.rows) || 
                    (cellColumn < 1 || cellColumn > this.columns)
                ) continue;
                else {
                    if (this.squares[this.columns*(cellRow-1) + (cellColumn-1)] === CellStates.Star) {
                        console.log(cellRow, cellColumn);
                        return true;}
                }
            }
        }

        return false;
    }

    /**
     * Sets the state of squares at a given index to the given state
     * 
     * @param squaresIndex the index to update
     * @param state the new state of the grid square
     */
    private setSquare(squaresIndex: number, state: CellStates): void {
        this.squares[squaresIndex] = state;
    }

    /**
     * Get the state of a specific grid square
     * 
     * @param position The position of the grid square you want to observe
     * @returns the state of the puzzle at that location
     */
    public getStatus(position: [number, number]): CellStates {
        const [row, column] = position;
        return this.squares[this.columns*(row-1) + (column-1)] ?? assert.fail("Grid square not found");
    }

    /**
     * Return a new puzzle where the grid square is cycled between empty, blocked, starred, in that order.
     * 
     * @param position the position on the grid to be cycled
     * @returns the updated state of the grid square
     * @throws Error if x and y are not valid coordinates of the puzzle board.
     */  
    public cycleSquare(position: [number, number]): Puzzle {
        const [row, column] = position;
        if (row < 1 || row > this.rows || column < 1 || column > this.columns) throw new Error("Cannot place a star at an invalid grid position");

        const outputPuzzle = new Puzzle(this.regions);
        for (let i = 0; i < this.rows*this.columns; ++i) {
            const status = this.squares[i] ?? assert.fail("Grid square not found");
            outputPuzzle.setSquare(i, status);
        }

        const index = this.columns*(row-1) + (column-1);
        const status = this.squares[index];

        switch (status) {
            case CellStates.Empty:
                outputPuzzle.setSquare(index, CellStates.Blocked);
                break;
            case CellStates.Blocked:
                outputPuzzle.setSquare(index, CellStates.Star);
                break;
            case CellStates.Star:
                outputPuzzle.setSquare(index, CellStates.Empty);
                break;
            default: 
                assert.fail();
        }

        this.checkRep();
        return outputPuzzle;
    }

    /**
     * Get coordinates of all stars on puzzle
     * 
     * @returns Array<{row: number, column: number}> array of the coordinates of all the stars
     */

    public getStars(): Array<{row: number, column: number}> {
        const stars: Array<{row: number, column: number}> = [];
        for (let i = 0; i < this.rows*this.columns; ++i) {
            if(this.squares[i] === CellStates.Star) {
                const col: number = i%this.columns;
                const row: number = Math.floor(i/this.rows);
                stars.push({row: row, column: col});
            }
        }
        return stars;
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        let stringRep = "";
        stringRep += `${this.rows}x${this.columns}\n`;
        for (const region of this.regions.values()) {
            const stars = new Array<[number, number]>;
            const nonStars = new Array<[number, number]>;
            for (const cell of region) {
                const row = cell[0] ?? assert.fail("cell is missing x value");
                const column = cell[1] ?? assert.fail("cell is missing y value");
                const cellState = this.squares[this.columns*(row-1) + (column-1)];
                if (cellState === CellStates.Star) {
                    stars.push([row, column]);
                }
                else {
                    nonStars.push([row, column]);
                }
            }
            let line = "";
            for (const star of stars) {
                const row = star[0] ?? assert.fail("cell is missing x value");
                const column = star[1] ?? assert.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '| ';
            for (const nonStar of nonStars) {
                const row = nonStar[0] ?? assert.fail("cell is missing x value");
                const column = nonStar[1] ?? assert.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '\n';
            stringRep += line;
        }
        return stringRep;
    }
}

/**
 * Parse a puzzle.
 * 
 * @param input string representation of a puzzle to parse.
 * @returns puzzle ADT for the input
 * @throws Error if the string representation is invalid
 */
export function parseString(input: string): Puzzle {
    return parsePuzzle(input); 
}

/**
 * Parse a puzzle.
 * 
 * @param filename path to the file containing the string representation of a puzzle to parse, excluding comments
 * @returns puzzle ADT for the input
 * @throws Error if the filename or string representation is invalid
 */
export async function parseFile(filename: string): Promise<Puzzle> {
    const fileContents = (await fs.promises.readFile(filename)).toString();
    let stringRep = "";
    const lines = fileContents.split('\n');
    for (const line of lines) {
        if (!line.startsWith("#") && line.length > 0) {
            stringRep += line + '\n';
        }
    }
    return parsePuzzle(stringRep); 
}
