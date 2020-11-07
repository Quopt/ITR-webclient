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
// shims
Math.trunc = Math.trunc || function(x) {
    if (isNaN(x)) {
        return NaN;
    }
    if (x > 0) {
        return Math.floor(x);
    }
    return Math.ceil(x);
};

// global functions
function getUrlParameterValue(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function ITSRedirectPath(newPath, additionalOptions) {
    // record the path as history as URL rewrite
    if (additionalOptions) {
        history.pushState(newPath, newPath, Global_OriginalURL + '?Path=' + newPath + '&' + additionalOptions);
    } else {
        history.pushState(newPath, newPath, Global_OriginalURL + '?Path=' + newPath);
    }
    // process the path
    parseURLandTakeAction();
}

// cookie helpers
var cookieHelper = {
    setCookie: function (cname, cvalue, exminutes) {
        var d = new Date();
        d.setTime(d.getTime() + (exminutes * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    , getCookie: function get(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    , removeCookie: function (cname) {
        this.setCookie(cname,"",-99999999);
    }
};

// Login token. Needs to be encapsulated in an ITSSession object.
function ITSLoginToken(ITSSession) {
    this.ITSInstance = ITSSession;
    this.IssuedToken = "";
    this.LoginProgress = "";
    this.MultipleCompaniesFound = "";
    this.companyID = "";
    this.userID = "";
};

ITSLoginToken.prototype.set = function (Token) {
    this.IssuedToken = Token;
    cookieHelper.setCookie("ITSLoginToken", this.ITSInstance.token.IssuedToken, 6);
    try {
        sessionStorage.setItem("ITSLoginToken", this.ITSInstance.token.IssuedToken);
    } catch (err) { };
};
ITSLoginToken.prototype.clear = function () {
    this.IssuedToken = "";
    cookieHelper.removeCookie("ITSLoginToken");
    try {
        sessionStorage.removeItem("ITSLoginToken");
    } catch (err) { };
};
ITSLoginToken.prototype.get = function () {
    if (this.IssuedToken != "") {
        return this.IssuedToken;
    } else {
        var myToken = "";
        try {
            myToken=sessionStorage.getItem("ITSLoginToken");
        } catch (err) {  };
        if (myToken == "") myToken = cookieHelper.getCookie("ITSLoginToken");
        if (myToken != "") {
            this.IssuedToken = myToken;
            cookieHelper.setCookie("ITSLoginToken", this.IssuedToken, 6); // refresh
            return this.IssuedToken;
        }
        else {
            return ""; // not logged in
        }
    }
};
ITSLoginToken.prototype.changeCompany = function (newCompanyId, OnSuccess, OnError){
    ITSInstance.token.companyID = newCompanyId;
    ITSInstance.token.temp = {};
    ITSInstance.genericAjaxUpdate('tokens/' + ITSInstance.token.IssuedToken + "/" + newCompanyId, ITSInstance.token.temp, OnSuccess, OnError);
};

ITSLoginToken.prototype.acquire = function (userName, password, okFunction, errorFunction) { // acquires a login token from the server.
    this.LoginProgress = "InProgress";
    this.userID = userName;
    var poll = typeof getUrlParameterValue('Poll') == "undefined" ? "" : getUrlParameterValue('Poll');
    ITSLogger.logMessage(logLevel.ERROR,'Login started : ' + this.ITSInstance.baseURLAPI + 'login');
    var req = $.ajax({
        url: this.ITSInstance.baseURLAPI + 'login',
        context: this,
        headers: {
            'Poll': poll,
            'UserID': userName,
            'Password': password,
            'MASTER': 'Y'
        },
        error: function () {
            this.LoginProgress = "LoginFailed";
            ITSLogger.logMessage(logLevel.ERROR,'Login failed.');
            errorFunction();
        },
        success: function (data, textStatus, xhr) {
            var checkLogin = JSON.parse(data);
            //ITSLogger.logMessage(logLevel.ERROR,data, checkLogin);
            this.set(checkLogin.SessionID);
            this.companyID = checkLogin.CompanyID;
            this.MultipleCompaniesFound = checkLogin.MultipleCompaniesFound;
            this.LoginProgress = "";
            this.MFAStatus = checkLogin.MFAStatus;
            ITSLogger.logMessage(logLevel.ERROR,'Login OK , token issued = ' + this.IssuedToken + ' ' + this.ITSInstance.ID);

            okFunction();
        },
        type: 'GET'
    });
};

var keepTokenFreshCounter = 1;

ITSLoginToken.prototype.keepTokenFresh = function () {
    if (keepTokenFreshCounter == 0) {
        keepTokenFreshCounter = 3;
        setTimeout(function () {
            if (this.IssuedToken != '') {
                $.ajax({
                    url: this.ITSInstance.baseURLAPI + 'checktoken',
                    headers: {'SessionID': this.IssuedToken},
                    type: 'POST',
                    error: function () {
                        if (!$('#LoginWindowHeading').is(':visible')) {
                            keepTokenFreshCounter = 0;
                            ITSInstance.UIController.showError('ITSLoginToken.tokenRefreshFailed', 'Your login has expired. Please login again.', '',
                                    'ITSInstance.logoutController.logout();');
                        }
                    },
                    success: function () {
                        keepTokenFreshCounter = 0;
                        ITSLogger.logMessage(logLevel.INFO,'Token refreshed');
                    }
                });
                cookieHelper.setCookie("ITSLoginToken", this.IssuedToken, 6);
            }
        }.bind(this), 1);
    } else {
        keepTokenFreshCounter -= 1;
    }
};

// logger functions
logLevel = {
    ERROR : 0,
    WARNING : 1,
    INFO : 2
};
var ITSLogger = new ITSLoggerObject();
function ITSLoggerObject() {
    // log example : ITSLogger.logMessage(logLevel.INFO,"My message is %%here%%", "{'here':'there'}")
    this.logLevel = logLevel.ERROR;
    this.loggingEnabled = true;
};

ITSLoggerObject.prototype.logMessage=function (logLevel, message, messageParameters ) {
    if (typeof messageParameters != "undefined") {
        message = envSubstitute(message, messageParameters, true);
    }
    if ((logLevel <= this.logLevel) && (this.loggingEnabled)) {
        console.log(message);
    }
};

// function to support setting and getting date & date/time
function dateElementToString(elem, dt) {
    switch (elem) {
        case "y" :
            return dt.getFullYear();
            break;
        case "m" :
            return dt.getMonth() + 1;
            break;
        case "d" :
            return dt.getDate();
            break;
    }
}

function ITSToDatePicker(dt) {
    if (ITSDateSeparator != undefined) {
        var dtNew = "";
        dfp = Date.CultureInfo.dateElementOrder;
        dtNew = dtNew + dateElementToString(dfp[0], dt);
        dtNew = dtNew + ITSDateSeparator;
        dtNew = dtNew + dateElementToString(dfp[1], dt);
        dtNew = dtNew + ITSDateSeparator;
        dtNew = dtNew + dateElementToString(dfp[2], dt);
        return dtNew;
    }
}

function convertISOtoITRDate(dateasstring){
    var momentDate = moment(dateasstring, moment.ISO_8601);
    return momentDate.format(ITSDateTimeFormatPickerMomentJS);
}

function convertISOtoDate(dateasstring){
    momentDate = moment(dateasstring, moment.ISO_8601);
    return momentDate.toDate();
}

function convertITRToDate(dateasstring) {
    momentDate = moment(dateasstring, ITSDateTimeFormatPickerMomentJS);
    return momentDate.toDate();
}

function convertDateToITR(js_date) {
    var temp = moment(js_date).format(ITSDateFormatPickerMomentJS);
    return temp;
}

function convertDateToISO(js_date) {
    return ITSDateTimeToProgressDateTime(js_date);
}

function nformat (n, numberOfDigits, numberOfDecimals) {
    if (!numberOfDigits) NumberOfDigits = 1;
    if (!numberOfDecimals) numberOfDecimals=1;
    var divider = Math.pow(10,numberOfDecimals);
    n = Math.round(n*divider);
    n = n / divider;

    var prefixers = ""
    if (numberOfDigits > 1) {
      var d = "" + Math.trunc(n)
      if (d.length < numberOfDigits) {
          prefixers = new Array( numberOfDigits - d.length + 1).join("0")
      }
    }

    var r = prefixers + n

    return r
};

function ITSGetDateTimeWithTimeZone(addMonths, Year, Month, Day, Hours, Minutes, Seconds) {
    if (!addMonths) {addMonths=0;}

    var currentTime = new Date.now();
    if (!Year) Year = currentTime.getFullYear();
    if (!Month) Month = currentTime.getMonth()+1;
    if (!Day) Day = currentTime.getDate();
    if (!Hours) Hours = currentTime.getHours();
    if (!Minutes) Minutes = currentTime.getMinutes();
    if (!Seconds) Seconds = currentTime.getSeconds();

    var currentTime = new Date(Year, Month, Day, Hours, Minutes, Seconds);

    while (addMonths > 0) {
        currentTime.addMonths(1); // adding the months in one go creates a bug
        addMonths--;
    }

    //var timezone = jstz.determine();
    //var timezoneName = timezone.name();
    //var tzOffset = Math.trunc(moment().utcOffset() / 60);
    //if (tzOffset >= 0)  {tzOffset = '+'+ tzOffset};

    //return n(currentTime.getFullYear(),4) + "-" + n(currentTime.getMonth(),2) + "-" + n(currentTime.getDate(),2) + " "
    //    + n(currentTime.getHours(),2) + ":" + n(currentTime.getMinutes(),2) + ":" + n(currentTime.getSeconds(),2) + " " + timezoneName;
    return moment(currentTime).format(ITSDateTimeFormatPickerMomentJS);
}

function ITSDateTimeToProgressDateTime(currentTime) {
    var timezone = jstz.determine();
    var timezoneName = timezone.name();

    return nformat(currentTime.getFullYear(),4) + "-" + nformat(currentTime.getMonth()+1,2) + "-" + nformat(currentTime.getDate(),2) + " "
        + nformat(currentTime.getHours(),2) + ":" + nformat(currentTime.getMinutes(),2) + ":" + nformat(currentTime.getSeconds(),2) + " " + timezoneName;
}

// the following 2 functions support databinding to and from screen elements.
// the functions will iterate through all the children of the ParentObjectName and substitute all values for the tags data-field data-field-from-expression data-field-to-expression
// data-field will hold the field name or property name as existing in the dataObject
// data-field-from-expression and data-field-to-expression will be passed through the javascript eval function to determine the current value
//  the from and to expression function is off course debatable but it is added anyway with the sole purpose to reduce the amount of properties and required programming in the pojo objects
function DataBinderTo(parentObjectName, dataObject) {
    var ancestor = document.getElementById(parentObjectName),
        descendants = ancestor.getElementsByTagName('*'),
        dfield = "",
        dfieldexpr = "",
        tempType = "",
        elm;
    for (i = 0; i < descendants.length; ++i) {
        elm = descendants[i];
        dfield = "";
        dfieldexpr = "";
        if (elm.getAttribute("data-field")) {
            dfield = "dataObject." + elm.getAttribute("data-field").toString();
        }
        if (elm.getAttribute("data-field-from-expression")) {
            dfieldexpr = "dataObject." + elm.getAttribute("data-field-from-expression").toString();
            dfield = "";
        }
        if (elm.getAttribute("data-field-from-free-expression")) {
            dfieldexpr = elm.getAttribute("data-field-from-free-expression").toString();
            dfield = "";
        }
        if (elm.getAttribute("name")) {
            if ((dfield != "") && (dfieldexpr == "") && ( elm.getAttribute("name")=="datePicker" || elm.getAttribute("name")=="dateTimePicker" ) ) {
                dfieldexpr = "convertDateToITR(" + dfield + ")";
                dfield="";
            }
        }
        if ((dfield != "") || (dfieldexpr != "") ) {
            try {
                // determine what to bind
                var attrToBind = "value";
                if (elm.getAttribute("type")) {
                    tempType = elm.getAttribute("type");
                    switch (tempType) {
                        case "radio" :
                            attrToBind = "checked";
                            break;
                        case "checkbox" :
                            attrToBind = "checked";
                            break;
                        default :
                            break;
                    }
                }
                if (elm.getAttribute("bind-field")) {
                    attrToBind = elm.getAttribute("bind-field");
                }
                if (elm.type == 'textarea') {
                    attrToBind = 'textarea';
                }

                if (elm.hasAttribute('ace-edit')) {
                    eval('var editor=ace.edit("'+elm.id+'"); editor.setValue(' +dfield + dfieldexpr + ' + " "); ');
                    attrToBind = '';
                }

                if (elm.tagName.toLowerCase() == 'textarea-htmledit') {
                    eval('tinyMCE.get("'+elm.id+'").setContent('+ dfield + dfieldexpr +')');
                    attrToBind = '';
                }

                // and now set the value
                if (attrToBind == 'value') {
                    eval ('elm.' + attrToBind + '=' + dfield + dfieldexpr );
                } else if (attrToBind == 'checked') {
                    elm.checked = eval(dfield + dfieldexpr);
                } else if (attrToBind == 'textarea') {
                    elm.value = eval(dfield + dfieldexpr);
                } else if (attrToBind != '') {
                    eval (attrToBind + '=' + dfield + dfieldexpr );
                }
            }
            catch (err) {
                elm.setAttribute(attrToBind, "#BINDING_ERROR"); //#BINDING_ERROR
                ITSLogger.logMessage(logLevel.ERROR,elm.id + "/" + attrToBind + "/" + tempType + "/" + dfieldexpr + " binding error (DataBinderTo)");
            }
        }
    }
}

function DataBinderFrom(parentObjectName, dataObject) {
    var ancestor = document.getElementById(parentObjectName),
        descendants = ancestor.getElementsByTagName('*'),
        dfieldexpr = "",
        tempType = "",
        elm;
    for (i = 0; i < descendants.length; ++i) {
        elm = descendants[i];
        var dfieldexpr = "";
        var dfieldfreeexpr = "";
        if (elm.getAttribute("data-field")) {
            dfieldexpr = "dataObject." + elm.getAttribute("data-field").toString();
        }
        if (elm.getAttribute("data-field-to-expression")) {
            dfieldexpr = "dataObject." + elm.getAttribute("data-field-to-expression").toString();
        }
        if (elm.getAttribute("data-field-to-free-expression")) {
            dfieldfreeexpr = elm.getAttribute("data-field-to-free-expression").toString();
        }
        if (elm.getAttribute("name")) {
            if ((dfieldexpr != "") && (dfieldfreeexpr == "") && ( elm.getAttribute("name")=="datePicker" || elm.getAttribute("name")=="dateTimePicker" )) {
                dfieldfreeexpr = dfieldexpr + "=convertITRToDate(elm.value)";
                dfieldexpr = "";
            }
        }
        if ((dfieldexpr != "") || (dfieldfreeexpr != "")) {
            try {
                // determine what to bind
                var attrToBind = "value";
                if (elm.getAttribute("type")) {
                    tempType = elm.getAttribute("type");
                    switch (tempType) {
                        case "radio" :
                            attrToBind = "checked";
                            break;
                        case "checkbox" :
                            attrToBind = "checked";
                            break;
                        default :
                            break;
                    }
                }
                if (elm.tagName.toLowerCase() == 'textarea') {
                    attrToBind = 'textarea';
                }

                if (elm.hasAttribute('ace-edit')) {
                    eval('var editor=ace.edit("'+elm.id+'"); '+ dfieldexpr + '= editor.getValue(); ');
                    attrToBind = '';
                }

                if (elm.tagName.toLowerCase() == 'textarea-htmledit') {
                    eval(dfieldexpr + '= tinyMCE.get("'+elm.id+'").getContent().toString()');
                    attrToBind = '';
                }

                // and now set the value
                if (attrToBind == 'value') {
                    if (dfieldfreeexpr == "") {
                        eval(dfieldexpr + '= elm.value');
                    } else {
                        eval(dfieldfreeexpr);
                    }
                }
                if (attrToBind == 'checked') {
                    if (dfieldfreeexpr == "") {
                        eval(dfieldexpr + '= elm.checked');
                    } else {
                        eval(dfieldfreeexpr);
                    }
                }
                if (attrToBind == 'textarea') {
                    if (dfieldfreeexpr == "") {
                        eval(dfieldexpr + '= elm.value');
                    } else {
                        eval(dfieldfreeexpr);
                    }
                }
            }
            catch (err) {
                ITSLogger.logMessage(logLevel.ERROR,elm.id + "/" + attrToBind + "/" + tempType + "/" + dfieldexpr + " binding error (DataBinderFrom)");
            }
        }
    }
}


// xml helper functions
// Changes XML to JSON
function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

// function to create a new guid, method from guid.us/guid/javascript
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function newGuid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

// function to add xml properties to a specific xml node
function addPropertiesToXMLNode(xmlDoc, node, baseObject, propertiesArray) {
    for (var i = 0; i < propertiesArray.length; i++) {
        var propVal = baseObject[propertiesArray[i]];
        if (propVal != undefined) {
            var newElement = xmlDoc.createElement(propertiesArray[i]);
            newElement.innerHTML = propVal;
            if (node.length == undefined) {
                node.appendChild(newElement);
            } else {
                node[0].appendChild(newElement);
            }
        }
    }
}

function shallowCopy(original, target , propertiesOnly) {
    try {
        var i, keys = Object.getOwnPropertyNames(original);
        for (i = 0; i < keys.length; i += 1) {
            if (propertiesOnly) {
                if (typeof original[keys[i]] !== 'object') {
                    // copy ONLY non-object type properties into the clone
                    Object.defineProperty(target, keys[i],
                        Object.getOwnPropertyDescriptor(original, keys[i]));
                }
            } else {
                // copy EACH property into the clone
                Object.defineProperty(target, keys[i],
                    Object.getOwnPropertyDescriptor(original, keys[i]));
            }
        }
    } catch (err) {
        ITSLogger.logMessage(logLevel.ERROR,"shallowCopy failed " + err.message);
    }
};

generatorValues = {};

function getNewSimpleGeneratorNumber(genName, maxGenValue) {
    if (generatorValues[genName]) {
        generatorValues[genName] = generatorValues[genName] + 1;
    } else {
        generatorValues[genName] = 1;
    }

    if (generatorValues[genName] > maxGenValue) {
        generatorValues[genName] = 1;
    }

    return generatorValues[genName];
}


// determine the type of a javascript object
function type(obj){
    var text = obj.constructor.toString()
    return text.match(/function (.*)\(/)[1]
}

// determine if an object is empty
function isEmpty(map) {
    for(var key in map) {
        if (map.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

// empty compatible object for JSON stringify & load functions
function ITSObject(par,session) { }


function ITSJSONStringify(someITSObject) {
    var toReturn = "{}";
    if (someITSObject != null) {
        // process the properties
        if (someITSObject.persistentProperties) {
            toReturn = '{"_objectType":"' + type(someITSObject) + '",';
            var props = someITSObject.persistentProperties;
            if (someITSObject.persistentProperties != "*ALL*") {
                for (var i = 0; i < props.length; i++) {
                    var comma = (i == props.length - 1) ? "" : ",";
                    if (typeof someITSObject[props[i]] === 'object' && someITSObject[props[i]] !== null) {
                        if (someITSObject[props[i]] != null) {
                            toReturn = toReturn + JSON.stringify(props[i]) + ":";
                            if (someITSObject[props[i]][0]) {
                                // it is an array
                                toReturn = toReturn + "[";
                                for (var j = 0; j < someITSObject[props[i]].length; j++) {
                                    var arrayComma = (j == someITSObject[props[i]].length - 1) ? "" : ",";
                                    toReturn = toReturn + ITSJSONStringify(someITSObject[props[i]][j]) + arrayComma;
                                }
                                toReturn = toReturn + "]" + comma;
                            } else {
                                // it is no array
                                if (someITSObject[props[i]] instanceof Date) {
                                    toReturn = toReturn + "\"" + ITSDateTimeToProgressDateTime (someITSObject[props[i]]) + "\"" + comma;
                                } else {
                                    if (props[i] == "PluginData") {
                                        someITSObject[props[i]].persistentProperties = "*ALL*"
                                    }
                                    toReturn = toReturn + ITSJSONStringify(someITSObject[props[i]]) + comma;
                                }
                            }
                        }
                    } else {
                        toReturn = toReturn + JSON.stringify(props[i]) + ":" + JSON.stringify(someITSObject[props[i]]) + comma;
                    }
                }
            } else {
                if (!someITSObject._objectType) { someITSObject._objectType = "ITSObject"; }

                try {
                    return JSON.stringify(someITSObject);
                } catch (err) {
                    ITSLogger.logMessage(logLevel.ERROR,"JSON.stringify failed for "  +  err);
                    return "";
                }
            }
            toReturn = toReturn + "}";
        }
        else {
            toReturn = JSON.stringify( someITSObject)
        }
    }
    return toReturn;
}

// in case of circular references in objects this function can be used
const replaceCircular = (obj, level = 0, already = new WeakSet()) => {
    switch (typeof obj) {
        case 'object':
            if (!obj)
                return obj
            if (already.has(obj)) {
                return "CIRCULAR"
            }
            already.add(obj)
            if (Array.isArray(obj)) {
                return obj.map(item => replaceCircular(item, level + 1, already))
            }
            const newObj = {}
            Object.keys(obj).forEach(key => {
                const val = replaceCircular(obj[key], level + 1, already)
                newObj[key] = val
            })
            already.delete(obj)
            return newObj
        default:
            return obj;
    }
}

function scanITSJsonLoadObject(tempObject, someITSObject, parentITSObject, ITSInstanceObject, DefaultObjectType) {
    // copy the arrays and sub objects
    try {
        var i, keys = Object.getOwnPropertyNames(tempObject);
    } catch (err) {
        ITSLogger.logMessage(logLevel.ERROR,"scanITSJsonLoadObject loading object failed, retry as first element of array "  + err);
        if (tempObject) {
            var i, keys = Object.getOwnPropertyNames(tempObject[0]);
        } else { var keys = []; }
    }
    for (i = 0; i < keys.length; i += 1) {
        if ((typeof tempObject[keys[i]] === 'object') && (!isEmpty(tempObject[keys[i]]))) {
            // copy ONLY non-object type properties into the clone
            if (tempObject[keys[i]][0]) {
                // this is an array
                for (var j = 0; j < (tempObject[keys[i]]).length; j++) {
                    var tempObjectType = "";
                    if ((tempObject[keys[i]][j])['_objectType'] != undefined) { tempObjectType = (tempObject[keys[i]][j])['_objectType']; }
                    if (!DefaultObjectType) DefaultObjectType="ITSObject";
                    var tempITSObject = eval( "new " +  ( (tempObjectType == "") ?  DefaultObjectType : (tempObject[keys[i]][j])._objectType ) + "(parentITSObject, ITSInstanceObject);");
                    if (! someITSObject[keys[i]] ) { someITSObject[keys[i]] = [] ; };
                    someITSObject[keys[i]].push( tempITSObject);
                    scanITSJsonLoadObject(tempObject[keys[i]][j], tempITSObject, tempITSObject, ITSInstanceObject, DefaultObjectType);
                }
            } else {
                // this is not an array but an object, create it and add it
                if ( (((tempObject[keys[i]])._objectType) || (DefaultObjectType))  ) {
                    var tempObjectType = "";
                    if ((tempObject[keys[i]])['_objectType'] != undefined) { tempObjectType = (tempObject[keys[i]])['_objectType']; }
                    var tempITSObject = eval("new " +  ( (tempObjectType == "") ? DefaultObjectType : (tempObject[keys[i]])._objectType) + "(parentITSObject, ITSInstanceObject);");
                } else {
                    var tempITSObject = {};
                }
                someITSObject[keys[i]] = tempITSObject;
                scanITSJsonLoadObject(tempObject[keys[i]], tempITSObject, tempITSObject, ITSInstanceObject, DefaultObjectType);
            }
        }
    }

    // copy the properties after removing the object type
    // tempObject._objectType = null;
    shallowCopy(tempObject, someITSObject, true);
    if ((someITSObject.postLoad) && (typeof someITSObject.postLoad == "function")) someITSObject.postLoad();
}

function ITSJSONLoad(someITSObject, JSONString, parentITSObject, ITSInstanceObject, DefaultObjectType) {
    try {
        var tempObject = JSON.parse(JSONString);
    } catch (err) {
        ITSLogger.logMessage(logLevel.ERROR,"ITSJSONLoad loading failed : " + err )
    }

    if (someITSObject == null) {
        // we dont have an object to put stuff in. So create one.
        var tempObjectType = "";
        if (tempObject['_objectType'] != undefined) { tempObjectType = tempObject._objectType; }
        someITSObject = eval( "new " + ( (tempObjectType == "") ? DefaultObjectType : tempObject._objectType) + "(parentITSObject, ITSInstanceObject);");
    }

    scanITSJsonLoadObject(tempObject, someITSObject, parentITSObject, ITSInstanceObject, DefaultObjectType);

    return someITSObject;
}

function saveFileLocally(proposedFileName, fileContents, fileType) {
    if (typeof fileType == "undefined") { fileType = "text/plain"; }
    if ('Blob' in window) {
        var fileName = prompt(ITSInstance.translator.getTranslatedString('ITSHelpers.js', 'saveFileLocally.FileNameToSave', 'Please enter file name to save'), proposedFileName);
        if (fileName) {
            var textToWrite = fileContents;
            var textFileAsBlob = new Blob([textToWrite], {type: fileType});

            if ('msSaveOrOpenBlob' in navigator) {
                navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
            } else {
                var downloadLink = document.createElement('a');
                downloadLink.download = fileName;
                downloadLink.innerHTML = 'Download File';
                if ('webkitURL' in window) {
                    // Chrome allows the link to be clicked without actually adding it to the DOM.
                    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                } else {
                    // Firefox requires the link to be added to the DOM before it can be clicked.
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.onclick = saveFileLocally_destroyClickedElement;
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            }
        }
    } else {
        alert('Your browser does not support HTML5 which is required for this function. Please upgrade your browser.');
    }
}

function saveFileLocallyFromURL(proposedFileName, URL) {
    var downloadLink = document.createElement('a');
    downloadLink.id = newGuid();
    downloadLink.download = proposedFileName;
    downloadLink.innerHTML = 'Download File';
    downloadLink.href = ITSInstance.baseURL +  URL;
    downloadLink.onclick = saveFileLocally_destroyClickedElement;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function saveFileLocally_destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function loadFileLocally(fileToLoad, functionWhenLoaded, binary) {
    if (fileToLoad) {
        var reader = new FileReader();
        reader.filename = fileToLoad;
        reader.onload = (function (fileLoadedEvent) {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            functionWhenLoaded(textFromFileLoaded, reader.filename);
        }).bind(reader);
        if (binary) {
            reader.readAsBinaryString(fileToLoad);
        } else {
            reader.readAsText(fileToLoad, 'UTF-8');
        }
    } else {
        functionWhenLoaded("");
    }
}

ITSMail = function () {
    this.Subject = "";
    this.Body = "";
    this.To = "";
    this.CC = "";
    this.BCC = "";
    this.From = "";
    this.ReplyTo = "";
};

ITSMail.prototype.sendMail = function (OnSuccess, OnError) {
    this.persistentProperties = "*ALL*";
    var tempStr = ITSJSONStringify(this);
    ITSInstance.genericAjaxUpdate('sendmail', tempStr, OnSuccess, OnError );
};

function envSubstitute(textToScan, instanceObj, freeContext) {
    // substitute fields with values
    if (!textToScan) textToScan="";

    var scanPos = textToScan.indexOf("%%");
    var oldScanPos =0;
    var varFound = "";
    if (scanPos == -1) {
        result = textToScan;
    }
    else {
        var result = "" + textToScan.substring(0, Math.min(scanPos, textToScan.length));
    }
    while (scanPos > -1 ) {
        varFound = textToScan.substring(scanPos +2, textToScan.indexOf("%%", scanPos+2));
        // check if the property can be found in the instance object
        try {
            try {
                result += eval("instanceObj." + varFound);
            } catch (err) {
                if (freeContext) {
                    try {
                        result += eval(varFound);
                    }
                    catch (err) {
                        ITSLogger.logMessage(logLevel.ERROR,"eval failed for "  + varFound +  " with " + err );
                    }
                }
                else { throw "x"};
            }
        } catch(err) {
            result += "%%" + varFound + "%%";
        }
        // next
        oldScanPos = scanPos+varFound.length+4;
        scanPos = textToScan.indexOf("%%", oldScanPos );
        if (scanPos == -1) {
            result += textToScan.substring(oldScanPos);
        } else {
            result += textToScan.substring(oldScanPos, scanPos);
        }
    }
    return result;
};

function envSubstituteToArray(textToScan) {
    // substitute fields with values
    if (!textToScan) textToScan = "";
    var tagCounter = 0;
    var envSubstArr = [];

    var scanPos = textToScan.indexOf("%%");
    var oldScanPos = 0;
    var varFound = "";
    if (scanPos == -1) {
        result = textToScan;
    } else {
        var result = "" + textToScan.substring(0, Math.min(scanPos, textToScan.length));
    }
    while (scanPos > -1) {
        varFound = textToScan.substring(scanPos + 2, textToScan.indexOf("%%", scanPos + 2));
        // check if the property can be found in the instance object
        envSubstArr.push(varFound);
        result += "%%" + tagCounter + "%%"
        tagCounter++;

        // next
        oldScanPos = scanPos + varFound.length + 4;
        scanPos = textToScan.indexOf("%%", oldScanPos);
        if (scanPos == -1) {
            result += textToScan.substring(oldScanPos);
        } else {
            result += textToScan.substring(oldScanPos, scanPos);
        }
    }
    return {"result": result, "envSubstArr": envSubstArr};
};

function envSubstituteFromArray(textToScan, envSubstArr) {
    // substitute fields with values
    if (!textToScan) textToScan="";

    var scanPos = textToScan.indexOf("%%");
    var oldScanPos =0;
    var varFound = "";
    if (scanPos == -1) {
        result = textToScan;
    }
    else {
        var result = "" + textToScan.substring(0, Math.min(scanPos, textToScan.length));
    }
    while (scanPos > -1 ) {
        varFound = textToScan.substring(scanPos +2, textToScan.indexOf("%%", scanPos+2));
        // check if the property can be found in the instance object

        result += "%%" + envSubstArr[Number(varFound)] + "%%";

        // next
        oldScanPos = scanPos+varFound.length+4;
        scanPos = textToScan.indexOf("%%", oldScanPos );
        if (scanPos == -1) {
            result += textToScan.substring(oldScanPos);
        } else {
            result += textToScan.substring(oldScanPos, scanPos);
        }
    }
    return result;
};

function RGBconvert(integer) {
    var str = Number(integer).toString(16);
    return str.length == 1 ? "0" + str : str;
};

// convert three r,g,b integers (each 0-255) to a single decimal integer (something between 0 and ~16m)
function RGBcolourToNumber(r, g, b) {
    return (r << 16) + (g << 8) + (b);
}

function RGBstringToNumber(rgb) {
    r = "0x" + rgb.substring(0,2);
    g = "0x" + rgb.substring(2,4);
    b = "0x" + rgb.substring(4,6);
    return RGBcolourToNumber(parseInt(r),parseInt(g),parseInt(b));
}

// convert it back again (to a string)
function RGBnumberToColour(number) {
    var r = (number & 0xff0000) >> 16;
    var g = (number & 0x00ff00) >> 8;
    var b = (number & 0x0000ff);

    return(RGBconvert(r) + RGBconvert(g) + RGBconvert(b)).toUpperCase();
}

var PasswordGenerator = {

    _pattern : /[a-zA-Z0-9_\-\+\.]/,


    _getRandomByte : function()
    {
        // http://caniuse.com/#feat=getrandomvalues
        if(window.crypto && window.crypto.getRandomValues)
        {
            var result = new Uint8Array(1);
            window.crypto.getRandomValues(result);
            return result[0];
        }
        else if(window.msCrypto && window.msCrypto.getRandomValues)
        {
            var result = new Uint8Array(1);
            window.msCrypto.getRandomValues(result);
            return result[0];
        }
        else
        {
            return Math.floor(Math.random() * 256);
        }
    },

    generate : function(length)
    {
        return Array.apply(null, {'length': length})
            .map(function()
            {
                var result;
                while(true)
                {
                    result = String.fromCharCode(this._getRandomByte());
                    if(this._pattern.test(result))
                    {
                        return result;
                    }
                }
            }, this)
            .join('');
    }

};

function format(source, params) {
    $.each(params, function (i, n) {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function makeHTMLTable(myArray, headers) {
    var result = "<table border=1>";
    if (headers) {
        result += "<tr>";
        for(var j=0; j<headers.length; j++){
            result += "<th>"+headers[j]+"</th>";
        }
        result += "</tr>";
    }
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}

function makeHTMLTableBasedOnObject(valueObjects) {
    // extract the headers values, which are the properties on the object
    var headerList = {};
    var i, keys = Object.getOwnPropertyNames(valueObjects[0]);
    for (i = 0; i < keys.length; i += 1) {
        headerList[keys[i]] ="";
    }
    return makeHTMLTableBasedOnObjects(headerList, valueObjects, valueObjects.length);
};

function makeHTMLTableBasedOnObjects(headerObject, valueObjects, objectLimit) {
    var result = "<table class=\"table table-striped\">";
    result += "<thead class=\"thead-dark\">";
    for (var propertyHeader in headerObject) {
            result += "<th>"+propertyHeader+"</th>";
    }
    result += "</thead>";
    result += "<tbody>";
    for (var i=0; i < Math.min(valueObjects.length, objectLimit); i++) {
        result += "<tr>"
        for (var propertyHeader in headerObject) {
            if (typeof valueObjects[i][propertyHeader] !== "undefined") {
                result += "<td>" + valueObjects[i][propertyHeader] + "</td>";
            } else {
                result += "<td></td>";
            }
        }
        result += "</tr>"
    }
    result += "</tbody></table>";
    return result;
};

var stringToBinArray = function(inStr)
{
    var ret = new Uint8Array(inStr.length);
    for (var i = 0; i < inStr.length; i++) {
        ret[i] = inStr.charCodeAt(i);
    }
    return ret;
};

var binArrayToString = function(binArrayi)
{
    var str = "";
    binArray = new Uint8Array( binArrayi );
    for (var i = 0; i < binArray.length; i++) {
        str += String.fromCharCode(binArray[i]);
    }
    return str;
};

function InArray( arrayToSearch, propertyToFind, ValueToFind, comparisonOperator ) {
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (eval("arrayToSearch["+i+"]." + propertyToFind + comparisonOperator + "ValueToFind") ) {
            return i;
        }
    }
    return -1;
}

function precise_round(num, dec){
    if ((typeof num !== 'number') || (typeof dec !== 'number'))
        return false;

    var num_sign = num >= 0 ? 1 : -1;

    return (Math.round((num*Math.pow(10,dec))+(num_sign*0.0001))/Math.pow(10,dec)).toFixed(dec);
}

function ConvertObjectListToCSV(objectList, separator, fieldsToRemove) {
    if (typeof fieldsToRemove == "undefined") { fieldsToRemove = []; }
    // get the desired headers for this object list
    var headers = {};
    var keys = Object.getOwnPropertyNames(objectList[0]);
    for (var headerLine in keys) {
        if (fieldsToRemove.lastIndexOf(keys[headerLine]) < 0) {
            headers[keys[headerLine]] = keys[headerLine];
        }
    }
    return ConvertToSV(headers, objectList, ConvertFieldToCSVSafe, separator);
}

function ConvertToSV(headerRow, dataRow, fieldConversionFunction, separator) {
    var firstField = true;
    var result = "";
    for (var headerLine in headerRow) {
        if (!firstField) {
            result += separator;
        }
        firstField = false;
        result += '"' + fieldConversionFunction(headerLine) + '"';
    }
    result += "\n";
    for (var i=0; i < dataRow.length; i++) {
        firstField = true;
        for (var propertyHeader in headerRow) {
            if (!firstField) {
                result += separator;
            }
            firstField = false;
            if (typeof dataRow[i][propertyHeader] !== "undefined") {
                result += '"' + fieldConversionFunction(dataRow[i][propertyHeader]) + '"';
            } else {
                result += '""';
            }
        }
        result += "\n"
    }
    return result;
};

function ConvertFieldToCSVSafe(field) {
    return String(field).replaceAll('"','""').replaceAll('\n','');
};
function ConvertFieldToTSVSafe(field) {
    return String(field).replaceAll('\t','');
};

function IsInCSVList(value, csvstring, seperator) {
    if (typeof seperator =="undefined") seperator = ",";
    if (typeof csvstring =="undefined") return false;
    if (typeof value =="undefined") return false;

    var csvarray = csvstring.split(seperator);
    var result = csvarray.includes(value);
    if (!result) result = csvarray.includes('"'+ value + '"');
    if (!result) result = csvarray.includes("'"+ value + "'");
    return result;
};

function RemoveFromCSVList(value, csvstring, seperator) {
    if (typeof seperator =="undefined") seperator = ",";

    var csvarray = csvstring.split(seperator);
    var result = csvarray.indexOf(value);
    if (result < 0) { result = csvarray.includes('"'+ value + '"'); }
    if (result < 0) { result = csvarray.includes('"'+ value + '"'); }

    csvarray.splice(result,1);
    return csvarray.join(seperator);
};

function AddToCSVList(value, csvstring, seperator) {
    if (typeof seperator =="undefined") seperator = ",";

    value = ConvertFieldToCSVSafe(value);
    value = stripEndQuotes(value,'"');
    value = stripEndQuotes(value,"'");
    if (csvstring == "") {
        return '"'+value+'"';
    }
    else {
     return csvstring + seperator + '"'+value+'"';
    }
};

// Polyfills for backward compatibility
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

// string formatting function
function format(source, params) {
    $.each(params,function (i, n) {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    })
    return source;
}

function pad(num, size) {
    var sign = Math.sign(num) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(num)]).join('0').slice(-size);
}

// function to retrieve all active css classes
function getCSSClassesList(documentParent) {
    var styleBySelector = {};
    for (var j = 0; j < documentParent.styleSheets.length; j++) {
        var styleList = {};
        try {
            styleList = documentParent.styleSheets[j].rules || documentParent.styleSheets[j].cssRules;
            for (var i = 0; i < styleList.length; i++) {
                styleBySelector[styleList[i].selectorText] = {};
                styleBySelector[styleList[i].selectorText]["style"] = styleList[i].style;
                styleBySelector[styleList[i].selectorText]["stylesheetIndex"] = j;
                styleBySelector[styleList[i].selectorText]["stylelistIndex"] = i;
                //console.log(document.styleSheets[j], styleList[i], styleList[i].selectorText + "=" + styleList[i].style);
            }
        }
        catch (err) {  }
    }
    return styleBySelector;
};

function stripEndQuotes(s, quotechar) {
    var t=s.length;
    if (s.charAt(0)==quotechar) s=s.substring(1,t--);
    if (s.charAt(--t)==quotechar) s=s.substring(0,t);
    return s;
};

function INIEventParametersToObject (s) {
    var temp = stripEndQuotes(s, "'").split('&&&');
    var splitted = [];
    var key, value;
    var result = {};
    for (var i=0; i < temp.length; i++) {
        splitted = temp[i].split("=");
        key = splitted[0];
        value = temp[i].substring(temp[i].indexOf('=')+1);
        result[key]=value;
    }
    return result;
}

function ObjectToINIEventParameters(obj) {
    var result = "";
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (result != "") result += "&&&";
            result += prop + '=' + obj[prop];
        }
    }
    return result;
}

function convertDateToCode(newdate) {
    var carryOver = 0;

    function numberToCharCode(num) {
        if (num > 62) num = num % 62;
        if (num < 26) return String.fromCharCode( "A".charCodeAt(0) + num );
        if (num < 36) return String.fromCharCode( "0".charCodeAt(0) + (num-26) );
        carryOver ++;
        return String.fromCharCode( "A".charCodeAt(0) + (num-36) );
    }

    var newCode = numberToCharCode(newdate.getYear() % 62) +
        numberToCharCode(newdate.getMonth()) +
        numberToCharCode(newdate.getDay()) +
        numberToCharCode(newdate.getHours()) +
        numberToCharCode(newdate.getMinutes()) +
        numberToCharCode(newdate.getSeconds());
    if (carryOver > 0) {
        newCode = numberToCharCode((newdate.getYear()-40-carryOver) % 62) +
            numberToCharCode(newdate.getMonth()) +
            numberToCharCode(newdate.getDay()) +
            numberToCharCode(newdate.getHours()) +
            numberToCharCode(newdate.getMinutes()) +
            numberToCharCode(newdate.getSeconds());
    }
    return newCode;
};

// generic swap function
function swapInObject (element1, element2, varname, templatevalues) {
    // NOTE : The element1 and element2 are 1-based ! So element 0 is not valid!
    var ElemIndex1 = element1;
    var ElemIndex2 = element2;

    if ((element1 >0) && (element2 >0)) {
        var tempVal = "";
        tempVal1 = templatevalues[varname + ElemIndex1];
        tempVal2 = templatevalues[varname + ElemIndex2];
        if ((typeof tempVal1 === "undefined") || (typeof tempVal2 === "undefined")) {
            // do nothing for now
        }
        else {
            templatevalues[varname + ElemIndex1] = tempVal2;
            templatevalues[varname + ElemIndex2] = tempVal1;
        }
    }
};