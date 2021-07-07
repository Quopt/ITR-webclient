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
    this.hook = {}; // a hook object for screen templates or other temporary functions/objects

    // messagebus
    this.MessageBus = new ITSMessageBus();

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
    this.actions = new ITSActionList(this); // the list of actions that can be used throughout the system

    // UI objects
    this.UIController = new ITSUIController(this);
    this.testTakingController = new ITSTestTakingController(this);

    // generic support functions
    this.genericLoadQueue = [];
    this.genericJSONLoadQueue = [];
    this.genericJSONUpdateQueue = [];
    this.callProcessing = false;
    this.callJSONLoaderProcessing = false;

    // current user special surface state flags
    this.MultipleSessionsFound = false;
    this.MultipleCompaniesFound = false;

    // calc browser ID
    this.BrowserID = newGuid();
};

ITSEmptyObject = function () {
    this.ID = "";
}

ITSSession.prototype.genericAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, OnNewChild, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString, preferred) {
    if (typeof preferred == "undefined") preferred = false;
    var objectToPush = {
        "URL": URL,
        "objectToPutDataIn": objectToPutDataIn,
        "OnSuccess": OnSuccess,
        "OnError": OnError,
        "OnNewChild": OnNewChild,
        "PageNumber": PageNumber,
        "PageSize": PageSize,
        "PageSort": PageSort,
        "IncludeArchived": IncludeArchived,
        "IncludeMaster": IncludeMaster,
        "IncludeClient": IncludeClient,
        "Filter": Filter,
        "UnifiedSearchString": UnifiedSearchString
        };
    if (preferred) {
        this.genericLoadQueue.splice(1,0,objectToPush);
    } else {
        this.genericLoadQueue.push(objectToPush);
    }
    //console.log("Push",URL, this.genericLoadQueue.length);
    this.genericAjaxLoaderProcessQueue();
};

ITSSession.prototype.genericAjaxLoaderProcessQueue = function () {
    if (!this.callProcessing) {
        if (this.genericLoadQueue.length > 0) {
            this.callProcessing = true;
            var x = this.genericLoadQueue[0];
            //console.log("Acquiring", x);
            this.genericAjaxLoaderRunner(x.URL,
                x.objectToPutDataIn,
                function (data, textStatus, xhr) {
                    var x = this.genericLoadQueue[0];
                    this.callProcessing = false;
                    //console.log("OK", x);
                    if (typeof x.OnSuccess != "undefined") setTimeout(x.OnSuccess.bind(x,data, textStatus, xhr),1);
                    this.genericLoadQueue.splice(0,1);
                    this.genericAjaxLoaderProcessQueue();
                }.bind(this),
                function (xhr, ajaxOptions, thrownError) {
                    var x = this.genericLoadQueue[0];
                    this.callProcessing = false;
                    if (typeof x.OnError != "undefined") setTimeout(x.OnError.bind(x, xhr, ajaxOptions, thrownError),1);
                    this.genericLoadQueue.splice(0,1);
                    this.genericAjaxLoaderProcessQueue();
                }.bind(this),
                x.OnNewChild,
                x.PageNumber,
                x.PageSize,
                x.PageSort,
                x.IncludeArchived,
                x.IncludeMaster,
                x.IncludeClient,
                x.Filter,
                x.UnifiedSearchString);
        }
    }
};

ITSSession.prototype.genericAjaxLoaderRunner = function (URL, objectToPutDataIn, OnSuccess, OnError, OnNewChild, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString) {
    ITSLogger.logMessage(logLevel.INFO,'ajax load : ' + this.baseURLAPI + URL );
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID, 'BrowserID': ITSInstance.BrowserID};
    tempHeaders['StartPage'] = "-1";
    tempHeaders['PageSize'] = "0";
    tempHeaders['Sort'] = "";
    //tempHeaders['IncludeArchived'] = "N";
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    tempHeaders['ITRLang'] = ITSLanguage;
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
            ITSLogger.logMessage(logLevel.ERROR,"Ajax error : " + xhr.status + " - " + thrownError);
            //ITSLogger.logMessage(logLevel.ERROR,URL + " = " + JSON.stringify(tempHeaders));
            OnError(xhr, ajaxOptions, thrownError);
        },
        success: function (data, textStatus, xhr) {
            //ITSLogger.logMessage(logLevel.ERROR,ITSInstance.baseURLAPI + URL + '=' + data + ' to ' + objectToPutDataIn);
            if ( (typeof objectToPutDataIn != "undefined") && (($.isArray(objectToPutDataIn) || (objectToPutDataIn != '')) ) ) {
                //ITSLogger.logMessage(logLevel.ERROR,data);
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
            }
            OnSuccess(data, textStatus, xhr);
        },
        type: 'GET'
    });
};
ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString, preferred) {
    if (typeof preferred == "undefined") preferred = false;
    var objectToPush =
        {
            "URL": URL,
            "objectToPutDataIn" : objectToPutDataIn,
            "OnSuccess" : OnSuccess,
            "OnError" : OnError,
            "DefaultObjectType" : DefaultObjectType,
            "PageNumber" : PageNumber,
            "PageSize" : PageSize,
            "PageSort" : PageSort,
            "IncludeArchived" : IncludeArchived,
            "IncludeMaster" : IncludeMaster,
            "IncludeClient" : IncludeClient,
            "Filter" : Filter,
            "UnifiedSearchString" : UnifiedSearchString
        };
    if (preferred) {
        this.genericJSONLoadQueue.splice(1,0,objectToPush);
    } else {
        this.genericJSONLoadQueue.push(objectToPush);
    }
    //console.log("Push",URL, this.genericJSONLoadQueue.length);
    this.JSONAjaxLoaderProcessQueue();
};

ITSSession.prototype.JSONAjaxLoaderProcessQueue = function () {
    if (!this.callJSONLoaderProcessing) {
        if (this.genericJSONLoadQueue.length > 0) {
            this.callJSONLoaderProcessing = true;
            var x = this.genericJSONLoadQueue[0];
            //console.log("Acquiring", x);
            this.JSONAjaxLoaderRunner(x.URL,
                x.objectToPutDataIn,
                function (data) {
                    var x = this.genericJSONLoadQueue[0];
                    this.callJSONLoaderProcessing = false;
                    //console.log("OK", x, data);
                    if (typeof x.OnSuccess != "undefined") setTimeout(x.OnSuccess.bind(x, data),1);
                    this.genericJSONLoadQueue.splice(0,1);
                    this.JSONAjaxLoaderProcessQueue();
                }.bind(this),
                function (xhr, ajaxOptions, thrownError) {
                    var x = this.genericJSONLoadQueue[0];
                    this.callJSONLoaderProcessing = false;
                    if (typeof x.OnError != "undefined") setTimeout(x.OnError.bind(x,xhr, ajaxOptions, thrownError),1);
                    this.genericJSONLoadQueue.splice(0,1);
                    this.JSONAjaxLoaderProcessQueue();
                }.bind(this),
                x.DefaultObjectType,
                x.PageNumber,
                x.PageSize,
                x.PageSort,
                x.IncludeArchived,
                x.IncludeMaster,
                x.IncludeClient,
                x.Filter,
                x.UnifiedSearchString);
        }
    }
};

ITSSession.prototype.JSONAjaxLoaderRunner = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter, UnifiedSearchString) {
    ITSLogger.logMessage(logLevel.INFO,'ajax JSON load : ' + this.baseURLAPI + URL + " M/C=" + IncludeMaster + "/" + IncludeClient);
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID, 'BrowserID': ITSInstance.BrowserID};
    tempHeaders['StartPage'] = "-1";
    tempHeaders['PageSize'] = "0";
    tempHeaders['Sort'] = "";
    //tempHeaders['IncludeArchived'] = "N";
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    tempHeaders['SearchField'] = "";
    tempHeaders['ITRLang'] = ITSLanguage;
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
            ITSLogger.logMessage(logLevel.ERROR,"Ajax error : " + xhr.status + " - " + thrownError);
            //ITSLogger.logMessage(logLevel.ERROR,URL + " = " + JSON.stringify(tempHeaders));
            if (OnError) OnError(xhr, ajaxOptions, thrownError);
        },
        dataType: "text",
        success: function (data, textStatus, xhr) {
            //ITSLogger.logMessage(logLevel.ERROR,ITSInstance.baseURLAPI + URL + '=' + data);
            if ((objectToPutDataIn) && (objectToPutDataIn !== "") ) {
                try {
                    ITSJSONLoad(objectToPutDataIn, data, objectToPutDataIn, ITSInstance, DefaultObjectType);
                    //console.log(objectToPutDataIn,data);
                }
                catch (err) {
                    ITSLogger.logMessage(logLevel.ERROR, 'JSONAjaxLoaderRunner data cannot be processed ' + err.message);
                }
                if (OnSuccess) OnSuccess();
            } else if (objectToPutDataIn === "") {
                if (OnSuccess) OnSuccess(data);
            }
        },
        timeout:10000,
        type: 'GET'
    });
};

ITSSession.prototype.genericAjaxUpdate = function (URL, objectToUpdate, OnSuccess, OnError, IncludeMaster, IncludeClient, dataType, ForceTranslation, label, sessionid) {
    // if label is set remove all items from the queue with this label first
    if (typeof label==="string" && label != "") {
        var elements = this.genericJSONUpdateQueue.length - 1;
        while (elements >= 1) {
            if (this.genericJSONUpdateQueue[elements].label === label) {
                this.genericJSONUpdateQueue.splice(elements,1);
            }
            elements--;
        }
    }
    this.genericJSONUpdateQueue.push(
        {
            "URL": URL,
            "objectToUpdate" : objectToUpdate,
            "OnSuccess" : OnSuccess,
            "OnError" : OnError,
            "IncludeMaster" : IncludeMaster,
            "IncludeClient" : IncludeClient,
            "dataType" : dataType,
            "ForceTranslation" : ForceTranslation,
            "label" : label,
            "SessionId" : sessionid
        }
    );
    //console.log("Push",URL, this.genericJSONLoadQueue.length);
    this.GenericAjaxUpdateProcessQueue();
};

ITSSession.prototype.GenericAjaxUpdateQueueLength = function () {
    return this.genericJSONUpdateQueue.length;
}

ITSSession.prototype.GenericAjaxUpdateProcessQueue = function () {
    if (!this.callJSONUpdateProcessing) {
        if (this.genericJSONUpdateQueue.length > 0) {
            this.callJSONUpdateProcessing = true;
            var x = this.genericJSONUpdateQueue[0];
            //console.log("Acquiring", x);
            this.genericAjaxUpdateRunner(x.URL,
                x.objectToUpdate,
                function (data) {
                    var x = this.genericJSONUpdateQueue[0];
                    this.callJSONUpdateProcessing = false;
                    //console.log("OK", x);
                    if (typeof x.OnSuccess != "undefined") setTimeout(x.OnSuccess.bind(x, data),1);
                    this.genericJSONUpdateQueue.splice(0,1);
                    this.GenericAjaxUpdateProcessQueue();
                }.bind(this),
                function (xhr, ajaxOptions, thrownError) {
                    var x = this.genericJSONUpdateQueue[0];
                    this.callJSONUpdateProcessing = false;
                    if (typeof x.OnError != "undefined") setTimeout(x.OnError.bind(x,xhr, ajaxOptions, thrownError),1);
                    this.genericJSONUpdateQueue.splice(0,1);
                    this.GenericAjaxUpdateProcessQueue();
                }.bind(this),
                x.IncludeMaster,
                x.IncludeClient,
                x.dataType,
                x.ForceTranslation,
                x.SessionId);
        }
    }
};
ITSSession.prototype.genericAjaxUpdateRunner = function (URL, objectToUpdate, OnSuccess, OnError, IncludeMaster, IncludeClient, dataType, ForceTranslation, sessionid) {
    ITSLogger.logMessage(logLevel.INFO,'ajax update or create : ' + this.baseURLAPI + URL);
    tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID, 'BrowserID': ITSInstance.BrowserID};
    tempHeaders['IncludeMaster'] = "N";
    tempHeaders['IncludeClient'] = "Y";
    tempHeaders['ITRLang'] = ITSLanguage;
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster ;
    }
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient ;
    }
    if (ForceTranslation){
        tempHeaders['ForceTranslation'] = ForceTranslation
    }
    if (sessionid) {
        tempHeaders['LinkedSessionId'] = sessionid
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
            ITSLogger.logMessage(logLevel.ERROR,"Ajax update or create error : " + xhr.status + " - " + thrownError);
            OnError(thrownError, xhr, ajaxOptions);
        },
        success: function (data, textStatus, xhr) {
            //ITSLogger.logMessage(logLevel.ERROR,ITSInstance.baseURLAPI + URL + '=' + data);
            OnSuccess();
        },
        type: 'POST'
    });
};

ITSSession.prototype.genericAjaxDelete = function (URL, OnSuccess, OnError, IncludeMaster, IncludeClient) {
    ITSLogger.logMessage(logLevel.INFO,'ajax delete : ' + this.baseURLAPI + URL );
    var tempHeaders = {'SessionID': ITSInstance.token.IssuedToken, 'CompanyID': ITSInstance.token.companyID, 'BrowserID': ITSInstance.BrowserID};
    if (IncludeMaster) {
        tempHeaders['IncludeMaster'] = IncludeMaster ;
    }
    tempHeaders['IncludeClient'] = "Y" ;
    tempHeaders['ITRLang'] = ITSLanguage;
    if (IncludeClient) {
        tempHeaders['IncludeClient'] = IncludeClient ;
    }
    tempHeaders['TimeZoneOffset'] = "" + moment().utcOffset() / 60; //(new Date()).getTimezoneOffset()/60;

    $.ajax({
        url: this.baseURLAPI + URL,
        headers: tempHeaders,
        error: function (xhr, ajaxOptions, thrownError) {
            ITSLogger.logMessage(logLevel.ERROR,"Ajax delete error : " + xhr.status + " - " + thrownError);
            //ITSLogger.logMessage(logLevel.ERROR,URL + " = " + JSON.stringify(tempHeaders));
            OnError();
        },
        success: function (data, textStatus, xhr) {
            //ITSLogger.logMessage(logLevel.ERROR,ITSInstance.baseURLAPI + URL + '=' + data);
            OnSuccess();
        },
        type: 'DELETE'
    });
};

ITSSession.prototype.uploadFile = function(URL, data, OnSuccess, OnError) {
    ITSLogger.logMessage(logLevel.INFO,'upload file: ' + this.baseURLAPIFiles + URL );

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
    ITSLogger.logMessage(logLevel.INFO,'download file: ' + this.baseURLAPIFiles + URL );

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
    $('#CopyrightText6').text(CopyrightString);
    $('#CopyrightText7').text(CopyrightString);
    $('#CopyrightTextSession').text(CopyrightString);

    $('#LoginWindowCompanyName').text(CompanyName);
    $('#LoginWindowWelcomeDiv').css("visibility", "visible");
};

function ITSTranslateInterface() {
    // translate the interface in the proper language
    ITSInstance.translator.load();
    ITSInstance.translator.translateDiv('#LoginWindow');
    ITSInstance.translator.translateDiv('#NavbarsAdmin');
    ITSInstance.translator.translateDiv('#NavBarsAdminSidebar');
    ITSInstance.translator.translateDiv('#TestTakingInterface');
    ITSInstance.translator.translateDiv('#LoginWindowSelectCompany');
    ITSInstance.translator.translateDiv('#ForgotWindow');
    ITSInstance.translator.translateDiv('#PasswordResetWindow');
    ITSInstance.translator.translateDiv('#AdminInterface');
    ITSInstance.translator.translateDiv('#NavbarsTestTaking');
    ITSInstance.translator.translateDiv('#LoginWindowMfaQRSetup');
    ITSInstance.translator.translateDiv('#LoginWindowEnterMfaCode');
    ITSInstance.translator.translateDiv('#ITSTestTakingDivTestEnded');
    ITSInstance.translator.translateDiv('#ITSTestTakingDivSessionEnded');
    ITSInstance.translator.translateDiv('#ITSTestTakingDivSessionEndedShowReport');
    ITSInstance.translator.translateDiv('#waitModal');
}

function moveFooterToRightPosition() {
    if ($(document).height() > $(window).height()) {
        //$('#NavBarsFooter').css({'top': '50px'})
        $('#NavBarsFooter').css({'position': 'relative'})
        $('#NavBarsFooter').css({'top': Math.min($(document).height(), $(window).height()) + $('#NavBarsFooter').height() + 50 + 'px'})
    } else {
        $('#NavBarsFooter').css({'position': 'absolute'})
        $('#NavBarsFooter').css({'top': Math.min($(document).height(), $(window).height()) + $('#NavBarsFooter').height() + 50 + 'px'})
    }
};

function resizeFunction() {
    onResize();
};

function getActiveSessions() {
    var companyID = "";
    if (ITSInstance.companies.currentCompany) {
        companyID = ITSInstance.companies.currentCompany.ID;
    }
    var ttUser = false;
    try {
        ttUser = ITSInstance.users.currentUser.IsTestTakingUser;
    } catch (err) { };
    if (! ttUser) {
        var req = $.ajax({
            url: ITSInstance.baseURLAPI + 'activesessions',
            context: this,
            headers: {
                'CompanyID': companyID,
                'SessionID': ITSInstance.token.IssuedToken,
                'BrowserID': ITSInstance.BrowserID
            },
            error: function () {
                ITSLogger.logMessage(logLevel.ERROR, 'Retrieving amount of active sessions failed.');
            },
            success: function (data, textStatus, xhr) {
                if (data != "") {
                    $('#NavBarActiveSessionsMenuLabelDisplayed').text(format($('#NavBarActiveSessionsMenuLabel').text(), [data]));
                }
            },
            type: 'GET'
        });
    }
}

function getCopyrightMessage() {
    var companyID = "";
    if (ITSInstance.companies.currentCompany) {
        companyID = ITSInstance.companies.currentCompany.ID;
    }
    var req = $.ajax({
        url: ITSInstance.baseURLAPI + 'copyright',
        context: this,
        headers: {
            'BrowserID': ITSInstance.BrowserID,
            'CompanyID': companyID
        },
        error: function () {
            ITSLogger.logMessage(logLevel.ERROR,'Retrieving copyright information failed.');
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
        headers: { 'BrowserID': ITSInstance.BrowserID },
        context: this,
        error: function () {
            ITSLogger.logMessage(logLevel.ERROR,'Retrieving company name failed.');
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
        headers: { 'BrowserID': ITSInstance.BrowserID },
        context: this,
        error: function () {
            ITSLogger.logMessage(logLevel.ERROR,'Retrieving company logo failed.');
        },
        success: function (data, textStatus, xhr) {
            if (data != ""){
                ITSBackgroundImage = data;
                loginWindowLoadImage(data);
            } else {
                loginWindowLoadImage("images/background.png");
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
    $('.bootstrap-toggle').bootstrapToggle(); // enable all bootstrap toggles
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
    // update the amount of active sessions
    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", getActiveSessions);
    // refresh the consultant list
    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", function () {
        ITSInstance.users.loadUsers(function (){}, function (){});
     });
    ITSInstance.MessageBus.subscribe('CurrentUser.Loaded',
        function () {
            if ((ITSInstance.users.currentUser.HasEducationalOfficeAccess) && (ITSInstance.users.currentUser.HasTestingOfficeAccess)) {
                document.title = ITSInstance.translator.getTranslatedString('default', 'TitleTestTeaching', 'ITR - The Internet Test & Teaching Room');
            }
            if ((ITSInstance.users.currentUser.HasEducationalOfficeAccess) && (!ITSInstance.users.currentUser.HasTestingOfficeAccess)) {
                document.title = ITSInstance.translator.getTranslatedString('default', 'TitleTeaching', 'ITR - The Internet Teaching Room');
            }
            if ((!ITSInstance.users.currentUser.HasEducationalOfficeAccess) && (ITSInstance.users.currentUser.HasTestingOfficeAccess)) {
                document.title = ITSInstance.translator.getTranslatedString('default', 'TitleTest', 'ITR - The Internet Test Room');
            }
        });

    if (cookieHelper.getCookie('ITRLanguage') != "") {
        ITSInstance.translator.switchLanguage(cookieHelper.getCookie('ITRLanguage'), function () { ITSInstance.UIController.loadTranslationsDropDown(); });
    }
}

function calcGlobalOriginalUrl() {
    Global_OriginalURL = document.location.toString();
    if (Global_OriginalURL.indexOf("?") > 0) {
        Global_OriginalURL = Global_OriginalURL.substr(0, Global_OriginalURL.indexOf("?"));
    }
}

// init the ITS session and all the other required GLOBALS
function ITSInitSession() {
    ITSLogger.logMessage(logLevel.INFO,'Init ITS session');
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

// now check if there are parameters on the command line we need to parse
// parse the command line parameters
if (getUrlParameterValue('UserID')) {
    $('#LoginWindowinputUsername').val(getUrlParameterValue('UserID'));
}
if (getUrlParameterValue('Password')) {
    $('#LoginWindowinputPassword').val(getUrlParameterValue('Password'));
}
if (getUrlParameterValue('ReturnURL')) {
    cookieHelper.setCookie('ReturnURL', getUrlParameterValue('ReturnURL'), 600);
}
if (getUrlParameterValue('AutoLogin')) {
    OldURLparseURLandTakeAction = document.URL;
    ITSInstance.token.clear();
    ITSInstance.users.resetCurrentUser();
    setTimeout(function () {
        $('#LoginWindowLoginButton').click();
      }, 100);
}
if (getUrlParameterValue('Poll')) {
    OldURLparseURLandTakeAction = document.URL;
    sessionStorage.setItem("Poll", getUrlParameterValue('Poll'));
    setTimeout(function () {
        $('#LoginWindowLoginButton').click();
    }, 100);
}
if (getUrlParameterValue('NoTTHeader')) {
    cookieHelper.setCookie('NoTTHeader', 'Y', 600);
}
if (getUrlParameterValue('Coupon')) {
    cookieHelper.setCookie('Coupon', getUrlParameterValue('Coupon'), 5);
}
if (getUrlParameterValue('MailTo')) {
    try {
        sessionStorage.setItem("MailTo", getUrlParameterValue('MailTo'));
    } catch (err) { };
}
if (getUrlParameterValue('ReviewID')) {
    try {
        sessionStorage.setItem("ReviewID", getUrlParameterValue('ReviewID'));
    } catch (err) { };
}
if (getUrlParameterValue('DarkMode')) {
    ITSInstance.UIController.changeDarkMode();
}
ITSURLToken = "";
if (getUrlParameterValue('Token')) {
    ITSURLToken = getUrlParameterValue('Token');
}

parseURLandTakeAction(); // go to the screen desired

// activate the menu items when the user is loaded
ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
    if (! ITSInstance.users.currentUser.IsTestTakingUser) {
        if (ITSInstance.users.currentUser.HasEducationalOfficeAccess) {
            $('#submenuCandidatesMain').show();
            $('#submenuTeachingMain').show();
            $('#submenuCoursesMain').show();
            $('#submenuCourseBuilderMain').show();
            $('#submenuSettingsMain').show();
            $('#submenuCompaniesMain').show();
        }
        if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
            $('#submenuCandidatesMain').show();
            $('#submenuSessionsMain').show();
            $('#submenuTestsAndReportsMain').show();
            $('#submenuSettingsMain').show();
            $('#submenuCompaniesMain').show();
        }
    }
}, true);
