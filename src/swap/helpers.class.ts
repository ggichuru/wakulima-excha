import { BigNumber, Contract } from 'ethers'
import { config } from '../config'
import { abis } from '../utils'
import { Account } from './account.class'
import axios from 'axios'

export class Helpers extends Account {
    public async getAmountOutMin(
        amountIn: BigNumber,
        path: string[]
    ): Promise<BigNumber | undefined> {
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
            console.error('Get TokenBalance error \n', error)
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

    public async getTokenInfo(tokenAddress: string) {
        let contract = await this.tokenContract(tokenAddress)

        let symbol = await contract.symbol()
        let decimals = await contract.decimals()
        let name = await contract.name()

        return {
            symbol,
            decimals,
            name,
        }
    }

    public async getPair(tokenA: string, tokenB: string) {
        try {
            // Get factory contract address
            let factory = await this.routerContract.factory()

            // Init a factory contract instance
            let factoryContract = new Contract(
                factory,
                abis.UniswapV2Factory.abi,
                this.account
            )

            let pairAddress = await factoryContract.getPair(tokenA, tokenB)

            if (pairAddress == this.zeroAddress) {
                console.log('!!! PAIR DOES NOT EXIST')
                // Create pair with weth
                let tx = await factoryContract.createPair(tokenA, tokenB)

                console.log(`\t.... creating PAIR for ${tokenA} and ${tokenB}`)
                await tx.wait()
            }

            // Create an instance of UniswapV2Pair contract
            let pairContract = new Contract(
                pairAddress,
                abis.UniswapV2Pair.abi,
                this.account
            )

            let reserves = await pairContract.getReserves()

            return {
                pairAddress,
                reserves: reserves[0].toString(),
            }
        } catch (error) {
            // console.log(error)
            return {
                error,
            }
        }
    }

    public async getWalletBalance() {
        try {
            let response = await axios({
                method: 'get',
                url: config.ETHERSCAN.GOERLI,
                params: {
                    module: 'account',
                    action: 'balance',
                    address: this.toWallet,
                    tag: 'latest',
                    apikey: config.KEYS.ETHERSCAN,
                },
            })

            let _balance = response.data.result

            console.log(response.data)
        } catch (error) {
            console.error('Error getting wallet balance: => ', error)
        }
    }
}
