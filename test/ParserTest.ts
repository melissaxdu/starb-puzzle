import { Puzzle, parseString, parseFile } from '../src/Puzzle';
import assert from 'assert';
import fs from 'fs';

/**
 * Tests for Puzzle Parser
 */
describe('Puzzle Parser', function () {
    /**
     * Testing strategy
     * 
     * partition on filename:
     *   - kd-6-31-6
     *   - kd-1-1-1
     *   - invalid filename
     * partition on puzzle from file:
     *   - is a valid puzzle
     *   - is not a valid puzzle
     */

    it('uses parser for invalid puzzle - should throw error', async function () {
        const filename = "puzzles/invalidPuzzle.starb";
        assert.rejects( async () => await parseFile(filename));
    });

    it('uses parser for invalid filename - should throw error', async function () {
        const filename = "puzzles/randomFilename.starb";
        assert.rejects( async () => await parseFile(filename));
    });

    it('uses parser for puzzle kd-6-31-6', async function () {
        const filename = "puzzles/kd-6-31-6.starb";
        const puzzle = await parseFile(filename);
        assert(puzzle.isSolved());
    });

    it('uses parser for puzzle kd-1-1-1', async function () {
        const filename = "puzzles/kd-1-1-1.starb";
        const puzzle = await parseFile(filename);
        assert(puzzle.isSolved());
    });

    it('uses parser for empty puzzle', async function () {
        const filename = "puzzles/emptyPuzzle.starb";
        const puzzle = await parseFile(filename);
        assert(!puzzle.isSolved());
    });
})