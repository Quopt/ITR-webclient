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
    var EditorDiv = $('<div class="container-fluid" id="PersonListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/PersonLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSPersonListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ee8948f2-43cb-450d-88cf-2f71f9c261f3', 'PersonLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List regular sessions in various session states (ready, in progress, done, archived)');
        this.path = "PersonLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='5' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.PersonListerController.search();\"" +
            " id=\"PersonListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.PersonListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSPersonListerEditor_DescriptionLogin\" scope=\"col\">Login</th>" +
            "   <th id=\"ITSPersonListerEditor_DescriptionName\" scope=\"col\">Name</th>" +
            "   <th id=\"ITSPersonListerEditor_ArchivedHeader\" scope=\"col\">Archived</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.PersonListerController.viewPerson(\"%%PERSONID%%\");'>%%LOGIN%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.PersonListerController.viewPerson(\"%%PERSONID%%\");'>%%NAME%%</span></td>" +
            "   <td><span notranslate onclick='ITSInstance.PersonListerController.viewPerson(\"%%PERSONID%%\");'>%%ARCHIVED%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.PersonListerController.viewPerson(\"%%PERSONID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mPersonID = /%%PERSONID%%/g;
        this.mNR = /%%NR%%/g;
        this.mLOGIN = /%%LOGIN%%/g;
        this.mNAME = /%%NAME%%/g;
        this.mARCHIVED = /%%ARCHIVED%%/g;
    };

    ITSPersonListerEditor.prototype.init=function () {
    };

    ITSPersonListerEditor.prototype.hide= function () {
        $('#PersonListerInterfaceSessionEdit').hide();
    };

    ITSPersonListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#PersonListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "EMail";
            this.archived = "N"; // N No Y Yes
            $('#PersonListerTableDelete').hide();

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#PersonListerTable').empty();
            this.searchField = "";
            this.status = "";

            if (getUrlParameterValue('Status')) {
                this.status = getUrlParameterValue('Status');
            }

            this.buildFilter(true);
        }
    };

    ITSPersonListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#PersonListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        $('#PersonListerInterfaceEditSessionEditHeaderStatus')[0].innerText = "";
        $('#PersonListerInterfaceEditSessionEditHeaderStatus').hide();

        if (this.status == "Archived") {
            this.archived = "Y";
            $('#PersonListerInterfaceEditSessionEditHeaderStatus').show();
            $('#PersonListerInterfaceEditSessionEditHeaderStatus')[0].innerText =
                ITSInstance.translator.translate("PersonListerController.PersonStatusArchived", "(archived)");
            $('#PersonListerTableDelete').show();
        }

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSPersonListerEditor.prototype.deleteArchived = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn();

        if ($('#PersonListerDelete-All:checked').val() == "all") {
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            this.deleteCounter = this.personsList.length;
            for (var i=0; i < this.personsList.length; i++) {
                ITSInstance.genericAjaxDelete('persons/' + this.personsList[i].ID, this.deleteCheckLoadingOK.bind(this), this.deleteCheckLoadingFailed.bind(this), false, true);
                ITSInstance.MessageBus.publishMessage("Person.Delete", this);

            }
        }
        else if ($('#PersonListerDelete-OnlyThis:checked').val() == "onlywithoutsession") {
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            this.deleteCounter = this.personsList.length;
            for (var i=0; i < this.personsList.length; i++) {
                this.deleteCheck(this.personsList[i].ID, true);
            }
        }
    };

    ITSPersonListerEditor.prototype.deleteCheck = function (pID, withSessions) {
        var tempSessionCheck = new ITSObject(this, ITSInstance);
        tempSessionCheck.sessionsList = {};
        ITSInstance.JSONAjaxLoader('sessionsview' , tempSessionCheck.sessionsList, this.deleteCheckLoaded.bind(this, tempSessionCheck, pID), this.deleteCheckLoadingFailed.bind(this), 'ITSObject', 0, 2,
            "", "", "N", "Y", "PersonID=" + pID);
    };

    ITSPersonListerEditor.prototype.deleteCheckLoaded = function (tempSessionCheck, pID) {
        if (tempSessionCheck.sessionsList.length == 0) {
            ITSInstance.genericAjaxDelete('persons/' + pID, this.deleteCheckLoadingOK.bind(this), this.deleteCheckLoadingFailed.bind(this), false, true);
            ITSInstance.MessageBus.publishMessage("Person.Delete", this);
        } else {
            this.deleteCheckLoadingOK();
        }
    };

    ITSPersonListerEditor.prototype.deleteCheckLoadingOK = function () {
        this.deleteCounter --;
        if (this.deleteCounter <= 0) {
            ITSInstance.UIController.showInterfaceAsWaitingOff();
            setTimeout(this.search.bind(this), 2000);
        }
    };

    ITSPersonListerEditor.prototype.deleteCheckLoadingFailed = function () {
        ITSInstance.UIController.showError("ITSPersonLister.LoadListFailed", "The candidates or some of the candidates could not be deleted at this moment.")
    };

    ITSPersonListerEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.personsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('persons' , this.personsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSPersonListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.personsList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i + this.currentPage *25 +1 );
            rowText = rowText.replace( this.mPersonID, this.personsList[i].ID );
            rowText = rowText.replace( this.mDESCRIPTION, this.personsList[i].Description );

            var momentDate = moment(this.personsList[i].StartedAt, moment.ISO_8601);
            this.personsList[i].StartedAt = momentDate.format(ITSDateTimeFormatPickerMomentJS);

            var momentDate = moment(this.personsList[i].EndedAt, moment.ISO_8601);
            this.personsList[i].EndedAt = momentDate.format(ITSDateTimeFormatPickerMomentJS);

            var momentDate = moment(this.personsList[i].AllowedStartDateTime, moment.ISO_8601);
            this.personsList[i].AllowedStartDateTime = momentDate.format(ITSDateTimeFormatPickerMomentJS);

            var momentDate = moment(this.personsList[i].AllowedEndDateTime, moment.ISO_8601);
            this.personsList[i].AllowedEndDateTime = momentDate.format(ITSDateTimeFormatPickerMomentJS);

            rowText = rowText.replace( this.mLOGIN, this.personsList[i].EMail );
            rowText = rowText.replace( this.mNAME, this.personsList[i].FirstName + " ("+ this.personsList[i].Initials + ") " + this.personsList[i].LastName );
            rowText = rowText.replace( this.mARCHIVED, this.personsList[i].Active ? "<i class=\"fa fa-times\"></i>" : "<i class=\"fa fa-check\"></i>" );

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#PersonListerTableFindMoreButton').hide();
        if (this.personsList.length >= 25) { $('#PersonListerTableFindMoreButton').show(); };
        if (this.personsList.length == 0) { $('#PersonListerTableDelete').hide(); }

        // replace the div contents with the generated table
        $('#PersonListerTable').empty();
        $('#PersonListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#PersonListerInterfaceSessionEdit");

        $('#PersonListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#PersonListerTableSearchText').focus();
    };

    ITSPersonListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSPersonLister.LoadListFailed", "The session list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSPersonListerEditor.prototype.search = function () {
        this.searchField = $('#PersonListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSPersonListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSPersonListerEditor.prototype.viewPerson= function (personID) {
        this.alreadyLoaded = document.URL;
        ITSRedirectPath("Person&PersonID=" + personID);
    };

    // register the portlet
    ITSInstance.PersonListerController = new ITSPersonListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.PersonListerController);
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        ITSInstance.UIController.registerMenuItem('#submenuCandidatesLI', "#PersonListerController.PersonMenu" ,ITSInstance.translator.translate("#PersonListerController.PersonMenu", "Show active candidates"), "fa-user", "ITSRedirectPath(\'PersonLister\');");
        ITSInstance.UIController.registerMenuItem('#submenuCandidatesLI', "#PersonListerController.PersonArchivedMenu", ITSInstance.translator.translate("#PersonListerController.PersonArchivedMenu", "Show archived candidates"), "fa-archive", "ITSRedirectPath(\'PersonLister&Status=Archived\');");
    });

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("Person.Delete", function () { ITSInstance.PersonListerController.alreadyLoaded = false; ITSInstance.PersonListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("Person.Create", function () { ITSInstance.PersonListerController.alreadyLoaded = false; ITSInstance.PersonListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("Person.Update", function () {
        ITSInstance.PersonListerController.alreadyLoaded = false; ITSInstance.PersonListerController.currentPage =0;
    } );

    // translate the portlet
    ITSInstance.translator.translateDiv("#PersonListerInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE