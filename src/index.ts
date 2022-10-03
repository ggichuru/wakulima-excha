import { swap } from './swap/swap.class'
import { BigNumber } from 'ethers'

const main = async () => {
    console.log('----'.repeat(10), '\nBAZENGA DADI \n', '----'.repeat(10))

    let a = await swap.executeBuy(
        '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
        BigNumber.from('100000')
    )

    console.log(a)
}

main()
