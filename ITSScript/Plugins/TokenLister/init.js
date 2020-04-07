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
    var EditorDiv = $('<div class="container-fluid" id="TokenListerInterfaceTokenEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/TokenLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSTokenListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ccac617d-6146-436e-9996-88ed0b6e8edd', 'TokenLister viewer', '1.0', 'Copyright 2020 Quopt IT Services BV', 'List active logged in users');
        this.path = "TokenLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSTokenListerEditor_CompanyNameHeader\" scope=\"col\">Company</th>" +
            "   <th id=\"ITSTokenListerEditor_UserNameHeader\" scope=\"col\">Name</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSTokenListerEditor_TokenValidatedHeader\" scope=\"col\">Last validation date and time</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSTokenListerEditor_IsTestTakingUserHeader\" scope=\"col\">Test taking user</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%COMPANYNAME%%</span></td>" +
            "   <td><span notranslate>%%USERNAME%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%TOKENVALIDATED%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%ISTESTTAKINGUSER%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mUserName = /%%USERNAME%%/g;
        this.mCompanyName = /%%COMPANYNAME%%/g;
        this.mNR = /%%NR%%/g;
        this.mTokenValidated = /%%TOKENVALIDATED%%/g;
        this.mIsTestTakingUser = /%%ISTESTTAKINGUSER%%/g;
    };

    ITSTokenListerEditor.prototype.init=function () {
    };

    ITSTokenListerEditor.prototype.hide= function () {
        $('#TokenListerInterfaceTokenEdit').hide();
    };

    ITSTokenListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#TokenListerInterfaceTokenEdit').show();
        ITSInstance.UIController.initNavBar();

        this.TokensList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.loadList();
    };

    ITSTokenListerEditor.prototype.loadList = function () {
        if $('#NavbarsAdmin').is(':visible') {
            ITSInstance.JSONAjaxLoader('tokens', this.TokensList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', 0, 99999,
                "CompanyID, UserID", "N", "Y", "N", this.filter, this.searchField);
        }
    };

    ITSTokenListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // generate table header
        this.generatedTable = this.tablePart1;
        var compFound = {};

        // generate the records for the returned data
        for (var i=0; i < this.TokensList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i+1 );
            rowText = rowText.replace( this.mUserName, this.TokensList[i].UserID );
            compFound = ITSInstance.companies.findOtherCompanyByID(this.TokensList[i].CompanyID);
            if (compFound !== undefined) {
                rowText = rowText.replace(this.mCompanyName, compFound.CompanyName);
            } else {
                rowText = rowText.replace(this.mCompanyName, "-");
            }
            rowText = rowText.replace( this.mTokenValidated, convertISOtoITRDate( this.TokensList[i].TokenValidated) );
            rowText = rowText.replace( this.mIsTestTakingUser, this.TokensList[i].IsTestTakingUser ? '<i class=\"fa fa-sm fa-check\"></i>' : "" );

            this.generatedTable += rowText;
        }

        // replace the div contents with the generated table
        $('#TokenListerTable').empty();
        $('#TokenListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#TokenListerInterfaceTokenEdit");
    };

    ITSTokenListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSTokenLister.LoadListFailed", "The active user list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    // register the portlet
    ITSInstance.TokenListerController = new ITSTokenListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.TokenListerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#TokenListerInterfaceTokenEdit");

    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.TokenListerController.loadList);

    // register the menu items if applicable

})()// IIFE