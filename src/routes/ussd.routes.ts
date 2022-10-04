import { Router } from 'express'
import { UssdClass } from '../ussd/ussd.class'

const router = Router()

router.post('/', async (req: any, res: any) => {
    try {
        // initialize USSD Class
        const ussdClass = new UssdClass(await UssdClass.initSwappingStates())

        await ussdClass.menu.run(req.body, (resMsg: any) => {
            res.send(resMsg)
        })
    } catch (error) {
        console.log('USSD port error', error)

        res.send({
            success: false,
            error,
        })
    }
})

module.exports = router
