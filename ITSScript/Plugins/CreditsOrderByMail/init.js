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
//# sourceURL=CreditsOrderByMail/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="CreditsOrderByMailInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CreditsOrderByMail/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCreditsOrderByMailEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ac0ded49-b272-4d76-af2e-ea6cda9fa5c1', 'CreditsOrderByMail editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Order new credit units by sending an email.');
        this.path = "CreditsOrderByMail";
    };

    ITSCreditsOrderByMailEditor.prototype.init=function () {
    };

    ITSCreditsOrderByMailEditor.prototype.hide= function () {
        $('#CreditsOrderByMailInterfaceSessionEdit').hide();
    };

    ITSCreditsOrderByMailEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#CreditsOrderByMailInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        // get the setting to send this mail to from the server
        if (ITSInstance.users.currentUser.PluginData.MailSettings) {
            $('#CreditsOrderByMailMailCc').val(ITSInstance.users.currentUser.PluginData.MailSettings['CCForInvoice'] ? ITSInstance.users.currentUser.PluginData.MailSettings['CCForInvoice'] : "");
        }
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.emailPar = "";
        ITSInstance.JSONAjaxLoader('systemsettings/CreditOrderEMail', this.emailPar, this.ParLoaded.bind(this), this.ParLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");
    };

    ITSCreditsOrderByMailEditor.prototype.ParLoaded = function (value) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        this.emailPar = value;
        if (this.emailPar == "") {
            ITSInstance.UIController.showError("ITSCreditsOrderByMailEditor.NoMailAddress", "The CreditOrderEMail parameter could not be loaded at this moment.", '',
                'window.history.back();');
        } else {
            $('#CreditsOrderByMailMailTo').val(this.emailPar);
        }
        this.changeAmount();
    };

    ITSCreditsOrderByMailEditor.prototype.ParLoadedError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSCreditsOrderByMailEditor.NoMailAddress", "The CreditOrderEMail parameter could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSCreditsOrderByMailEditor.prototype.sendMail = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        // store the defaults in the users data and save the user
        if (ITSInstance.users.currentUser.PluginData.MailSettings['CCForInvoice'] != $('#CreditsOrderByMailMailCc').val()) {
            ITSInstance.users.currentUser.PluginData.MailSettings['CCForInvoice'] = $('#CreditsOrderByMailMailCc').val();
            ITSInstance.users.saveCurrentUser();
        }

        // send the mail
        var newMail = new ITSMail();
        newMail.To = this.emailPar;
        newMail.CC = $('#CreditsOrderByMailMailCc').val();
        var mailSubject = ITSInstance.translator.getTranslatedString( 'ITSCreditsOrderByMailEditor', 'CreditMailSubject', "Order for {0}.000 credit units");
        newMail.Subject = format( mailSubject ,[$('#CreditsOrderByMailAmount').val()]);
        newMail.Body = tinyMCE.get("CreditsOrderByMailMailBody").getContent().toString();

        var mailBody = ITSInstance.translator.getTranslatedString( 'ITSCreditsOrderByMailEditor', 'CreditMailBody', "Order for {0}.000 credit units, ordered by {1} for organisation {2} with id {3}.");
        newMail.Body = newMail.Body + "\n " +
            format(mailBody, [$('#CreditsOrderByMailAmount').val(), ITSInstance.users.currentUser.Email, ITSInstance.companies.currentCompany.CompanyName,ITSInstance.companies.currentCompany.ID] );
        newMail.sendMail(this.mailOK.bind(this), this.mailFailed.bind(this));
    };

    ITSCreditsOrderByMailEditor.prototype.mailOK = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showInfo('ITSCreditsOrderByMailEditor.MailOK', 'The e-mail has been sent.', "", "window.history.back();");
    };

    ITSCreditsOrderByMailEditor.prototype.mailFailed = function (thrownError, xhr, ajaxOptions) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showWarning('ITSCreditsOrderByMailEditor.MailFailed', 'Sending the e-mail failed.', xhr.responseText, "");
    };

    ITSCreditsOrderByMailEditor.prototype.changeAmount = function () {
        if (typeof ITSInstance.companies.currentCompany.PluginData.PricePerCreditUnit != "unknown") {
            if (Number(ITSInstance.companies.currentCompany.PluginData.PricePerCreditUnit) > 0) {
                $('#CreditsOrderByMailAmountCostsLabel').show();
                $('#CreditsOrderByMailAmountCosts').show();
                $('#CreditsOrderByMailAmountCosts').text( precise_round((Number(ITSInstance.companies.currentCompany.PricePerCreditUnit) * 1000 * Number($('#CreditsOrderByMailAmount').val())), 2) + " " + ITSInstance.companies.currentCompany.InvoiceCurrency);
            }
        }
    };

    // register the portlet
    ITSInstance.CreditsOrderByMailController = new ITSCreditsOrderByMailEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CreditsOrderByMailController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CreditsOrderByMailInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.MayOrderCredits) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#CreditsOrderByMail.ListMenu", ITSInstance.translator.translate("#CreditsOrderByMail.ListMenu", "Order credits by e-mail"), "fa-calculator", "ITSRedirectPath(\'CreditsOrderByMail\');");
        }
    }, true);
})()// IIFE