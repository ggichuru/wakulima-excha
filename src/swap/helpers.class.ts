import { BigNumber, Contract } from 'ethers'
import { config } from '../config'
import { abis } from '../utils'
import { Account } from './account.class'

export class Helpers extends Account {
    public async getAmountOutMin(amountIn: BigNumber, path: string[]) {
        try {
            let amountOut = await this.routerContract.getAmountsOut(
                amountIn,
                path
            )
            return amountOut[1].mul(config.SLIPPAGE).div(100)
        } catch (error) {
            console.log('Get AmountOutMin error \n', error)
        }
    }

    public async getTokenBalance(
        tokenAddress: string
    ): Promise<BigNumber | undefined> {
        try {
            return this.tokenContract(tokenAddress).balanceOf(
                this.account.address
            )
        } catch (error) {
            console.log('Get TokenBalance error \n', error)
        }
    }

    public async getTokenAllowance(
        tokenAddress: string
    ): Promise<BigNumber | undefined> {
        try {
            return this.tokenContract(tokenAddress).allowance(
                this.toWallet,
                config.ROUTERS.UNISWAPV2ROUTER02
            )
        } catch (error) {
            console.log('Get TokenAllowance error \n', error)
        }
    }

    public tokenContract(tokenAddress: string) {
        return new Contract(tokenAddress, abis.Erc20.abi, this.account)
    }
}
