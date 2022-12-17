const { assert } = require("chai")
const { ethers, deployments } = require("hardhat")

describe("Basic NFT Unit Test", function () {
    let deployer, basicNFT, accounts

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]

        await deployments.fixture(["BasicNFT"])
        basicNFT = await ethers.getContract("BasicNFT")
    })

    describe("constructor", () => {
        it("checks the constructor", async () => {
            const name = await basicNFT.name()
            const symbol = await basicNFT.symbol()
            const counter = await basicNFT.getTokenCounter()

            assert.equal(name, "Doggie")
            assert.equal(symbol, "Puppy")
            assert.equal(counter.toString(), "0")
        })
    })

    describe("Mint nft test ", function () {
        beforeEach(async () => {
            const txResponse = await basicNFT.mintNFT()
            await txResponse.wait(1)
        })

        it("checks", async () => {
            const tokenURI = await basicNFT.tokenURI(0)
            const tokenCounter = await basicNFT.getTokenCounter()

            assert.equal(tokenCounter.toString(), "1")
            assert.equal(tokenURI, await basicNFT.TOKEN_URI())
        })

        it("shows the balance", async () => {
            const deployerAddress = deployer.address
            const deployerBalance = await basicNFT.balanceOf(deployerAddress)
            const owner = await basicNFT.ownerOf("0")

            assert.equal(deployerBalance.toString(), "1")
            assert.equal(owner, deployerAddress)
        })
    })
})
