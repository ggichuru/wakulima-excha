import UssdMenu from 'ussd-builder'

class UssdClass {
    menu: UssdMenu

    constructor() {
        this.menu = new UssdMenu({ provider: 'africasTalking' })
    }

    async defineStartState() {
        try {
            return this.menu.startState({
                run: () => {
                    this.menu.con(
                        `Welcome to MARAFUND SWAP. Choose an option:` +
                            `\n1. Continue to Swap` +
                            '\n2. Exit'
                    )
                },
                next: {
                    '1': 'swapPage',
                    '2': 'exit',
                },
            })
        } catch (error) {
            return {
                success: false,
                error,
            }
        }
    }

    async defineExitState() {
        try {
            return this.menu.state('exit', {
                run: () => {
                    this.menu.end(
                        'Sad to see you leave. \n Thank you using MARAFUND SWAP'
                    )
                },
            })
        } catch (error) {
            return {
                success: false,
                error,
            }
        }
    }

    async swappingStates() {
        try {
            // Set up start state
            await this.defineStartState()

            // Set up exit state
            await this.defineExitState()

            // set up swapPage state
            await this.defineSwapPageState()
        } catch (error) {
            return {
                success: false,
                error,
            }
        }
    }

    async defineSwapPageState() {
        try {
            await this.menu.state('swapPage', {
                run: () => {
                    this.menu.con(
                        `SWAP PAGE` +
                            `\n1. List Wallet holdings` +
                            `\n2. Swap Tokens` +
                            `\n3. Three` +
                            `\n4. Four`
                    )
                },
            })
        } catch (error) {
            return {
                success: false,
                error,
            }
        }
    }
}

export const ussdClass = new UssdClass()
