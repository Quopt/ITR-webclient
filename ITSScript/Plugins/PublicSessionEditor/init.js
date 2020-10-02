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

// define the new candidate editor object in the global memspace so that everybody can use it
function ITSPublicSessionEditor (session) {
    this.ITSSession = session;
    this.availableTestsAndBatteries = []; // tests and batteries available to the session selection
    this.currentSession = ITSInstance.candidateSessions.newPublicSession(); // the session we are changing with this object
    this.path = "PublicSession";
};

ITSPublicSessionEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('aa14e5d0-f241-42dd-a5c3-5b7f30926bfc', 'Manage public sessions', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Changes (and creates) the content of a public session');

ITSPublicSessionEditor.prototype.hide = function () {
    $('#AdminInterfacePublicSession').hide();
};

ITSPublicSessionEditor.prototype.show = function () {
    $('#AdminInterfacePublicSessionCandidateFor').tagsManager();
    if (getUrlParameterValue('SessionID')) {
        this.newSession = false;
        this.SessionID = getUrlParameterValue('SessionID');
    } else {
        // this is a new session because a session id is not given
        this.newSession = true;
        this.currentSession = ITSInstance.candidateSessions.newPublicSession();
        this.SessionID = this.currentSession.ID;

    }

    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#AdminInterfacePublicSession').show();
    ITSInstance.UIController.initNavBar();

    // load the session
     if (this.newSession) {
         this.sessionLoadingSucceeded();
     } else {
         this.currentSession = ITSInstance.candidateSessions.newPublicSession();
         this.currentSession.loadSession(this.SessionID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this));
         ITSInstance.UIController.showInterfaceAsWaitingOn();
     }
};

ITSPublicSessionEditor.prototype.sessionLoadingSucceeded = function () {
    // make sure to populate the test list ONLY with test in ready state.
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    DataBinderTo("AdminInterfacePublicSession", this.currentSession);
    this.repopulateTestsLists(true);
    this.loadTestAndBatteriesList();
    this.switchUIState();
    // make sure the person id is linked properly
    this.currentSession.Person.ID = this.currentSession.PersonID;

    // set the email notification to default
    if ($('#AdminInterfacePublicSessionMail').val() == "") {
        try {
            $('#AdminInterfacePublicSessionMail').val(ITSInstance.users.currentUser.PluginData.MailSettings.Notifications);
        } catch(err) {}
    }
    $('#AdminInterfacePublicSessionMailMe').prop('checked', ( $('#AdminInterfacePublicSessionMail').val().trim() != "") );
};

ITSPublicSessionEditor.prototype.switchUIState = function () {
    $('#AdminInterfacePublicSessionUnArchiveTest').hide();
    $('#AdminInterfacePublicSessionDeleteTest').hide();
    $('#AdminInterfacePublicSessionArchiveTest').hide();
    $('#AdminInterfacePublicSessionShowRelatedButton').hide();
    $('#AdminInterfacePublicSessionSaveButton').hide();
    $('#AdminInterfacePublicSessionsBusy').hide();
    if (this.currentSession.Active) {
        $('#AdminInterfacePublicSessionSaveButton').show();
        $('#AdminInterfacePublicSessionShowRelatedButton').show();
        $('#AdminInterfacePublicSessionArchiveTest').show();
        $('#AdminInterfacePublicSessionDeleteTest').show();
    } else {
        $('#AdminInterfacePublicSessionShowRelatedButton').show();
        $('#AdminInterfacePublicSessionUnArchiveTest').show();
        $('#AdminInterfacePublicSessionDeleteTest').show();
    }
};

ITSPublicSessionEditor.prototype.sessionLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSPublicSessionEditor.LoadSessionFailed", "The session could not be loaded at this moment.", '',
        'window.history.back();');
};

ITSPublicSessionEditor.prototype.afterOfficeLogin = function () {
    // make sure we get the tests and batteries loaded, dont care when it is ready
    ITSInstance.tests.loadAvailableTests(function () {
    }, function () {
    });
    ITSInstance.batteries.loadAvailableBatteries(function () {
    }, function () {
    });
};

ITSPublicSessionEditor.prototype.loadTestAndBatteriesList = function() {
    this.availableTestsAndBatteries.length = 0;

    $('#AdminInterfacePublicSessionTestsInputList').empty();
    newLI = "<option value=\"\">" + ITSInstance.translator.getTranslatedString('PublicSessionEditor','SelectATest','Select content to add to the session') + "</option>"
    $('#AdminInterfacePublicSessionTestsInputList').append(newLI);

    if (! ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) {
        ITSInstance.tests.testList.forEach(function callback(currentValue, index, array) {
            var includeTest = false;
            includeTest = currentValue.Active == true;
            if (!$('#AdminInterfacePublicSessionTestsIncludeOtherLanguages').is(':checked')) {
                includeTest = includeTest && (currentValue.supportsLanguage(ITSLanguage));
            }
            if (includeTest) {
                this.availableTestsAndBatteries.push({
                    "TestID": currentValue.ID,
                    "Description": currentValue.getTestFormatted()
                });
                newLI = "<option value=\"" + currentValue.ID + "\">" + currentValue.getTestFormatted() + "</option>"
                $('#AdminInterfacePublicSessionTestsInputList').append(newLI);
            }
        }, this);
    }
    ITSInstance.batteries.batteryList.forEach(function callback(currentValue, index, array) {
        if (currentValue.Active) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": ITSInstance.translator.getTranslatedString('PublicSessionEditor','BatteryText',"Battery : ") + currentValue.BatteryName
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + ITSInstance.translator.getTranslatedString('PublicSessionEditor','BatteryText',"Battery : ") + currentValue.BatteryName + "</option>"
            $('#AdminInterfacePublicSessionTestsInputList').append(newLI);
        }
    }, this);
    $('#AdminInterfacePublicSessionTestsInputList').combobox({ forceRenewal : true, onchange : "ITSInstance.PublicSessionController.TestOrBatterySelected(this.value); " } );
};

ITSPublicSessionEditor.prototype.TestOrBatterySelected = function (textFound) {
    var id = "";
    for (var i = 0; i < this.availableTestsAndBatteries.length; i++) {
        if (this.availableTestsAndBatteries[i].Description == textFound) {
            id = this.availableTestsAndBatteries[i].TestID;
            break;
        }
    }
    if (id == "") { return; }

    // and now add this test to the selected tests list
    var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, id);
    var batteryIndex = ITSInstance.batteries.findBatteryById(ITSInstance.batteries.batteryList, id);
    var existsIndex = this.currentSession.findTestById(id);
    if (testIndex > -1) { // new test found and not added yet
        var newCST = this.currentSession.newCandidateSessionTest(ITSInstance.tests.testList[testIndex]);
        if (!ITSInstance.tests.testList[testIndex].detailsLoaded) {
            ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(this.repopulateTestsLists.bind(this));
        }
        this.repopulateTestsLists();
    }
    if (batteryIndex > -1) { // battery found, add it
        ITSInstance.batteries.batteryList[batteryIndex].BatteryTests.forEach(  function (item) {
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, item.TestID);
            if (testIndex >= 0) {
                var newCST = this.currentSession.newCandidateSessionTest(ITSInstance.tests.testList[testIndex]);
                newCST.NormID1 = item.NormID1;
                newCST.NormID2 = item.NormID2;
                newCST.NormID3 = item.NormID3;
                if (!ITSInstance.tests.testList[testIndex].detailsLoaded) {
                    ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(this.repopulateTestsLists.bind(this));
                }
            }
        }.bind(this));
        this.repopulateTestsLists(true);
    }
    if (existsIndex > -1) {
        setTimeout(function () {
            ITSInstance.UIController.showWarning('ITSPublicSessionEditor.DuplicateTestAdded', 'Please note : You have added the same test twice to this session. ');
        }, 10);
    }
    this.currentSession.resequence(true);
    this.loadTestAndBatteriesList();
};

ITSPublicSessionEditor.prototype.populateReportList = function () {
    if (! ITSInstance.reports.listLoaded) {
        ITSInstance.reports.loadAvailableReportsList(function () {}, function () {});
        setTimeout(this.populateReportList.bind(this), 1000);
        return;
    }

    var testList = [];
    var tempSessionTestList = this.currentSession.SessionTests;
    for (var i = 0; i < tempSessionTestList.length; i++) {
        testList.push(tempSessionTestList[i].TestID);
    }

    var reports = ITSInstance.reports.findReportsForTests(testList);

    $('#AdminInterfacePublicSession-ReportSelect').empty();
    $('#AdminInterfacePublicSession-ReportSelect').append('<option value=""></option>');
    var selected = "";
    var testDescription = "";
    var tempTest = {};
    for (var i=0; i < reports.length; i++) {
        selected = "";
        if (reports[i].ID == this.currentSession.PluginData.sessionParameters.reportID) { selected = " selected='selected' ";}
        testDescription = "";
        if (reports[i].TestID != '') {
            //console.log(reports[i].TestID);
            tempTest = ITSInstance.tests.testByID(reports[i].TestID);
            if (tempTest != undefined) { testDescription = tempTest.Description + " - "; }
        }
        $('#AdminInterfacePublicSession-ReportSelect').append(
            '<option NoTranslate ' + selected + 'value=\"' +  reports[i].ID + '\">' +
            testDescription + reports[i].getReportDescriptionWithDBIndicator()  + '</option>'
        );
    }
};

ITSPublicSessionEditor.prototype.selectReportInEditor = function(object) {
    this.currentSession.PluginData.sessionParameters.reportID = object.value;
};

ITSPublicSessionEditor.prototype.createNewSession= function (EmailAddress) {
    ITSLogger.logMessage(logLevel.INFO,"Change test session requested " + EmailAddress);
    // create a new and empty session
    this.currentSession = ITSInstance.candidateSessions.newPublicSession();
    $('#AdminInterfacePublicSessionCandidateFor').tagsManager('empty');

    // bind it to the div elements AdminInterfacePublicSession
    DataBinderTo("AdminInterfacePublicSession", this.currentSession);

    // for the tests and batteries
    this.loadTestAndBatteriesList();
};

ITSPublicSessionEditor.prototype.repopulateTestsLists =  function (animate) {
    var tempSessionTestList = this.currentSession.SessionTests;

    $('#AdminInterfacePublicSessionTestsSelectionBody').empty();
    if (tempSessionTestList.length == 0) {

        var newTR0 = $('<tr><td id="AdminInterfacePublicSessionTestsSelectionC1">'+
            ITSInstance.translator.getTranslatedString( 'PublicSessionEditor', 'NoNewTestsYet', 'No new tests added yet')+
            '</td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('#AdminInterfacePublicSessionTestsSelectionBody').append(newTR0);
    }
    for (var i = 0; i < tempSessionTestList.length; i++) {
        var newTR = $('<TR>');
        var newTD1 = $('<TD id="AdminInterfacePublicSessionTestsSelectionCA' + i + '">');
        var newTD2 = $('<TD id="AdminInterfacePublicSessionTestsSelectionCB' + i + '">');
        var newTD3 = $('<TD id="AdminInterfacePublicSessionTestsSelectionCC' + i + '">');
        var newTD4 = $('<TD id="AdminInterfacePublicSessionTestsSelectionCD' + i + '">');
        var newTD5 = $('<TD id="AdminInterfacePublicSessionTestsSelectionCE' + i + '">');
        var newTD6 = $('<TD style="min-width: 70px" id="AdminInterfacePublicSessionTestsSelectionCF' + i + '">');

        if (tempSessionTestList[i].Status == 10) {
            var NewIDel = $('<a onclick="ITSInstance.PublicSessionController.testsListDelete(' + i + ');">');
            NewIDel.append($('<i class="fa fa-fw fa-trash">'));
            newTD6.append(NewIDel);
            if (i > 0) {
                var NewIUp = $('<a onclick="ITSInstance.PublicSessionController.testsListMoveUp(' + i + ');">');
                NewIUp.append($('<i class="fa fa-fw fa-arrow-circle-up">'));
                newTD6.append(NewIUp);
            }
            if (i < (tempSessionTestList.length - 1)) {
                var NewIDown = $('<a onclick="ITSInstance.PublicSessionController.testsListMoveDown(' + i + ');">');
                NewIDown.append($('<i class="fa fa-fw fa-arrow-circle-down">'));
                newTD6.append(NewIDown);
            }

            newTD1.text(tempSessionTestList[i].testDefinition.TestName);
            newTD2.text(tempSessionTestList[i].testDefinition.languageSupportHumanReadable());

            // setup the norm dropdowns
            if (tempSessionTestList[i].testDefinition.detailsLoaded) {
                var tempSessionTest = tempSessionTestList[i];
                var tempNorms = tempSessionTest.testDefinition.norms;
                if (tempSessionTest.NormID1 == "00000000-0000-0000-0000-000000000000") {
                    // check for norm preselection in the test definition
                    tempSessionTest.NormID1 = tempSessionTest.testDefinition.getDefaultNorm(1);
                    tempSessionTest.NormID2 = tempSessionTest.testDefinition.getDefaultNorm(2);
                    tempSessionTest.NormID3 = tempSessionTest.testDefinition.getDefaultNorm(3);
                }
                if (tempNorms.length > 0) {
                    var NewNorm1 = $('<select class="form-control form-control-sm" id="normSelect1" onchange="ITSInstance.PublicSessionController.normSelected(1,this,' + i + ');">');
                    for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                        if (tempNorms[normWalker].id == tempSessionTest.NormID1) {
                            NewNorm1.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                        } else {
                            NewNorm1.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                        }
                    }
                    newTD3.append(NewNorm1);
                }

                if (tempNorms.length > 1) {
                    var NewNorm2 = $('<select class="form-control form-control-sm" id="normSelect2" onchange="ITSInstance.PublicSessionController.normSelected(2,this,' + i + ');">');
                    for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                        if (tempNorms[normWalker].id == tempSessionTest.NormID2) {
                            NewNorm2.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                        } else {
                            NewNorm2.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                        }
                    }
                    newTD4.append(NewNorm2);
                }

                if (tempNorms.length > 2) {
                    var NewNorm3 = $('<select class="form-control form-control-sm" id="normSelect3" onchange="ITSInstance.PublicSessionController.normSelected(3,this,' + i + ');">');
                    for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                        if (tempNorms[normWalker].id == tempSessionTest.NormID3) {
                            NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                        } else {
                            NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                        }
                    }
                    newTD5.append(NewNorm3);
                }
            }

            newTR.append(newTD1);
            newTR.append(newTD2);
            newTR.append(newTD3);
            newTR.append(newTD4);
            newTR.append(newTD5);
            newTR.append(newTD6);
            $('#AdminInterfacePublicSessionTestsSelectionBody').append(newTR);
        }
    }
    if (animate) {
        $('#AdminInterfacePublicSessionTestsSelection').fadeTo("quick", 0.1);
        $('#AdminInterfacePublicSessionTestsSelection').fadeTo("quick", 1);
    }

    this.populateReportList();
};

ITSPublicSessionEditor.prototype.testsListMoveUp= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index - 1];
    this.currentSession.SessionTests[index - 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSPublicSessionEditor.prototype.testsListMoveDown= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index + 1];
    this.currentSession.SessionTests[index + 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSPublicSessionEditor.prototype.testsListDelete= function (index) {
    this.currentSession.SessionTests.splice(index, 1);
    this.repopulateTestsLists();
};

ITSPublicSessionEditor.prototype.normSelected = function (normSequence, selectElement, testArrayIndex) {
    //ITSLogger.logMessage(logLevel.ERROR,normSequence, selectElement, testArrayIndex);
    if (normSequence == 1) {
        this.currentSession.SessionTests[testArrayIndex].NormID1 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 2) {
        this.currentSession.SessionTests[testArrayIndex].NormID2 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 3) {
        this.currentSession.SessionTests[testArrayIndex].NormID3 = selectElement.options[selectElement.options.selectedIndex].value;
    }
};

ITSPublicSessionEditor.prototype.hide = function () {
    $('#AdminInterfacePublicSession').hide();
};

ITSPublicSessionEditor.prototype.saveCurrentSession = function ( onSuccessCallback ) {
    // check for value in required field
    if (onSuccessCallback) {
        this.savecurrentSessionCallback = onSuccessCallback;
    } else {
        this.savecurrentSessionCallback = undefined;
    }

    var ValidationMessage = "";
    // check if all information is present to save the session
    DataBinderFrom("AdminInterfacePublicSession", this.currentSession);

    if (this.currentSession.Description == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('PublicSessionEditor','DescriptionMissing','Please enter a description for this session.')
    }
    if (this.currentSession.SessionTests.length == 0) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('PublicSessionEditor','TestMissing','Please add a test to this session.')
    }
    // get the date & time fields from the interface
    var tempValidationMessage = ITSInstance.translator.getTranslatedString('PublicSessionEditor','DatesInvalid','Please check the date fields in the session validity fields. The values are no valid dates.');
    // check for invalid dates
    if (! isValidDate(this.currentSession.AllowedStartDateTime) && isValidDate(this.currentSession.AllowedEndDateTime)) {
        ValidationMessage = tempValidationMessage;
    }

    this.currentSession.EMailNotificationAdresses = "";
    if ( $('#AdminInterfacePublicSessionMailMe').is(':checked') ) {
        this.currentSession.EMailNotificationAdresses = $('#AdminInterfacePublicSessionMail').val();
    }

    if (ValidationMessage == "") {
        if (this.currentSession.Status >= 30) this.currentSession.Status = 20;
        if (this.currentSession.firstTestToTake() == -1) {
            this.currentSession.Status = 30;
        }

        if (!this.currentSession.Active) {
            // if this session is not active then activate it
            this.currentSession.Active = this.currentSession.Status != 30;
        }

        // update on the server
        $('#AdminInterfacePublicSession-saveIcon')[0].outerHTML = "<i id='AdminInterfacePublicSession-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.currentSession.saveToServerIncludingTestsAndPerson(function () {
            this.saveSessionsDone();
        }.bind(this), function (errorText) {
            this.saveSessionsError();
        }, true);
    } else {
        ITSInstance.UIController.showWarning('PublicSessionEditor.SessionValidationFailed', 'The session could not be saved because information is missing', ValidationMessage);
    }
};

ITSPublicSessionEditor.prototype.saveSessionsError = function () {
    $('#AdminInterfacePublicSession-saveIcon')[0].outerHTML = "<i id='AdminInterfacePublicSession-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSPublicSessionEditorSaveError", "The session could not be saved. Please try again.");
};


ITSPublicSessionEditor.prototype.saveSessionsDone = function () {
    $('#AdminInterfacePublicSession-saveIcon')[0].outerHTML = "<i id='AdminInterfacePublicSession-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    $('#AdminInterfacePublicSessionDeleteButton').show();
    if (this.savecurrentSessionCallback) this.savecurrentSessionCallback();
};

ITSPublicSessionEditor.prototype.showPublicSessions = function () {
    var x = this.currentSession.Active ? "" : "&Status=Archived";
    ITSRedirectPath('SessionLister&SessionType=1&GroupSessionID=' + this.currentSession.ID + x);
};

ITSPublicSessionEditor.prototype.archivePublicSessionNow = function (archiveStatus) {
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.archiveStatus = archiveStatus;

    if (archiveStatus) {
        console.log('archive');
        this.currentSession.archiveGroupSessionQuick(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    } else {
        console.log('unarchive');
        this.currentSession.unarchiveGroupSessionQuick(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    }
};
ITSPublicSessionEditor.prototype.archiveSessionsDone = function () {
    this.switchUIState();
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showInfo("ITSPublicSessionEditor.ArchiveSessionOK", "The session has been successfully (un)archived. Please review the session and the save it.");
};
ITSPublicSessionEditor.prototype.archiveSessionsError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSPublicSessionEditor.ArchiveSessionFailed", "The session could not be (un)archived at this moment.");
    this.switchUIState();
};

ITSPublicSessionEditor.prototype.deletePublicSessionNow = function () {
    this.currentSession.deleteGroupSessionQuick( function () { window.history.back(); }, function () { window.history.back(); });
};
ITSPublicSessionEditor.prototype.deleteSessionsDone = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showInfo("ITSPublicSessionEditor.DeleteSessionOK", "The session has been successfully deleted.", '',
        'window.history.back();');
};
ITSPublicSessionEditor.prototype.deleteSessionsError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSPublicSessionEditor.DeleteSessionFailed", "The session could not be deleted at this moment.", '',
        'window.history.back();');
};

ITSPublicSessionEditor.prototype.clearSession = function () {
    this.savecurrentSession(this.clearSessionCallback.bind(this));
};

ITSPublicSessionEditor.prototype.clearSessionCallback = function () {
    this.currentSession = ITSInstance.candidateSessions.newPublicSession();
    DataBinderTo("AdminInterfacePublicSession", this.currentSession);
    this.repopulateTestsLists();
    this.show();
};

ITSPublicSessionEditor.prototype.deletecurrentSession = function () {
    this.currentSession.deleteSession(
        function () {
            this.clearSessionCallback();
            $('#AdminInterfacePublicSessionWarningExistsLabel').hide();
            $('#AdminInterfacePublicSessionDeleteButton').hide();}.bind(this),
        function () {});

};

ITSPublicSessionEditor.prototype.downloadSession = function() {
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.sessionsList = [];
    ITSInstance.JSONAjaxLoader('sessions', this.sessionsList, this.downloadSessionProcess.bind(this), this.downloadSessionProcessError.bind(this), 'ITSObject', 0, 9999999,
        "", this.currentSession.Active ? "N":"Y", "N", "Y", "GroupSessionID="+this.currentSession.ID, "");
}

ITSPublicSessionEditor.prototype.downloadSessionProcessError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError('ITSPublicSessionEditor.DownloadError', 'The session download is not available at this moment.');
}

ITSPublicSessionEditor.prototype.downloadSessionProcess = function () {
    this.archiveDownloadCounter = 0;
    this.tempCounter =0;
    this.downloadPreferenceReports = $('#AdminInterfacePublicSessionDownload-reports:checked').val() == "reports";
    this.downloadPreferenceAnswers = $('#AdminInterfacePublicSessionDownload-Answers:checked').val() == "answers";
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.zip = new JSZip();

    this.resultsFile = {};
    this.couponsFile = [];
    var tempSession = {};

    for (var i=0; i < this.sessionsList.length; i++) {
        if (this.sessionsList[i].Status >= 30) {
            this.archiveDownloadCounter++;
            this.tempCounter++;
        }
    }

    ITSInstance.UIController.showInterfaceAsWaitingProgress( "" + this.archiveDownloadCounter );


    if (this.tempCounter == 0) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSPublicSessionEditor.ZIPNothingYet', 'No sessions are done yet, please retry downloading the archive once one or more sessions are done.');
    } else {
        this.tempCounter =  0;
        this.loadSessionForDownload();
    }
};

ITSPublicSessionEditor.prototype.loadSessionForDownload = function () {
    if (this.sessionsList[this.tempCounter].Status >= 30) {
        var tempSession = new ITSCandidateSession(undefined, ITSInstance);
        tempSession.loadSession(this.sessionsList[this.tempCounter].ID, function () {

            // process this record
            tempSession.createReportOverviewInZip(this.zip, pad(this.tempCounter, 2) + " " + tempSession.Person.createHailing() + " " + tempSession.Description,
                function (tempSession, zip) {
                    console.log(tempSession, this, this.tempCounter);
                    this.couponsFile.concat(tempSession.couponsFile);
                    shallowCopy(tempSession.resultsFile, this.resultsFile);
                    this.archiveDownloadCounter--;
                    ITSInstance.UIController.showInterfaceAsWaitingProgress("" + this.archiveDownloadCounter);
                    if (this.archiveDownloadCounter == 0) {
                        // we are done
                        this.zip.file('data.json', JSON.stringify(this.resultsFile));
                        if (this.couponsFile.length > 0) {
                            this.zip.file('coupons.txt', this.couponsFile.join('\n\r'));
                        }
                        var fileName = ITSInstance.translator.getTranslatedString("ITSSessionEditor", "ScoreOverview", "Score overview");
                        this.zip.generateAsync({type : "blob", compression: "DEFLATE", compressionOptions: { level: 1 }}).then(function (blob) {
                            saveFileLocally(fileName + " " + this.currentSession.Description + ".zip", blob, "application/zip");
                            ITSInstance.UIController.showInterfaceAsWaitingOff();
                        }.bind(this));
                    } else {
                        // process the next
                        this.tempCounter = this.tempCounter+1;
                        ITSInstance.UIController.showInterfaceAsWaitingOn();
                        ITSInstance.UIController.showInterfaceAsWaitingProgress("" + this.archiveDownloadCounter);
                        tempSession.loadSession(this.sessionsList[this.tempCounter].ID, this.loadSessionForDownload.bind(this), this.zipError);
                    }


                }.bind(this), this.zipError, this.downloadPreferenceReports, this.downloadPreferenceAnswers);

        }.bind(this), this.zipError);
    } else {
        this.tempCounter = this.tempCounter+1;
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.UIController.showInterfaceAsWaitingProgress("" + this.archiveDownloadCounter);
        this.loadSessionForDownload();
        //tempSession.loadSession(this.sessionsList[this.tempCounter].ID, this.loadSessionForDownload.bind(this), this.zipError);
    }
};

ITSPublicSessionEditor.prototype.zipError = function () {
    ITSInstance.UIController.showError('ITSPublicSessionEditor.ZIPFailed', 'Not all group session results could be downloaded at this moment.');
};

ITSPublicSessionEditor.prototype.getCurrentSessionURL = function () {
    this.saveCurrentSession(this.getCurrentSessionURLOK.bind(this));
};

ITSPublicSessionEditor.prototype.getCurrentSessionURLOK = function () {
    this.currentSession.Person.requestPassword( this.getURLPasswordLoadOK.bind(this),
        this.getURLPasswordLoadError.bind(this) );
};

ITSPublicSessionEditor.prototype.getURLPasswordLoadOK = function () {
    ITSInstance.UIController.showInfo('', location.protocol + '//' + location.host + location.pathname + "?AutoLogin&Lang=" + ITSLanguage +
        "&UserID="+this.currentSession.Person.EMail+"&Password=" + this.currentSession.Person.Password)
};
ITSPublicSessionEditor.prototype.getURLPasswordLoadError = function () {
    ITSInstance.UIController.showError('ITSPublicSessionEditor.PasswordLoadFailed', 'The password could not be retrieved at this moment.');
};

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfacecurrentSessionEditorDiv = $('<div class="container-fluid" id="AdminInterfacePublicSession" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfacecurrentSessionEditorDiv);
    $(AdminInterfacecurrentSessionEditorDiv).load(ITSJavaScriptVersion + '/Plugins/PublicSessionEditor/editor.html', function () {

        // register the editor
        ITSInstance.PublicSessionController = new ITSPublicSessionEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.PublicSessionController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfacePublicSession");
    })


})() //iife