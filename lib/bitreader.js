/* jshint bitwise: false */

'use strict';

exports.BitReader = function (data, bitOffset) {
    this.readValue = function (bitLength) {
        var value = 0;

        for (var i = bitLength; i > 0; i -= 1) {
            var byteOffset = (bitOffset + i - 1) >> 3;

            value = (value << 1) | ((data[byteOffset] >> ((bitOffset + i - 1) % 8)) & 1);
        }

        bitOffset += bitLength;

        return value;
    };
};
