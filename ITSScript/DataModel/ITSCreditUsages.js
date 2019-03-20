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

function ITSCreditUsagePerMonth  (uParent) {
    this.myParent = uParent;
    this.year = 0;
    this.month = 0;
    this.ticks = 0;
    this.DiscountedTicks = 0;
};


function ITSCreditGrant (uParent) {
    this.myParent = uParent;
    this.ID = newGuid();
    this.UserID = "";
    this.CompanyID = "";
    this.GrantedWhen = new Date();
    this.Remarks = "";
    this.CreditsGranted = 0;
    this.Paid = true;
    this.UserDescription = "";

    this.persistentProperties = [
        'ID','UserID','CompanyID','GrantedWhen',
        'Remarks','CreditsGranted', 'Paid', 'UserDescription'
    ];

    this.lastSavedJSON = "";
};

ITSCreditGrant.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    ITSInstance.genericAjaxUpdate('creditgrants/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    ITSInstance.MessageBus.publishMessage("CreditGrant.Create", this);
};

function ITSCreditGrants(uParent) {
    this.myParent = uParent;

    this.currentlyLoading = false;
    this.creditGrantsList = [];
};

ITSCreditGrants.prototype.loadCreditGrants = function (companyId, OnSuccess, OnError) {
    this.loadOK = OnSuccess;
    this.loadError = OnError;
    this.listLoaded = false;
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;
        this.listLoaded = false;
        this.creditGrantsList = [];
        ITSInstance.JSONAjaxLoader('creditgrants', this.creditGrantsList,
            this.loadOKcallback.bind(this), this.loadErrorcallback.bind(this), 'ITSCreditGrant', 0, 100, "GrantedWhen desc", "N", "N", "N", "CompanyID='" + companyId + "'");
    }
};
ITSCreditGrants.prototype.loadOKcallback = function () {
    this.listLoaded = true;
    this.currentlyLoading = false;
    this.loadOK();
};
ITSCreditGrants.prototype.loadErrorcallback = function () {
    this.currentlyLoading = false;
    this.loadError();
};
