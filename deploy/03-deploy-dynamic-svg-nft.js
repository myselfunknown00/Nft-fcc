const { network, ethers } = require("hardhat")

const { developmentChains, networkConfig } = require("../helper-hardhat-config.js")
const fs = require("fs")
const { verify } = require("../uitils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("==============================================================")
    const lowSVG = fs.readFileSync("./image/dynamic/snowman.svg", {
        encoding: "utf8",
    })
    const highSVG = fs.readFileSync("./image/dynamic/house.svg", {
        encoding: "utf8",
    })

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        log("verifying.........")

        await verify(dynamicSvgNft.address, args)
    }
    log("-----------------------------------------------------")
}

module.exports.tags = ["all", "dynamicsvg", "main"]
