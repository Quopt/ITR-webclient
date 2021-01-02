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
//# sourceURL=OrganisationEditor/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="OrganisationInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/OrganisationEditor/editor.html', function () {
       // things to do after loading the html
    });

    var ITSOrganisationEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('24f1643d-1239-4d24-94c1-d61306d3fcad', 'Organisation editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit organisations on the database level');
        this.path = "OrganisationEditor";
        this.currentOrganisation = new ITSCompany(ITSInstance);

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSOrganisationEditor_DescriptionInvoiceCode\" scope=\"col\">Invoice code</th>" +
            "   <th id=\"ITSOrganisationEditor_DescriptionCosts\" class='d-none d-sm-table-cell' scope=\"col\">Test costs override</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <td scope=\"row\">%%NR%%</td>" +
            "   <td><span><input id='ITSOrganisationEditor_InvoiceCode_%%NR%%' notranslate class=\"form-control col-sm-6\" maxlength=\"50\" onchange=\"ITSInstance.OrganisationEditorController.changeCostsOverrideLine(this,'%%INVOICECODE%%');\"></input></span></td>" +
            "   <td><span><input id='ITSOrganisationEditor_Costs_%%NR%%' notranslate class=\"form-control col-sm-6\" type=\"number\" maxlength=\"10\" onchange=\"ITSInstance.OrganisationEditorController.changeCostsOverrideLineCosts(this,'%%INVOICECODE%%');\"></input></span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn btn-warning\"" +
            "    onclick=\'ITSInstance.OrganisationEditorController.removeLineFromCostsOverride(\"%%INVOICECODE%%\");\'>" +
            "    <i class=\"fa fa-1x fa-trash\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mInvoiceCode = /%%INVOICECODE%%/g;
        this.mNR = /%%NR%%/g;
        this.mCosts = /%%COSTS%%/g;
    };

    ITSOrganisationEditor.prototype.init=function () {
    };

    ITSOrganisationEditor.prototype.hide= function () {
        $('#OrganisationInterfaceSessionEdit').hide();
    };

    ITSOrganisationEditor.prototype.show=function () {
        if (getUrlParameterValue('OrganisationID')) {
            this.OrganisationID = getUrlParameterValue('OrganisationID');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#OrganisationInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            // generate the select dropdowns
            $('#OrganisationEditorInterfaceCompanyCountry').empty();
            $('#OrganisationEditorInterfaceCompanyCountry').append(generateCountrySelectList('',true) );
            $('#OrganisationEditorInterfaceInvoiceCurrency').empty();
            $('#OrganisationEditorInterfaceInvoiceCurrency').append(generateCurrencySelectList('',true) );

            if ((this.currentOrganisation.ID != this.OrganisationID) && (!this.currentOrganisation.detailsLoaded)) {
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                this.currentOrganisation = new ITSCompany(ITSInstance);
                this.currentOrganisation.ID = this.OrganisationID;
                this.currentOrganisation.loadDetails(this.currentOrganisationLoaded.bind(this), this.currentOrganisationLoadedError.bind(this));
            } else {
                this.showCurrentOrganisation();
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSOrganisationEditor.prototype.loadCurrentOrganisation = function () {
        this.currentOrganisation.ID = this.OrganisationID;
        this.currentOrganisation.loadDetails(this.showCurrentOrganisation.bind(this),this.listLoadedError.bind(this));
    };
    ITSOrganisationEditor.prototype.listLoadedError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('OrganisationEditorController.NotFound', 'This Organisation cannot be found.');
        window.history.back();
    };
    ITSOrganisationEditor.prototype.showCurrentOrganisation = function() {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentOrganisation) {
            // now show the Organisations info by binding it to the form
            DataBinderTo('OrganisationInterfaceSessionEdit', ITSInstance.OrganisationEditorController.currentOrganisation );
            // and load up the costs per test override table
            this.showTestCostsOverrideTable();
        } else {
            ITSInstance.UIController.showError('OrganisationEditorController.NotFound', 'This Organisation cannot be found.');
            window.history.back();
        }
    };
    ITSOrganisationEditor.prototype.showTestCostsOverrideTable = function () {
        this.generatedTable = this.tablePart1;
        if (typeof this.currentOrganisation.PluginData == "undefined") {
            this.currentOrganisation.PluginData = {};
        }
        if (typeof this.currentOrganisation.PluginData["Invoicing"] == "undefined") {
            this.currentOrganisation.PluginData.Invoicing = {};
        }

        // generate the table first
        var rowCounter=1;
        for(var propt in this.currentOrganisation.PluginData.Invoicing) {
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, rowCounter);
            rowText = rowText.replace( this.mInvoiceCode, propt );
            rowText = rowText.replace( this.mCosts, this.currentOrganisation.PluginData.Invoicing[propt] );
            this.generatedTable += rowText;
            rowCounter++;
        }
        $('#OrganisationEditorInterfaceTestCostsOverride').empty();
        $('#OrganisationEditorInterfaceTestCostsOverride').append(this.generatedTable + this.tablePart3);

        // now set the values
        rowCounter = 1;
        for(var propt in this.currentOrganisation.PluginData.Invoicing) {
            $('#ITSOrganisationEditor_InvoiceCode_' + rowCounter)[0].value = propt;
            $('#ITSOrganisationEditor_Costs_' + rowCounter)[0].value = this.currentOrganisation.PluginData.Invoicing[propt];
            rowCounter++;
        }

        ITSInstance.translator.translateDiv("#OrganisationInterfaceSessionEdit");
    };
    ITSOrganisationEditor.prototype.addNewCostsOverrideLine = function () {
        this.currentOrganisation.PluginData.Invoicing["..."] = 0;
        this.showTestCostsOverrideTable();
    };
    ITSOrganisationEditor.prototype.changeCostsOverrideLine = function (newElem, oldcode) {
        if (oldcode != newElem.value) {
            this.currentOrganisation.PluginData.Invoicing[newElem.value] = this.currentOrganisation.PluginData.Invoicing[oldcode];
            this.removeLineFromCostsOverride(oldcode);
        }
    };
    ITSOrganisationEditor.prototype.changeCostsOverrideLineCosts = function (newElem, oldcode) {
        this.currentOrganisation.PluginData.Invoicing[oldcode] = newElem.value;
    };
    ITSOrganisationEditor.prototype.removeLineFromCostsOverride = function (oldcode) {
        delete this.currentOrganisation.PluginData.Invoicing[oldcode];
        this.showTestCostsOverrideTable();
    };
    ITSOrganisationEditor.prototype.currentOrganisationLoaded = function () {
        if (typeof this.currentOrganisation.PluginData.Preferences == "undefined") {
            this.currentOrganisation.PluginData.Preferences = {};
            this.currentOrganisation.PluginData.Preferences.SkipResearchQuestions = false;
            this.currentOrganisation.PluginData.Preferences.EnablePublicSessions = false;
            if (typeof this.currentOrganisation.PluginData["ForbiddenPaths"] == "undefined") {
                this.currentOrganisation.PluginData.ForbiddenPaths = "";
            }
        }
        this.showCurrentOrganisation();
    };
    ITSOrganisationEditor.prototype.currentOrganisationLoadedError = function () {
        ITSInstance.UIController.showError('OrganisationEditorController.NotFound', 'This Organisation cannot be found.');
        window.history.back();
    };

    ITSOrganisationEditor.prototype.save = function () {
        if (this.currentOrganisation.CompanyName.trim() == "") {
            ITSInstance.UIController.showError('OrganisationEditorController.NoName', 'Please enter a description for this company');
        } else {
            $('#OrganisationEditorEditButtonBar_SaveIcon').addClass("fa-life-ring fa-spin");
            $('#OrganisationEditorEditButtonBar_SaveIcon').removeClass("fa-thumbs-up");
            this.currentOrganisation.saveToServer(this.saveOK.bind(this), this.saveError.bind(this));
        }
    };
    ITSOrganisationEditor.prototype.saveOK = function () {
        $('#OrganisationEditorEditButtonBar_SaveIcon').removeClass( "fa-life-ring fa-spin" );
        $('#OrganisationEditorEditButtonBar_SaveIcon').addClass( "fa-thumbs-up" );
    };
    ITSOrganisationEditor.prototype.saveError = function (thrownError, xhr, ajaxOptions) {
        $('#OrganisationEditorEditButtonBar_SaveIcon').removeClass( "fa-life-ring fa-spin" );
        $('#OrganisationEditorEditButtonBar_SaveIcon').addClass( "fa-thumbs-up" );
        ITSInstance.UIController.showError('OrganisationEditorController.SaveFailed', 'The Organisation could not be saved.', xhr.responseText);
    };

    ITSOrganisationEditor.prototype.deleteCurrentOrganisationWarning = function () {
        ITSInstance.UIController.showDialog("OrganisationEditorController.Delete","Delete Organisation", "Are you sure you want to delete this organisation? All data including logins will be deleted! Any sessions in progress will be left in error.",
            [ {btnCaption : "Yes", btnType : "btn-warning", btnOnClick : "ITSInstance.OrganisationEditorController.deleteCurrentOrganisation();"}, {btnCaption : "No"} ]);
    };
    ITSOrganisationEditor.prototype.deleteCurrentOrganisation = function () {
        this.currentOrganisation.deleteFromServer(function() {},
            function () { ITSInstance.UIController.showError('OrganisationEditorController.DeleteFailed', 'The Organisation could not be deleted.');  } );
        setTimeout(this.goBack.bind(this),1000);
    };
    ITSOrganisationEditor.prototype.goBack = function() {
        window.history.back();
    };

    ITSOrganisationEditor.prototype.grantCredits = function() {
        ITSRedirectPath("GrantCredits&OrganisationID=" + this.currentOrganisation.ID);
    };

    ITSOrganisationEditor.prototype.switchToCompany = function() {
        ITSInstance.token.changeCompany(this.currentOrganisation.ID,
            function () {
                setTimeout( function () { ITSRedirectPath('Switchboard'); window.location.reload(); }, 100);
            },
            function () { ITSInstance.UIController.showError('OrganisationEditorController.SwitchFailed', 'The Organisation could not be switched.');  });
    };

    // register the portlet
    ITSInstance.OrganisationEditorController = new ITSOrganisationEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.OrganisationEditorController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#OrganisationInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE