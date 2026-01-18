// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract TokenSubscriptionManager is AutomationCompatible {

    IERC20 public immutable token; 

    struct Subscription {
        address user;
        address merchant;
        uint256 amount;     
        uint256 interval;   
        uint256 lastPaid;
        bool active;
        bool exists; 
    }

    mapping(address => mapping(address => Subscription)) public subscriptions;
    mapping(address => address[]) public merchantSubscribers;
    address[] public merchants;

    constructor(address _token, address[] memory _merchants) {
        token = IERC20(_token);
        merchants = _merchants;
    }


   function subscribe(
    address merchant,
    uint256 amount,
    uint256 interval
) external {
    require(amount > 0, "amount=0");
    require(interval > 0, "interval=0");

    Subscription storage sub = subscriptions[msg.sender][merchant];
    require(!sub.active, "already active");

    if (!sub.exists) {
        merchantSubscribers[merchant].push(msg.sender);
        sub.exists = true;
    }

    require(
        token.allowance(msg.sender, address(this)) >= amount,
        "not approved"
    );
    require(
        token.balanceOf(msg.sender) >= amount,
        "insufficient balance"
    );

    token.transferFrom(msg.sender, merchant, amount);

    sub.user = msg.sender;
    sub.merchant = merchant;
    sub.amount = amount;
    sub.interval = interval;
    sub.lastPaid = block.timestamp;
    sub.active = true;
}


    function cancel(address merchant) external {
        Subscription storage sub = subscriptions[msg.sender][merchant];
        require(sub.active, "not active");
        sub.active = false;

    }


    function _charge(address user, address merchant) internal {
        Subscription storage sub = subscriptions[user][merchant];

        if (
            sub.active &&
            block.timestamp >= sub.lastPaid + sub.interval &&
            token.allowance(user, address(this)) >= sub.amount &&
            token.balanceOf(user) >= sub.amount
        ) {
            sub.lastPaid = block.timestamp;
            token.transferFrom(user, merchant, sub.amount);
        }
    }


    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint i = 0; i < merchants.length; i++) {
            address merchant = merchants[i];
            address[] memory users = merchantSubscribers[merchant];

            for (uint j = 0; j < users.length; j++) {
                Subscription memory sub = subscriptions[users[j]][merchant];

                if (
                    sub.active &&
                    block.timestamp >= sub.lastPaid + sub.interval &&
                    token.allowance(users[j], address(this)) >= sub.amount &&
                    token.balanceOf(users[j]) >= sub.amount
                ) {
                    return (true, abi.encode(merchant, users[j])); 
                }
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (address merchant, address user) = abi.decode(performData, (address, address));
        _charge(user, merchant);
    }


    function getSubscribers(address merchant) external view returns (address[] memory) {
        return merchantSubscribers[merchant];
    }
}
