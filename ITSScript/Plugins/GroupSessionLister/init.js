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
//# sourceURL=GroupSessionLister/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="GroupSessionListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/GroupSessionLister/editor.html', function () {
       // things to do after loading the html

        // register the portlet
        ITSInstance.GroupSessionListerController = new ITSGroupSessionListerEditor();
        ITSInstance.UIController.registerEditor(ITSInstance.GroupSessionListerController);
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', '#GroupSessionListerController.GroupSessionMenu', ITSInstance.translator.translate("#GroupSessionListerController.GroupSessionReadyMenu", "Group sessions"), "fa-user", "ITSRedirectPath(\'GroupSessionLister&SessionType=100\');");
            ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#GroupSessionListerController.GroupSessionArchivedMenu", ITSInstance.translator.translate("#GroupSessionListerController.GroupSessionArchivedMenu", "Group sessions archive"), "fa-archive", "ITSRedirectPath(\'GroupSessionLister&SessionType=100&Status=Archived\');");
            ITSInstance.UIController.registerMenuItem('#submenuCoursesLI', '#GroupSessionListerController.CourseMenu', ITSInstance.translator.translate("#GroupSessionListerController.CourseMenu", "Active course group sessions"), "fa-user-friends", "ITSRedirectPath(\'GroupSessionLister&SessionType=1000\');");
            ITSInstance.UIController.registerMenuItem('#submenuCoursesLI', "#GroupSessionListerController.CourseArchivedMenu", ITSInstance.translator.translate("#GroupSessionListerController.CourseArchivedMenu", "Group courses archive"), "fa-archive", "ITSRedirectPath(\'GroupSessionLister&SessionType=1000&Status=Archived\');");
        }, true);

        ITSInstance.MessageBus.subscribe("CurrentCompany.Loaded", function () {
            if (ITSInstance.companies.currentCompany.PluginData.Preferences.EnablePublicSessions) {
                ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', '#GroupSessionListerController.PublicSessionMenu', ITSInstance.translator.translate("#GroupSessionListerController.PublicSessionReadyMenu", "Public sessions"), "fa-user-plus", "ITSRedirectPath(\'GroupSessionLister&SessionType=200\');");
                ITSInstance.UIController.registerMenuItem('#submenuSessionsLI', "#GroupSessionListerController.PublicSessionArchivedMenu", ITSInstance.translator.translate("#PublicSessionListerController.PublicSessionArchivedMenu", "Public sessions archive"), "fa-archive", "ITSRedirectPath(\'GroupSessionLister&SessionType=200&Status=Archived\');");
            }
        }, true);

        // messagebus subscriptions
        ITSInstance.MessageBus.subscribe("Session.Delete", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
        ITSInstance.MessageBus.subscribe("SessionGroup.Delete", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
        ITSInstance.MessageBus.subscribe("Session.Create", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
        ITSInstance.MessageBus.subscribe("Session.Update", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
        ITSInstance.MessageBus.subscribe("SessionGroup.Archived", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );
        ITSInstance.MessageBus.subscribe("SessionGroup.Unarchived", function () { ITSInstance.GroupSessionListerController.alreadyLoaded = false; ITSInstance.GroupSessionListerController.currentPage=0; } );

        // translate the portlet
        ITSInstance.translator.translateDiv("#GroupSessionListerInterfaceSessionEdit");

    });

    var ITSGroupSessionListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ff85d554-29f3-4460-8006-f258b3842107', 'GroupSessionLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List group sessions in various session states (ready, in progress, done, archived)');
        this.path = "GroupSessionLister";

        this.tablePart1 = "<table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='10' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.GroupSessionListerController.search();\"" +
            " id=\"GroupSessionListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.GroupSessionListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSGroupSessionListerEditor_DescriptionHeader\" scope=\"col\">Session description</th>" +
            "   <th class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.A' id=\"ITSGroupSessionListerEditor_ReadyHeader\" scope=\"col\"># ready sessions</th>" +
            "   <th class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.B' id=\"ITSGroupSessionListerEditor_StartedHeader\" scope=\"col\"># started sessions</th>" +
            "   <th class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.C' id=\"ITSGroupSessionListerEditor_EndedHeader\" scope=\"col\"># done sessions</th>" +
            "   <th class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.D' id=\"ITSGroupSessionListerEditor_AllowedStartDateTimeHeader\" scope=\"col\">Allowed start date & time</th>" +
            "   <th class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.E' id=\"ITSGroupSessionListerEditor_AllowedEndDateTimeHeader\" scope=\"col\">Allowed end date & time</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%DESCRIPTION%%</span></td>" +
            "   <td class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.A'><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%READY%%</span></td>" +
            "   <td class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.B'><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%Started%%</span></td>" +
            "   <td class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.C'><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%Ended%%</span></td>" +
            "   <td class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.D'><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDSTART%%</span></td>" +
            "   <td class='d-none d-sm-table-cell' col='GroupSessionListerInterfaceSessionEdit.E'><span notranslate onclick='ITSInstance.GroupSessionListerController.viewSession(\"%%SESSIONID%%\");'>%%ALLOWEDEND%%</span></td>" +
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

                this.sessionType = getUrlParameterValue('SessionType');
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
        if ( this.consultantID.trim() != "") this.filter = this.filter == "" ? "ManagedByUserID=" + this.consultantID : this.filter + ",ManagedByUserID=" + this.consultantID;

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSGroupSessionListerEditor.prototype.fireRequest = function () {
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

        // switch on/off the correct headers and buttons
        var SessionType = getUrlParameterValue("SessionType");
        if (SessionType == "200") {
            $('#GroupSessionListerTableAddPublicButton').show();
            $('#GroupSessionListerTableAddButton').hide();
            $('#GroupSessionListerInterfaceEditSessionEditHeader').hide();
            $('#GroupSessionListerInterfaceEditSessionPublicHeader').show();
        } else {
            $('#GroupSessionListerTableAddPublicButton').hide();
            $('#GroupSessionListerTableAddButton').show();
            $('#GroupSessionListerInterfaceEditSessionEditHeader').show();
            $('#GroupSessionListerInterfaceEditSessionPublicHeader').hide();
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

        // re translate
        ITSInstance.translator.translateDiv("#GroupSessionListerInterfaceSessionEdit");

        // hide columns for public session
        if (getUrlParameterValue("SessionType") == "200") {
            $("[col='GroupSessionListerInterfaceSessionEdit.A']").hide();
            $("[col='GroupSessionListerInterfaceSessionEdit.A']").removeClass('d-sm-table-cell');
            $("[col='GroupSessionListerInterfaceSessionEdit.A']").removeClass('d-none');
        } else {
            $("[col='GroupSessionListerInterfaceSessionEdit.A']").addClass('d-sm-table-cell');
            $("[col='GroupSessionListerInterfaceSessionEdit.A']").addClass('d-none');
        }

        $('#GroupSessionListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#GroupSessionListerTableSearchText').focus();

        if (this.currentPage > 0) {
            $('html, body').animate({scrollTop: $('html, body').get(0).scrollHeight }, 2000);
        }
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
        var SessionType = parseInt(getUrlParameterValue("SessionType"));
        if ((SessionType == "200") || (SessionType == "1200")) {
            ITSRedirectPath("PublicSession&SessionID=" + sessionID + "&SessionType=" + getUrlParameterValue("SessionType"));
        } else {
            ITSRedirectPath("GroupSession&SessionID=" + sessionID + "&SessionType=" + getUrlParameterValue("SessionType"));
        }
    };


    ITSGroupSessionListerEditor.prototype.addNewGroupSession = function () {
        var SessionType = getUrlParameterValue("SessionType");
        if ((SessionType == "200") || (SessionType == "1200")) {
            ITSRedirectPath("PublicSession&SessionType=" + getUrlParameterValue("SessionType") );
        } else {
            ITSRedirectPath("GroupSession&SessionType=" + getUrlParameterValue("SessionType") );
        }
    };

    ITSGroupSessionListerEditor.prototype.showSessionsList = function (groupSessionID) {
        var SessionType = getUrlParameterValue("SessionType");
        SessionType == "1000" ? SessionType = 1002 : SessionType = 0;
        if ((SessionType == "200") || (SessionType == "1200")) {
            ITSRedirectPath("SessionLister&SessionType=" + SessionType + "&GroupSessionID=" + groupSessionID);
        } else {
            ITSRedirectPath("SessionLister&SessionType=" + SessionType + "&GroupSessionID=" + groupSessionID);
        }
    };

})()// IIFE