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
    var EditorDiv = $('<div class="container-fluid" id="CreditsUsedListerServerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CreditsUsedListerServer/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCreditsUsedListerServerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ca725875-1dd6-4aa0-ae16-c4c584a11627', 'CreditsUsedListerServer editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List the credits that are used by the system');
        this.path = "CreditsUsedListerServer";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.CreditsUsedListerServerController.search("+ (new Date().getFullYear()-2) +");'>" + (new Date().getFullYear()-2) +
            "</button>" +
            "<button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.CreditsUsedListerServerController.search("+(new Date().getFullYear()-1)+");'>" + (new Date().getFullYear()-1) +
            "</button>" +
            "<button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.CreditsUsedListerServerController.search("+(new Date().getFullYear())+");'>" + (new Date().getFullYear()) +
            "</button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSCreditsUsedListerServerEditor_Year\" scope=\"col\">Usage year</th>" +
            "   <th id=\"ITSCreditsUsedListerServerEditor_Month\" scope=\"col\">Usage month</th>" +
            "   <th id=\"ITSCreditsUsedListerServerEditor_InvoiceCode\" scope=\"col\">Invoice code</th>" +
            "   <th id=\"ITSCreditsUsedListerServerEditor_TotalTicks\" scope=\"col\">Ticks used</th>" +
            "   <th id=\"ITSCreditsUsedListerServerEditor_CompanyName\" scope=\"col\">Used for company</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate'>%%UsageYear%%</span></td>" +
            "   <td><span notranslate'>%%UsageMonth%%</span></td>" +
            "   <td><span notranslate'>%%InvoiceCode%%</span></td>" +
            "   <td><span notranslate'>%%TotalTicks%%</span></td>" +
            "   <td><span notranslate'>%%CompanyName%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mUsageYear = /%%UsageYear%%/g;
        this.mUsageMonth = /%%UsageMonth%%/g;
        this.mNR = /%%NR%%/g;
        this.mInvoiceCode = /%%InvoiceCode%%/g;
        this.mTotalTicks = /%%TotalTicks%%/g;
        this.mCompanyName = /%%CompanyName%%/g;

    };

    ITSCreditsUsedListerServerEditor.prototype.init=function () {
    };

    ITSCreditsUsedListerServerEditor.prototype.hide= function () {
        $('#CreditsUsedListerServerInterfaceSessionEdit').hide();
    };

    ITSCreditsUsedListerServerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#CreditsUsedListerServerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            if (typeof this.year == "undefined") { this.year = new Date().getFullYear(); }
            this.sortField = "UsageDateTime desc";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#CreditsUsedListerServerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };


    ITSCreditsUsedListerServerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#CreditsUsedListerServerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSCreditsUsedListerServerEditor.prototype.fireRequest = function () {
        this.CreditsUsedList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('creditusagespermonthforall/' + this.year , this.CreditsUsedList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 9999,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSCreditsUsedListerServerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.CreditsUsedList.length; i++) {
            var rowText = this.tablePart2;

            rowText = rowText.replace( this.mNR, i + this.currentPage *100 +1 );
            rowText = rowText.replace( this.mUsageYear, this.CreditsUsedList[i].year );
            rowText = rowText.replace( this.mUsageMonth, this.CreditsUsedList[i].month );
            rowText = rowText.replace( this.mInvoiceCode, this.CreditsUsedList[i].InvoiceCode );
            rowText = rowText.replace( this.mTotalTicks, this.CreditsUsedList[i].ticks );
            rowText = rowText.replace( this.mCompanyName, this.CreditsUsedList[i].CompanyName);

            this.generatedTable += rowText;
        }

        // if returned data is less than 100 records then hide the load more button
        $('#CreditsUsedListerServerTableFindMoreButton').hide();
        //if (this.CreditsUsedList.length >= 100) { $('#CreditsUsedListerServerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#CreditsUsedListerServerTable').empty();
        $('#CreditsUsedListerServerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#CreditsUsedListerServerInterfaceSessionEdit");

        //$('#CreditsUsedListerServerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#CreditsUsedListerServerTableSearchText').focus();
    };

    ITSCreditsUsedListerServerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSCreditsUsedListerServer.LoadListFailed", "The credits usage list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSCreditsUsedListerServerEditor.prototype.search = function (year) {
        this.year = year;
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSCreditsUsedListerServerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSCreditsUsedListerServerEditor.prototype.download = function () {
        temp = ConvertObjectListToCSV(this.CreditsUsedList, ",", ["CompanyID","ID","SessionID","UserID","dbsource","id"]);
        saveFileLocally("itr_creditsusedserver_download.csv", temp);
    };

    // register the portlet
    ITSInstance.CreditsUsedListerServerController = new ITSCreditsUsedListerServerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CreditsUsedListerServerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CreditsUsedListerServerInterfaceSessionEdit");

    ITSInstance.UIController.registerEditor(ITSInstance.CreditsUsedListerServerController);

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsMasterUser) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#CreditsUserListerServer.ListMenu", ITSInstance.translator.translate("#CreditsUserListerServer.ListMenu", "Credit usage at server level"), "fa-calculator", "ITSRedirectPath(\'CreditsUsedListerServer\');");
        }
    }, true);
})()// IIFE