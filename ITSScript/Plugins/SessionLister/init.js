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
//# sourceURL=SessionLister/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="SessionListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSSessionListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ee8948f2-43cb-450d-88cf-2f71f9c261f3', 'SessionLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List regular sessions in various session states (ready, in progress, done, archived)');
        this.path = "SessionLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='10' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.SessionListerController.search();\"" +
            " id=\"SessionListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.SessionListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th></th>" +
            "   <th id=\"ITSSessionListerEditor_DescriptionHeader\" scope=\"col\">Session description</th>" +
            "   <th id=\"ITSSessionListerEditor_DescriptionLogin\" scope=\"col\">Login</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_DescriptionName\" scope=\"col\">Name</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_StartedAtHeader\" scope=\"col\">Started at</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_EndedAtHeader\" scope=\"col\">Ended at</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_AllowedStartDateTimeHeader\" scope=\"col\">Allowed start date & time</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_AllowedEndDateTimeHeader\" scope=\"col\">Allowed end date & time</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSSessionListerEditor_ArchivedHeader\" scope=\"col\">Archived</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <th>%%ICON%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%DESCRIPTION%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%LOGIN%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%NAME%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%STARTEDAT%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ENDEDAT%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDSTART%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDEND%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ARCHIVED%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.SessionListerController.viewSession(\"%%SESSIONID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mSessionID = /%%SESSIONID%%/g;
        this.mNR = /%%NR%%/g;
        this.mICON = /%%ICON%%/g;
        this.mSTARTEDAT = /%%STARTEDAT%%/g;
        this.mENDEDAT = /%%ENDEDAT%%/g;
        this.mALLOWEDSTART = /%%ALLOWEDSTART%%/g;
        this.mALLOWEDEND = /%%ALLOWEDEND%%/g;
        this.mDESCRIPTION = /%%DESCRIPTION%%/g;
        this.mLOGIN = /%%LOGIN%%/g;
        this.mNAME = /%%NAME%%/g;
        this.mARCHIVED = /%%ARCHIVED%%/g;
    };

    ITSSessionListerEditor.prototype.init=function () {
    };

    ITSSessionListerEditor.prototype.hide= function () {
        $('#SessionListerInterfaceSessionEdit').hide();
    };

    ITSSessionListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#SessionListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        this.currentPage = 0;

        // sessiontype
        // groupid
        // personid
        this.sessionType = "0";
        this.groupID = "";
        this.groupSessionID = "";
        this.personID = "";
        this.consultantID = "";
        this.sortField = "EndedAt desc, Description";
        this.archived = "N"; // N No Y Yes
        this.status = -1; // no status selection

        if (getUrlParameterValue('SessionType')) {
            this.sessionType = getUrlParameterValue('SessionType');
        }
        if (getUrlParameterValue('GroupID')) {
            this.groupID = getUrlParameterValue('GroupID');
        }
        if (getUrlParameterValue('GroupSessionID')) {
            this.groupSessionID = getUrlParameterValue('GroupSessionID');
        }
        if (getUrlParameterValue('PersonID')) {
            this.personID = getUrlParameterValue('PersonID');
        }
        if (getUrlParameterValue('Status')) {
            this.status = getUrlParameterValue('Status');
            if (this.status == "Busy") {
                this.sortField = "StartedAt desc, Description";
            }
            if (this.status == "Ready") {
                this.sortField = "CreateDate desc, AllowedStartDateTime desc, Description";
            }
            if (this.status == "Done") {
                this.sortField = "EndedAt desc, Description";
            }
            if ((this.status == "Done") && (parseInt(getUrlParameterValue("SessionType")) == 3)) {
                this.sortField = "AllowedStartDateTime desc, Description";
            }
        }
        if (getUrlParameterValue('ConsultantID')) {
            this.consultantID = getUrlParameterValue('ConsultantID');
        }

        // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
        $('#SessionListerTable').empty();
        this.searchField = "";

        // check if a starting search text is passed to this component
        if (typeof this.tempSearchText != "undefined") {
            this.searchField = this.tempSearchText;
            this.setFocusOnSearchField = true;
            delete this.tempSearchText;
        }
        this.buildFilter(true);
    };

    ITSSessionListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#SessionListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        // build up the filter "Status=10, Status=20"
        this.filter = "";
        $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
           ITSInstance.translator.translate("SessionListerController.SessionStatusCommon", "available in the system");
        if (this.status == "Ready") { this.filter = "Status=10";
            $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("SessionListerController.SessionStatusReady", "ready for test taking");
        }
        if (this.status == "Busy") { this.filter = "Status=20,Status=21";
            $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("SessionListerController.SessionStatusBusy", "in progress");
        }
        if (this.status == "Done") { this.filter = "Status=30,Status=31";
            $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("SessionListerController.SessionStatusDone", "ready for reporting");
        }
        if (this.status == "Archived") {
            this.archived = "Y";
            $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("SessionListerController.SessionStatusArchived", "archived");
        }
        if (this.status == "All") {
            this.archived = "B";
            $('#SessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("SessionListerController.SessionStatusAll", "present");
        }
        if (typeof this.sessionType == "undefined") {
            this.filter = this.filter == "" ? "SessionType!=1" : this.filter + ",SessionType!=1"
        } else {
            this.filter = this.filter == "" ? "SessionType=" + this.sessionType.split(",").join(",SessionType=") : this.filter + ",SessionType=" + this.sessionType.split(",").join(",SessionType=")
        }
        if ( this.personID.trim() != "") this.filter = this.filter == "" ? "PersonID=" + this.personID : this.filter + ",PersonID=" + this.personID;
        if ( this.groupID.trim() != "") this.filter = this.filter == "" ? "GroupID=" + this.groupID : this.filter + ",GroupID=" + this.groupID;
        if ( this.groupSessionID.trim() != "") this.filter = this.filter == "" ? "GroupSessionID=" + this.groupSessionID : this.filter + ",GroupSessionID=" + this.groupSessionID;
        if ( this.consultantID.trim() != "") this.filter = this.filter == "" ? "ManagedByUserID=" + this.consultantID : this.filter + ",ManagedByUserID=" + this.consultantID
        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSSessionListerEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.sessionsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('sessionsview' , this.sessionsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSSessionListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.sessionsList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i + this.currentPage * 25 +1 );
            rowText = rowText.replace( this.mSessionID, this.sessionsList[i].ID );
            rowText = rowText.replace( this.mDESCRIPTION, this.sessionsList[i].Description );
            if (this.sessionsList[i].Status == 10) rowText = rowText.replace( this.mICON, '<i class=\"fa fa-fw fa-1x fa-book-reader\"></i>');
            if (this.sessionsList[i].Status < 30) rowText = rowText.replace( this.mICON, '<i class=\"fa fa-fw fa-1x fa-tasks\"></i>');
            if (this.sessionsList[i].Status >= 30) rowText = rowText.replace( this.mICON, '<i class=\"fa fa-fw fa-1x fa-check\"></i>');
            rowText = rowText.replace( this.mICON, '');

            this.sessionsList[i].StartedAt = convertISOtoITRDate(this.sessionsList[i].StartedAt);
            this.sessionsList[i].EndedAt = convertISOtoITRDate(this.sessionsList[i].EndedAt);
            this.sessionsList[i].AllowedStartDateTime = convertISOtoITRDate(this.sessionsList[i].AllowedStartDateTime);
            this.sessionsList[i].AllowedEndDateTime = convertISOtoITRDate(this.sessionsList[i].AllowedEndDateTime);

            rowText = rowText.replace( this.mSTARTEDAT, this.sessionsList[i].StartedAt );
            rowText = rowText.replace( this.mENDEDAT, this.sessionsList[i].EndedAt );
            rowText = rowText.replace( this.mALLOWEDSTART, this.sessionsList[i].AllowedStartDateTime );
            rowText = rowText.replace( this.mALLOWEDEND, this.sessionsList[i].AllowedEndDateTime );
            rowText = rowText.replace( this.mLOGIN, this.sessionsList[i].EMail );
            rowText = rowText.replace( this.mNAME, this.sessionsList[i].FirstName + " ("+ this.sessionsList[i].Initials + ") " + this.sessionsList[i].LastName );
            rowText = rowText.replace( this.mARCHIVED, this.sessionsList[i].active ? "<i class=\"fa fa-times\"></i>" : "<i class=\"fa fa-check\"></i>" );

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#SessionListerTableFindMoreButton').hide();
        if (this.sessionsList.length >= 25) {
            $('#SessionListerTableFindMoreButton').show();
        };

        // replace the div contents with the generated table
        $('#SessionListerTable').empty();
        $('#SessionListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#SessionListerInterfaceSessionEdit");

        $('#SessionListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#SessionListerTableSearchText').focus();

        if (this.currentPage > 0) {
            $('html, body').animate({scrollTop: $('html, body').get(0).scrollHeight }, 2000);
        }
    };

    ITSSessionListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSSessionLister.LoadListFailed", "The session list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSSessionListerEditor.prototype.search = function () {
        this.searchField = $('#SessionListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSSessionListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSSessionListerEditor.prototype.viewSession = function (sessionID) {
        this.searchField = $('#SessionListerTableSearchText').val();
        if (this.searchField.trim() != "") this.tempSearchText = this.searchField.trim();
        this.alreadyLoaded = document.URL;
        if (parseInt(getUrlParameterValue("SessionType")) == 1001) {
            ITSRedirectPath("Session&SessionType=1001&SessionID=" + sessionID);
        }
        else if (parseInt(getUrlParameterValue("SessionType")) == 1003) {
            ITSRedirectPath("Session&SessionType=1003&SessionID=" + sessionID);
        }
        else if (parseInt(getUrlParameterValue("SessionType")) == 3) {
            ITSRedirectPath("Session&SessionType=3&SessionID=" + sessionID);
        }
        else {
            ITSRedirectPath("Session&SessionID=" + sessionID);
        }
    };

    // register the portlet
    ITSInstance.SessionListerController = new ITSSessionListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.SessionListerController);
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', '#SessionListerController.SessionReadyMenu', ITSInstance.translator.translate("#SessionListerController.SessionReadyMenu", "Show sessions ready for test taking"), "fa-book-reader", "ITSRedirectPath(\'SessionLister&SessionType=0&Status=Ready\');");
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#SessionListerController.SessionInProgressMenu", ITSInstance.translator.translate("#SessionListerController.SessionInProgressMenu", "Show in progress sessions"), "fa-tasks", "ITSRedirectPath(\'SessionLister&SessionType=0&Status=Busy\');");
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#SessionListerController.SessionDoneMenu", ITSInstance.translator.translate("#SessionListerController.SessionDoneMenu", "Show report ready sessions"), "fa-check", "ITSRedirectPath(\'SessionLister&SessionType=0&Status=Done\');");
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#SessionListerController.SessionArchivedMenu", ITSInstance.translator.translate("#SessionListerController.SessionArchivedMenu", "Show archived sessions"), "fa-archive", "ITSRedirectPath(\'SessionLister&SessionType=0&Status=Archived\');");
        ITSInstance.UIController.registerMenuItem('#submenuTeachingLI', '#SessionListerController.MyTeachingSessionMenu', ITSInstance.translator.translate("#SessionListerController.MyTeachingSessionMenu", "My active teaching sessions"), "fa-user", "ITSRedirectPath(\'SessionLister&SessionType=1001&Status=All&ConsultantID="+ITSInstance.users.currentUser.ID+"\');" );
        ITSInstance.UIController.registerMenuItem('#submenuTeachingLI', '#SessionListerController.TeachingSessionMenu', ITSInstance.translator.translate("#SessionListerController.TeachingSessionMenu", "Active teaching sessions"), "fa-tasks", "ITSRedirectPath(\'SessionLister&SessionType=1001&Status=All\');");
        ITSInstance.UIController.registerMenuItem('#submenuTeachingLI', '#SessionListerController.TeachingSessionArchivedMenu', ITSInstance.translator.translate("#SessionListerController.TeachingSessionArchivedMenu", "Archived teaching sessions"), "fa-book-reader", "ITSRedirectPath(\'SessionLister&SessionType=1001&Status=Archived\');");
        ITSInstance.UIController.registerMenuItem('#submenuCoursesLI', '#SessionListerController.CourseIndividualMenu', ITSInstance.translator.translate("#SessionListerController.CourseIndividualMenu", "Active individual course sessions"), "fa-user-plus", "ITSRedirectPath(\'SessionLister&SessionType=1003\');");
        ITSInstance.UIController.registerMenuItem('#submenuCoursesLI', "#SessionListerController.CourseIndividualArchivedMenu", ITSInstance.translator.translate("#SessionListerController.CourseIndividualArchivedMenu", "Individual courses archive"), "fa-archive", "ITSRedirectPath(\'SessionLister&SessionType=1003&Status=Archived\');");

    }, true);


    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("Session.Delete", function () { ITSInstance.SessionListerController.alreadyLoaded = false; ITSInstance.SessionListerController.currentPage=0; } );
    ITSInstance.MessageBus.subscribe("Session.Create", function () { ITSInstance.SessionListerController.alreadyLoaded = false; ITSInstance.SessionListerController.currentPage=0; } );
    ITSInstance.MessageBus.subscribe("Session.Update", function () { ITSInstance.SessionListerController.alreadyLoaded = false; ITSInstance.SessionListerController.currentPage=0; } );

    // translate the portlet
    ITSInstance.translator.translateDiv("#SessionListerInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE