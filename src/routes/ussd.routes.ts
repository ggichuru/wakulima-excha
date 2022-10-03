import { Router } from 'express'
import { ussdClass } from '../ussd/uss.class'

const router = Router()

router.post('/', async (req: any, res: any) => {
    try {
        await ussdClass.swappingStates()

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
