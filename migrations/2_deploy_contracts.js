const NovaNFT = artifacts.require("NovaNFT");
const AuctionNFT = artifacts.require("AuctionNFT");

module.exports = async function (deployer, network, [platformAccount]) {
  await deployer.deploy(NovaNFT);
  const deployedNFT = await NovaNFT.deployed();

  await deployer.deploy(AuctionNFT, deployedNFT.address, platformAccount);
  const deployedAuction = await AuctionNFT.deployed();

  await deployedNFT.setContractAuction(deployedAuction.address);
};