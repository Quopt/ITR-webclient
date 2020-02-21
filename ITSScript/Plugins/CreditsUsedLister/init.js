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
    var EditorDiv = $('<div class="container-fluid" id="CreditsUsedListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CreditsUsedLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCreditsUsedListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('323340b4-b305-41b8-8dde-705098f5b570', 'CreditsUsedLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List the credits that are used by the system');
        this.path = "CreditsUsedLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.CreditsUsedListerController.search();\"" +
            " id=\"CreditsUsedListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.CreditsUsedListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSCreditsUsedListerEditor_UsageDateTime\" scope=\"col\">Usage date and time</th>" +
            "   <th id=\"ITSCreditsUsedListerEditor_InvoiceCode\" scope=\"col\">Invoice code</th>" +
            "   <th id=\"ITSCreditsUsedListerEditor_TotalTicks\" scope=\"col\">Ticks used</th>" +
            "   <th id=\"ITSCreditsUsedListerEditor_UserName\" scope=\"col\">Used for candidate</th>" +
            "   <th id=\"ITSCreditsUsedListerEditor_SessionName\" scope=\"col\">Used for session</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate'>%%UsageDateTime%%</span></td>" +
            "   <td><span notranslate'>%%InvoiceCode%%</span></td>" +
            "   <td><span notranslate'>%%OriginalTicks%% %%DiscountedTicks%% %%TotalTicks%%</span></td>" +
            "   <td><span notranslate'>%%UserName%%</span></td>" +
            "   <td><span notranslate'>%%SessionName%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mUsageDateTime = /%%UsageDateTime%%/g;
        this.mNR = /%%NR%%/g;
        this.mInvoiceCode = /%%InvoiceCode%%/g;
        this.mOriginalTicks = /%%OriginalTicks%%/g;
        this.mDiscountedTicks = /%%DiscountedTicks%%/g;
        this.mTotalTicks = /%%TotalTicks%%/g;
        this.mUserName = /%%UserName%%/g;
        this.mSessionName = /%%SessionName%%/g;

    };

    ITSCreditsUsedListerEditor.prototype.init=function () {
    };

    ITSCreditsUsedListerEditor.prototype.hide= function () {
        $('#CreditsUsedListerInterfaceSessionEdit').hide();
    };

    ITSCreditsUsedListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#CreditsUsedListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "UsageDateTime desc";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#CreditsUsedListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };


    ITSCreditsUsedListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#CreditsUsedListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSCreditsUsedListerEditor.prototype.fireRequest = function () {
        this.CreditsUsedList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('creditusages' , this.CreditsUsedList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 100,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSCreditsUsedListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.CreditsUsedList.length; i++) {
            var rowText = this.tablePart2;

            this.CreditsUsedList[i].UsageDateTime = convertISOtoITRDate(this.CreditsUsedList[i].UsageDateTime);

            rowText = rowText.replace( this.mNR, i + this.currentPage *100 +1 );
            rowText = rowText.replace( this.mUsageDateTime, this.CreditsUsedList[i].UsageDateTime );
            rowText = rowText.replace( this.mInvoiceCode, this.CreditsUsedList[i].InvoiceCode );
            rowText = rowText.replace( this.mTotalTicks, this.CreditsUsedList[i].TotalTicks );
            rowText = rowText.replace( this.mUserName, this.CreditsUsedList[i].UserName);
            rowText = rowText.replace( this.mSessionName, this.CreditsUsedList[i].SessionName);

            if (this.CreditsUsedList[i].DiscountedTicks != "0") {
                rowText = rowText.replace( this.mOriginalTicks, this.CreditsUsedList[i].OriginalTicks );
                rowText = rowText.replace( this.mDiscountedTicks, "-"+this.CreditsUsedList[i].DiscountedTicks+"=" );
            } else {
                rowText = rowText.replace( this.mOriginalTicks, "" );
                rowText = rowText.replace( this.mDiscountedTicks, "" );
            }

            this.generatedTable += rowText;
        }

        // if returned data is less than 100 records then hide the load more button
        $('#CreditsUsedListerTableFindMoreButton').hide();
        if (this.CreditsUsedList.length >= 100) { $('#CreditsUsedListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#CreditsUsedListerTable').empty();
        $('#CreditsUsedListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#CreditsUsedListerInterfaceSessionEdit");

        $('#CreditsUsedListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#CreditsUsedListerTableSearchText').focus();
    };

    ITSCreditsUsedListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSCreditsUsedLister.LoadListFailed", "The credits usage list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSCreditsUsedListerEditor.prototype.search = function () {
        this.searchField = $('#CreditsUsedListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSCreditsUsedListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSCreditsUsedListerEditor.prototype.download = function () {
        temp = ConvertObjectListToCSV(this.CreditsUsedList, ",", ["CompanyID","ID","SessionID","UserID","dbsource","id"]);
        saveFileLocally("itr_creditsused_download.csv", temp);
    };

    // register the portlet
    ITSInstance.CreditsUsedListerController = new ITSCreditsUsedListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CreditsUsedListerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CreditsUsedListerInterfaceSessionEdit");

    ITSInstance.UIController.registerEditor(ITSInstance.CreditsUsedListerController);


})()// IIFE