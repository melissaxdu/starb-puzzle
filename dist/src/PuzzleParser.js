"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePuzzle = void 0;
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const parserlib_1 = require("parserlib");
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
var PuzzleGrammar;
(function (PuzzleGrammar) {
    PuzzleGrammar[PuzzleGrammar["Puzzle"] = 0] = "Puzzle";
    PuzzleGrammar[PuzzleGrammar["Dimensions"] = 1] = "Dimensions";
    PuzzleGrammar[PuzzleGrammar["Region"] = 2] = "Region";
    PuzzleGrammar[PuzzleGrammar["Star"] = 3] = "Star";
    PuzzleGrammar[PuzzleGrammar["Coord"] = 4] = "Coord";
    PuzzleGrammar[PuzzleGrammar["Number"] = 5] = "Number";
    PuzzleGrammar[PuzzleGrammar["Whitespace"] = 6] = "Whitespace";
})(PuzzleGrammar || (PuzzleGrammar = {}));
// compile the grammar into a parser
const parser = (0, parserlib_1.compile)(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);
/**
 * Parse a string into a puzzle.
 *
 * @param input string to parse
 * @returns Puzzle parsed from the string
 * @throws ParseError if the string doesn't match the Puzzle grammar
 */
function parsePuzzle(input) {
    // parse the example into a parse tree
    const parseTree = parser.parse(input);
    // make a puzzle from the parse tree
    const puzzle = getPuzzle(parseTree);
    return puzzle;
}
exports.parsePuzzle = parsePuzzle;
/**
 * Convert a parse tree into a record containing puzzle dimensions.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing puzzle dimensions
 */
function getDimensions(parseTree) {
    // dimensions ::= [0-9]+ 'x' [0-9]+;
    const dimensions = parseTree.childrenByName(PuzzleGrammar.Number);
    const numRows = getNumber(dimensions[0] ?? assert_1.default.fail("missing number of rows"));
    const numCols = getNumber(dimensions[1] ?? assert_1.default.fail("missing number of columns"));
    return { numRows: numRows, numCols: numCols };
}
/**
 * Convert a parse tree into a number.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns the number represented by the parseTree
 */
function getNumber(parseTree) {
    // number ::= [0-9]+;
    return parseInt(parseTree.text) ?? assert_1.default.fail("invalid dimensions");
}
/**
 * Convert a parse tree into a record containing coordinates and stars of the given region.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing coordinates and stars of the given region
 */
function getRegion(parseTree) {
    // region ::= star* '|' coord+ '\n';
    const stars = parseTree.childrenByName(PuzzleGrammar.Star).map(star => getCoordinate(star));
    const coords = parseTree.childrenByName(PuzzleGrammar.Coord).map(coord => getCoordinate(coord)).concat([...stars]);
    return { coords: coords, stars: stars };
}
/**
 * Convert a parse tree into a coordinate
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns an array containing coordinate numbers
 */
function getCoordinate(parseTree) {
    // coord ::= number ',' number;
    const coords = parseTree.childrenByName(PuzzleGrammar.Number);
    const x = getNumber(coords[0] ?? assert_1.default.fail("missing coordinate"));
    const y = getNumber(coords[1] ?? assert_1.default.fail("missing coordinate"));
    return [x, y];
}
/**
 * Convert a parse tree into a puzzle.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns new puzzle corresponding to the parseTree
 */
function getPuzzle(parseTree) {
    // puzzle ::= dimensions '\n' region*;
    const dimension = 10;
    const dimensions = getDimensions(parseTree.children[0] ?? assert_1.default.fail('missing child'));
    (0, assert_1.default)(dimensions.numRows === dimension, "our ADT can only handle 10x10 puzzles");
    (0, assert_1.default)(dimensions.numCols === dimension, "our ADT can only handle 10x10 puzzles");
    const regions = parseTree.childrenByName(PuzzleGrammar.Region).map(region => getRegion(region));
    const map = new Map();
    const allStars = new Array;
    for (const [regionID, region] of regions.entries()) {
        map.set(regionID, region.coords);
        allStars.push(...region.stars);
    }
    const puzzle = new Puzzle_1.Puzzle(map);
    for (const star of allStars) {
        puzzle.cycleSquare(star);
    }
    return puzzle;
}
//# sourceMappingURL=PuzzleParser.js.map