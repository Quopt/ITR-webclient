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
    var EditorDiv = $('<div class="container-fluid" id="ServerSettingsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ServerSettings/editor.html', function () {
       // things to do after loading the html
    });

    var ITSServerSettingsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('05daf71f-a8c2-4af9-938d-b3316a7baf3d', 'ServerSettings editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit server settings');
        this.path = "ServerSettings";
    };

    ITSServerSettingsEditor.prototype.init=function () {
    };

    ITSServerSettingsEditor.prototype.hide= function () {
        $('#ServerSettingsInterfaceSessionEdit').hide();
    };

    ITSServerSettingsEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ServerSettingsInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        this.emailPar = "";
        this.maxNumberOfConsultants = "";
        this.SMTP_Sender = "";
        this.SMTP_Server = "";
        this.SMTP_Port = "";
        this.SMTP_UseTLS = "";
        this.SMTP_User = "";
        this.SMTP_Password = "";
        this.Translate_Azure_Key = "";
        this.CopyrightMessage = "";
        this.CompanyName = "";
        this.LOG_HANDLER_BACKUP_COUNT = "";

        ITSInstance.UIController.showInterfaceAsWaitingOn();

        ITSInstance.JSONAjaxLoader('systemsettings/CreditOrderEMail', this.emailPar, this.mailParLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/MAXNUMBEROFCONSULTANTS', this.maxNumberOfConsultants, this.maxConsultantsLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_SENDER', this.SMTP_Sender,  this.SMTPSenderLoaded.bind(this),this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_SERVER', this.SMTP_Server,  this.SMTPServerLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_PORT', this.SMTP_Port,  this.SMTPPortLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_USETLS', this.SMTP_UseTLS,  this.UseTLSLoaded.bind(this),this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_USER', this.SMTP_User,  this.SMTPUserLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/SMTP_PASSWORD', this.SMTP_Password,  this.SMTPPasswordLoaded.bind(this), this.ParsLoadedError.bind(this),ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/TRANSLATE_AZURE_KEY', this.Translate_Azure_Key, this.AzureKeyLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/COPYRIGHT', this.CopyrightMessage, this.CopyrightLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/COMPANYNAME', this.CompanyName, this.CompanyNameLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
        ITSInstance.JSONAjaxLoader('systemsettings/LOG_HANDLER_BACKUP_COUNT', this.LOG_HANDLER_BACKUP_COUNT, this.LogHandlerBackupCountLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");


        $('#ServerSettingsDiv').children().prop('disabled',true);
        if (ITSInstance.users.currentUser.IsMasterUser) {
            $('#ServerSettingsDiv').children().prop('disabled',false);
        }
    };

    ITSServerSettingsEditor.prototype.mailParLoaded = function (newValue) {
        this.emailPar = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.maxConsultantsLoaded = function (newValue) {
        this.maxNumberOfConsultants = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.SMTPSenderLoaded = function (newValue) {
        this.SMTP_Sender = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.SMTPServerLoaded = function (newValue) {
        this.SMTP_Server = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.SMTPPortLoaded = function (newValue) {
        this.SMTP_Port = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.UseTLSLoaded = function (newValue) {
        this.SMTP_UseTLS = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.SMTPUserLoaded = function (newValue) {
        this.SMTP_User = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.SMTPPasswordLoaded = function (newValue) {
        this.SMTP_Password = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.AzureKeyLoaded = function (newValue) {
        this.Translate_Azure_Key = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.CopyrightLoaded = function (newValue) {
        this.CopyrightMessage = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.CompanyNameLoaded = function (newValue) {
        this.CompanyName = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.LogHandlerBackupCountLoaded = function (newValue) {
        this.LOG_HANDLER_BACKUP_COUNT = newValue;
        this.ParsLoaded();
    };

    ITSServerSettingsEditor.prototype.ParsLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        $('#ServerSettingsOrderByMailAddress').val(this.emailPar);

        $('#ServerSettingsDiv-SMTPSender-val').val(this.SMTP_Sender);
        $('#ServerSettingsDiv-SMTPServer-val').val(this.SMTP_Server);
        $('#ServerSettingsDiv-SMTPPort-val').val(this.SMTP_Port);
        $('#ServerSettingsDiv-SMTPUseTLS-val').val(this.SMTP_UseTLS);
        $('#ServerSettingsDiv-SMTPUser-val').val(this.SMTP_User);
        $('#ServerSettingsDiv-SMTPPassword-val').val(this.SMTP_Password);

        $('#ServerSettingsDiv-TranslateKey-val').val(this.Translate_Azure_Key);

        $('#ServerSettingsDiv-LegalCopyright-val').val(this.CopyrightMessage);
        $('#ServerSettingsDiv-CompanyName-val').val(this.CompanyName);

        $('#ServerSettingsDiv-MaxNumberOfConsulants-val').val(this.maxNumberOfConsultants);

        $('#ServerSettingsDiv-Logging-val').val(this.LOG_HANDLER_BACKUP_COUNT);
    };

    ITSServerSettingsEditor.prototype.ParsLoadedError = function (xhr) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (xhr.status != 404) {
            ITSInstance.UIController.showError("ITSServerSettingsEditor.ParsLoadError", "The server settings could not be loaded at this moment.", '',
                'window.history.back();');
        }
    };

    ITSServerSettingsEditor.prototype.changeCreditOrderEMailParameter = function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/CreditOrderEMail', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeMaxNumberOfConsulantsParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/MAXNUMBEROFCONSULTANTS', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeTranslateKeyParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/TRANSLATE_AZURE_KEY', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPPasswordParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_PASSWORD', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPUserParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_USER', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPUseTLSParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_USETLS', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPPortParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_PORT', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPServerParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_SERVER', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeSMTPSenderParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/SMTP_SENDER', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.changeCopyrightParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/COPYRIGHT', newVal, function () {}, function () {}, "Y","N");
        setTimeout(1000,getCopyrightMessage);
    };

    ITSServerSettingsEditor.prototype.changeCompanyNameParameter= function (newVal) {
        ITSInstance.genericAjaxUpdate('systemsettings/COMPANYNAME', newVal, function () {}, function () {}, "Y","N");
        setTimeout(1000,getCopyrightMessage);
    };

    ITSServerSettingsEditor.prototype.changeHistoricLogFilesParameter = function (newVal){
        ITSInstance.genericAjaxUpdate('systemsettings/LOG_HANDLER_BACKUP_COUNT', newVal, function () {}, function () {}, "Y","N");
    };

    ITSServerSettingsEditor.prototype.restartServer = function () {
        ITSInstance.genericAjaxUpdate('installpublics/itr-stop', "{}", function (){}, function (){});
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        setTimeout( function () { location.reload(true); }, 30000);
    };

    // register the portlet
    ITSInstance.ServerSettingsController = new ITSServerSettingsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ServerSettingsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ServerSettingsInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsMasterUser) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#ServerSettingsController.Menu", ITSInstance.translator.translate("#ServerSettingsController.Menu", "Server settings"), "fa-wrench", "ITSRedirectPath(\'ServerSettings\');");
        }
    }, true);
})()// IIFE