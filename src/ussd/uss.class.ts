import UssdMenu from 'ussd-builder'

type UssOption = (a: UssdClass) => void

export class UssdClass {
    menu: UssdMenu
    private swappingStates: any

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

    public static async initSwappingStates(): Promise<UssOption> {
        return (ussd: UssdClass): void => {
            // Define initialization and exit states
            ussd.defineStartState()
            ussd.defineExitState()

            // OTHER STATES
            ussd.defineSwapPageState()
        }
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
