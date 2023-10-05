import { Puzzle, parseString, parseFile } from '../src/Puzzle';
import assert from 'assert';
import fs from 'fs';

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
     * partition on how Puzzle was created:
     *   - directed created
     *   - returned from parser
     */

    it('tests toString and isSolved for empty puzzle from parser', async function () {
        const filename = "puzzles/emptyPuzzle.starb";
        const puzzle = await parseFile(filename);
        assert(!puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(!newPuzzle.isSolved());
    });

    it('tests toString and isSolved for unfinished puzzle from parser', async function () {
        const filename = "puzzles/kd-1-1-1.starb";
        let puzzle = await parseFile(filename);
        puzzle = puzzle.cycleSquare([4, 10]);

        assert(!puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(!newPuzzle.isSolved());
    });

    it('tests toString and isSolved for solved puzzle from parser', async function () {
        const filename = "puzzles/kd-1-1-1.starb";
        const puzzle = await parseFile(filename);
        assert(puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(newPuzzle.isSolved());
    });

    it('tests directly creating empty puzzle', async function () {
        const regions = new Map<number, Array<[number, number]>>();

        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]])
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]])

        const puzzle = new Puzzle(regions);

        assert(!puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(!newPuzzle.isSolved());
    });

    it('tests directly creating solved puzzle', async function () {
        const regions = new Map<number, Array<[number, number]>>();

        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]])
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]])

        let puzzle = new Puzzle(regions);
        
        // you need to cycleSquare twice to turn an empty square into a star
        for (let i = 0; i < 2; i++) {
            puzzle = puzzle.cycleSquare([1, 2]); puzzle = puzzle.cycleSquare([1, 5]);
            puzzle = puzzle.cycleSquare([2, 9]); puzzle = puzzle.cycleSquare([4, 10]);
            puzzle = puzzle.cycleSquare([3, 2]); puzzle = puzzle.cycleSquare([3, 4]);
            puzzle = puzzle.cycleSquare([2, 7]); puzzle = puzzle.cycleSquare([4, 8]);
            puzzle = puzzle.cycleSquare([6, 1]); puzzle = puzzle.cycleSquare([9, 1]);
            puzzle = puzzle.cycleSquare([5, 4]); puzzle = puzzle.cycleSquare([5, 6]);
            puzzle = puzzle.cycleSquare([6, 8]); puzzle = puzzle.cycleSquare([8, 7]);
            puzzle = puzzle.cycleSquare([7, 3]); puzzle = puzzle.cycleSquare([7, 5]);
            puzzle = puzzle.cycleSquare([8, 9]); puzzle = puzzle.cycleSquare([10, 10]);
            puzzle = puzzle.cycleSquare([9, 3]); puzzle = puzzle.cycleSquare([10, 6]);
        }
        
        assert(puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(newPuzzle.isSolved());
    });

    it('tests directly creating unfinished puzzle', async function () {
        const regions = new Map<number, Array<[number, number]>>();

        regions.set(0, [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [3, 5]]);
        regions.set(1, [[2, 9], [4, 10], [1, 9], [1, 10], [2, 10], [3, 9], [3, 10], [4, 9], [5, 9], [5, 10], [6, 9], [6, 10], [7, 10], [8, 10]])
        regions.set(2, [[3, 2], [3, 3], [3, 4]]);
        regions.set(3, [[2, 7], [4, 8], [3, 6], [3, 7], [3, 8]]);
        regions.set(4, [[6, 1], [9, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [6, 2], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]]);
        regions.set(5, [[5, 4], [5, 6], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6]]);
        regions.set(6, [[6, 8], [8, 7], [4, 6], [4, 7], [5, 7], [5, 8], [6, 7], [7, 6], [7, 7], [7, 8], [8, 8]]);
        regions.set(7, [[7, 3], [7, 5], [6, 3], [7, 4]]);
        regions.set(8, [[8, 9], [10, 10], [7, 9], [9, 9], [9, 10]]);
        regions.set(9, [[9, 3], [10, 6], [9, 2], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 7], [10, 8], [10, 9]])

        let puzzle = new Puzzle(regions);
        
        for (let i = 0; i < 2; i++) {
            puzzle = puzzle.cycleSquare([1, 2]); puzzle = puzzle.cycleSquare([1, 5]);
            puzzle = puzzle.cycleSquare([2, 9]); puzzle = puzzle.cycleSquare([4, 10]);
            puzzle = puzzle.cycleSquare([3, 2]); 
            puzzle = puzzle.cycleSquare([6, 1]); puzzle = puzzle.cycleSquare([9, 1]);
            puzzle = puzzle.cycleSquare([5, 4]); puzzle = puzzle.cycleSquare([5, 6]);
            puzzle = puzzle.cycleSquare([6, 8]); puzzle = puzzle.cycleSquare([8, 7]);
            puzzle = puzzle.cycleSquare([7, 3]); puzzle = puzzle.cycleSquare([7, 5]);
            puzzle = puzzle.cycleSquare([8, 9]); puzzle = puzzle.cycleSquare([10, 10]);
            puzzle = puzzle.cycleSquare([9, 3]); puzzle = puzzle.cycleSquare([10, 6]);
        }

        assert(!puzzle.isSolved());

        // tests that toString returns the same puzzle representation
        const stringRep = puzzle.toString();
        const newPuzzle = await parseString(stringRep);
        assert(!newPuzzle.isSolved());
    });
})