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
    var EditorDiv = $('<div class="container-fluid" id="CustomerSettingsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CustomerSettings/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCustomerSettingsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('1df0ecd9-125f-4bdd-a441-b70623993ea9', 'CustomerSettings editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit customer settings');
        this.path = "CustomerSettings";
    };

    ITSCustomerSettingsEditor.prototype.init=function () {
    };

    ITSCustomerSettingsEditor.prototype.hide= function () {
        $('#CustomerSettingsInterfaceSessionEdit').hide();
    };

    ITSCustomerSettingsEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#CustomerSettingsInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        this.maxNumberOfConsultants = "";
        this.SMTP_Sender = "";
        this.SMTP_Server = "";
        this.SMTP_Port = "";
        this.SMTP_UseTLS = "";
        this.SMTP_User = "";
        this.SMTP_Password = "";
        this.companyLogo = "";
        this.companyCopyright = "";

        ITSInstance.UIController.showInterfaceAsWaitingOn();

        ITSInstance.JSONAjaxLoader('systemsettings/MAXNUMBEROFCONSULTANTS', this.maxNumberOfConsultants, this.maxConsultantsLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/COMPANYLOGO', this.companyLogo, this.companyLogoLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/COPYRIGHT', this.companyCopyright, this.companyCopyrightLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_SENDER', this.SMTP_Sender,  this.SMTPSenderLoaded.bind(this),this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_SERVER', this.SMTP_Server,  this.SMTPServerLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_PORT', this.SMTP_Port,  this.SMTPPortLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_USETLS', this.SMTP_UseTLS,  this.UseTLSLoaded.bind(this),this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_USER', this.SMTP_User,  this.SMTPUserLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "N", "Y");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_PASSWORD', this.SMTP_Password,  this.SMTPPasswordLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "N", "Y");

        $('#CustomerSettingsDiv').children().prop('disabled',true);
        if (ITSInstance.users.currentUser.IsMasterUser) {
            $('#CustomerSettingsDiv').children().prop('disabled',false);
        }
    };

    ITSCustomerSettingsEditor.prototype.companyLogoLoaded = function (newValue) {
        this.companyLogo = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.companyCopyrightLoaded = function (newValue) {
        this.Copyright = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.maxConsultantsLoaded = function (newValue) {
        this.maxNumberOfConsultants = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.SMTPSenderLoaded = function (newValue) {
        this.SMTP_Sender = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.SMTPServerLoaded = function (newValue) {
        this.SMTP_Server = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.SMTPPortLoaded = function (newValue) {
        this.SMTP_Port = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.UseTLSLoaded = function (newValue) {
        this.SMTP_UseTLS = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.SMTPUserLoaded = function (newValue) {
        this.SMTP_User = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.SMTPPasswordLoaded = function (newValue) {
        this.SMTP_Password = newValue;
        this.ParsLoaded();
    };

    ITSCustomerSettingsEditor.prototype.ParsLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        $('#CustomerSettingsOrderByMailAddress').val(this.emailPar);

        $('#CustomerSettingsDiv-SMTPSender-val').val(this.SMTP_Sender);
        $('#CustomerSettingsDiv-SMTPServer-val').val(this.SMTP_Server);
        $('#CustomerSettingsDiv-SMTPPort-val').val(this.SMTP_Port);
        $('#CustomerSettingsDiv-SMTPUseTLS-val').val(this.SMTP_UseTLS);
        $('#CustomerSettingsDiv-SMTPUser-val').val(this.SMTP_User);
        $('#CustomerSettingsDiv-SMTPPassword-val').val(this.SMTP_Password);

        $('#CustomerSettingsDiv-TranslateKey-val').val(this.Translate_Azure_Key);

        $('#CustomerSettingsDiv-MaxNumberOfConsulants-val').val(this.maxNumberOfConsultants);

        $('#CustomerSettingsDiv-CompanyLogo-val').val(this.companyLogo);
        $('#CustomerSettingsDiv-CompanyCopyright-val').val(this.companyCopyright);

    };

    ITSCustomerSettingsEditor.prototype.ParsLoadedError = function (xhr) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (xhr.status != 404) {
            ITSInstance.UIController.showError("ITSCustomerSettingsEditor.ParsLoadError", "The server settings could not be loaded at this moment.", '',
                'window.history.back();');
        }
    };

    ITSCustomerSettingsEditor.prototype.changeCreditOrderEMailParameter = function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/CreditOrderEMail', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeMaxNumberOfConsulantsParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/MAXNUMBEROFCONSULTANTS', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeCompanyLogoParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/COMPANYLOGO', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeCompanyCopyrightParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/COPYRIGHT', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeTranslateKeyParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/TRANSLATE_AZURE_KEY', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeSMTPPasswordParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_PASSWORD', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeSMTPUserParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_USER', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeSMTPUseTLSParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_USETLS', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeSMTPPortParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_PORT', newVal, function () {}, function () {}, "N", "Y");
    };
g
    ITSCustomerSettingsEditor.prototype.changeSMTPServerParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_SERVER', newVal, function () {}, function () {}, "N", "Y");
    };

    ITSCustomerSettingsEditor.prototype.changeSMTPSenderParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_SENDER', newVal, function () {}, function () {}, "N", "Y");
    };

    // register the portlet
    ITSInstance.CustomerSettingsController = new ITSCustomerSettingsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CustomerSettingsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CustomerSettingsInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if ( (ITSInstance.users.currentUser.IsMasterUser) || (ITSInstance.users.currentUser.IsOrganisationSupervisor)) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#CustomerSettingsController.Menu", ITSInstance.translator.translate("#CustomerSettingsController.Menu", "Customer settings"), "fa-building", "ITSRedirectPath(\'CustomerSettings\');");
        }
    });
})()// IIFE