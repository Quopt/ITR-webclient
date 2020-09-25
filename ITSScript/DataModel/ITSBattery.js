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

ITSBattery = function (parent, ITSSession) {
    this.myParent = parent;
    this.ITSSession = ITSSession;
    this.Active = true;
    this.ID = newGuid();
    this.BatteryName = "";

    this.BatteryType = 10; // 10 = test battery, 1000 = course composer (0-1000 reserved for testing, 1000-2000 reserved for educational)
    this.InvoiceCode = "";
    this.ReportMailAdress = "";
    this.BatteryCosts = 0;
    this.NotifyAfterBatteryCompletes = false;
    this.MailReportsWhenBatteryCompletes = false;
    this.MailReportToCandidate = false;
    this.PluginData = {};
    this.Remarks = "";
    this.ManagedByUserID = "00000000-0000-0000-0000-000000000000";

    this.BatteryReports = [];
    this.BatteryTests = [];
    //this.BatteryTests._objectType = "ITSBatteryTest";
    //this.BatteryTests.persistentProperties = "*ALL*";
    //this.BatteryReports._objectType = "ITSBatteryReport";
    //this.BatteryReports.persistentProperties = "*ALL*";

    this.AfterBatteryScript = ITSInstance.translator.getTranslatedString("ITSBattery.js", "AfterBattery", "/* please see manual for instructions before using battery scripting */");
    this.BeforeBatteryScript = ITSInstance.translator.getTranslatedString("ITSBattery.js", "BeforeBattery", "/* please see manual for instructions before using battery scripting */");

    this.persistentProperties = [
        'ID', 'Active', 'BatteryName', 'BatteryReports', 'BatteryTests', 'AfterBatteryScript', 'BeforeBatteryScript',
        'BatteryType',
        'InvoiceCode',
        'ReportMailAdress',
        'BatteryCosts',
        'NotifyAfterBatteryCompletes',
        'MailReportsWhenBatteryCompletes',
        'MailReportToCandidate',
        'PluginData',
        'Remarks',
        'ManagedByUserID',
        "PluginData"
    ];

    this.newBattery = true;
};

ITSBattery.prototype.loadBatteryDetails = function (onSuccess, onError) {
    ITSInstance.JSONAjaxLoader('batteries/' + this.ID, this, onSuccess.bind(this), onError.bind(this),
        ITSBattery, 0, 999999, '', '', 'N');
};

ITSBattery.prototype.loadBattery = function (ID, onSuccess, onError) {
    this.ID = ID;
    this.loadBatteryDetails(onSuccess, onError);
};

ITSBattery.prototype.saveToServer = function (OnSuccess, OnError) {
    this.saveToServerMaster(OnSuccess, OnError, false);
};

ITSBattery.prototype.saveToServerMaster = function (OnSuccess, OnError, toMaster) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newBattery = false;
    this.saveToServerMasterSuccess = OnSuccess;
    this.saveToServerMasterError = OnError;
    if (toMaster) {
        ITSInstance.genericAjaxUpdate('batteries/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "Y", "N");
    }  else {
        ITSInstance.genericAjaxUpdate('batteries/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    ITSInstance.MessageBus.publishMessage("Battery.Update", this);
};

ITSBattery.prototype.newBatteryTest = function (test){
    var newBT = new ITSBatteryTest( this.myParent, this.ITSSession );
    newBT.TestID = test.ID;
    newBT.Description = test.Description;
    newBT.TestName = test.TestName;
    this.BatteryTests.push(newBT);
    return newBT;
};

ITSBattery.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('batteries/' + this.ID, OnSuccess, OnError, "N", "Y");
    ITSInstance.MessageBus.publishMessage("Battery.Delete", this);
};

ITSBattery.prototype.deleteFromServerMaster = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('batteries/' + this.ID, OnSuccess, OnError, "Y", "N");
};

ITSBattery.prototype.findTestById = function (ID) {
    var testFound = undefined;
    for (var i=0; i < this.BatteryTests.length; i++) {
        if (this.BatteryTests[i].TestID == ID) {
            testFound = this.BatteryTests[i];
            break;
        }
    }
    return testFound;
};

ITSBattery.prototype.findTestIndexById = function (ID) {
    var testFound = -1;
    for (var i=0; i < this.BatteryTests.length; i++) {
        if (this.BatteryTests[i].TestID == ID) {
            testFound = i;
            break;
        }
    }
    return testFound;
};

ITSBattery.prototype.findReportById = function (ID) {
    var reportFound = undefined;
    for (var i=0; i < this.BatteryReports.length; i++) {
        if (this.BatteryReports[i].ReportID == ID) {
            reportFound = this.BatteryReports[i];
            break;
        }
    }
    return reportFound;
};

ITSBattery.prototype.findReportIndexById = function (ID) {
    var reportFound = -1;
    for (var i=0; i < this.BatteryReports.length; i++) {
        if (this.BatteryReports[i].ReportID == ID) {
            reportFound = i;
            break;
        }
    }
    return reportFound;
};
ITSBatteryTest = function (parent, ITSSession) {
    this.parent = parent;
    this.ITSInstance = ITSSession;

    this.TestID = newGuid();
    this.Description = "";
    this.TestName = "";
    this.NormID1 = "00000000-0000-0000-0000-000000000000";
    this.NormID2 = "00000000-0000-0000-0000-000000000000";
    this.NormID3 = "00000000-0000-0000-0000-000000000000";
    this._objectType = "ITSBatteryTest";

    this.persistentProperties = [ 'TestID','Description','TestName','NormID1','NormID2','NormID3', '_objectType'];
};

ITSBatteryTest.prototype.findTest = function () {
    return this.ITSInstance.tests.findTestById(this.ITSInstance.tests.testList, this.TestID);
};

ITSBatteryReport = function (parent, ITSSession) {
    this.parent = parent;
    this.ITSInstance = ITSSession;

    this.ReportID = newGuid();
    this.Description = "";

    this._objectType = "ITSBatteryReport";
    this.persistentProperties = [ 'ReportID','Description', '_objectType'];
};

ITSBatteryReport.prototype.findReport = function () {
    return this.ITSInstance.reports.findReportByID(this.ITSInstance.reports.reportsList, this.ReportID);
};

ITSBatteries = function (ITSSession) {
    this.ITSSession = ITSSession;

    this.batteryList = [];

    this.currentlyLoading = false;
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];

    this.AllBatteryDetailsLoaded = false;
    this.BatteryDetailsToLoad = 0;
};

ITSBatteries.prototype.activeBatteryAndTestList = function (ActiveItemsOnly) {
    // returns a list of (active) tests and batteries for the user to choose from
    // takes into account if the current logged in user may work with batteries only or not. In that case no tests are in the list.
    var result = [];
    if (this.ITSSession.users.currentUser.MayWorkWithBatteriesOnly == "F") {
        // add the required tests list to the result
        for (var i = 0; i < this.ITSSession.tests.testList.length; i++) {
            if (ActiveItemsOnly) {
                if (this.ITSSession.tests.testList[i] == "T") {
                    result.push(this.ITSSession.tests.testList[i]);
                }
            }
            else {
                result.push(this.ITSSession.tests.testList[i]);
            }
        }
        // add the required batteries list to the result
        for (i = 0; i < this.batteryList.length; i++) {
            if (ActiveItemsOnly) {
                if (this.batteryList[i].Active == "T") {
                    result.push(this.batteryList[i]);
                }
            }
            else {
                result.push(this.batteryList[i]);
            }
        }
    }
};

ITSBatteries.prototype.loadSuccess = function () {
    this.currentlyLoading = false;
    var i;
    for (i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }

    // now post load all the battery details
    this.BatteryDetailsToLoad = this.batteryList.length;
    var batteryIndex = 0;
    for (i = 0; i < this.batteryList.length; i++) {
        batteryIndex = i;
        this.batteryList[i].loadBatteryDetails(this.loadBatteryDetailSuccess.bind(this, batteryIndex), this.loadBatteryDetailError.bind(this, batteryIndex));
    }
};

ITSBatteries.prototype.loadBatteryDetailSuccess = function () {
    this.BatteryDetailsToLoad = this.BatteryDetailsToLoad - 1;
    if (this.BatteryDetailsToLoad <= 0) {
        this.AllBatteryDetailsLoaded = true;
    }
};

ITSBatteries.prototype.loadBatteryDetailError = function () {
    // really no idea what we need to do in this case
};

ITSBatteries.prototype.loadError = function () {
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
};

ITSBatteries.prototype.loadAvailableBatteries = function (whenLoaded, onError) {
    //ITSLogger.logMessage(logLevel.INFO,"loading available batteries");
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (onError) {
        this.onErrorCallbacks.push(onError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;

        ITSInstance.batteries.batteryList.length = 0;

        ITSInstance.genericAjaxLoader('batteries', this, ITSInstance.batteries.loadSuccess.bind(this), ITSInstance.batteries.loadError.bind(this),
            function () {
                var tempITSBattery = new ITSBattery(this, this.ITSSession);
                this.batteryList.push(tempITSBattery);
                return tempITSBattery;
            }.bind(this), -1, 0, 'BatteryName', '', ITSInstance.companies.currentCompany.NoPublicTests == "T" ? "N" : "Y", 'Y'); // no public tests means no public batteries as well...
    }
};

ITSBatteries.prototype.findBatteryById = function (batteryCollectionToSearch, ID) {
    var i = 0;
    var found = false;
    while ((i < batteryCollectionToSearch.length) && (!found)) {
        if (batteryCollectionToSearch[i].ID.toUpperCase() == ID.toUpperCase()) {
            found = true;
        } else {
            i = i + 1;
        }
    }
    if (found) {
        return i;
    } else {
        return -1;
    }
};

ITSBatteries.prototype.newBattery = function () {
    return new ITSBattery(this, ITSInstance);
};