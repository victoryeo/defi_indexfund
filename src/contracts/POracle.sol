// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity >=0.4.21 <=0.8.7;

contract POracle {
    uint private constant BLOCK_INTERVAL = 2;
    uint[] private _pWethArray;
    uint private _pWethArrayIndex;
    uint private _pWeth;
    uint private _pDai;
    uint private _pMkr;

    event LOG_WETH_PRICE (
        uint pWeth,
        uint pWethArrayIndex
    );
    
    constructor() public {
        _pWethArrayIndex = 0;
    }

    function inputWethPrice(uint arg1) external {
        //push the price value to array element
        _pWethArray.push(arg1);
        _pWethArrayIndex++;
        // roll back if uint exceeed (2^256)-1
        if (_pWethArrayIndex >= (2**256)-1) {
            _pWethArrayIndex = 0;
        }
    }

    function calcWethPrice() external {
        uint sum = 0;
        uint startIndex = _pWethArrayIndex - BLOCK_INTERVAL;
        for (uint i = startIndex; i < _pWethArrayIndex; i++) {
            sum += _pWethArray[i];
        }
        // take the mean of the sum
        _pWeth = sum / BLOCK_INTERVAL;
        emit LOG_WETH_PRICE(_pWeth, _pWethArrayIndex);
    }

    function getWethPrice() external view returns (uint) {
        return _pWeth;
    }
}