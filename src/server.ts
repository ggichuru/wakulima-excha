import express from 'express'
import { createServer } from 'http'

import cluster from 'cluster'
import { cpus } from 'os'

import { configureMiddleware } from './middlewares'
import { configureRoutes } from './routes'
import { config } from './config'

/** ----- */

// Init express app
const app = express()

// Configure middlewares
configureMiddleware(app)

// Configure routes
configureRoutes(app)

// start server
const httpServer = createServer(app)

// Get number of cpus
const cpuNum = cpus().length

if (cluster.isPrimary) {
    // Fork workers
    for (let i = 0; i < cpuNum; i++) {
        // Create a new worker process
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
    })
} else {
    // Workers can share any TCP connection,
    // In this case it is an HTTP server
    httpServer.listen(config.SERVER.PORT || 5000, () => {
        console.info(
            `USSD_SWAP /api/v1/ Server running on `,
            httpServer.address(),
            `PID ${process.pid} \n`
        )
    })
}
