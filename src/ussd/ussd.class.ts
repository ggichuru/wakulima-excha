import e from 'express'
import { resolve } from 'path'
import UssdMenu from 'ussd-builder'
import { swapClass } from '../swap'

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
                    `Welcome to MARAFUND SWAP.` +
                        `\n1. Continue to Swap` +
                        '\n2. Exit'
                )
            },
            next: {
                '1': 'swapPage',
                '2': 'exit',
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

    private async defineSwapPageState() {
        try {
            await this.menu.state('swapPage', {
                run: () => {
                    this.menu.con(`Enter Token Address to Swap`)
                },
                next: {
                    '*[a-zA-Z0-9]+': 'tokenPage',
                },
            })

            // Define swapPage.token state
            await this.menu.state('tokenPage', {
                run: async () => {
                    let token = this.menu.val
                    // let session = this.menu.session(this.menu.args.sessionId)
                    // session.set('name', name)
                    let _token = await this.getTokenDetails(token)

                    if (_token) {
                        this.menu.con(
                            `TOKEN: ${_token.name} \nBAL: ${_token.balance} ${_token.symbol} \n` +
                                `\n [ swap actions ] ` +
                                `\n1. Swap ${_token.symbol} for ETH` +
                                `\n2. Swap ETH for ${_token.symbol}` +
                                `\n3. Swap ${_token.symbol} for Token of choice \n` +
                                `\n0: Exit  00: Back`
                        )
                    } else {
                        this.menu.con('Invalid Token address. Try again')
                    }
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
                run: async () => {
                    let session = this.menu
                    this.menu.end('swapTokensForEth')
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
        this.menu.sessionConfig({
            start: (sessionId) => {
                // Initiailize current session if it doesnt exist. This is called by menu.run()
                return new Promise((resolve, reject) => {
                    if (!(sessionId in this.sessions))
                        this.sessions[sessionId] = {}
                    resolve(200)
                })
            },
            end: (sessionId) => {
                // used to delete current session. Invoked internally by the menu.end()
                return new Promise((resolve, reject) => {
                    delete this.sessions[sessionId]
                    resolve(200)
                })
            },
            set: (sessionId, key, value) => {
                // store key-value pair in current sesssion
                return new Promise((resolve, reject) => {
                    this.sessions[sessionId][key] = value
                    resolve(value)
                })
            },
            get: (sessionId, key) => {
                // Retrive value by key in current session
                return new Promise((resolve, reject) => {
                    let value = this.sessions[sessionId][key]
                    resolve(value)
                })
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
            ussd.defineSwapPageState()
            ussd.defineSwapTokensStates()
        }
    }
}
