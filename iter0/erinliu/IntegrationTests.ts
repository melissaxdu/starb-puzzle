/**
 * Manual tests for integration of the entire client/server system
 */
describe('Integration', function () {

    /**
     * Test strategy
     * 
     * partition on client request:
     *   - requests to play a puzzle
     * partition on server response:
     *   - notifies client when the puzzle is done
     * partition on user clicks:
     *   - partition on location of click: 
     *      - on boundary of grid
     *      - inside grid
     *      - outside grid
     *   - partition on whether there is a star on the grid of the click
     *      - there is a star on the grid of the click
     *      - the grid of the click is empty
     */

    /*
     * Manual test: Initialize a game
     * Covers: client requests to play a puzzle
     * 1. browse to the main website => assert that you can see the website content
     * 2. click "play puzzle" => assert that you can load the puzzle
     */

    /*
     * Manual test: Playing the puzzle
     * Covers: client requests to play a puzzle, client places a star, client removes a star
     * 1. browse to the main website => assert that you can see the website content
     * 2. click "play puzzle" => assert that you can load the puzzle
     * 3. click a grid => assert that you can place a star on the empty grid
     * 4. click outside of the grid => nothing should happen
     * 5. click the grid again => assert that the star disappears
     */

    /*
     * Manual test: Solving the puzzle
     * Covers: client requests to play a puzzle, client places a star, client removes a star, client is informed when the puzzle is done
     * 1. browse to the main website => assert that you can see the website content
     * 2. click "play puzzle" => assert that you can load the puzzle
     * 3. click a couple of grids until you solve the puzzle => assert you get a message that you solved the puzzle
     */
});