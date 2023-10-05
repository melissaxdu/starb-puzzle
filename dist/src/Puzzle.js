"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = exports.parseString = exports.Puzzle = exports.CellStates = void 0;
const assert_1 = __importDefault(require("assert"));
const PuzzleParser_1 = require("./PuzzleParser");
const fs_1 = __importDefault(require("fs"));
var CellStates;
(function (CellStates) {
    CellStates[CellStates["Empty"] = 0] = "Empty";
    CellStates[CellStates["Star"] = 1] = "Star";
    CellStates[CellStates["Blocked"] = 2] = "Blocked";
})(CellStates = exports.CellStates || (exports.CellStates = {}));
/**
 * ADT for a Star Battle puzzle board
 */
class Puzzle {
    /**
     * @param regions the map containing the coordinates of all the cells in the 10 regions of the puzzle
     * @throws error if any of the rep invariants are violated
     */
    constructor(regions) {
        this.rows = 10;
        this.columns = 10;
        this.squares = new Array(this.rows * this.columns);
        this.regions = new Map();
        for (let i = 0; i < this.rows * this.columns; ++i) {
            this.squares[i] = CellStates.Empty;
        }
        for (const key of regions.keys()) {
            this.regions.set(key, (regions.get(key) ?? assert_1.default.fail()).map(list => [list[0], list[1]]));
        }
        this.checkRep();
    }
    // Asserts the rep invariant
    checkRep() {
        const dimension = 10;
        (0, assert_1.default)(this.rows === dimension, "number of rows must be 10");
        (0, assert_1.default)(this.columns === dimension, "number of columns must be 10");
        (0, assert_1.default)(this.regions.size === dimension, "number of regions must be 10");
        let totalCells = 0;
        for (const region of this.regions.values()) {
            for (const cell of region) {
                totalCells += 1;
                const row = cell[0] ?? assert_1.default.fail("cell is missing row value");
                const column = cell[1] ?? assert_1.default.fail("cell is missing row value");
                (0, assert_1.default)(row >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
                (0, assert_1.default)(column >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
            }
        }
        (0, assert_1.default)(totalCells === dimension * dimension, "must have total of 100 cells over all regions");
    }
    /**
     * Getter function for this.regions
     *
     * @returns Array<Array<{row: number, column: number}>> array of all the regions
     */
    getRegions() {
        const regions = [];
        for (const [key, region] of this.regions) {
            const regionCoords = [];
            for (const coord of region) {
                regionCoords.push({ row: coord[0], column: coord[1] });
            }
            regions.push(regionCoords);
        }
        return regions;
    }
    /**
     * Mutates puzzle by removing all stars
     *
     */
    emptyPuzzle() {
        for (let i = 0; i < this.rows * this.columns; ++i) {
            this.squares[i] = CellStates.Empty;
        }
    }
    /**
     * Checks if each region of the puzzle has exactly the needed number of stars, and no stars are
     * vertically, horizontally, or diagonally adjacent.
     *
     * @returns true if the puzzle is solved; false otherwise
     */
    isSolved() {
        // Check that each row has the number of stars needed
        for (let i = 0; i < this.rows; ++i) {
            let totalStars = 0;
            for (let j = 0; j < this.columns; ++j) {
                totalStars += this.squares[this.columns * i + j] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that each column has the number of stars needed
        for (let j = 0; j < this.columns; ++j) {
            let totalStars = 0;
            for (let i = 0; i < this.rows; ++i) {
                totalStars += this.squares[this.columns * i + j] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that each region has the number of stars needed
        for (const region of this.regions.values()) {
            let totalStars = 0;
            for (const [row, column] of region) {
                totalStars += this.squares[this.columns * (row - 1) + (column - 1)] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that no two stars are adjacent
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.columns; ++j) {
                if (this.squares[this.columns * i + j] === CellStates.Star && this.starAdjacent([i + 1, j + 1]))
                    return false;
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
    starAdjacent(position) {
        const [row, column] = position;
        const deltas = [-1, 0, 1];
        for (const deltaRow of deltas) {
            for (const deltaColumn of deltas) {
                const cellRow = row + deltaRow;
                const cellColumn = column + deltaColumn;
                if ((deltaRow === 0 && deltaColumn === 0) ||
                    (cellRow < 1 || cellRow > this.rows) ||
                    (cellColumn < 1 || cellColumn > this.columns))
                    continue;
                else {
                    if (this.squares[this.columns * (cellRow - 1) + (cellColumn - 1)] === CellStates.Star) {
                        console.log(cellRow, cellColumn);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Cycle a grid square between empty, starred, and blocked, in that order.
     *
     * @param position the position on the grid to be cycle
     * @returns the updated state of the grid square
     * @throws Error if x and y are not valid coordinates of the puzzle board.
     */
    cycleSquare(position) {
        const [row, column] = position;
        if (row < 1 || row > this.rows || column < 1 || column > this.columns)
            throw new Error("Cannot place a star at an invalid grid position");
        const status = this.squares[this.columns * (row - 1) + (column - 1)];
        switch (status) {
            case CellStates.Empty:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Blocked;
                break;
            case CellStates.Star:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Empty;
                break;
            case CellStates.Blocked:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Star;
                break;
            default:
                assert_1.default.fail();
        }
        this.checkRep();
        return this.squares[this.columns * (row - 1) + (column - 1)] ?? assert_1.default.fail("Grid square not found");
    }
    /**
     * Get coordinates of all stars on puzzle
     *
     * @returns Array<{row: number, column: number}> array of the coordinates of all the stars
     */
    getStars() {
        const stars = [];
        for (let i = 0; i < this.rows * this.columns; ++i) {
            if (this.squares[i] === CellStates.Star) {
                const col = i % this.columns;
                const row = Math.floor(i / this.rows);
                stars.push({ row: row, column: col });
            }
        }
        return stars;
    }
    /**
     * @inheritdoc
     */
    toString() {
        let stringRep = "";
        stringRep += `${this.rows}x${this.columns}\n`;
        for (const region of this.regions.values()) {
            const stars = new Array;
            const nonStars = new Array;
            for (const cell of region) {
                const row = cell[0] ?? assert_1.default.fail("cell is missing x value");
                const column = cell[1] ?? assert_1.default.fail("cell is missing y value");
                const cellState = this.squares[this.columns * (row - 1) + (column - 1)];
                if (cellState === CellStates.Star) {
                    stars.push([row, column]);
                }
                else {
                    nonStars.push([row, column]);
                }
            }
            let line = "";
            for (const star of stars) {
                const row = star[0] ?? assert_1.default.fail("cell is missing x value");
                const column = star[1] ?? assert_1.default.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '| ';
            for (const nonStar of nonStars) {
                const row = nonStar[0] ?? assert_1.default.fail("cell is missing x value");
                const column = nonStar[1] ?? assert_1.default.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '\n';
            stringRep += line;
        }
        return stringRep;
    }
}
exports.Puzzle = Puzzle;
/**
 * Parse a puzzle.
 *
 * @param input string representation of a puzzle to parse.
 * @returns puzzle ADT for the input
 * @throws Error if the string representation is invalid
 */
function parseString(input) {
    return (0, PuzzleParser_1.parsePuzzle)(input);
}
exports.parseString = parseString;
/**
 * Parse a puzzle.
 *
 * @param filename path to the file containing the string representation of a puzzle to parse, excluding comments
 * @returns puzzle ADT for the input
 * @throws Error if the filename or string representation is invalid
 */
async function parseFile(filename) {
    const fileContents = (await fs_1.default.promises.readFile(filename)).toString();
    let stringRep = "";
    const lines = fileContents.split('\n');
    for (const line of lines) {
        if (!line.startsWith("#") && line.length > 0) {
            stringRep += line + '\n';
        }
    }
    return (0, PuzzleParser_1.parsePuzzle)(stringRep);
}
exports.parseFile = parseFile;
//# sourceMappingURL=Puzzle.js.map