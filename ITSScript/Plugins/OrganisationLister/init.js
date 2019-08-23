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
    var EditorDiv = $('<div class="container-fluid" id="OrganisationListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/OrganisationLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSOrganisationListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('f7650f2f-f510-4461-b194-af6bb77dc835', 'OrganisationLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List organisations in the current system (server/database level)');
        this.path = "OrganisationLister";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='8' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.OrganisationListerController.search();\"" +
            " id=\"OrganisationListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.OrganisationListerController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSOrganisationListerEditor_DescriptionName\" scope=\"col\">Organisation name</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSOrganisationListerEditor_DescriptionCountry\" scope=\"col\">Country</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSOrganisationListerEditor_DescriptionContactPerson\" scope=\"col\">Contact person</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSOrganisationListerEditor_DescriptionContactMail\" scope=\"col\">Contact e-mail</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSOrganisationListerEditor_DescriptionContactPhone\" scope=\"col\">Contact phone</th>" +
            "   <th class='d-none d-sm-table-cell' id=\"ITSOrganisationListerEditor_DescriptionLicenseEndDate\" scope=\"col\">License end date</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%COMPANYNAME%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%COMPANYCOUNTRY%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%CONTACTPERSON%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%CONTACTEMAIL%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%CONTACTPHONE%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");'>%%LICENSEENDDATE%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.OrganisationListerController.viewOrganisation(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mID = /%%ID%%/g;
        this.mNR = /%%NR%%/g;
        this.mCompanyName = /%%COMPANYNAME%%/g;
        this.mCompanyCountry = /%%COMPANYCOUNTRY%%/g;
        this.mContactPerson = /%%CONTACTPERSON%%/g;
        this.mContactEMail = /%%CONTACTEMAIL%%/g;
        this.mContactPhone = /%%CONTACTPHONE%%/g;
        this.mLicenseEndData = /%%LICENSEENDDATE%%/g;
        
    };

    ITSOrganisationListerEditor.prototype.init=function () {
    };

    ITSOrganisationListerEditor.prototype.hide= function () {
        $('#OrganisationListerInterfaceSessionEdit').hide();
    };

    ITSOrganisationListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#OrganisationListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "CompanyName";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#OrganisationListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };

    ITSOrganisationListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#OrganisationListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSOrganisationListerEditor.prototype.fireRequest = function () {
        this.organisationsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.JSONAjaxLoader('companies' , this.organisationsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSObject', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSOrganisationListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.organisationsList.length; i++) {
            var rowText = this.tablePart2;

            this.organisationsList[i].LicenseStartDate = convertISOtoITRDate(this.organisationsList[i].LicenseStartDate);
            this.organisationsList[i].LicenseEndDate = convertISOtoITRDate(this.organisationsList[i].LicenseEndDate);

            rowText = rowText.replace( this.mNR, i + this.currentPage *25 +1 );
            rowText = rowText.replace( this.mID, this.organisationsList[i].ID );
            rowText = rowText.replace( this.mContactPerson, this.organisationsList[i].ContactPerson);
            rowText = rowText.replace( this.mContactEMail, this.organisationsList[i].ContactEMail);
            rowText = rowText.replace( this.mContactPhone, this.organisationsList[i].ContactPhone);
            rowText = rowText.replace( this.mLicenseEndData, this.organisationsList[i].LicenseEndDate);
            rowText = rowText.replace( this.mCompanyName, this.organisationsList[i].CompanyName);
            rowText = rowText.replace( this.mCompanyCountry, this.organisationsList[i].CompanyCountry);

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#OrganisationListerTableFindMoreButton').hide();
        if (this.organisationsList.length >= 25) { $('#OrganisationListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#OrganisationListerTable').empty();
        $('#OrganisationListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#OrganisationListerInterfaceSessionEdit");

        $('#OrganisationListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#OrganisationListerTableSearchText').focus();

        if (this.currentPage > 0) {
            $('html, body').animate({scrollTop: $('html, body').get(0).scrollHeight }, 2000);
        }
    };

    ITSOrganisationListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSOrganisationLister.LoadListFailed", "The Organisation list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSOrganisationListerEditor.prototype.search = function () {
        this.searchField = $('#OrganisationListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSOrganisationListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSOrganisationListerEditor.prototype.viewOrganisation = function (OrganisationID) {
        this.alreadyLoaded = document.URL;
        ITSRedirectPath("OrganisationEditor&OrganisationID=" + OrganisationID);
    };

    ITSOrganisationListerEditor.prototype.addNew = function () {
        var tempOrganisation = ITSInstance.companies.createNewCompany();
        ITSInstance.OrganisationEditorController.currentOrganisation = tempOrganisation;
        ITSRedirectPath("OrganisationEditor&OrganisationID=" + tempOrganisation.ID);
    };
    

    // register the portlet
    ITSInstance.OrganisationListerController = new ITSOrganisationListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.OrganisationListerController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#OrganisationListerInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.UIController.registerEditor(ITSInstance.OrganisationListerController);

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsMasterUser) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#OrganisationListerController.OrganisationsMenu",  ITSInstance.translator.translate("#OrganisationListerController.OrganisationsMenu", "Manage organisations"), "fa-cubes", "ITSRedirectPath(\'OrganisationLister\');");
        }
    }, true);

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("Company.Delete", function () { ITSInstance.OrganisationListerController.alreadyLoaded = false; ITSInstance.OrganisationListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("Company.Create", function () { ITSInstance.OrganisationListerController.alreadyLoaded = false; ITSInstance.OrganisationListerController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("Company.Update", function () { ITSInstance.OrganisationListerController.alreadyLoaded = false; ITSInstance.OrganisationListerController.currentPage =0; } );

})()// IIFE