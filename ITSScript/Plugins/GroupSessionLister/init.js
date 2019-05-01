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

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="GroupSessionListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/GroupSessionLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSGroupSessionListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ff85d554-29f3-4460-8006-f258b3842107', 'GroupSessionLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List group sessions in various session states (ready, in progress, done, archived)');
        this.path = "GroupSessionLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='10' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.GroupSessionListerController.search();\"" +
            " id=\"GroupSessionListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.GroupSessionListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_DescriptionHeader\" scope=\"col\">Session description</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_ReadyHeader\" scope=\"col\"># ready sessions</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_StartedHeader\" scope=\"col\"># started sessions</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_EndedHeader\" scope=\"col\"># done sessions</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_AllowedStartDateTimeHeader\" scope=\"col\">Allowed start date & time</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_AllowedEndDateTimeHeader\" scope=\"col\">Allowed end date & time</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%DESCRIPTION%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%READY%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%Started%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%Ended%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDSTART%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDEND%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.GroupSessionListerController.showSessionsList(\"%%SESSIONID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-tasks\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mSessionID = /%%SESSIONID%%/g;
        this.mNR = /%%NR%%/g;
        this.mREADY = /%%READY%%/g;
        this.mSTARTED = /%%Started%%/g;
        this.mENDED = /%%Ended%%/g;
        this.mALLOWEDSTART = /%%ALLOWEDSTART%%/g;
        this.mALLOWEDEND = /%%ALLOWEDEND%%/g;
        this.mDESCRIPTION = /%%DESCRIPTION%%/g;
    };

    ITSGroupSessionListerEditor.prototype.init=function () {
    };

    ITSGroupSessionListerEditor.prototype.hide= function () {
        $('#GroupSessionListerInterfaceSessionEdit').hide();
    };

    ITSGroupSessionListerEditor.prototype.show=function () {
        if (getUrlParameterValue('SessionType')) {
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#GroupSessionListerInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
                this.currentPage = 0;

                // sessiontype
                // groupid
                // personid
                this.sessionType = "0";
                this.groupID = "";
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
                if (getUrlParameterValue('PersonID')) {
                    this.personID = getUrlParameterValue('PersonID');
                }
                if (getUrlParameterValue('Status')) {
                    this.status = getUrlParameterValue('Status');
                    if (this.status == "Busy") {
                        this.sortField = "StartedAt desc, Description";
                    }
                }
                if (getUrlParameterValue('ConsultantID')) {
                    this.consultantID = getUrlParameterValue('ConsultantID');
                }

                // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
                $('#GroupSessionListerTable').empty();
                this.buildFilter(true);
                this.searchField = "";
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSGroupSessionListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#GroupSessionListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        // build up the filter "Status=10, Status=20"
        this.filter = "";
        $('#GroupSessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
           ITSInstance.translator.translate("GroupSessionListerController.SessionStatusCommon", "available in the system");
/*        if (this.status == "Ready") { this.filter = "Status=10";
            $('#GroupSessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("GroupSessionListerController.SessionStatusReady", "ready for test taking");
        }
        if (this.status == "Busy") { this.filter = "Status=20,Status=21";
            $('#GroupSessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("GroupSessionListerController.SessionStatusBusy", "in progress");
        }
        if (this.status == "Done") { this.filter = "Status=30,Status=31";
            $('#GroupSessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("GroupSessionListerController.SessionStatusDone", "ready for reporting");
        }
 */
        if (this.status == "Archived") {
            this.archived = "Y";
            $('#GroupSessionListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("GroupSessionListerController.SessionStatusArchived", "archived");
        } else {
            this.Archived = "N";
        }
        this.filter = this.filter == "" ? "SessionType=" + this.sessionType : this.filter + ",SessionType=" + this.sessionType
        if ( this.personID.trim() != "") this.filter = this.filter == "" ? "PersonID=" + this.personID : this.filter + ",PersonID=" + this.personID;
        if ( this.groupID.trim() != "") this.filter = this.filter == "" ? "GroupID=" + this.groupID : this.filter + ",GroupID=" + this.groupID;
        if ( this.consultantID.trim() != "") this.filter = this.filter == "" ? "ManagedByUserID=" + this.consultantID : this.filter + ",ManagedByUserID=" + this.consultantID
        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSGroupSessionListerEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.sessionsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('groupsessionsview' , this.sessionsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSGroupSessionListerEditor.prototype.listLoaded = function () {
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

            this.sessionsList[i].AllowedStartDateTime = convertISOtoITRDate(this.sessionsList[i].AllowedStartDateTime);
            this.sessionsList[i].AllowedEndDateTime = convertISOtoITRDate(this.sessionsList[i].AllowedEndDateTime);

            rowText = rowText.replace( this.mREADY, this.sessionsList[i].readycount );
            rowText = rowText.replace( this.mSTARTED, this.sessionsList[i].inprogresscount );
            rowText = rowText.replace( this.mENDED, this.sessionsList[i].donecount );
            rowText = rowText.replace( this.mALLOWEDSTART, this.sessionsList[i].AllowedStartDateTime );
            rowText = rowText.replace( this.mALLOWEDEND, this.sessionsList[i].AllowedEndDateTime );

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#GroupSessionListerTableFindMoreButton').hide();
        if (this.sessionsList.length >= 25) {
            $('#GroupSessionListerTableFindMoreButton').show();
        };

        // replace the div contents with the generated table
        $('#GroupSessionListerTable').empty();
        $('#GroupSessionListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#GroupSessionListerInterfaceSessionEdit");

        $('#GroupSessionListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#GroupSessionListerTableSearchText').focus();
    };

    ITSGroupSessionListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSGroupSessionLister.LoadListFailed", "The session list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSGroupSessionListerEditor.prototype.search = function () {
        this.searchField = $('#GroupSessionListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSGroupSessionListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSGroupSessionListerEditor.prototype.viewSession = function (sessionID) {
        this.alreadyLoaded = document.URL;
        ITSRedirectPath("GroupSession&SessionID=" + sessionID);
    };


    ITSGroupSessionListerEditor.prototype.addNewGroupSession = function () {
        ITSRedirectPath("GroupSession" );
    };

    // register the portlet
    ITSInstance.GroupSessionListerController = new ITSGroupSessionListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.GroupSessionListerController);
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', '#GroupSessionListerController.GroupSessionMenu', ITSInstance.translator.translate("#GroupSessionListerController.GroupSessionReadyMenu", "Group sessions"), "fa-user-plus", "ITSRedirectPath(\'GroupSessionLister&SessionType=100\');");
        ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#GroupSessionListerController.GroupSessionArchivedMenu", ITSInstance.translator.translate("#GroupSessionListerController.GroupSessionArchivedMenu", "Group sessions archive"), "fa-archive", "ITSRedirectPath(\'GroupSessionLister&SessionType=100&Status=Archived\');");
    });


    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("Session.Delete", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
    ITSInstance.MessageBus.subscribe("Session.Create", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
    ITSInstance.MessageBus.subscribe("Session.Update", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );

    // translate the portlet
    ITSInstance.translator.translateDiv("#GroupSessionListerInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE