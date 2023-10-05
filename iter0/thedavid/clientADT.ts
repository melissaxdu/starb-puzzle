/**
 * Client ADT that sends messages to the server to update the board
 */
export interface Client {
    /**
     * sends a message to the server containing the mouse position whenever the player clicks on the screen
     */
    click(): void;
}

/**
 * Testing strategy:
 *      Player clicks outside the board
 *      Player clicks inside the board, on an empty space
 *      Player clicks inside the board, on a star
 *      Player places a star that wins the game
 */