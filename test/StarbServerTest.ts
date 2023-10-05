/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This test file runs in Node.js, see the `npm test` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.
// See the *Testing* section of the project handout for more advice.

import assert from 'assert';
import fetch from 'node-fetch';
import { WebServer } from "../src/StarbServer";

describe('server', function() {
    
    /**
     * Test strategy
     * 
     * partition on filename:
     *   - kd-6-31-6
     *   - kd-1-1-1
     *   - not a valid filename
     * partition on puzzle:
     *   - puzzle contained in the file is a valid puzzle
     *   - puzzle contained in the file is not a valid puzzle
     * partition on get sendPuzzle:
     *   - successfully sends the empty puzzle string
     *   - throws an error
     */
    
    it("testing puzzle kd-6-31-6 - should successfully return empty puzzle string", async function () {
        const port = 8789;
        const server = new WebServer(port);
        await server.start();
        const filename = "kd-6-31-6";
        const promise = fetch(`http://localhost:8789/getPuzzle/${filename}`);
        const response = await promise;
        const puzzleString = await response.text();
        const expectedString = `10x10\n| 2,1 1,1 3,1 \n| 1,2 1,3 1,4 1,5 2,2 2,4 2,5 2,3 3,5 \n| 1,7 1,8 1,9 1,10 2,9 2,10 1,6 2,8 \n| 3,2 3,3 3,4 4,1 4,2 4,3 4,4 4,5 5,1 5,2 5,3 5,5 6,1 6,3 6,4 6,5 7,1 7,2 7,5 8,1 8,5 9,1 10,1 6,2 5,4 \n| 2,6 2,7 3,6 3,7 3,8 3,9 4,6 4,7 4,9 5,7 6,6 6,7 6,8 7,6 5,6 4,8 \n| 3,10 5,8 5,9 5,10 6,9 7,9 7,10 8,10 9,10 10,10 4,10 6,10 \n| 7,3 8,3 8,4 9,2 10,2 7,4 8,2 \n| 8,6 8,7 9,3 9,4 9,6 10,4 10,5 9,5 10,3 \n| 7,8 8,8 9,8 7,7 8,9 \n| 9,9 10,6 10,7 10,8 9,7 10,9 \n`;
        assert(expectedString === puzzleString);
        server.stop()
    })

    it("testing puzzle kd-1-1-1 - should successfully return empty puzzle string", async function () {
        const port = 8789;
        const server = new WebServer(port);
        await server.start();
        const filename = "kd-1-1-1";
        const promise = fetch(`http://localhost:8789/getPuzzle/${filename}`);
        const response = await promise;
        const puzzleString = await response.text();
        const expectedString = `10x10\n| 1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5 1,2 1,5 \n| 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10 2,9 4,10 \n| 3,3 3,2 3,4 \n| 3,6 3,7 3,8 2,7 4,8 \n| 3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6 6,1 9,1 \n| 4,5 5,5 6,4 6,5 6,6 5,4 5,6 \n| 4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8 6,8 8,7 \n| 6,3 7,4 7,3 7,5 \n| 7,9 9,9 9,10 8,9 10,10 \n| 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9 9,3 10,6 \n`;
        assert(expectedString === puzzleString);
        server.stop()
    })

    it("invalid filename - should throw an error", async function () {
        const port = 8789;
        const server = new WebServer(port);
        await server.start();
        const filename = "invalidPuzzle";
        assert.rejects(async () => fetch(`http://localhost:8789/getPuzzle/${filename}`));        
        server.stop()
    })

    it("invalid puzzle - should throw an error", async function () {
        const port = 8789;
        const server = new WebServer(port);
        await server.start();
        const filename = "randomFileName";
        assert.rejects(async () => fetch(`http://localhost:8789/getPuzzle/${filename}`));        
        server.stop()
    })
});