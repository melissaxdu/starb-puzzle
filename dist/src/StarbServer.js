"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const Puzzle_1 = require("./Puzzle");
/**
 * Start a game server at port 8789 using a given puzzle file
 *
 * Command-line usage:
 *     npm start FILENAME
 * where:
 *
 *   - FILENAME is the path to a valid puzzle file, which will be loaded as
 *     the starting puzzle board.
 *
 * For example, to start a web server on 8789 using the
 * puzzle in `puzzles/hearts.txt`:
 *     npm start puzzles/hearts.txt
 *
 * @throws Error if an error occurs parsing a file or starting a server
 */
async function main() {
    const port = 8789;
    const server = new WebServer(port);
    await server.start();
}
/**
 * HTTP web game server.
 */
class WebServer {
    /**
     * Make a new web game server using board that listens for connections on port.
     *
     * @param requestedPort server port number
     */
    constructor(requestedPort) {
        this.requestedPort = requestedPort;
        this.app = (0, express_1.default)();
        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });
        /*
         * Handle a request for /getPuzzle/<filename>.
         */
        this.app.get('/getPuzzle/:filename', (0, express_async_handler_1.default)(async (request, response) => {
            const { filename } = request.params;
            (0, assert_1.default)(filename);
            const emptyPuzzle = await (0, Puzzle_1.parseFile)(`puzzles/${filename}.starb`);
            emptyPuzzle.emptyPuzzle();
            response
                .status(http_status_codes_1.default.OK) // 200
                .type('text')
                .send(emptyPuzzle.toString());
        }));
    }
    /**
     * Start this server.
     *
     * @returns (a promise that) resolves when the server is listening
     */
    start() {
        return new Promise(resolve => {
            this.server = this.app.listen(this.requestedPort, () => {
                console.log('server now listening at', this.requestedPort);
                resolve();
            });
        });
    }
    /**
     * @returns the actual port that server is listening at. (May be different
     *          than the requestedPort used in the constructor, since if
     *          requestedPort = 0 then an arbitrary available port is chosen.)
     *          Requires that start() has already been called and completed.
     */
    get port() {
        const address = this.server?.address() ?? 'not connected';
        if (typeof (address) === 'string') {
            throw new Error('server is not listening at a port');
        }
        return address.port;
    }
    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    stop() {
        this.server?.close();
        console.log('server stopped');
    }
}
// exports.WebServer = WebServer;
if (require.main === module) {
    void main();
}
//# sourceMappingURL=StarbServer.js.map