const AuctionNFT = artifacts.require('AuctionNFT');
const NovaNFT = artifacts.require('NovaNFT');

let deployedNFT;
let deployedAuction;

const { expect } = require('chai');

require('chai')
  .use(require('chai-as-promised'))
  .should();

function ether(n) {
  return new web3.utils.BN(web3.utils.toWei(n, 'ether'));
}

const SAT_JAN_01_2050_03_00_00_UTC = 2524618800;
const SAT_JAN_01_2022_03_00_00_UTC = 1641006000;

contract('AuctionNFT', function ([deployerAccount, platformAccount, sellerAccount, buyerAccount, winnerAccount, loserAccount]) {

  beforeEach(async function () {
    deployedNFT = await NovaNFT.new({ from: deployerAccount });
    deployedAuction = await AuctionNFT.new(deployedNFT.address, platformAccount, { from: deployerAccount });

    await deployedNFT.setContractAuction(deployedAuction.address, { from: deployerAccount });
  });

  describe('auction', function () {
    it('set contract auction by non admin must be rejected', async function () {
      await deployedNFT.setContractAuction(deployedAuction.address, { from: platformAccount }).should.be.rejectedWith('caller is not the owner');
    });

    it('update auction by non admin must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });

      await deployedAuction.updateAuction(tokenId, endDate, { from: platformAccount }).should.be.rejectedWith('caller is not the owner');
    });

    it('update auction of a non existent token must be rejected', async function () {
      var tokenId = 0;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedAuction.updateAuction(tokenId, endDate, { from: deployerAccount }).should.be.rejectedWith('nonexistent token');
    });

    it('set fee by non admin must be rejected', async function () {
      const PLATFORM_FEE = 5;
      await deployedAuction.setFee(PLATFORM_FEE, { from: platformAccount }).should.be.rejectedWith('caller is not the owner');
    });

    it('set fee by admin must be fulfilled', async function () {
      const PLATFORM_FEE = 5;
      await deployedAuction.setFee(PLATFORM_FEE, { from: deployerAccount });
    });

    it('mint new token must be fulfilled', async function () {
      var tokenId = 0;
      var tokenUri = 'ipfs://abc';
      
      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      var resultTokenUri = await deployedNFT.tokenURI(tokenId, { from: sellerAccount });

      expect(resultTokenUri).to.be.equal(tokenUri);
    });

    it('create auction must be fulfilled', async function () {
      var tokenId = 0;
      var price = ether('1');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });

      expect(await deployedNFT.ownerOf(tokenId)).to.be.equal(deployedAuction.address);
    });

    it('create auction of a non existent token must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount }).should.be.rejectedWith('nonexistent token');
    });

    it('bid above the price must be fulfilled', async function () {
      var tokenId = 0;
      var price = ether('1');
      var bid = ether('2');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });

      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid });
    });

    it('bid for an non started auction must be rejected', async function () {
      
      var tokenId = 0;
      var price = ether('1');
      var bid = ether('2');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2050_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });

      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid }).should.be.rejectedWith('auction not started');;
    });

    it('bid for a finish auction must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var bid = ether('2');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2022_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });
      await deployedAuction.finish(tokenId, { from: sellerAccount });

      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid }).should.be.rejectedWith('auction finished');;
    });

    it('bid bellow the price must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var bid = ether('0.5');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });

      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid }).should.be.rejectedWith('price below minimum');
    });

    it('bid for an inexistent token must be rejected', async function () {
      var tokenId = 0;
      var bid = ether('0.5');

      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid }).should.be.rejectedWith('nonexistent token');
    });

    it('bid for an auction that has passed the end date must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var bid = ether('1.1');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });
      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid });

      endDate = SAT_JAN_01_2022_03_00_00_UTC;

      await deployedAuction.updateAuction(tokenId, endDate, { from: deployerAccount })

      bid = ether('1.2');
      await deployedAuction.bid(tokenId, { from: buyerAccount, value: bid }).should.be.rejectedWith('bids finished');
    });

    it('finish an auction with no bids must be fulfilled', async function () {
      var tokenId = 0;
      var price = ether('1');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2022_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });
      await deployedAuction.finish(tokenId, { from: sellerAccount });
    });

    it('finish an auction before end date must be rejected', async function () {
      var tokenId = 0;
      var price = ether('1');
      var tokenUri = 'ipfs://abc';
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });
      await deployedAuction.finish(tokenId, { from: sellerAccount }).should.be.rejectedWith('auction not finished');;
    });

    it('finish an auction with bids must be fulfilled', async function () {
      var tokenId = 0;
      var price = ether('1');
      var tokenUri = 'ipfs://abc';
      var loserBid = ether('1.1');
      var winnerBid = ether('1.2');
      var startDate = SAT_JAN_01_2022_03_00_00_UTC;
      var endDate = SAT_JAN_01_2050_03_00_00_UTC;

      const PLATFORM_FEE = 5;
      
      await deployedNFT.safeMint(tokenUri, tokenId, { from: sellerAccount });
      
      await deployedAuction.createAuction(tokenId, startDate, endDate, price, { from: sellerAccount });
      await deployedAuction.bid(tokenId, { from: loserAccount, value: loserBid });
      await deployedAuction.bid(tokenId, { from: winnerAccount, value: winnerBid });

      endDate = SAT_JAN_01_2022_03_00_00_UTC;
      await deployedAuction.updateAuction(tokenId, endDate, { from: deployerAccount })

      var beforePlatformBalance = await web3.eth.getBalance(platformAccount);
      var beforeLoserBalance = await web3.eth.getBalance(loserAccount);
      var beforeWinnerBalance = await web3.eth.getBalance(winnerAccount);

      await deployedAuction.finish(tokenId, { from: sellerAccount });

      var afterPlatformBalance = await web3.eth.getBalance(platformAccount);
      var afterLoserBalance = await web3.eth.getBalance(loserAccount);
      var afterWinnerBalance = await web3.eth.getBalance(winnerAccount);
      
      var currentOwner = await deployedNFT.ownerOf(tokenId);
      var platformAmount = ((winnerBid * PLATFORM_FEE) / 100);

      expect(currentOwner).to.be.equal(winnerAccount);
      expect((beforePlatformBalance / 1E16) + (platformAmount / 1E16)).to.be.equal(afterPlatformBalance / 1E16);
      expect((beforeLoserBalance / 1E16) + (loserBid / 1E16)).to.be.equal(afterLoserBalance / 1E16);
      expect(beforeWinnerBalance).to.be.equal(afterWinnerBalance);
    });
  });
});