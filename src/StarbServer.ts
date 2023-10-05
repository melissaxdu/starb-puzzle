import assert from 'assert';
import process from 'process';
import { Server } from 'http';
import express, { Application } from 'express';
import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';
import { parseFile, Puzzle } from './Puzzle';

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
async function main(): Promise<void> {
    const port = 8789;
    const server = new WebServer(port);
    await server.start();
}

/**
 * HTTP web game server.
 */
export class WebServer {

    private readonly app: Application;
    private server: Server|undefined;

    /**
     * Make a new web game server using board that listens for connections on port.
     *
     * @param requestedPort server port number
     */
    public constructor(private readonly requestedPort: number) {
        this.app = express();
        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });
        
        /*
         * Handle a request for /getPuzzle/<filename>.
         */
        this.app.get('/getPuzzle/:filename', asyncHandler(async(request, response) => {
            const { filename } = request.params;
            assert(filename);

            const puzzle = await parseFile(`puzzles/${filename}.starb`);
            const emptyPuzzle = puzzle.emptyPuzzle();

            response
            .status(HttpStatus.OK) // 200
            .type('text')
            .send(emptyPuzzle.toString());
        }));
    }
    /**
     * Start this server.
     * 
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {
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
    public get port(): number {
        const address = this.server?.address() ?? 'not connected';
        if (typeof (address) === 'string') {
            throw new Error('server is not listening at a port');
        }
        return address.port;
    }
    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}

// exports.WebServer = WebServer;
if (require.main === module) {
    void main();
}