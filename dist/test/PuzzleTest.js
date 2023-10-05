"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Puzzle_1 = require("../src/Puzzle");
const assert_1 = __importDefault(require("assert"));
/**
 * Tests for Puzzle ADT
 */
describe('Puzzle', function () {
    /**
     * Testing strategy
     *
     * partition on isSolved:
     *   - returns true
     *   - returns false
     * partition on state of the puzzle:
     *   - empty puzzle (no stars)
     *   - unfinished puzzle (some stars but unsolved)
     *   - solved puzzle (all stars correctly placed)
     * partition on toString result:
     *   - returns empty puzzle string representation
     *   - returns unfinished puzzle string representation
     *   - returns solved puzzle string representation
     * partition on parseFile:
     *   - parses puzzle kd-6-31-6
     *   - parses puzzle kd-1-1-1
     */
    it('uses parser for puzzle kd-6-31-6', async function () {
        const filename = "puzzles/kd-6-31-6.starb";
        const puzzle = await (0, Puzzle_1.parseFile)(filename);
        (0, assert_1.default)(puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(newPuzzle.isSolved());
    });
    it('uses parser for puzzle kd-1-1-1', async function () {
        const filename = "puzzles/kd-1-1-1.starb";
        const puzzle = await (0, Puzzle_1.parseFile)(filename);
        (0, assert_1.default)(puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(newPuzzle.isSolved());
    });
    it('uses parser for empty puzzle', async function () {
        const filename = "puzzles/emptyPuzzle.starb";
        const puzzle = await (0, Puzzle_1.parseFile)(filename);
        (0, assert_1.default)(!puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(!newPuzzle.isSolved());
    });
    it('uses parser for unfinished puzzle', async function () {
        const filename = "puzzles/kd-1-1-1.starb";
        const puzzle = await (0, Puzzle_1.parseFile)(filename);
        puzzle.cycleSquare([4, 10]);
        (0, assert_1.default)(!puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(!newPuzzle.isSolved());
    });
    it('directly creates empty puzzle', async function () {
        const regions = new Map();
        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]]);
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]]);
        const puzzle = new Puzzle_1.Puzzle(regions);
        (0, assert_1.default)(!puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(!newPuzzle.isSolved());
    });
    it('directly creates solved puzzle', async function () {
        const regions = new Map();
        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]]);
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]]);
        const puzzle = new Puzzle_1.Puzzle(regions);
        puzzle.cycleSquare([1, 2]);
        puzzle.cycleSquare([1, 5]);
        puzzle.cycleSquare([2, 9]);
        puzzle.cycleSquare([4, 10]);
        puzzle.cycleSquare([3, 2]);
        puzzle.cycleSquare([3, 4]);
        puzzle.cycleSquare([2, 7]);
        puzzle.cycleSquare([4, 8]);
        puzzle.cycleSquare([6, 1]);
        puzzle.cycleSquare([9, 1]);
        puzzle.cycleSquare([5, 4]);
        puzzle.cycleSquare([5, 6]);
        puzzle.cycleSquare([6, 8]);
        puzzle.cycleSquare([8, 7]);
        puzzle.cycleSquare([7, 3]);
        puzzle.cycleSquare([7, 5]);
        puzzle.cycleSquare([8, 9]);
        puzzle.cycleSquare([10, 10]);
        puzzle.cycleSquare([9, 3]);
        puzzle.cycleSquare([10, 6]);
        (0, assert_1.default)(puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(newPuzzle.isSolved());
    });
    it('directly creates unfinished puzzle', async function () {
        const regions = new Map();
        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]]);
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]]);
        const puzzle = new Puzzle_1.Puzzle(regions);
        puzzle.cycleSquare([1, 2]);
        puzzle.cycleSquare([1, 5]);
        puzzle.cycleSquare([2, 9]);
        puzzle.cycleSquare([4, 10]);
        puzzle.cycleSquare([3, 2]);
        puzzle.cycleSquare([2, 7]);
        puzzle.cycleSquare([4, 8]);
        puzzle.cycleSquare([6, 1]);
        puzzle.cycleSquare([9, 1]);
        puzzle.cycleSquare([5, 4]);
        puzzle.cycleSquare([5, 6]);
        puzzle.cycleSquare([6, 8]);
        puzzle.cycleSquare([8, 7]);
        puzzle.cycleSquare([7, 3]);
        puzzle.cycleSquare([7, 5]);
        puzzle.cycleSquare([8, 9]);
        puzzle.cycleSquare([10, 10]);
        puzzle.cycleSquare([9, 3]);
        puzzle.cycleSquare([10, 6]);
        (0, assert_1.default)(!puzzle.isSolved());
        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await (0, Puzzle_1.parseString)(stringRep);
        (0, assert_1.default)(!newPuzzle.isSolved());
    });
});
//# sourceMappingURL=PuzzleTest.js.map