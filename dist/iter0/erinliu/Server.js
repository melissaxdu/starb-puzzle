"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebServer = void 0;
const express_1 = __importDefault(require("express"));
/**
 * Start a puzzle server with the given puzzle file.
 *
 * Command-line usage:
 *     npm start PORT FILENAME
 * where:
 *   - PORT is an integer that specifies the server's listening port number,
 *     which will be port 8789.
 *   - FILENAME is the path to a valid puzzle file, which will be loaded as
 *     the starting blank puzzle.
 *
 * @throws Error if an error occurs parsing a file or starting a server
 */
function main() {
    //TODO
}
/**
 * HTTP web game server.
 */
class WebServer {
    /**
     * Make a new web game server using board that listens for connections on port.
     *
     * @param puzzle shared game board
     */
    constructor(puzzle) {
        this.puzzle = puzzle;
        this.port = 8789;
        this.app = (0, express_1.default)();
        /*
         * Handle a request for /sendPuzzle.
         */
        this.app.get('/sendPuzzle', (request, response) => {
            //TODO
        });
    }
    /**
     * Start this server.
     *
     * @returns (a promise that) resolves when the server is listening
     */
    start() {
        return new Promise(resolve => {
            this.server = this.app.listen(this.port, () => {
                console.log('server now listening at', this.port);
                resolve();
            });
        });
    }
    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    stop() {
        this.server?.close();
        console.log('server stopped');
    }
}
exports.WebServer = WebServer;
if (require.main === module) {
    void main();
}
//# sourceMappingURL=Server.js.map