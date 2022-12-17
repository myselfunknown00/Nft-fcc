const { ethers, network } = require("hardhat")
const { TASK_ETHERSCAN_VERIFY } = require("hardhat-deploy")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    const highValue = ethers.utils.parseEther("2000")
    const Dynamic = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicNftMintx = await Dynamic.mintNft(highValue.toString())
    await dynamicNftMintx.wait(1)
    console.log(`Dynamic svg nft index 0 token uri ${Dynamic.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
