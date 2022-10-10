import { swapClass } from './swap/swap.class'
import { BigNumber } from 'ethers'
import { swapWrapper } from './swap/Swap'

const main = async () => {
    console.log('----'.repeat(10), '\n', 'BAZENGA DADI \n', '----'.repeat(10))

    let UNI = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    let ETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
    let USDC = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'
    let to = '0x911C16a33e10Ea0567322C8822aA4ce156bf0C57'

    // await swap.swap(UNI, ETH, to, '0.001')

    // let price = await swap.getTokenInfo(
    //     '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    // )

    // let a = await swap.getTokenAllowance(
    //     '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    // )
    // console.log(a?.toString())

    // let bal = await swap.getTokenBalance(USDC)
    // console.log(bal?.toString())

    // let f = await swap.getPair(UNI, ETH)
    // console.log(f)

    let _s = await swapWrapper.swapTokens(UNI, ETH, to, '0.01')
    console.log(_s)
}

main()
