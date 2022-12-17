const { network, ethers } = require("hardhat")
const { storeImages, storeTokenUriMetadata } = require("../uitils/uploadToPinata")

const { LogLevel } = require("@ethersproject/logger")
const { developmentChains, networkConfig } = require("../helper-hardhat-config.js")

const { verify } = require("../uitils/verify")
let tokenUris = [
    "ipfs://QmVuU3EMH1f4FkPyS84VzRJt7EHX3scqHP6GhQZgbjSK2G",
    "ipfs://QmYwtcJqnWZriuZFLgXzkLDQo4bSSb7dksnvTkrps7gDY6",
    "ipfs://QmRrLowCwJjXc6Sinz1yGHexYXQw2fVah31XCbpxEo8ND6",
]

const FUND_AMOUNT = "1000000000000000000"
const imagesLocation = "./images/random/"
module.exports = async function ({ getNamedAccounts }) {
    const { deploy, log } = deployments

    const signer = await ethers.getSigners()
    const deployer = signer[3]
    // const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const metaDataTemplate = {
        name: "",
        description: "",
        image: "",
        attributes: [
            {
                traits_type: "cuteness",
                value: 100,
            },
        ],
    }

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let VRFCoordinatorV2MockAddress, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")

        VRFCoordinatorV2MockAddress = VRFCoordinatorV2Mock.address

        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.addConsumer(subscriptionId, VRFCoordinatorV2Mock.address)
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        VRFCoordinatorV2MockAddress = networkConfig[chainId].VRFCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("------------------------------------------------------")

    const args = [
        VRFCoordinatorV2MockAddress,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("-------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        log("verifying.........")

        await verify(randomIpfsNft.address, args)
        log("-----------------------------------------------------")
    }

    async function handleTokenUris() {
        tokenUris = []
        const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
        for (imageUploadResponseIndex in imageUploadResponses) {
            let tokenUriMetadata = { ...metaDataTemplate }
            tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
            tokenUriMetadata.description = `A Cute ${tokenUriMetadata.name} pup`
            tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

            console.log(`uploading ${tokenUriMetadata.name}`)
            const metaDataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
            tokenUris.push(`ipfs://${metaDataUploadResponse.IpfsHash}`)
        }
        console.log("Token Uris uploaded")
        console.log(tokenUris)
        return tokenUris
    }
}
module.exports.tags = ["all", "randomipfs"]
