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

//  ITSStatus = ( ReadyToGo = 1, Busy = 2, Done = 3);
// ITSActiveStatus = (Active =1, Inactive =2, ActiveAndInactive =3);
// ITSTestTaking = ( ByHand = 1, OnlyRawScores = 2, FullyAutomated = 3);
// ITSSessionType = ( PersonSession = 0, /// a session with one candidate where every test is for this candidate
//     SimplePersonSession = 1, /// a simple session made with the sboard
// GroupSession = 10, /// one main session where the group session is defined, every group member has his/her own session with the tests in it as defined in the main session
// x360DegreesSession = 20, /// one main session where the candidate and observer each have their own tests in the session. There is only one test in a 360 degress session.
// PublicSessionDefinition = 30, /// the definition of the a public session accessible to everyone on the internet. Tests in this session are for virtual person, meaning that there is no person attached to the test.
// PublicSession = 31 /// An instance of this public session.

ITSCandidateSession = function (session, ITSSession) {
    this.myParent = session;
    this.ITSSession = ITSSession;
    this.ID = newGuid();
    this.GroupSessionID = "00000000-0000-0000-0000-000000000000";
    this.GroupID = "00000000-0000-0000-0000-000000000000";

    //this.Person = ITSSession.candidates.newCandidate(session, ITSSession);
    //this.PersonID = this.Person.ID;
    this.regenerateCandidate();

    this.SessionType = 0; // 0 = PersonSession. 100 = Group session.
    this.Description = "";
    this.Goal = "";
    this.UsedBatteryIDs = "";
    this.UserDefinedFields = "";
    this.Remarks = "";
    this.AllowedStartDateTime = new Date();
    this.AllowedEndDateTime = new Date();
    this.AllowedEndDateTime.addMonths(12);
    this.StartedAt = new Date(2000,1,1);
    this.EndedAt = new Date(2000,1,1);
    this.Status = 10; // 10=ReadyToGo, 20 in progress, 30 done
    this.SessionState = "Ready";
    this.Active = true;
    this.EMailNotificationAdresses = "";
    this.EnforceSessionEndDateTime = false;
    this.ManagedByUserID =  "00000000-0000-0000-0000-000000000000";
    if (ITSSession.users) {
        if (ITSSession.users.currentUser) {
            this.ManagedByUserID = ITSSession.users.currentUser.ID;
        }
    }
    this.EmailNotificationIncludeResults = false;

    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";

    var currentTime = new Date.now();
    this.SessionStartDateTime = currentTime;
    currentTime.addMonths(12);
    this.SessionEndDateTime = currentTime;
    this.StatusDescription="Ready";

    this.SessionTests = []; // a collection of ITSCandidateSessionTest objects

    this.newSession = true;

    this.persistentProperties = [
        'ID', 'GroupSessionID', 'GroupID', 'PersonID', 'SessionType', 'Description', 'Goal', 'UsedBatteryIDs', 'UserDefinedFields',
        'Remarks', 'AllowedStartDateTime', 'AllowedEndDateTime', 'StartedAt', 'EndedAt', 'Status', 'SessionState', 'Active', 'EMailNotificationAdresses',
        'EnforceSessionEndDateTime', 'ManagedByUserID', 'EmailNotificationIncludeResults', "PluginData"
    ];

    // process information
    this.OnError = {};
    this.OnSucces = {};
};

ITSCandidateSession.prototype.regenerateCandidate = function () {
    this.Person = this.ITSSession.candidates.newCandidate(this.myParent, this.ITSSession);
    this.PersonID = this.Person.ID;
};

ITSCandidateSession.prototype.postLoad = function () {
    this.parseDates();
};

ITSCandidateSession.prototype.parseDates = function () {
    var momentDate = 0;
    if ($.type(this.AllowedStartDateTime) === "string") {
        this.AllowedStartDateTime = convertISOtoDate(this.AllowedStartDateTime );
    }
    if ($.type(this.AllowedEndDateTime) === "string") {
        this.AllowedEndDateTime = convertISOtoDate(this.AllowedEndDateTime );
    }
    if ($.type(this.StartedAt) === "string") {
        this.StartedAt = convertISOtoDate(this.StartedAt );
    }
    if ($.type(this.EndedAt) === "string") {
        this.EndedAt = convertISOtoDate(this.EndedAt );
    }
};

ITSCandidateSession.prototype.findTestById = function (id) {
    var foundIndex = -1;
    for (var i=0; i < this.SessionTests.length; i ++) {
        if (this.SessionTests[i].TestID == id) {
            foundIndex = i;
            break;
        }
    }
    return foundIndex;
};

ITSCandidateSession.prototype.relinkToCurrentPersonID= function () {
    for (var i=0; i < this.SessionTests.length; i ++) {
        this.SessionTests[i].PersID = this.Person.ID;
    }
    this.PersonID = this.Person.ID;
};

ITSCandidateSession.prototype.deleteSession = function(OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('sessions/' + this.ID, OnSuccess, OnError, false, true);
    this.ITSSession.MessageBus.publishMessage("Session.Delete", this);
};

ITSCandidateSession.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newSession = false;

    ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    this.ITSSession.MessageBus.publishMessage("Session.Update", this);
};

ITSCandidateSession.prototype.saveToServerIncludingTests = function (OnSuccess, OnError, deleteAllUnstartedTests) {
    if (deleteAllUnstartedTests) {
        ITSInstance.genericAjaxDelete('sessions/' + this.ID + "/deletealltests",
             this.saveToServerIncludingTests.bind(this,OnSuccess,OnError), OnError );
    } else {
        this.lastSavedJSON = ITSJSONStringify(this);
        this.newSession = false;
        ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, function () {
                for (var i = 0; i < this.SessionTests.length; i++) {
                    this.SessionTests[i].saveToServer(function () {
                    }, function () {
                    });
                }
                if (OnSuccess) OnSuccess();
            }.bind(this, OnSuccess)
            , OnError, false, true);
        this.ITSSession.MessageBus.publishMessage("Session.Update", this);
    }
};

ITSCandidateSession.prototype.saveToServerIncludingTestsAndPerson = function (OnSuccess, OnError, deleteAllUnstartedTests) {
    if (deleteAllUnstartedTests) {
        ITSInstance.genericAjaxDelete('sessions/' + this.ID + "/deletealltests",
            this.saveToServerIncludingTestsAndPerson.bind(this,OnSuccess,OnError), OnError );
    } else {
        this.lastSavedJSON = ITSJSONStringify(this);
        this.newSession = false;
        ITSInstance.genericAjaxUpdate('sessions/' + this.ID, this.lastSavedJSON, function () {
                for (var i = 0; i < this.SessionTests.length; i++) {
                    this.SessionTests[i].saveToServer(function () {
                    }, function () {
                    });
                }

                this.Person.saveToServer(function () {
                }, function () {
                });

                if (OnSuccess) OnSuccess();
            }.bind(this, OnSuccess)
            , OnError, false, true);
        this.ITSSession.MessageBus.publishMessage("Session.Update", this);
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServer = function (OnSuccess, OnError, progressElement) {
    // saves all group sessions to server
    this.saveGroupSessionsToServerOnSuccess = OnSuccess;
    this.saveGroupSessionsToServerOnError = OnError;
    this.currentGroupMembers = [];
    this.progressElement = "";
    if (progressElement) {
        this.progressElement = progressElement;
        $('#'+this.progressElement).show();
        this.progressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.currentGroupMembers, this.saveGroupSessionsToServerStageCompare.bind(this), OnError);
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCompareLoad = function (sessionid,  i) {
    var tempSession = new ITSCandidateSession(this, this.ITSSession);
    tempSession.loadSession(sessionid, this.saveGroupSessionsToServerStageCheckSession.bind(this, tempSession, i),
        this.saveGroupSessionsToServerStageCheckSession.bind(this, tempSession, i));
};

ITSCandidateSession.prototype.saveGroupSessionToServerCreateNew = function (GroupMembersIndex) {
    var newSession = new ITSCandidateSession(this, this.ITSSession);
    newSession.Person.EMail = this.PluginData.GroupMembers[GroupMembersIndex].EMail;
    newSession.Person.ID = this.PluginData.GroupMembers[GroupMembersIndex].ID;
    newSession.Person.Active = true;
    newSession.GroupSessionID = this.ID;
    newSession.Description = this.Description;
    newSession.AllowedStartDateTime = this.AllowedStartDateTime;
    newSession.AllowedEndDateTime = this.AllowedEndDateTime;
    newSession.EnforceSessionEndDateTime = this.EnforceSessionEndDateTime;
    newSession.EmailNotificationIncludeResults = this.EmailNotificationIncludeResults;
    newSession.EMailNotificationAdresses = this.EMailNotificationAdresses;
    newSession.PersonID = newSession.Person.ID;
    for (var st=0; st < this.SessionTests.length; st++) {
        var tempTestSession = new ITSCandidateSessionTest(this, this.ITSSession);
        tempTestSession.OldID = tempTestSession.ID;
        newSession.SessionTests.push(tempTestSession);
        shallowCopy(this.SessionTests[st], tempTestSession);
        tempTestSession.ID = tempTestSession.OldID;
        tempTestSession.PersID = newSession.Person.ID;
        tempTestSession.SessionID = newSession.ID;
    }
    newSession.saveToServerIncludingTestsAndPerson(this.saveGroupSessionsToServerStageUpdateOK.bind(this),
        this.saveGroupSessionsToServerStageUpdateError.bind(this));
};
ITSCandidateSession.prototype.saveGroupSessionsToServerUpdateCounter = function () {
    if (this.progressElement != "") {
        $('#'+this.progressElement)[0].innerHTML = this.progressElementCounter + '/'+ this.PluginData.GroupMembers.length;
        $('#'+this.progressElement).attr('aria-valuenow' , Math.round(this.progressElementCounter / this.PluginData.GroupMembers.length) * 100 );
        if (this.progressElementCounter >= this.PluginData.GroupMembers.length) {
            $('#'+this.progressElement).hide();
        }
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCompare = function () {
    // this.currentGroupMembers this.PluginData.GroupMembers
    this.saveGroupSessionsToServerUpdateCounter();
    this.saveGroupSessionsCount = 0;
    for (var i=0; i < this.PluginData.GroupMembers.length; i++) {
        var sessionIndex = InArray(this.currentGroupMembers, "ID", this.PluginData.GroupMembers[i].ID, "==");
        if ( sessionIndex > -1 ) {
            // update
            // first load the session so we can validate it

            this.saveGroupSessionsToServerStageCompareLoad(this.currentGroupMembers[sessionIndex].sessionid,  i);
        } else {
            // create
            this.saveGroupSessionToServerCreateNew(i);
        }
    }
    // now check for deletions
    for (var i=0; i < this.currentGroupMembers.length; i++) {
        if ( InArray(this.PluginData.GroupMembers, "ID", this.currentGroupMembers[i].ID, "==") > -1) {
            // it exists and will already be in the update process
        } else {
            // delete. Deletes will be fired and we will not wait for them. but we can ONLY delete when the session is not in progress!
            if (this.currentGroupMembers[i].sessionstatus <= 10) {
                ITSInstance.genericAjaxDelete('sessions/' + this.currentGroupMembers[i].sessionid, function () {
                }, function () {
                }, false, true);
            }
        }
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageCheckSession = function (tempSession, groupMemberIndex) {
    tempSession.Person.EMail = this.PluginData.GroupMembers[groupMemberIndex].EMail;
    tempSession.Person.ID = this.PluginData.GroupMembers[groupMemberIndex].ID;
    tempSession.Person.Active = true;

    // delete all unstarted tests
    var counter = tempSession.SessionTests.length;
    for (var st = counter -1; st>=0; st--) {
        if (!tempSession.SessionTests[st] || !tempSession.SessionTests[st].Status) {
            console.log("tempSession.SessionTests[st].Status does not exist");
        } else {
            if (tempSession.SessionTests[st].Status <= 10) {
                tempSession.SessionTests.splice(st,1);
            }
        }
    }

    // update
    for (var st = tempSession.SessionTests.length -1; st >= 0; st--) {
        // check if the session is not in tempSession yet
        var index = InArray( this.SessionTests , "TestID", tempSession.SessionTests[st].TestID, "==" );
        if ( index > -1  ) {
            if (tempSession.SessionTests[st].Status <= 10) {
                tempSession.SessionTests[st].oldID = tempSession.SessionTests[st].ID;
                tempSession.SessionTests[st].oldSessionID = tempSession.SessionTests[st].SessionID;
                tempSession.SessionTests[st].oldPersonID = tempSession.SessionTests[st].PersID;
                shallowCopy( this.SessionTests[index] , tempSession.SessionTests[st]);
                tempSession.SessionTests[st].SessionID = tempSession.SessionTests[st].oldSessionID;
                tempSession.SessionTests[st].PersID = tempSession.SessionTests[st].oldPersonID;
                tempSession.SessionTests[st].ID = tempSession.SessionTests[st].oldID;
            }
        }
    }
    tempSession.GroupSessionID = this.ID;
    tempSession.Description = this.Description;
    tempSession.AllowedStartDateTime = this.AllowedStartDateTime;
    tempSession.AllowedEndDateTime = this.AllowedEndDateTime;
    tempSession.EnforceSessionEndDateTime = this.EnforceSessionEndDateTime;
    tempSession.EmailNotificationIncludeResults = this.EmailNotificationIncludeResults;
    tempSession.EMailNotificationAdresses = this.EMailNotificationAdresses;

    // add
    for (var st=this.SessionTests.length-1; st >=0; st--) {
        // check if the session is not in tempSession yet
        if (InArray( tempSession.SessionTests , "TestID", this.SessionTests[st].TestID, "==" ) == -1) {
            var tempTestSession = new ITSCandidateSessionTest(this, this.ITSSession);
            tempTestSession.oldID = tempTestSession.ID;
            shallowCopy(this.SessionTests[st], tempTestSession);
            tempTestSession.SessionID = tempSession.ID;
            tempTestSession.PersID = tempSession.PersonID;
            tempTestSession.ID = tempTestSession.oldID;
            tempSession.SessionTests.push(tempTestSession);

            // if session is already done then switch it back to in progress
            if (tempSession.Status >= 30) { tempSession.Status = 20; }
        }
    }

    tempSession.saveToServerIncludingTestsAndPerson(this.saveGroupSessionsToServerStageUpdateOK.bind(this),
        this.saveGroupSessionsToServerStageUpdateError.bind(this), true);
    this.progressElementCounter++;
    this.saveGroupSessionsToServerUpdateCounter();
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageUpdateOK = function () {
    this.saveGroupSessionsCount ++;
    if (this.saveGroupSessionsCount >= this.PluginData.GroupMembers.length) {
        this.saveGroupSessionsToServerOnSuccess();
    }
};

ITSCandidateSession.prototype.saveGroupSessionsToServerStageUpdateError = function () {
    this.saveGroupSessionsToServerOnError();
};

ITSCandidateSession.prototype.loadSession = function (sessionID, OnSuccess, OnError, excludeDoneTests, InTestTaking) {
    if (OnError) this.OnError = OnError;
    if (OnSuccess) this.OnSucces = OnSuccess;
    this.InTestTaking = InTestTaking;
    // load the session
    if (excludeDoneTests) {
        ITSInstance.JSONAjaxLoader('sessions/' + sessionID, this, function () {
            // load the candidate information
            if (this.SessionType < 100) {
                ITSInstance.JSONAjaxLoader('persons/' + this.PersonID, this.Person, function () {
                }, this.sessionLoadingFailed.bind(this));
            }
        }.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSession', 0, 99999, "", "N", "N", "Y", "Status=10, Status=20");
    } else {
        ITSInstance.JSONAjaxLoader('sessions/' + sessionID, this, function () {
            // load the candidate information
            if (this.SessionType < 100) {
                ITSInstance.JSONAjaxLoader('persons/' + this.PersonID, this.Person, function () {
                }, this.sessionLoadingFailed.bind(this));
            }
        }.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSession');
    }
    // load the tests in the session
    if (InTestTaking) {
        ITSInstance.JSONAjaxLoader('sessionteststaking/' + sessionID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
    } else {
        ITSInstance.JSONAjaxLoader('sessiontests/' + sessionID, this.SessionTests, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this), 'ITSCandidateSessionTest');
    }
};

ITSCandidateSession.prototype.deleteFromServer = function (OnSuccess, OnError) {
    this.ITSSession.genericAjaxDelete('sessions/'  + this.ID , OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("Session.Delete", this);
};

ITSCandidateSession.prototype.sessionLoaded = function () {
    // now load all the tests in this session
    for (var i=0; i < this.SessionTests.length; i++ ) {
        this.SessionTests[i].myParent = this;
        this.SessionTests[i].SessionID = this.ID;
        this.SessionTests[i].ITSSession = this.ITSSession;

        //this.SessionTests[i].loadTest(this.testLoadedFine.bind(this,i), this.sessionLoadingFailed.bind(this));

        this.SessionTests[i].loadDetails(this.testLoadedFine.bind(this,i), this.sessionLoadingFailed.bind(this), this.InTestTaking);
    }
    if (this.SessionTests.length == 0) this.sessionLoadingFailed();
};

ITSCandidateSession.prototype.testLoadedFine = function (testIndex) {
    var allOK = true;
    if (this.SessionTests.length > testIndex) {
        for (var j=0; j < this.SessionTests.length; j++) {
            if ((!this.SessionTests[j].testDefinition) || (!this.SessionTests[j].testDefinition.detailsLoaded) || (!this.SessionTests[j].testDefinition.screenTemplatesLoaded()) || (!this.SessionTests[j].detailsLoaded)) {
                allOK=false;
                break;
            }
        }
        if (allOK) {
            // order tests in sequence
            this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
        }

    }

    if (allOK && this.OnSucces) {
        this.OnSucces();
        this.OnSucces = undefined;
    }
};

ITSCandidateSession.prototype.resequence = function (preventSort) {
    // order tests in sequence
    if (!preventSort) this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
    // resequence
    for (var i=0; i < this.SessionTests.length; i++) {
        this.SessionTests[i].Sequence = i;
    }
};

ITSCandidateSession.prototype.firstTestToTake = function (excludeTestID) {
    var indexFound = -1;
    // sort the list on sequence
    this.SessionTests.sort(function(a, b){return a.Sequence - b.Sequence});
    var checkDate = new Date();
    this.parseDates();
    if ((this.AllowedEndDateTime > checkDate) && (this.AllowedStartDateTime <= checkDate)) {
        for (var i = 0; i < this.SessionTests.length; i++) {
            if (this.SessionTests[i].HowTheTestIsTaken == 10 && this.SessionTests[i].Status < 30) {
                if (!excludeTestID) {
                    indexFound = i;
                    break;
                } else {
                    if (this.SessionTests[i].ID != excludeTestID) {
                        indexFound = i;
                        break;
                    }
                }

            }
        }
    } else {
        if (checkDate < this.AllowedStartDateTime) {
            indexFound = -2;
        }
    }
    return indexFound;
};

ITSCandidateSession.prototype.sessionLoadingFailed = function () {
    // something went wrong
    if (this.OnError) this.OnError();
};

ITSCandidateSession.prototype.newCandidateSessionTest = function (testToAdd) {
    var tempST = new ITSCandidateSessionTest(this, this.ITSSession);

    this.SessionTests.push(tempST);
    tempST.testDefinition = testToAdd;
    tempST.TestID = testToAdd.ID;

    return tempST;
};

ITSCandidateSession.prototype.loadRelatedGroupMembers = function (OnSuccess, OnError) {
    this.PluginData.GroupMembers = [];
    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.PluginData.GroupMembers, OnSuccess, OnError);
};

ITSCandidateSession.prototype.deleteGroupSessionsOnServer = function (OnSuccess, OnError, progressElement, excludeStartedSessions) {
    // saves all group sessions to server
    this.todeleteGroupSessionsToServerOnSuccess = OnSuccess;
    this.todeleteGroupSessionsToServerOnError = OnError;
    this.todeleteGroupMembers = [];
    this.todeleteProgressElement = "";
    this.todeleteExcludeStarted = excludeStartedSessions;
    this.todeleteErrorCount = 0;
    if (progressElement) {
        this.todeleteProgressElement = progressElement;
        $('#'+this.todeleteProgressElement).show();
        this.todeleteProgressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.todeleteGroupMembers, this.deleteGroupSessionsOnServerProceed.bind(this), OnError);
};

ITSCandidateSession.prototype.deleteGroupSessionsOnServerProceed = function () {
    this.todeleteGroupSessionsCount = 0;
    var proceed = true;
    for (var i=0; i < this.todeleteGroupMembers.length; i++) {
        // now delete this session
        proceed = true;
        this.todeleteGroupSessionsCount ++;
        this.todeleteGroupSessionsToServerUpdateCounter();
        if (this.todeleteExcludeStarted) { proceed = this.todeleteGroupMembers[i].sessionstatus == 10; }
        if (proceed) {
            ITSInstance.genericAjaxDelete('sessions/' + this.todeleteGroupMembers[i].sessionid ,
                function () {},
                function () { this.todeleteErrorCount ++; this.todeleteGroupSessionsToServerOnError(); }.bind(this), false, true);
            this.ITSSession.MessageBus.publishMessage("Session.Delete.RelatedGroupSession", this.todeleteGroupMembers[i]);
        }
    }
    if (this.todeleteErrorCount == 0) {
        this.todeleteGroupSessionsToServerOnSuccess();
    }
};

ITSCandidateSession.prototype.todeleteGroupSessionsToServerUpdateCounter = function () {
    if (this.todeleteProgressElementCounter != "") {
        $('#'+this.todeleteProgressElement)[0].innerHTML = this.todeleteProgressElementCounter + '/'+ this.todeleteGroupMembers.length;
        $('#'+this.todeleteProgressElement).attr('aria-valuenow' , Math.round(this.todeleteProgressElementCounter / this.todeleteGroupMembers.length) * 100 );
        if (this.todeleteProgressElementCounter >=  this.todeleteGroupMembers.length) {
            $('#'+this.todeleteProgressElement).hide();
        }
    }
};

ITSCandidateSession.prototype.archiveGroupSessionsOnServer = function (OnSuccess, OnError, progressElement, excludeStartedSessions, newArchiveStatus) {
    // saves all group sessions to server
    this.toarchiveGroupSessionsToServerOnSuccess = OnSuccess;
    this.toarchiveGroupSessionsToServerOnError = OnError;
    this.toarchiveGroupMembers = [];
    this.toarchiveProgressElement = "";
    this.toarchiveExcludeStarted = excludeStartedSessions;
    this.toarchiveStatus = newArchiveStatus;
    this.toarchiveErrorCount = 0;
    if (progressElement) {
        this.toarchiveProgressElement = progressElement;
        $('#'+this.toarchiveProgressElement).show();
        this.toarchiveProgressElementCounter = 0;
    }

    ITSInstance.JSONAjaxLoader('sessions/' + this.ID + "/groupmembers" , this.toarchiveGroupMembers, this.archiveGroupSessionsOnServerProceed.bind(this), OnError);
};

ITSCandidateSession.prototype.archiveGroupSessionsOnServerProceed = function () {
    this.toarchiveGroupSessionsCount = 0;
    var proceed = true;
    for (var i=0; i < this.toarchiveGroupMembers.length; i++) {
        // now delete this session
        proceed = true;

        if (this.toarchiveExcludeStarted) { proceed = this.toarchiveGroupMembers[i].sessionstatus == 10; }
        if (proceed) {
            this.toarchiveGroupMembers[i].session = new ITSCandidateSession(this, this.ITSSession);
            ITSInstance.JSONAjaxLoader('sessions/' + this.toarchiveGroupMembers[i].sessionid , this.toarchiveGroupMembers[i].session,
                function (i) {
                              this.toarchiveGroupSessionsToServerUpdateCounter();
                              this.toarchiveGroupSessionsCount ++;
                              if (this.toarchiveGroupMembers[i].session.Active != this.toarchiveStatus) {
                                  this.toarchiveGroupMembers[i].session.Active = this.toarchiveStatus;
                                  this.toarchiveGroupMembers[i].session.saveToServer( function () {}, this.toarchiveGroupSessionsToServerOnError );
                              }
                            }.bind(this,i),
                function () { this.toarchiveErrorCount ++; this.toarchiveGroupSessionsToServerOnError(); } , false, true);
            this.ITSSession.MessageBus.publishMessage("Session.Delete.RelatedGroupSession", this.toarchiveGroupMembers[i]);
        }
    }
    if (this.toarchiveErrorCount == 0) {
        this.toarchiveGroupSessionsToServerOnSuccess();
    }
};

ITSCandidateSession.prototype.toarchiveGroupSessionsToServerUpdateCounter = function () {
    if (this.toarchiveProgressElementCounter != "") {
        $('#'+this.toarchiveProgressElement)[0].innerHTML = this.toarchiveProgressElementCounter + '/'+ this.toarchiveGroupMembers.length;
        $('#'+this.toarchiveProgressElement).attr('aria-valuenow' , Math.round(this.toarchiveProgressElementCounter / this.toarchiveGroupMembers.length) * 100 );
        if (this.toarchiveProgressElementCounter >=  this.toarchiveGroupMembers.length) {
            $('#'+this.toarchiveProgressElement).hide();
        }
    }
};

// the test definition belonging to the sessions
 ITSCandidateSessionTest = function (parent, ITSSession) {
     this.myParent = parent;
     this.ITSSession = ITSSession;
     this.SessionID = parent.ID;
     this.ID = newGuid();
     this.TestID = "00000000-0000-0000-0000-000000000000"; // the ID of the test
     this.PersID = parent.PersonID; // in case of a person session this is always the candidate. In case of a 360 degrees session this is the id of the person that has to fill in the test
     this.Sequence = 0; // sequence of the test and how it is presented to the candidate
     this.TestLanguage = ""; // the language of the test (in principal test definitions can contain multiple translations)
     this.NormID1 = "00000000-0000-0000-0000-000000000000";
     this.NormID2 = "00000000-0000-0000-0000-000000000000";
     this.NormID3 = "00000000-0000-0000-0000-000000000000";
     this.TestStart = new Date(2000,1,1);
     this.TestEnd = new Date(2000,1,1);
     this.HowTheTestIsTaken = 10; // 10= FullyAutomated, 20=on paper
     this.PercentageOfQuestionsAnswered = 0;
     this.TotalTestTime = 0;
     this.Status = 10; //10 ready, 20 in progress, 30 done
     this.CurrentPage = 0;
     this.TotalPages = 0;
     this.PluginData = {};
     this.Scores = {}; // in fact these are always scale scores of the test. Make sure the object is empty and not derived from the object prototype which can spoil the contents
     this.Results = {}; // these are always screen values (and sometimes a bit more), meaning the full test state
     this.Scores.persistentProperties = "*ALL*";
     this.Scores.testResultAddition = ""; // an addition to the test result status, for example "timer ended". This can be set from a custom script if desired
     this.Results.persistentProperties = "*ALL*";
     this.Results.testTimeLeft = "";
     this.PluginData.persistentProperties = "*ALL*";

     this.testDefinition = {}; // a link to the test definition this candidate session test object is based on
     this.candidate = {} ; // a link to the candidate this session is primarily for

     this.newSessionTest = true;

     this.persistentProperties = [
         "ID",
         "SessionID",
         "TestID",
         "PersID",
         "Sequence",
         "NormID1",
         "NormID2",
         "NormID3",
         "TestStart",
         "TestEnd",
         "HowTheTestIsTaken",
         "PercentageOfQuestionsAnswered",
         "TotalTestTime",
         "Status",
         "CurrentPage",
         "TotalPages",
         "PluginData",
         "Results",
         "Scores",
         "TestLanguage"
     ];

     // process information
    this.detailsLoaded = false;
 };

ITSCandidateSessionTest.prototype.postLoad = function () {
    this.parseDates();
};

ITSCandidateSessionTest.prototype.parseDates = function () {
    var momentDate = 0;
    if ($.type(this.TestStart) === "string") {
        momentDate = moment(this.TestStart, moment.ISO_8601);
        this.TestStart = momentDate.toDate();
    }
    if ($.type(this.TestEnd) === "string") {
        momentDate = moment(this.TestEnd, moment.ISO_8601);
        this.TestEnd = momentDate.toDate();
    }
};

ITSCandidateSessionTest.prototype.updateConsentSettings = function () {
    if (!this.PluginData.DataGathering) {
        this.PluginData.DataGathering = {};
        this.PluginData.DataGathering._objectType = "ITSObject";
        this.PluginData.DataGathering.persistentProperties = "*ALL*";
        this.PluginData.DataGathering.Allowed = true; // set to false to prevent posting of this sessions data to the anonimised data store
        this.PluginData.DataGathering.Location = {};
    }
    $.getJSON('https://geoip-db.com/json/').done (
        function(Location) {
            this.PluginData.DataGathering.Location = Location;
            this.PluginData.DataGathering.Location._objectType = "ITSObject";
            this.PluginData.DataGathering.Location.persistentProperties = "*ALL*";
            this.PluginData.DataGathering.Location.IPv4 = "*ANONYMOUS*";
            this.PluginData.DataGathering.Location.IPv6 = "*ANONYMOUS*";
            if (!this.PluginData.DataGathering.Test)  this.PluginData.DataGathering.Test = "";
        }.bind(this)
    );
} ;

ITSCandidateSessionTest.prototype.saveToServer = function (OnSuccess, OnError, InTestTaking) {
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newSessionTest = false;

    if (InTestTaking) {
        this.ITSSession.genericAjaxUpdate('sessionteststaking/' + this.SessionID + "/" + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    else {
        this.ITSSession.genericAjaxUpdate('sessiontests/'  + this.SessionID + "/" + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
    this.ITSSession.MessageBus.publishMessage("SessionTest.Update", this);
};

ITSCandidateSessionTest.prototype.deleteFromServer = function (OnSuccess, OnError) {
    this.ITSSession.genericAjaxDelete('sessiontests/'  + this.SessionID + "/" + this.ID, OnSuccess, OnError);
    this.ITSSession.MessageBus.publishMessage("SessionTest.Delete", this);
};

ITSCandidateSessionTest.prototype.loadDetails = function (OnSucces, OnError, InTestTaking) {
    if (!this.detailsLoaded) {
        this.detailsLoadedSucces = OnSucces;
        this.detailsLoadedError = OnError;
        this.InTestTaking = InTestTaking;

        if (this.testDefinition.detailsLoaded) {
            this.loadDetailsAfterTestLoad();
        } else {
            // load test
            this.loadTest(this.loadDetailsAfterTestLoad.bind(this), this.detailsLoadedError.bind(this));
        }
    }
};

ITSCandidateSessionTest.prototype.loadDetailsAfterTestLoad = function () {
    if (!this.loadDetailsSuccess) this.loadDetailsSuccess = function () {};
    if (!this.loadDetailsError) this.loadDetailsError = function () {};

    if (this.InTestTaking) {
        ITSInstance.JSONAjaxLoader('sessionteststaking/' + this.SessionID + "/" + this.ID, this, this.loadDetailsSuccess.bind(this), this.loadDetailsError.bind(this));
    } else {
        ITSInstance.JSONAjaxLoader('sessiontests/' + this.SessionID + "/" + this.ID, this, this.loadDetailsSuccess.bind(this), this.loadDetailsError.bind(this));
    }
};

ITSCandidateSessionTest.prototype.loadDetailsSuccess = function () {
    this.detailsLoaded = true;

    this.testDefinition.prepareResultsStorage(this.Results);
    this.testDefinition.prepareScalesStorage(this.Scores, false);

    if (this.detailsLoadedSucces) this.detailsLoadedSucces();
};
ITSCandidateSessionTest.prototype.loadDetailsError = function () {
    if (this.detailsLoadedError) this.detailsLoadedError();
};

ITSCandidateSessionTest.prototype.loadTest = function (OnSucces, OnError) {
    // load the test definition (including all screen definitions) from the server
    var testIndex = this.ITSSession.tests.findTestById(this.ITSSession.tests.testList, this.TestID);
    if (testIndex  < 0) {
        this.testDefinition = new ITSTest(this, this.ITSSession);
        this.testDefinition.ID = this.TestID;
        this.testDefinition.loadTestDetailDefinition(OnSucces.bind(this), OnError.bind(this));
    } else {
        this.testDefinition = this.ITSSession.tests.testList[testIndex];
        if (!this.testDefinition.detailsLoaded) {
            this.testDefinition.loadTestDetailDefinition(OnSucces.bind(this), OnError.bind(this));
        } else {
            if (OnSucces) OnSucces();
        }
    }
};

ITSCandidateSessionTest.prototype.calcTotalPages = function () {
   this.TotalPages = this.testDefinition.getTotalScreens();
};

ITSCandidateSessionTest.prototype.calculateScores = function (autoSave, autoNorm) {
    if (autoSave) {
        var lastSavedJSON = ITSJSONStringify(this);
    }
    this.testDefinition.scoreTest(this.myParent, this, this.myParent.Person, this.Results, this.Scores, ITSInstance);
    if (autoNorm) {
        var normIndex = this.testDefinition.findNormById(this.NormID1);
        if (normIndex >= 0) {
            this.normScores(normIndex);
        }
        var normIndex = this.testDefinition.findNormById(this.NormID2);
        if (normIndex >= 0) {
            this.normScores(normIndex,2);
        }
        var normIndex = this.testDefinition.findNormById(this.NormID3);
        if (normIndex >= 0) {
            this.normScores(normIndex,3);
        }
    }
    if (autoSave) {
        if (lastSavedJSON != ITSJSONStringify(this)) { this.saveToServer( function () {}, function () {}); }
    }
};

ITSCandidateSessionTest.prototype.normScores = function (normIndex, normPostFix) {
    this.testDefinition.norms[normIndex].normTest(this.myParent, this, this.myParent.Person, this.Results, this.Scores, ITSInstance, normPostFix);
};

ITSCandidateSessionTest.prototype.prepareTestStorage = function () {
    this.Scores = this.testDefinition.prepareScalesStorage(this.Scores);
    this.Results = this.testDefinition.prepareResultsStorage(this.Results);
};

ITSCandidateSessionTest.prototype.getScaleScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].Score ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.scale = function (scaleVarName) {
    var result = "";
    for (var i=0; i < this.testDefinition.scales.length; i++) {
        if (this.testDefinition.scales[i].scaleVarName == scaleVarName) return this.Scores["__" + this.testDefinition.scales[i].id];
    }
    return undefined;
};


ITSCandidateSessionTest.prototype.result = function (screenName) {
    var result = "";
    for (var i=0; i < this.testDefinition.screens.length; i++) {
        if (this.testDefinition.screens[i].varName == screenName) return this.Results["__" +this.testDefinition.screens[i].id];
    }
    return undefined;
};

ITSCandidateSessionTest.prototype.getMaxNormScore = function () {
    var norm = this.testDefinition.findNormById(this.NormID1);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getMaxNormScore2 = function () {
    var norm = this.testDefinition.findNormById(this.NormID2);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getMaxNormScore3 = function () {
    var norm = this.testDefinition.findNormById(this.NormID3);
    if (norm > -1) {
        return this.testDefinition.norms[norm].normMaxScore();
    }
    return 10;
};

ITSCandidateSessionTest.prototype.getNormScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormScores2 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore2;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormScores3 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].NormScore3;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores2 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore2;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};

ITSCandidateSessionTest.prototype.getNormPercentileScores3 = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0;  i < this.testDefinition.scales.length; i++) {
        if (this.Scores[ "__"+ this.testDefinition.scales[i].id ]) {
            result += this.Scores["__" + this.testDefinition.scales[i].id].PercentileScore3;
            if (i < this.testDefinition.scales.length-1) result += separator;
        } else {
            result += this.testDefinition.scales[i].defaultValue ;
            if (i < this.testDefinition.scales.length-1) result += separator;
        }
    }
    return result;
};



ITSCandidateSessions = function (session) {
    this.ITSSession = session;
};

ITSCandidateSessions.prototype.newCandidateSession = function () {
    return new ITSCandidateSession(this, this.ITSSession);
};

ITSCandidateSessions.prototype.newGroupSession = function () {
    var x = new ITSCandidateSession(this, this.ITSSession);
    x.SessionType = 100;
    x.PluginData.GroupMembers = []; // array of groupmembers
    return x;
};

