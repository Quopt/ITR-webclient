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
    var EditorDiv = $('<div class="container-fluid" id="GrantCreditsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/GrantCredits/editor.html', function () {
       // things to do after loading the html
    });

    var ITSGrantCreditsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('4864b110-2dda-4e73-9feb-78fb42aab895', 'GrantCredits editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'With this plugin you can grant credits to an organisation.');
        this.path = "GrantCredits";
        this.currentGrant = new ITSCreditGrant(ITSInstance);
        this.currentOrganisation = new ITSCompany(ITSInstance);
        this.creditGrants = new ITSCreditGrants(this); // the list of credit grants


        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSGrantCreditsEditor_DescriptionLogin\" scope=\"col\">Credits granted</th>" +
            "   <th id=\"ITSGrantCreditsEditor_DescriptionBy\" scope=\"col\">Granted by</th>" +
            "   <th id=\"ITSGrantCreditsEditor_DescriptionWhen\" scope=\"col\">Date/Time</th>" +
            "   <th id=\"ITSGrantCreditsEditor_DescriptionRemarks\" scope=\"col\">Remarks</th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%CREDITS%%</span></td>" +
            "   <td><span notranslate>%%GRANTEDBY%%</span></td>" +
            "   <td><span notranslate>%%GRANTDATE%%</span></td>" +
            "   <td><span notranslate>%%REMARKS%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mNR = /%%NR%%/g;
        this.mCredits = /%%CREDITS%%/g;
        this.mGrantedBy = /%%GRANTEDBY%%/g;
        this.mGrantDate = /%%GRANTDATE%%/g;
        this.mRemarks = /%%REMARKS%%/g;
    };

    ITSGrantCreditsEditor.prototype.init=function () {
    };

    ITSGrantCreditsEditor.prototype.hide= function () {
        $('#GrantCreditsInterfaceSessionEdit').hide();
    };

    ITSGrantCreditsEditor.prototype.show=function () {
        if (getUrlParameterValue('OrganisationID')) {
            this.organisationID = getUrlParameterValue('OrganisationID');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#GrantCreditsInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            this.currentGrant = new ITSCreditGrant(ITSInstance);
            this.creditGrants = new ITSCreditGrants(this);
            
            if ((this.currentOrganisation.ID != this.OrganisationID) && (!this.currentOrganisation.detailsLoaded)) {
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                this.currentOrganisation = new ITSCompany(ITSInstance);
                this.currentOrganisation.ID = this.organisationID;
                this.currentOrganisation.loadDetails(this.showCurrentOrganisation.bind(this), this.listLoadedError.bind(this));
                
                this.creditGrants.loadCreditGrants(this.organisationID, this.loadCreditsList.bind(this), function () {});
            } else {
                this.showCurrentOrganisation();
            }            
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSGrantCreditsEditor.prototype.listLoadedError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSGrantCreditsEditor.NotFound', 'This organisation cannot be found.');
        window.history.back();
    };
    ITSGrantCreditsEditor.prototype.showCurrentOrganisation = function() {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentOrganisation) {
            // now show the Organisations info by binding it to the form
            // DataBinderTo('GrantCreditsInterfaceSessionEdit', ITSInstance.OrganisationEditorController.currentOrganisation );
            $('#GrantCreditsInterfaceEditHeaderCompany').text(this.currentOrganisation.CompanyName);
            DataBinderTo('GrantCreditsInterfaceSessionEdit', ITSInstance.GrantCreditsController.currentGrant );
        } else {
            ITSInstance.UIController.showError('ITSGrantCreditsEditor.NotFound', 'This organisation cannot be found.');
            window.history.back();
        }
    };

    ITSGrantCreditsEditor.prototype.loadCreditsList= function () {
        // generate table header
        this.generatedTable = this.tablePart1;

        // generate the records for the returned data
        for (var i=0; i < this.creditGrants.creditGrantsList.length; i++) {
            var rowText = this.tablePart2;

            this.creditGrants.creditGrantsList[i].GrantedWhen = convertISOtoITRDate(this.creditGrants.creditGrantsList[i].GrantedWhen);

            rowText = rowText.replace( this.mNR, i + 1 );
            rowText = rowText.replace( this.mCredits,  this.creditGrants.creditGrantsList[i].CreditsGranted );
            rowText = rowText.replace( this.mGrantedBy,  this.creditGrants.creditGrantsList[i].UserDescription );
            rowText = rowText.replace( this.mGrantDate,  this.creditGrants.creditGrantsList[i].GrantedWhen );
            rowText = rowText.replace( this.mRemarks,  this.creditGrants.creditGrantsList[i].Remarks);

            this.generatedTable += rowText;
        }

        // replace the div contents with the generated table
        $('#GrantCreditsInterfaceListerTable').empty();
        $('#GrantCreditsInterfaceListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#GrantCreditsInterfaceSessionEdit");
    };
    
    ITSGrantCreditsEditor.prototype.grantNow = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.currentGrant.CompanyID = this.currentOrganisation.ID;
        this.currentGrant.UserID = ITSInstance.users.currentUser.ID;
        this.currentGrant.GrantedWhen = new Date();
        this.currentGrant.UserDescription = ITSInstance.users.currentUser.Email;
        this.currentGrant.saveToServer(this.grantOK.bind(this), this.grantError.bind(this));
    };
    ITSGrantCreditsEditor.prototype.grantOK = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showInfo('ITSGrantCreditsEditor.SaveOK', 'The credits have been granted.', "", "window.history.back();");
    };
    ITSGrantCreditsEditor.prototype.grantError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSGrantCreditsEditor.SaveFailed', 'The credit grant could not be saved. ');
    };

    // register the portlet
    ITSInstance.GrantCreditsController = new ITSGrantCreditsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.GrantCreditsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#GrantCreditsInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE