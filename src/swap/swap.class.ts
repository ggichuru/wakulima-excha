import { BigNumber, ethers } from 'ethers'
import { config } from '../config'
import { Helpers } from './helpers.class'
import { WETH, ChainId } from '@uniswap/sdk'

class Swap extends Helpers {
    public async executeBuy(tokenAddress: string, amount: string) {
        try {
            // TODO: FIX GET AMOUNTS  OUT MIN

            let unitEther = Math.pow(10, 18)
            let path = [WETH[ChainId.GÖRLI].address, tokenAddress]

            let _amount = unitEther * parseFloat(amount)
            let amountOutMin = BigNumber.from(`${_amount}`)

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

            console.log('Buy TX Response => ', txResponse)

            let tx = await txResponse.wait()

            if (tx && tx.status == 1) {
                console.log('TRANSACTION SUCCESSFFUL : \t', tx.transactionHash)

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

    public async executeSell(tokenAddress: string, amount: BigNumber) {
        try {
            // let _amount = ethers.BigNumber.from(amount)
            let path = [tokenAddress, config.TOKENS.WETH]

            let deadline = this.deadline

            let _tokenBalance = await this.getTokenBalance(tokenAddress)
            let tokenBalance = parseInt(_tokenBalance?._hex!)

            console.log('Token balance ', tokenBalance)

            if (tokenBalance > 1) {
                let _amountIn = _tokenBalance?.mul(amount).div(100)
                let amountIn = parseInt(_amountIn?._hex!)

                let _amountOutMin = await this.getAmountOutMin(_amountIn!, path)
                let amountOutMin = parseInt(_amountOutMin?._hex!)

                console.log(
                    `Sell amountIn: ${amountIn} \n Sell amountOutMin: ${amountOutMin}`
                )

                let overloads = {
                    gasLimit: config.DEFAULT_GAS_LIMIT,
                }

                let allowance = await this.getTokenAllowance(tokenAddress)

                if (allowance?.lt(amountIn)) {
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

                console.log('INIT executeSell TX')
                let tx = await txResponse.wait()
                console.log('executeSell TX done')

                if (tx && tx.status == 1) {
                    console.info(
                        '----'.repeat(10),
                        `\nSELL SUCCESSFUL \n`,
                        tx,
                        '----'.repeat(10)
                    )
                } else {
                    console.info(
                        '----'.repeat(10),
                        `\nSELL FAILED \n`,
                        tx,
                        '----'.repeat(10)
                    )
                }
            } else {
                console.info(
                    '----'.repeat(10),
                    `\nToken balance is ${tokenBalance}, thus insufficient \n`,
                    '----'.repeat(10)
                )
            }
        } catch (error) {
            console.error('Execute Sell Error: \n', error)
        }
    }
}

export const swap = new Swap()
