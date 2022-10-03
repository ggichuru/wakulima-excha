import { ethers, Wallet, providers, Contract } from 'ethers'
import { config } from '../config'
import { abis } from '../utils'

export class Account {
    private provider: ethers.providers.JsonRpcProvider
    private signer: Wallet
    toWallet: string
    deadline: number
    account: Wallet
    routerContract: Contract
    // tokenContract: Contract

    constructor() {
        // define the provider
        this.provider = new providers.JsonRpcProvider(
            config.NODES.ETHEREUM.GOERLI
        )

        // Create a new signer from private key
        this.signer = new Wallet(config.KEYS.WALLET.PRIVATE_KEY)

        // Two minutes from now
        this.deadline = Math.floor(Date.now() / 1000) + 60 * 2

        this.toWallet = this.signer.address

        this.account = this.signer.connect(this.provider)

        this.routerContract = new Contract(
            abis.UniswapV2Router02.address,
            abis.UniswapV2Router02.abi,
            this.account
        )

        // this.tokenContract = new Contract(
        //     config.TOKENS.WETH,
        //     abis.Erc20.abi,
        //     this.account
        // )
    }
}
