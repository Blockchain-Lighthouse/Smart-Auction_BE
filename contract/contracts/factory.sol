//SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.17;

import "./auction.sol";


/*
    * @author : Blockchain Lighthouse Team
    * @notice : Auction Factory Contract
*/
contract Factory {
    address public admin;
    bool public lock;
    uint256 public totalAuctions;

    struct AuctionTx {
        uint auctionId;
        address contractPath;
        string ipfsPath;
        address seller;
        uint initPrice;
        uint256 timestamp;
    } 

    constructor() {
        admin = msg.sender;
    }

    mapping(uint256 => AuctionTx) public auctionRecord; 

    modifier onlyAdmin() {
        require(msg.sender == admin, "ERR: Not Authorized");
        _;
    }

    modifier mutexGuard() {
        require(!lock, "ERR : CURRENTLY LOCKED");
        lock = true;
        _;
        lock = false;
    }

    event AuctionCreated(
        uint indexed auctionId,
        address auctionContract,
        address caller,
        uint256 price,
        uint256 occurredAt
    );

    /*
     * @notice : Create Auction Function;
     * @caller : First Bidder (Client)
     * @value : Minimum 0.1 MATIC required; (0.1 MATIC = 150 KRW <2023.03.30>)
     * @_auctionId : Auction Board ID (PK);
     * @_ipfsPath : Auction Detail Record on Ipfs URL Path;
     * @_seller : Auction Board Writer;
     * @_maxPrice : Immediately Buy Price;
     * @_expirationUinx : Expiration Time want to set of the auction; (Ex : 3600 => block.timestamp ± 3600, 1Hour)
    */
    function createAuction(
        uint256 _auctionId, 
        string memory _ipfsPath, 
        address _seller, 
        uint256 _maxPrice, 
        uint256 _expirationUinx
    ) external payable mutexGuard {
        require(msg.value >= 0.1 ether, "ERR: MINIMUM 0.1 MATIC");
        require(auctionRecord[_auctionId].contractPath == address(0), "ERR: AUCTION ALREADY EXIST");
        require(_seller != msg.sender, "ERR : SELLER COULD NOT BE BIDDER");
        // Create Auction Contract & Send msg.value; (No Commission);
        Auction newAuction = new Auction{
            value : msg.value
        }(
            _auctionId, 
            _ipfsPath, 
            _seller, 
            msg.sender, 
            admin, 
            _maxPrice, 
            block.timestamp, 
            _expirationUinx
        );
  
        auctionRecord[_auctionId] = AuctionTx(
            _auctionId,
            address(newAuction),
            _ipfsPath,
            _seller,
            msg.value,
            block.timestamp
        );
        
        totalAuctions++;
        
        emit AuctionCreated(
            _auctionId,
            address(newAuction),
            msg.sender, 
            msg.value,
            block.timestamp
        );
    }

    /*
     * @notice : Change New Admin Function;
     * @caller : Original Admin;
     * @_newAdmin : New Admin Address;
    */
    function changeAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }

    /*
     * @notice : Emergency Stop;
     * @caller : Admin;
    */
    function emergencyStop() external onlyAdmin {
        lock = !lock;
    }
}