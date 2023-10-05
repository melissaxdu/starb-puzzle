import { CellState } from "./Puzzle";

/**
 * Client ADT that interacts with server to modify a Star Battle board
 */
export interface Client {
    // Abstraction function:
    //   AF(): 
    // Representation invariant:
    //   return
    // Safety from rep exposure:
    //   no fields

    /**
     * Clicks a spot on the board, returns new board state
     */
    click(): CellState;
}

/**
 * Testing strategy:
 *      Player clicks outside board
 *      Player clicks inside board, on an empty space
 *      Player clicks inside board, on a blocked space
 *      Player clicks inside board, on a star
 *      Player places a star that wins the game
 */