import { swap } from './swap/swap.class'
import { BigNumber } from 'ethers'

const main = async () => {
    console.log('----'.repeat(10), '\n', 'BAZENGA DADI \n', '----'.repeat(10))

    await swap.executeBuy('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0.01')

    // let price = await swap.getTokenInfo(
    //     '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    // )

    // let a = await swap.getTokenAllowance(
    //     '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    // )
    // console.log(a?.toString())
}

main()
