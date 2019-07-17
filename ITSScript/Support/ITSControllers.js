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


// Password reset controller
ITSPasswordResetController = function () {};
ITSPasswordResetController.prototype.sendPasswordReset = function () {
    if ($('#ForgotWindowinputUsername').val().trim() == "") {
        ITSInstance.UIController.showError('ITSResetPassword.NoMail', 'Please enter a valid email address. If your login is NOT an email address contact your support person to reset it.');
    } else {
        tempHeaders = {};
        tempHeaders['Username'] = $('#ForgotWindowinputUsername').val();
        tempHeaders['BaseURL'] = ITSInstance.baseURL;
        tempHeaders['ITRLang'] = ITSLanguage;
        $.ajax({url: ITSInstance.baseURLAPI + 'sendresetpassword', headers: tempHeaders, type: 'POST'});
        //ITSRedirectPath('Login');
        ITSInstance.UIController.activateScreenPath('Login');
    }
};
ITSPasswordResetController.prototype.tryPasswordReset = function () {
    var newPW = $('#PasswordResetWindow1').val();
    var newPW2 = $('#PasswordResetWindow2').val();
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{10,})");

    if (newPW != newPW2) {
        ITSInstance.UIController.showError('ITSResetPasswordEditor.PasswordsNoMatch', 'The new password and the retyped new password do not match. Please type them again and make sure that the new passwords are the same.');
    } else
    if (!strongRegex.test(newPW)) {
        ITSInstance.UIController.showError('ITSResetPasswordEditor.PasswordTooShort', 'The new password is not good. The password needs to be at least 10 characters long and contain upper and lowercase letters, at least one digit and at least one special character.');
    } else {
        tempHeaders = {};
        tempHeaders['Username'] = $('#ForgotWindowinputUsernameReset').val();
        tempHeaders['Password'] = $('#PasswordResetWindow1').val();
        tempHeaders['BaseURL'] = ITSInstance.baseURL;
        tempHeaders['ITRLang'] = ITSLanguage;
        tempHeaders['SessionID'] = getUrlParameterValue('Token');
        $.ajax({url: ITSInstance.baseURLAPI + 'resetpassword', headers: tempHeaders, type: 'POST'});
        ITSRedirectPath('');
    }
};

// Login controller
// facilitates login to the back end and supply the login token
var redirectURLITSLoginController = '';
ITSLoginController = function () {
    this.changeLanguage = function(langCode) {
        ITSInstance.translator.switchLanguage(langCode, function () { ITSInstance.UIController.EnableLoginInterface(); ITSInstance.UIController.loadTranslationsDropDown(); }.bind(this) );
        ITSInstance.UIController.EnableLoginInterface();
    };
    this.login = function (userName, password) { // acquires a login token from the server.
        if ((userName != "") && (password!="")) {
            // clear the token and instance
            ITSInstance.token.set("empty");
            ITSInstance.users.resetCurrentUser();
            // block the interface
            ITSInstance.UIController.showInterfaceAsWaitingOn(250);
            // check the current URL, if it contains a Path parameter we need to try to redirect to this URL after login
            if (getUrlParameterValue('Path')) {
                redirectURLITSLoginController = document.URL;
            }
            // store the preferred language
            ITSInstance.translator.storeCurrentLanguageInCookie();
            // acquire the login token
            ITSInstance.xusername = userName;
            ITSInstance.xpassword = password;
            ITSInstance.token.acquire(userName, password, ITSInstance.loginController.loginOK, ITSInstance.loginController.loginError);
        } else {
            ITSInstance.UIController.showError('ITSTestTakingController.LoginError', 'Please enter a user name and password to login.')
        }
    };
    this.loginError = function () {
        console.log("loginError");
        // unblock the interface
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // show the error
        setTimeout(function() { ITSInstance.UIController.showError('ITSLoginController.LoginFailed','Login failed'); }, 1000);
    };
    this.loginOK = function () {
        console.log("loginOK " + ITSInstance.token.IssuedToken);
        // unblock the interface
        ITSInstance.UIController.showInterfaceAsWaitingOff();

        // check if there are multiple companies
        if ( ITSInstance.token.MultipleCompaniesFound == "N") {
            // show the correct interface and components
            ITSInstance.xusername = "";
            ITSInstance.xpassword = "";
            ITSInstance.loginController.activateCurrentUser(true);
        }
        else {
            ITSInstance.UIController.activateScreenPath('LoginCompanySelect');
        }
    };
    this.setCompanyID = function(companyID) {
        ITSInstance.token.MultipleCompaniesFound = "N";
        ITSInstance.token.companyID = companyID;
        $.ajax({
            url: ITSInstance.baseURLAPI + 'login',
            headers: { 'UserID': ITSInstance.xusername, 'Password': ITSInstance.xpassword,
                'SessionID' : ITSInstance.token.IssuedToken, 'CompanyID' : ITSInstance.token.companyID } ,
            type: 'GET',
            error: function () {
                console.log('Selecting company failed.');
            },
            success: function (data) {
                var checkLogin = JSON.parse(data);
                console.log(data, checkLogin);
                ITSInstance.token.set(checkLogin.SessionID);
                ITSInstance.loginController.loginOK();
            }
        });
    };
    this.activateCurrentUser = function (allowRedirect) {
        ITSInstance.users.loadCurrentUser(
            function () {
                if (ITSInstance.users.currentUser.IsTestTakingUser == true) {
                    // for test taking user : test taking
                    ITSInstance.UIController.prepareTestRunSession();
                    if (allowRedirect) { history.pushState('Switchboard', 'Switchboard', Global_OriginalURL + '?Path=TestTaking'); }
                }
                else {
                    // for office user : administration
                    ITSInstance.UIController.prepareOfficeSession();
                    if (allowRedirect) {
                        if (redirectURLITSLoginController == '') {
                            history.pushState('Switchboard', 'Switchboard', Global_OriginalURL + '?Path=Switchboard');
                        } else {
                            history.pushState('Switchboard', 'Switchboard', Global_OriginalURL + '?Path=Switchboard');
                            history.pushState('Redirect', 'Redirect', redirectURLITSLoginController);
                            document.location.href = redirectURLITSLoginController;
                        }
                    }
                }
            },
            function () {
                console.log('Loading current user failed. ');
            });
    }
};

ITSLogoutController = function () {
    this.logout = function (additionalParameters) {
        console.log("user logged out " + ITSInstance.users.currentUser.Email );
        ITSInstance.genericAjaxLoader('logout', '', '', function () {} , function () {}, undefined );
        ITSInstance.token.clear();
        ITSInstance.UIController.EnableLoginInterface();
        ITSInitSession();
        var length=history.length;
        history.go(-length);
        if (additionalParameters) {
            history.pushState('Login', 'Login', Global_OriginalURL + "?" + additionalParameters);
        } else {
            history.pushState('Login', 'Login', Global_OriginalURL);
        }
        location.reload(true);
    }
};

ITSInitializePortlets = function () {
    this.init = function () {
        //ITSInstance.portletSelectCompany.init();
        //ITSInstance.portletSelectSession.init();
        ITSInstance.UIController.initPortlets();
    }
};

ITSPortletSelectCompany = function () {
    this.init = function () {
        console.log ('Init portlet select company');
        ITSInstance.portletSelectCompany.objectsToShow.length =0;
        ITSInstance.genericAjaxLoader(
            'logins/currentuser/companies',
            ITSInstance.portletSelectCompany.objectsToShow,
            ITSInstance.portletSelectCompany.loadSuccess,
            ITSInstance.portletSelectCompany.loadError,
            ITSInstance.portletSelectCompany.newObject,
            -1,
            9999,
            'CompanyName',
            "N", "Y", "N"
        );
    };
    this.loadSuccess = function () {
        console.log('Companies loaded');
        $('#LoginWindowSelectCompanyTable tr').remove();
        for (i=0; i < ITSInstance.portletSelectCompany.objectsToShow.length; i++) {
            $('#LoginWindowSelectCompanyTable').append('<tr><td onclick="ITSInstance.loginController.setCompanyID(\''+ITSInstance.portletSelectCompany.objectsToShow[i].ID+'\');">' + ITSInstance.portletSelectCompany.objectsToShow[i].CompanyName + '</td></tr>');
            // CompanyName CompanyID
        }
    };
    this.loadError = function () {
        console.log('Loading available companies generated an error');
    };
    this.newObject = function () {
        newObj = {};
        ITSInstance.portletSelectCompany.objectsToShow[ITSInstance.portletSelectCompany.objectsToShow.length] = newObj;
        return newObj;
    };
    this.objectsToShow = [];
};

ITSPortletSelectSession = function () {
    this.init = function () {
        console.log ('Init portlet select session');
        ITSInstance.portletSelectSession.objectsToShow.length =0;
        ITSInstance.genericAjaxLoader(
            'sessions',
            ITSInstance.portletSelectSession.objectsToShow,
            ITSInstance.portletSelectSession.loadSuccess,
            ITSInstance.portletSelectSession.loadError,
            ITSInstance.portletSelectSession.newObject,
            -1,
            9999,
            'AllowedStartDateTime desc',"N","N","Y","Status=10,Status=20"
        );
    };
    this.loadSuccess = function () {
        console.log('Sessions loaded');
        $('#LoginWindowSelectSessionTable tr').remove();
        for (i=0; i < ITSInstance.portletSelectSession.objectsToShow.length; i++) {
            $('#LoginWindowSelectSessionTable').append('<tr><td onclick="ITSInstance.testTakingController.setSessionID(\''+ITSInstance.portletSelectSession.objectsToShow[i].ID+'\');">' + ITSInstance.portletSelectSession.objectsToShow[i].Description + '</td></tr>');
        }
    };
    this.loadError = function () {
        console.log('Loading available sessions generated an error');
    };
    this.newObject = function () {
        newObj = {};
        ITSInstance.portletSelectSession.objectsToShow[ITSInstance.portletSelectSession.objectsToShow.length] = newObj;
        return newObj;
    };
    this.objectsToShow = [];
};

ITSTestTakingController = function (parentInstance) {
    // test taking controller
    // functions :
    // - maintain test taking state
    // - save the state to the server
    // - load the state from the server in case of a restart
    // - load the session definition from the server
    // - construct the test screen that the candidate has to answer (and run scripting)

    // states : start test, resume test, end test, in test (with a specific screen)
    // phase per screen : prepare scripting, generate screen, validate screen before proceeding to next screen, post scripting
    //          during viewing : screen dynamics
    // support function in the TestTakingController :
    //  session : load, save, save intermediate
    //  test : load, save, save intermediate, calculate test
    //  screen : skip screen, show screen, jump to screen number, jump to screen name, next screen, previous screen
    //  question : skip question, show question, set question answer, get question answer

    this.myInstance = parentInstance;
    this.sessionList = {};
    this.currentSession = {};

};

ITSTestTakingController.prototype.startSession = function () {
    // block the interface
    ITSInstance.UIController.showInterfaceAsWaitingOn(1);

    // locate a test taking session for the current user
    // if there are multiple then let the user choose which session should be taken
    // if the user is also an office user then give the user the option to login to the office as well

    // load the session list for this user
    ITSInstance.JSONAjaxLoader('sessions', this.sessionList, this.sessionLoader.bind(this), this.sessionLoadingFailed.bind(this),
        'ITSCandidateSession', 0, 99999, "", "N", "N", "Y", "Status=10, Status=20, Active=True");
};

ITSTestTakingController.prototype.sessionLoader = function () {
    if (this.sessionList.length > 1) {
        // there is more than one session, candidate needs to choose which one...
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSRedirectPath('LoginSessionSelect');
    } else {
        // start this session now ...
        if (this.sessionList.length >0) {
            this.currentSession = new ITSCandidateSession(this, this.myInstance);
            this.currentSession.loadSession(this.sessionList[0].ID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this), true, true);
        } else {
            ITSInstance.UIController.showInterfaceAsWaitingOff();
            ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take.', '',
                'ITSInstance.logoutController.logout();');
            if (endTestFunction) endTestFunction();
        }
    }
};

ITSTestTakingController.prototype.sessionLoadingSucceeded = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    // the session, tests in the session and test/screens definitions have been loaded. We are ready to start.
    // locate first test that is not done. if test not started then start at screen 1, otherwise at the screen that is saved in the test.CurrentPage
    this.currentTestIndex = this.currentSession.firstTestToTake();
    if (this.currentTestIndex >= 0) {
        $('#LoginWindow').hide();
        $('#LoginWindowSelectSession').hide();
        $('#LoginWindowSelectCompany').hide();
        $('#NavbarsTestTaking').show();
        this.prepareTest(this.currentTestIndex);
        setTimeout(this.updateHeaders.bind(this), 200);

        // now render the current page and wait for the candidate to do something or a screen component to fire some event
        this.startTest();
        this.renderTestPage();
    } else {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take at this moment.','',
            'ITSInstance.logoutController.logout();');
        if (endTestFunction) endTestFunction();
    }
};

ITSTestTakingController.prototype.updateHeaders = function (index) {
    if (this.currentSession && this.currentSession.Person.createHailing() != "") {
        $('#welcomeUserNameTT').text(this.currentSession.Person.createHailing());
    } else {
        // no name available yet. try later
        setTimeout(this.updateHeaders.bind(this), 1001);
    }

    if (ITSInstance.companies.currentCompany) {
        $('#welcomeCompanyTT').text("("+ ITSInstance.companies.currentCompany.CompanyName+")");
    } else {
        // no name available yet. try later
        setTimeout(this.updateHeaders.bind(this), 1001);
    }
};

ITSTestTakingController.prototype.prepareTest = function (index) {
    this.currentTestIndex = index;
    this.currentSessionTest = this.currentSession.SessionTests[this.currentTestIndex];
    this.currentTestDefinition = this.currentSession.SessionTests[this.currentTestIndex].testDefinition;
    this.candidate = this.currentSession.Person;
};

ITSTestTakingController.prototype.sessionLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take.','',
        'ITSInstance.logoutController.logout();');
    if (endTestFunction) endTestFunction();
};

ITSTestTakingController.prototype.setSessionID = function (id) {
    // the candidate has selected the session
    ITSInstance.UIController.showInterfaceAsWaitingOn(100);
    this.currentSession = new ITSCandidateSession(this, this.myInstance);
    this.currentSession.loadSession(id, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this), true, true);
};

ITSTestTakingController.prototype.checkScreenDynamics = function (screenNotRenderedYet) {
    if (this.checkScreenDynamicsForChanges) {
        setTimeout(this.checkScreenDynamics.bind(this), 350);

        var currentScreen = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage];
        if (!screenNotRenderedYet) currentScreen.updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID);

        if (this.checkScreenDynamicsLastResultsChecked != JSON.stringify(this.currentSessionTest.Results)) {

            // change the Visible property for the screencomponents we can find
            var checkScreenDynamic = {};
            var sourceComponent = {};
            var targetComponent = {};
            var results = this.currentSessionTest.Results;
            var updateCompIonent = {};
            for (var j=0; j < currentScreen.screenDynamics.length; j++) {
                checkScreenDynamic = currentScreen.screenDynamics[j];
                try {
                    sourceComponent = results[ "__" + checkScreenDynamic.sourceScreenID];
                    sourceComponent = sourceComponent[ "__" + checkScreenDynamic.sourceVariableID ];
                    targetComponent = results[ "__" + checkScreenDynamic.targetScreenID];
                    targetComponent = targetComponent[ "__" + checkScreenDynamic.targetVariableID ];
                    if (String(sourceComponent.Value) == String(checkScreenDynamic.sourceValue)) {
                        if (checkScreenDynamic.targetScript != "") {
                            eval("var func = function(sourceComponent, targetComponent, checkScreenDynamic, session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + checkScreenDynamic.targetScript + " }; ");
                            func(sourceComponent, targetComponent, checkScreenDynamic, this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, this.currentSessionTest.CurrentPage );
                        } else {
                            targetComponent.Visible = checkScreenDynamic.targetVisible;
                        }
                        // if this component is in the current screen set the visible value
                        updateComponent = currentScreen.findComponentByID(checkScreenDynamic.targetVariableID);
                        if (updateComponent) {
                            updateComponent.show = checkScreenDynamic.targetVisible;
                        }
                    }
                } catch (err) { console.log("Setting screen dynamics failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + "," + j + ")"  + err); }
            }

            $('#ITSTestTakingDiv').empty();
            currentScreen.generateScreenInDiv('ITSTestTakingDiv', 'TT', this.generateScreenID);
            currentScreen.updateDivsFromResultStorage(this.currentSessionTest.Results, this.generateScreenID);

            this.checkScreenDynamicsLastResultsChecked = JSON.stringify(this.currentSessionTest.Results);
        }
    }
};

ITSTestTakingController.prototype.renderTestPage = function () {
    // this.currentSessionTest.CurrentPage
    // do we need to show this page? If not show the next page
    // is this page beyond the last page of the test? end the test
    $('#ITSTestTakingDiv').empty();
    $('#ITSTestTakingDiv').show();
    $('#ITSTestTakingDivTestEnded').hide();
    this.checkScreenDynamicsForChanges = false; // disable screen dynamics checking
    this.checkScreenDynamicsLastResultsChecked = "";

    if (this.currentSessionTest.CurrentPage >= this.currentTestDefinition.screens.length  ) {
        setTimeout(this.endTest.bind(this),100);
    } else {
        if (this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].show) {
            this.generateScreenID = "__" + newGuid();
            var currentScreen = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage];
            // now run the pre screen script and register that we need to run the post screen script
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + currentScreen.beforeScreenScript + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, this.currentSessionTest.CurrentPage );
            } catch (err) { console.log("Screen pre script failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + ")"  + err);  }
            this.screenNeedsFinalisation = true;
            // check if this screen has screen dynamics
            this.checkScreenDynamicsForChanges = currentScreen.screenDynamics.length > 0;
            if (this.checkScreenDynamicsForChanges) {
                this.checkScreenDynamics(true);
            } else {
                currentScreen.generateScreenInDiv('ITSTestTakingDiv', 'TT', this.generateScreenID);
                // load the current present values from the currentSessionTest.results into the screen
                currentScreen.updateDivsFromResultStorage(this.currentSessionTest.Results, this.generateScreenID);
            }
        } else {
            this.currentSessionTest.CurrentPage++;
            this.renderTestPage();
        }
    }
};

ITSTestTakingController.prototype.startTest = function () {
    if (this.currentSessionTest.Status == 10) {
        // init the session test information
        this.currentSessionTest.Results.testTimeLeft = this.currentTestDefinition.TotalTimeAvailableForThisTest; // in seconds
        this.currentSessionTest.TestStart = Date.now();
    }
    // prepare the test object structure
    this.currentSessionTest.prepareTestStorage();
    this.currentSessionTest.updateConsentSettings();
    // eval the pre test script.
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.BeforeScript + " }; ");
        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance );
    } catch (err) { console.log("Test pre script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
    // for 360 start the 360 testing
    if (this.currentTestDefinition.Supports360Degrees) {
        if (this.currentSession.Status == 10) {
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.Pre360 + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance );
            } catch (err) { console.log("Session Pre360 script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
            this.currentSession.StartedAt = new Date();
        }
        try {
            eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.Per360 + " }; ");
            func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance );
        } catch (err) { console.log("Test Per360 script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
    }
    // make sure the test session is started
    this.currentSession.Status = 20;
    this.currentSession.SessionState = "In progress";
    this.currentSessionTest.Status = 20;
    // set the session start date time if not done yet
    if (this.currentSession.StartedAt < new Date(2001,2,2)) {
        this.currentSession.StartedAt = new Date.now();
    }
    this.saveSession();
    this.currentSession.Person.DateOfLastTest = Date.now();
    this.currentSession.Person.saveToServer(function(){},function(){});
    this.saveCurrentTest();
};

ITSTestTakingController.prototype.endTest = function (forcedEnding) {
    // ShowTestClosureScreen
    // this.currentTestDefinition.PostTestScript
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.AfterScript + " }; ");
        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance );
    } catch (err) { console.log("Test post script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
    this.currentSessionTest.Status = 30;
    this.currentSessionTest.TestEnd = Date.now();
    this.saveCurrentTest();

    $('#ITSTestTakingDiv').empty();

    var nextTestIndex = this.currentSession.firstTestToTake();
    if (this.currentTestDefinition.ShowTestClosureScreen && nextTestIndex > -1 ) {
        // show the test closure screen, unless there are no more tests to take
        this.currentTestIndex = nextTestIndex;
        $('#ITSTestTakingDiv').hide();
        $('#ITSTestTakingDivTestEnded').show();
        if (ITREndTestFunction) ITREndTestFunction();
        if (window.parent) window.parent.postMessage("ITREndTestFunction", this.currentSession, "*")
    } else {
        if (nextTestIndex > -1) {
            this.nextTest(nextTestIndex);
        } else {
            setTimeout(this.endSession.bind(this),100);
        }
    }
};

ITSTestTakingController.prototype.nextTest = function (nextTest) {
    if (!nextTest) {
        nextTest = this.currentTestIndex;
    }
    this.prepareTest(nextTest);
    this.startTest();
    this.renderTestPage();
};

ITSTestTakingController.prototype.endSession = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOn(100);
    this.currentSessionTestID = this.currentSessionTest.ID;
    if (this.currentSessionTest.Status != 30) {
        setTimeout(this.endTest.bind(this, false),100);
    }
    // refresh session
    setTimeout(function () { this.currentSession.loadSession(this.currentSession.ID, this.endSessionChecker.bind(this), this.endSessionChecker.bind(this), true, true); }.bind(this) ,100);
};

ITSTestTakingController.prototype.endSessionChecker = function () {
    // check if there are no more tests to take
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    this.currentTestIndex = this.currentSession.firstTestToTake(this.currentSessionTestID );
    if (this.currentTestIndex >= 0) {
        this.sessionLoadingSucceeded();
    } else {
        if (this.currentTestDefinition.Supports360Degrees) {
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.Post360 + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance);
            } catch (err) {
                console.log("Session post360 script failed for " + this.currentTestDefinition.TestName + " " + err);
            }
        }
        if (this.currentTestIndex == -1) {
            this.currentSession.Status = 30;
            this.currentSession.SessionState = "Done";
            this.currentSession.EndedAt = Date.now();
        }
        this.saveSession();

        // show session ended screen to allow the system to store all data and handle possible retries
        $('#ITSTestTakingDiv').hide();
        $('#ITSTestTakingDivSessionEnded').show();
        $('#NavbarsAdminLogoutButtonTT').hide();
        setTimeout(function () {
            ITSInstance.logoutController.logout();
        }, 60000);

        // show a message when the test time has ended
        if (this.currentSession.EnforceSessionEndDateTime) {
            var checkDate = new Date();
            this.currentSession.parseDates();
            if (checkDate > this.currentSession.AllowedEndDateTime) {
                ITSInstance.UIController.showWarning('ITSControllers.TestTaking','The session has ended because the allowed end date and time of the session has passed.');
            }
        }
    }
};

function processEvent (eventName, eventParameters) {
    if ( (!ITSInstance.testTakingController.currentSessionTest) && (eventName == "AutoStore")) {
        // auto store call from outside the test taking controller, process if setup properly
        ITSInstance.testTakingController.autoStore(false);
    } else {
        ITSInstance.testTakingController.processEvent(eventName, eventParameters);
    }
};

ITSTestTakingController.prototype.autoStore = function (InTestTaking) {
    if (!this.AutoStoreLastTimestamp) { this.AutoStoreLastTimestamp = new Date(2000,1,1,1,1,1,1); }
    var dateNow = new Date();
    if ((Math.abs(dateNow.getTime() - this.AutoStoreLastTimestamp.getTime()) ) > 60000) {
        this.AutoStoreLastTimestamp = new Date();
        if (InTestTaking) {
            this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID);
            this.saveCurrentTest();
        } else {
            if (this.autoStoreSessionTest) {
                this.autoStoreSessionTest();
            }
        }
    }
};

ITSTestTakingController.prototype.processEvent = function (eventName, eventParameters) {
    // supported events and parameters :
    //  EndTest
    //  EndTestTimeOut - the test is ended because a timer ended the test. No validations will be performed
    //  EndSession
    //  NextScreen
    //  PreviousScreen
    //  GotoScreen (eventParameter = Screen number)
    //  Logout - the user wants to logout. No screen validation is performed.
    //  CheckSessionTime
    //  NOTE : before switching screens with ANY event the current screen is validated first, unless otherwise noted in the event list above

    // save the results from the current screen into the Results object if the current session test
    if (this.currentTestDefinition && this.currentSessionTest) {
        // save the results
        this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID);
        if ((eventName!="Store") && (eventName != "AutoStore")) {
            // check the screen validations
            var validationMessage = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].checkValidations(this.currentSessionTest.Results, "", this.generateScreenID);
            if ( (validationMessage != '') && (eventName != 'EndTestTimeOut') && (eventName != 'Logout')  && (eventName != 'PreviousScreen') ) {
                if (!this.suppressWarnings) ITSInstance.UIController.showError('',validationMessage);
                eventName = "";
            } else {
                // run the screen post script
                if (this.screenNeedsFinalisation) {
                    this.screenNeedsFinalisation = false;
                    try {
                        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance) { " + this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].afterScreenScript + " }; ");
                        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, this.currentSessionTest.CurrentPage );
                    } catch (err) { console.log("Screen post script failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + ")"  + err);  }
                }
            }
        }
    }

    // check for session end date time
    if (this.currentSession.EnforceSessionEndDateTime) {
        var checkDate = new Date();
        this.currentSession.parseDates();
        if (checkDate > this.currentSession.AllowedEndDateTime) {
            eventName = 'EndSession';
            this.suppressWarnings = true;
        }
    }

    // process the message
    switch(eventName) {
        case "Store" :
            // results are only stored. do nothing else
            this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID);
            this.saveCurrentTest();
            break;
        case "AutoStore" :
            // results are only stored, but at max once per minute
            this.autoStore(true); // this is a global function since it can also be called from editors
            break;
        case "EndTest" :
            setTimeout(this.endTest.bind(this, false),100);
            break;
        case "EndTestTimeOut" :
            setTimeout(this.endTest.bind(this, true),100);
            break;
        case "EndSession" :
            this.endSession();
            break;
        case "NextScreen" :
            this.currentSessionTest.CurrentPage++;
            this.saveCurrentTest();
            setTimeout(this.renderTestPage.bind(this),100);
            break;
        case "PreviousScreen" :
            var oldCurrentPage = this.currentSessionTest.CurrentPage;
            if (this.currentSessionTest.CurrentPage > 0) { this.currentSessionTest.CurrentPage--; }
            while ( (! this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].show) && this.currentSessionTest.CurrentPage > 0 ) {
                this.currentSessionTest.CurrentPage--;
            }
            if (! this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].show) {
                this.currentSessionTest.CurrentPage = oldCurrentPage;
            }
            this.saveCurrentTest();
            this.renderTestPage();
            break;
        case "GotoScreen" :
            try {
                this.currentSessionTest.CurrentPage = parseInt( eventParameters);
            } catch (err) { console.log("Setting currentpage failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + ")"  + err);  }
            this.saveCurrentTest();
            this.renderTestPage();
            break;
        case "Logout" :
            this.saveSession();
            this.saveCurrentTest();
            ITSInstance.logoutController.logout();
            break;
        case "CheckSessionTime" :
            // no action needed already done
            break;
        default :
            if (eventName != '') console.log("processEvent UNKNOWN event found : " + eventName + " " + eventParameters);
            break;
    }
};

ITSTestTakingController.prototype.saveSession = function () {
    // when the save fails retry 3 times and then inform the user
    var sessionPostObject = {};
    sessionPostObject.session = this.currentSession;
    sessionPostObject.numberOfRetries = 3;
    this.saveSessionRetry(sessionPostObject);
};

ITSTestTakingController.prototype.saveSessionRetry = function (sessionPostObject) {
    if (this.saveCurrentTestObjectBusy) {
        // we are still waiting for the test information to be saved. Retry later.
        setTimeout(this.saveSessionRetry.bind(this, sessionPostObject), 100);
    } else {
       if (sessionPostObject.numberOfRetries > 0) {
            sessionPostObject.numberOfRetries--;
            sessionPostObject.session.saveToServer(function () {
            }, this.saveSessionRetry.bind(this, sessionPostObject));
        } else {
            ITSInstance.UIController.showError('ITSTestTakingController.SaveSessionFailed', 'Saving the session failed. The server may be down or unavailable. You may continue the test but the results may not be stored. If you see this error again then please close your browser and try again.');
        }
    }
};

ITSTestTakingController.prototype.saveCurrentTest = function () {
    // when the save fails retry 3 times and then inform the user
    var sessionPostObject = {};
    this.currentSessionTest.calcTotalPages();
    sessionPostObject.sessionTest = this.currentSessionTest;
    sessionPostObject.numberOfRetries = 3;
    if (this.saveCurrentTestObjectBusy) {
        this.saveCurrentTestObjectBacklog = {} ;
        this.saveCurrentTestObjectBacklog[this.currentSessionTest.ID] = sessionPostObject;
        //console.log(sessionPostObject);
    } else {
        this.saveCurrentTestRetry(sessionPostObject);
    }
};

ITSTestTakingController.prototype.saveCurrentTestRetry = function (sessionPostObject) {
    this.saveCurrentTestObjectBusy = true;
    if (sessionPostObject.numberOfRetries > 0) {
        sessionPostObject.numberOfRetries --;
        sessionPostObject.sessionTest.saveToServer(this.saveCurrentTestPickupNext.bind(this), this.saveCurrentTestRetry.bind(this, sessionPostObject), true);
    } else {
        this.saveCurrentTestObjectBusy = false;
        ITSInstance.UIController.showError('ITSTestTakingController.SaveCurrentTestFailed', 'Saving the test failed. The server may be down or unavailable. You may continue the test but the results may not be stored. If you see this error again then please close your browser and try again.');
    }
};

ITSTestTakingController.prototype.saveCurrentTestPickupNext = function () {
    this.saveCurrentTestObjectBusy = false;
    if (this.saveCurrentTestObjectBacklog != undefined) {
        // and now start the save for any test posts that were there (multiple if for multiple tests)
        for (st in this.saveCurrentTestObjectBacklog) {
            //console.log(this.saveCurrentTestObjectBacklog[st]);
            this.saveCurrentTestRetry(this.saveCurrentTestObjectBacklog[st]);
        }
        this.saveCurrentTestObjectBacklog = undefined;
    }
};