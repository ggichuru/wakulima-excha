import { Application } from 'express'

export const configureRoutes = (app: Application) => {
    app.use('/api/v1/ussd', require('./ussd.routes'))

    // Health Check Endpoint
    app.use('/api/v1/status', (req, res) => {
        res.status(200).send(`Ok ${process.pid}`)
    })

    // Fallback Endpoint
    app.use('/', (req, res) => {
        res.status(200).send(`Ok ${process.pid}`)
    })
}
