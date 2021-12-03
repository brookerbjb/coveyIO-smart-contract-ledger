// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CoveyLedger {
  struct CoveyTrade {
        address trader;
        string positions;
        string created_at;
    }

  mapping(address => CoveyTrade[]) trades;
  CoveyTrade[] totalTrades;
  address owner;

  constructor() {
    owner = msg.sender;
  }

  event TradePlaced(address indexed trader,string positions,  string indexed created_at);
  
  function placeTrade(string memory positions, string memory created_at) public {
      CoveyTrade memory t = CoveyTrade({
          trader: msg.sender,
          positions: positions,
          created_at: created_at
      });
      trades[msg.sender].push(t);
      totalTrades.push(t);

      emit TradePlaced(msg.sender,positions,created_at);
  }

  function getUserTrades(address _adr) public view returns(CoveyTrade[] memory) {
      return trades[_adr];
  }

  function getAllTrades() public view returns(CoveyTrade[] memory) { 
      return totalTrades;
  }
}
