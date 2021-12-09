// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract CoveyLedger is Initializable {
    struct CoveyTrade {
        address trader;
        string positions;
        uint256 created_at;
    }

    mapping(address => CoveyTrade[]) trades;
    CoveyTrade[] totalTrades;
    address owner;

    function initialize() public initializer {
        owner = msg.sender;
    }

    event TradePlaced(
        address indexed analyst,
        string positions,
        uint256 indexed created_at
    );

    function placeTrade(string memory positions) public {
        CoveyTrade memory t = CoveyTrade({
            trader: msg.sender,
            positions: positions,
            created_at: block.timestamp
        });
        trades[msg.sender].push(t);
        totalTrades.push(t);

        emit TradePlaced(msg.sender, positions, block.timestamp);
    }

    function getUserTrades(address _adr)
        public
        view
        returns (CoveyTrade[] memory)
    {
        return trades[_adr];
    }

    function getAllTrades() public view returns (CoveyTrade[] memory) {
        return totalTrades;
    }
}
