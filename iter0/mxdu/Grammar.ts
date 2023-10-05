import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';

const grammar = `
@skip whitespace {
    board ::= dims blocks boardState;
    blocks ::= 'BLOCKS: ' number (' ' number)+;
    boardState ::= cell ('|' cell)*;
    cell ::= number [X* ];
}
dims ::= number 'x' number '\n';
number ::= [0-9]+;
whitespace ::= [ \\t\\r\\n]+;
`;