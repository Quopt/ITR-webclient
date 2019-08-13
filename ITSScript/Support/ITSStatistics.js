/* Copyright 2019 by Quopt IT Services BV
 *
 *  Licensed under the Artistic License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://raw.githubusercontent.com/Quopt/ITR-webclient/master/LICENSE
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// function to norm test results with given data
// example to call this function
// normValue (3 , [ [-99,0], [0,5], [5,9], [9,16], [16,21], [21,99] ],  [ "0"  , "1"  , "2"  , "3"  , "4"  , "5"  ] )
//  the result will be "1" since the raw score value of 3 is in the second range of values [0,5] and the corresponding norm value is 1
//  for a raw score of 5 the resulting value would be "2" since it is in the 5,9 range. The values given are interpreted as >= 5 and < 9.
function normValue ( rawscore, rawscore2Darray, normvaluearray) {
    if (typeof(rawscore) == "string") { rawscore = Number(rawscore); }

    var resultFound = false;
    var i =0;
    for (i =0; i < rawscore2Darray.length; i ++) {
        if ( (rawscore >= rawscore2Darray[i][0]) && (rawscore < rawscore2Darray[i][1])) {
            resultFound = true;
            break;
        }
    }

    if (resultFound) {
        return normvaluearray[i];
    } else {
        return undefined;
    }
};