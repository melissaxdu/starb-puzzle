import { Server } from 'http';
import express, { Application } from 'express';
import { Puzzle } from './Puzzles';


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
function main(): void {
    //TODO
}


/**
 * HTTP web game server.
 */
export class WebServer {

    private readonly app: Application;
    private server: Server|undefined;
    private readonly port: number;


    /**
     * Make a new web game server using board that listens for connections on port.
     * 
     * @param puzzle shared game board
     */
    public constructor(
        private readonly puzzle: Puzzle, 
    ) {
        this.port = 8789;
        this.app = express();

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
    public start(): Promise<void> {
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
     public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}


if (require.main === module) {
    void main();
}
