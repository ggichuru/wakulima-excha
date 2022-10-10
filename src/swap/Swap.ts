import { BigNumber, utils } from 'ethers'
import { config } from '../config'
import { Helpers } from './helpers.class'

export class SwapWrapper extends Helpers {
    public async swapTokens(
        tokenA: string,
        tokenB: string,
        to: string,
        amount: string
    ) {
        try {
            let _tokenA = await this.getTokenInfo(tokenA)
            let _tokenB = await this.getTokenInfo(tokenB)

            console.log('*****'.repeat(15))
            console.log(`Swapping ${_tokenA.symbol} for ${_tokenB.symbol}`)
            console.log('*****'.repeat(15))

            // Define a unit of token A which to transfer in gwei
            let unitTokenA = Math.pow(10, _tokenA.decimals)

            // Check pair reserves
            let { pairAddress, reserves } = await this.getPair(tokenA, tokenB)

            if (parseInt(reserves) == 0) {
                throw new Error('Pool doesnt have liquidiy')
            }

            // Define the path
            let path = [tokenA, tokenB]

            let deadline = this.deadline

            let _amountIn = BigNumber.from(`${unitTokenA * parseFloat(amount)}`)

            let tokenBalance = await this.getTokenBalance(tokenA)

            console.log(tokenBalance?.toString())

            if (tokenBalance! >= _amountIn) {
                // let amountIn = parseInt(_amountIn?._hex)
                let amountIn = utils.parseEther(amount)

                let _amountOutMin = await this.getAmountOutMin(_amountIn, path)
                let amountOutMin = parseInt(_amountOutMin?._hex!)

                console.log(
                    `Sell amountIn: ${amountIn} \t Sell amountOutMin: ${amountOutMin} \n`
                )

                let overloads = {
                    gasLimit: config.DEFAULT_GAS_LIMIT,
                }

                let _allowance = await this.getTokenAllowance(tokenA)

                console.log(_allowance)
                if (_allowance!.lt(_amountIn)) {
                    try {
                        let txResponse = await this.tokenContract(
                            tokenA
                        ).approve(
                            config.ROUTERS.UNISWAPV2ROUTER02,
                            parseInt(config.MAX_INT)
                        )

                        console.log(`Approving token => ${tokenA}`)
                        await txResponse.wait()
                        console.log('Approving done')
                    } catch (error) {
                        console.error(
                            `Error approving token:${tokenA} \n`,
                            error
                        )
                    }
                }

                let txResponse =
                    await this.routerContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                        _amountIn,
                        _amountOutMin,
                        path,
                        to,
                        deadline,
                        overloads
                    )
                console.log(' ...... \t loading')
                let tx = await txResponse.wait()

                if (tx && tx.status == 1) {
                    console.info(
                        '----'.repeat(20),
                        '\n',
                        `SWAP SUCCESSFUL \t ${tx.transactionHash} \n`,
                        '----'.repeat(20)
                    )
                } else {
                    console.info(
                        '----'.repeat(20),
                        '\n',
                        `SWAP FAILED \t ${tx.transactionHash} \n`,
                        '----'.repeat(20)
                    )
                }
            } else {
                console.info(
                    '----'.repeat(10),
                    '\n',
                    `Token balance is ${tokenBalance}, thus insufficient \n`,
                    '----'.repeat(10)
                )
            }
        } catch (error: any) {
            throw new Error(error)
        }
    }
}

export const swapWrapper = new SwapWrapper()
