/* Copyright 2019 by Quopt IT Services BV
 *
 *  Licensed under the Artistic License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/Artistic-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
ITSMessageBus = function () {
    this.subscriptions = {} ;
};

ITSMessageBus.prototype.subscribe = function (MessageType, functionToCall) {
    if (!this.subscriptions[MessageType]) {
        this.subscriptions[MessageType] = [];
    }
    this.subscriptions[MessageType].push(functionToCall);
};

ITSMessageBus.prototype.unsubscribe = function (MessageType, functionToCall) {
    if (this.subscriptions[MessageType]) {
        var L = this.subscriptions[MessageType].length;
        while (i < L) {
            if(this.subscriptions[MessageType][i] === functionToCall) break;
            ++i;
        }
        if (i < L) {
            this.subscriptions[MessageType].splice(i);
        }
    }
};

ITSMessageBus.prototype.publishMessage = function (MessageType, MessageParameters) {
    if (this.subscriptions[MessageType]) {
        for (var i=0; i < this.subscriptions[MessageType].length; i++ ) {
            setTimeout(this.subscriptions[MessageType][i].bind(this.subscriptions[MessageType][i], MessageParameters) , 100);
        }
    };
};