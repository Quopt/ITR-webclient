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
modalRequired = false;
modalShows = false;

ITSUIController = function () {
    this.registeredPortlets = [];
    this.registeredEditors = [];
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
        $('#NavbarsTestTaking').show();
        $('#NavbarsTestTaking').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ITSTestTakingDiv').show();
        this.initNavBar();
        ITSTranslateInterface();
    };

    this.EnablePublicTestTakingInterface = function () {
        this.resetAllUIElements();
        $('#NavbarsTestTaking').show();
        $('#NavbarsTestTaking').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#NavbarsAdminSearchButtonBlockTT').visibility = 'hidden';
        $('#NavbarsAdminSearchButtonBlockTT').hide();
        $('#NavbarsAdminLoginBlockTT').visibility = 'hidden';
        $('#NavbarsAdminLoginBlockTT').hide();
        $('#ITSTestTakingDiv').show();
        $('#NavbarsTestTaking').hide();
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
            //ITSTranslateInterface();
        };

    // common functions for generic usage
    this.activateScreenPath = function(Path){
        // check if there is a session token, if not show the login path
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
            default :
                if ((token == "") || (token=="empty")) this.ActivateScreenPath("Login");
                this.scan_for_default_office_plugin_paths(Path);
        }
        if (resizeFunction)  { resizeFunction(); }
    } ;

    this.scan_for_default_office_plugin_paths = function (Path) {
        if (ITSInstance.UIController.registeredEditors.length == 0) {
            setTimeout(this.scan_for_default_office_plugin_paths.bind(this, Path), 1500); // the list of plugins is not registered yet, give the browser some time to register
        } else {
            ITSInstance.UIController.registeredEditors.forEach(
                function (currentValue, index, arr) {
                    //console.log(currentValue.path + "==" + Path);
                    if (currentValue.path) {
                        if (currentValue.path == Path) {
                            currentValue.show();
                        }
                    }
                }
            );
        }
    };

    this.resetAllUIElements= function () {
        // hide all UI elements
        $('#AdminInterface').hide();
        $('#TestTakingInterface').hide();
        $('#LoginWindow').hide();
        $('#ForgotWindow').hide();
        $('#NavbarsAdmin').hide();
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
    } ;


    this.showInterfaceAsWaitingOn= function (alternativeTimeout) {
        // show the progress indicator and block the interface
        modalRequired = true;
        modalShows = false;
        $('#waitModalProgress').hide();
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
        //console.log('showInterfaceAsWaitingOnForceShow ' + modalRequired);
        if (modalRequired == true) { $("#waitModal").modal('show'); modalShows = true; };
    } ;
    this.showInterfaceAsWaitingOff = function () {
        // hide the progress indicator and unblock the interface
        //console.log('showInterfaceAsWaitingOff ' + modalRequired);
        modalRequired = false;
        if (modalShows == true) { setTimeout( this.showInterfaceAsWaitingOffForceShow , 500); }
    } ;
    this.showInterfaceAsWaitingOffForceShow= function () {
        if (modalShows == true) { $("#waitModal").modal('hide'); modalShows = false; };
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
        $('#basicModalFooter').empty();
        if (!MessageAddition) MessageAddition = "";
        if (!onClickFunctionAsText) onClickFunctionAsText = "";
        $('#basicModalFooter').append('<button type="button" id="basicModalButtonClose" class="btn btn-default" onclick="'+onClickFunctionAsText+'" data-dismiss="modal">x</button>');

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'infoMessages', 'Header', 'Information') );
        $('#basicModalBody').text(  ITSInstance.translator.getTranslatedString( 'infoMessages', infoID, infoMessage) + MessageAddition  );
        $('#basicModalButtonClose').text ( ITSInstance.translator.getTranslatedString( 'infoMessages', 'Button', 'Close') );
        $('#basicModal').modal();
    } ;
    this.showDialog= function (dialogID,  dialogHeader, dialogMessage, dialogOptionsArray, additionalStrings) {
        // dialogOptionsArray is an array of objects with properties (per object) : btnType, btnCaption, btnOnClick
        // show an error message to the user
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

        $('#basicModalHeader').text(  ITSInstance.translator.getTranslatedString( 'dialogMessages', 'Header', dialogHeader) );
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
                    console.log('Loading current user failed. ');
                })
        }
    } ;

    this.refreshCompanyInformation = function (force) {
        if (!ITSInstance.UIController.refreshCompanyInformationLastTimestamp) { ITSInstance.UIController.refreshCompanyInformationLastTimestamp = new Date(2000,1,1,1,1,1,1); }
        var dateNow = new Date();
        if (((Math.abs(dateNow.getTime() - ITSInstance.UIController.refreshCompanyInformationLastTimestamp.getTime()) ) > 60000) || force) {
            ITSInstance.UIController.refreshCompanyInformationLastTimestamp = new Date();
            setTimeout(ITSInstance.UIController.refreshCompanyInformation, 60100);
            ITSInstance.companies.loadCurrentCompany(function () {
            }, function () {
            }, true);
        }
    };

    this.registerPortlet = function (portlet) { if (ITSInstance.UIController.registeredPortlets.indexOf(portlet)<0) { ITSInstance.UIController.registeredPortlets.push(portlet); } } ; // please note that portlets must conform to the portlet interface
    this.registerEditor = function (editor) { if (ITSInstance.UIController.registeredEditors.indexOf(editor)<0) { ITSInstance.UIController.registeredEditors.push(editor); } } ; // please note that editors must conform to the editor interface
    this.initPortlets = function () { ITSInstance.UIController.registeredPortlets.forEach( function (currentValue, index, arr) { if(typeof currentValue.init == 'function') currentValue.init(); } ) };
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
        // load all data that is required by the system
        ITSInstance.ITRSessionType = "office";
        ITSInstance.screenTemplates.loadAvailableScreenTemplates(); // always load the screen templates

        // make sure the server updates periodically
        ITSInstance.genericAjaxUpdate('refreshpublics', function () {}, function () {});

        // now initialise the editors and portlets. The may need more data.
        ITSInstance.UIController.registeredEditors.forEach(
            function (currentValue, index, arr) {
                if (currentValue) {
                    if (typeof currentValue.afterOfficeLogin == 'function') {
                        try {
                            currentValue.afterOfficeLogin();
                        } catch (err) {
                            console.log("Init of " + currentValue.path + "failed : " + err.message);
                        }
                    }
                }
            } )
        ITSInstance.UIController.registeredPortlets.forEach( function (currentValue, index, arr) { if(typeof currentValue.afterOfficeLogin == 'function') { currentValue.afterOfficeLogin(); } } )
    };
    this.prepareTestRunSession = function () {
        // load all data that is required by the system
        ITSInstance.ITRSessionType = "testrun";
        ITSInstance.screenTemplates.loadAvailableScreenTemplates(); // always load the screen templates

        // now initialise the editors and portlets. The may need more data.
        //ITSInstance.UIController.registeredEditors.forEach( function (currentValue, index, arr) { if(typeof currentValue.afterTestRunLogin == 'function') { currentValue.afterTestRunLogin(); } } )
        //ITSInstance.UIController.registeredPortlets.forEach( function (currentValue, index, arr) { if(typeof currentValue.afterTestRunLogin == 'function') { currentValue.afterTestRunLogin(); } } )
        ITSInstance.testTakingController.startSession();
    };
}


ITSPortletAndEditorRegistrationInformation = function (ID, Name, Version, Copyright, Description) {
    this.ID = ID;
    this.name = Name;
    this.version = Version;
    this.copyright = Copyright;
    this.description = Description;
}
