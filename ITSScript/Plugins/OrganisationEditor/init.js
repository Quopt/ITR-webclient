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
    var EditorDiv = $('<div class="container-fluid" id="OrganisationInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/OrganisationEditor/editor.html', function () {
       // things to do after loading the html
    });

    var ITSOrganisationEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('24f1643d-1239-4d24-94c1-d61306d3fcad', 'Organisation editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit organisations on the database level');
        this.path = "OrganisationEditor";
        this.currentOrganisation = new ITSCompany(ITSInstance);
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
        } else {
            ITSInstance.UIController.showError('OrganisationEditorController.NotFound', 'This Organisation cannot be found.');
            window.history.back();
        }
    };

    ITSOrganisationEditor.prototype.currentOrganisationLoaded = function () {
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