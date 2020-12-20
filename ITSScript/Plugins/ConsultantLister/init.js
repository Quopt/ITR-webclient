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
//# sourceURL=ConsultantLister/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="ConsultantListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ConsultantLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSConsultantListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('9447f64b-7829-4ce5-9a92-ca3c76c07202', 'ConsultantLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Manage the consultants of your organisation');
        this.path = "ConsultantLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.ConsultantListerController.search();\"" +
            " id=\"ConsultantListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.ConsultantListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSConsultantListerEditor_DescriptionLogin\" scope=\"col\">Login</th>" +
            "   <th id=\"ITSConsultantListerEditor_DescriptionName\" class='d-none d-sm-table-cell' scope=\"col\">Name</th>" +
            "   <th id=\"ITSConsultantListerEditor_DescriptionLastLogin\" class='d-none d-sm-table-cell' scope=\"col\">Last login date and time</th>" +
            "   <th id=\"ITSConsultantListerEditor_DescriptionPasswordExpiration\" class='d-none d-sm-table-cell' scope=\"col\">Password expiration date</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.ConsultantListerController.viewConsultant(\"%%PERSONID%%\");'>%%LOGIN%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.ConsultantListerController.viewConsultant(\"%%PERSONID%%\");'>%%NAME%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.ConsultantListerController.viewConsultant(\"%%PERSONID%%\");'>%%LASTLOGINDATE%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.ConsultantListerController.viewConsultant(\"%%PERSONID%%\");'>%%PASSWORDDATE%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.ConsultantListerController.viewConsultant(\"%%PERSONID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mPersonID = /%%PERSONID%%/g;
        this.mNR = /%%NR%%/g;
        this.mLOGIN = /%%LOGIN%%/g;
        this.mNAME = /%%NAME%%/g;
        this.mLASTLOGINDATE = /%%LASTLOGINDATE%%/g;
        this.mPASSWORDDATE = /%%PASSWORDDATE%%/g;

    };

    ITSConsultantListerEditor.prototype.init=function () {
    };

    ITSConsultantListerEditor.prototype.hide= function () {
        $('#ConsultantListerInterfaceSessionEdit').hide();
    };

    ITSConsultantListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ConsultantListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "Email";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#ConsultantListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };


    ITSConsultantListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#ConsultantListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSConsultantListerEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.loginsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('logins' , this.loginsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSConsultantListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.loginsList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i + this.currentPage *25 +1 );
            rowText = rowText.replace( this.mPersonID, this.loginsList[i].id );
            rowText = rowText.replace( this.mNAME, this.loginsList[i].UserName );

            this.loginsList[i].PasswordExpirationDate = convertISOtoITRDate(this.loginsList[i].PasswordExpirationDate);
            this.loginsList[i].StartDateLicense = convertISOtoITRDate(this.loginsList[i].StartDateLicense);
            this.loginsList[i].EndDateLicense = convertISOtoITRDate(this.loginsList[i].EndDateLicense);
            this.loginsList[i].LastLoginDateTime = convertISOtoITRDate(this.loginsList[i].LastLoginDateTime);
            this.loginsList[i].LastRefreshDateTime = convertISOtoITRDate(this.loginsList[i].LastRefreshDateTime);

            rowText = rowText.replace( this.mLOGIN, this.loginsList[i].Email );
            rowText = rowText.replace( this.mLASTLOGINDATE, this.loginsList[i].LastLoginDateTime);
            rowText = rowText.replace( this.mPASSWORDDATE, this.loginsList[i].PasswordExpirationDate);

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#ConsultantListerTableFindMoreButton').hide();
        if (this.loginsList.length >= 25) { $('#ConsultantListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#ConsultantListerTable').empty();
        $('#ConsultantListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#ConsultantListerInterfaceSessionEdit");

        $('#ConsultantListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#ConsultantListerTableSearchText').focus();

        if (this.currentPage > 0) {
            $('html, body').animate({scrollTop: $('html, body').get(0).scrollHeight }, 2000);
        }
    };

    ITSConsultantListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSConsultantLister.LoadListFailed", "The consultant list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSConsultantListerEditor.prototype.search = function () {
        this.searchField = $('#ConsultantListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSConsultantListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSConsultantListerEditor.prototype.viewConsultant = function (consultantID) {
        this.alreadyLoaded = document.URL;
        ITSRedirectPath("ConsultantEditor&ConsultantID=" + consultantID);
    };

    ITSConsultantListerEditor.prototype.addNew = function () {
        var tempUser = ITSInstance.users.createNewUser();
        tempUser.IsOfficeUser = true;
        ITSInstance.ConsultantEditorController.currentConsultant = tempUser;
        ITSRedirectPath("ConsultantEditor&ConsultantID=" + tempUser.ID);
    };

    // register the portlet
    ITSInstance.ConsultantListerController = new ITSConsultantListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ConsultantListerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ConsultantListerInterfaceSessionEdit");

    ITSInstance.UIController.registerEditor(ITSInstance.ConsultantListerController);

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if ( (ITSInstance.users.currentUser.IsOrganisationSupervisor) || (ITSInstance.users.currentUser.IsMasterUser) ) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#ConsultantListerController.ConsultantsMenu", ITSInstance.translator.translate("#ConsultantListerController.ConsultantsMenu", "Manage consultants"), "fa-users", "ITSRedirectPath(\'ConsultantLister\');");
        }
    }, true);

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("User.Delete", function () { ITSInstance.ConsultantListerController.alreadyLoaded = false; ITSInstance.ConsultantListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("User.Create", function () { ITSInstance.ConsultantListerController.alreadyLoaded = false; ITSInstance.ConsultantListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("User.Update", function () { ITSInstance.ConsultantListerController.alreadyLoaded = false; ITSInstance.ConsultantListerController.currentPage =0; } );

})()// IIFE