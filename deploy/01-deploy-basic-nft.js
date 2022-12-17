const { network } = require("hardhat")

const { LogLevel } = require("@ethersproject/logger")
const { developmentChains } = require("../helper-hardhat-config.js")

const { verify } = require("../uitils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("------------------------------------------------------")

    const args = []
    const BasicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        log("verifying.........")

        await verify(BasicNFT.address, args)
    }
    log("-----------------------------------------------------")
}

module.exports.tags = ["all", "BasicNFT", "main"]
