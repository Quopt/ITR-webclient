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


// Password reset controller
ITSPasswordResetController = function () {};
ITSPasswordResetController.prototype.sendPasswordReset = function (showMessage) {
    if ($('#ForgotWindowinputUsername').val().trim() == "") {
        ITSInstance.UIController.showError('ITSResetPassword.NoMail', 'Please enter a valid email address. If your login is NOT an email address contact your support person to reset it.');
    } else {
        tempHeaders = {};
        tempHeaders['Username'] = $('#ForgotWindowinputUsername').val();
        tempHeaders['BaseURL'] = ITSInstance.baseURL;
        tempHeaders['ITRLang'] = ITSLanguage;
        tempHeaders['BrowserID'] =  ITSInstance.BrowserID;
        $.ajax({url: ITSInstance.baseURLAPI + 'sendresetpassword', headers: tempHeaders, type: 'POST'});
        //ITSRedirectPath('Login');
        ITSInstance.UIController.activateScreenPath('Login');
        ITSInstance.UIController.showInfo('ITSResetPasswordEditor.MailOK', 'The e-mail has been sent.', '', 'location.reload();');
    }
};
ITSPasswordResetController.prototype.tryPasswordReset = function (showMessage) {
    // make sure to translate the messages from the sendPasswordReset function otherwise they are not translatable ever
    ITSInstance.translator.getTranslatedString('infoMessages', 'ITSResetPasswordEditor.MailOK', 'The e-mail has been sent.');
    ITSInstance.translator.getTranslatedString('infoMessages', 'ITSResetPassword.NoMail', 'Please enter a valid email address. If your login is NOT an email address contact your support person to reset it.');
    // continue normal function
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
        tempHeaders['BrowserID'] =  ITSInstance.BrowserID;
        tempHeaders['SessionID'] = getUrlParameterValue('Token');
        $.ajax({url: ITSInstance.baseURLAPI + 'resetpassword', headers: tempHeaders, type: 'POST'});
        ITSRedirectPath('');
        ITSInstance.UIController.showInfo('ITSResetPasswordEditor.PasswordReset', 'The password has been changed.', '', 'location.reload();');
    }
};

// Login controller
// facilitates login to the back end and supply the login token
var redirectURLITSLoginController = '';
ITSLoginController = function () {
    this.changeLanguage = function(langCode) {
        ITSInstance.translator.switchLanguage(langCode, function () {
            ITSInstance.UIController.EnableLoginInterface();
        }.bind(this) );
    };
    this.login = function (userName, password) { // acquires a login token from the server.
        if ( ((userName != "") && (password!="")) || (getUrlParameterValue('Poll') != "")) {
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
        ITSLogger.logMessage(logLevel.ERROR,"loginError");
        // unblock the interface
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // show the error
        setTimeout(function() { ITSInstance.UIController.showError('ITSLoginController.LoginFailed','Login failed'); }, 1000);
    };
    this.loginOK = function () {
        ITSLogger.logMessage(logLevel.INFO,"loginOK " + ITSInstance.token.IssuedToken);
        // unblock the interface
        ITSInstance.UIController.showInterfaceAsWaitingOff();

        // check if there are multiple companies
        if (ITSInstance.token.MultipleCompaniesFound == "N") {
            if  (ITSInstance.token.MFAStatus == "QR") {
                // MFA is enabled and this is the first time the user logs in
                ITSInstance.UIController.activateScreenPath('MfaQrCodeSetup');
            } else if (ITSInstance.token.MFAStatus == "CODE") {
                // MFA is enabled and the user needs to enter a time based code
                ITSInstance.UIController.activateScreenPath('MfaEnterCode');
            } else {
                // show the correct interface and components
                ITSInstance.xusername = "";
                ITSInstance.xpassword = "";
                ITSInstance.loginController.activateCurrentUser(true);
            }
        }
        else {
            ITSInstance.MultipleCompaniesFound = true;
            ITSInstance.UIController.activateScreenPath('LoginCompanySelect');
        }
    };
    this.setCompanyID = function(companyID) {
        ITSInstance.token.MultipleCompaniesFound = "N";
        ITSInstance.token.companyID = companyID;
        $.ajax({
            url: ITSInstance.baseURLAPI + 'login',
            headers: { 'UserID': ITSInstance.xusername, 'Password': ITSInstance.xpassword,
                'SessionID' : ITSInstance.token.IssuedToken, 'CompanyID' : ITSInstance.token.companyID, 'BrowserID': ITSInstance.BrowserID } ,
            type: 'GET',
            error: function () {
                ITSLogger.logMessage(logLevel.ERROR,'Selecting company failed.');
            },
            success: function (data) {
                var checkLogin = JSON.parse(data);
                if (checkLogin.MFAStatus == "QR") {
                    // MFA is enabled and this is the first time the user logs in
                    ITSInstance.UIController.activateScreenPath('MfaQrCodeSetup');
                } else if (checkLogin.MFAStatus == "CODE") {
                    // MFA is enabled and the user needs to enter a time based code
                    ITSInstance.UIController.activateScreenPath('MfaEnterCode');
                } else {
                    //ITSLogger.logMessage(logLevel.ERROR,data, checkLogin);
                    ITSInstance.token.set(checkLogin.SessionID);
                    ITSInstance.loginController.loginOK();
                }
            }
        });
    };
    this.getQRCode = function() {
        $.ajax({
            url: ITSInstance.baseURLAPI + 'login/qrcode',
            headers: {
                'UserID': ITSInstance.xusername,
                'Password': ITSInstance.xpassword,
                'CompanyID' : ITSInstance.token.companyID,
                'BrowserID': ITSInstance.BrowserID } ,
            type: 'GET',
            error: function () {
                ITSLogger.logMessage(logLevel.ERROR,'Getting QR code failed.');
            },
            success: function (data) {
                var qr = new QRious({
                    element: document.getElementById('LoginWindowMfaQRSetupImage'),
                    value: data
                });
            }
        });
    };
    this.validateMFACode = function () {
        ITSInstance.token.MFAStatus = "";
        $.ajax({
            url: ITSInstance.baseURLAPI + 'login/mfacode',
            headers: {
                'UserID': ITSInstance.xusername,
                'Password': ITSInstance.xpassword,
                'CompanyID' : ITSInstance.token.companyID,
                'BrowserID': ITSInstance.BrowserID,
                'MFACode' : $('#LoginWindowEnterMfaCodeValue').val()
            } ,
            type: 'POST',
            error: function () {
                ITSInstance.UIController.showError('ITSTestTakingController.LoadingMFATokenFailed', 'The token is not valid. Please try again.');
            },
            success: function (data) {
                var checkLogin = JSON.parse(data);
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
                ITSLogger.logMessage(logLevel.ERROR,'Loading current user failed. ');
            });
    }
};

ITSLogoutController = function () {
    this.logout = function (additionalParameters, redirectAfterLogout) {
        if (typeof redirectAfterLogout == "undefined") redirectAfterLogout = true;

        ITSLogger.logMessage(logLevel.INFO,"user logged out " + ITSInstance.users.currentUser.Email );
        ITSInstance.genericAjaxUpdate('logout', '', function () {}, function () {} , function () {}, undefined );
        ITSInstance.token.clear();
        var returnURL = cookieHelper.getCookie('ReturnURL');
        cookieHelper.setCookie('NoTTHeader', '', 1);
        cookieHelper.setCookie('Coupon', '', 1);
        cookieHelper.setCookie('SessionID', '', 1);
        var n = sessionStorage.length;
        while(n--) {
            var key = sessionStorage.key(n);
            sessionStorage.removeItem(key);
        }

        var length=history.length;
        history.go(-length);

        if (redirectAfterLogout) {
            cookieHelper.setCookie('ReturnURL', '', 1);

            ITSInstance.UIController.EnableLoginInterface();

            if (additionalParameters) {
                history.pushState('Login', 'Login', Global_OriginalURL + "?" + additionalParameters);
            } else {
                history.pushState('Login', 'Login', Global_OriginalURL);
            }

            if (returnURL.trim() == "") {
                setTimeout(function () {
                    ITSInitSession();
                    location.reload(true);
                }, 1000);
            } else {
                window.location.replace(returnURL);
            }
        }
    }
};

ITSInitializePortlets = function () {
    this.init = function () {
        ITSInstance.UIController.initPortlets();
    }
};

ITSPortletSelectCompany = function () {
    this.init = function () {
        ITSLogger.logMessage(logLevel.INFO,'Init portlet select company');
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
        ITSLogger.logMessage(logLevel.INFO,'Companies loaded');
        $('#LoginWindowSelectCompanyTable tr').remove();
        for (i=0; i < ITSInstance.portletSelectCompany.objectsToShow.length; i++) {
            $('#LoginWindowSelectCompanyTable').append('<tr><td onclick="ITSInstance.loginController.setCompanyID(\''+ITSInstance.portletSelectCompany.objectsToShow[i].ID+'\');">' + ITSInstance.portletSelectCompany.objectsToShow[i].CompanyName + '</td></tr>');
            // CompanyName CompanyID
        }
    };
    this.loadError = function () {
        ITSLogger.logMessage(logLevel.ERROR,'Loading available companies generated an error');
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
        ITSLogger.logMessage(logLevel.INFO,'Init portlet select session');
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
        ITSLogger.logMessage(logLevel.INFO,'Sessions loaded');
        $('#LoginWindowSelectSessionTable tr').remove();
        for (i=0; i < ITSInstance.portletSelectSession.objectsToShow.length; i++) {
            $('#LoginWindowSelectSessionTable').append('<tr><td onclick="ITSInstance.testTakingController.setSessionID(\''+ITSInstance.portletSelectSession.objectsToShow[i].ID+'\');">' + ITSInstance.portletSelectSession.objectsToShow[i].Description + '</td></tr>');
        }
    };
    this.loadError = function () {
        ITSLogger.logMessage(logLevel.ERROR,'Loading available sessions generated an error');
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
    this.InTestTaking = false;
};

ITSTestTakingController.prototype.startSession = function () {
    // block the interface
    ITSInstance.UIController.showInterfaceAsWaitingOn(1);

    // locate a test taking session for the current user
    // if there are multiple then let the user choose which session should be taken
    // if the user is also an office user then give the user the option to login to the office as well

    // load the session list for this user
    if (cookieHelper.getCookie('SessionID').trim() != ''){
        ITSInstance.JSONAjaxLoader('sessions', this.sessionList, this.sessionLoader.bind(this), this.sessionLoadingFailed.bind(this),
            'ITSCandidateSession', 0, 99999, "", "N", "N", "Y", "Status=10, Status=20, Active=True, ID="+cookieHelper.getCookie('SessionID').trim());
    } else {
        ITSInstance.JSONAjaxLoader('sessions', this.sessionList, this.sessionLoader.bind(this), this.sessionLoadingFailed.bind(this),
            'ITSCandidateSession', 0, 99999, "", "N", "N", "Y", "Status=10, Status=20, SessionType!=1, Active=True");
    }
};

ITSTestTakingController.prototype.sessionLoader = function () {
    if (this.sessionList.length > 1) {
        // there is more than one session, candidate needs to choose which one...
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.MultipleSessionsFound = true;
        ITSRedirectPath('LoginSessionSelect');
    } else {
        // start this session now ...
        if (this.sessionList.length >0) {
            this.currentSession = new ITSCandidateSession(this, this.myInstance);
            cookieHelper.setCookie('SessionID',this.sessionList[0].ID,9);
            this.currentSession.loadSession(this.sessionList[0].ID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this), true, true);
        } else {
            if (cookieHelper.getCookie('SessionID').trim() != '') {
                cookieHelper.setCookie('SessionID','',1);
                this.startSession();
            } else {
                ITSInstance.UIController.showInterfaceAsWaitingOff();
                ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take.', '',
                    'ITSInstance.logoutController.logout();');
                if (typeof endTestFunction !== "undefined") endTestFunction();
            }
        }
    }
};

ITSTestTakingController.prototype.switchNavBar = function () {
    if (this.currentSession.SessionType == "1") {
        $('#NavbarsTestTaking').hide();
        $('#ITSTestTakingDiv').css("top","20px");
        $('#ITSTestTakingDiv').css("position","absolute");
        if (! this.cookieNavBarSet) {
            cookieHelper.setCookie('NoTTHeader', 'Y', 600);
            this.cookieNavBarSet = true;
        }
    } else {
        if (this.InTestTaking) $('#NavbarsTestTaking').show();
    }
    cookieHelper.setCookie('SessionID',this.currentSession.ID,9);
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
        $('#NavbarsAdminLoginBlockTTMenuIcon').hide();

        this.switchNavBar();
        this.prepareTest(this.currentTestIndex);
        setTimeout(this.updateHeaders.bind(this), 200);

        // if there is a coupon the user wants to redeem then save it now
        if (cookieHelper.getCookie('Coupon').trim() != '') {
            if (typeof this.currentSession.PluginData == "undefined") {
                this.currentSession.PluginData = {};
            }
            if (typeof this.currentSession.PluginData.CandidateParameters == "undefined") {
                this.currentSession.PluginData.CandidateParameters = {};
            }
            this.currentSession.PluginData.CandidateParameters.Coupon = cookieHelper.getCookie('Coupon');
        }
        // now render the current page and wait for the candidate to do something or a screen component to fire some event
        this.startTest();
        this.renderTestPage();
    } else {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take at this moment.','',
            'ITSInstance.logoutController.logout();');
        if (typeof endTestFunction !== "undefined") endTestFunction();
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
    this.currentTestDefinition.expandLayoutsFromPreviousScreens();
};

ITSTestTakingController.prototype.sessionLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError('ITSTestTakingController.LoadingSessionFailed', 'There are no tests in the session for you to take.','',
        'ITSInstance.logoutController.logout();');
    if (typeof endTestFunction !== "undefined") endTestFunction();
};

ITSTestTakingController.prototype.setSessionID = function (id) {
    // the candidate has selected the session
    ITSInstance.UIController.showInterfaceAsWaitingOn(100);
    this.currentSession = new ITSCandidateSession(this, this.myInstance);
    ITSInstance.UIController.EnableTestTakingInterface();
    this.InTestTaking = true;
    this.currentSession.loadSession(id, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this), true, true);
};

ITSTestTakingController.prototype.checkScreenDynamics = function (screenNotRenderedYet) {
    var visibilityState = "";
    if (this.checkScreenDynamicsForChanges) {
        setTimeout(this.checkScreenDynamics.bind(this), 350);

        var currentScreen = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage];
        if (!screenNotRenderedYet) this.saveSessionNeeded = currentScreen.updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID, false, this.currentSession.PluginData, this.currentSession.SessionType==1);

        // get the visibility status of the current screen components
        visibilityState = currentScreen.getVisibilityStatusAsString();
        if (this.checkScreenDynamicsLastResultsChecked != JSON.stringify(this.currentSessionTest.Results)) {
            // change the Visible property for the screencomponents we can find
            var checkScreenDynamic = {};
            var sourceComponent = {};
            var targetComponentScreen = {};
            var targetComponent = {};
            var results = this.currentSessionTest.Results;
            var updateComponent = {};
            for (var j=0; j < currentScreen.screenDynamics.length; j++) {
                checkScreenDynamic = currentScreen.screenDynamics[j];
                try {
                    sourceComponent = results[ "__" + checkScreenDynamic.sourceScreenID];
                    sourceComponent = sourceComponent[ "__" + checkScreenDynamic.sourceVariableID ];
                    targetComponentScreen = results[ "__" + checkScreenDynamic.targetScreenID];
                    targetComponent = "";
                    if (checkScreenDynamic.targetVariableID != "") {
                        targetComponent = targetComponentScreen["__" + checkScreenDynamic.targetVariableID];
                    }
                    var comp = false;
                    if (checkScreenDynamic.comparison == "=") { checkScreenDynamic.comparison = "==";}
                    try {
                        comp = eval("sourceComponent.Value " + checkScreenDynamic.comparison + " checkScreenDynamic.sourceValue");
                    } catch(err) {
                        ITSLogger.logMessage(logLevel.ERROR,"Evaluating rule failed for  "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + "," + j + ")"  + err);
                        ITSLogger.logMessage(logLevel.ERROR,""+ sourceComponent.Value + checkScreenDynamic.comparison + checkScreenDynamic.sourceValue + "=" + comp);
                    }
                    //ITSLogger.logMessage(logLevel.ERROR,""+ sourceComponent.Value + checkScreenDynamic.comparison + checkScreenDynamic.sourceValue + "=" + comp);
                    if (comp) {
                        if (checkScreenDynamic.targetScript != "") {
                            try {
                                eval("var func = function(sourceComponent, targetComponent, checkScreenDynamic, session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + checkScreenDynamic.targetScript + " }; ");
                                func(sourceComponent, targetComponent, checkScreenDynamic, this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, this.currentSessionTest.CurrentPage, "TT" );
                            } catch(err) {
                                ITSLogger.logMessage(logLevel.ERROR,"Evaluating targetscript failed for  "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + "," + j + ")"  + err);
                            }
                        } else {
                            if (targetComponent != "") {
                                targetComponent.Visible = checkScreenDynamic.targetVisible;
                            } else {
                                try {
                                    this.currentTestDefinition.findScreenByID(checkScreenDynamic.targetScreenID).show = checkScreenDynamic.targetVisible;
                                } catch (err) {
                                    ITSLogger.logMessage(logLevel.ERROR,"Screen dynamics settings screen visibility failed for  "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + "," + j + ")"  + err);
                                }
                            }
                        }
                        // if this component is in the current screen set the visible value
                        updateComponent = currentScreen.findComponentByID(checkScreenDynamic.targetVariableID);
                        if (updateComponent) {
                            updateComponent.show = checkScreenDynamic.targetVisible;
                        }
                    }
                } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Setting screen dynamics failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + "," + j + ")"  + err); }
            }

            if (visibilityState != currentScreen.getVisibilityStatusAsString() || screenNotRenderedYet) { // some visibility state has changed for a component, rerender the screen
                //ITSLogger.logMessage(logLevel.ERROR,"Re-render");
                $('#ITSTestTakingDiv').empty();
                currentScreen.generateScreenInDiv('ITSTestTakingDiv', 'TT', this.generateScreenID);
                currentScreen.updateDivsFromResultStorage(this.currentSessionTest.Results, this.generateScreenID, this.currentSession.PluginData, sessionStorage.getItem("Poll") != null); //this.currentSession.SessionType==1);
            }

            this.checkScreenDynamicsLastResultsChecked = JSON.stringify(this.currentSessionTest.Results);
        }
    }
};

ITSTestTakingController.prototype.renderTestPage = function (rerender) {
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
            //ITSLogger.logMessage(logLevel.ERROR,this.generateScreenID);
            var currentScreen = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage];
            // now run the pre screen script and register that we need to run the post screen script
            this.screenNeedsFinalisation = true;
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode, screen) { " + currentScreen.beforeScreenScript + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT", this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage] );
            } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Screen pre script failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + ")"  + err);  }
            // check if we still need to show this screen after running the pre-screen script
            if (this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].show) {
                // check if this screen has screen dynamics
                this.checkScreenDynamicsForChanges = currentScreen.screenDynamics.length > 0;
                if (this.checkScreenDynamicsForChanges) {
                    this.checkScreenDynamics(true);
                } else {
                    currentScreen.reRender = (rerender == true);
                    currentScreen.generateScreenInDiv('ITSTestTakingDiv', 'TT', this.generateScreenID);
                    // load the current present values from the currentSessionTest.results into the screen
                    currentScreen.updateDivsFromResultStorage(this.currentSessionTest.Results, this.generateScreenID, this.currentSession.PluginData, sessionStorage.getItem("Poll") != null);
                }
            } else {
                this.currentSessionTest.CurrentPage++;
                this.renderTestPage();
            }
        } else {
            this.currentSessionTest.CurrentPage++;
            this.renderTestPage();
        }
    }
};

ITSTestTakingController.prototype.startTest = function () {
    this.InTestTaking = true;

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
        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + this.currentTestDefinition.BeforeScript + " }; ");
        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT" );
    } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Test pre script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
    // for 360 start the 360 testing
    if (this.currentTestDefinition.Supports360Degrees) {
        if (this.currentSession.Status == 10) {
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + this.currentTestDefinition.Pre360 + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT" );
            } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Session Pre360 script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
            this.currentSession.StartedAt = new Date();
        }
        try {
            eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + this.currentTestDefinition.Per360 + " }; ");
            func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT" );
        } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Test Per360 script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
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
        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + this.currentTestDefinition.AfterScript + " }; ");
        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT" );
    } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Test post script failed for "  + this.currentTestDefinition.TestName + " "  + err);  }
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
        try {
            if (typeof ITREndTestFunction !== "undefined") ITREndTestFunction();
        } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"ITREndTestFunction failed "  + err); }
        try {
           if (window.parent) window.parent.postMessage("ITREndTestFunction", this.currentSession, "*")
        } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"ITREndTestFunction postmessage failed "  + err); }
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
    setTimeout(function () { this.currentSession.loadSession(this.currentSession.ID, this.endSessionChecker.bind(this), this.endSessionChecker.bind(this), true, true); }.bind(this) ,101);
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
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode) { " + this.currentTestDefinition.Post360 + " }; ");
                func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT");
            } catch (err) {
                ITSLogger.logMessage(logLevel.ERROR,"Session post360 script failed for " + this.currentTestDefinition.TestName + " " + err);
            }
        }
        if (this.currentTestIndex == -1) {
            this.currentSession.Status = 30;
            this.currentSession.SessionState = "Done";
            this.currentSession.EndedAt = Date.now();
        }
        this.saveSession();

        var showReport = false;
        try {
            if (this.currentSession.PluginData.sessionParameters.reportID != "") {
                showReport = true;
                $('#ITSTestTakingDiv').hide();
                $('#ITSTestTakingDivSessionEnded').hide();
                $('#NavbarsAdminLogoutButtonTT').hide();
                $('#NavbarsTestTaking').hide();
                $('#ITSTestTakingDivSessionEndedShowReport').show();
                this.generateReport();
            }
        }
        catch (err) {}

        // show session ended screen to allow the system to store all data and handle possible retries
        if (!showReport) {
            $('#ITSTestTakingDiv').hide();
            $('#ITSTestTakingDivSessionEnded').show();
            $('#NavbarsAdminLogoutButtonTT').hide();
            $('#NavbarsAdminLoginBlockTTMenuIcon').hide();
            setTimeout(function () {
                ITSInstance.logoutController.logout();
            }, 60000);
        }

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

ITSTestTakingController.prototype.generateReport = function(switchUI) {
    //console.log('Generate report');
    try {
        if (switchUI) {
            ITSInstance.UIController.EnablePublicTestTakingInterface();
            setTimeout(function () {
                $('#ITSTestTakingDivSessionEndedShowReport').css("top","10px");
                $('#ITSTestTakingDivSessionEndedShowReport').css("position","absolute");
                $('#ITSTestTakingDiv').hide();
                $('#NavbarsTestTaking').hide();
                $('#ITSTestTakingDivSessionEndedShowReport').show();
                }, 1000);
        }

        if (typeof this.repToGen == "undefined") this.repToGen = ITSInstance.reports.newReport(false);
        if (!this.repToGen.detailsLoaded) {
            this.repToGen.ID = this.currentSession.PluginData.sessionParameters.reportID;
            this.repToGen.loadDetailDefinition(this.generateReport.bind(this), ITSInstance.logoutController.logout.bind(this));
            return;
        }

        var cst = this.currentSession.sessionTestById(this.repToGen.TestID);
        cst.calculateScores(false, true);
        cst.saveToServer(function(){}, function(){}, true);
        //console.log(cst.Scores);
        var reportText = this.repToGen.generateTestReport(this.currentSession, cst, false);
        $('#ITSTestTakingDivSessionEndedShowReportContent')[0].innerHTML = reportText;
        $('#ITSTestTakingDivSessionEndedShowURL')[0].innerText =  [location.protocol, '//', location.host, location.pathname].join('')+"?Lang="+ITSLanguage+"&ReviewID="+this.currentSession.ID+"&Poll="+this.currentSession.ShortLoginCode+ "&ReturnURL="+ cookieHelper.getCookie('ReturnURL');

        // Mail if requested
        var mailto = String(sessionStorage.getItem("MailTo"));
        if ((mailto.indexOf('@') > 0)) {
            var newMail = new ITSMail();
            newMail.To = mailto;
            newMail.ReplyTo = mailto;
            newMail.CC = "";
            newMail.BCC = "";
            newMail.Subject = this.currentSession.Description;
            newMail.Body = reportText;

            newMail.sendConsultantMail(this.currentSession.ID, function () {}, function () {});
        }
    } catch (err) {}

    setTimeout( function () { ITSInstance.logoutController.logout('',false); }, 1000);
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
            this.saveSessionNeeded = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID, false, this.currentSession.PluginData, this.currentSession.SessionType==1);
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
        if (eventName != "UpdateCurrentScreenFromSessionStorage") {
            this.saveSessionNeeded = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID, false, this.currentSession.PluginData, this.currentSession.SessionType==1);
        }
        if ((eventName!="Store") && (eventName != "AutoStore") && (eventName != "UpdateCurrentScreenFromSessionStorage")) {
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
                        eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode, screen) { " + this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].afterScreenScript + " }; ");
                        func(this.currentSession, this.currentSessionTest, this.candidate, this.currentTestDefinition, this, ITSInstance, "TT", this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage] );
                    } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Screen post script failed for "  + this.currentTestDefinition.TestName + "(" + this.currentSessionTest.CurrentPage + ")"  + err);  }
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
            this.saveSessionNeeded = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results, this.generateScreenID, false, this.currentSession.PluginData, this.currentSession.SessionType==1);
            this.saveCurrentTest();
            break;
        case "AutoStore" :
            // results are only stored, but at max once per minute
            this.autoStore(true); // this is a global function since it can also be called from editors
            break;
        case "UpdateCurrentScreenFromSessionStorage":
            var currentScreen = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage];
            currentScreen.updateFromSessionStorage(this.currentSessionTest.Results, this.currentSession.PluginData, this.currentSession.SessionType==1);
            this.saveCurrentTest();
            break;
        case "EndTest" :
     		if (this.InTestTaking) this.switchNavBar();
            setTimeout(this.endTest.bind(this, false),100);
            break;
        case "EndTestTimeOut" :
     		if (this.InTestTaking) this.switchNavBar();
            setTimeout(this.endTest.bind(this, true),100);
            break;
        case "EndSession" :
     		if (this.InTestTaking) this.switchNavBar();
            this.endSession();
            break;
        case "NextScreenIfAnswered" :
            if (this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].checkIsAnswered( this.currentSessionTest.Results ) < 1  ) {
                break;
            }
        case "NextScreen" :
     		if (this.InTestTaking) this.switchNavBar();
            this.currentSessionTest.CurrentPage++;
            this.saveCurrentTest();
            setTimeout(this.renderTestPage.bind(this),100);
            break;
        case "NextUnansweredScreenWithProceed":
            var oldPage = this.currentSessionTest.CurrentPage;
            this.currentSessionTest.CurrentPage++;
        case "NextUnansweredScreen" :
            if (this.InTestTaking) this.switchNavBar();
            if (eventName == "NextUnansweredScreen") { var oldPage = this.currentSessionTest.CurrentPage; }
            while ( (this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].show) &&
                    (this.currentSessionTest.CurrentPage < this.currentTestDefinition.screens.length) &&
                    (this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].checkIsAnswered( this.currentSessionTest.Results ) >= 1  ) ) {
                this.currentSessionTest.CurrentPage++;
            }
            if (oldPage !=  this.currentSessionTest.CurrentPage) { this.saveCurrentTest();}
            setTimeout(this.renderTestPage.bind(this),100);
            break;
        case "PreviousScreen" :
            if (this.InTestTaking) this.switchNavBar();
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
        case "Logout" :
            if (this.InTestTaking) this.switchNavBar();
            this.saveSession();
            this.saveCurrentTest();
            ITSInstance.logoutController.logout();
            break;
        case "CheckSessionTime" :
            // no action needed already done
            break;
        case "Script" :
            // run a script. Parameters are the screen template trace ID and the script index
            var scriptScreenParameterID = eventParameters.split(',')[0];
            var scriptScreenParameterScreenComponentIndex = eventParameters.split(',')[1];
            var scriptScreenParameterCodeBlockNr = eventParameters.split(',')[2];
            var scriptScreenVariableName = eventParameters.split(',')[3];

            if (scriptScreenParameterCodeBlockNr <=1) { scriptScreenParameterCodeBlockNr = ""; } else { scriptScreenParameterCodeBlockNr = "_" + scriptScreenParameterCodeBlockNr;}
            try {
                var tempScript = this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].screenComponents[scriptScreenParameterScreenComponentIndex].templateValues[scriptScreenVariableName + scriptScreenParameterCodeBlockNr];
                ITSInstance.actions.executeScriptInTestTaking(tempScript, this, this.currentTestDefinition, this.currentSession, this.currentSessionTest, this.currentSessionTest.CurrentPage, scriptScreenParameterScreenComponentIndex, scriptScreenVariableName, scriptScreenParameterCodeBlockNr, 0, scriptScreenParameterID);
            } catch (err) {
                ITSLogger.logMessage(logLevel.ERROR,'Action execution failed (' + eventName + "/" + eventParameters + ') : ' + err.message);
            }
            break;
        default :
            if (eventName != '') ITSLogger.logMessage(logLevel.ERROR,"processEvent UNKNOWN event found : " + eventName + " " + eventParameters);
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
    if (this.saveSessionNeeded) this.saveSession();
    this.saveSessionNeeded = false;
    var sessionPostObject = {};
    this.currentSessionTest.calcTotalPages();
    sessionPostObject.sessionTest = this.currentSessionTest;
    sessionPostObject.numberOfRetries = 3;
    if (this.saveCurrentTestObjectBusy) {
        this.saveCurrentTestObjectBacklog = {} ;
        this.saveCurrentTestObjectBacklog[this.currentSessionTest.ID] = sessionPostObject;
        //ITSLogger.logMessage(logLevel.ERROR,sessionPostObject);
    } else {
        this.saveCurrentTestRetry(sessionPostObject);
    }
};

ITSTestTakingController.prototype.saveCurrentTestRetry = function (sessionPostObject, xhr, ajaxOptions, thrownError) {
    this.saveCurrentTestObjectBusy = true;
    setTimeout(this.resetBusyFlag.bind(this), 3000); // make sure to reset this flag after a few secs so saves will be retried anyway
    if (sessionPostObject.numberOfRetries > 0) {
        sessionPostObject.numberOfRetries --;
        sessionPostObject.sessionTest.saveToServer(this.saveCurrentTestPickupNext.bind(this), this.saveCurrentTestRetry.bind(this, sessionPostObject), true);
    } else {
        this.saveCurrentTestObjectBusy = false;
        if ((typeof ajaxOptions != "undefined") && (ajaxOptions.status == 403)) {
            if (ITSInstance.token.IssuedToken != '') {
                ITSInstance.UIController.showError('ITSLoginToken.tokenRefreshFailed', 'Your login has expired. Please login again.', '',
                    'ITSInstance.logoutController.logout();');
            }
        } else {
            ITSInstance.UIController.showError('ITSTestTakingController.SaveCurrentTestFailed',
                $('#TestTakingInterfaceConnectionLost').text());
        }
    }
};

ITSTestTakingController.prototype.resetBusyFlag = function () {
    this.saveCurrentTestObjectBusy = false;
};

ITSTestTakingController.prototype.saveCurrentTestPickupNext = function () {
    this.saveCurrentTestObjectBusy = false;
    if (this.saveCurrentTestObjectBacklog != undefined) {
        // and now start the save for any test posts that were there (multiple if for multiple tests)
        for (st in this.saveCurrentTestObjectBacklog) {
            //ITSLogger.logMessage(logLevel.ERROR,this.saveCurrentTestObjectBacklog[st]);
            this.saveCurrentTestRetry(this.saveCurrentTestObjectBacklog[st]);
        }
        this.saveCurrentTestObjectBacklog = undefined;
    }
};
