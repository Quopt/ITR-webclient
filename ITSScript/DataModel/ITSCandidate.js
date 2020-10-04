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

ITSCandidate = function (parent, ITSSession) {
    this.myParent = parent;
    this.ITSSession = ITSSession;
    this.ID = newGuid();
    this.EMail = "";
    this.FirstName = "";
    this.LastName = "";
    this.Initials = "";
    this.TitlesBefore = "";
    this.TitlesAfter = "";
    this.UserDefinedFields = "";
    this.Remarks = "";
    this.PreferredLanguage = "";
    this.DateOfLastTest = new Date(2000, 1, 1);
    this.CompanyID = "00000000-0000-0000-0000-000000000000";
    this.ManagedByUserID = "00000000-0000-0000-0000-000000000000";
    if (this.ITSSession.companies) {
        if (this.ITSSession.companies.currentCompany) {
            this.CompanyID = this.ITSSession.companies.currentCompany.ID;
        }
    }
    if (this.ITSSession.users) {
        if (this.ITSSession.users.currentUser) {
            this.ManagedByUserID = ITSSession.users.currentUser.ID;
        }
    }
    this.EducationID = "00000000-0000-0000-0000-000000000000";
    this.OrganisationID = "00000000-0000-0000-0000-000000000000";
    this.NationalityID = "00000000-0000-0000-0000-000000000000";
    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";

    this.Active = true;
    this.BirthDate = "1900-1-1";
    this.Age = 0;
    this.Sex = 0; // 0 unknown, 1 male, 2 female, 3 gender neutral
    this.Password = "";

    this.PersonType = 0 ; // 0 = candidate, 1000 = teacher

    this.newCandidate = true;

    this.persistentProperties = [
        'ID', 'EMail', 'FirstName', 'LastName', 'Initials', 'TitlesBefore', 'TitlesAfter', 'UserDefinedFields',
        'Remarks', 'PreferredLanguage', 'DateOfLastTest', 'CompanyID', 'ManagedByUserID', 'PluginData', 'Active', 'BirthDate',
        'Sex', 'Password', 'Age', 'PersonType'
    ];
}

ITSCandidate.prototype.regeneratePassword = function () {
    this.Password = Math.random().toString(36).slice(-8);
    ITSLogger.logMessage(logLevel.WARNING,"Password for the user has been reset " + this.EMail);
};

ITSCandidate.prototype.createHailing = function () {
    var HailingMr = "";
    if (this.Sex == 1) {
        HailingMr = ITSInstance.translator.getTranslatedString('ITSCandidate', 'Mr', 'Mr')
    }
    if (this.Sex == 2) {
        HailingMr = ITSInstance.translator.getTranslatedString('ITSCandidate', 'Mrs', 'Mrs')
    }

    var toReturn = "";
    if (this.LastName != "") {
        if (this.FirstName != "") {
            toReturn = HailingMr + " " + this.FirstName + " " + this.LastName;
        } else {
            toReturn = HailingMr + " " + this.LastName;
        }
    }
    if (this.EMail != "" && toReturn == "") {
        toReturn = this.EMail;
    }
    return toReturn;
};

ITSCandidate.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newCandidate = false;
    ITSInstance.genericAjaxUpdate('persons/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    this.ITSSession.MessageBus.publishMessage("Person.Update", this);
};

ITSCandidate.prototype.deleteFromServer = function (OnSuccess,OnError){
    ITSInstance.genericAjaxDelete('persons/' + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("Person.Delete", this);
};

ITSCandidate.prototype.getBirthDateInPickerFormat = function () {
    //var BirthDateTemp = moment(this.BirthDate).format(ITSDateFormatPickerMomentJS);
    return convertDateToITR(this.BirthDate);
};

ITSCandidate.prototype.checkForDuplicateLogins = function (Login, OnNoDuplicateFound, OnDuplicateFound) {
    this.duplicateCandidatesCheck = {};
    this.duplicateCandidatesCheckOnNoDuplicateFound = OnNoDuplicateFound;
    this.duplicateCandidatesCheckOnDuplicateFound = OnDuplicateFound;
    ITSInstance.JSONAjaxLoader('persons', this.duplicateCandidatesCheck,
        function () {
            if (this.duplicateCandidatesCheck.length == 0) {
                this.duplicateCandidatesCheckOnNoDuplicateFound();
            }else if (this.duplicateCandidatesCheck.length == 1) {
                if (this.duplicateCandidatesCheck[0].ID == this.ID) {
                    this.duplicateCandidatesCheckOnNoDuplicateFound();
                } else {
                    this.duplicateCandidatesCheckOnDuplicateFound();
                }
            } else {
                this.duplicateCandidatesCheckOnDuplicateFound();
            }
        }.bind(this),
        function () {
            ITSLogger.logMessage(logLevel.ERROR,"ITSCandidate.prototype.checkForDuplicateLogins unexpected error");
            this.duplicateCandidatesCheckOnNoDuplicateFound();
        }.bind(this)
        , ITSCandidate, 0, 5, "", "N", "N", "Y", "EMail = '" + Login + "'");
};

ITSCandidate.prototype.loadByLogin = function (Login, OnSuccess, OnFailure) {
    // load the candidate. The Login may not contain wildcards.
    // please note that the candidates found are NOT loaded in the current object but as an array in the current object.
    // shallowcopy the candidate you want in the current candidate
    if (Login.trim() != "") {
        ITSInstance.JSONAjaxLoader('persons', this, OnSuccess, OnFailure, "ITSCandidate", 0, 1, "", "", "N", "Y", "EMail = '" + Login + "'");
    }
};

ITSCandidate.prototype.requestPassword = function (OnSuccess, OnFailure) {
    ITSInstance.JSONAjaxLoader('persons/' + this.ID + '/password', this, OnSuccess, OnFailure, "ITSCandidate", 0, 1, "", "", "N", "Y");
};


ITSCandidates = function (session) {
    this.ITSSession = session;
    this.currentCandidate = new ITSCandidate(this, session);
    this.searchForCandidates = []; // when load candidates by login or searching this array is filled
};

ITSCandidates.prototype.loadCurrentCandidate = function (CandidateID, OnSuccess, OnFailure) {
    // load the candidate
    ITSInstance.candidates.currentCandidate.Password = "";
    ITSInstance.genericAjaxLoader('persons/' + CandidateID, ITSInstance.candidates.currentCandidate, OnSuccess, OnFailure, function () { return this.newCandidate(); }.bind(this) );
};

ITSCandidates.prototype.loadCurrentCandidateByLogin = function (Login, OnSuccess, OnFailure) {
    // load the candidate
    if (Login.trim() != "") {
        ITSInstance.JSONAjaxLoader('persons', ITSInstance.candidates.searchForCandidates, OnSuccess, OnFailure, "ITSCandidate", 0, 1, "", "", "N", "Y", "EMail = '" + Login + "'");
    }
};

ITSCandidates.prototype.removeUnusedCandidates = function (OnSuccess,OnError) {
    ITSInstance.genericAjaxUpdate('/persons/deleteunused', {}, OnSuccess,OnError)
};

ITSCandidates.prototype.newCandidate = function () {
    return new ITSCandidate(this, this.ITSSession);
};
