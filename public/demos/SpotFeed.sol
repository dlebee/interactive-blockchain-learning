// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Spot feed: store latest price per (leftAsset, rightAsset) pair.
/// address(0) = native token; any other address = contract (e.g. ERC-20).
/// Canonical ordering ensures (A,B) and (B,A) yield the same storage slot.
contract SpotFeed {
    struct Spot {
        address left;
        address right;
        uint256 price;
        uint256 timestamp;
        uint256 expiry;
    }

    address public owner;
    address public oracle;

    mapping(bytes32 => Spot) public spotByPair;

    event SpotUpdated(bytes32 indexed pairKey, uint256 price, uint256 timestamp, uint256 expiry);
    event OracleChanged(address indexed previousOracle, address indexed newOracle);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "not oracle");
        _;
    }

    constructor() {
        owner = msg.sender;
        oracle = msg.sender;
    }

    function setOracle(address newOracle) external onlyOwner {
        address prev = oracle;
        oracle = newOracle;
        emit OracleChanged(prev, newOracle);
    }

    /// @dev Returns canonical (left, right) so that left < right.
    function _canonical(address leftAsset, address rightAsset) internal pure returns (address left, address right) {
        if (leftAsset < rightAsset) return (leftAsset, rightAsset);
        return (rightAsset, leftAsset);
    }

    function _pairKey(address left, address right) internal pure returns (bytes32) {
        return keccak256(abi.encode(left, right));
    }

    /// @dev Single spot update (reduces stack depth when used from batch).
    function _setSpot(bytes32 key, address cLeft, address cRight, uint256 price, uint256 timestamp, uint256 expiry) internal {
        Spot storage s = spotByPair[key];
        s.left = cLeft;
        s.right = cRight;
        s.price = price;
        s.timestamp = timestamp;
        s.expiry = expiry;
        emit SpotUpdated(key, price, timestamp, expiry);
    }

    function _submitOne(address leftAsset, address rightAsset, uint256 price, uint256 timestamp, uint256 expiry) internal {
        (address cLeft, address cRight) = _canonical(leftAsset, rightAsset);
        _setSpot(_pairKey(cLeft, cRight), cLeft, cRight, price, timestamp, expiry);
    }

    function _submitOnePrehashed(address leftAsset, address rightAsset, bytes32 pairKey, uint256 price, uint256 timestamp, uint256 expiry) internal {
        (address cLeft, address cRight) = _canonical(leftAsset, rightAsset);
        require(_pairKey(cLeft, cRight) == pairKey, "invalid pairKey");
        _setSpot(pairKey, cLeft, cRight, price, timestamp, expiry);
    }

    /// @dev For demo: assume 18 decimals.
    function _decimals(address) internal pure returns (uint8) {
        return 18;
    }

    /// @dev Submit full data; contract stores struct for the pair.
    function submit(
        address leftAsset,
        address rightAsset,
        uint256 spot_price,
        uint256 timestamp,
        uint256 expiry
    ) external onlyOracle {
        (address cLeft, address cRight) = _canonical(leftAsset, rightAsset);
        _setSpot(_pairKey(cLeft, cRight), cLeft, cRight, spot_price, timestamp, expiry);
    }

    /// @dev Batch submit: two asset arrays, same length as spot_prices/timestamps/expiries.
    function submitBatch(
        address[] calldata leftAssets,
        address[] calldata rightAssets,
        uint256[] calldata spot_prices,
        uint256[] calldata timestamps,
        uint256[] calldata expiries
    ) external onlyOracle {
        uint256 n = leftAssets.length;
        require(rightAssets.length == n, "length mismatch");
        require(spot_prices.length == n && timestamps.length == n && expiries.length == n, "length mismatch");
        for (uint256 i = 0; i < n; i++) {
            _submitOne(leftAssets[i], rightAssets[i], spot_prices[i], timestamps[i], expiries[i]);
        }
    }

    /// @dev Off-chain optimization: submitter sends precomputed pair key; contract only verifies and stores. Saves one keccak256.
    function submitPrehashed(
        address leftAsset,
        address rightAsset,
        bytes32 pairKey,
        uint256 spot_price,
        uint256 timestamp,
        uint256 expiry
    ) external onlyOracle {
        (address cLeft, address cRight) = _canonical(leftAsset, rightAsset);
        require(_pairKey(cLeft, cRight) == pairKey, "invalid pairKey");
        _setSpot(pairKey, cLeft, cRight, spot_price, timestamp, expiry);
    }

    /// @dev Batch prehashed: two asset arrays + one array of pair keys.
    function submitBatchPrehashed(
        address[] calldata leftAssets,
        address[] calldata rightAssets,
        bytes32[] calldata pairKeys,
        uint256[] calldata spot_prices,
        uint256[] calldata timestamps,
        uint256[] calldata expiries
    ) external onlyOracle {
        uint256 n = leftAssets.length;
        require(rightAssets.length == n && pairKeys.length == n, "length mismatch");
        require(spot_prices.length == n && timestamps.length == n && expiries.length == n, "length mismatch");
        for (uint256 i = 0; i < n; i++) {
            _submitOnePrehashed(leftAssets[i], rightAssets[i], pairKeys[i], spot_prices[i], timestamps[i], expiries[i]);
        }
    }

    function _computeQuantityOut(uint256 quantity, uint256 price, bool leftToRight) internal pure returns (uint256) {
        uint256 leftScale = 1e18;
        uint256 rightScale = 1e18;
        if (leftToRight) {
            return quantity * price * rightScale / (1e8 * leftScale);
        }
        return quantity * 1e8 * leftScale / (price * rightScale);
    }

    /// @dev Calculate quantityOut for tokenIn -> tokenOut using the latest spot. tokenIn can be address(0) for native.
    function calculate(address tokenIn, address tokenOut, uint256 quantity)
        external
        view
        returns (bool exists, bool expiredOrNot, uint256 timestampOfSpotPrice, uint256 quantityOut)
    {
        (address left, address right) = _canonical(tokenIn, tokenOut);
        Spot storage spot = spotByPair[_pairKey(left, right)];
        if (spot.timestamp == 0) return (false, true, 0, 0);
        bool leftToRight = (tokenIn == left);
        quantityOut = _computeQuantityOut(quantity, spot.price, leftToRight);
        return (true, block.timestamp > spot.expiry, spot.timestamp, quantityOut);
    }
}
