// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    struct CarbonCredit {
        uint projectId;
        uint verificationReportId;
        uint vintageYear;
    }

    mapping(uint256 => CarbonCredit) public carbonCreditInfo;

    event CarbonCreditMinted(uint256 indexed tokenId, uint indexed projectId, address indexed to);
    event CarbonCreditRetired(uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("Blue Carbon Credit", "BCC") Ownable(msg.sender) {}

    function safeMint(
        address to,
        uint _projectId,
        uint _verificationReportId,
        uint _vintageYear
    ) public onlyOwner {
        _tokenIdCounter++; // Replace Counters
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        carbonCreditInfo[tokenId] =
            CarbonCredit(_projectId, _verificationReportId, _vintageYear);
        emit CarbonCreditMinted(tokenId, _projectId, to);
    }

    function retire(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        _burn(tokenId);
        emit CarbonCreditRetired(tokenId, msg.sender);
    }
}
