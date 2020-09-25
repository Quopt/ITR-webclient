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

function ITSUser (usersParent, ITSSession) {
    this.myParent = usersParent;
    this.ITSSession = ITSSession;
    this.ID= newGuid();
    this.CompanyID = "00000000-0000-0000-0000-000000000000";
    if (this.ITSSession.companies) {
        if (this.ITSSession.companies.currentCompany) {
            this.CompanyID = this.ITSSession.companies.currentCompany.ID;
        }
    }
    this.Email="";
    this.Password = "";
    this.UserOpeningsScreen="";
    this.UserName="";
    this.PreferredLanguage="";
    this.MailAddress="";
    this.VisitingAddress="";
    this.InvoiceAddress="";
    this.InformationAddress="";
    this.Remarks="";
    this.PasswordExpirationDate= new Date(2000,1,1);
    this.StartDateLicense= new Date();
    this.EndDateLicense= new Date(2100,1,1);
    this.LastLoginDateTime= new Date(2000,1,1);
    this.LastRefreshDateTime= new Date(2000,1,1);
    this.IsMasterUser=false;
    this.IsTestTakingUser=false;
    this.IsOfficeUser=false; // this property cannot be saved. access to the office is determined by the server.
    this.IsOrganisationSupervisor=false;
    this.IsTestAuthor=false;
    this.IsReportAuthor=false;
    this.IsTestScreenTemplateAuthor=false;
    this.IsTranslator=false;
    this.IsResearcher=false;
    this.MayOrderCredits=false;
    this.MayWorkWithBatteriesOnly=false;
    this.DoNotRenewLicense= false;
    this.Active=true;
    this.UserCulture="";
    this.MayWorkWithOwnObjectsOnly=false;
    this.IsPasswordManager = false;
    this.SecurityTemplateID="00000000-0000-0000-0000-000000000000";
    this.HasPersonalCreditPool=false;
    this.CurrentPersonalCreditLevel=0;
    this.HasTestingOfficeAccess = true;
    this.HasEducationalOfficeAccess = false;
    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";
    this.PluginData.ForbiddenPaths ='';
    this.APIKey = "";

    this.persistentProperties = [
        'ID','CompanyID','Email', 'Password', 'UserOpeningsScreen','UserName','PreferredLanguage','MailAddress','VisitingAddress','InvoiceAddress',
        'InformationAddress','Remarks','PasswordExpirationDate',
        'StartDateLicense','EndDateLicense','LastLoginDateTime','LastRefreshDateTime','IsMasterUser','IsTestTakingUser', 'IsResearcher',
        'IsOrganisationSupervisor', "IsOfficeUser", "IsTestAuthor", "IsReportAuthor", "IsTestScreenTemplateAuthor",'IsTranslator','MayOrderCredits','MayWorkWithBatteriesOnly','DoNotRenewLicense',
        'Active','UserCulture','MayWorkWithOwnObjectsOnly','SecurityTemplateID','HasPersonalCreditPool','CurrentPersonalCreditLevel','PluginData', 'IsPasswordManager', 'APIKey', 'HasTestingOfficeAccess',
        'HasEducationalOfficeAccess'
    ];

    this.lastSavedJSON = "";
    this.newUser = true;
    this.detailsLoaded = false;
};

ITSUser.prototype.regeneratePassword = function () {
    this.PasswordExpirationDate= new Date(2000,1,1);
    this.Password = PasswordGenerator.generate(16);
};

ITSUser.prototype.loadDetails = function (OnSuccess, OnError) {
    this.loadDetailsOK = OnSuccess;
    this.loadDetailsError = OnError;
    this.ITSSession.JSONAjaxLoader('logins/' + this.ID , this,
        this.loadDetailsOK.bind(this), this.loadDetailsError.bind(this), ITSObject, 0 , -1, "", "Y", "N", "Y");
};
ITSUser.prototype.loadDetailsOK = function () {
    this.postLoad();
    this.newUser = false;
    this.detailsLoaded = true;
    this.loadDetailsOK();
};
ITSUser.prototype.loadDetailsError = function () {
    this.loadDetailsError();
};

ITSUser.prototype.postLoad = function () {
    this.parseDates();
};

ITSUser.prototype.parseDates = function () {
    var momentDate = 0;
    if ($.type(this.PasswordExpirationDate) === "string") {
        this.PasswordExpirationDate = convertISOtoDate(this.PasswordExpirationDate );
    }
    if ($.type(this.StartDateLicense) === "string") {
        this.StartDateLicense = convertISOtoDate(this.StartDateLicense );
    }
    if ($.type(this.EndDateLicense) === "string") {
        this.EndDateLicense = convertISOtoDate(this.EndDateLicense );
    }
    if ($.type(this.LastLoginDateTime) === "string") {
        this.LastLoginDateTime = convertISOtoDate(this.LastLoginDateTime );
    }
    if ($.type(this.LastRefreshDateTime) === "string") {
        this.LastRefreshDateTime = convertISOtoDate(this.LastRefreshDateTime );
    }
};

ITSUser.prototype.resetPassword = function (oldPassword, newPassword, OnSucces, OnError) {
    var pwdPusher = {};
    pwdPusher["old_password"] = oldPassword;
    pwdPusher["new_password"] = newPassword;
    pwdPusher.persistentProperties = "*ALL*";

    ITSInstance.genericAjaxUpdate( 'logins/currentuser/changepassword', ITSJSONStringify(pwdPusher), OnSucces, OnError );
};

ITSUser.prototype.saveToServer = function (OnSuccess, OnError) {
    this.saveToServerMasterOrClient(OnSuccess,OnError,false);
};
ITSUser.prototype.saveToServerMaster = function (OnSuccess, OnError) {
    this.saveToServerMasterOrClient(OnSuccess,OnError,true);
};

ITSUser.prototype.saveToServerMasterOrClient = function (OnSuccess, OnError, master) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newUser = false;
    if (master) {
        ITSInstance.genericAjaxUpdate('logins/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "Y", "N");
    } else {
        ITSInstance.genericAjaxUpdate('logins/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    this.ITSSession.MessageBus.publishMessage("User.Update", this);
};

ITSUser.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('logins/' + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("User.Delete", this);
};

function ITSUsers (thisITSInstance) {
    this.myITSInstance = thisITSInstance;
    this.resetCurrentUser();

    this.userList = [];
    this.currentlyLoading = false;
    this.listLoaded = false;
};

ITSUsers.prototype.resetCurrentUser= function () {
    this.currentUser = new ITSUser(this, this.myITSInstance); // contains information about the current user
    this.currentUserLoaded = false;
    this.currentUserLoadedCallPending = false;
    this.currentUserLoadedErrors = [];
    this.currentUserLoadedOK = [];
};

ITSUsers.prototype.currentUserLoadedOKcallback = function() {
    this.currentUserLoaded = true;
    this.currentUserLoadedCallPending = false;
    this.currentUserLoadedOK.forEach(function(element) {
        element();
    });
    this.currentUserLoadedOK.length = 0;
    this.currentUserLoadedErrors.length = 0;
    this.currentUser.newUser = false;
    this.currentUser.postLoad();
    this.myITSInstance.MessageBus.publishMessage("CurrentUser.Loaded", this.currentUser);
};

ITSUsers.prototype.currentUserLoadedErrorcallback = function() {
    this.currentUserLoaded = false;
    this.currentUserLoadedCallPending = false;
    this.currentUserLoadedErrors.forEach(function(element) {
        element();
    });
    this.currentUserLoadedOK.length = 0;
    this.currentUserLoadedErrors.length = 0;
};

ITSUsers.prototype.loadCurrentUser = function (whenLoaded, onError, forceReload ) {
    //ITSLogger.logMessage(logLevel.ERROR,"loading current user");
    if (forceReload) { this.currentUserLoaded = false; }
    if (!this.currentUserLoaded) {
        if (whenLoaded) { this.currentUserLoadedOK.push(whenLoaded); }
        if (onError) { this.currentUserLoadedErrors.push(onError); }

        if (!this.currentUserLoadedCallPending) {
            this.currentUserLoadedCallPending = true;
            this.myITSInstance.JSONAjaxLoader('logins/currentuser', this.myITSInstance.users.currentUser,
                this.currentUserLoadedOKcallback.bind(this), this.currentUserLoadedErrorcallback.bind(this));
        }
    } else {
        whenLoaded();
    }
};

ITSUsers.prototype.saveCurrentUser = function (OnSucces, OnError) {
    if (this.currentUserLoaded) {
        this.currentUserLastSavedJSON = ITSJSONStringify(this.myITSInstance.users.currentUser);
        this.myITSInstance.genericAjaxUpdate( 'logins/currentuser', this.currentUserLastSavedJSON, OnSucces, OnError );
        this.myITSInstance.MessageBus.publishMessage("User.Update", this);
    }
};

ITSUsers.prototype.loadUsers = function (OnSucces, OnError) {
    this.loadUsersOK = OnSucces;
    this.loadUsersError = OnError;
    this.userListLoaded = false;
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;
        this.listLoaded = false;
        this.userList = [];
        this.myITSInstance.JSONAjaxLoader('logins', this.userList,
            this.loadUserLoadedOKcallback.bind(this), this.loadUserLoadedErrorcallback.bind(this), 'ITSUser');
    }
};
ITSUsers.prototype.loadUserLoadedOKcallback = function () {
    this.listLoaded = true;
    this.currentlyLoading = false;
    this.loadUsersOK();
};
ITSUsers.prototype.loadUserLoadedErrorcallback = function () {
    this.currentlyLoading = false;
    this.loadUsersError();
};

ITSUsers.prototype.findUserByID = function (userID) {
    if (this.listLoaded) {
        for (var i = 0; i < this.userList.length; i++) {
            if (this.userList[i].id == userID) {
                return this.userList[i];
            }
        }
    }
    return undefined;
};

ITSUsers.prototype.findUserByLogin = function (userID, caseInsensitive) {
    var found = false;
    userID = userID.trim();
    if (this.listLoaded) {
        for (var i = 0; i < this.userList.length; i++) {
            if (caseInsensitive) {
                found = this.userList[i].Email.toLocaleUpperCase() == userID.toLocaleUpperCase();
            } else  {
                found = this.userList[i].Email == userID;
            }
            if (found) return this.userList[i];
        }
    }
    return undefined;
};

ITSUsers.prototype.createNewUser = function () {
    var nwUser = new ITSUser(this, this.myITSInstance);
    nwUser.regeneratePassword();
    if (this.listLoaded) this.userList.push(nwUser);
    return nwUser;
};