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

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="CreditsGrantedListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CreditsGrantedLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCreditsGrantedListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('72823375-5f56-4fa9-8936-2be7b1a58e7c', 'CreditsGrantedLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List the credits that are used by the system');
        this.path = "CreditsGrantedLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSCreditsGrantedListerEditor_GrantedWhen\" scope=\"col\">Grant date and time</th>" +
            "   <th id=\"ITSCreditsGrantedListerEditor_CreditsGranted\" scope=\"col\">Amount granted</th>" +
            "   <th id=\"ITSCreditsGrantedListerEditor_Remarks\" scope=\"col\">Remarks</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate'>%%GrantedWhen%%</span></td>" +
            "   <td><span notranslate'>%%CreditsGranted%%</span></td>" +
            "   <td><span notranslate'>%%Remarks%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mGrantedWhen = /%%GrantedWhen%%/g;
        this.mNR = /%%NR%%/g;
        this.mCreditsGranted = /%%CreditsGranted%%/g;
        this.mRemarks = /%%Remarks%%/g;

    };

    ITSCreditsGrantedListerEditor.prototype.init=function () {
    };

    ITSCreditsGrantedListerEditor.prototype.hide= function () {
        $('#CreditsGrantedListerInterfaceSessionEdit').hide();
    };

    ITSCreditsGrantedListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#CreditsGrantedListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "GrantedWhen desc";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#CreditsGrantedListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };


    ITSCreditsGrantedListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#CreditsGrantedListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSCreditsGrantedListerEditor.prototype.fireRequest = function () {
        this.CreditsGrantedList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('creditgrants', this.CreditsGrantedList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 100,
            this.sortField, this.archived, "Y", "N", this.filter, this.searchField);
    };

    ITSCreditsGrantedListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.CreditsGrantedList.length; i++) {
            var rowText = this.tablePart2;

            this.CreditsGrantedList[i].GrantedWhen = convertISOtoITRDate(this.CreditsGrantedList[i].GrantedWhen);

            rowText = rowText.replace( this.mNR, i + this.currentPage *100 +1 );
            rowText = rowText.replace( this.mGrantedWhen, this.CreditsGrantedList[i].GrantedWhen );
            rowText = rowText.replace( this.mCreditsGranted, this.CreditsGrantedList[i].CreditsGranted );

            if (ITSInstance.users.currentUser.IsMasterUser) {
                var companyName ="X";
                try {
                    companyName = ITSInstance.companies.findOtherCompanyByID(this.CreditsGrantedList[i].CompanyID).CompanyName;
                } catch {}
                this.CreditsGrantedList[i].Remarks = "[" + companyName + "] " + this.CreditsGrantedList[i].Remarks ;
                rowText = rowText.replace( this.mRemarks, this.CreditsGrantedList[i].Remarks );
            } else {
                rowText = rowText.replace( this.mRemarks, this.CreditsGrantedList[i].Remarks );
            }
            this.generatedTable += rowText;
        }

        // if returned data is less than 100 records then hide the load more button
        $('#CreditsGrantedListerTableFindMoreButton').hide();
        if (this.CreditsGrantedList.length >= 100) { $('#CreditsGrantedListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#CreditsGrantedListerTable').empty();
        $('#CreditsGrantedListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#CreditsGrantedListerInterfaceSessionEdit");

        $('#CreditsGrantedListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#CreditsGrantedListerTableSearchText').focus();
    };

    ITSCreditsGrantedListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSCreditsGrantedLister.LoadListFailed", "The credits grant list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSCreditsGrantedListerEditor.prototype.search = function () {
        this.searchField = $('#CreditsGrantedListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSCreditsGrantedListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSCreditsGrantedListerEditor.prototype.download = function () {
        temp = ConvertObjectListToCSV(this.CreditsGrantedList, ",", ["CompanyID","ID","SessionID","UserID","dbsource","id"]);
        saveFileLocally("itr_CreditsGranted_download.csv", temp);
    };

    // register the portlet
    ITSInstance.CreditsGrantedListerController = new ITSCreditsGrantedListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CreditsGrantedListerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CreditsGrantedListerInterfaceSessionEdit");

    ITSInstance.UIController.registerEditor(ITSInstance.CreditsGrantedListerController);

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.MayOrderCredits) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#CreditsGrantedLister.ListMenu", ITSInstance.translator.translate("#CreditsGrantedLister.ListMenu", "Credit grants"), "fa-calculator", "ITSRedirectPath(\'CreditsGrantedLister\');");
        }
    }, true);
})()// IIFE