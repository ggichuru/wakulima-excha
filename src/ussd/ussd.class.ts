import UssdMenu from 'ussd-builder'
import { swapClass } from '../swap'
import { swapWrapper } from '../swap/Swap'
import Moralis from 'moralis'
import { EvmChain } from '@moralisweb3/evm-utils'
import { config } from '../config'
import { BigNumber } from 'ethers'

interface Token {
    symbol: string
    address: string | null | undefined
}
export class UssdClass {
    sessions: any = {}
    menu: UssdMenu
    chain = EvmChain.GOERLI
    tokenA: Token = { symbol: '', address: '' }
    tokenB: Token = { symbol: '', address: '' }
    swapAmount: string = ''

    constructor() {
        // Set defaults
        this.menu = new UssdMenu({ provider: 'africasTalking' })
    }

    public async callStates() {
        await Moralis.start({
            apiKey: config.KEYS.MORALIS,
        })
        // session configurations
        await this.configureSession()

        // Define initialization and exit states
        await this.defineStartState()
        await this.defineExitState()

        // OTHER STATES
        await this.defineWalletPageState()
        await this.defineSwapPageState()
        await this.defineSwapTokensStates()
    }

    private async defineStartState() {
        return this.menu.startState({
            run: () => {
                this.menu.con(
                    `Welcome to WAKULIMA EXCHANGE.` +
                        `\n1. Wallet` +
                        `\n2. Swap` +
                        '\n0. Exit'
                )
            },
            next: {
                '1': 'walletPage',
                '2': 'swapPage',
                '0': 'exit',
            },
        })
    }

    private async defineExitState() {
        return this.menu.state('exit', {
            run: () => {
                this.menu.end(
                    'Sad to see you leave. \n Thank you using MARAFUND SWAP'
                )
            },
        })
    }

    private async getTokensList() {
        return {
            ETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
            UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
        }
    }

    private async defineWalletPageState() {
        try {
            let addr = await swapClass.toWallet

            await this.menu.state('walletPage', {
                run: () => {
                    this.menu.con(
                        `${addr}` +
                            `\n1. View Balance.` +
                            `\n2. View Tokens` +
                            `\n0. Exit : 00. Home`
                    )
                },
                next: {
                    '1': 'viewBalance',
                    '2': 'viewTokens',
                    '0': 'exit',
                    '00': 'home',
                },
            })
        } catch (error) {
            console.error('Wallet page state ', error)
        }
    }

    private async defineSwapPageState() {
        try {
            let tokens = Object.entries(await this.getTokensList())

            let menu_items: any = []
            let menu: any = []
            let nextA: { [key: string]: string } = {}
            let nextB: { [key: string]: string } = {}

            tokens!.forEach((t: any, i: number) => {
                menu_items.push(`\n${i + 1}. ${t[0]}`)
                menu.push(`${t[0]}`)
                nextA[`${i + 1}`] = `a_${t[0].replace(/\this.s/g, ',')}`
                nextB[`${i + 1}`] = `b_${t[0].replace(/\this.s/g, ',')}`
            })

            await this.menu.state('swapPage', {
                run: () => {
                    this.menu.con(
                        `Select TokenA: ` +
                            `${menu_items.toString()}` +
                            `\n0. Exit : 00. Home`
                    )
                },
                next: nextA,
            })

            menu.forEach(async (item: string, index: string) => {
                await this.menu.state(`a_${item}`, {
                    run: async () => {
                        let _tokenABal: any
                        let _tokenA: any

                        await this.menu.session.set('tokenA', item)

                        try {
                            this.tokenA.address =
                                await this.getTokenAddressFromSymbol(item)

                            _tokenA = await swapClass.getTokenInfo(
                                this.tokenA.address!
                            )

                            _tokenABal = await swapClass.getTokenBalance(
                                this.tokenA.address!
                            )
                        } catch (error) {
                            console.log(error)
                        }
                        let unitTokenA = Math.pow(10, _tokenA.decimals)
                        let actualBal = parseInt(_tokenABal?._hex!) / unitTokenA

                        await this.menu.con(
                            `TokenA [ ${item} ] select TokenB` +
                                `\n BAL = [ ${actualBal.toFixed(4)} ${item} ]` +
                                `${menu_items.toString()}` +
                                `\n0. Exit : 00. Home`
                        )
                    },
                    next: nextB,
                })
            })

            menu.forEach(async (item: string, index: string) => {
                await this.menu.state(`b_${item}`, {
                    run: async () => {
                        try {
                            await this.menu.session.set('tokenB', item)
                            let tokenA = await this.menu.session.get('tokenA')
                            let tokenB = await this.menu.session.get('tokenB')

                            this.tokenA.symbol = tokenA
                            this.tokenB.symbol = tokenB

                            this.tokenA.address =
                                await this.getTokenAddressFromSymbol(
                                    this.tokenA.symbol
                                )

                            this.tokenB.address =
                                await this.getTokenAddressFromSymbol(
                                    this.tokenB.symbol
                                )

                            if (tokenA == tokenB) {
                                await this.menu.con(
                                    `** SWAP VIEW PAGE ERROR**` +
                                        `\n Can't Swap ${tokenA} to ${tokenB}` +
                                        `\n0: back | 1: exit`
                                )
                            }

                            await this.menu.con(
                                `** AMOUNT PAGE **` +
                                    `\nTokenA [ ${this.tokenA.symbol} ]` +
                                    `\nTokenB [ ${this.tokenB.symbol} ]` +
                                    `\n Enter ${this.tokenA.symbol} amount to swap`
                            )
                        } catch (error) {
                            console.log(error)
                        }
                    },
                    next: {
                        '*\\d+': 'swapAmount',
                    },
                })
            })

            await this.menu.state('swapAmount', {
                run: async () => {
                    try {
                        this.swapAmount = this.menu.val

                        let _tokenA = await swapClass.getTokenInfo(
                            this.tokenA.address!
                        )
                        let _tokenB = await swapClass.getTokenInfo(
                            this.tokenA.address!
                        )
                        let _tokenABal: any
                        _tokenABal = await swapClass.getTokenBalance(
                            this.tokenA.address!
                        )

                        let unitTokenA = Math.pow(10, _tokenA.decimals)
                        let unitTokenB = Math.pow(10, _tokenB.decimals)

                        let _amountIn = BigNumber.from(
                            `${unitTokenA * parseFloat(this.swapAmount)}`
                        )

                        let _amountOutMin = await swapClass.getAmountOutMin(
                            _amountIn,
                            [this.tokenA.address!, this.tokenB.address!]
                        )

                        let amountOutMin = parseInt(_amountOutMin?._hex!)

                        let actualBal = parseInt(_tokenABal?._hex!) / unitTokenA

                        let expectedAmount = amountOutMin / unitTokenB

                        if (actualBal < parseFloat(this.swapAmount)) {
                            await this.menu.con(
                                `** SWAP VIEW PAGE ERROR**` +
                                    `\n |-ERR-| Insufficient balance |-ERR-| ` +
                                    `\n[ ${actualBal.toFixed(4)} ${
                                        this.tokenA.symbol
                                    }] ` +
                                    `\n0: back | 1: exit`
                            )
                        }
                        await this.menu.con(
                            `** SWAP VIEW PAGE **` +
                                `\nSwap [${this.swapAmount}] [${this.tokenA.symbol}] for [${this.tokenB.symbol}]` +
                                `\n1. Proceed to swap` +
                                `\n0. Exit : 00. Home`
                        )
                    } catch (error) {
                        console.log(error)
                    }
                },
                next: {
                    '1': 'executeSwap',
                    '0': 'exit',
                },
            })
        } catch (error) {
            return {
                success: false,
                error,
            }
        }
    }

    private async defineSwapTokensStates() {
        try {
            await this.menu.state('executeSwap', {
                run: async () => {
                    await this.menu.end(
                        `SWAPPING ${this.swapAmount} ${this.tokenA.symbol} for ${this.tokenB.symbol}` +
                            `\n check SMS (${this.menu.args.phoneNumber}) for TX Information`
                    )
                    await swapWrapper.swapTokens(
                        this.tokenA.address!,
                        this.tokenB.address!,
                        this.swapAmount
                    )

                    //TODO: implement send to sms
                },
            })
            await this.menu.state('tokenPage.swapEthForTokens', {
                run: async () => {
                    this.menu.end('swapEthForTokens')
                },
            })
            await this.menu.state('tokenPage.swapTokensForTokens', {
                run: async () => {
                    this.menu.end('swapTokensForTokens')
                },
            })
        } catch (error: any) {
            console.log(error)
        }
    }

    private async getTokenDetails(tokenAddress: string) {
        try {
            let { decimals, name, symbol } = await swapClass.getTokenInfo(
                tokenAddress
            )
            let _balance = await swapClass.getTokenBalance(tokenAddress)
            let balance =
                parseFloat(_balance?.toString()!) / Math.pow(10, decimals)

            return {
                name,
                decimals,
                symbol,
                balance: balance?.toFixed(4).toString(),
            }
        } catch (error) {
            console.log(error)
            return
        }
    }

    private async getTokenAddressFromSymbol(symbol: string) {
        try {
            let tokenMap = new Map(Object.entries(await this.getTokensList()))

            return tokenMap.get(symbol)
        } catch (error) {
            console.log('Get token by symbol error', error)
        }
    }

    private async configureSession() {
        await this.menu.sessionConfig({
            start: (sessionId, callback = () => {}) => {
                // initialize current session if it doesn't exist
                // this is called by menu.run()
                if (!(sessionId in this.sessions)) this.sessions[sessionId] = {}
                callback()
            },
            end: (sessionId, callback = () => {}) => {
                // clear current session
                // this is called by menu.end()
                delete this.sessions[sessionId]
                callback()
            },
            set: (sessionId, key, value, callback = () => {}) => {
                // store key-value pair in current session
                this.sessions[sessionId][key] = value
                callback()
            },
            get: (sessionId, key, callback = () => {}) => {
                // retrieve value by key in current session
                let value = this.sessions[sessionId][key]
                callback(null, value)
            },
        })
    }
}

export const ussdClass = new UssdClass()
