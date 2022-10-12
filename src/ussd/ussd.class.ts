import e from 'express'
import { resolve } from 'path'
import UssdMenu from 'ussd-builder'
import { swapClass } from '../swap'
import { swapWrapper } from '../swap/Swap'

type UssOption = (a: UssdClass) => void

export class UssdClass {
    private swappingStates: any
    sessions: any = {}
    menu: UssdMenu

    constructor(...options: UssOption[]) {
        // Set defaults
        this.menu = new UssdMenu({ provider: 'africasTalking' })

        this.swappingStates = null

        // Set options
        for (const option of options) {
            option(this)
        }
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
            let next: { [key: string]: string } = {}

            tokens!.forEach((t: any, i: number) => {
                menu_items.push(`\n${i + 1}. ${t[0]}`)
                menu.push(`${t[0]}`)
                next[`${i + 1}`] = `${t[0].replace(/\s/g, ',')}`
            })
            await this.menu.state('swapPage', {
                run: () => {
                    this.menu.con(
                        `Select TokenA: ` +
                            `${menu_items.toString()}` +
                            `\n0. Exit : 00. Home`
                    )
                },
                next,
            })

            menu.forEach(async (item: string, index: string) => {
                for (const [key, value] of tokens) {
                    if (key == item) {
                        // console.log(
                        //     `the Item ${item} at index ${index} has a value of ${value}, with a key of ${key}`
                        // )
                        await this.menu.state(`${item}`, {
                            run: async () => {
                                this.menu.con(item)
                            },
                        })
                    }
                }
            })

            // Define swapPage.token state
            await this.menu.state('tokenPage', {
                run: async () => {
                    let token = this.menu.val

                    let _token = await this.getTokenDetails(token)

                    await this.menu.session
                        .set('tokenAddr', token)
                        .then(async () => {
                            if (_token) {
                                console.log(
                                    'TOKEN ADDRESS @ TOKEN PAGE',
                                    await this.menu.session.get('tokenAddr')
                                )
                                await this.menu.con(
                                    `TOKEN: ${_token!.name} \nBAL: ${
                                        _token!.balance
                                    } ${_token!.symbol} \n` +
                                        `\n [ swap actions ] ` +
                                        `\n1. Swap ${_token!.symbol} for ETH` +
                                        `\n2. Swap ETH for ${_token!.symbol}` +
                                        `\n3. Swap ${
                                            _token!.symbol
                                        } for Token of choice \n` +
                                        `\n0: Exit  00: Back`
                                )
                            } else {
                                this.menu.con(
                                    'Invalid Token address. Try again'
                                )
                            }
                        })
                },
                next: {
                    '1': 'tokenPage.swapTokensForEth',
                    '2': 'tokenPage.swapEthForTokens',
                    '3': 'tokenPage.swapTokensForTokens',
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
            await this.menu.state('tokenPage.swapTokensForEth', {
                //TODO: FIX GET SESSION ISSUE

                run: async () => {
                    let token = this.menu.args.text.split('*')
                    this.menu.con(`enter amount,`)
                    console.log('TOKEN ADDRESS @ SWAP', token[1])
                    let swap = await swapWrapper.swapTokens(
                        token[1],
                        'toke',
                        this.menu.val
                    )

                    console.log(swap)
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
            throw new Error(error)
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

    public static async initSwappingStates(): Promise<UssOption> {
        return async (ussd: UssdClass): Promise<void> => {
            // session configurations
            ussd.configureSession()

            // Define initialization and exit states
            ussd.defineStartState()
            ussd.defineExitState()

            // OTHER STATES
            ussd.defineWalletPageState()
            ussd.defineSwapPageState()
            ussd.defineSwapTokensStates()
        }
    }
}
