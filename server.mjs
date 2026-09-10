/**
 * Actor entry point: serves the Next.js prototype over Actor Standby mode.
 *
 * Standby Actors are long-lived HTTP servers, so this deliberately does not call
 * Actor.exit() — it initialises, starts listening, and stays up until the platform
 * stops it on idle timeout.
 */
import http from 'node:http';

import { Actor, log } from 'apify';
import next from 'next';

await Actor.init();

const HOSTNAME = '0.0.0.0';
const DEFAULT_PORT = 3000;

/**
 * The standby port is exposed under a few different names depending on how the Actor
 * was started. Take the first one that is actually populated rather than guessing.
 */
function resolvePort() {
    const candidates = [
        ['Actor.config standbyPort', Actor.config.get('standbyPort')],
        ['Actor.config containerPort', Actor.config.get('containerPort')],
        ['ACTOR_WEB_SERVER_PORT', process.env.ACTOR_WEB_SERVER_PORT],
        ['ACTOR_STANDBY_PORT', process.env.ACTOR_STANDBY_PORT],
        ['PORT', process.env.PORT],
    ];

    log.info('Resolving standby port', Object.fromEntries(candidates));

    for (const [source, value] of candidates) {
        const port = Number(value);
        if (Number.isInteger(port) && port > 0) {
            log.info(`Using port ${port} from ${source}`);
            return port;
        }
    }

    log.warning(`No standby port found, falling back to ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
}

const app = next({ dev: false, dir: process.cwd() });
await app.prepare();
const handle = app.getRequestHandler();

const server = http.createServer((req, res) => {
    // The platform probes GET / with this header before marking the run ready.
    // Answer it directly so a probe never pays for a full Next.js render.
    if (req.headers['x-apify-container-server-readiness-probe']) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Readiness probe OK\n');
        return;
    }

    handle(req, res);
});

const port = resolvePort();

server.listen(port, HOSTNAME, () => {
    log.info(`Standby prototype listening on http://${HOSTNAME}:${port}`);

    const standbyUrl = Actor.config.get('standbyUrl') ?? process.env.ACTOR_STANDBY_URL;
    if (standbyUrl) log.info(`Standby URL: ${standbyUrl}`);
});
