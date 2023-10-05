/**
 * Manual tests for integration of the entire client/server system
 */
describe('Integration', function () {

    /**
     * Testing strategy
     * 
     * partition on client request:
     *   - requests to the server to get the blank puzzle
     * partition on "Check if Solved" button click:
     *   - informs client if the puzzle is unfinished
     *   - informs client if the puzzle is solved
     * partition on user clicks:
     *   - partition on location of click: 
     *      - inside grid
     *      - outside grid
     *   - partition on whether there is a star on the grid of the click
     *      - there is a star on the grid of the click
     *      - there is a block on the grid of the click
     *      - the grid of the click is empty
     */

    /*
     * Manual test: Initialize a game
     * Covers: client requests to play a puzzle
     * 1. browse to the main website
     * 2. assert that you can see the website content 
     * 2. assert that you can load the blank puzzle grid
     */

    /*
     * Manual test: Playing the puzzle
     * Covers: client requests to play a puzzle, client places a block, client places a star, client removes a star
     * 1. browse to the main website
     * 2. assert that you can see the website content
     * 3. assert that you can load the blank puzzle grid
     * 4. click a grid => assert that you can place a block on the empty grid
     * 5. click the grid again => assert that the block turns into a star
     * 6. click outside of the grid => nothing should happen
     * 7. click the grid again => assert that the star disappears
     */

    /*
     * Manual test: Unfinished puzzle
     * Covers: client requests to play a puzzle, client places a block, client places a star, client removes a star, client is informed if the puzzle is unfinished
     * 1. browse to the main website
     * 2. assert that you can see the website content
     * 3. assert that you can load the blank puzzle grid
     * 4. click a grid => assert that you can place a block on the empty grid
     * 5. click the grid again => assert that the block turns into a star
     * 6. click outside of the grid => nothing should happen
     * 7. click the grid again => assert that the star disappears
     * 8. click the "Check if Solved" button => assert you get a message that the puzzle is unsolved

     */

    /*
     * Manual test: Solving the puzzle
     * Covers: client requests to play a puzzle, client places a star, client removes a star, client is informed if the puzzle is done
     * 1. browse to the main website
     * 2. assert that you can see the website content
     * 3. assert that you can load the blank puzzle grid
     * 4. click a grid => assert that you can place a block on the empty grid
     * 5. click the grid again => assert that the block turns into a star
     * 6. click outside of the grid => nothing should happen
     * 7. click the grid again => assert that the star disappears
     * 8. click a couple of grids and place stars until you solve the puzzle
     * 9. click the "Check if Solved" button => assert you get a message that you solved the puzzle
     */
});