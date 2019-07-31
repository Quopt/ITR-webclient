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
/** Singleton that contains all current ITS State ...*/

ITSSession = function () {
    this.baseURL = configBaseURL;
    this.baseURLScripts = configBaseURL + "/ITS2/";
    this.baseURLAPI = configBaseURL + "/api/"; // base url to the API
    this.baseURLAPIFiles = configBaseURL + "/api/files/"; // base url to the files API
    this.ID = new Date().getTime().toString(); // the unique id for this session;

    // data related POJO objects
    this.token = new ITSLoginToken(this); // holds the login token for the current user session. No token is not logged in.
    this.translator = new ITSTranslator(this); // allows for translating UI strings
    this.companies = new ITSCompanies(this); // contains a list of all ITS companies (if rights are sufficient)
    this.users = new ITSUsers(this); // contains a list of admin interface users
    this.tests = new ITSTests(this); // contains all of the available tests for this company
    this.candidates = new ITSCandidates(this); // contains logic to load the candidates in the model
    this.candidateSessions = new ITSCandidateSessions(this); // contains all candidate sessions
    this.batteries = new ITSBatteries(this); // contains all the available batteries
    this.screenTemplates = new ITSScreenTemplates(this); // contains all the available screen templates
    this.reports = new ITSReports(this, this); // contains all available reports of all types
    this.graph = new ITSGraph(this,this); // a graph object for helping to show and edit graphs

    // controller objects
    this.loginController = new ITSLoginController(this);
    this.logoutController = new ITSLogoutController(this);
    this.initializePortletsController = new ITSInitializePortlets(this);
    this.portletSelectCompany = new ITSPortletSelectCompany(this);
    this.portletSelectSession = new ITSPortletSelectSession(this);
    this.passwordResetController = new ITSPasswordResetController();

    // runtime object
    this.currentTest = {}; // the test currently being viewed, calculated, taken etc
    this.currentSession = {}; // the session currently being viewed or taken
    this.testTaking = {}; // the test taking object when in test taking for the current session and candidate

    // UI objects
    this.UIController = new ITSUIController(this);
    this.testTakingController = new ITSTestTakingController(this);

    // messagebus
    this.MessageBus = new ITSMessageBus();

};

ITSEmptyObject = function () {
    this.ID = "";
}

// generic support functions
ITSSession.prototype.genericAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, OnNewChild, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString) {
    console.log('ajax load : ' + this.baseURLAPI + URL + ' - ' + ITSInstance.token.IssuedToken);
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID};
    tempHeaders['StartPage'] = "-1";
    tempHeaders['PageSize'] = "0";
    tempHeaders['Sort'] = "";
    //tempHeaders['IncludeArchived'] = "N";
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    tempHeaders['TimeZoneOffset'] = "" + moment().utcOffset() / 60; //(new Date()).getTimezoneOffset()/60;
    if (Filter) {
        if (Filter != "") tempHeaders['Filter'] = Filter;
    }

    if (PageNumber >= -1) {
        tempHeaders['StartPage'] = "" + PageNumber;
    }
    if (PageSize > -1) {
        tempHeaders['PageSize'] = "" + PageSize;
    }
    if (PageSort) {
        tempHeaders['Sort'] ="" +  PageSort;
    }
    if (IncludeArchived) {
        tempHeaders['IncludeArchived'] = IncludeArchived;
    }
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster;
    }
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient;
    }
    if (UnifiedSearchString) {
        if (UnifiedSearchString != "") tempHeaders['SearchField'] = UnifiedSearchString;
    }

    $.ajax({
        url: this.baseURLAPI + URL,
        headers: tempHeaders,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Ajax error : " + xhr.status + " - " + thrownError);
            console.log(URL + " = " + JSON.stringify(tempHeaders));
            OnError();
        },
        success: function (data, textStatus, xhr) {
            //console.log(ITSInstance.baseURLAPI + URL + '=' + data);
            if ( (objectToPutDataIn != '') || ($.isArray(objectToPutDataIn)) ) {
                //console.log(data);
                //var checkForArray = JSON.parse(data);
                if ($.isArray(data)) {
                    // this is an array, process it, objectToPutDataIn will be ignored in this cases
                    for (var i = 0; i < data.length; i++) {
                        // get an object to store the data in
                        if (OnNewChild !== undefined) {
                            var newChild = OnNewChild();
                            shallowCopy(data[i], newChild);
                            if (typeof newChild.afterLoad !== "undefined") {
                                newChild.afterLoad();
                            }
                        } else {
                            objectToPutDataIn.push(data[i]);
                        }
                    }
                } else {
                    // this is NOT an array
                    shallowCopy(data, objectToPutDataIn);
                    if (typeof objectToPutDataIn.afterLoad !== "undefined") {
                        objectToPutDataIn.afterLoad();
                    }
                }
                OnSuccess();
            }
        },
        type: 'GET'
    });
};

ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString) {
    console.log('ajax JSON load : ' + this.baseURLAPI + URL + ' - ' + ITSInstance.token.IssuedToken);
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID};
    tempHeaders['StartPage'] = "-1";
    tempHeaders['PageSize'] = "0";
    tempHeaders['Sort'] = "";
    //tempHeaders['IncludeArchived'] = "N";
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    tempHeaders['SearchField'] = "";
    tempHeaders['TimeZoneOffset'] = "" + moment().utcOffset() / 60; //(new Date()).getTimezoneOffset()/60;
    if (UnifiedSearchString) {
        if (UnifiedSearchString != "") tempHeaders['SearchField'] = UnifiedSearchString;
    }
    if (Filter) {
        tempHeaders['Filter'] = "" + Filter;
    }

    if (PageNumber >= -1) {
        tempHeaders['StartPage'] = "" + PageNumber;
    }
    if (PageSize > -1) {
        tempHeaders['PageSize'] = "" + PageSize;
    }
    if (PageSort) {
        tempHeaders['Sort'] = "" + PageSort;
    }
    if (IncludeArchived) {
        tempHeaders['IncludeArchived'] = IncludeArchived ;
    }
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster;
    }
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient;
    }

    $.ajax({
        url: this.baseURLAPI + URL,
        headers: tempHeaders,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Ajax error : " + xhr.status + " - " + thrownError);
            console.log(URL + " = " + JSON.stringify(tempHeaders));
            if (OnError) OnError(xhr, ajaxOptions, thrownError);
        },
        dataType: "text",
        success: function (data, textStatus, xhr) {
            //console.log(ITSInstance.baseURLAPI + URL + '=' + data);
            if ((objectToPutDataIn) && (objectToPutDataIn !== "") ) {
                ITSJSONLoad(objectToPutDataIn, data, objectToPutDataIn, ITSInstance, DefaultObjectType);
                if (OnSuccess) OnSuccess();
            } else if (objectToPutDataIn === "") {
                if (OnSuccess) OnSuccess(data);
            }
        },
        type: 'GET'
    });
};

ITSSession.prototype.genericAjaxUpdate = function (URL, objectToUpdate, OnSuccess, OnError, IncludeMaster, IncludeClient, dataType) {
    console.log('ajax update or create : ' + this.baseURLAPI + URL + ' - ' + ITSInstance.token.IssuedToken);
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID};
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster ;
    }
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient ;
    }
    tempHeaders['TimeZoneOffset'] = "" + moment().utcOffset() / 60; //(new Date()).getTimezoneOffset()/60;

    processDataCall = true;
    contentTypeCall = 'application/x-www-form-urlencoded; charset=UTF-8';
    if (dataType) { contentTypeCall = dataType; processDataCall = false; }

    $.ajax({
        url: this.baseURLAPI + URL,
        headers: tempHeaders,
        contentType : contentTypeCall,
        processData : processDataCall,
        data : objectToUpdate,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Ajax update or create error : " + xhr.status + " - " + thrownError);
            OnError(thrownError, xhr, ajaxOptions);
        },
        success: function (data, textStatus, xhr) {
            //console.log(ITSInstance.baseURLAPI + URL + '=' + data);
            OnSuccess();
        },
        type: 'POST'
    });
};

ITSSession.prototype.genericAjaxDelete = function (URL, OnSuccess, OnError, IncludeMaster, IncludeClient) {
    console.log('ajax delete : ' + this.baseURLAPI + URL + ' - ' + ITSInstance.token.IssuedToken);
    var tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID};
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster ;
    }
    tempHeaders['IncludeClient'] = "Y" ;
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient ;
    }
    tempHeaders['TimeZoneOffset'] = "" + moment().utcOffset() / 60; //(new Date()).getTimezoneOffset()/60;

    $.ajax({
        url: this.baseURLAPI + URL,
        headers: tempHeaders,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Ajax delete error : " + xhr.status + " - " + thrownError);
            console.log(URL + " = " + JSON.stringify(tempHeaders));
            OnError();
        },
        success: function (data, textStatus, xhr) {
            //console.log(ITSInstance.baseURLAPI + URL + '=' + data);
            OnSuccess();
        },
        type: 'DELETE'
    });
};

ITSSession.prototype.uploadFile = function(URL, data, OnSuccess, OnError) {
    console.log('upload file: ' + this.baseURLAPIFiles + URL + ' - ' + ITSInstance.token.IssuedToken);

    var oReq = new XMLHttpRequest();
    oReq.open("POST", this.baseURLAPIFiles + URL, true);
    //oReq.requestType = "arraybuffer";
    //oReq.request = data;
    oReq.setRequestHeader ('SessionID', ITSInstance.token.IssuedToken);
    oReq.setRequestHeader ('CompanyID', ITSInstance.token.companyID);
    oReq.setRequestHeader ('TimeZoneOffset', moment().utcOffset() / 60); //(new Date()).getTimezoneOffset()/60;);
    if (OnSuccess) { oReq.onload = (
        function () {
            OnSuccess();
        }).bind(OnSuccess); }
    if (OnError) { oReq.onerror = (function () { OnError(); }).bind(OnError); }

    var nBytes = data.length, ui8Data = new Uint8Array(nBytes);
    for (var nIdx = 0; nIdx < nBytes; nIdx++) {
        ui8Data[nIdx] = data.charCodeAt(nIdx) & 0xff;
    }
    oReq.send(ui8Data);
};

ITSSession.prototype.downloadFile = function(URL, OnSuccess, OnError) {
    console.log('download file: ' + this.baseURLAPIFiles + URL + ' - ' + ITSInstance.token.IssuedToken);

    var oReq = new XMLHttpRequest();
    oReq.open("GET", this.baseURLAPIFiles + URL, true);
    oReq.responseType = "arraybuffer";
    oReq.setRequestHeader ('SessionID', ITSInstance.token.IssuedToken);
    oReq.setRequestHeader ('CompanyID', ITSInstance.token.companyID);
    oReq.setRequestHeader ('TimeZoneOffset', moment().utcOffset() / 60); //(new Date()).getTimezoneOffset()/60;
    oReq.onload = function(oEvent) {
        var arrayBuffer = oReq.response;

        OnSuccess(arrayBuffer);

    };
    if (OnError) { oReq.onerror = OnError; }
    oReq.send();
};

ITSSession.prototype.downloadImage = function (image, URL, OnSuccess, OnError) {
    this.downloadFile(URL, this.downloadImageSuccess.bind(this, image, OnSuccess), OnError);
};

ITSSession.prototype.downloadImageSuccess = function (image, OnSuccess, data) {
    var blob = new Blob([data]);
    var url = URL.createObjectURL(blob);
    image.src = url;
    if (OnSuccess) { OnSuccess(); }
};

function setCopyrightMessage(CopyrightString) {
    // change the standard stuff in the interface
    $('#CompanyName').text(CompanyName);
    $('#CopyrightText1').text(CopyrightString);
    $('#CopyrightText2').text(CopyrightString);
    $('#CopyrightText3').text(CopyrightString);
    $('#CopyrightText4').text(CopyrightString);
    $('#CopyrightText5').text(CopyrightString);
    $('#CopyrightTextSession').text(CopyrightString);

    $('#LoginWindowCompanyName').text(CompanyName);
    $('#LoginWindowWelcomeDiv').css("visibility", "visible");
};

function ITSTranslateInterface() {
    // translate the interface in the proper language
    ITSInstance.translator.load();
    ITSInstance.translator.translateDiv('#LoginWindow');
    //ITSInstance.translator.translateDiv('#NavBarsAdminSidebarMenu');
    ITSInstance.translator.translateDiv('#NavbarsAdmin');
    ITSInstance.translator.translateDiv('#NavBarsAdminSidebar');
    ITSInstance.translator.translateDiv('#TestTakingInterface');
    ITSInstance.translator.translateDiv('#LoginWindowSelectCompany');
    ITSInstance.translator.translateDiv('#ForgotWindow');
    ITSInstance.translator.translateDiv('#PasswordResetWindow');
    ITSInstance.translator.translateDiv('#AdminInterface');
    ITSInstance.translator.translateDiv('#NavbarsTestTaking');
}

function moveFooterToRightPosition() {
    if ($(document).height() > $(window).height()) {
        $('#NavBarsFooter').css({'top': '50px'})
        $('#NavBarsFooter').css({'position': 'relative'})
    } else {
        $('#NavBarsFooter').css({'position': 'absolute'})
        $('#NavBarsFooter').css({'top': Math.min($(document).height(), $(window).height()) - $('#NavBarsFooter').height() + 'px'})
    }
};

function resizeFunction() {
    onResize();
};

function getCopyrightMessage() {
    var companyID = "";
    if (ITSInstance.companies.currentCompany) {
        companyID = ITSInstance.companies.currentCompany.ID;
    }
    var req = $.ajax({
        url: ITSInstance.baseURLAPI + 'copyright',
        context: this,
        headers: {
            'CompanyID': companyID
        },
        error: function () {
            console.log('Retrieving copyright information failed.');
        },
        success: function (data, textStatus, xhr) {
            if (data != ""){
                CopyrightString = data;
            }
            console.log("All information exchanged through this interface and website is copyrighted " + CopyrightString );
            setCopyrightMessage(CopyrightString);
        },
        type: 'GET'
    });
    var req = $.ajax({
        url: ITSInstance.baseURLAPI + 'companyname',
        context: this,
        error: function () {
            console.log('Retrieving company name failed.');
        },
        success: function (data, textStatus, xhr) {
            if (data != ""){
                CompanyName = data;
            }
            setCopyrightMessage(CopyrightString);
        },
        type: 'GET'
    });
    var req = $.ajax({
        url: ITSInstance.baseURLAPI + 'companylogo',
        context: this,
        error: function () {
            console.log('Retrieving company logo failed.');
        },
        success: function (data, textStatus, xhr) {
            if (data != ""){
                ITSBackgroundImage = data;
                loginWindowLoadImage(data);
            } else {
                loginWindowLoadImage("background.png");
            }
        },
        type: 'GET'
    });
}

OldURLparseURLandTakeAction = '';
function parseURLandTakeAction() {
    if (OldURLparseURLandTakeAction != document.URL) {
        // catch the current URL
        OldURLparseURLandTakeAction = document.URL;
        // init any bootstrap components only when the URL changes
        setTimeout(init_bootstrap_components,1000);
        // parse the path
        if (getUrlParameterValue('Path')) {
            // check if the ITS session is valid
            if (ITSInstance.token.get() != "") {
                //ITSInstance.token.keepTokenFresh();
                ITSInstance.UIController.activateScreenPath(getUrlParameterValue('Path'));
            } else {
                if (getUrlParameterValue('Token') && getUrlParameterValue('Path') && getUrlParameterValue('CompanyID') && getUrlParameterValue('SessionID')) {
                    ITSInstance.token.IssuedToken = getUrlParameterValue("Token");
                    ITSInstance.token.companyID = getUrlParameterValue("CompanyID");
                    // disable the logout button and the menu
                    $('#NavbarsAdminLogoutButton').hide();
                    $('#NavBarsAdminSidebarMenu')[0].outerHTML = "";
                    history.pushState('Switchboard', 'Switchboard', Global_OriginalURL + '?Path=' + getUrlParameterValue('Path') + "&SessionID=" + getUrlParameterValue('SessionID'));
                } else {
                    ITSInstance.UIController.activateScreenPath('Login');
                }
            }
            if (getUrlParameterValue('Path') == 'PasswordReset') {
                ITSInstance.UIController.activateScreenPath(getUrlParameterValue('Path'));
            }
        } else {
            if (getUrlParameterValue('Token') && getUrlParameterValue('TestTakingOnly') && getUrlParameterValue('CompanyID')) {
                ITSInstance.UIController.activateScreenPath('TestTakingPublic');
                ITSInstance.UIController.prepareTestRunSession();
                history.pushState('Switchboard', 'Switchboard', Global_OriginalURL + '?Path=TestTakingPublic');
            } else {
                ITSInstance.UIController.activateScreenPath('Login');
            }
        }
    }
    setTimeout(parseURLandTakeAction, 500); // check for URL changes periodically
    init_html_editor(); // init any html editor components for the tinymce editor open source edition
    moveFooterToRightPosition();
}

// Create the global ITSInstance
if (!ITSInstance) {
    var ITSInstance;
    ITSInitSession();
    if ((ITSInstance.token.get() != "") && getUrlParameterValue('Path') ) {
        ITSInstance.loginController.activateCurrentUser(false);
    }

    getCopyrightMessage();
    // refresh token every minute or so
    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.token.keepTokenFresh.bind(ITSInstance.token ));
    // make sure all new required translations are posted and machine translated
    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.translator.postNewTranslationsNoPars.bind(ITSInstance.translator) );
    // update the copyright message if logged in
    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", getCopyrightMessage);

    if (cookieHelper.getCookie('ITRLanguage') != "") {
        ITSInstance.translator.switchLanguage(cookieHelper.getCookie('ITRLanguage'));
    }
}

function calcGlobalOriginalUrl() {
    Global_OriginalURL = document.location.toString();
    if (Global_OriginalURL.indexOf("?") > 0) {
        Global_OriginalURL = Global_OriginalURL.substr(0, Global_OriginalURL.indexOf("?"));
    }
}

// now check if there are parameters on the command line we need to parse
// parse the command line parameters
if (getUrlParameterValue('UserID')) {
    $('#LoginWindowinputUsername').val(getUrlParameterValue('UserID'));
}
if (getUrlParameterValue('Password')) {
    $('#LoginWindowinputPassword').val(getUrlParameterValue('Password'));
}
ITSURLToken = "";
if (getUrlParameterValue('Token')) {
    ITSURLToken = getUrlParameterValue('Token');
}

parseURLandTakeAction();

// init the ITS session and all the other required GLOBALS
function ITSInitSession() {
    console.log('Init ITS session');
    calcGlobalOriginalUrl();
    ITSInstance = new ITSSession(); // this object is always present in the global context
    if (getUrlParameterValue('Path') != 'Login' || getUrlParameterValue('Path') != 'Switchboard' || getUrlParameterValue('Path') != undefined) {
        if (getUrlParameterValue('Path') == 'Login' || getUrlParameterValue('Path') == undefined) {
        } else {
            //OldURLparseURLandTakeAction = '';
            //ITSRedirectPath('Switchboard');
        }
    }
    setCopyrightMessage(CopyrightString);

    ITSTranslateInterface();
}