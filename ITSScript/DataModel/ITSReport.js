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

function ITSReports(par,session) {
    this.ITSSession = session;
    this.myParent = par;

    this.reportsList = [];

    this.currentReport = {}; // a ITSGraph object that contains the context for the current generated report

    this.currentlyLoading = false;
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.listLoaded = false;
};

ITSReports.prototype.loadAvailableReportsList = function (whenLoaded, whenError) {
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (whenError) {
        this.onErrorCallbacks.push(whenError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;

        ITSInstance.JSONAjaxLoader('reportdefinitions', this.reportsList, this.loadSuccess.bind(this), this.loadError.bind(this),
            "ITSReport",
            0, 999999, '', 'N',ITSInstance.companies.currentCompany.NoPublicTests ? "N" : "Y", 'Y');
    }
};

ITSReports.prototype.loadSuccess = function () {
    this.listLoaded = true;
    this.currentlyLoading = false;
    for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSReports.prototype.loadError = function () {
    this.listLoaded = false;
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSReports.prototype.newReport = function (addToReportsList) {
    var temp = new ITSReport(this,this.ITSSession);
    if (addToReportsList) this.reportsList.push(temp);
    return temp;
};

ITSReports.prototype.findReportByID = function (reportsList, reportID) {
    for (var i=0; i < reportsList.length; i++) {
        if (reportsList[i].ID == reportID) {
            return reportsList[i];
        }
    }
    return undefined;
};

ITSReports.prototype.removeReportByID = function (reportID, OnSucces, OnError) {
    var indexFound = -1;
    for (var i=0; i < this.reportsList.length; i++) {
        if (this.reportsList[i].ID == reportID) {
            indexFound = i;
            break;
        }
    }
    if (indexFound >= 0) {
        this.reportsList[indexFound].deleteFromServer(OnSucces, OnError);
        this.reportsList.splice(indexFound,1);
    }
};

ITSReports.prototype.hasReportForTest = function (testID) {
    // check if there are reports available for this test
    for (var i=0; i < this.reportsList.length; i++) {
        if (this.reportsList[i].TestID == testID) {
            return true;
        }
    }
    return false;
};

ITSReports.prototype.findReportsForTests = function (testIDs) {
    // testIDs contains an array of test id's to get the reports for
    testIDs.sort();
    var testList = testIDs;
    var toReturn = [];
    // check if there are reports available for this test
    //console.log(this.reportsList);
    for (var i=0; i < this.reportsList.length; i++) {
        //console.log(this.reportsList[i].TestID);
        if ( testList.indexOf(this.reportsList[i].TestID) >= 0) {
            toReturn.push(this.reportsList[i]);
        } else {
            if (this.reportsList[i].TestIDs != "") {
                var toCheckList = this.reportsList[i].TestIDs.split(',');
                var noneMissing = true;
                for (var tcl=0; tcl < toCheckList.length; tcl++) {
                    if (testList.indexOf(toCheckList[tcl]) == -1) {
                        noneMissing = false;
                        break;
                    }
                }
                if (noneMissing) {
                    toReturn.push(this.reportsList[i]);
                }
            }
        }
    }
    return toReturn;
};

function ITSReport(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.ID = newGuid();

    this.Description = ""; // this is the name of the report.
    this.Explanation = "";
    this.InvoiceCode = "";
    this.CostsInTicks = 0;
    this.ReportType = -1; // 0 = test report, 10 = session report (spanning accross multiple tests), 20 = group report, 30 = 360 degrees group report
    // 1000 = course report
    //  (0-1000 reserved for testing, 1000-2000 reserved for educational)
    this.Remarks = "";
    this.ReportLanguage = "EN";
    this.Active = false;
    this.DefaultReport = false;
    this.BeforeReportScript = "";
    this.AfterReportScript = "";
    this.PerCandidateReportScript = "";
    this.ReportText = "";
    this.TestIDs = ""; // a CSV separated list of test guids that this report requires. The list should be sorted before storing.
    this.TestID = '{00000000-0000-0000-0000-000000000000}';
    this.ReportGraphs = []; // graphs belonging to this report of the ITSGraph type
    this.PluginData = {};
    this.Generation = 1;
    this.dbsource = 0;

    this.persistentProperties = ['ID',
        'Description',
        'Explanation',
        'InvoiceCode' ,
        'CostsInTicks' ,
        'ReportType' ,
        'Remarks' ,
        'ReportLanguage' ,
        'Active' ,
        'DefaultReport' ,
        'PluginData',
        'BeforeReportScript',
        'AfterReportScript',
        'PerCandidateReportScript',
        'ReportGraphs',
        'TestID',
        'TestIDs',
        'ReportText',
        'Generation'];

    this.currentlyLoading = false;
    this.detailsLoaded = false;
    this.newReport = true;
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.lastSavedJSON = "";

    this.ReportGraphs.persistentProperties = "*ALL*";
};

ITSReport.prototype.getReportDescriptionWithDBIndicator = function () {
    if (this.dbsource) {
        if (this.dbsource == 1) {
            return this.Description + " " + ITSInstance.translator.getTranslatedString("js", "MasterTag", "[centrally managed]");;
        } else {
            return this.Description;
        }
    } else {
        return this.Description;
    }
};

ITSReport.prototype.isCentrallyManaged = function () {
    if (this.dbsource) {
        if (this.dbsource == 1) {
            return true;
        }
    }
    return false;
};

ITSReport.prototype.generateGraphImages = function (reportTextToScan) {
    for (var i=0; i < this.ReportGraphs.length; i ++) {
        reportTextToScan = this.ReportGraphs[i].generateGraphImage(reportTextToScan, this);
    }
    return reportTextToScan;
};

ITSReport.prototype.generateTestReport = function (candidateSession, candidateSessionTest, prepareOnly) {
    // please note that the session must be COMPLETELY loaded before calling this option
    // build up the context
    this.session = candidateSession;
    this.sessiontest = candidateSessionTest;
    this.test = candidateSessionTest.testDefinition;
    this.candidate = candidateSession.Person;
    this.scales = {};
    for (var i = 0; i < this.test.scales.length; i++) {
        this.scales[this.test.scales[i].scaleVarName] = this.test.scales[i];
    }
    this[candidateSessionTest.testDefinition.TestName] = this.session.SessionTests[i];
    this[candidateSessionTest.testDefinition.ID] = this.session.SessionTests[i];
    // run the script before the report
    try {
        eval(this.BeforeReportScript);
    } catch (err) {
        ITSLogger.logMessage(logLevel.ERROR,"Before report script failed " + err.message);
    }
    // now substitute everything in the report
    if (! prepareOnly) {
        var reportTextToScan = this.ReportText ;
        reportTextToScan = this.generateGraphImages(reportTextToScan);
        return envSubstitute(reportTextToScan, this,  true);
    }
};

ITSReport.prototype.generateSessionReport = function (candidateSession, prepareOnly) {
    // please note that the session must be COMPLETELY loaded before calling this option
    // build up the context
    this.session = candidateSession;
    for (var i=0; i < this.session.SessionTests; i++) {
        this[this.session.SessionTests[i].testDefinition.TestName] = this.session.SessionTests[i];
        this[this.session.SessionTests[i].testDefinition.ID] = this.session.SessionTests[i];
    }
    this.candidate = candidateSession.Person;
    // run the script before the report
    try {
        eval(this.BeforeReportScript);
    } catch (err) {
        ITSLogger.logMessage(logLevel.ERROR,"Before report script failed " + err.message);
    }
    // now substitute everything in the report
    if (! prepareOnly) {
        var reportTextToScan = this.ReportText ;
        reportTextToScan = this.generateGraphImages(reportTextToScan);
        return envSubstitute(reportTextToScan, this,  true);
    }
};

ITSReport.prototype.loadDetailDefinition = function (whenLoaded, OnError) {
    //ITSLogger.logMessage(logLevel.ERROR,"loading report details " + this.TestName);
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (OnError) {
        this.onErrorCallbacks.push(OnError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;

        if (!this.detailsLoaded) {
            var masterDB = "N";
            var clientDB = "Y";
            if (this.dbsource && this.dbsource == 1) { masterDB = "Y"; clientDB = "N"; }

            ITSInstance.JSONAjaxLoader('reportdefinitions/' + this.ID, this, this.loadDetailSuccess.bind(this), this.loadDetailError.bind(this), 'ITSReport', 0, 999999, '', 'Y', masterDB, clientDB);
        } else {
            if (whenLoaded) whenLoaded();
        }
    }
};

ITSReport.prototype.loadDetailSuccess = function () {
    ITSLogger.logMessage(logLevel.INFO,"Loaded report details " + this.Description);
    this.currentlyLoading = false;
    this.detailsLoaded = true;
    this.newReport = false;
    this.lastSavedJSON = ITSJSONStringify(this);
    for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSReport.prototype.loadDetailError = function () {
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSReport.prototype.saveToServer = function (OnSuccess, OnError) {
    this.saveToServerMaster(OnSuccess, OnError, false);
};

ITSReport.prototype.saveToServerMaster = function (OnSuccess, OnError, toMaster) {
    if (this.Generation >= Number.MAX_SAFE_INTEGER) { this.Generation = Number.MIN_SAFE_INTEGER; }
    this.Generation = this.Generation +1;
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newReport = false;
    if (toMaster) {
        var includeMaster = "Y";
        var includeClient = "N";
    } else {
        var includeMaster = "N";
        var includeClient = "Y";
    }
    ITSInstance.genericAjaxUpdate('reportdefinitions/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, includeMaster, includeClient);
};

ITSReport.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('reportdefinitions/' + this.ID, OnSuccess, OnError, 'N', 'Y');
};

ITSReport.prototype.deleteFromServerMaster = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('reportdefinitions/' + this.ID, OnSuccess, OnError, 'Y', 'N');
};

ITSReport.prototype.saveToServerRequired = function () {
    return (this.lastSavedJSON != ITSJSONStringify(this)) ;
};

ITSReport.prototype.copyReport = function () {
    var newReport = new ITSReport(this.myParent, this.ITSSession);
    ITSJSONLoad(newReport, ITSJSONStringify(this), this.myParent, this.ITSSession, 'ITSReport');
    newReport.ID = newGuid();
    return newReport;
};

ITSReport.prototype.getTranslatableReportText = function () {
   return xxx (this.ReportText);
};