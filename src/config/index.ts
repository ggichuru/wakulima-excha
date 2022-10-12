require('dotenv').config()

let checkConfigs = !process.env.INFURA_KEY
    ? new Error('Add INFURA_KEY to you env configs')
    : !process.env.PRIVATE_KEY
    ? new Error('Add INFURA_KEY to you env configs')
    : ''

console.info(checkConfigs)

export const config = {
    SERVER: {
        PORT: process.env.PORT!,
    },
    NODES: {
        ETHEREUM: {
            MAINNET: `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_KEY!}`,
            GOERLI: `wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY!}`,
        },
        POLYGON: {
            MAINNET: `wss://polygon-mainnet.infura.io/ws/v3/${process.env
                .INFURA_KEY!}`,
            MUMBAI: `wss://polygon-mumbai.infura.io/ws/v3/${process.env
                .INFURA_KEY!}`,
        },
    },
    ETHERSCAN: {
        MAINNET: 'https://api.etherscan.io/api',
        GOERLI: 'https://api.etherscan.io/api',
    },
    KEYS: {
        WALLET: {
            PRIVATE_KEY: process.env.PRIVATE_KEY!,
        },
        ETHERSCAN: process.env.ETHERSCAN_API!,
        MORALIS: process.env.MORALIS_API!,
    },
    TOKENS: {
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    ROUTERS: {
        UNISWAPV2ROUTER02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
    SLIPPAGE: 10,
    DEFAULT_GAS_LIMIT: 1000000,
    MAX_INT:
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
}
