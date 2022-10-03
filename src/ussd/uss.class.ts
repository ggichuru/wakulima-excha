import UssdMenu from 'ussd-builder'

type UssOption = (a: UssdClass) => void

export class UssdClass {
    private swappingStates: any
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
                    this.menu.con(
                        `SWAP PAGE` +
                            `\n1. List Wallet holdings` +
                            `\n2. Swap Tokens` +
                            `\n3. Three` +
                            `\n0. Exit`
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

    public static async initSwappingStates(): Promise<UssOption> {
        return (ussd: UssdClass): void => {
            // Define initialization and exit states
            ussd.defineStartState()
            ussd.defineExitState()

            // OTHER STATES
            ussd.defineSwapPageState()
        }
    }
}
