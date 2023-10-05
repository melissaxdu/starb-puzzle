const grammar = `
@skip whitespace {
    grid ::= dims region*;
    dims ::= [0-9]+ 'x' [0-9]+;
    region ::= star star '|' coord+ '\n';
}
region ::= [A-Za-z]+;
star ::= [0-9] ',' [0-9];
`