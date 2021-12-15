// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract CoveyLedger is Initializable {
    struct coveyContent {
        address creator;
        string content;
        uint256 created_at;
    }

    mapping(address => coveyContent[]) data;
    coveyContent[] allContent;
    address owner;

    function initialize() public initializer {
        owner = msg.sender;
    }

    event contentCreated(
        address indexed creator,
        string content,
        uint256 indexed created_at
    );

    function createContent(string memory content) public {
        coveyContent memory t = coveyContent({
            creator: msg.sender,
            content: content,
            created_at: block.timestamp
        });
        data[msg.sender].push(t);
        allContent.push(t);

        emit contentCreated(msg.sender, content, block.timestamp);
    }

    function getCreatorContent(address _adr)
        public
        view
        returns (coveyContent[] memory)
    {
        return data[_adr];
    }

    function getAllContent() public view returns (coveyContent[] memory) {
        return allContent;
    }
}
