import { ethers, Wallet, providers, Contract } from 'ethers'
import { config } from '../config'
import { abis } from '../utils'

export class Account {
    provider: ethers.providers.JsonRpcProvider
    signer: Wallet
    toWallet: string
    deadline: number
    account: Wallet
    routerContract: Contract
    zeroAddress: string

    constructor() {
        // define the provider
        this.provider = new providers.WebSocketProvider(
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

        this.zeroAddress = '0x0000000000000000000000000000000000000000'

        // this.tokenContract = new Contract(
        //     config.TOKENS.WETH,
        //     abis.Erc20.abi,
        //     this.account
        // )
    }
}
