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
modalRequired = false;
modalShows = false;

ITSUIController = function () {
    this.registeredPortlets = [];
    this.registeredEditors = [];
    this.OfficeSessionPrepared = false;
    // login phase support
    this.showLogin= function () {
        // hide all UI elements
    } ;
    this.showLoginPasswordForgotten= function () {
        // hide all UI elements
    } ;
    this.EnableLoginInterface = function () {
        this.resetAllUIElements();
        $('#LoginWindow').show();
        // remove the session token if present
        ITSInstance.token.clear();
        ITSInstance.users.resetCurrentUser();
        // load translations
        if (ITSInstance.translator.availableTranslations.length > 0) {
            this.loadTranslationsDropDown();
        }
        else {
            $('#LoginWindowSelectLangGroup').hide();
            ITSInstance.translator.loadAvailableTranslations(this.loadTranslationsDropDown.bind(this));
        }
    } ;
    this.loadTranslationsDropDown = function () {
        if (ITSInstance.translator.availableTranslations.length > 0) {
            $('#LoginWindowSelectLangGroup').show();
            $('#LoginWindowSelectLanguage').empty();
            if ( ITSInstance.translator.currentTranslatedLanguage == "en") {
                select = '<option NoTranslate selected=\'selected\' value=\"en\">' +
                    ITSInstance.translator.getLanguageDescription("en") + '</option>';
            } else {
                select = '<option NoTranslate value=\"en\">' +
                    ITSInstance.translator.getLanguageDescription("en") + '</option>';
            }
            $('#LoginWindowSelectLanguage').append(select);
            for (var i = 0; i < ITSInstance.translator.availableTranslations.length; i++) {
                var defaultOption = "";
                if (ITSInstance.translator.availableTranslations[i].toLowerCase() == ITSInstance.translator.currentTranslatedLanguage) {
                    defaultOption = " selected='selected' ";
                }
                var select = '<option NoTranslate ' + defaultOption + 'value=\"' + ITSInstance.translator.availableTranslations[i] + '\">' +
                    ITSInstance.translator.getLanguageDescription(ITSInstance.translator.availableTranslations[i]) + '</option>';
                if (ITSInstance.translator.availableTranslations[i].toLowerCase() != 'en') $('#LoginWindowSelectLanguage').append(select);
            }
        }
    };
    this.EnableLoginSelectCompany = function () {
        this.resetAllUIElements();
        $('#LoginWindowSelectCompany').show();
        ITSInstance.portletSelectCompany.init();
    } ;
    this.EnableMfaQRSetupInterface = function () {
        this.resetAllUIElements();
        $('#LoginWindowMfaQRSetup').show();
        ITSInstance.loginController.getQRCode();
    } ;
    this.EnableMfaQrCodeInterface = function () {
        this.resetAllUIElements();
        $('#LoginWindowEnterMfaCode').show();
    } ;
    this.EnableLoginSelectSession = function () {
        this.resetAllUIElements();
        $('#LoginWindowSelectSession').show();
        ITSInstance.portletSelectSession.init();
    } ;
    this.EnablePasswordForgottenInterface = function () {
        this.resetAllUIElements();
        $('#ForgotWindow').show();
    } ;
    this.EnablePasswordResetInterface = function () {
        this.resetAllUIElements();
        $('#PasswordResetWindow').show();
        if (ITSURLToken=="") { activateScreenPath("Login"); }
    } ;

    this.EnableTestTakingInterface = function () {
        this.resetAllUIElements();
        if (cookieHelper.getCookie('NoTTHeader') != 'Y') {
            $('#NavbarsTestTaking').show();
            $('#NavbarsTestTaking').visibility = 'visible';
        }
        $('#NavBarsFooter').show();
        $('#ITSTestTakingDiv').show();
        $('#LoginWindowSelectSession').hide();
        this.initNavBar();
        ITSTranslateInterface();
        setTimeout(onResize,5000);

        // finetune the interface for teaching or testing, but allow for some time to load the session
        setTimeout( function () {
            if (ITSInstance.testTakingController.currentSession.SessionType >= 1000) {
                $('#NavbarsAdminLoginBlockTTMenuIcon').show();
                $('#NavBarsAdminSidebarOtherCompanyTTLI').hide();
                $('#NavBarsAdminSidebarOtherSessionTTLI').hide();
                if (ITSInstance.MultipleCompaniesFound) $('#NavBarsAdminSidebarOtherCompanyTTLI').show();
                if (ITSInstance.MultipleSessionsFound) $('#NavBarsAdminSidebarOtherSessionTTLI').show();
                $.getScript(ITSJavaScriptVersion + "/Plugins/ResetPassword/init.js");
            }
        }.bind(this), 5000);
    };

    this.EnablePublicTestTakingInterface = function () {
        this.resetAllUIElements();
        $('#NavbarsTestTaking').hide();
        $('#NavbarsTestTaking').visibility = 'none';
        $('#NavBarsFooter').show();
        $('#NavbarsAdminSearchButtonBlockTT').visibility = 'hidden';
        $('#NavbarsAdminSearchButtonBlockTT').hide();
        $('#NavbarsAdminLoginBlockTT').visibility = 'hidden';
        $('#NavbarsAdminLoginBlockTT').hide();
        $('#ITSTestTakingDiv').show();
        this.initNavBar();
        ITSTranslateInterface();
    };

    // admin interface functions
    this.EnableAdminInterface = function () {
        this.resetAllUIElements();
        $('#AdminInterface').show();
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        this.initNavBar();
        ITSInstance.UIController.prepareOfficeSession();
        //ITSTranslateInterface();
    };

    // common functions for generic usage
    this.activateScreenPath = function(Path){
        // check if there is a session token, if not show the login path
        ITSLogger.logMessage(logLevel.INFO,"Activating path " + Path);

        // only activate the path if allowed
        if (typeof ITSInstance.companies.currentCompany.PluginData["ForbiddenPaths"] != "undefined") {
            if ( ( IsInCSVList(Path,ITSInstance.companies.currentCompany.PluginData.ForbiddenPaths) ||
                 ( IsInCSVList(Path,ITSInstance.users.currentUser.PluginData.ForbiddenPaths) ))
                   && !ITSInstance.users.currentUser.IsMasterUser ) {
                ITSInstance.UIController.showError('ITS_UI.ForbiddenPath', 'Your system administrator has blocked access to this path.');
                window.history.back();
                return;
            }
        }

        // if the progress bar is showing then switch if off now
        var token = ITSInstance.token.get();

        this.resetAllUIElements();
        switch(Path) {
            case "Login" :
                this.EnableLoginInterface();
                break;
            case "LoginCompanySelect" :
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.EnableLoginSelectCompany();
                break;
            case "LoginSessionSelect" :
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.EnableLoginSelectSession();
                break;
            case "Switchboard":
                ITSInstance.UIController.showInterfaceAsWaitingOffForceShow();
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.EnableAdminInterface();
                break;
            case "PasswordForgotten" :
                this.EnablePasswordForgottenInterface();
                break;
            case "PasswordReset" :
                this.EnablePasswordResetInterface();
                break;
            case "TestTaking":
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.EnableTestTakingInterface();
                break;
            case "TestTakingPublic":
                if (getUrlParameterValue("Token")) {
                    ITSInstance.token.IssuedToken = getUrlParameterValue("Token");
                    ITSInstance.token.companyID = getUrlParameterValue("CompanyID");
                    token = ITSInstance.token.IssuedToken;
                }
                this.EnablePublicTestTakingInterface();
                break;
            case "MfaQrCodeSetup":
                this.EnableMfaQRSetupInterface();
                break;
            case "MfaEnterCode":
                this.EnableMfaQrCodeInterface();
                break;
            default :
                ITSInstance.UIController.showInterfaceAsWaitingOffForceShow();
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.scan_for_default_office_plugin_paths(Path);
        }
        if (typeof resizeFunction !== "undefined" )  { resizeFunction(); }
    } ;

    this.scan_for_default_office_plugin_paths = function (Path) {
        var plugin_found = false;
        for (var i=0; i < ITSInstance.UIController.registeredEditors.length; i++) {
            if (ITSInstance.UIController.registeredEditors[i].path == Path) {
				ITSLogger.logMessage(logLevel.INFO,"Showing " +ITSInstance.UIController.registeredEditors[i].path );
                ITSInstance.UIController.registeredEditors[i].show();
                plugin_found = true;
            }
        }
        if (! plugin_found) {
            setTimeout(this.scan_for_default_office_plugin_paths.bind(this, Path), 1500); // the list of plugins is not registered yet, give the browser some time to register
        }
    };

    this.resetAllUIElements= function () {
        // hide all UI elements
        $('#AdminInterface').hide();
        $('#TestTakingInterface').hide();
        $('#LoginWindow').hide();
        $('#ForgotWindow').hide();
        $('#NavbarsAdmin').hide();
        $('#NavbarsAdminLoginBlockTTMenuIcon').hide();
        $('#NavbarsAdmin').visibility = 'hidden';
        $('#NavBarsFooter').hide();
        $('#NavBarsAdminSidebar').hide();
        $('#PasswordResetWindow').hide();
        $('#LoginWindowSelectCompany').hide();
        $('#AdminInterfaceSessions').hide();
        $('#NavbarsTestTaking').hide();
        $('#NavbarsTestTaking').visibility = 'hidden';
        $('#ITSTestTakingDiv').hide();
        $('#ITSTestTakingDivTestEnded').hide();
        $('#ITSTestTakingDivSessionEnded').hide();
        //$('#AdminInterfaceSessionEditNew').hide();
        ITSInstance.UIController.hideAllEditors();
        $('#LoginWindowEnterMfaCode').hide();
        $('#LoginWindowMfaQRSetup').hide();
    } ;


    this.showInterfaceAsWaitingOn= function (alternativeTimeout) {
        // show the progress indicator and block the interface
        modalRequired = true;
        modalShows = false;
        $("#waitModal").modal('show');
        $('#waitModalProgress').hide();
        alternativeTimeout = 0;
        if (!alternativeTimeout) {
            setTimeout(this.showInterfaceAsWaitingOnForceShow, 1000);
        } else {
            if (alternativeTimeout > 0) {
                setTimeout(this.showInterfaceAsWaitingOnForceShow, alternativeTimeout);
            } else {
                this.showInterfaceAsWaitingOnForceShow();
            }
        }
    } ;
    this.showInterfaceAsWaitingOnForceShow= function () {
        if (modalRequired) {
            modalShows = true;
            $("#waitModal").modal('show');
        }
    } ;
    this.showInterfaceAsWaitingProgress= function (indicator) {
        $("#waitModalProgress").css('display','');
        $("#waitModalProgress")[0].innerHTML = indicator;
    } ;
    this.showInterfaceAsWaitingProgressOff= function () {
        $("#waitModalProgress").css('display','none');
    } ;
    this.showInterfaceAsWaitingOff = function () {
        modalRequired = false;
        $("#waitModalProgress").css('display','none');
        setTimeout( this.showInterfaceAsWaitingOffForceShow , 100);
    } ;
    this.showInterfaceAsWaitingOffForceShow= function () {
        $("#waitModalProgress").css('display','none');
        $("#waitModal").modal('hide');
        modalShows = false;
    } ;
    this.showError= function (errorID, errorMessage, MessageAddition, onClickFunctionAsText) {
        // show an error message to the user
        $('#basicModalFooter').empty();
        if (!MessageAddition) MessageAddition = "";
        if (!onClickFunctionAsText) onClickFunctionAsText = "";
        $('#basicModalFooter').append('<button type="button" id="basicModalButtonClose" class="btn btn-default" onclick="'+onClickFunctionAsText+'" data-dismiss="modal">x</button>');

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'errorMessages', 'Header', 'Error') );
        $('#basicModalBody').text(  ITSInstance.translator.getTranslatedString( 'errorMessages', errorID, errorMessage) + MessageAddition  );
        $('#basicModalButtonClose').text ( ITSInstance.translator.getTranslatedString( 'errorMessages', 'Button', 'Close') );
        $('#basicModal').modal();
    } ;
    this.showWarning= function (warningID, warningMessage, MessageAddition, onClickFunctionAsText ) {
        // show an error message to the user
        $('#basicModalQRCode').hide();
        $('#basicModalFooter').empty();
        if (!MessageAddition) MessageAddition = "";
        if (!onClickFunctionAsText) onClickFunctionAsText = "";
        $('#basicModalFooter').append('<button type="button" id="basicModalButtonClose" class="btn btn-default" onclick="'+onClickFunctionAsText+'" data-dismiss="modal">x</button>');

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'warningMessages', 'Header', 'Warning') );
        $('#basicModalBody').text(  ITSInstance.translator.getTranslatedString( 'warningMessages', warningID, warningMessage));
        if (MessageAddition ) {
            $('#basicModalBody').append('<div>' + MessageAddition+ '</div>');
        }
        $('#basicModalButtonClose').text ( ITSInstance.translator.getTranslatedString( 'warningMessages', 'Button', 'Close') );
        $('#basicModal').modal();
    } ;
    this.showInfo= function (infoID, infoMessage, MessageAddition, onClickFunctionAsText) {
        // show an error message to the user
        $('#basicModalQRCode').hide();
        $('#basicModalFooter').empty();
        if (!MessageAddition) MessageAddition = "";
        if (!onClickFunctionAsText) onClickFunctionAsText = "";
        $('#basicModalFooter').append('<button type="button" id="basicModalButtonClose" class="btn btn-default" onclick="'+onClickFunctionAsText+'" data-dismiss="modal">x</button>');

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'infoMessages', 'Header', 'Information') );
        if (infoID != '') {
            $('#basicModalBody').html(ITSInstance.translator.getTranslatedString('infoMessages', infoID, infoMessage) + MessageAddition);
        } else {
            $('#basicModalBody').html( infoMessage + MessageAddition);
        }
        $('#basicModalButtonClose').text ( ITSInstance.translator.getTranslatedString( 'infoMessages', 'Button', 'Close') );
        $('#basicModal').modal();
    } ;
    this.showURL = function (infoID, infoMessage, MessageAddition,  URL, onClickFunctionAsText) {
        this.showInfo(infoID, infoMessage, MessageAddition, onClickFunctionAsText);
        $('#basicModalQRCode').show();
        var qr = new QRious({
            element: document.getElementById('basicModalQRCode'),
            value: URL
        });
    };
    this.showDialog= function (dialogID,  dialogHeader, dialogMessage, dialogOptionsArray, additionalStrings) {
        // dialogOptionsArray is an array of objects with properties (per object) : btnType, btnCaption, btnOnClick
        // show an error message to the user
        $('#basicModalQRCode').hide();
        $('#basicModalFooter').empty();
        var btype="";
        var bcaption="";
        var bclick="";
        for (var i=0; i < dialogOptionsArray.length; i++) {
            btype = "btn-default";
            bcaption = "";
            bclick = "";
            if (dialogOptionsArray[i].btnType) { btype = dialogOptionsArray[i].btnType; }
            if (dialogOptionsArray[i].btnCaption) {
                bcaption = dialogOptionsArray[i].btnCaption;
                bcaption= ITSInstance.translator.getTranslatedString( 'dialogMessages', dialogID + "_" + i, bcaption);
            }
            if (dialogOptionsArray[i].btnOnClick) { bclick = dialogOptionsArray[i].btnOnClick; }
            $('#basicModalFooter').append('<button type="button" onclick="'+bclick+'" id="basicModalButtonClose'+i+'" class="btn '+btype+'" data-dismiss="modal">'+bcaption+'</button>');
        }

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'dialogMessages', dialogID + 'Header', dialogHeader) );
        tempText = ITSInstance.translator.getTranslatedString( 'dialogMessages', dialogID, dialogMessage);
        if (additionalStrings) {
            tempText = format(tempText,additionalStrings);
        }
        $('#basicModalBody').text( tempText );
        $('#basicModal').modal();
    } ;

    // UI generic support functions
    this.initNavBar = function() {
        // load the current company
        if (ITSInstance.companies.currentCompany.CompanyName){
            $('#welcomeCompany').text('(' + ITSInstance.companies.currentCompany.CompanyName + ')');
        }
        else {
            ITSInstance.companies.loadCurrentCompany(
                function () {
                    ITSInstance.companies.currentCompany.detailsLoaded = true;
                    $('#welcomeCompany').text('(' + ITSInstance.companies.currentCompany.CompanyName + ')');
                    setTimeout( ITSInstance.UIController.refreshCompanyInformation, 60000);
                    ITSInstance.initializePortletsController.init();
                },
                function () {
                    ITSInstance.UIController.showError('ITSLoginController.LoadingCompanyFailed', 'Loading company information failed');
                })
        }
        // load the current user
        if (ITSInstance.users.currentUser.Name) {
            $('#welcomeUserName').text(ITSInstance.users.currentUser.Name);
        }
        else {
            ITSInstance.users.loadCurrentUser(
                function () {
                    $('#welcomeUserName').text(ITSInstance.users.currentUser.UserName);
                },
                function () {
                    ITSLogger.logMessage(logLevel.ERROR,'Loading current user failed. ');
                })
        }
    } ;

    this.refreshCompanyInformation = function (force) {
        if (!ITSInstance.UIController.refreshCompanyInformationLastTimestamp) { ITSInstance.UIController.refreshCompanyInformationLastTimestamp = new Date(2000,1,1,1,1,1,1); }
        var dateNow = new Date();
        if (((Math.abs(dateNow.getTime() - ITSInstance.UIController.refreshCompanyInformationLastTimestamp.getTime()) ) > 60000) || force) {
            setTimeout(ITSInstance.UIController.refreshCompanyInformation, 60100);
            ITSInstance.UIController.refreshCompanyInformationLastTimestamp = new Date();
            if (typeof ITSInstance.users.currentUser != "undefined") {
                if (ITSInstance.users.currentUser.IsTestTakingUser) {
                    // test taking users do not need a full refresh
                    ITSInstance.token.keepTokenFresh();
                    console.log("All information exchanged through this interface and website is copyrighted " + CopyrightString );
                }
                else {
                    ITSInstance.companies.loadCurrentCompany(function () {}, function () {}, true);
                }
            } else {
                // never refresh until logged in
            }
        }
    };

    this.registerPortlet = function (portlet) {
        if (ITSInstance.UIController.registeredPortlets.indexOf(portlet)<0) {
            ITSInstance.UIController.registeredPortlets.push(portlet);
            this.showPortlets();
        }
    } ; // please note that portlets must conform to the portlet interface
    this.registerEditor = function (editor) {
        if (ITSInstance.UIController.registeredEditors.indexOf(editor)<0) {
            ITSInstance.UIController.registeredEditors.push(editor);
            ITSInstance.UIController.showEditors();
        }
    } ; // please note that editors must conform to the editor interface
    this.initPortlets = function () {
        ITSInstance.UIController.registeredPortlets.forEach( function (currentValue, index, arr) {
            if(typeof currentValue.afterOfficeLogin == 'function') {
                setTimeout(currentValue.afterOfficeLogin, 1);
            }
        } )
    };
    this.showEditors = function () {
        // if all editors are loaded then translate and init them
        if (loadEditorsCount == ITSInstance.UIController.registeredEditors.length) {
            ITSInstance.translator.retranslateInterface();
            ITSInstance.UIController.afterOfficeLoginUI();
        }
    },
    this.showPortlets = function () {
        // if all portlets are loaded then translate and init them
        if (loadPortletsCount == ITSInstance.UIController.registeredPortlets.length) {
            // reorder (and in the future hide) the portlets based on the default settings in the portlets and (in the future) user preference
            ITSInstance.UIController.registeredPortlets.sort( function (a,b) {
                aval = typeof a.defaultShowOrder != "undefined" ? a.defaultShowOrder : 999;
                bval = typeof b.defaultShowOrder != "undefined" ? b.defaultShowOrder : 999;
                if (aval > bval) {return 1; } else {return -1;}
            } );
            $('#AdminInterfacePortlets').empty();
            for (var i=0; i < ITSInstance.UIController.registeredPortlets.length; i++) {
                ITSInstance.UIController.registeredPortlets[i].addToInterface();
            }

            ITSInstance.translator.retranslateInterface();
            this.initPortlets();
        }
    };
    this.initEditors = function () { ITSInstance.UIController.registeredEditors.forEach( function (currentValue, index, arr) { currentValue.init(); } ) };
    this.hideAllEditors = function () {
        ITSInstance.UIController.registeredEditors.forEach(
            function (currentValue, index, arr) {
                currentValue.hide();
                }
            )
    };
    this.showEditor = function (editor) {
        var foundEditor = ITSInstance.UIController.registeredEditors.indexOf(editor);
        if (foundEditor >=0) {
            ITSInstance.UIController.registeredEditors[foundEditor].show(); }
        } ;
    this.registerMenuItem = function (menuPosition, ID, menuText, menuIcon, menuClick) {
        var newLI = $('<li class="nav-item">');
        var newA = $('<a class="nav-link p-0" style="color:white;" onclick="'+menuClick+'">');
        var newI = $('<i class="fa fa-fw '+menuIcon+'">');
        newA.append(newI);
        newLI.append(newA);
        //<a class="nav-link p-0" href="" style="color:white;" id="NavBarsAdminSidebarSessionsReadyForReporting"><i class="fa fa-fw fa-bar-chart"></i>Sessions ready for reporting</a>
        newA.append("<label id='"+ID+"'>"+  menuText+ "</label>");
        $(menuPosition).append(newLI);
        };
    this.prepareOfficeSession = function () {
        cookieHelper.setCookie('SessionID','',0);
        if (!this.OfficeSessionPrepared) {
            this.OfficeSessionPrepared = true;
            // load all data that is required by the system
            ITSInstance.ITRSessionType = "office";
            loadOfficeComponents();
            ITSInstance.screenTemplates.loadAvailableScreenTemplates(); // always load the screen templates

            // make sure the server updates periodically
            ITSInstance.genericAjaxUpdate('refreshpublics', function () {
            }, function () {
            });

            // get the amount of sessions
            getActiveSessions();

            // now initialise the editors and portlets. They may need more data.
            ITSInstance.UIController.registeredEditors.forEach(
                function (currentValue, index, arr) {
                    if (currentValue) {
                        if (typeof currentValue.afterOfficeLogin == 'function') {
                            try {
                                setTimeout(currentValue.afterOfficeLogin, 1);
                            } catch (err) {
                                ITSLogger.logMessage(logLevel.ERROR,"Init of " + currentValue.path + "failed : " + err.message);
                            }
                        }
                    }
                });

            ITSInstance.UIController.registeredPortlets.forEach(function (currentValue, index, arr) {
                if (typeof currentValue.afterOfficeLogin == 'function') {
                    currentValue.afterOfficeLogin();
                }
            })
        }
    };
    this.prepareTestRunSession = function () {
        // load all data that is required by the system
        ITSInstance.ITRSessionType = "testrun";
        ITSInstance.screenTemplates.loadAvailableScreenTemplates(); // always load the screen templates

        if (isUUID(sessionStorage.getItem("ReviewID"))) {
            // load the session
            cookieHelper.setCookie('SessionID',sessionStorage.getItem("ReviewID"),1);
            ITSInstance.testTakingController.currentSession = new ITSCandidateSession(this, ITSInstance);
            ITSInstance.testTakingController.currentSession.loadSession(sessionStorage.getItem("ReviewID"),
                ITSInstance.testTakingController.generateReport.bind(ITSInstance.testTakingController, true),
                ITSInstance.testTakingController.startSession.bind(ITSInstance.testTakingController), false, true);
        } else {
            ITSInstance.testTakingController.startSession();
        }
    };
    this.enableDarkMode = function () {
        document.body.setAttribute('data-theme', 'dark');
        // chart js settings
        Chart.defaults.scale.gridLines.color = '#fff';
        Chart.defaults.global.elements.arc.borderColor = '#fff';
        Chart.defaults.global.elements.point.borderColor = '#fff';
        Chart.defaults.global.elements.rectangle.borderColor = '#fff';
        Chart.defaults.global.elements.line.borderColor = '#fff';
        Chart.defaults.global.defaultColor='#fff';
        // mce iframes
        $("iframe").each(function() {
            var cssList = {};
            cssList = getCSSClassesList( $(this)[0].contentWindow.document );
            cssList[".mce-content-body"].style.color = "#fff";
            cssList[".mce-content-body"].style.backgroundColor = "#000";
            cssList[".mce-content-body"].style.borderColor = "#2f2f2f";
        });
    };
    this.enableLightMode = function () {
        document.body.removeAttribute('data-theme');
        // chart js settings
        Chart.defaults.scale.gridLines.color = "rgba(0,0,0,0.1)";
        Chart.defaults.global.elements.arc.borderColor ="rgba(0,0,0,0.1)";
        Chart.defaults.global.elements.point.borderColor = "rgba(0,0,0,0.1)";
        Chart.defaults.global.elements.rectangle.borderColor = "rgba(0,0,0,0.1)";
        Chart.defaults.global.elements.line.borderColor = "rgba(0,0,0,0.1)";
        Chart.defaults.global.defaultColor="rgba(0,0,0,0.1)";
        // mce iframes
        $("iframe").each(function() {
            var cssList = {};
            cssList = getCSSClassesList( $(this)[0].contentWindow.document );
            cssList[".mce-content-body"].style.color = "#000";
            cssList[".mce-content-body"].style.backgroundColor = "#fff";
            cssList[".mce-content-body"].style.borderColor = "#fff";
        });
    };
    this.inChangeDarkMode = false;
    this.changeDarkMode = function () {
        if (! ITSInstance.UIController.inChangeDarkMode) {
            ITSInstance.UIController.inChangeDarkMode = true;
            if (! ($('#NavBarsAdminSidebarTT:visible').length > 0) ) {
                if ($('#ITRColorMode').is(':checked')) {
                    setTimeout(ITSInstance.UIController.enableLightMode, 100);
                    $('#ITRColorMode').bootstrapToggle('off', true);
                } else {
                    setTimeout(ITSInstance.UIController.enableDarkMode, 100);
                    $('#ITRColorMode').bootstrapToggle('on', true);
                }
            }
            else {
                if ($('#ITRColorModeTT').is(':checked')) {
                    setTimeout(ITSInstance.UIController.enableLightMode, 100);
                    $('#ITRColorModeTT').bootstrapToggle('off', true);
                } else {
                    setTimeout(ITSInstance.UIController.enableDarkMode, 100);
                    $('#ITRColorModeTT').bootstrapToggle('on', true);
                }
            }
            setTimeout(function () { ITSInstance.UIController.inChangeDarkMode = false; ITSInstance.MessageBus.publishMessage("CurrentCompany.Refreshed", ""); }, 100);
            // save this as a user preference
            if (ITSInstance.users.currentUser.IsOfficeUser) {
                if (typeof ITSInstance.users.currentUser.PluginData.UI == "undefined") ITSInstance.users.currentUser.PluginData.UI = {};
                ITSInstance.users.currentUser.PluginData.UI.DarkMode = $('#ITRColorMode').is(':checked');
                ITSInstance.users.currentUser.saveToServer(function () {
                }, function () {
                });
            }
        }
    };
    this.setDarkModeToUserPreference = function () {
        if (ITSInstance.users.currentUser.PluginData.UI.DarkMode) {
            ITSInstance.UIController.enableDarkMode();
            $('#ITRColorMode').bootstrapToggle('on', true);
        }
    };
    this.afterOfficeLoginUI = function () {
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", ITSInstance.UIController.setDarkModeToUserPreference, true ) ;
    };
}

ITSPortletAndEditorRegistrationInformation = function (ID, Name, Version, Copyright, Description) {
    this.ID = ID;
    this.name = Name;
    this.version = Version;
    this.copyright = Copyright;
    this.description = Description;
}
