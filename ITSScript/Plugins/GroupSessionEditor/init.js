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
function ITSGroupSessionEditor (session) {
    this.ITSSession = session;
    this.availableTestsAndBatteries = []; // tests and batteries available to the session selection
    this.currentSession = ITSInstance.candidateSessions.newGroupSession(); // the session we are changing with this object
    this.path = "GroupSession";
    $('#AdminInterfaceGroupSessionWarningExistsLabel').hide();
    $('#AdminInterfaceGroupSessionsBusy').hide();

    //$('#AdminInterfaceGroupSessionDeleteButton').hide();
};

ITSGroupSessionEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('dd7e4de7-c4cf-4625-91ec-e7da42dfc33b', 'Change the content of a session', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Changes the content of a session once it is setup');

ITSGroupSessionEditor.prototype.hide = function () {
    $('#AdminInterfaceGroupSession').hide();
};

ITSGroupSessionEditor.prototype.show = function () {
    $('#AdminInterfaceGroupSessionCandidateFor').tagsManager();
    if (getUrlParameterValue('SessionID')) {
        this.newSession = false;
        this.SessionID = getUrlParameterValue('SessionID');
    } else {
        // this is a new session because a session id is not given
        this.newSession = true;
        this.currentSession = ITSInstance.candidateSessions.newGroupSession();
        this.SessionID = this.currentSession.ID;

    }

    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#AdminInterfaceGroupSession').show();
    ITSInstance.UIController.initNavBar();

    // load the session
     if (this.newSession) {
         this.sessionLoadingSucceeded();
     } else {
         this.currentSession = ITSInstance.candidateSessions.newGroupSession();
         $('#AdminInterfaceGroupSessionCandidateFor').tagsManager('empty');
         this.currentSession.loadSession(this.SessionID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this));
         ITSInstance.UIController.showInterfaceAsWaitingOn();
     }
};

ITSGroupSessionEditor.prototype.sessionLoadingSucceeded = function () {
    // make sure to populate the test list ONLY with test in ready state.
    DataBinderTo("AdminInterfaceGroupSession", this.currentSession);
    this.repopulateTestsLists(true);
    this.loadTestAndBatteriesList();
    this.currentSession.loadRelatedGroupMembers(this.groupMemberLoadingSucceeded.bind(this), this.groupMemberLoadingFailed.bind(this));
    this.switchUIState();

    // set the email notification to default
    if ($('#AdminInterfaceGroupSessionMail').val() == "") {
        try {
            $('#AdminInterfaceGroupSessionMail').val(ITSInstance.users.currentUser.PluginData.MailSettings.Notifications);
        } catch(err) {}
    }
    $('#AdminInterfaceGroupSessionMailMe').prop('checked', ( $('#AdminInterfaceGroupSessionMail').val().trim() != "") );
};

ITSGroupSessionEditor.prototype.switchUIState = function () {
    $('#AdminInterfaceGroupSessionUnArchiveTest').hide();
    $('#AdminInterfaceGroupSessionDeleteTest').hide();
    $('#AdminInterfaceGroupSessionArchiveTest').hide();
    $('#AdminInterfaceGroupSessionShowRelatedButton').hide();
    $('#AdminInterfaceGroupSessionOverviewButton').hide();
    $('#AdminInterfaceGroupSessionInviteButton').hide();
    $('#AdminInterfaceGroupSessionSaveButton').hide();
    $('#AdminInterfaceGroupSessionsBusy').hide();
    if (this.currentSession.Active) {
        $('#AdminInterfaceGroupSessionSaveButton').show();
        $('#AdminInterfaceGroupSessionShowRelatedButton').show();
        $('#AdminInterfaceGroupSessionArchiveTest').show();
        $('#AdminInterfaceGroupSessionDeleteTest').show();
        if (ITSInstance.users.currentUser.IsPasswordManager) {
            $('#AdminInterfaceGroupSessionInviteButton').show();
            $('#AdminInterfaceGroupSessionOverviewButton').show();
        }
    } else {
        $('#AdminInterfaceGroupSessionShowRelatedButton').show();
        $('#AdminInterfaceGroupSessionUnArchiveTest').show();
        $('#AdminInterfaceGroupSessionDeleteTest').show();
    }
};

ITSGroupSessionEditor.prototype.groupMemberLoadingSucceeded = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    $('#AdminInterfaceGroupSessionCandidateFor').tagsManager('empty');
    this.currentSession.PluginData.GroupMembers.sort( function (a,b) { return a.EMail.localeCompare(b.EMail); } );
    for (var i=0; i < this.currentSession.PluginData.GroupMembers.length; i++) {
        $('#AdminInterfaceGroupSessionCandidateFor').tagsManager('pushTag', this.currentSession.PluginData.GroupMembers[i].EMail);
        if (this.currentSession.PluginData.GroupMembers[i].sessionstatus > 10) {
            $('#AdminInterfaceGroupSessionsBusy').show();
        }
    }
};

ITSGroupSessionEditor.prototype.groupMemberLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditor.LoadSessionFailed", "The session could not be loaded at this moment.", '',
        'window.history.back();');
};

ITSGroupSessionEditor.prototype.sessionLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditor.LoadSessionFailed", "The session could not be loaded at this moment.", '',
        'window.history.back();');
};

ITSGroupSessionEditor.prototype.afterOfficeLogin = function () {
    // make sure we get the tests and batteries loaded, dont care when it is ready
    ITSInstance.tests.loadAvailableTests(function () {
    }, function () {
    });
    ITSInstance.batteries.loadAvailableBatteries(function () {
    }, function () {
    });
};

ITSGroupSessionEditor.prototype.loadTestAndBatteriesList = function() {
    this.availableTestsAndBatteries.length = 0;

    $('#AdminInterfaceGroupSessionTestsInputList').empty();
    newLI = "<option value=\"\">" + ITSInstance.translator.getTranslatedString('GroupSessionEditor','SelectATest','Select a test to add to the session') + "</option>"
    $('#AdminInterfaceGroupSessionTestsInputList').append(newLI);

    if (! ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) {
        ITSInstance.tests.testList.forEach(function callback(currentValue, index, array) {
            var includeTest = false;
            includeTest = currentValue.Active == true;
            if (!$('#AdminInterfaceGroupSessionTestsIncludeOtherLanguages').is(':checked')) {
                includeTest = includeTest && (currentValue.supportsLanguage(ITSLanguage));
            }
            if (includeTest) {
                this.availableTestsAndBatteries.push({
                    "TestID": currentValue.ID,
                    "Description": currentValue.getTestFormatted()
                });
                newLI = "<option value=\"" + currentValue.ID + "\">" + currentValue.getTestFormatted() + "</option>"
                $('#AdminInterfaceGroupSessionTestsInputList').append(newLI);
            }
        }, this);
    }
    ITSInstance.batteries.batteryList.forEach(function callback(currentValue, index, array) {
        if (currentValue.Active) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": ITSInstance.translator.getTranslatedString('GroupSessionEditor','BatteryText',"Battery : ") + currentValue.BatteryName
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + ITSInstance.translator.getTranslatedString('GroupSessionEditor','BatteryText',"Battery : ") + currentValue.BatteryName + "</option>"
            $('#AdminInterfaceGroupSessionTestsInputList').append(newLI);
        }
    }, this);
    $('#AdminInterfaceGroupSessionTestsInputList').combobox({ forceRenewal : true, onchange : "ITSInstance.groupSessionController.TestOrBatterySelected(this.value); " } );
};

ITSGroupSessionEditor.prototype.TestOrBatterySelected = function (textFound) {
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
            ITSInstance.UIController.showWarning('ITSGroupSessionEditor.DuplicateTestAdded', 'Please note : You have added the same test twice to this session. ');
        }, 10);
    }
    this.currentSession.resequence(true);
    this.loadTestAndBatteriesList();
};

ITSGroupSessionEditor.prototype.createNewSession= function (EmailAddress) {
    ITSLogger.logMessage(logLevel.INFO,"Change test session requested " + EmailAddress);
    // create a new and empty session
    this.currentSession = ITSInstance.candidateSessions.newGroupSession();
    $('#AdminInterfaceGroupSessionCandidateFor').tagsManager('empty');

    // bind it to the div elements AdminInterfaceGroupSession
    DataBinderTo("AdminInterfaceGroupSession", this.currentSession);

    // for the tests and batteries
    this.loadTestAndBatteriesList();
};

ITSGroupSessionEditor.prototype.repopulateTestsLists =  function (animate) {
    var tempSessionTestList = this.currentSession.SessionTests;

    $('#AdminInterfaceGroupSessionTestsSelectionBody').empty();
    if (tempSessionTestList.length == 0) {

        var newTR0 = $('<tr><td id="AdminInterfaceGroupSessionTestsSelectionC1">'+
            ITSInstance.translator.getTranslatedString( 'GroupSessionEditor', 'NoNewTestsYet', 'No new tests added yet')+
            '</td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('#AdminInterfaceGroupSessionTestsSelectionBody').append(newTR0);
    }
    for (var i = 0; i < tempSessionTestList.length; i++) {
        var newTR = $('<TR>');
        var newTD1 = $('<TD id="AdminInterfaceGroupSessionTestsSelectionCA' + i + '">');
        var newTD2 = $('<TD id="AdminInterfaceGroupSessionTestsSelectionCB' + i + '">');
        var newTD3 = $('<TD id="AdminInterfaceGroupSessionTestsSelectionCC' + i + '">');
        var newTD4 = $('<TD id="AdminInterfaceGroupSessionTestsSelectionCD' + i + '">');
        var newTD5 = $('<TD id="AdminInterfaceGroupSessionTestsSelectionCE' + i + '">');
        var newTD6 = $('<TD style="min-width: 70px" id="AdminInterfaceGroupSessionTestsSelectionCF' + i + '">');

        if (tempSessionTestList[i].Status == 10) {
            var NewIDel = $('<a onclick="ITSInstance.groupSessionController.testsListDelete(' + i + ');">');
            NewIDel.append($('<i class="fa fa-fw fa-trash">'));
            newTD6.append(NewIDel);
            if (i > 0) {
                var NewIUp = $('<a onclick="ITSInstance.groupSessionController.testsListMoveUp(' + i + ');">');
                NewIUp.append($('<i class="fa fa-fw fa-arrow-circle-up">'));
                newTD6.append(NewIUp);
            }
            if (i < (tempSessionTestList.length - 1)) {
                var NewIDown = $('<a onclick="ITSInstance.groupSessionController.testsListMoveDown(' + i + ');">');
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
                    var NewNorm1 = $('<select class="form-control form-control-sm" id="normSelect1" onchange="ITSInstance.groupSessionController.normSelected(1,this,' + i + ');">');
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
                    var NewNorm2 = $('<select class="form-control form-control-sm" id="normSelect2" onchange="ITSInstance.groupSessionController.normSelected(2,this,' + i + ');">');
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
                    var NewNorm3 = $('<select class="form-control form-control-sm" id="normSelect3" onchange="ITSInstance.groupSessionController.normSelected(3,this,' + i + ');">');
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
            $('#AdminInterfaceGroupSessionTestsSelectionBody').append(newTR);
        }
    }
    if (animate) {
        $('#AdminInterfaceGroupSessionTestsSelection').fadeTo("quick", 0.1);
        $('#AdminInterfaceGroupSessionTestsSelection').fadeTo("quick", 1);
    }
};

ITSGroupSessionEditor.prototype.testsListMoveUp= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index - 1];
    this.currentSession.SessionTests[index - 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSGroupSessionEditor.prototype.testsListMoveDown= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index + 1];
    this.currentSession.SessionTests[index + 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSGroupSessionEditor.prototype.testsListDelete= function (index) {
    this.currentSession.SessionTests.splice(index, 1);
    this.repopulateTestsLists();
};

ITSGroupSessionEditor.prototype.loadPersonDataIntoSession= function () {
    $('#AdminInterfaceGroupSessioncollapseTwo').fadeTo("slow", 1);
    if (ITSInstance.candidates.currentCandidate) {
        this.currentSession.Person = ITSInstance.candidates.currentCandidate;
        DataBinderTo("AdminInterfaceGroupSession", this.currentSession);
    }
};

ITSGroupSessionEditor.prototype.normSelected = function (normSequence, selectElement, testArrayIndex) {
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

ITSGroupSessionEditor.prototype.hide = function () {
    $('#AdminInterfaceGroupSession').hide();
};

ITSGroupSessionEditor.prototype.UIToInvalidated = function () {
    $('#AdminInterfaceGroupSession').removeClass("was-validated");
};

ITSGroupSessionEditor.prototype.emailAddressChanged = function ( newValue ) {
    // the email address has changed. check if this is a known user. If so then update the password, name etc and stored persid. If not generate a new person id.
    ITSInstance.candidates.loadCurrentCandidateByLogin( newValue, this.emailAddressChangedFound.bind(this), this.emailAddressChangedNotFound.bind(this) );
};

ITSGroupSessionEditor.prototype.saveCurrentSession = function ( onSuccessCallback ) {
    // check for value in required field
    $('#AdminInterfaceGroupSession').addClass("was-validated");
    setTimeout(this.UIToInvalidated.bind(this) , 10000);

    if (onSuccessCallback) {
        this.savecurrentSessionCallback = onSuccessCallback;
    } else {
        this.savecurrentSessionCallback = undefined;
    }

    var ValidationMessage = "";
    // check if all information is present to save the session
    DataBinderFrom("AdminInterfaceGroupSession", this.currentSession);

    if (this.currentSession.Description == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('GroupSessionEditor','DescriptionMissing','Please enter a description for this session.')
    }
    if (this.currentSession.SessionTests.length == 0) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('GroupSessionEditor','TestMissing','Please add a test to this session.')
    }
    // get the date & time fields from the interface
    var tempValidationMessage = ITSInstance.translator.getTranslatedString('GroupSessionEditor','DatesInvalid','Please check the date fields in the session validity fields. The values are no valid dates.');
    // check for invalid dates
    if (! isValidDate(this.currentSession.AllowedStartDateTime) && isValidDate(this.currentSession.AllowedEndDateTime)) {
        ValidationMessage = tempValidationMessage;
    }
    // check if there are candidates assigned to the session
    if ($('#AdminInterfaceGroupSessionCandidateFor').tagsManager('tags').length == 0) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('GroupSessionEditor','CandidatesMissing','Please add candidates to this group. Enter the email address for the candidate and then press the ENTER key to add this candidate..')
    }

    this.currentSession.EMailNotificationAdresses = "";
    if ( $('#AdminInterfaceGroupSessionMailMe').is(':checked') ) {
        this.currentSession.EMailNotificationAdresses = $('#AdminInterfaceGroupSessionMail').val();
    }
    if (!ITSInstance.users.currentUser.PluginData.MailSettings) ITSInstance.users.currentUser.PluginData.MailSettings = {};
    if (this.currentSession.EMailNotificationAdresses != ITSInstance.users.currentUser.PluginData.MailSettings.Notifications ) {
        if (this.currentSession.EMailNotificationAdresses.trim() != "") {
            ITSInstance.users.currentUser.PluginData.MailSettings.Notifications = this.currentSession.EMailNotificationAdresses;
            ITSInstance.users.saveCurrentUser();
        }
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
        $('#AdminInterfaceGroupSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceGroupSession-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.currentSession.saveToServerIncludingTests(function () {
            this.expandGroupSessionsForCandidates();
        }.bind(this), function (errorText) {
            this.saveSessionsError();
        }, true);
    } else {
        ITSInstance.UIController.showWarning('GroupSessionEditor.SessionValidationFailed', 'The session could not be saved because information is missing', ValidationMessage);
    }
};

ITSGroupSessionEditor.prototype.saveSessionsError = function () {
    $('#AdminInterfaceGroupSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceGroupSession-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditorSaveError", "The session could not be saved. Please try again.");
};

ITSGroupSessionEditor.prototype.expandGroupSessionsForCandidates = function () {
   this.validateGroupMembers( function() {
       // if there are group members expand the sessions
       this.currentSession.saveGroupSessionsToServer(this.saveSessionsDone.bind(this), this.saveSessionsError.bind(this), 'waitModalProgress');
   }.bind(this) );
};

ITSGroupSessionEditor.prototype.getPasswordsForCandidatesOverview = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.validateGroupMembers( this.getPasswordsForCandidatesOverviewStageLoad.bind(this) );
};

ITSGroupSessionEditor.prototype.getPasswordsForCandidatesOverviewStageLoad = function () {
    this.passwordsLoaded = 0;
    for (var i=0; i < this.currentSession.PluginData.GroupMembers.length; i++) {
        this.currentSession.PluginData.GroupMembers[i].tempCandidate = new ITSCandidate(this, ITSInstance);
        this.currentSession.PluginData.GroupMembers[i].tempCandidate.ID = this.currentSession.PluginData.GroupMembers[i].ID;
        this.currentSession.PluginData.GroupMembers[i].tempCandidate.requestPassword( this.getPasswordsForCandidatesOverviewStageLoadOK.bind(this, i),
             this.getPasswordsForCandidatesOverviewStageLoadError.bind(this) );
    }
};

ITSGroupSessionEditor.prototype.getPasswordsForCandidatesOverviewStageLoadOK = function (index) {
    this.passwordsLoaded++;
    //this.currentSession.PluginData.GroupMembers[index].Password = this.currentSession.PluginData.GroupMembers[index].tempCandidate.Password;
    if (this.currentSession.PluginData.GroupMembers.length == this.passwordsLoaded) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        var overview = "";
        for (var i=0; i < this.currentSession.PluginData.GroupMembers.length; i++) {
            overview += this.currentSession.PluginData.GroupMembers[i].EMail + "\t" + this.currentSession.PluginData.GroupMembers[i].tempCandidate.Password + "\r\n";
            this.currentSession.PluginData.GroupMembers[i].tempCandidate = undefined;
        }
        $('#AdminInterfaceGroupSessionLoginOverview-dialog').modal("show");
        $('#AdminInterfaceGroupSessionLoginOverview-All').val(overview);
    }
};

ITSGroupSessionEditor.prototype.getPasswordsForCandidatesOverviewStageLoadError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditor.LoadPasswordsError","The passwords for some users could not be loaded. Please save the session first.");
    for (var i=0; i < this.currentSession.PluginData.GroupMembers.length; i++) {
        this.currentSession.PluginData.GroupMembers[i].tempCandidate = undefined;
    }
};

ITSGroupSessionEditor.prototype.validateGroupMembers = function (afterValidate) {
    this.currentSession.PluginData.GroupMembers = [];
    this.validateGroupMembersAfterValidate = afterValidate;
    // get the list of entered candidates
    var selectedCandidates = $('#AdminInterfaceGroupSessionCandidateFor').tagsManager('tags');
    this.currentSession.PluginData.GroupMembersCount = 0;
    for (var i=0; i < selectedCandidates.length; i++) {
        this.validateGroupMembersLoad(selectedCandidates[i]);
    }
};

ITSGroupSessionEditor.prototype.validateGroupMembersLoad = function (selectedCandidate) {
    var newEntry = {};
    newEntry.ID = "00000000-0000-0000-0000-000000000000";
    newEntry.EMail = selectedCandidate;
    newEntry.candidate = new ITSCandidate(this, ITSInstance);
    // now validate if this email address is already known
    newEntry.candidate.loadByLogin( newEntry.EMail, this.validateGroupMemberFound.bind(this, newEntry), this.validateGroupMemberNotFound.bind(this, newEntry) );
    this.currentSession.PluginData.GroupMembers.push(newEntry);
};

ITSGroupSessionEditor.prototype.validateGroupMemberFound = function (newEntry) {
    this.currentSession.PluginData.GroupMembersCount++;
    if (newEntry.candidate[0]) { newEntry.ID = newEntry.candidate[0].ID; } // always select the first even when there are multiple
    else { newEntry.ID = newEntry.candidate.ID; } //unknown = new id
    newEntry.candidate = undefined; // do not keep the link to the object
    if (this.currentSession.PluginData.GroupMembersCount == this.currentSession.PluginData.GroupMembers.length){
        if (this.validateGroupMembersAfterValidate) { this.validateGroupMembersAfterValidate();}
    }
};

ITSGroupSessionEditor.prototype.validateGroupMemberNotFound = function (newEntry) {
    this.currentSession.PluginData.GroupMembersCount++;
    newEntry.ID = newEntry.candidate.ID ;
    newEntry.password = newEntry.candidate.password;
    newEntry.candidate = undefined; // do not keep the link to the object
    if (this.currentSession.PluginData.GroupMembersCount == this.currentSession.PluginData.GroupMembers.length){
        if (this.validateGroupMembersAfterValidate) { this.validateGroupMembersAfterValidate();}
    }
};


ITSGroupSessionEditor.prototype.saveSessionsDone = function () {
    $('#AdminInterfaceGroupSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceGroupSession-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    $('#AdminInterfaceGroupSessionDeleteButton').show();
    if (this.savecurrentSessionCallback) this.savecurrentSessionCallback();
};

ITSGroupSessionEditor.prototype.emailPaste = function () {
    setTimeout(this.emailPasteProcess.bind(this), 250);
};

ITSGroupSessionEditor.prototype.emailPasteProcess = function () {
    var pasteText = $('#AdminInterfaceGroupSessionCandidateFor')[0].value;
    if ( (pasteText.indexOf(',')>= 0) ||  (pasteText.indexOf('.')>= 0) || (pasteText.indexOf('\t')>= 0)) {
     pasteText = pasteText.replace( new RegExp(';','g'), ',');
     pasteText = pasteText.replace( new RegExp('\t','g'), ',');
     var pasteArray = pasteText.split(',');
     for (var i=0; i < pasteArray.length; i++) {
         var pasteStr = pasteArray[i].trim();
         if (pasteStr != "") {
             $('#AdminInterfaceGroupSessionCandidateFor').tagsManager("pushTag",pasteStr);
         }
     }
    }
    $('#AdminInterfaceGroupSessionCandidateFor')[0].value = "";
};

ITSGroupSessionEditor.prototype.sendInvitations = function () {
    ITSInstance.SessionMailerSessionController.currentSession = this.currentSession;
    ITSInstance.SessionMailerSessionController.currentPerson = undefined;
    ITSInstance.SessionMailerSessionController.currentConsultant = undefined;
        ITSInstance.UIController.showDialog("ITSGroupSessionEditor.SaveBeforeMail", "Send group mails", "Would you like to save your group session before sending mails?",
        [
        {
            btnCaption: "No",
            btnType: "btn-warning",
            btnOnClick: "ITSRedirectPath('SessionMailer&GroupSessionID=' + ITSInstance.groupSessionController.currentSession.ID + '&Template=defaultSession');"
        },
        {
            btnCaption: "Yes",
            btnType: "btn-success",
            btnOnClick: "ITSInstance.groupSessionController.saveCurrentSession(); "
        },
        {
            btnCaption: "Cancel",
            btnType: "btn-warning"
        }
        ]);
};

ITSGroupSessionEditor.prototype.showUserAndPasswordOverview = function () {
    this.getPasswordsForCandidatesOverview();
};

ITSGroupSessionEditor.prototype.showGroupSessions = function () {
    var x = this.currentSession.Active ? "" : "&Status=Archived";
    ITSRedirectPath('SessionLister&SessionType=0&GroupSessionID=' + this.currentSession.ID + x);
};

ITSGroupSessionEditor.prototype.archiveGroupSessionNow = function (archiveStatus) {
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.archiveStatus = archiveStatus;

    if ($('#AdminInterfaceGroupSessionArchive-All:checked').val() == "all") {
        this.currentSession.archiveGroupSessionQuick(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    }
    else if ($('#AdminInterfaceGroupSessionArchive-Unstarted:checked').val() == "unstarted") {
        this.currentSession.archiveGroupSessionsOnServer(function () {
            this.currentSession.Active = this.archiveStatus;
            this.currentSession.saveToServer(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
        }.bind(this), this.archiveSessionsError.bind(this), 'waitModalProgress', true, this.archiveStatus);
    }
    else if ($('#AdminInterfaceGroupSessionArchive-OnlyThis:checked').val() == "onlygroup") {
        this.currentSession.Active = this.archiveStatus;
        this.currentSession.saveToServer(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    }
};


ITSGroupSessionEditor.prototype.unarchiveGroupSessionNow = function (archiveStatus) {
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.archiveStatus = archiveStatus;

    if ($('#AdminInterfaceGroupSessionUnArchive-All:checked').val() == "all") {
        this.currentSession.unarchiveGroupSessionQuick(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    }
    else if ($('#AdminInterfaceGroupSessionUnArchive-Unstarted:checked').val() == "unstarted") {
        this.currentSession.archiveGroupSessionsOnServer(function () {
            this.currentSession.Active = this.archiveStatus;
            this.currentSession.saveToServer(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
        }.bind(this), this.archiveSessionsError.bind(this), 'waitModalProgress', true, this.archiveStatus);
    }
    else if ($('#AdminInterfaceGroupSessionUnArchive-OnlyThis:checked').val() == "onlygroup") {
        this.currentSession.Active = this.archiveStatus;
        this.currentSession.saveToServer(this.archiveSessionsDone.bind(this), this.archiveSessionsError.bind(this));
    }
};

ITSGroupSessionEditor.prototype.archiveSessionsDone = function () {
    this.switchUIState();
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showInfo("ITSGroupSessionEditor.ArchiveSessionOK", "The session has been successfully (un)archived. Please review the session and the save it.");
};
ITSGroupSessionEditor.prototype.archiveSessionsError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditor.ArchiveSessionFailed", "The session could not be (un)archived at this moment.");
    this.switchUIState();
};

ITSGroupSessionEditor.prototype.deleteGroupSessionNow = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOn();

    if ($('#AdminInterfaceGroupSessionDelete-All:checked').val() == "all") {
        this.currentSession.deleteGroupSessionQuick( function () { window.history.back(); }, function () { window.history.back(); });
    }
    else if ($('#AdminInterfaceGroupSessionDelete-Unstarted:checked').val() == "unstarted") {
        this.currentSession.deleteGroupSessionsOnServer(function () {
            this.currentSession.deleteFromServer(this.deleteSessionsDone.bind(this), this.deleteSessionsError.bind(this));
        }.bind(this), this.deleteSessionsError.bind(this), 'waitModalProgress', true);
    }
    else if ($('#AdminInterfaceGroupSessionDelete-OnlyThis:checked').val() == "onlygroup") {
        this.currentSession.deleteFromServer(this.deleteSessionsDone.bind(this), this.deleteSessionsError.bind(this));
    }
};
ITSGroupSessionEditor.prototype.deleteSessionsDone = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showInfo("ITSGroupSessionEditor.DeleteSessionOK", "The session has been successfully deleted.", '',
        'window.history.back();');
};
ITSGroupSessionEditor.prototype.deleteSessionsError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSGroupSessionEditor.DeleteSessionFailed", "The session could not be deleted at this moment.", '',
        'window.history.back();');
};


ITSGroupSessionEditor.prototype.emailAddressChangedFound = function () {
    var tempUser = $('#AdminInterfaceGroupSessionCandidateFor')[0].value;
    if ((ITSInstance.candidates.searchForCandidates.length>0) && (ITSInstance.candidates.searchForCandidates[0].EMail ==  tempUser)) {
        // copy the current candidate into the this.currentSession.Person
        DataBinderFrom("AdminInterfaceGroupSession", this.currentSession);
        var oldPwd = $('#AdminInterfaceGroupSessionCandidatePassword').val();
        var oldStart = $('#AdminInterfaceGroupSessionStartDate').val();
        var oldEnd = $('#AdminInterfaceGroupSessionEndDate').val();
        this.currentSession.Person.ID = ITSInstance.candidates.searchForCandidates[0].ID;
        this.currentSession.Person.EMail = ITSInstance.candidates.searchForCandidates[0].EMail;
        this.currentSession.Person.FirstName = ITSInstance.candidates.searchForCandidates[0].FirstName;
        this.currentSession.Person.LastName = ITSInstance.candidates.searchForCandidates[0].LastName;
        this.currentSession.Person.Initials = ITSInstance.candidates.searchForCandidates[0].Initials;
        this.currentSession.Person.BirthDate = ITSInstance.candidates.searchForCandidates[0].BirthDate;
        this.currentSession.Person.Age = ITSInstance.candidates.searchForCandidates[0].Age;
        this.currentSession.Person.Sex = ITSInstance.candidates.searchForCandidates[0].Sex;
        //this.currentSession.Person.Password = ITSInstance.candidates.searchForCandidates[0].Password;
        this.currentSession.Person.Password = "";
        //this.currentSession.AllowedStartDateTime = oldStart;
        //this.currentSession.AllowedEndDateTime = oldEnd;
        DataBinderTo("AdminInterfaceGroupSession", this.currentSession);
        $('#AdminInterfaceGroupSessionWarningExistsLabel').show();
        $('#AdminInterfaceGroupSessionCandidatePasswordDiv').hide();
        this.existingUserFound = true;
    } else {
        // no match
        this.emailAddressChangedNotFound();
        $('#AdminInterfaceGroupSessionWarningExistsLabel').hide();
        $('#AdminInterfaceGroupSessionCandidatePasswordDiv').show();
        this.existingUserFound = false;
    }
    // relink all sessiontests to the correct person id
    this.currentSession.relinkToCurrentPersonID();
};

ITSGroupSessionEditor.prototype.emailAddressChangedNotFound = function () {
    // generate a new guid for this.currentSession.Person to make sure we save it as a new person instead of update an existing one
    this.currentSession.Person.ID = newGuid();
    this.currentSession.PersonID = this.currentSession.Person.ID;
    this.currentSession.Person.regeneratePassword();
    $('#AdminInterfaceGroupSessionCandidatePassword').val(this.currentSession.Person.Password);
    // relink all sessiontests to the correct person id
    this.currentSession.relinkToCurrentPersonID();
};

ITSGroupSessionEditor.prototype.clearSession = function () {
    this.savecurrentSession(this.clearSessionCallback.bind(this));
};

ITSGroupSessionEditor.prototype.clearSessionCallback = function () {
    this.currentSession = ITSInstance.candidateSessions.newGroupSession();
    DataBinderTo("AdminInterfaceGroupSession", this.currentSession);
    this.repopulateTestsLists();
    this.show();
};

ITSGroupSessionEditor.prototype.deletecurrentSession = function () {
    this.currentSession.deleteSession(
        function () {
            this.clearSessionCallback();
            $('#AdminInterfaceGroupSessionWarningExistsLabel').hide();
            $('#AdminInterfaceGroupSessionDeleteButton').hide();}.bind(this),
        function () {});

};

ITSGroupSessionEditor.prototype.startNowSession = function () {
    this.currentSession.Person.regeneratePassword();
    this.currentSession.saveCurrentSession(this.startNowSessionCallback.bind(this),
        function () { ITSInstance.UIController.showError("SessionEditor", "SessionStartFailed", "The session could not be started, please refresh your browser page and try again."); } );
};

ITSGroupSessionEditor.prototype.startNowSessionCallback = function () {
    // redirect to login screen
    ITSInstance.logoutController.logout("UserID=" + $('#AdminInterfaceGroupSessionCandidateFor').val() + "&Password=" + $('#AdminInterfaceGroupSessionCandidatePassword').val());
};

ITSGroupSessionEditor.prototype.downloadSession = function () {
    this.archiveDownloadCounter = 0;
    this.tempCounter =0;
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.downloadPreferenceReports = $('#AdminInterfaceGroupDownload-reports:checked').val() == "reports";
    this.downloadPreferenceAnswers = $('#AdminInterfaceGroupDownload-Answers:checked').val() == "answers";
    this.zip = new JSZip();

    this.resultsFile = {};
    this.couponsFile = [];
    var tempSession = {};

    for (var i=0; i < this.currentSession.PluginData.GroupMembers.length; i++) {
        if (this.currentSession.PluginData.GroupMembers[i].sessionstatus >= 30) {
            this.archiveDownloadCounter++;
            this.tempCounter++;
        }
    }

    ITSInstance.UIController.showInterfaceAsWaitingProgress( "" + this.archiveDownloadCounter );


    if (this.tempCounter == 0) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSPublicGroupEditor.ZIPNothingYet', 'No sessions are done yet, please retry downloading the archive once one or more sessions are done.');
    } else {
        this.tempCounter =  0;
        this.loadSessionForDownload();
    }
};


ITSGroupSessionEditor.prototype.loadSessionForDownload = function () {
    if (this.currentSession.PluginData.GroupMembers[this.tempCounter].sessionstatus >= 30) {
        var tempSession = new ITSCandidateSession(undefined, ITSInstance);
        tempSession.loadSession(this.currentSession.PluginData.GroupMembers[this.tempCounter].sessionid, function () {

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
                        this.zip.generateAsync({type: "blob"}).then(function (blob) {
                            saveFileLocally(fileName + " " + this.currentSession.Description + ".zip", blob, "application/zip");
                            ITSInstance.UIController.showInterfaceAsWaitingOff();
                        }.bind(this));
                    } else {
                        // process the next
                        this.tempCounter = this.tempCounter+1;
                        ITSInstance.UIController.showInterfaceAsWaitingOn();
                        ITSInstance.UIController.showInterfaceAsWaitingProgress("" + this.archiveDownloadCounter);
                        tempSession.loadSession(this.currentSession.PluginData.GroupMembers[this.tempCounter].sessionid, this.loadSessionForDownload.bind(this), this.zipError);
                    }


                }.bind(this), this.zipError, this.downloadPreferenceReports, this.downloadPreferenceAnswers);

        }.bind(this), this.zipError);
    } else {
        this.tempCounter = this.tempCounter+1;
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.UIController.showInterfaceAsWaitingProgress("" + this.archiveDownloadCounter);
        tempSession.loadSession(this.currentSession.PluginData.GroupMembers[this.tempCounter].sessionid, this.loadSessionForDownload.bind(this), this.zipError);
    }
};

ITSGroupSessionEditor.prototype.zipError = function () {
    ITSInstance.UIController.showError('ITSGroupSessionEditor.ZIPFailed', 'Not all group session results could be downloaded at this moment.');
};

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfacecurrentSessionEditorDiv = $('<div class="container-fluid" id="AdminInterfaceGroupSession" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfacecurrentSessionEditorDiv);
    $(AdminInterfacecurrentSessionEditorDiv).load(ITSJavaScriptVersion + '/Plugins/GroupSessionEditor/editor.html', function () {

        // register the editor
        ITSInstance.groupSessionController = new ITSGroupSessionEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.groupSessionController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfaceGroupSession");
    })


})() //iife