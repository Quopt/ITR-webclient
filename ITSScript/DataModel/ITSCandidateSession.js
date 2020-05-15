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

//  ITSStatus = ( ReadyToGo = 1, Busy = 2, Done = 3);
// ITSActiveStatus = (Active =1, Inactive =2, ActiveAndInactive =3);
// ITSTestTaking = ( ByHand = 1, OnlyRawScores = 2, FullyAutomated = 3);
// ITSSessionType = ( PersonSession = 0, /// a session with one candidate where every test is for this candidate
//     SimplePersonSession = 1, /// a simple session made with the sboard
// GroupSession = 10, /// one main session where the group session is defined, every group member has his/her own session with the tests in it as defined in the main session
// x360DegreesSession = 20, /// one main session where the candidate and observer each have their own tests in the session. There is only one test in a 360 degress session.
// PublicSessionDefinition = 30, /// the definition of the a public session accessible to everyone on the internet. Tests in this session are for virtual person, meaning that there is no person attached to the test.
// PublicSession = 31 /// An instance of this public session.

ITSCandidateSession = function (session, ITSSession) {
    this.myParent = session;
    this.ITSSession = ITSSession;
    this.ID = newGuid();
    this.GroupSessionID = "00000000-0000-0000-0000-000000000000";
    this.GroupID = "00000000-0000-0000-0000-000000000000";

    //this.Person = ITSSession.candidates.newCandidate(session, ITSSession);
    //this.PersonID = this.Person.ID;
    this.regenerateCandidate();

    this.SessionType = 0; // 0 = PersonSession. 1=Public (might be temporary) session. 100 = Group session. 200 = public base session.
    this.Description = "";
    this.Goal = "";
    this.UsedBatteryIDs = "";
    this.UserDefinedFields = "";
    this.Remarks = "";
    this.CreateDate = new Date();
    this.AllowedStartDateTime = new Date();
    this.AllowedEndDateTime = new Date();
    this.AllowedEndDateTime.addMonths(12);
    this.StartedAt = new Date(2000,1,1);
    this.EndedAt = new Date(2000,1,1);
    this.Status = 10; // 10=ReadyToGo, 20 in progress, 30 done
    this.SessionState = "Ready";
    this.Active = true;
    this.EMailNotificationAdresses = "";
    this.EnforceSessionEndDateTime = false;
    this.ManagedByUserID =  "00000000-0000-0000-0000-000000000000";
    if (ITSSession.users) {
        if (ITSSession.users.currentUser) {
            this.ManagedByUserID = ITSSession.users.currentUser.ID;
        }
    }
    this.EmailNotificationIncludeResults = false;

    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";
    this.PluginData.sessionParameters = {};
    this.PluginData.sessionStorage = {};

    var currentTime = new Date.now();
    this.SessionStartDateTime = currentTime;
    currentTime.addMonths(12);
    this.SessionEndDateTime = currentTime;
    this.StatusDescription="Ready";

    this.SessionTests = []; // a collection of ITSCandidateSessionTest objects

    this.AuditTrail = []; // the audit trail for this session. This needs to be loaded on demand.

    this.newSession = true;

    this.persistentProperties = [
        'ID', 'GroupSessionID', 'GroupID', 'PersonID', 'SessionType', 'Description', 'Goal', 'UsedBatteryIDs', 'UserDefinedFields',
        'Remarks', 'AllowedStartDateTime', 'AllowedEndDateTime', 'StartedAt', 'EndedAt', 'CreateDate', 'Status', 'SessionState', 'Active', 'EMailNotificationAdresses',
        'EnforceSessionEndDateTime', 'ManagedByUserID', 'EmailNotificationIncludeResults', "PluginData"
    ];

    // process information
    this.OnError = {};
    this.OnSucces = {};

    this.generatedReports = new ITSCandidateSessionGeneratedReports(this, ITSSession); // the list of generated reports for this session
};

ITSCandidateSession.prototype.createReportOverviewInZipStart = function (zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers) {
    this.couponsFile = [];
    this.resultsFile = {};
}

ITSCandidateSession.prototype.createReportOverviewInZip = function (zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers) {
    if (includeReports) {
        // make sure all needed reports and possible changed reports are loaded first
        if (!ITSInstance.reports.listLoaded) {
            ITSInstance.reports.loadAvailableReportsList(function () {
                this.createReportOverviewInZip(zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers);
            }.bind(this, zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers));
            return;
        }

        // loop through all reports that are applicable for this session and load them
        var testLists = [];
        for (var i = 0; i < this.SessionTests.length; i++) {
            ct = this.SessionTests[i];
            testLists.push(ct.testDefinition.ID);
        }
        var reportsList = ITSInstance.reports.findReportsForTests(testLists);
        for (var i = 0; i < reportsList.length; i++) {
            if (!reportsList[i].detailsLoaded) {
                reportsList[i].loadDetailDefinition(function () {
                    this.createReportOverviewInZip(zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers);
                }.bind(this, zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers));
                return;
            }
        }

        // check if the generatedReports for this session is loaded
        if (!this.generatedReports.listLoaded) {
            this.generatedReports.loadGeneratedReportsForSession(function () {
                this.createReportOverviewInZip(zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers);
            }.bind(this, zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers));
            return;
        }
        for (var i = 0; i < this.generatedReports.reportCount(); i++) {
            if (!this.generatedReports.generatedReports[i].detailsLoaded) {
                this.generatedReports.generatedReports[i].loadDetail(function () {
                    this.createReportOverviewInZip(zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers);
                }.bind(this, zip, prefixForPath, callWhenDone, callOnError, includeReports, includeAnswers));
                return;
            }
        }
    }

    var openingTag = '<html><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">';
    openingTag += '<link href="fontawesome/css/all.css" rel="stylesheet">';
    openingTag += '<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css">';
    openingTag += '<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" type="text/css">';
    openingTag += '<link href="https://fonts.googleapis.com/css?family=Alegreya+Sans" rel="stylesheet" type="text/css">';
    openingTag += '<link href="https://fonts.googleapis.com/css?family=Indie+Flower" rel="stylesheet" type="text/css">';
    openingTag += '<body><script src="https://use.fontawesome.com/releases/v5.12.1/js/all.js" data-auto-replace-svg="nest"></script>';
    openingTag += '<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>\n' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>\n' +
        '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>';
    var closingTag = '</body></html>';

    // add the score overview
    ITSInstance.editSessionController.generateTestsList(true, this);
    var fileName = ITSInstance.translator.getTranslatedString("ITSCandidateSession", "ScoreOverview", "Score overview");
    var folderName = prefixForPath == "" ? "" : prefixForPath + "/" ;
    zip.file( folderName + fileName + ".html", openingTag + $('#AdminInterfaceEditSessionEditTestsList')[0].outerHTML + closingTag);
    ITSInstance.editSessionController.generateTestsList(false, this);

    var fileNameAnswers, fileNameScores;
    // add the tests to the results file
    for (var found = 0; found < this.SessionTests.length; found++) {
        if (typeof this.resultsFile == "undefined") this.resultsFile = {};
        if (typeof this.resultsFile[prefixForPath] == "undefined") this.resultsFile[prefixForPath] = {};
        fileNameAnswers = this.SessionTests[found].testDefinition.TestName + ".answers";
        if (typeof this.resultsFile[prefixForPath][fileNameAnswers] == "undefined") {
            this.resultsFile[prefixForPath][fileNameAnswers] = {};
        } else {
            fileNameAnswers = this.SessionTests[found].testDefinition.TestName + ".answers." + found;
            this.resultsFile[prefixForPath][fileNameAnswers] = {};
        }
        fileNameScores = this.SessionTests[found].testDefinition.TestName + ".scores";
        if (typeof this.resultsFile[prefixForPath][fileNameScores] == "undefined") {
            this.resultsFile[prefixForPath][fileNameScores] = {};
        } else {
            fileNameScores = this.SessionTests[found].testDefinition.TestName + ".scores." + found;
            this.resultsFile[prefixForPath][fileNameScores] = {};
        }

        this.resultsFile[prefixForPath][fileNameAnswers] = this.SessionTests[found].Results;
        this.resultsFile[prefixForPath][fileNameScores] = this.SessionTests[found].Scores;
    }
    // add the coupons to the coupons file
    if (typeof this.couponsFile == "undefined") this.couponsFile = [];
    try {
        if (this.PluginData.CandidateParameters.Coupon != "") this.couponsFile.push(this.PluginData.CandidateParameters.Coupon);
    } catch(err) {};

    // add the response overview
    if (includeAnswers) {
        var genNumber = "" + getNewSimpleGeneratorNumber('SessionViewAnswersInterfaceEdit_gen', 9999)
        for (var found = 0; found < this.SessionTests.length; found++) {
            $("#SessionViewAnswersInterfaceEditTestAnswers").empty();
            try {
                folderName = prefixForPath == "" ? "" : prefixForPath + "/";
                folderName = folderName + this.SessionTests[found].testDefinition.Description + "/";
            } catch (err) { /* do nothing */
            }
            fileName = ITSInstance.translator.getTranslatedString("ITSCandidateSession", "AnswerOverview", "Answers overview");
            this.SessionTests[found].testDefinition.generateQuestionOverview("SessionViewAnswersInterfaceEditTestAnswers",
                this.SessionTests[found].Results, true, "_" + genNumber,
                this, this.SessionTests[found], this.Person);
            zip.file(folderName + fileName + ".html", openingTag + $('#SessionViewAnswersInterfaceEditTestAnswers')[0].outerHTML + closingTag);
        }
    }

    // generate and add the reports per test
    if (includeReports) {
        var folderName = "";
        for (var i = 0; i < reportsList.length; i++) {
            folderName = "";
            if (reportsList[i].TestID != "") {
                // locate the test and use that as folder name
                try {
                    folderName = prefixForPath == "" ? "" : prefixForPath + "/";
                    folderName = folderName + ITSInstance.tests.testList[ITSInstance.tests.findTestById(ITSInstance.tests.testList, reportsList[i].TestID)].Description + "/";
                } catch (err) { /* do nothing */
                }
                // find the test for this report
                var reportFound = undefined;
                for (var tc = 0; tc < this.SessionTests.length; tc++) {
                    if (this.SessionTests[tc].TestID == reportsList[i].TestID) {
                        reportFound = this.generatedReports.findFirst(reportsList[i].ID);
                        if (typeof reportFound == "undefined") {
                            zip.file(folderName + reportsList[i].Description + ".html", openingTag + reportsList[i].generateTestReport(this, this.SessionTests[tc], false) + closingTag);
                        } else {
                            var org = ITSInstance.translator.getTranslatedString("ITSCandidateSession", "Original", "original");

                            zip.file(folderName + reportsList[i].Description + ".html", openingTag + reportFound.ReportText + closingTag);
                            zip.file(folderName + reportsList[i].Description + "." + org + ".html", openingTag + reportsList[i].generateTestReport(this, this.SessionTests[tc], false) + closingTag);
                        }
                    }
                }
            }
        }
        // to do for the future, generate session reports on multiple tests here
    }

    if (typeof callWhenDone != "undefined") { callWhenDone(this, zip); }
};

ITSCandidateSession.prototype.regenerateCandidate = function () {
    this.Person = this.ITSSession.candidates.newCandidate(this.myParent, this.ITSSession);
    this.PersonID = this.Person.ID;
};

ITSCandidateSession.prototype.postLoad = function () {
    this.parseDates();
};

ITSCandidateSession.prototype.parseDates = function () {
    var momentDate = 0;
    if ($.type(this.AllowedStartDateTime) === "string") {
        this.AllowedStartDateTime = convertISOtoDate(this.AllowedStartDateTime );
    }
    if ($.type(this.AllowedEndDateTime) === "string") {
        this.AllowedEndDateTime = convertISOtoDate(this.AllowedEndDateTime );
    }
    if ($.type(this.StartedAt) === "string") {
        this.StartedAt = convertISOtoDate(this.StartedAt );
    }
    if ($.type(this.EndedAt) === "string") {
        this.EndedAt = convertISOtoDate(this.EndedAt );
    }
};

ITSCandidateSession.prototype.findTestById = function (id) {
    var foundIndex = -1;
    for (var i=0; i < this.SessionTests.length; i ++) {
        if (this.SessionTests[i].TestID == id) {
            foundIndex = i;
            break;
        }
    }
    return foundIndex;
};

ITSCandidateSession.prototype.sessionTestById = function (id) {
    var foundIndex = -1;
    for (var i=0; i < this.SessionTests.length; i ++) {
        if (this.SessionTests[i].TestID == id) {
            return this.SessionTests[i];
        }
    }
    return undefined;
};

ITSCandidateSession.prototype.sessionTest = function (testName) {
    var foundIndex = -1;
    for (var i=0; i < this.SessionTests.length; i ++) {
        if (this.SessionTests[i].testDefinition.TestName == testName) {
            return this.SessionTests[i];
        }
    }
    return undefined;
};

ITSCandidateSession.prototype.relinkToCurrentPersonID= function () {
    for (var i=0; i < this.SessionTests.length; i ++) {
        this.SessionTests[i].PersID = this.Person.ID;
    }
    this.PersonID = this.Person.ID;
};

ITSCandidateSession.prototype.deleteSession = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('sessions/' + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("Session.Delete", this);
};

ITSCandidateSession.prototype.deleteGroupSessionQuick = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('sessions/group/' + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("SessionGroup.Delete", this);
};

ITSCandidateSession.prototype.archiveGroupSessionQuick = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxUpdate('sessions/group/' + this.ID + '/archive', {}, OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("SessionGroup.Archived", this);
    this.Active = false;
};

ITSCandidateSession.prototype.unarchiveGroupSessionQuick = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxUpdate('sessions/group/' + this.ID + '/unarchive', {}, OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("SessionGroup.Unarchived", this);
    this.Active = true;
};

ITSCandidateSession.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newSession = false;

    ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    this.ITSSession.MessageBus.publishMessage("Session.Update", this);
};

ITSCandidateSession.prototype.saveToServerIncludingTests = function (OnSuccess, OnError, deleteAllUnstartedTests) {
    if (deleteAllUnstartedTests) {
        ITSInstance.genericAjaxDelete('sessions/' + this.ID + "/deletealltests",
             this.saveToServerIncludingTests.bind(this,OnSuccess,OnError), OnError );
    } else {
        this.lastSavedJSON = ITSJSONStringify(this);
        this.newSession = false;
        ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, function () {
                for (var i = 0; i < this.SessionTests.length; i++) {
                    this.SessionTests[i].saveToServer(function () {
                    }, function () {
                    });
                }
                if (OnSuccess) OnSuccess();
            }.bind(this, OnSuccess)
            , OnError, false, true);
        this.ITSSession.MessageBus.publishMessage("Session.Update", this);
    }
};

ITSCandidateSession.prototype.saveToServerIncludingTestsAndPerson = function (OnSuccess, OnError, deleteAllUnstartedTests) {
    if (deleteAllUnstartedTests) {
        ITSInstance.genericAjaxDelete('sessions/' + this.ID + "/deletealltests",
            this.saveToServerIncludingTestsAndPerson.bind(this,OnSuccess,OnError), OnError );
    } else {
        this.lastSavedJSON = ITSJSONStringify(this);
        this.newSession = false;
        ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, function () {
                for (var i = 0; i < this.SessionTests.length; i++) {
                    this.SessionTests[i].saveToServer(function () {
                    }, function () {
                    });
                }

                this.Person.saveToServer(
                    function () {
                        if (OnSuccess) { OnSuccess(); }
                }.bind(this, OnSuccess),
                    function () {
                });

                //if (OnSuccess) OnSuccess();
            }.bind(this, OnSuccess)
            , OnError, false, true);
        this.ITSSession.MessageBus.publishMessage("Session.Update", this);
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServer = function (OnSuccess, OnError, progressElement) {
    // saves all group sessions to server
    this.saveGroupSessionsToServerOnSuccess = OnSuccess;
    this.saveGroupSessionsToServerOnError = OnError;
    this.currentGroupMembers = [];
    this.progressElement = "";
    if (progressElement) {
        this.progressElement = progressElement;
        $('#'+this.progressElement).show();
        this.progressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.currentGroupMembers, this.saveGroupSessionsToServerStageCompare.bind(this), OnError);
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCompareLoad = function (sessionid,  i) {
    var tempSession = new ITSCandidateSession(this, this.ITSSession);
    tempSession.loadSession(sessionid, this.saveGroupSessionsToServerStageCheckSession.bind(this, tempSession, i),
        this.saveGroupSessionsToServerStageCheckSession.bind(this, tempSession, i));
};

ITSCandidateSession.prototype.saveGroupSessionToServerCreateNew = function (GroupMembersIndex) {
    var newSession = new ITSCandidateSession(this, this.ITSSession);
    newSession.Person.EMail = this.PluginData.GroupMembers[GroupMembersIndex].EMail;
    newSession.Person.ID = this.PluginData.GroupMembers[GroupMembersIndex].ID;
    newSession.Person.Active = true;
    newSession.GroupSessionID = this.ID;
    newSession.Description = this.Description;
    newSession.AllowedStartDateTime = this.AllowedStartDateTime;
    newSession.AllowedEndDateTime = this.AllowedEndDateTime;
    newSession.EnforceSessionEndDateTime = this.EnforceSessionEndDateTime;
    newSession.EmailNotificationIncludeResults = this.EmailNotificationIncludeResults;
    newSession.EMailNotificationAdresses = this.EMailNotificationAdresses;
    newSession.PersonID = newSession.Person.ID;
    for (var st=0; st < this.SessionTests.length; st++) {
        var tempTestSession = new ITSCandidateSessionTest(this, this.ITSSession);
        tempTestSession.OldID = tempTestSession.ID;
        newSession.SessionTests.push(tempTestSession);
        shallowCopy(this.SessionTests[st], tempTestSession);
        tempTestSession.ID = tempTestSession.OldID;
        tempTestSession.PersID = newSession.Person.ID;
        tempTestSession.SessionID = newSession.ID;
    }
    newSession.saveToServerIncludingTestsAndPerson(this.saveGroupSessionsToServerStageUpdateOK.bind(this),
        this.saveGroupSessionsToServerStageUpdateError.bind(this));
};

ITSCandidateSession.prototype.saveGroupSessionsToServerUpdateCounter = function (progressElementCounter) {
    if ((this.progressElement != "") && (progressElementCounter)) {
        $('#'+this.progressElement)[0].innerHTML = progressElementCounter + '/'+ this.PluginData.GroupMembers.length;
        $('#'+this.progressElement).attr('aria-valuenow' , Math.round(progressElementCounter / this.PluginData.GroupMembers.length) * 100 );
        if (progressElementCounter >= this.PluginData.GroupMembers.length) {
            $('#'+this.progressElement).hide();
        }
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCompare = function () {
    // this.currentGroupMembers this.PluginData.GroupMembers
    this.saveGroupSessionsToServerUpdateCounter();
    this.saveGroupSessionsCount = 0;
    for (var i=0; i < this.PluginData.GroupMembers.length; i++) {
        var sessionIndex = InArray(this.currentGroupMembers, "ID", this.PluginData.GroupMembers[i].ID, "==");
        if ( sessionIndex > -1 ) {
            // update
            // first load the session so we can validate it

            this.saveGroupSessionsToServerStageCompareLoad(this.currentGroupMembers[sessionIndex].sessionid,  i);
        } else {
            // create
            this.saveGroupSessionToServerCreateNew(i);
        }
    }
    // now check for deletions
    for (var i=0; i < this.currentGroupMembers.length; i++) {
        if ( InArray(this.PluginData.GroupMembers, "ID", this.currentGroupMembers[i].ID, "==") > -1) {
            // it exists and will already be in the update process
        } else {
            // delete. Deletes will be fired and we will not wait for them. but we can ONLY delete when the session is not in progress!
            if (this.currentGroupMembers[i].sessionstatus <= 10) {
                ITSInstance.genericAjaxDelete('sessions/' + this.currentGroupMembers[i].sessionid, function () {
                }, function () {
                }, false, true);
            }
        }
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCheckSession = function (tempSession, groupMemberIndex) {
    tempSession.Person.EMail = this.PluginData.GroupMembers[groupMemberIndex].EMail;
    tempSession.Person.ID = this.PluginData.GroupMembers[groupMemberIndex].ID;
    tempSession.Person.Active = true;

    // delete all unstarted tests
    var counter = tempSession.SessionTests.length;
    for (var st = counter -1; st>=0; st--) {
        if (!tempSession.SessionTests[st] || !tempSession.SessionTests[st].Status) {
            ITSLogger.logMessage(logLevel.ERROR,"tempSession.SessionTests[st].Status does not exist");
        } else {
            if (tempSession.SessionTests[st].Status <= 10) {
                tempSession.SessionTests.splice(st,1);
            }
        }
    }

    // update
    for (var st = tempSession.SessionTests.length -1; st >= 0; st--) {
        // check if the session is not in tempSession yet
        var index = InArray( this.SessionTests , "TestID", tempSession.SessionTests[st].TestID, "==" );
        if ( index > -1  ) {
            if (tempSession.SessionTests[st].Status <= 10) {
                tempSession.SessionTests[st].oldID = tempSession.SessionTests[st].ID;
                tempSession.SessionTests[st].oldSessionID = tempSession.SessionTests[st].SessionID;
                tempSession.SessionTests[st].oldPersonID = tempSession.SessionTests[st].PersID;
                shallowCopy( this.SessionTests[index] , tempSession.SessionTests[st]);
                tempSession.SessionTests[st].SessionID = tempSession.SessionTests[st].oldSessionID;
                tempSession.SessionTests[st].PersID = tempSession.SessionTests[st].oldPersonID;
                tempSession.SessionTests[st].ID = tempSession.SessionTests[st].oldID;
            }
        }
    }
    tempSession.GroupSessionID = this.ID;
    tempSession.Description = this.Description;
    tempSession.AllowedStartDateTime = this.AllowedStartDateTime;
    tempSession.AllowedEndDateTime = this.AllowedEndDateTime;
    tempSession.EnforceSessionEndDateTime = this.EnforceSessionEndDateTime;
    tempSession.EmailNotificationIncludeResults = this.EmailNotificationIncludeResults;
    tempSession.EMailNotificationAdresses = this.EMailNotificationAdresses;

    // add
    for (var st=this.SessionTests.length-1; st >=0; st--) {
        // check if the session is not in tempSession yet
        if (InArray( tempSession.SessionTests , "TestID", this.SessionTests[st].TestID, "==" ) == -1) {
            var tempTestSession = new ITSCandidateSessionTest(this, this.ITSSession);
            tempTestSession.oldID = tempTestSession.ID;
            shallowCopy(this.SessionTests[st], tempTestSession);
            tempTestSession.SessionID = tempSession.ID;
            tempTestSession.PersID = tempSession.PersonID;
            tempTestSession.ID = tempTestSession.oldID;
            tempSession.SessionTests.push(tempTestSession);

            // if session is already done then switch it back to in progress
            if (tempSession.Status >= 30) { tempSession.Status = 20; }
        }
    }

    tempSession.saveToServerIncludingTestsAndPerson(this.saveGroupSessionsToServerStageUpdateOK.bind(this),
        this.saveGroupSessionsToServerStageUpdateError.bind(this), true);
    this.progressElementCounter++;
    this.saveGroupSessionsToServerUpdateCounter(this.progressElementCounter);
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageUpdateOK = function () {
    this.saveGroupSessionsCount ++;
    if (this.saveGroupSessionsCount >= this.PluginData.GroupMembers.length) {
        this.saveGroupSessionsToServerOnSuccess();
    } else {
        this.saveGroupSessionsToServerUpdateCounter(this.saveGroupSessionsCount);
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageUpdateError = function () {
    this.saveGroupSessionsToServerOnError();
};

ITSCandidateSession.prototype.loadSession = function (sessionID, OnSuccess, OnError, excludeDoneTests, InTestTaking) {
    if (OnError) this.OnError = OnError;
    if (OnSuccess) this.OnSucces = OnSuccess;
    this.InTestTaking = InTestTaking;
    // load the session
    if (excludeDoneTests) {
        ITSInstance.JSONAjaxLoader('sessions/' + sessionID, this, function () {
            // load the tests in the session
            if (this.InTestTaking) {
                ITSInstance.JSONAjaxLoader('sessionteststaking/' + this.ID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
            } else {
                ITSInstance.JSONAjaxLoader('sessiontests/' + this.ID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
            }
        }.bind(this), this.sessionLoadingFailed.bind(this), 'ITSObject', 0, 99999, "", "N", "N", "Y", "Status=10, Status=20");
    } else {
        ITSInstance.JSONAjaxLoader('sessions/' + sessionID, this, function () {
            // load the tests in the session
            if (this.InTestTaking) {
                ITSInstance.JSONAjaxLoader('sessionteststaking/' + this.ID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
            } else {
                ITSInstance.JSONAjaxLoader('sessiontests/' + this.ID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
            }
        }.bind(this), this.sessionLoadingFailed.bind(this), 'ITSObject');
    }
};

ITSCandidateSession.prototype.deleteFromServer = function (OnSuccess, OnError) {
    this.ITSSession.genericAjaxDelete('sessions/'  + this.ID , OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("Session.Delete", this);
};

ITSCandidateSession.prototype.sessionLoaded = function () {
    // now load all the tests in this session
    ITSLogger.logMessage(logLevel.INFO, "Loaded session %%ID%%", this);
    for (var i=0; i < this.SessionTests.length; i++ ) {
        this.SessionTests[i].myParent = this;
        this.SessionTests[i].SessionID = this.ID;
        this.SessionTests[i].ITSSession = this.ITSSession;

        this.SessionTests[i].loadDetails(this.testLoadedFine.bind(this,i), this.sessionLoadingFailed.bind(this), this.InTestTaking);
    }
    // load the candidate information
    if (this.SessionType != 100) {
        this.personRequired = true;
        ITSInstance.JSONAjaxLoader('persons/' + this.PersonID, this.Person, this.testLoadedFine.bind(this), this.sessionLoadingFailed.bind(this));
    }
};

ITSCandidateSession.prototype.testLoadedFine = function (testIndex) {
    var allOK = false;
    if (typeof testIndex == "undefined") testIndex = -1;
    if (this.SessionTests.length > testIndex) {
        for (var j=0; j < this.SessionTests.length; j++) {
            allOK = false;
            try {
                allOK = (this.SessionTests[j].testDefinition.detailsLoaded && this.SessionTests[j].testDefinition.screenTemplatesLoaded() && this.SessionTests[j].detailsLoaded);
            } catch (err) {};
            if (! allOK) {
                break;
            }
        }
        if (this.personRequired && allOK) {
            allOK = this.PersonID == this.Person.ID;
        }
        if (allOK) {
            // order tests in sequence
            this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
        }

    }

    if (allOK && typeof this.OnSucces != "undefined") {
        //console.log("= OK");
        setTimeout(this.OnSucces,1);
        this.OnSucces = undefined;
    } else {
        //console.log("= NOT OK " + allOK);
    }
};

ITSCandidateSession.prototype.resequence = function (preventSort) {
    // order tests in sequence
    if (!preventSort) this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
    // resequence
    for (var i=0; i < this.SessionTests.length; i++) {
        this.SessionTests[i].Sequence = i;
    }
};

ITSCandidateSession.prototype.firstTestToTake = function (excludeTestID) {
    var indexFound = -1;
    // sort the list on sequence
    this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
    var checkDate = new Date();
    this.parseDates();
    if ((this.AllowedEndDateTime > checkDate) && (this.AllowedStartDateTime <= checkDate)) {
        for (var i = 0; i < this.SessionTests.length; i++) {
            if (this.SessionTests[i].HowTheTestIsTaken == 10 && this.SessionTests[i].Status < 30) {
                if (!excludeTestID) {
                    indexFound = i;
                    break;
                } else {
                    if (this.SessionTests[i].ID != excludeTestID) {
                        indexFound = i;
                        break;
                    }
                }

            }
        }
    } else {
        if (checkDate < this.AllowedStartDateTime) {
            indexFound = -2;
        }
    }
    return indexFound;
};

ITSCandidateSession.prototype.sessionLoadingFailed = function () {
    // something went wrong
    if (this.OnError) this.OnError();
};

ITSCandidateSession.prototype.newCandidateSessionTest = function (testToAdd) {
    var tempST = new ITSCandidateSessionTest(this, this.ITSSession);

    this.SessionTests.push(tempST);
    tempST.testDefinition = testToAdd;
    tempST.TestID = testToAdd.ID;

    return tempST;
};

ITSCandidateSession.prototype.loadRelatedGroupMembers = function (OnSuccess, OnError) {
    this.PluginData.GroupMembers = [];
    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.PluginData.GroupMembers, OnSuccess, OnError);
};

ITSCandidateSession.prototype.deleteGroupSessionsOnServer = function (OnSuccess, OnError, progressElement, excludeStartedSessions) {
    // saves all group sessions to server
    this.todeleteGroupSessionsToServerOnSuccess = OnSuccess;
    this.todeleteGroupSessionsToServerOnError = OnError;
    this.todeleteGroupMembers = [];
    this.todeleteProgressElement = "";
    this.todeleteExcludeStarted = excludeStartedSessions;
    this.todeleteErrorCount = 0;
    if (progressElement) {
        this.todeleteProgressElement = progressElement;
        $('#'+this.todeleteProgressElement).show();
        this.todeleteProgressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.todeleteGroupMembers, this.deleteGroupSessionsOnServerProceed.bind(this), OnError);
};

ITSCandidateSession.prototype.deleteGroupSessionsOnServerProceed = function () {
    this.todeleteGroupSessionsCount = 0;
    var proceed = true;
    for (var i=0; i < this.todeleteGroupMembers.length; i++) {
        // now delete this session
        proceed = true;
        this.todeleteGroupSessionsCount ++;
        this.todeleteGroupSessionsToServerUpdateCounter();
        if (this.todeleteExcludeStarted) { proceed = this.todeleteGroupMembers[i].sessionstatus == 10; }
        if (proceed) {
            ITSInstance.genericAjaxDelete('sessions/' + this.todeleteGroupMembers[i].sessionid ,
                function () {},
                function () { this.todeleteErrorCount ++; this.todeleteGroupSessionsToServerOnError(); }.bind(this), false, true);
            this.ITSSession.MessageBus.publishMessage("Session.Delete.RelatedGroupSession", this.todeleteGroupMembers[i]);
        }
    }
    if (this.todeleteErrorCount == 0) {
        this.todeleteGroupSessionsToServerOnSuccess();
    }
};

ITSCandidateSession.prototype.todeleteGroupSessionsToServerUpdateCounter = function () {
    if (this.todeleteProgressElementCounter != "") {
        $('#'+this.todeleteProgressElement)[0].innerHTML = this.todeleteProgressElementCounter + '/'+ this.todeleteGroupMembers.length;
        $('#'+this.todeleteProgressElement).attr('aria-valuenow' , Math.round(this.todeleteProgressElementCounter / this.todeleteGroupMembers.length) * 100 );
        if (this.todeleteProgressElementCounter >=  this.todeleteGroupMembers.length) {
            $('#'+this.todeleteProgressElement).hide();
        }
    }
};

ITSCandidateSession.prototype.archiveGroupSessionsOnServer = function (OnSuccess, OnError, progressElement, excludeStartedSessions, newArchiveStatus) {
    // saves all group sessions to server
    this.toarchiveGroupSessionsToServerOnSuccess = OnSuccess;
    this.toarchiveGroupSessionsToServerOnError = OnError;
    this.toarchiveGroupMembers = [];
    this.toarchiveProgressElement = "";
    this.toarchiveExcludeStarted = excludeStartedSessions;
    this.toarchiveStatus = newArchiveStatus;
    this.toarchiveErrorCount = 0;
    if (progressElement) {
        this.toarchiveProgressElement = progressElement;
        $('#'+this.toarchiveProgressElement).show();
        this.toarchiveProgressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.toarchiveGroupMembers, this.archiveGroupSessionsOnServerProceed.bind(this), OnError);
};

ITSCandidateSession.prototype.archiveGroupSessionsOnServerProceed = function () {
    this.toarchiveGroupSessionsCount = 0;
    var proceed = true;
    for (var i=0; i < this.toarchiveGroupMembers.length; i++) {
        // now delete this session
        proceed = true;

        if (this.toarchiveExcludeStarted) { proceed = this.toarchiveGroupMembers[i].sessionstatus == 10; }
        if (proceed) {
            this.toarchiveGroupMembers[i].session = new ITSCandidateSession(this, this.ITSSession);
            ITSInstance.JSONAjaxLoader('sessions/' + this.toarchiveGroupMembers[i].sessionid , this.toarchiveGroupMembers[i].session,
                function (i) {
                              this.toarchiveGroupSessionsToServerUpdateCounter();
                              this.toarchiveGroupSessionsCount ++;
                              if (this.toarchiveGroupMembers[i].session.Active != this.toarchiveStatus) {
                                  this.toarchiveGroupMembers[i].session.Active = this.toarchiveStatus;
                                  this.toarchiveGroupMembers[i].session.saveToServer( function () {}, this.toarchiveGroupSessionsToServerOnError );
                              }
                            }.bind(this,i),
                function () { this.toarchiveErrorCount ++; this.toarchiveGroupSessionsToServerOnError(); } , false, true);
            this.ITSSession.MessageBus.publishMessage("Session.Delete.RelatedGroupSession", this.toarchiveGroupMembers[i]);
        }
    }
    if (this.toarchiveErrorCount == 0) {
        this.toarchiveGroupSessionsToServerOnSuccess();
    }
};

ITSCandidateSession.prototype.toarchiveGroupSessionsToServerUpdateCounter = function () {
    if (this.toarchiveProgressElementCounter != "") {
        $('#'+this.toarchiveProgressElement)[0].innerHTML = this.toarchiveProgressElementCounter + '/'+ this.toarchiveGroupMembers.length;
        $('#'+this.toarchiveProgressElement).attr('aria-valuenow' , Math.round(this.toarchiveProgressElementCounter / this.toarchiveGroupMembers.length) * 100 );
        if (this.toarchiveProgressElementCounter >=  this.toarchiveGroupMembers.length) {
            $('#'+this.toarchiveProgressElement).hide();
        }
    }
};

ITSCandidateSession.prototype.loadAuditTrail = function (loadSuccess, loadError) {
    this.AuditTrail = [];
    ITSInstance.JSONAjaxLoader('audittrail/session/' + this.ID , this.AuditTrail, loadSuccess, loadError, "ITSObject", 0, 99999, "CreateDate");
};

// the test definition belonging to the sessions
 ITSCandidateSessionTest = function (parent, ITSSession) {
     this.myParent = parent;
     this.ITSSession = ITSSession;
     this.SessionID = parent.ID;
     this.ID = newGuid();
     this.TestID = "00000000-0000-0000-0000-000000000000"; // the ID of the test
     this.PersID = parent.PersonID; // in case of a person session this is always the candidate. In case of a 360 degrees session this is the id of the person that has to fill in the test
     this.Sequence = 0; // sequence of the test and how it is presented to the candidate
     this.TestLanguage = ""; // the language of the test (in principal test definitions can contain multiple translations)
     this.NormID1 = "00000000-0000-0000-0000-000000000000";
     this.NormID2 = "00000000-0000-0000-0000-000000000000";
     this.NormID3 = "00000000-0000-0000-0000-000000000000";
     this.TestStart = new Date(2000,1,1);
     this.TestEnd = new Date(2000,1,1);
     this.HowTheTestIsTaken = 10; // 10= FullyAutomated, 20=on paper
     this.PercentageOfQuestionsAnswered = 0;
     this.TotalTestTime = 0;
     this.Status = 10; //10 ready, 20 in progress, 30 done
     this.CurrentPage = 0;
     this.TotalPages = 0;
     this.PluginData = {};
     this.Scores = {}; // in fact these are always scale scores of the test. Make sure the object is empty and not derived from the object prototype which can spoil the contents
     this.Results = {}; // these are always screen values (and sometimes a bit more), meaning the full test state
     this.Scores.persistentProperties = "*ALL*";
     this.Scores.testResultAddition = ""; // an addition to the test result status, for example "timer ended". This can be set from a custom script if desired
     this.Results.persistentProperties = "*ALL*";
     this.Results.testTimeLeft = "";
     this.PluginData.persistentProperties = "*ALL*";

     this.testDefinition = {}; // a link to the test definition this candidate session test object is based on
     this.candidate = {} ; // a link to the candidate this session is primarily for

     this.newSessionTest = true;

     this.persistentProperties = [
         "ID",
         "SessionID",
         "TestID",
         "PersID",
         "Sequence",
         "NormID1",
         "NormID2",
         "NormID3",
         "TestStart",
         "TestEnd",
         "HowTheTestIsTaken",
         "PercentageOfQuestionsAnswered",
         "TotalTestTime",
         "Status",
         "CurrentPage",
         "TotalPages",
         "PluginData",
         "Results",
         "Scores",
         "TestLanguage"
     ];

     // process information
    this.detailsLoaded = false;
 };

ITSCandidateSessionTest.prototype.postLoad = function () {
    this.parseDates();
};

ITSCandidateSessionTest.prototype.parseDates = function () {
    var momentDate = 0;
    if ($.type(this.TestStart) === "string") {
        momentDate = moment(this.TestStart, moment.ISO_8601);
        this.TestStart = momentDate.toDate();
    }
    if ($.type(this.TestEnd) === "string") {
        momentDate = moment(this.TestEnd, moment.ISO_8601);
        this.TestEnd = momentDate.toDate();
    }
};

ITSCandidateSessionTest.prototype.updateConsentSettings = function () {
    if (!this.PluginData.DataGathering) {
        this.PluginData.DataGathering = {};
        this.PluginData.DataGathering._objectType = "ITSObject";
        this.PluginData.DataGathering.persistentProperties = "*ALL*";
        this.PluginData.DataGathering.Allowed = true; // set to false to prevent posting of this sessions data to the anonimised data store
        this.PluginData.DataGathering.Location = {};
    }
} ;

ITSCandidateSessionTest.prototype.saveToServer = function (OnSuccess, OnError, InTestTaking) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newSessionTest = false;

    if (InTestTaking) {
        this.ITSSession.genericAjaxUpdate('sessionteststaking/' + this.SessionID + "/" + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    else {
        this.ITSSession.genericAjaxUpdate('sessiontests/'  + this.SessionID + "/" + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    this.ITSSession.MessageBus.publishMessage("SessionTest.Update", this);
};

ITSCandidateSessionTest.prototype.deleteFromServer = function (OnSuccess, OnError) {
    this.ITSSession.genericAjaxDelete('sessiontests/'  + this.SessionID + "/" + this.ID, OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("SessionTest.Delete", this);
};

ITSCandidateSessionTest.prototype.loadDetails = function (OnSucces, OnError, InTestTaking) {
    if (!this.detailsLoaded) {
        this.detailsLoadedSucces = OnSucces;
        this.detailsLoadedError = OnError;
        this.InTestTaking = InTestTaking;

        if (this.testDefinition.detailsLoaded) {
            this.loadDetailsAfterTestLoad();
        } else {
            // load test
            this.loadTest(this.loadDetailsAfterTestLoad.bind(this), this.detailsLoadedError.bind(this));
        }
    } else {
        OnSucces();
    }
};

ITSCandidateSessionTest.prototype.loadDetailsAfterTestLoad = function () {
    if (!this.loadDetailsSuccess) this.loadDetailsSuccess = function () {};
    if (!this.loadDetailsError) this.loadDetailsError = function () {};

    if (this.InTestTaking) {
        ITSInstance.JSONAjaxLoader('sessionteststaking/' + this.SessionID + "/" + this.ID, this, this.loadDetailsSuccess.bind(this), this.loadDetailsError.bind(this));
    } else {
        ITSInstance.JSONAjaxLoader('sessiontests/' + this.SessionID + "/" + this.ID, this, this.loadDetailsSuccess.bind(this), this.loadDetailsError.bind(this));
    }
};

ITSCandidateSessionTest.prototype.loadDetailsSuccess = function () {
    this.detailsLoaded = true;

    this.testDefinition.prepareResultsStorage(this.Results);
    this.testDefinition.prepareScalesStorage(this.Scores, false);

    if (this.detailsLoadedSucces) this.detailsLoadedSucces();
};
ITSCandidateSessionTest.prototype.loadDetailsError = function () {
    if (this.detailsLoadedError) this.detailsLoadedError();
};

ITSCandidateSessionTest.prototype.loadTest = function (OnSucces, OnError) {
    // load the test definition (including all screen definitions) from the server
    var testIndex = this.ITSSession.tests.findTestById(this.ITSSession.tests.testList, this.TestID);
    if (testIndex  < 0) {
        this.testDefinition = new ITSTest(this, this.ITSSession);
        this.testDefinition.ID = this.TestID;
        this.testDefinition.loadTestDetailDefinition(OnSucces.bind(this), OnError.bind(this));
    } else {
        this.testDefinition = this.ITSSession.tests.testList[testIndex];
        if (!this.testDefinition.detailsLoaded) {
            this.testDefinition.loadTestDetailDefinition(OnSucces.bind(this), OnError.bind(this));
        } else {
            if (OnSucces) OnSucces();
        }
    }
};

ITSCandidateSessionTest.prototype.calcTotalPages = function () {
   this.TotalPages = this.testDefinition.getTotalScreens();
};

ITSCandidateSessionTest.prototype.calculateScores = function (autoSave, autoNorm) {
    if (autoSave) {
        var lastSavedJSON = ITSJSONStringify(this);
    }
    this.testDefinition.scoreTest(this.myParent, this, this.myParent.Person, this.Results, this.Scores, ITSInstance);
    if (autoNorm) {
        var normIndex = this.testDefinition.findNormById(this.NormID1);
        if (normIndex >= 0) {
            this.normScores(normIndex);
        }
        var normIndex = this.testDefinition.findNormById(this.NormID2);
        if (normIndex >= 0) {
            this.normScores(normIndex,2);
        }
        var normIndex = this.testDefinition.findNormById(this.NormID3);
        if (normIndex >= 0) {
            this.normScores(normIndex,3);
        }
    }
    if (autoSave) {
        if (lastSavedJSON != ITSJSONStringify(this)) { this.saveToServer( function () {}, function () {}); }
    }
};

ITSCandidateSessionTest.prototype.normScores = function (normIndex, normPostFix) {
    this.testDefinition.norms[normIndex].normTest(this.myParent, this, this.myParent.Person, this.Results, this.Scores, ITSInstance, normPostFix);
};

ITSCandidateSessionTest.prototype.prepareTestStorage = function () {
    this.Scores = this.testDefinition.prepareScalesStorage(this.Scores);
    this.Results = this.testDefinition.prepareResultsStorage(this.Results);
};

ITSCandidateSessionTest.prototype.getScaleScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].Score ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.scale = function (scaleVarName) {
    var result = "";
    for (var i=0; i < this.testDefinition.scales.length; i++) {
        if (this.testDefinition.scales[i].scaleVarName == scaleVarName) return this.Scores["__" + this.testDefinition.scales[i].id];
    }
    return undefined;
};


ITSCandidateSessionTest.prototype.result = function (screenName) {
    var result = "";
    for (var i=0; i < this.testDefinition.screens.length; i++) {
        if (this.testDefinition.screens[i].varName == screenName) return this.Results["__" +this.testDefinition.screens[i].id];
    }
    return undefined;
};

ITSCandidateSessionTest.prototype.getMaxNormScore = function () {
    var norm = this.testDefinition.findNormById(this.NormID1);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getMaxNormScore2 = function () {
    var norm = this.testDefinition.findNormById(this.NormID2);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getMaxNormScore3 = function () {
    var norm = this.testDefinition.findNormById(this.NormID3);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getNormScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormScores2 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore2;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormScores3 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore3;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores2 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore2;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores3 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore3;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};



ITSCandidateSessions = function (session) {
    this.ITSSession = session;
};

ITSCandidateSessions.prototype.newCandidateSession = function () {
    return new ITSCandidateSession(this, this.ITSSession);
};

ITSCandidateSessions.prototype.newGroupSession = function () {
    var x = new ITSCandidateSession(this, this.ITSSession);
    x.SessionType = 100;
    x.PluginData.GroupMembers = []; // array of groupmembers
    return x;
};

ITSCandidateSessions.prototype.newPublicSession = function () {
    var x = new ITSCandidateSession(this, this.ITSSession);
    x.SessionType = 200;
    x.PluginData.CandidateParameters = {};
    x.Person.EMail = x.Person.ID;
    return x;
};

ITSCandidateSessionGeneratedReports = function (session, ITSSession) {
    this.myParent = session;
    this.ITSSession = ITSSession;

    this.listLoaded = false;
    this.generatedReports = [];
};

ITSCandidateSessionGeneratedReports.prototype.loadGeneratedReportsForSession = function(OnSucces, OnError, forceReload) {
    if (typeof forceReload != "undefined") { if (forceReload) this.listLoaded = false; }
    if (! this.listLoaded) {
        this.generatedReports = [];
        ITSInstance.JSONAjaxLoader('generatedreports/' + this.myParent.ID, this.generatedReports,
            function(OnSucces) {
              this.listLoaded = true; if (typeof OnSucces != "undefined") OnSucces();
            }.bind(this, OnSucces),
            OnError, 'ITSCandidateSessionGeneratedReport' );
    }
};

ITSCandidateSessionGeneratedReports.prototype.reportCount = function() {
    return this.generatedReports.length;
};

ITSCandidateSessionGeneratedReports.prototype.deleteAll = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('generatedreports/' + this.myParent.ID , OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("SessionGeneratedReport.DeleteAll", this);
};

ITSCandidateSessionGeneratedReports.prototype.deleteOne = function(reportID, SaveToAPI, OnSuccess, OnError) {
    // try to locate the report, delete the first report that matches the report id and then return
    var reportIndex = -1;
    for (var i=0; i < this.generatedReports.length; i++) {
        if (this.generatedReports[i].ReportID == reportID) {
            reportIndex = i;
            if (SaveToAPI) {
                this.generatedReports[i].delete(OnSuccess, OnError);
                this.generatedReports.splice(i, 1);
            }
            break;
        }
    }
    return reportIndex;
};

ITSCandidateSessionGeneratedReports.prototype.findFirst = function(reportID) {
    // try to locate the report, delete the first report that matches the report id and then return
    var reportFound = undefined;
    for (var i=0; i < this.generatedReports.length; i++) {
        if (this.generatedReports[i].ReportID == reportID) {
            reportFound = this.generatedReports[i];
            break;
        }
    }
    return reportFound;
};

ITSCandidateSessionGeneratedReports.prototype.newReport = function(reportID, title, contents){
    var newReport = new ITSCandidateSessionGeneratedReport(this.myParent, this.ITSSession);
    newReport.LinkedObjectID = this.myParent.ID;
    newReport.ReportID = reportID;
    newReport.ReportTitle = title;
    newReport.ReportText = contents;
    this.generatedReports.push(newReport);
};

ITSCandidateSessionGeneratedReport = function (session, ITSSession) {
    this.myParent = session;
    this.ITSSession = ITSSession;
    this.ID = newGuid();
    this.LinkedObjectID = session.ID;
    this.ReportID = newGuid();
    this.ReportText = "";
    this.ReportTitle = "";
    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";
    this.newGeneratedReport = true;

    this.detailsLoaded = false;

    this.persistentProperties = ['ID', 'LinkedObjectID', 'ReportID', 'ReportText', 'ReportTitle', 'PluginData'  ];
};

ITSCandidateSessionGeneratedReport.prototype.loadDetail = function(OnSuccess, OnError) {
    ITSInstance.JSONAjaxLoader('generatedreports/' + this.LinkedObjectID + "/" + this.ID, this,
        function (OnSuccess) {
            this.detailsLoaded = true;
            if (typeof OnSuccess != "undefined") OnSuccess(this.ReportText);
        }.bind(this, OnSuccess),
        OnError, 'ITSCandidateSessionGeneratedReport');
};

ITSCandidateSessionGeneratedReport.prototype.delete = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('generatedreports/' + this.LinkedObjectID + "/" + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("SessionGeneratedReport.Delete", this);
};

ITSCandidateSessionGeneratedReport.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newGeneratedReport = false;

    ITSInstance.genericAjaxUpdate('generatedreports/' + this.LinkedObjectID  + "/" + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    this.ITSSession.MessageBus.publishMessage("SessionGeneratedReport.Update", this);
};
