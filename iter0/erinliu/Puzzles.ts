/**
 * An immutable data type representing a Star Battle puzzle
 */
export interface Puzzle {

    /**
     * @returns a parsable representation of the puzzle
     */
    toString(): string;
    
    /**
     * @param that any Puzzle
     * @returns true if and only if this and that are structurally-equal Puzzle.
     */
    equalValue(that: Puzzle): boolean;

    /**
     * Checks if each region of the puzzle has exactly 2 stars, and no stars are 
     * vertically, horizontally, or diagonally adjacent.
     * 
     * @returns true if the puzzle is solved; false otherwise
     */
    isSolved(): boolean;

    /**
     * If there is no star at the given coordinate, place a star there.
     * Else, remove the star that is already there.
     * 
     * @throws Error if x and y are not valid coordinates of the puzzle board.
     */  
    clickGrid(x: number, y: number): void;
}