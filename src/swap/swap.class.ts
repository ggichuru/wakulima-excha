import { BigNumber, ethers } from 'ethers'
import { config } from '../config'
import { Helpers } from './helpers.class'
import { WETH, ChainId } from '@uniswap/sdk'

class Swap extends Helpers {
    public async executeBuy(tokenAddress: string, amount: string) {
        try {
            console.info(
                '****'.repeat(15),
                '\n',
                `INITIALIZE SWAP ETH FOR TOKENS \n`,
                '****'.repeat(15)
            )
            let unitEther = Math.pow(10, 18)
            let path = [WETH[ChainId.GÖRLI].address, tokenAddress]

            let _amount = `${unitEther * parseFloat(amount)}`
            let _amountOutMin = BigNumber.from(`${_amount}`)

            let amountOutMin = await this.getAmountOutMin(_amountOutMin, path)

            console.log(_amountOutMin.toString())
            // process.exit(0)

            // TODO: CHECK ON AMOUNT OUT MIN

            let overloads = {
                value: amountOutMin,
                gasLimit: config.DEFAULT_GAS_LIMIT,
            }

            let deadline = this.deadline

            let txResponse = await this.routerContract.swapExactETHForTokens(
                amountOutMin,
                path,
                this.toWallet,
                deadline,
                overloads
            )

            let tx = await txResponse.wait()

            if (tx && tx.status == 1) {
                console.log('BUY SUCCESSFFUL : \t', tx.transactionHash)

                try {
                    // Approve to spend max amount
                    await this.tokenContract(tokenAddress).approve(
                        config.ROUTERS.UNISWAPV2ROUTER02,
                        config.MAX_INT
                    )
                } catch (error) {
                    console.log('Error Apporoving token \n', error)
                }
            } else {
                console.log('TRANSACTION UNSUCCESSFUL, \n')
            }
        } catch (error) {
            console.error('Execute Buy Error: \n', error)
        }
    }

    public async executeSell(tokenAddress: string, _amount: string) {
        try {
            console.info(
                '****'.repeat(15),
                '\n',
                `INITIALIZE SWAP TOKENS FOR ETH \n`,
                '****'.repeat(15)
            )
            let { decimals } = await this.getTokenInfo(tokenAddress)
            let unitToken = Math.pow(10, decimals)

            let path = [tokenAddress, WETH[ChainId.GÖRLI].address]

            let deadline = this.deadline

            let amount = BigNumber.from(`${unitToken * parseFloat(_amount)}`)

            let _tokenBalance = await this.getTokenBalance(tokenAddress)
            let tokenBalance = parseInt(_tokenBalance?._hex!)

            if (tokenBalance > 1) {
                let _amountIn = amount
                let amountIn = parseInt(_amountIn?._hex!)

                let _amountOutMin = await this.getAmountOutMin(amount, path)
                let amountOutMin = parseInt(_amountOutMin?._hex!)

                console.log(
                    `Sell amountIn: ${amountIn} \t Sell amountOutMin: ${amountOutMin} \n`
                )

                let overloads = {
                    gasLimit: config.DEFAULT_GAS_LIMIT,
                }

                let _allowance = await this.getTokenAllowance(tokenAddress)

                if (_allowance!.lt(BigNumber.from(amount))) {
                    try {
                        let txResponse = await this.tokenContract(
                            tokenAddress
                        ).approve(
                            config.ROUTERS.UNISWAPV2ROUTER02,
                            config.MAX_INT
                        )

                        console.log(`Approving token => ${tokenAddress}`)
                        await txResponse.wait()
                        console.log('Approving done')
                    } catch (error) {
                        console.error(
                            `Error approving token:${tokenAddress} \n`,
                            error
                        )
                    }
                }

                let txResponse =
                    await this.routerContract.swapExactTokensForETH(
                        _amountIn,
                        _amountOutMin,
                        path,
                        this.toWallet,
                        deadline,
                        overloads
                    )

                console.log(' ...... \t loading')
                let tx = await txResponse.wait()

                if (tx && tx.status == 1) {
                    console.info(
                        '----'.repeat(20),
                        '\n',
                        `SELL SUCCESSFUL \t ${tx.transactionHash} \n`,
                        '----'.repeat(20)
                    )
                } else {
                    console.info(
                        '----'.repeat(20),
                        '\n',
                        `SELL FAILED \t ${tx.transactionHash} \n`,
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
        } catch (error) {
            console.error('Execute Sell Error: \n', error)
        }
    }
}

export const swap = new Swap()
