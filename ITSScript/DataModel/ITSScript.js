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

var ITSScriptLineType = new enums.Enum("unknown", "ifthenelse", "callfunction", "assignment", "caseline", "case", "repeatloop", "functiondeclaration", "statements", "variables");

function ITSScript (parent, session) {
    this.myParent = parent;
    this.ITSSession = session;
}

ITSScript.prototype.newScriptLine = function() {
    var newScriptLine = new ITSScriptLine(this.myParent, this.ITSSession);
    this.scriptLines.push(newScriptLine);
    return newScriptLine;
}

function ITSScriptLine (parent, session) {
    this.myParent = parent;
    this.ITSSession = session;
    this.lineType = ITSScriptLineType.unknown;

    this.scriptLines = []; //only used for script blocks. Depending on the line type different fields are present.
}

