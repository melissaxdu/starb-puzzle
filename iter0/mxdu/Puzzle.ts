import assert from 'assert';

export class Puzzle {
    // Abstraction function:
    //   AF(rows, cols, blocks, puzzleState): Star Battle board of size `rows` by `cols` with blocks `blocks` and with cell states represented in `puzzleState`
    //                                        and requiring starsNeeded in each row, col, and block to win
    // Representation invariant:
    //   rows and cols are positive integers, blocks is composed of sets of integers that range from 0 to rows*cols with each integer in that range appearing once
    //   and all indices in the same set being vertically or horizontally adjacent,
    //   keys of puzzleState are integers that range from 0 to rows*cols, starsNeeded is either one, two, or three
    // Safety from rep exposure:
    //   all fields are private and immutable, blocks and puzzleState will never be directly returned from function, and constructor makes defensive copies

    private readonly rows: number;
    private readonly cols: number;
    private readonly starsNeeded: number;
    private readonly blocks: Set<Set<number>>;
    private readonly puzzleState: Map<number, CellState> = new Map();

    /**
     * Construct a Star Battle game board
     * 
     * @param starsNeeded an array of all the Cards on the board along with their states
     * @param rows # of rows on board
     * @param cols # of cols on board
     * @param blocks sets
     */
    public constructor(starsNeeded: number, rows: number, cols: number) {
    }

    /**
     * Add blocks to the Board
     * 
     * @throws Error if blocks are invalid
     */

    public setBlocks(blocks: Set<Set<number>>): void {

    }

    /**
     * Return a defensive copy of the blocks on the Board
     * 
     * @returns defensive copy of all the blocks on the Board
     */
    public getBlocks(): Set<Set<number>> {

    }

    /** 
     * Checks if game is over
     * 
     * @returns true or false depeneding on whether or not the game has been won
     */

    public isWon(): boolean {

    }
    
    /**
     * 
     * @returns number of rows
     */
    public getRows() {
        return this.rows;
    }

    /**
     * 
     * @returns number of columns
     */
    public getCols() {
        return this.cols;
    }

    /**
     * Stars a spot on the board
     * 
     * @param number index of cell to star
     */
    public starCell(cell: number) {

    }

}

export enum CellState {
    Empty,
    Blocked,
    Starred
}