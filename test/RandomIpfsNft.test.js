const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", function () {
          let deployer, RandomIpfsNft, vrfCoordinatorV2Mock

          beforeEach(async () => {
              signers = await ethers.getSigners()
              deployer = signers[0]

              await deployments.fixture(["mocks", "randomipfs"])
              RandomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
          })
          describe("request nft", () => {
              it("fails if payment isn't sent with the request", async function () {
                  await expect(RandomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__SendMoreETH()"
                  )
              })
              it("requesting nft", async () => {
                  const fee = await RandomIpfsNft.getTheMintFee()

                  await expect(RandomIpfsNft.requestNft({ value: fee.toString() })).to.emit(
                      "NftRequested"
                  )
              })
          })
      })
