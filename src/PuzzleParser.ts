import assert from 'assert';
import { Puzzle } from './Puzzle';
import { Parser, ParseTree, compile } from 'parserlib';

/**
 * Parser for puzzles.
 * 
 */
const grammar = `
@skip whitespace {
    puzzle ::= dimensions [\\n] region*;
    dimensions ::= number 'x' number+;
    region ::= star* '|' coord+ [\\n];
}
star ::= number ',' number;
coord ::= number ',' number;
number ::= [0-9]+;
whitespace ::= [ \\t\\r]+;
`;

// the nonterminals of the grammar
enum PuzzleGrammar {
    Puzzle, Dimensions, Region, Star, Coord, Number, Whitespace
}

// compile the grammar into a parser
const parser: Parser<PuzzleGrammar> = compile(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);

/**
 * Parse a string into a puzzle.
 * 
 * @param input string to parse
 * @returns Puzzle parsed from the string
 * @throws ParseError if the string doesn't match the Puzzle grammar
 */
export function parsePuzzle(input: string): Puzzle {
    // parse the example into a parse tree
    const parseTree: ParseTree<PuzzleGrammar> = parser.parse(input);
    // make a puzzle from the parse tree
    const puzzle: Puzzle = getPuzzle(parseTree);    
    return puzzle;
}

/**
 * Convert a parse tree into a record containing puzzle dimensions.
 * 
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing puzzle dimensions
 */
function getDimensions(parseTree: ParseTree<PuzzleGrammar>): {numRows:number, numCols:number} {
    // dimensions ::= [0-9]+ 'x' [0-9]+;
    const dimensions: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Number);
    const numRows = getNumber(dimensions[0] ?? assert.fail("missing number of rows"));
    const numCols = getNumber(dimensions[1] ?? assert.fail("missing number of columns"));
    return {numRows:numRows, numCols:numCols};
}

/**
 * Convert a parse tree into a number.
 * 
 * @param parseTree constructed according to the grammar for puzzles
 * @returns the number represented by the parseTree
 */
function getNumber(parseTree: ParseTree<PuzzleGrammar>): number {
    // number ::= [0-9]+;
    return parseInt(parseTree.text) ?? assert.fail("invalid dimensions");
}

/**
 * Convert a parse tree into a record containing coordinates and stars of the given region.
 * 
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing coordinates and stars of the given region
 */
function getRegion(parseTree: ParseTree<PuzzleGrammar>): {
    coords: Array<[number, number]>, stars: Array<[number, number]>
} {
    // region ::= star* '|' coord+ '\n';
    const stars = parseTree.childrenByName(PuzzleGrammar.Star).map(star => getCoordinate(star));
    const coords = parseTree.childrenByName(PuzzleGrammar.Coord).map(coord => getCoordinate(coord)).concat([...stars]);
    return {coords: coords, stars: stars};
}

/**
 * Convert a parse tree into a coordinate
 * 
 * @param parseTree constructed according to the grammar for puzzles
 * @returns an array containing coordinate numbers
 */
function getCoordinate(parseTree: ParseTree<PuzzleGrammar>): [number, number] {
    // coord ::= number ',' number;
    const coords: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Number);
    const x = getNumber(coords[0] ?? assert.fail("missing coordinate"));
    const y = getNumber(coords[1] ?? assert.fail("missing coordinate"));
    return [x, y];
}

/**
 * Convert a parse tree into a puzzle.
 * 
 * @param parseTree constructed according to the grammar for puzzles
 * @returns new puzzle corresponding to the parseTree
 */
function getPuzzle(parseTree: ParseTree<PuzzleGrammar>): Puzzle {
    // puzzle ::= dimensions '\n' region*;
    const dimension = 10;
    const dimensions = getDimensions(parseTree.children[0] ?? assert.fail('missing child'));
    assert(dimensions.numRows === dimension, "our ADT can only handle 10x10 puzzles");
    assert(dimensions.numCols === dimension, "our ADT can only handle 10x10 puzzles");

    const regions = parseTree.childrenByName(PuzzleGrammar.Region).map(region => getRegion(region));
    const map = new Map<number, Array<[number, number]>>();
    const allStars = new Array<[number, number]>;
    for (const [regionID, region] of regions.entries()) {
        map.set(regionID, region.coords);
        allStars.push(...region.stars);
    }
    let puzzle = new Puzzle(map);
    for (const star of allStars) {
        puzzle = puzzle.cycleSquare(star);
        puzzle = puzzle.cycleSquare(star);
    }
    return puzzle;
}


