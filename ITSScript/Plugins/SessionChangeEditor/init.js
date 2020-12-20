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
//# sourceURL=SessionChangeEditor/init.js

// define the new candidate editor object in the global memspace so that everybody can use it
function ITSChangeExistingSessionEditor (session) {
    this.ITSSession = session;
    this.availableTestsAndBatteries = []; // tests and batteries available to the session selection
    this.currentSession = ITSInstance.candidateSessions.newCandidateSession(); // the session we are changing with this object
    this.path = "ChangeSession";
    $('#AdminInterfaceChangeSessionWarningExistsLabel').hide();
    $('#AdminInterfaceSessionChangeAccountExists').hide();
    //$('#AdminInterfaceChangeSessionDeleteButton').hide();
};

ITSChangeExistingSessionEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('dd7e4de7-c4cf-4625-91ec-e7da42dfc33b', 'Change the content of a session', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Changes the content of a session once it is setup');

ITSChangeExistingSessionEditor.prototype.hide = function () {
    $('#AdminInterfaceChangeSession').hide();
};

ITSChangeExistingSessionEditor.prototype.show = function () {
    if (getUrlParameterValue('SessionID')) {
        if (getUrlParameterValue('SessionID')) this.SessionID = getUrlParameterValue('SessionID');

        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#AdminInterfaceChangeSession').show();
        ITSInstance.UIController.initNavBar();
        $('#AdminInterfaceSessionChangeAccountExists').hide();


        // load the session
        if ( (!this.currentSession) || (this.currentSession.ID != this.SessionID)) {
            this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
            this.currentSession.loadSession(this.SessionID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this));
            ITSInstance.UIController.showInterfaceAsWaitingOn();
        } else {
            this.sessionLoadingSucceeded();
        }

        // set the email notification to default
        if ($('#AdminInterfaceChangeSessionMail').val() == "") {
            try {
                $('#AdminInterfaceChangeSessionMail').val(ITSInstance.users.currentUser.PluginData.MailSettings.Notifications);
            } catch(err) {}
        }
        $('#AdminInterfaceChangeSessionEditMailMe').prop('checked', ( $('#AdminInterfaceChangeSessionMail').val().trim() != "") );
    }
    else // no parameter will not work for this screen
    {
        ITSInstance.UIController.activateScreenPath('Switchboard');
    }
};

ITSChangeExistingSessionEditor.prototype.sessionLoadingSucceeded = function () {
    // make sure to populate the test list ONLY with test in ready state.
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    DataBinderTo("AdminInterfaceChangeSession", this.currentSession);
    this.repopulateTestsLists(true);
    this.emailAddressChanged(this.currentSession.Person.EMail);
    this.loadTestAndBatteriesList();

    if (this.currentSession.Status >= 30 ) {
        $('#AdminInterfaceChangeSessionStartButton').hide();
    } else {
        $('#AdminInterfaceChangeSessionStartButton').show();
    }

    if (! ITSInstance.users.userListLoaded) ITSInstance.users.loadUsers(function () {}, function (){});
};

ITSChangeExistingSessionEditor.prototype.sessionLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSChangeExistingSessionEditor.LoadSessionFailed", "The session could not be loaded at this moment.", '',
        'window.history.back();');
};

ITSChangeExistingSessionEditor.prototype.afterOfficeLogin = function () {
    // make sure we get the tests and batteries loaded, dont care when it is ready
    ITSInstance.tests.loadAvailableTests(function () {
    }, function () {
    });
    ITSInstance.batteries.loadAvailableBatteries(function () {
    }, function () {
    });
};

ITSChangeExistingSessionEditor.prototype.loadTestAndBatteriesList = function() {
    this.availableTestsAndBatteries.length = 0;

    $('#AdminInterfaceChangeSessionTestsInputList').empty();
    newLI = "<option value=\"\">" + ITSInstance.translator.getTranslatedString('SessionChangeEditor','SelectATest','Select content to add to the session') + "</option>"
    $('#AdminInterfaceChangeSessionTestsInputList').append(newLI);

    if (! ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) {
        ITSInstance.tests.testList.forEach(function callback(currentValue, index, array) {
            var includeTest = false;
            includeTest = currentValue.Active == true;
            if (!$('#AdminInterfaceChangeSessionTestsIncludeOtherLanguages').is(':checked')) {
                includeTest = includeTest && (currentValue.supportsLanguage(ITSLanguage));
            }
            if (includeTest) {
                this.availableTestsAndBatteries.push({
                    "TestID": currentValue.ID,
                    "Description": currentValue.getTestFormatted()
                });
                newLI = "<option value=\"" + currentValue.ID + "\">" + currentValue.getTestFormatted() + "</option>"
                $('#AdminInterfaceChangeSessionTestsInputList').append(newLI);
            }
        }, this);
    }
    ITSInstance.batteries.batteryList.forEach(function callback(currentValue, index, array) {
        if (currentValue.Active) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": ITSInstance.translator.getTranslatedString('SessionChangeEditor','BatteryText',"Battery : ") + currentValue.BatteryName
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + ITSInstance.translator.getTranslatedString('SessionChangeEditor','BatteryText',"Battery : ") + currentValue.BatteryName + "</option>"
            $('#AdminInterfaceChangeSessionTestsInputList').append(newLI);
        }
    }, this);
    $('#AdminInterfaceChangeSessionTestsInputList').combobox({ forceRenewal : true, onchange : "ITSInstance.changeSessionController.TestOrBatterySelected(this.value); " } );
};

ITSChangeExistingSessionEditor.prototype.TestOrBatterySelected = function (textFound) {
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
            ITSInstance.UIController.showWarning('ITSChangeExistingSessionEditor.DuplicateTestAdded', 'Please note : You have added the same test twice to this session. ');
        }, 10);
    }
    this.currentSession.resequence(true);
    this.loadTestAndBatteriesList();
};

ITSChangeExistingSessionEditor.prototype.createNewSession= function (EmailAddress) {
    ITSLogger.logMessage(logLevel.INFO,"Change test session requested " + EmailAddress);
    // create a new and empty session
    this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
    this.currentSession.Person.EMail = EmailAddress;

    // bind it to the div elements AdminInterfaceChangeSession
    DataBinderTo("AdminInterfaceChangeSession", this.currentSession);

    // for the tests and batteries
    this.loadTestAndBatteriesList();

    if (EmailAddress != '')  this.emailAddressChanged(EmailAddress);
};

ITSChangeExistingSessionEditor.prototype.repopulateTestsLists =  function (animate) {
    var tempSessionTestList = this.currentSession.SessionTests;

    $('#AdminInterfaceChangeSessionTestsSelectionBody').empty();
    if (tempSessionTestList.length == 0) {

        var newTR0 = $('<tr><td id="AdminInterfaceChangeSessionTestsSelectionC1">'+
            ITSInstance.translator.getTranslatedString( 'SessionChangeEditor', 'NoNewTestsYet', 'No new tests added yet')+
            '</td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('#AdminInterfaceChangeSessionTestsSelectionBody').append(newTR0);
    }
    var maxNormsCount = 0;
    for (var i = 0; i < tempSessionTestList.length; i++) {
        var newTR = $('<TR>');
        var newTD1 = $('<TD id="AdminInterfaceChangeSessionTestsSelectionCA' + i + '">');
        var newTD2 = $('<TD id="AdminInterfaceChangeSessionTestsSelectionCB' + i + '">');
        var newTD3 = $('<TD coltag="changesessnorm1" id="AdminInterfaceChangeSessionTestsSelectionCC' + i + '">');
        var newTD4 = $('<TD coltag="changesessnorm2" id="AdminInterfaceChangeSessionTestsSelectionCD' + i + '">');
        var newTD5 = $('<TD coltag="changesessnorm3" id="AdminInterfaceChangeSessionTestsSelectionCE' + i + '">');
        var newTD6 = $('<TD style="min-width: 70px" id="AdminInterfaceChangeSessionTestsSelectionCF' + i + '">');
        
        if (tempSessionTestList[i].Status == 10) {
            var NewIDel = $('<a onclick="ITSInstance.changeSessionController.testsListDelete(' + i + ');">');
            NewIDel.append($('<i class="fa fa-fw fa-trash">'));
            newTD6.append(NewIDel);
            if (i > 0) {
                var NewIUp = $('<a onclick="ITSInstance.changeSessionController.testsListMoveUp(' + i + ');">');
                NewIUp.append($('<i class="fa fa-fw fa-arrow-circle-up">'));
                newTD6.append(NewIUp);
            }
            if (i < (tempSessionTestList.length - 1)) {
                var NewIDown = $('<a onclick="ITSInstance.changeSessionController.testsListMoveDown(' + i + ');">');
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
                    var NewNorm1 = $('<select class="form-control form-control-sm" id="normSelect1" onchange="ITSInstance.changeSessionController.normSelected(1,this,' + i + ');">');
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
                    var NewNorm2 = $('<select class="form-control form-control-sm" id="normSelect2" onchange="ITSInstance.changeSessionController.normSelected(2,this,' + i + ');">');
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
                    var NewNorm3 = $('<select class="form-control form-control-sm" id="normSelect3" onchange="ITSInstance.changeSessionController.normSelected(3,this,' + i + ');">');
                    for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                        if (tempNorms[normWalker].id == tempSessionTest.NormID3) {
                            NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                        } else {
                            NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                        }
                    }
                    newTD5.append(NewNorm3);
                }
                maxNormsCount = max([maxNormsCount,tempNorms.length])
            }

            newTR.append(newTD1);
            newTR.append(newTD2);
            newTR.append(newTD3);
            newTR.append(newTD4);
            newTR.append(newTD5);
            newTR.append(newTD6);
            $('#AdminInterfaceChangeSessionTestsSelectionBody').append(newTR);
        }
    }
    maxNormsCount > 0 ? $('td[coltag="changesessnorm1"]').show() : $('td[coltag="changesessnorm1"]').hide();
    maxNormsCount > 1 ? $('td[coltag="changesessnorm2"]').show() : $('td[coltag="changesessnorm2"]').hide();
    maxNormsCount > 2 ? $('td[coltag="changesessnorm3"]').show() : $('td[coltag="changesessnorm3"]').hide();
    if (animate) {
        $('#AdminInterfaceChangeSessionTestsSelection').fadeTo("quick", 0.1);
        $('#AdminInterfaceChangeSessionTestsSelection').fadeTo("quick", 1);
    }
};

ITSChangeExistingSessionEditor.prototype.testsListMoveUp= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index - 1];
    this.currentSession.SessionTests[index - 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSChangeExistingSessionEditor.prototype.testsListMoveDown= function (index) {
    var Temp = this.currentSession.SessionTests[index];
    this.currentSession.SessionTests[index] = this.currentSession.SessionTests[index + 1];
    this.currentSession.SessionTests[index + 1] = Temp;
    this.currentSession.resequence(true);
    this.repopulateTestsLists();
};

ITSChangeExistingSessionEditor.prototype.testsListDelete= function (index) {
    this.currentSession.SessionTests.splice(index, 1);
    this.repopulateTestsLists();
};

ITSChangeExistingSessionEditor.prototype.loadPersonDataIntoSession= function () {
    $('#collapseTwo').fadeTo("slow", 1);
    if (ITSInstance.candidates.currentCandidate) {
        this.currentSession.Person = ITSInstance.candidates.currentCandidate;
        DataBinderTo("AdminInterfaceChangeSession", this.currentSession);
    }
};

ITSChangeExistingSessionEditor.prototype.normSelected = function (normSequence, selectElement, testArrayIndex) {
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

ITSChangeExistingSessionEditor.prototype.hide = function () {
    $('#AdminInterfaceChangeSession').hide();
};

ITSChangeExistingSessionEditor.prototype.UIToInvalidated = function () {
    $('#AdminInterfaceChangeSession').removeClass("was-validated");
};

ITSChangeExistingSessionEditor.prototype.emailAddressChanged = function ( newValue ) {
    // the email address has changed. check if this is a known user. If so then update the password, name etc and stored persid. If not generate a new person id.
    // the session cannot be saved until this check is complete

    // is this a consultant? That is NOT allowed.
    $('#AdminInterfaceSessionChangeAccountExists').hide();
    if (typeof ITSInstance.users.findUserByLogin(newValue, true) != "undefined") {
        this.existingUserFound = true;
        $('#AdminInterfaceSessionChangeAccountExists').show();
    } else {
        // otherwise check the candidates list
        $('#AdminInterfaceChangeSessionSaveButton')[0].disabled  = true;
        ITSInstance.candidates.loadCurrentCandidateByLogin(newValue, this.emailAddressChangedFound.bind(this), this.emailAddressChangedNotFound.bind(this));
    }
};

ITSChangeExistingSessionEditor.prototype.saveCurrentSession = function ( onSuccessCallback ) {
    // check for value in required field
    $('#AdminInterfaceChangeSession').addClass("was-validated");
    setTimeout(this.UIToInvalidated.bind(this) , 10000);

    if (onSuccessCallback) {
        this.savecurrentSessionCallback = onSuccessCallback;
    } else {
        this.savecurrentSessionCallback = undefined;
    }

    var ValidationMessage = "";
    // check if all information is present to save the session
    DataBinderFrom("AdminInterfaceChangeSession", this.currentSession);
    this.currentSession.relinkToCurrentPersonID();
    // email adres must be set and last name
    if (this.currentSession.Person.EMail == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','PersonMissing','You have not selected a person to add for this session.')
    }
    if ((this.currentSession.Person.Password.length <= 6) && (! this.existingUserFound)) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','PasswordMissing','The password is not set or less than 6 characters.')
    }
    if (this.currentSession.Description == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','DescriptionMissing','Please enter a description for this session.')
    }
    if (this.currentSession.SessionTests.length == 0) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','TestMissing','Please add a test to this session.')
    }
    if (typeof ITSInstance.users.findUserByLogin($('#AdminInterfaceChangeSessionCandidateFor').val(), true) != "undefined") {
        ValidationMessage = $('#AdminInterfaceSessionChangeAccountExists').text();
    }

    // get the date & time fields from the interface
    var tempValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','DatesInvalid','Please check the date fields in the birthdate and session validity fields. The values are no valid dates.');
    // check for invalid dates
    if (! (isValidDate(this.currentSession.Person.BirthDate) && isValidDate(this.currentSession.AllowedStartDateTime) && isValidDate(this.currentSession.AllowedEndDateTime)  )) {
        ValidationMessage = tempValidationMessage;
    }

    this.currentSession.EMailNotificationAdresses = "";
    if ( $('#AdminInterfaceChangeSessionEditMailMe').is(':checked') ) {
        this.currentSession.EMailNotificationAdresses = $('#AdminInterfaceChangeSessionMail').val();
    }

    if (ValidationMessage == "") {
        if ((this.currentSession.Status >= 30) && (this.currentSession.firstTestToTake() > -1) ) this.currentSession.Status = 20;
        if ((this.currentSession.Status == 20) && (this.currentSession.firstTestToTake() <= -1) ) this.currentSession.Status = 30;

        if (!this.currentSession.Active) {
            // if this session is not active then activate it
            this.currentSession.Active = this.currentSession.Status != 30;
        }
        if (!this.currentSession.Person.Active ) {
            this.currentSession.Person.Active = this.currentSession.Status != 30;
            this.currentSession.Person.saveToServer(function () {}, function () {});
        }

        // update on the server
        if (this.existingUserFound)  this.currentSession.Person.Password = "";
        if (!this.existingUserFound)  this.currentSession.Person.Password = $('#AdminInterfaceChangeSessionCandidatePassword').val();

        $('#AdminInterfaceChangeSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceChangeSession-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
        this.currentSession.saveToServerIncludingTestsAndPerson(function () {
            $('#AdminInterfaceChangeSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceChangeSession-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
            $('#AdminInterfaceChangeSessionDeleteButton').show();
            if (this.savecurrentSessionCallback) this.savecurrentSessionCallback();
        }.bind(this), function (errorText) {
            $('#AdminInterfaceChangeSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceChangeSession-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
            ITSInstance.UIController.showDialog("ITSSessionNewEditorSaveError", "Session cannot be saved", "The session could not be saved. Please try again." , [{btnCaption: "OK"}], [errorText]);
        }, true);
    } else {
        ITSInstance.UIController.showWarning('SessionNewEditor.SessionValidationFailed', 'The session could not be saved because information is missing', ValidationMessage);
    }
};


ITSChangeExistingSessionEditor.prototype.emailAddressChangedFound = function () {
    var tempUser = $('#AdminInterfaceChangeSessionCandidateFor')[0].value;
    if ((ITSInstance.candidates.searchForCandidates.length>0) && (ITSInstance.candidates.searchForCandidates[0].EMail ==  tempUser)) {
        // copy the current candidate into the this.currentSession.Person
        DataBinderFrom("AdminInterfaceChangeSession", this.currentSession);
        var oldPwd = $('#AdminInterfaceChangeSessionCandidatePassword').val();
        var oldStart = $('#AdminInterfaceChangeSessionStartDate').val();
        var oldEnd = $('#AdminInterfaceChangeSessionEndDate').val();
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
        DataBinderTo("AdminInterfaceChangeSession", this.currentSession);
        $('#AdminInterfaceChangeSessionWarningExistsLabel').show();
        $('#AdminInterfaceChangeSessionCandidatePasswordDiv').hide();
        this.existingUserFound = true;
    } else {
        // no match
        this.emailAddressChangedNotFound();
        $('#AdminInterfaceChangeSessionWarningExistsLabel').hide();
        $('#AdminInterfaceChangeSessionCandidatePasswordDiv').show();
        this.existingUserFound = false;
    }
    // relink all sessiontests to the correct person id
    this.currentSession.relinkToCurrentPersonID();
    $('#AdminInterfaceChangeSessionSaveButton')[0].disabled  = false;
};

ITSChangeExistingSessionEditor.prototype.emailAddressChangedNotFound = function () {
    // generate a new guid for this.currentSession.Person to make sure we save it as a new person instead of update an existing one
    this.currentSession.Person.ID = newGuid();
    this.currentSession.PersonID = this.currentSession.Person.ID;
    this.currentSession.Person.regeneratePassword();
    $('#AdminInterfaceChangeSessionCandidatePassword').val(this.currentSession.Person.Password);
    // relink all sessiontests to the correct person id
    this.currentSession.relinkToCurrentPersonID();
    $('#AdminInterfaceChangeSessionSaveButton')[0].disabled  = false;
};

ITSChangeExistingSessionEditor.prototype.clearSession = function () {
    this.savecurrentSession(this.clearSessionCallback.bind(this));
};

ITSChangeExistingSessionEditor.prototype.clearSessionCallback = function () {
    this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
    DataBinderTo("AdminInterfaceChangeSession", this.currentSession);
    this.repopulateTestsLists();
    this.show();
};

ITSChangeExistingSessionEditor.prototype.deletecurrentSession = function () {
    this.currentSession.deleteSession(
        function () {
         this.clearSessionCallback();
         $('#AdminInterfaceSessionNewWarningExistsLabel').hide();
         $('#AdminInterfaceChangeSessionDeleteButton').hide();}.bind(this),
        function () {});

};

ITSChangeExistingSessionEditor.prototype.startNowSession = function () {
    this.currentSession.Person.regeneratePassword();
    $('#AdminInterfaceChangeSessionCandidatePassword').val(this.currentSession.Person.Password);
    this.existingUserFound = false; // make sure the password is updated
    this.saveCurrentSession(this.startNowSessionCallback.bind(this),
        function () { ITSInstance.UIController.showError("SessionEditor", "SessionStartFailed", "The session could not be started, please refresh your browser page and try again."); } );
};
ITSChangeExistingSessionEditor.prototype.startNowSessionCallback = function () {
    // redirect to login screen
    ITSInstance.logoutController.logout("UserID=" + $('#AdminInterfaceChangeSessionCandidateFor').val() + "&Password=" + this.currentSession.Person.Password);
};

ITSChangeExistingSessionEditor.prototype.showAuditTrail = function () {
    ITSRedirectPath("SessionAuditTrail&SessionID=" + this.currentSession.ID);
};

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfacecurrentSessionEditorDiv = $('<div class="container-fluid" id="AdminInterfaceChangeSession" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfacecurrentSessionEditorDiv);
    $(AdminInterfacecurrentSessionEditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionChangeEditor/editor.html', function () {

        // register the editor
        ITSInstance.changeSessionController = new ITSChangeExistingSessionEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.changeSessionController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfaceChangeSession");
    })

})() //iife