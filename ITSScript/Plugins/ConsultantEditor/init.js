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
    var EditorDiv = $('<div class="container-fluid" id="ConsultantEditorInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ConsultantEditor/editor.html', function () {
       // things to do after loading the html
    });

    var ITSConsultantEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('372097d0-b9fc-48a1-8ba1-b0164de77af7', 'ConsultantEditor editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit a consultant and the consultants rights and settings');
        this.path = "ConsultantEditor";
    };

    ITSConsultantEditor.prototype.init=function () {
    };

    ITSConsultantEditor.prototype.hide= function () {
        $('#ConsultantEditorInterfaceSessionEdit').hide();
    };

    ITSConsultantEditor.prototype.show=function () {
        if (getUrlParameterValue('ConsultantID')) {
            this.ConsultantID = getUrlParameterValue('ConsultantID');
            if (!this.currentConsultant) this.currentConsultant = ITSInstance.users.createNewUser();
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#ConsultantEditorInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if ((this.currentConsultant.ID != this.ConsultantID) && (!this.currentConsultant.detailsLoaded)) {
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                this.loadCurrentUser(this.currentUserLoaded.bind(this), this.currentUserLoadedError.bind(this));
            } else {
                this.showCurrentConsultant();
            }

        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSConsultantEditor.prototype.loadCurrentUser = function () {
        this.currentConsultant.ID = this.ConsultantID;
        this.currentConsultant.loadDetails(this.showCurrentConsultant.bind(this),this.listLoadedError.bind(this));
    };
    ITSConsultantEditor.prototype.listLoadedError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSConsultantEditor.NotFound', 'This consultant cannot be found.');
        window.history.back();
    };
    ITSConsultantEditor.prototype.showCurrentConsultant = function() {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentConsultant) {
            this.currentUserLoaded();
            // now show the consultants info by binding it to the form
            DataBinderTo('ConsultantEditorInterfaceSessionEdit', ITSInstance.ConsultantEditorController.currentConsultant );
        } else {
            ITSInstance.UIController.showError('ITSConsultantEditor.NotFound', 'This consultant cannot be found.');
            window.history.back();
        }
    };

    ITSConsultantEditor.prototype.currentUserLoaded = function () {
        // hide the roles the user does not have him/herself. You cannot grant roles that you do not have yourself
        // ConsultantEditorInterfaceMasterUserDiv ConsultantEditorInterfaceOrganisationSupervisorDiv ConsultantEditorInterfaceMayOrderCreditsDiv
        // ConsultantEditorInterfaceIsTestAuthorDiv ConsultantEditorInterfaceIsReportAuthorDiv ConsultantEditorInterfaceTestScreenTemplateAuthorDiv ConsultantEditorInterfaceTranslatorDiv
        if (!ITSInstance.users.currentUser.IsMasterUser) {
            $('#ConsultantEditorInterfaceMasterUserDiv').hide();
            $('#ConsultantEditorInterfaceOrganisationSupervisorDiv').hide();
            $('#ConsultantEditorInterfaceMayOrderCreditsDiv').hide();
            $('#ConsultantEditorInterfaceIsTestAuthorDiv').hide();
            $('#ConsultantEditorInterfaceIsReportAuthorDiv').hide();
            $('#ConsultantEditorInterfaceTestScreenTemplateAuthorDiv').hide();
            $('#ConsultantEditorInterfaceTranslatorDiv').hide();
            $('#ConsultantEditorInterfaceMayWorkWithOwnObjectsOnlyDiv').show();
            $('#ConsultantEditorInterfaceMayWorkWithBatteriesOnlyDiv').show();

            if (ITSInstance.users.currentUser.IsOrganisationSupervisor) $('#ConsultantEditorInterfaceOrganisationSupervisorDiv').show();
            if (ITSInstance.users.currentUser.MayOrderCredits) $('#ConsultantEditorInterfaceMayOrderCreditsDiv').show();
            if (ITSInstance.users.currentUser.IsTestAuthor) $('#ConsultantEditorInterfaceIsTestAuthorDiv').show();
            if (ITSInstance.users.currentUser.IsReportAuthor) $('#ConsultantEditorInterfaceIsReportAuthorDiv').show();
            if (ITSInstance.users.currentUser.IsTestScreenTemplateAuthor) $('#ConsultantEditorInterfaceTestScreenTemplateAuthorDiv').show();
            if (ITSInstance.users.currentUser.IsTranslator) $('#ConsultantEditorInterfaceTranslatorDiv').show();
            //if (ITSInstance.users.currentUser.MayWorkWithOwnObjectsOnly) $('#ConsultantEditorInterfaceMayWorkWithOwnObjectsOnlyDiv').show();
            //if (ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) $('#ConsultantEditorInterfaceMayWorkWithBatteriesOnlyDiv').show();
        }
    };
    ITSConsultantEditor.prototype.currentUserLoadedError = function () {
        ITSInstance.UIController.showError('ITSConsultantEditor.NotFound', 'This consultant cannot be found.');
        window.history.back();
    };

    ITSConsultantEditor.prototype.save = function () {
        // validations : user name must be set and unique, at least one right should be set
        this.currentConsultant.Password = ""; // do not overwrite password
        var RightsCount =  this.currentConsultant.IsMasterUser +
            this.currentConsultant.IsOrganisationSupervisor +
            this.currentConsultant.IsTestAuthor +
            this.currentConsultant.IsReportAuthor +
            this.currentConsultant.IsTestScreenTemplateAuthor +
            this.currentConsultant.IsTranslator +
            this.currentConsultant.MayOrderCredits +
            this.currentConsultant.MayWorkWithBatteriesOnly;

        if (this.currentConsultant.Email.trim() == "") {
            ITSInstance.UIController.showError('ITSConsultantEditor.NoEmail', 'Please enter a login id or email adress');
        } else if (RightsCount == 0) {
            ITSInstance.UIController.showError('ITSConsultantEditor.NoRights', 'You need to grant this user at least one right');
        } else {
            $('#ConsultantEditorEditButtonBar_SaveIcon').addClass("fa-life-ring fa-spin");
            $('#ConsultantEditorEditButtonBar_SaveIcon').removeClass("fa-thumbs-up");
            this.currentConsultant.saveToServer(this.saveOK.bind(this), this.saveError.bind(this));
            this.currentConsultant.saveToServerMaster(function(){},function(){});
        }
    };
    ITSConsultantEditor.prototype.saveOK = function () {
        $('#ConsultantEditorEditButtonBar_SaveIcon').removeClass( "fa-life-ring fa-spin" );
        $('#ConsultantEditorEditButtonBar_SaveIcon').addClass( "fa-thumbs-up" );
    };
    ITSConsultantEditor.prototype.saveError = function (thrownError, xhr, ajaxOptions) {
        $('#ConsultantEditorEditButtonBar_SaveIcon').removeClass( "fa-life-ring fa-spin" );
        $('#ConsultantEditorEditButtonBar_SaveIcon').addClass( "fa-thumbs-up" );
        ITSInstance.UIController.showError('ITSConsultantEditor.SaveFailed', 'The consultant could not be saved.', xhr.responseText);
    };
    ITSConsultantEditor.prototype.resetPassword = function () {
        this.currentConsultant.regeneratePassword();
        this.currentConsultant.saveToServer(function () {
            ITSInstance.SessionMailerSessionController.currentConsultant = this.currentConsultant;
            ITSRedirectPath("SessionMailer&Template=defaultPasswordConsultant&ConsultantID=" + this.currentConsultant.ID);
        }.bind(this), function (xhr) {
            ITSInstance.UIController.showError('ITSConsultantEditor.SaveFailed', 'The consultant could not be saved.', xhr.responseText);
        });
    };
    ITSConsultantEditor.prototype.generateAPIKey= function () {
        this.currentConsultant.PluginData.ExternalAPIKey = "" + newGuid() + "-" + newGuid() + "-" + newGuid() + "-" + newGuid();
        $('#ConsultantEditorInterfaceExternalAPIKey').val(this.currentConsultant.PluginData.ExternalAPIKey);
    };
    ITSConsultantEditor.prototype.showSessions = function () {
        ITSRedirectPath("SessionLister&SessionType=0&ConsultantID=" + this.currentConsultant.ID);
    };
    ITSConsultantEditor.prototype.deleteCurrentConsultantWarning = function () {
        ITSInstance.UIController.showDialog("ITSConsultantEditor.Delete","Delete consultant", "Are you sure you want to delete this consultant? Sessions created by this consultant will NOT be deleted.",
            [ {btnCaption : "Yes", btnType : "btn-warning", btnOnClick : "ITSInstance.ConsultantEditorController.deleteCurrentConsultant();"}, {btnCaption : "No"} ]);
    };
    ITSConsultantEditor.prototype.deleteCurrentConsultant = function () {
        this.currentConsultant.deleteFromServer(function() {},
            function () { ITSInstance.UIController.showError('ITSConsultantEditor.DeleteFailed', 'The consultant could not be deleted.');  } );
        setTimeout(this.goBack.bind(this),1000);
    };

    ITSConsultantEditor.prototype.goBack = function() {
        window.history.back();
    };

    // register the portlet
    ITSInstance.ConsultantEditorController = new ITSConsultantEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ConsultantEditorController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ConsultantEditorInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE