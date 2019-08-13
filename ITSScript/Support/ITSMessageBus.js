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
ITSMessageBus = function () {
    this.subscriptions = {} ;
    this.eventsFired = {};
};

ITSMessageBus.prototype.subscribe = function (MessageType, functionToCall, checkIfAlreadyFired) {
    if (!this.subscriptions[MessageType]) {
        this.subscriptions[MessageType] = [];
    }
    this.subscriptions[MessageType].push(functionToCall);
    if (checkIfAlreadyFired) {
        // check if the event is already fired and if so call the function
        if (this.eventsFired[MessageType]) functionToCall();
    }
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
    //console.log("publishMessage " + MessageType + "(" + MessageParameters + ")");
    this.eventsFired[MessageType] = true;
    if (this.subscriptions[MessageType]) {
        for (var i=0; i < this.subscriptions[MessageType].length; i++ ) {
            setTimeout(this.subscriptions[MessageType][i].bind(this.subscriptions[MessageType][i], MessageParameters) , 1);
        }
    };
};