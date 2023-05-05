// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Nova NFT (ERC-721) smart contract
/// @notice You can use this contract to mint new NFT of specific arts
contract NovaNFT is ERC721, ERC721URIStorage, Ownable {
    
    address public contractAddress;

    /// @notice Used to give approval permissions to the marketplace contract so that their NFT can be transferred to it
    /// @param marketplaceAddress The address of the marketplace contract
    function setContractAuction(address marketplaceAddress) public onlyOwner{
        contractAddress = marketplaceAddress;
    }

    /* solhint-disable no-empty-blocks */
    constructor() ERC721("NovaNFT", "NNFT") {}

    /// @notice safely mint a new token. Reverts if the given token ID already exists. 
    ///  If the target address is a contract, it must implement onERC721Received,
    ///  otherwise, the transfer is reverted.
    /// @param uri The token URI that will be minted. E.g. "ipfs://abc"
    /// @param token The token ID that will be minted. E.g. "1"
    function safeMint(string memory uri, uint256 token) public {
        _safeMint(msg.sender, token);
        _setTokenURI(token, uri);
        setApprovalForAll(contractAddress, true);
    }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @param tokenId The token ID that will be checked for existence
    /// @return Returns whether the specified token exists
    function exists(uint256 tokenId)
        external
        view
    returns (bool)
    {
        return super._exists(tokenId);
    }
    
    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
