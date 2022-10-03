import { swap } from './swap/swap.class'
import { BigNumber } from 'ethers'

const main = async () => {
    console.log('----'.repeat(10), '\nBAZENGA DADI \n', '----'.repeat(10))

    let a = await swap.executeBuy(
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        '0.01'
    )
    // BigNumber.from('10000000000000000')

    console.log(a)
}

main()
