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

// define the new candidate editor object in the global memspace so that everybody can use it
function ITSInviteNewCandidateEditor (session) {
    this.ITSSession = session;
    this.availableTestsAndBatteries = []; // tests and batteries available to the session selection
    this.newSession = ITSInstance.candidateSessions.newCandidateSession(); // the new session that we are building up with this object
    this.path = "NewSession";
    $('#AdminInterfaceSessionNewWarningExistsLabel').hide();
    $('#AdminInterfaceSessionNewSessionDeleteButton').hide();
};

ITSInviteNewCandidateEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('16edf0c9-3646-440d-a9a3-3a48cdeea258', 'New session creation', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Helps to easily setup a session');

ITSInviteNewCandidateEditor.prototype.afterOfficeLogin = function () {
    // make sure we get the tests and batteries loaded, dont care when it is ready
    ITSInstance.tests.loadAvailableTests(function () {
    }, function () {
    });
    ITSInstance.batteries.loadAvailableBatteries(function () {
    }, function () {
    });
};

ITSInviteNewCandidateEditor.prototype.loadTestAndBatteriesList = function() {
    this.availableTestsAndBatteries.length = 0;

    $('#AdminInterfaceSessionNewSessionTestsInputList').empty();
    newLI = "<option value=\"\">" + ITSInstance.translator.getTranslatedString('SessionNewEditor','SelectATest','Select a test to add to the session') + "</option>"
    $('#AdminInterfaceSessionNewSessionTestsInputList').append(newLI);

    if (! ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) {
        ITSInstance.tests.testList.forEach(function callback(currentValue, index, array) {
            var includeTest = false;
            includeTest = currentValue.Active == true;
            if (!$('#AdminInterfaceSessionNewSessionTestsIncludeOtherLanguages').is(':checked')) {
                includeTest = includeTest && (currentValue.supportsLanguage(ITSLanguage));
            }
            if (includeTest) {
                this.availableTestsAndBatteries.push({
                    "TestID": currentValue.ID,
                    "Description": currentValue.getTestFormatted()
                });
                newLI = "<option value=\"" + currentValue.ID + "\">" + currentValue.getTestFormatted() + "</option>"
                $('#AdminInterfaceSessionNewSessionTestsInputList').append(newLI);
            }
        }, this);
    }
    ITSInstance.batteries.batteryList.forEach(function callback(currentValue, index, array) {
        if (currentValue.Active) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": ITSInstance.translator.getTranslatedString('SessionNewEditor','BatteryText',"Battery : ") + currentValue.BatteryName
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + ITSInstance.translator.getTranslatedString('SessionNewEditor','BatteryText',"Battery : ") + currentValue.BatteryName + "</option>"
            $('#AdminInterfaceSessionNewSessionTestsInputList').append(newLI);
        }
    }, this);
    $('#AdminInterfaceSessionNewSessionTestsInputList').combobox({ forceRenewal : true, onchange : "ITSInstance.newCandidateSessionController.TestOrBatterySelected(this.value); " } );
};

ITSInviteNewCandidateEditor.prototype.TestOrBatterySelected = function (textFound) {
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
    var existsIndex = this.newSession.findTestById(id);
    if (testIndex > -1) { // new test found and not added yet
        var newCST = this.newSession.newCandidateSessionTest(ITSInstance.tests.testList[testIndex]);
        if (!ITSInstance.tests.testList[testIndex].detailsLoaded) {
            ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(this.repopulateTestsLists.bind(this));
        }
        this.repopulateTestsLists();
    }
    if (batteryIndex > -1) { // battery found, add it
        ITSInstance.batteries.batteryList[batteryIndex].BatteryTests.forEach(  function (item) {
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, item.TestID);
            if (testIndex >= 0) {
                var newCST = this.newSession.newCandidateSessionTest(ITSInstance.tests.testList[testIndex]);
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
            ITSInstance.UIController.showWarning('ITSInviteNewCandidateEditor.DuplicateTestAdded', 'Please note : You have added the same test twice to this session. ');
        }, 10);
    }
    this.newSession.resequence(true);
    this.loadTestAndBatteriesList();
};

ITSInviteNewCandidateEditor.prototype.createNewSession= function (EmailAddress) {
    console.log("New test session requested " + EmailAddress);
    // create a new and empty session
    this.newSession = ITSInstance.candidateSessions.newCandidateSession();
    this.newSession.Person.EMail = EmailAddress;

    // bind it to the div elements AdminInterfaceSessionEditNew
    DataBinderTo("AdminInterfaceSessionEditNew", this.newSession);

    // for the tests and batteries
    this.loadTestAndBatteriesList();

    if (EmailAddress != '')  this.emailAddressChanged(EmailAddress);
};

ITSInviteNewCandidateEditor.prototype.repopulateTestsLists =  function (animate) {
    var tempSessionTestList = this.newSession.SessionTests;

    $('#AdminInterfaceSessionNewSessionTestsSelectionBody').empty();
    if (tempSessionTestList.length == 0) {

        var newTR0 = $('<tr><td id="AdminInterfaceSessionNewSessionTestsSelectionC1">'+
            ITSInstance.translator.getTranslatedString( 'SessionNewEditor', 'NoTestsYet', 'No tests added yet')+
            '</td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('#AdminInterfaceSessionNewSessionTestsSelectionBody').append(newTR0);
    }
    for (var i = 0; i < tempSessionTestList.length; i++) {
        var newTR = $('<TR>');
        var newTD1 = $('<TD id="AdminInterfaceSessionNewSessionTestsSelectionCA' + i + '">');
        var newTD2 = $('<TD id="AdminInterfaceSessionNewSessionTestsSelectionCB' + i + '">');
        var newTD3 = $('<TD id="AdminInterfaceSessionNewSessionTestsSelectionCC' + i + '">');
        var newTD4 = $('<TD id="AdminInterfaceSessionNewSessionTestsSelectionCD' + i + '">');
        var newTD5 = $('<TD id="AdminInterfaceSessionNewSessionTestsSelectionCE' + i + '">');
        var newTD6 = $('<TD style="min-width: 70px" id="AdminInterfaceSessionNewSessionTestsSelectionCF' + i + '">');
        var NewIDel = $('<a onclick="ITSInstance.newCandidateSessionController.testsListDelete(' + i + ');">');
        NewIDel.append($('<i class="fa fa-fw fa-trash">'));
        newTD6.append(NewIDel);
        if (i > 0) {
            var NewIUp = $('<a onclick="ITSInstance.newCandidateSessionController.testsListMoveUp(' + i + ');">');
            NewIUp.append($('<i class="fa fa-fw fa-arrow-circle-up">'));
            newTD6.append(NewIUp);
        }
        if (i < (tempSessionTestList.length - 1)) {
            var NewIDown = $('<a onclick="ITSInstance.newCandidateSessionController.testsListMoveDown(' + i + ');">');
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
                var NewNorm1 = $('<select class="form-control form-control-sm" id="normSelect1" onchange="ITSInstance.newCandidateSessionController.normSelected(1,this,'+i+');">');
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
                var NewNorm2 = $('<select class="form-control form-control-sm" id="normSelect2" onchange="ITSInstance.newCandidateSessionController.normSelected(2,this,'+i+');">');
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
                var NewNorm3 = $('<select class="form-control form-control-sm" id="normSelect3" onchange="ITSInstance.newCandidateSessionController.normSelected(3,this,'+i+');">');
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
        $('#AdminInterfaceSessionNewSessionTestsSelectionBody').append(newTR);
    }
    if (animate) {
        $('#AdminInterfaceSessionNewSessionTestsSelection').fadeTo("quick", 0.1);
        $('#AdminInterfaceSessionNewSessionTestsSelection').fadeTo("quick", 1);
    }
};

ITSInviteNewCandidateEditor.prototype.testsListMoveUp= function (index) {
    var Temp = this.newSession.SessionTests[index];
    this.newSession.SessionTests[index] = this.newSession.SessionTests[index - 1];
    this.newSession.SessionTests[index - 1] = Temp;
    this.newSession.resequence(true);
    this.repopulateTestsLists();
};

ITSInviteNewCandidateEditor.prototype.testsListMoveDown= function (index) {
    var Temp = this.newSession.SessionTests[index];
    this.newSession.SessionTests[index] = this.newSession.SessionTests[index + 1];
    this.newSession.SessionTests[index + 1] = Temp;
    this.newSession.resequence(true);
    this.repopulateTestsLists();
};

ITSInviteNewCandidateEditor.prototype.testsListDelete= function (index) {
    this.newSession.SessionTests.splice(index, 1);
    this.repopulateTestsLists();
};

ITSInviteNewCandidateEditor.prototype.loadPersonDataIntoSession= function () {
    $('#collapseTwo').fadeTo("slow", 1);
    if (ITSInstance.candidates.currentCandidate) {
        this.newSession.Person = ITSInstance.candidates.currentCandidate;
        DataBinderTo("AdminInterfaceSessionEditNew", this.newSession);
    }
};

ITSInviteNewCandidateEditor.prototype.normSelected = function (normSequence, selectElement, testArrayIndex) {
    //console.log(normSequence, selectElement, testArrayIndex);
    if (normSequence == 1) {
        this.newSession.SessionTests[testArrayIndex].NormID1 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 2) {
        this.newSession.SessionTests[testArrayIndex].NormID2 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 3) {
        this.newSession.SessionTests[testArrayIndex].NormID3 = selectElement.options[selectElement.options.selectedIndex].value;
    }
};

ITSInviteNewCandidateEditor.prototype.hide = function () {
    $('#AdminInterfaceSessionEditNew').hide();
};

ITSInviteNewCandidateEditor.prototype.show = function () {
    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#AdminInterfaceSessionEditNew').show();
    ITSInstance.UIController.initNavBar();

    this.loadTestAndBatteriesList();
    this.repopulateTestsLists();
    if ($('#AdminInterfaceSessionNewSessionMail').val() == "") {
        try {
            $('#AdminInterfaceSessionNewSessionMail').val(ITSInstance.users.currentUser.PluginData.MailSettings.Notifications);
            $('#AdminInterfaceSessionEditMailMe').prop('checked', ( $('#AdminInterfaceSessionNewSessionMail').val().trim() != "") );
        } catch(err) {}
    }
};

ITSInviteNewCandidateEditor.prototype.UIToInvalidated = function () {
    $('#AdminInterfaceSessionNewSession').removeClass("was-validated");
};

ITSInviteNewCandidateEditor.prototype.saveNewSession = function ( onSuccessCallback ) {
    // check for value in required field
    $('#AdminInterfaceSessionNewSession').addClass("was-validated");
    setTimeout(this.UIToInvalidated.bind(this) , 10000);

    if (onSuccessCallback) {
        this.saveNewSessionCallback = onSuccessCallback;
    } else {
        this.saveNewSessionCallback = undefined;
    }

    var ValidationMessage = "";
    // check if all information is present to save the session
    DataBinderFrom("AdminInterfaceSessionEditNew", this.newSession);
    this.newSession.relinkToCurrentPersonID();
    // email adres must be set and last name
    if (this.newSession.Person.EMail == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','PersonMissing','You have not selected a person to add for this session.')
    }
    if ((this.newSession.Person.Password.length <= 6) && (! this.existingUserFound)) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','PasswordMissing','The password is not set or less than 6 characters.')
    }
    if (this.newSession.Description == "") {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','DescriptionMissing','Please enter a description for this session.')
    }
    if (this.newSession.SessionTests.length == 0) {
        ValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','TestMissing','Please add a test to this session.')
    }
    // get the date & time fields from the interface
    var tempValidationMessage = ITSInstance.translator.getTranslatedString('SessionNewEditor','DatesInvalid','Please check the date fields in the birthdate and session validity fields. The values are no valid dates.');
    // check for invalid dates
    if (! (isValidDate(this.newSession.Person.BirthDate) && isValidDate(this.newSession.AllowedStartDateTime) && isValidDate(this.newSession.AllowedEndDateTime)  )) {
        ValidationMessage = tempValidationMessage;
    }

    this.newSession.EMailNotificationAdresses = "";
    if ( $('#AdminInterfaceSessionEditMailMe').is(':checked') ) {
        this.newSession.EMailNotificationAdresses = $('#AdminInterfaceSessionNewSessionMail').val();
    }
    if (!ITSInstance.users.currentUser.PluginData.MailSettings) ITSInstance.users.currentUser.PluginData.MailSettings = {};
    if (this.newSession.EMailNotificationAdresses != ITSInstance.users.currentUser.PluginData.MailSettings.Notifications ) {
        ITSInstance.users.currentUser.PluginData.MailSettings.Notifications = this.newSession.EMailNotificationAdresses;
        ITSInstance.users.saveCurrentUser();
    }

    if (ValidationMessage == "") {
        // update on the server
        if (this.existingUserFound)  this.newSession.Person.Password = "";
        if (!this.existingUserFound)  this.newSession.Person.Password = $('#AdminInterfaceSessionNewSessionCandidatePassword').val();

        $('#AdminInterfaceSessionNewSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceSessionNewSession-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
        this.newSession.saveToServerIncludingTestsAndPerson(function () {
            $('#AdminInterfaceSessionNewSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceSessionNewSession-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
            $('#AdminInterfaceSessionNewSessionDeleteButton').show();
            if (this.saveNewSessionCallback) this.saveNewSessionCallback();
        }.bind(this), function (errorText) {
            $('#AdminInterfaceSessionNewSession-saveIcon')[0].outerHTML = "<i id='AdminInterfaceSessionNewSession-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
            ITSInstance.UIController.showDialog("ITSSessionNewEditorSaveError", "Session cannot be saved", "The session could not be saved. Please try again." , [{btnCaption: "OK"}], [errorText]);
        });
    } else {
        ITSInstance.UIController.showWarning('SessionNewEditor.SessionValidationFailed', 'The session could not be saved because information is missing', ValidationMessage);
    }
};

ITSInviteNewCandidateEditor.prototype.emailAddressChanged = function ( newValue ) {
    // the email address has changed. check if this is a known user. If so then update the password, name etc and stored persid. If not generate a new person id.
    // AdminInterfaceSessionNewSessionCandidateFirstName AdminInterfaceSessionNewSessionCandidateInitials  AdminInterfaceSessionNewSessionCandidateLastName  AdminInterfaceSessionNewSessionCandidateBirthDate
    // AdminInterfaceSessionNewSessionCandidateSexMale AdminInterfaceSessionNewSessionCandidateSexFemale AdminInterfaceSessionNewSessionCandidateSexUnknown
    // AdminInterfaceSessionNewSessionCandidatePassword
    ITSInstance.candidates.loadCurrentCandidateByLogin( newValue, this.emailAddressChangedFound.bind(this), this.emailAddressChangedNotFound.bind(this) );
};

ITSInviteNewCandidateEditor.prototype.emailAddressChangedFound = function () {
    var tempUser = $('#AdminInterfaceSessionNewSessionCandidateFor')[0].value;
    if ((ITSInstance.candidates.searchForCandidates.length>0) && (ITSInstance.candidates.searchForCandidates[0].EMail ==  tempUser)) {
        // copy the current candidate into the this.newSession.Person
        DataBinderFrom("AdminInterfaceSessionEditNew", this.newSession);
        var oldPwd = $('#AdminInterfaceSessionNewSessionCandidatePassword').val();
        var oldStart = $('#AdminInterfaceSessionNewSessionStartDate').val();
        var oldEnd = $('#AdminInterfaceSessionNewSessionEndDate').val();
        this.newSession.Person.ID = ITSInstance.candidates.searchForCandidates[0].ID;
        this.newSession.Person.EMail = ITSInstance.candidates.searchForCandidates[0].EMail;
        this.newSession.Person.FirstName = ITSInstance.candidates.searchForCandidates[0].FirstName;
        this.newSession.Person.LastName = ITSInstance.candidates.searchForCandidates[0].LastName;
        this.newSession.Person.Initials = ITSInstance.candidates.searchForCandidates[0].Initials;
        this.newSession.Person.BirthDate = ITSInstance.candidates.searchForCandidates[0].BirthDate;
        this.newSession.Person.Sex = ITSInstance.candidates.searchForCandidates[0].Sex;
        //this.newSession.Person.Password = ITSInstance.candidates.searchForCandidates[0].Password;
        this.newSession.Person.Password = "";
        //this.newSession.AllowedStartDateTime = oldStart;
        //this.newSession.AllowedEndDateTime = oldEnd;
        DataBinderTo("AdminInterfaceSessionEditNew", this.newSession);
        $('#AdminInterfaceSessionNewWarningExistsLabel').show();
        $('#AdminInterfaceSessionNewSessionCandidatePasswordDiv').hide();
        this.existingUserFound = true;
    } else {
        // no match
        this.emailAddressChangedNotFound();
        $('#AdminInterfaceSessionNewWarningExistsLabel').hide();
        $('#AdminInterfaceSessionNewSessionCandidatePasswordDiv').show();
        this.existingUserFound = false;
    }
    // relink all sessiontests to the correct person id
    this.newSession.relinkToCurrentPersonID();
};

ITSInviteNewCandidateEditor.prototype.emailAddressChangedNotFound = function () {
    // generate a new guid for this.newSession.Person to make sure we save it as a new person instead of update an existing one
    this.newSession.Person.ID = newGuid();
    this.newSession.PersonID = this.newSession.Person.ID;
    this.newSession.Person.regeneratePassword();
    $('#AdminInterfaceSessionNewSessionCandidatePassword').val(this.newSession.Person.Password);
    // relink all sessiontests to the correct person id
    this.newSession.relinkToCurrentPersonID();
};

ITSInviteNewCandidateEditor.prototype.clearSession = function () {
    this.saveNewSession(this.clearSessionCallback.bind(this));
};

ITSInviteNewCandidateEditor.prototype.clearSessionCallback = function () {
    this.newSession = ITSInstance.candidateSessions.newCandidateSession();
    DataBinderTo("AdminInterfaceSessionEditNew", this.newSession);
    this.repopulateTestsLists();
    this.show();
};

ITSInviteNewCandidateEditor.prototype.deleteNewSession = function () {
    this.newSession.deleteSession(
        function () {
         this.clearSessionCallback();
         $('#AdminInterfaceSessionNewWarningExistsLabel').hide();
         $('#AdminInterfaceSessionNewSessionDeleteButton').hide();}.bind(this),
        function () {});

};

ITSInviteNewCandidateEditor.prototype.startNowSession = function () {
    this.existingUserFound = false; // always save the password
    this.newSession.Person.regeneratePassword();
    $('#AdminInterfaceSessionNewSessionCandidatePassword').val(this.newSession.Person.Password);
    this.saveNewSession(function () { setTimeout(this.startNowSessionCallback.bind(this),1000); } );
};

ITSInviteNewCandidateEditor.prototype.startNowSessionCallback = function () {
    // redirect to login screen
    ITSInstance.logoutController.logout("UserID=" + $('#AdminInterfaceSessionNewSessionCandidateFor').val() + "&Password=" + $('#AdminInterfaceSessionNewSessionCandidatePassword').val());
};

ITSInviteNewCandidateEditor.prototype.mailSessionInvitation = function () {
    ITSInstance.SessionMailerSessionController.currentSession = this.newSession;
    this.saveNewSession(function () {  ITSRedirectPath('SessionMailer', 'SessionID=' + this.newSession.ID + '&Template=defaultSession'); }.bind(this) );
};

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfaceNewSessionEditorDiv = $('<div class="container-fluid" id="AdminInterfaceSessionEditNew" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfaceNewSessionEditorDiv);
    $(AdminInterfaceNewSessionEditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionNewEditor/editor.html', function () {

        // register the editor
        ITSInstance.newCandidateSessionController = new ITSInviteNewCandidateEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.newCandidateSessionController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfaceSessionEditNew");

        // register the menu items
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#AdminInterfaceNewSessionEditorDiv.NewSessionMenu", ITSInstance.translator.translate("#AdminInterfaceNewSessionEditorDiv.NewSessionMenu", "New session"), "fa-thermometer-half", "ITSInstance.newCandidateSessionController.createNewSession(\'\'); ITSRedirectPath(\'NewSession\');");
            //ITSInstance.UIController.registerMenuItem('#submenuCandidatesLI', "#AdminInterfaceNewSessionEditorDiv.NewSessionMenu2", ITSInstance.translator.translate("#AdminInterfaceNewSessionEditorDiv.NewSessionMenu2", "New session"), "fa-thermometer-half", "ITSInstance.newCandidateSessionController.createNewSession(\'\'); ITSRedirectPath(\'NewSession\');");
        });
    })

})() //iife