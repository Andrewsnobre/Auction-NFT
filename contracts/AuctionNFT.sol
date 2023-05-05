// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NovaNFT.sol";

/// @title Nova Auction smart contract
/// @notice You can use this contract to create, update and finish an auction as well as bid on specific arts
contract AuctionNFT is Ownable{
    struct Bidder {
        address payable addr;
        uint256 amount;
        uint256 bidAt;
    }

    struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        uint256 amount;
        uint256 startdate;
        uint256 enddate;
        bool finished;
        Bidder[] bidders;
    }

    address payable public recipientAddr;
    NovaNFT public nftContract;

    uint256 private numAuctions;
    Auction[] private auctions;

    mapping(uint256 => uint256) private tokenIdToAuctionId;

    uint256 public  fee = 5;

    /// @param _nftContract The NovaNFT smart contract address
    /// @param _recipientAddr The platform wallet to where the fees will be transferred
    constructor(NovaNFT _nftContract, address payable _recipientAddr) {
        nftContract = _nftContract;
        recipientAddr = _recipientAddr;
    }

    /// @param _fee The platform fee percentage earned on each finished auction with a winner. E.g. 5 is equals to 5%
     function setFee(uint256 _fee) public onlyOwner{
        fee = _fee;
    }

    /// @notice This event is emitted when a new auction is created by the seller
    /// @param _tokenId The token ID of the created art
    /// @param _seller The artist address who is selling the art
    /// @param _value The art price (wei format)
    /// @param _startdate The auction start date (unix timestamp format)
    /// @param _enddate The auction end date (unix timestamp format)
    event AuctionCreated(
        uint256 indexed _tokenId,
        address indexed _seller,
        uint256 _value,
        uint256 _startdate,
        uint256 _enddate
    );

    /// @notice This method is called by the seller to create a new auction on a specific art
    /// @param _tokenId The token ID of the art being created
    /// @param _startdate The auction start date (unix timestamp format)
    /// @param _enddate The auction end date (unix timestamp format)
    /// @param _price The art price (wei format)
    /// @return auctionId The auction ID created that was linked to the art being sold
    function createAuction(
        uint256 _tokenId,
        uint256 _startdate,
        uint256 _enddate,
        uint256 _price
       
    ) public returns (uint256 auctionId) {
        require(nftContract.exists(_tokenId), "nonexistent token");
        auctionId = numAuctions++;
        tokenIdToAuctionId[_tokenId] = auctionId;
        auctions.push();
        Auction storage auction = auctions[auctionId];
        auction.tokenId = _tokenId;
        auction.seller = payable(msg.sender);
        auction.price = _price; 
        auction.startdate = _startdate; 
        auction.enddate = _enddate;       
        nftContract.transferFrom(msg.sender, address(this), _tokenId);
        emit AuctionCreated(_tokenId, msg.sender, _price, _startdate, _enddate);
    }

    /// @notice This event is emitted when a new bid is made to an auction
    /// @param _tokenId The token ID of the art that was bid
    /// @param _bidder The address of whom is making a bid on the art
    /// @param _amount The bid amount (wei format)
    event AuctionBidden(
        uint256 indexed _tokenId,
        address indexed _bidder,
        uint256 _amount
    );

    /// @notice This method is called by the bidder to make a bid on a specific art
    /// @param _tokenId The token ID of the art being bid on
    function bid(uint256 _tokenId) public payable {
        require(nftContract.exists(_tokenId), "nonexistent token");
        uint256 auctionId = tokenIdToAuctionId[_tokenId];

        Auction storage auction = auctions[auctionId];
        require(!auction.finished, "auction finished");
        require(block.timestamp > auction.startdate, "auction not started");
        require(block.timestamp < auction.enddate, "bids finished");
        require(msg.value > auction.price, "price below minimum");

        auction.amount += msg.value;
        auction.price = msg.value;
        auction.bidders.push(
            Bidder(payable(msg.sender), msg.value, block.timestamp)
        );

        emit AuctionBidden(_tokenId, msg.sender, msg.value);
    }

    /// @notice This event is emmited when an auction is finished
    /// @param _tokenId The token ID of the art that was finished
    /// @param _awarder The address of the auction winner
    event AuctionFinished(uint256 _tokenId, address indexed _awarder);

    /// @notice This method is called by anyone after the auction end date is reached
    /// @param _tokenId The token ID of the art being finished
    function finish(uint256 _tokenId) public {
        uint256 auctionId = tokenIdToAuctionId[_tokenId];
        Auction storage auction = auctions[auctionId];
        require(block.timestamp > auction.enddate, "auction not finished");
        address destination = auction.seller;
        
        if(auction.bidders.length > 0)
        {
            Bidder memory awarder = auction.bidders[auction.bidders.length - 1];

            for (uint256 i = 0; i < auction.bidders.length - 1; i++) {
                Bidder memory bidder = auction.bidders[i];
                bidder.addr.transfer(bidder.amount);
            }
            
            uint256 receipientAmount = (awarder.amount * fee) / 100;
            uint256 sellerAmount = awarder.amount - receipientAmount;

            recipientAddr.transfer(receipientAmount);
            auction.seller.transfer(sellerAmount);

            destination = awarder.addr;
        }

        nftContract.transferFrom(address(this), destination, _tokenId);

        auction.finished = true;
        emit AuctionFinished(_tokenId, destination);
    }

    /// @notice This method is called by the contract owner to update an auction end date
    /// @param _tokenId The token ID of the art that will have the respective auction end date updated
    /// @param _enddate The new auction end date to be updated
    function updateAuction(uint256 _tokenId, uint256 _enddate) public onlyOwner {
        require(nftContract.exists(_tokenId), "nonexistent token");
        uint256 auctionId = tokenIdToAuctionId[_tokenId];

        Auction storage auction = auctions[auctionId];
        auction.enddate = _enddate;
    }
}