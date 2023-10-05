/**
 * Manual tests for integration of the entire client/server system
 */
describe('Integration', function () {

    /**
     * Test strategy
     * 
     * partition on puzzle:
     *   puzzle is done, puzzle is in progress, puzzle is not in progress
     * partition on user clicks:
     *   inside grid on star
     *   inside grid on blocked space
     *   inside grid on empty space
     *   outside grid
     */

    /*
     * Manual test: Play game
     * 1. Navigate to puzzle server: assert puzzle should appear
     * 2. Click outside the puzzle: assert no response
     * 3. Click on cell 3 inside puzzle: assert cell 3 becomes blocked with correct symbol
     * 4. Click on cell 5 inside puzzle: assert cell 5 becomes blocked with correct symbol
     * 5. Click on cell 3 inside puzzle: assert cell 3 becomes starred
     * 6. Click on cell 3 inside puzzle: assert cell 3 becomes empty
     * 7. Continue playing game until all blocks, rows, and columns have correct # of stars: assert server shows that game is over
     */
});