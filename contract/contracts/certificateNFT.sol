//SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CertificateNFT is ERC721URIStorage {
    uint256 TotalSupply;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    function mintCertificate(string memory _tokenURI) external {
        _mint(msg.sender, TotalSupply+1);
        _setTokenURI(TotalSupply+1, _tokenURI);

        unchecked {
            TotalSupply += 1;
        }
    }
}