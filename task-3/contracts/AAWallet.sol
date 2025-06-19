// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@account-abstraction/contracts/interfaces/UserOperation.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AAWallet is IAccount {
    address public owner;
    uint256 public nonce;

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256
    ) external view override returns (uint256 validationData) {
        address recovered = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(userOpHash),
            userOp.signature
        );
        require(recovered == owner, "Invalid signature");
        return 0; // valid
    }

    function execute(address target, bytes calldata data) external {
        require(
            msg.sender == address(this) || msg.sender == owner,
            "Unauthorized"
        );
        (bool success, ) = target.call(data);
        require(success, "Call failed");
        nonce++;
    }
}
