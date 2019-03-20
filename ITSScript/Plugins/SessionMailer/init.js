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

(function () { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    EditorDiv = $('<div class="container-fluid" id="SessionMailerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);
    $('#SessionMailerInterfaceTemplateSelection').hide();

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionMailer/editor.html', function () {
        // things to do after loading the html
        ITSInstance.translator.translateDiv("#SessionMailerInterfaceSessionEdit");
    });

    var ITSSessionMailerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('1ff33d7b-174c-4beb-820b-f2336a8384a0', 'SessionMailer editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Send mails from the ITR using a template');
        this.path = "SessionMailer";
        this.currentSession = new ITSCandidateSession(this, ITSInstance);
    };

    ITSSessionMailerEditor.prototype.init = function () {
    };

    ITSSessionMailerEditor.prototype.editSession = function (Id) {
        console.log("Edit test session requested " + Id);
    };

    ITSSessionMailerEditor.prototype.hide = function () {
        $('#SessionMailerInterfaceSessionEdit').hide();
    };

    ITSSessionMailerEditor.prototype.show = function () {
        if ((getUrlParameterValue('SessionID')) || (getUrlParameterValue('PersonID')) || (getUrlParameterValue('ConsultantID')) ) {
            if (getUrlParameterValue('SessionID')) this.SessionID = getUrlParameterValue('SessionID');
            if (getUrlParameterValue('PersonID')) this.PersonID = getUrlParameterValue('PersonID');
            if (getUrlParameterValue('Template')) this.Template = (getUrlParameterValue('Template'));
            if (getUrlParameterValue('ConsultantID')) this.ConsultantID = (getUrlParameterValue('ConsultantID'));

            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#SessionMailerInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            // load the system and personal e-mail templates
            this.systemMailTemplates = {};
            this.organisationMailTemplates = {};
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            this.mailTemplatesOrganisationLoaded = false;
            this.mailTemplatesServerLoaded = false;
            ITSInstance.JSONAjaxLoader('systemsettings/MailTemplates', this.organisationMailTemplates, this.mailTemplatesLoadedOrganisation.bind(this), this.mailTemplatesLoadedOrganisationError.bind(this), ITSObject);
            ITSInstance.JSONAjaxLoader('systemsettings/MailTemplates', this.systemMailTemplates, this.mailTemplatesLoadedServer.bind(this), this.mailTemplatesLoadedServerError.bind(this), ITSObject, 0, -1, "","","Y","N");
            this.personalMailTemplates = {};
            if (ITSInstance.users.currentUser.PluginData.MailTemplates) {
                this.personalMailTemplates = ITSInstance.users.currentUser.PluginData.MailTemplates;
            }

            // load the defaults for this user from the users data, if not there use defaults
            if (ITSInstance.users.currentUser.PluginData.MailSettings) {
                $('#SessionMailerInterfaceSessionEditMailCopyMe').prop('checked', ITSInstance.users.currentUser.PluginData.MailSettings.CopyMe);
                $('#SessionMailerInterfaceSessionEditMailCcLabel').val(ITSInstance.users.currentUser.PluginData.MailSettings.CC ? ITSInstance.users.currentUser.PluginData.MailSettings.CC : "");
                $('#SessionMailerInterfaceSessionEditMailFrom').val(ITSInstance.users.currentUser.PluginData.MailSettings.From ? ITSInstance.users.currentUser.PluginData.MailSettings.From : "");
            }

            if ((getUrlParameterValue('SessionID'))) {
                if ( (!this.currentSession) || (this.currentSession.ID != this.SessionID)) {
                    this.currentSession.loadSession(this.SessionID, this.sessionLoadingSucceeded.bind(this), this.sessionLoadingFailed.bind(this));
                } else {
                    this.sessionLoadingSucceeded();
                }
            } else if ((getUrlParameterValue('PersonID'))) {
                if ( (!this.currentPerson) || (this.currentPerson.ID != this.PersonID)) {
                    this.personRequiresSaving = true;
                    ITSInstance.candidates.loadCurrentCandidate(this.PersonID, this.personLoadingSucceeded.bind(this), this.personLoadingFailed.bind(this));
                } else {
                    this.personRequiresSaving = false;
                    this.personLoadingSucceeded();
                }
            } else if ((getUrlParameterValue('ConsultantID'))) {
                if ( (!this.currentConsultant) || (this.currentConsultant.ID != this.ConsultantID)) {
                    this.consultantRequiresSaving = true;
                    this.currentConsultant = ITSInstance.users.createNewUser();
                    this.currentConsultant.ID = this.ConsultantID;
                    this.currentConsultant.loadDetails(this.consultantLoadingSucceeded.bind(this), this.consultantLoadingFailed.bind(this));
                } else {
                    this.consultantRequiresSaving = false;
                    this.consultantLoadingSucceeded();
                }
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSSessionMailerEditor.prototype.mailTemplatesLoadedOrganisation = function () {
        this.mailTemplatesOrganisationLoaded = true;
        if (this.mailTemplatesServerLoaded)  this.mailTemplatesLoaded();
    };
    ITSSessionMailerEditor.prototype.mailTemplatesLoadedServer = function () {
        this.mailTemplatesServerLoaded = true;
        if (this.mailTemplatesOrganisationLoaded)  this.mailTemplatesLoaded();
    };
    ITSSessionMailerEditor.prototype.mailTemplatesLoadedOrganisationError = function () {
        this.mailTemplatesOrganisationLoaded = true;
        if (this.mailTemplatesServerLoaded)  this.mailTemplatesLoaded();
    };
    ITSSessionMailerEditor.prototype.mailTemplatesLoadedServerError = function () {
        this.mailTemplatesServerLoaded = true;
        if (this.mailTemplatesOrganisationLoaded)  this.mailTemplatesLoaded();
    };

    ITSSessionMailerEditor.prototype.mailTemplatesLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        this.loadMailTemplates();
    };

    ITSSessionMailerEditor.prototype.mailTemplatesLoadedError = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        this.loadMailTemplates();
    };

    ITSSessionMailerEditor.prototype.loadMailTemplates = function (defaultIndex) {
        var templateList = {};
        try {
            if (this.organisationMailTemplates.templates) {
                this.organisationMailTemplates.templates.sort(this.templateSortFunction);
                templateList = this.organisationMailTemplates.templates;
            }
        } catch (err) {  }
        try {
            if (this.systemMailTemplates.templates) this.systemMailTemplates.templates.sort(this.templateSortFunction);
            if (templateList.templates) {
                if (this.systemMailTemplates.templates) templateList = templateList.concat(this.systemMailTemplates.templates);
            } else {
                if (this.systemMailTemplates.templates) templateList = this.systemMailTemplates.templates;
            }
        } catch (err) {  }

        if (!defaultIndex) defaultIndex = 0;

        $('#SessionMailerInterfaceTemplateSelection').hide();
        if (ITSInstance.users.currentUser.PluginData.MailTemplates) {
            var personalTemplates = ITSInstance.users.currentUser.PluginData.MailTemplates;
            if (personalTemplates.templates) {
                personalTemplates.templates.sort(this.templateSortFunction);
                if (templateList.templates) {
                    templateList = personalTemplates.templates.concat(templateList);
                } else {
                    templateList = personalTemplates.templates
                }
            }
        }

        this.templateList = templateList;
        if (templateList.length == 0) {
            // load the default template
            var defaultTemplate = {};
            defaultTemplate.ID = "defaultSession";
            defaultTemplate.body = "<p>A test session is ready for you. </p><p>Please browse to %%WWW%%. You can login with the following information : <br/> User name : %%candidate.EMail%%<br/>  Password : %%password%%</p><p></p><p>Kind regards, </p><p>%%consultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
            defaultTemplate.description = "Default template";
            defaultTemplate.subject = "A test session is ready for you";
            defaultTemplate.language = "en";
            templateList.push(defaultTemplate);
            var defaultTemplate = {};
            defaultTemplate.ID = "defaultPassword";
            defaultTemplate.body = "<p>Your password has been reset. </p><p>Please browse to %%WWW%%. You can login with the new password. Please use the following information to login. <br/> User name : %%candidate.EMail%%<br/>  Password : %%password%%</p><p></p><p>Kind regards, </p><p>%%consultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
            defaultTemplate.description = "Password reset template for candidates";
            defaultTemplate.subject = "Your password has been reset";
            defaultTemplate.language = "en";
            templateList.push(defaultTemplate);
            var defaultTemplate = {};
            defaultTemplate.ID = "defaultPasswordConsultant";
            defaultTemplate.body = "<p>Your password has been reset. </p><p>Please browse to %%WWW%%. You can login with the new password. Please use the following information to login. <br/> User name : %%newconsultant.Email%%<br/>  Password : %%password%%</p><p></p><p>Kind regards, </p><p>%%newconsultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
            defaultTemplate.description = "Password reset template for consultants";
            defaultTemplate.subject = "Your password has been reset";
            defaultTemplate.language = "en";
            templateList.push(defaultTemplate);
            var tempList = {};
            tempList.templates = templateList;
            tempList.persistentProperties = "*ALL*";
            // and save this as default template
            ITSInstance.genericAjaxUpdate('systemsettings/MailTemplates', ITSJSONStringify(tempList));
        }
        if (templateList.length > 0) {
            $('#SessionMailerInterfaceTemplateSelection').show();
            // sort the template list, interface language templates should be on top
            //templateList.sort(this.templateSortFunction);
            // now load the dropdown
            $('#SessionMailerInterface-TemplateSelect').empty();
            var tempSelect = "";
            var defaultOption = "selected='selected'";
            for (var i = 0; i < templateList.length; i++) {
                if (i == defaultIndex) {
                    tempSelect = '<option NoTranslate ' + defaultOption + ' value=\"' + i + '\">' +
                        templateList[i].description + '</option>';
                } else {
                    tempSelect = '<option NoTranslate value=\"' + i + '\">' +
                        templateList[i].description + '</option>';
                }
                $('#SessionMailerInterface-TemplateSelect').append(tempSelect);
            }
            this.selectTemplateInEditor(-1);
        }
        this.templatesLoaded = true;

    };

    ITSSessionMailerEditor.prototype.templateSortFunction = function (a, b) {
        if ((a.language == ITSLanguage) && (b.language == ITSLanguage)) {
            return a.description.localeCompare(b.description);
        }
        if ((a.language == ITSLanguage) && (b.language != ITSLanguage)) {
            return -1;
        }
        if ((a.language != ITSLanguage) && (b.language == ITSLanguage)) {
            return 1;
        }
        if ((a.language != ITSLanguage) && (b.language != ITSLanguage)) {
            var x = a.language.localeCompare(b.language);
        }
        if (x == 0) {
            x = a.description.localeCompare(b.description);
        }
        return x;
    };

    ITSSessionMailerEditor.prototype.sessionLoadingSucceeded = function () {
        // generate the mail with the filled in template fields
        if (!this.templatesLoaded) {
            setTimeout(this.sessionLoadingSucceeded.bind(this), 1000); // try again later
        } else {
            // set the defaults
            $('#SessionMailerInterfaceSessionEditMailTo').val(this.currentSession.Person.EMail);

            // make sure the correct template is selected
            if (this.Template){
                var index = this.findMailTemplateByID(this.Template);
                if (index >= 0) {
                    this.loadMailTemplates(index);
                    this.selectTemplateInEditor(index);
                }
            }
        }
    };
    ITSSessionMailerEditor.prototype.sessionLoadingFailed = function () {
        // do not generate the mail, just show the template
        ITSInstance.UIController.showWarning('ITSSessionMailerEditor.SessionLoadingFailed', 'The session could not be loaded.', "", "window.history.back();");
    };

    ITSSessionMailerEditor.prototype.personLoadingSucceeded = function () {
        if (!this.templatesLoaded) {
            setTimeout(this.personLoadingSucceeded.bind(this), 1000); // try again later
        } else {
            if (this.personRequiresSaving) {
                // save the new password
                ITSInstance.candidates.currentCandidate.saveToServer(function () {}, function () {});
            }
            // set the defaults
            if (!this.currentPerson) this.currentPerson = ITSInstance.candidates.currentCandidate;
            $('#SessionMailerInterfaceSessionEditMailTo').val(this.currentPerson.EMail);
            // make sure the correct template is selected
            if (this.Template){
                var index = this.findMailTemplateByID(this.Template);
                if (index >= 0) {
                    this.loadMailTemplates(index);
                    this.selectTemplateInEditor(index);
                }
            }
        }
    };
    ITSSessionMailerEditor.prototype.personLoadingFailed  = function () {
        ITSInstance.UIController.showWarning('ITSSessionMailerEditor.PersonLoadingFailed', 'The candidate could not be loaded.', "", "window.history.back();");
    };


    ITSSessionMailerEditor.prototype.consultantLoadingSucceeded = function () {
        if (!this.templatesLoaded) {
            setTimeout(this.consultantLoadingSucceeded.bind(this), 1000); // try again later
        } else {
            if (this.consultantRequiresSaving) {
                // save the new password
                this.currentConsultant.regeneratePassword();
                this.currentConsultant.saveToServer(function () {}, function () {});
            }
            // set the defaults
            $('#SessionMailerInterfaceSessionEditMailTo').val(this.currentConsultant.Email);
            // make sure the correct template is selected
            if (this.Template){
                var index = this.findMailTemplateByID(this.Template);
                if (index >= 0) {
                    this.loadMailTemplates(index);
                    this.selectTemplateInEditor(index);
                }
            }
        }
    };
    ITSSessionMailerEditor.prototype.consultantLoadingFailed  = function () {
        ITSInstance.UIController.showWarning('ITSSessionMailerEditor.ConsultantLoadingFailed', 'The consultant could not be loaded.', "", "window.history.back();");
    };

    ITSSessionMailerEditor.prototype.findMailTemplateByID = function (ID) {
        // ITSLanguage
        var EnglishIndex = -1;
        var PreferredIndex = -1;
        for (var i = 0; i < this.templateList.length; i++) {
            if (this.templateList[i].ID == ID) {
                if (this.templateList[i].language == "en") EnglishIndex = i;
                if (this.templateList[i].language == ITSLanguage) PreferredIndex = i;
            }
        }
        if (PreferredIndex >= 0) {
            return PreferredIndex;
        } else {
            return EnglishIndex;
        }
    };

    ITSSessionMailerEditor.prototype.selectTemplateInEditor = function (selectedIndex) {
        if (!this.selectedTemplateIndex) this.selectedTemplateIndex = Math.max(0,selectedIndex);
        if (selectedIndex < 0) selectedIndex = this.selectedTemplateIndex;

        // generate mail using the template selected
        if (this.currentSession) {
            this.candidate = this.currentSession.Person;
            this.session = this.currentSession;
        }
        if (this.currentPerson) {
            this.candidate = this.currentPerson;
        }
        if (this.currentConsultant){
            this.newconsultant = this.currentConsultant;
        }
        this.consultant = ITSInstance.users.currentUser;

        // set WWW var
        if (this.templateList[selectedIndex].ID == "defaultPasswordConsultant") {
            this.WWW = configBaseURL + "?Lang="+ ITSLanguage + "&UserID=" + encodeURIComponent(this.newconsultant.Email);
        } else if ((this.templateList[selectedIndex].ID == "defaultSession") || ( this.templateList[selectedIndex].ID == "defaultPassword")) {
            this.WWW = configBaseURL + "?TestTakingOnly=Y&Lang="+ ITSLanguage + "&UserID=" + encodeURIComponent(this.candidate.EMail);
        } else {
            this.WWW = configBaseURL;
        }

        // set password var
        if (this.templateList[selectedIndex].ID == "defaultPasswordConsultant") {
            this.password = this.newconsultant.Password;
            if (this.password.trim() == "") this.password = ITSInstance.translator.getTranslatedString('SessionMailer', 'PasswordUsePrevious', "* please use the previously e-mailed password *");
        } else if (this.candidate) {
            this.password = this.candidate.Password;
            if (this.password.trim() == "") this.password = ITSInstance.translator.getTranslatedString('SessionMailer', 'PasswordUsePrevious', "* please use the previously e-mailed password *");
        } else {
            this.password = ITSInstance.translator.getTranslatedString('SessionMailer', 'PasswordUnknown', "* password cannot be used in this context *");
        }

        $('#SessionMailerInterfaceSessionEditMailSubject').val(envSubstitute(this.templateList[selectedIndex].subject, this, false));
        tinyMCE.get("SessionMailerInterfaceSessionEditMailBody").setContent(envSubstitute(this.templateList[selectedIndex].body, this, false));

        if (selectedIndex >= 0) this.selectedTemplateIndex = selectedIndex;
    };

    ITSSessionMailerEditor.prototype.sendMail = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        // store the defaults in the users data and save the user
        if (!ITSInstance.users.currentUser.PluginData.MailSettings) ITSInstance.users.currentUser.PluginData.MailSettings = {};
        ITSInstance.users.currentUser.PluginData.MailSettings['CopyMe'] = $('#SessionMailerInterfaceSessionEditMailCopyMe').is(':checked');
        ITSInstance.users.currentUser.PluginData.MailSettings['CC'] = $('#SessionMailerInterfaceSessionEditMailCc').val();
        ITSInstance.users.currentUser.PluginData.MailSettings['From'] = $('#SessionMailerInterfaceSessionEditMailFrom').val();
        ITSInstance.users.saveCurrentUser();

        // send the mail
        var newMail = new ITSMail();
        newMail.ReplyTo = $('#SessionMailerInterfaceSessionEditMailFrom').val();
        newMail.To = $('#SessionMailerInterfaceSessionEditMailTo').val();
        newMail.CC = $('#SessionMailerInterfaceSessionEditMailCc').val();
        if (ITSInstance.users.currentUser.PluginData.MailSettings.CopyMe) {
            newMail.BCC = ITSInstance.users.currentUser.Email;
        }
        newMail.Subject = $('#SessionMailerInterfaceSessionEditMailSubject').val();
        newMail.Body = tinyMCE.get("SessionMailerInterfaceSessionEditMailBody").getContent().toString();

        newMail.sendMail(this.mailOK.bind(this), this.mailFailed.bind(this));
    };

    ITSSessionMailerEditor.prototype.mailOK = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showInfo('ITSSessionMailerEditor.MailOK', 'The e-mail has been sent.', "", "window.history.back();");
    };

    ITSSessionMailerEditor.prototype.mailFailed = function (thrownError, xhr, ajaxOptions) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showWarning('ITSSessionMailerEditor.MailFailed', 'Sending the e-mail failed.', xhr.responseText, "");
    };

    // register the portlet
    ITSInstance.SessionMailerSessionController = new ITSSessionMailerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.SessionMailerSessionController);

    // register the menu items if applicable

})()// IIFE