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
//# sourceURL=MailTemplateEditor/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="MailTemplateEditorInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/MailTemplateEditor/editor.html', function () {
        // things to do after loading the html
    });

    var ITSMailTemplateEditorEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('9959ef99-2d28-46e1-a8d1-e98a0f0672dc', 'MailTemplate editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Manage and edit mail templates');
        this.path = "MailTemplateEditor";
    };

    ITSMailTemplateEditorEditor.prototype.init=function () {
    };

    ITSMailTemplateEditorEditor.prototype.hide= function () {
        $('#MailTemplateEditorInterfaceSessionEdit').hide();
    };

    ITSMailTemplateEditorEditor.prototype.show=function () {
        if (getUrlParameterValue('Scope')) {
            // Scope is master, organisation, or personal
            this.Scope = getUrlParameterValue('Scope');

            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#MailTemplateEditorInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            // init variables
            this.currentTemplate = {}; // the current mail template being edited
            this.templates = {}; // all templates for this server, organisation or person
            this.mailTemplates = {}; // the mail templates as read from the server
            this.mailTemplates._objectType = "ITSObject";

            $('#MailTemplateEditorTestDescriptionDiv').show();
            $('#MailTemplateEditorTemplateDescriptionHeaderMSDiv').hide();

            // now load the mail templates from the appropriate place
            switch (this.Scope) {
                case 'master':
                    ITSInstance.UIController.showInterfaceAsWaitingOn();
                    ITSInstance.JSONAjaxLoader('systemsettings/MailTemplates', this.mailTemplates, this.mailTemplatesLoaded.bind(this), this.mailTemplatesLoadedError.bind(this), ITSObject, 0,-1,"","N", "Y","N");
                    break;
                case 'organisation':
                    ITSInstance.UIController.showInterfaceAsWaitingOn();
                    ITSInstance.JSONAjaxLoader('systemsettings/MailTemplates', this.mailTemplates, this.mailTemplatesLoaded.bind(this), this.mailTemplatesLoadedError.bind(this), ITSObject);
                    break;
                case 'personal':
                    if (ITSInstance.users.currentUser.PluginData.MailTemplates) {
                        this.mailTemplates = ITSInstance.users.currentUser.PluginData.MailTemplates;
                    } else {
                        this.mailTemplates = {};
                    }
                    this.mailTemplatesLoaded(true);
                    break;
                default:
                    ITSInstance.UIController.activateScreenPath('Switchboard');
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };


    ITSMailTemplateEditorEditor.prototype.mailTemplatesLoadedError = function (xhr) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (xhr.status == 404) {
          this.mailTemplatesLoaded();
        } else {
            ITSInstance.UIController.showError('mailTemplateLoadedError', 'The e-mail templates could not be loaded at this moment. Please try again later.', '',
                "window.history.back();");
        }
    };

    ITSMailTemplateEditorEditor.prototype.mailTemplatesLoaded = function ( noArrayReset) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        this.fillLanguagesInEditor();
        if (!this.mailTemplates.templates) this.mailTemplates.templates = [];
        this.templates = this.mailTemplates.templates;
        
        if (this.templates.length == 0) {
            // load the default template
            var defaultTemplate = {};
            defaultTemplate.ID = "other";
            defaultTemplate.body = "...";
            defaultTemplate.description = "...";
            defaultTemplate.subject = "...";
            defaultTemplate.language = ITSLanguage;
            defaultTemplate._objectType = "ITSObject";
            this.templates.push(defaultTemplate);
            this.mailTemplates.persistentProperties = "*ALL*";
        }

        // now show the first template available
        this.currentTemplateIndex = 0;
        this.showTemplateWithIndex(this.currentTemplateIndex);
    };

    ITSMailTemplateEditorEditor.prototype.showTemplateWithIndex = function (index) {
        this.currentTemplateIndex = index;
        this.currentTemplate = this.templates[index];

        $('#MailTemplateEditorTestDescriptionDiv').show();
        $('#MailTemplateEditorTemplateDescriptionHeaderMSDiv').hide();

        if ( (this.templates[index].ID == "other") || (this.templates[index].ID == "otherPassword") || (this.templates[index].ID == "otherPasswordConsultant")) {
            $('#MailTemplateEditorTestDescriptionDiv').show();
            $('#MailTemplateEditorTemplateDescriptionHeaderMSDiv').show();
        }

        DataBinderTo('MailTemplateEditorInterfaceEditDiv', ITSInstance.MailTemplateEditorController);

        var resStr = "%%WWW%%\n%%password%%\n";
        var candidate = new ITSCandidate(this, ITSInstance).persistentProperties;
        var session = new ITSCandidateSession(this,  ITSInstance).persistentProperties;
        var consultant = new ITSUser(this, ITSInstance).persistentProperties;

        if ((this.templates[index].ID == "defaultPasswordConsultant") || (this.templates[index].ID == "otherPasswordConsultant")) {
            for (var i=0; i < consultant.length; i++) { resStr +=  "%%consultant." + consultant[i] + "%%\n";  }
            for (var i=0; i < consultant.length; i++) { resStr +=  "%%newconsultant." + consultant[i] + "%%\n";  }
            $('#MailTemplateEditor_WriterFields').text(resStr);
        } else {
            for (var i=0; i < candidate.length; i++) { resStr +=  "%%candidate." + candidate[i] + "%%\n";  }
            for (var i=0; i < session.length; i++) { resStr +=  "%%session." + session[i] + "%%\n";  }
            for (var i=0; i < consultant.length; i++) { resStr +=  "%%consultant." + consultant[i] + "%%\n";  }
            $('#MailTemplateEditor_WriterFields').text(resStr);
        }

        // if template type == other then load the list of other templates in the current language
        $('#MailTemplateEditorDescriptionMS').empty();
        var currentLanguage = $('#MailTemplateEditor-LanguageSelect').val();
        var currentType = $('#MailTemplateEditorTemplateType').val();
        var tempSelect = "";
        for (var i=0; i < this.templates.length; i++) {
            if ((this.templates[i].ID == currentType) && (this.templates[i].language == currentLanguage)) {
                tempSelect = '<option NoTranslate value=\"' + i + '\">' +
                    this.templates[i].description + '</option>';
                $('#MailTemplateEditorDescriptionMS').append(tempSelect);
            }
        };
    };

    ITSMailTemplateEditorEditor.prototype.selectTemplateTypeInEditor = function (selectedType) {
        // check if there is a template of the given type and in the given language.
        var currentLanguage = $('#MailTemplateEditor-LanguageSelect').val();

        var templateIndex = -1;
        for (var i=0; i < this.templates.length; i++) {
            if ((this.templates[i].ID == selectedType) && (this.templates[i].language == currentLanguage)) {
                templateIndex = i;
                break;
            }
        };

        // if not add with default fillings in English, for Other add a first default one
        if (templateIndex == -1) {
            templateIndex = this.templates.length;
            defaultTemplate = {};
            defaultTemplate.ID = selectedType;
            defaultTemplate.language = currentLanguage;
            defaultTemplate._objectType = "ITSObject";

            switch (defaultTemplate.ID) {
                case 'defaultSession' || 'other':
                    defaultTemplate.body = "<p>A test session is ready for you. </p><p>Please browse to %%WWW%%. You can login with the following information : <br/> User name : %%candidate.EMail%%<br/>  Password : %%candidate.Password%%</p><p></p><p>Kind regards, </p><p>%%consultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
                    defaultTemplate.description = "Default template";
                    defaultTemplate.subject = "A test session is ready for you";
                    break;
                case 'defaultPassword' || 'otherPassword':
                    defaultTemplate.body = "<p>Your password has been reset. </p><p>Please browse to %%WWW%%. You can login with the new password. Please use the following information to login. <br/> User name : %%candidate.EMail%%<br/>  Password : %%candidate.Password%%</p><p></p><p>Kind regards, </p><p>%%consultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
                    defaultTemplate.description = "Password reset template for candidates";
                    defaultTemplate.subject = "Your password has been reset";
                    break;
                case 'defaultPasswordConsultant' || 'otherPasswordConsultant':
                    defaultTemplate.body = "<p>Your password has been reset. </p><p>Please browse to %%WWW%%. You can login with the new password. Please use the following information to login. <br/> User name : %%newconsultant.Email%%<br/>  Password : %%newconsultant.Password%%</p><p></p><p>Kind regards, </p><p>%%newconsultant.UserName%%<br/>In case you have questions you can contact me at %%consultant.Email%%";
                    defaultTemplate.description = "Password reset template for consultants";
                    defaultTemplate.subject = "Your password has been reset";
                    break;
                default:
                    defaultTemplate.body = "...";
                    defaultTemplate.description = "Template #" + this.templates.length;
                    defaultTemplate.subject = "Template #" + this.templates.length;
            }
            this.templates.push(defaultTemplate);
        }

        // show this on screen
        this.showTemplateWithIndex(templateIndex);
    };

    ITSMailTemplateEditorEditor.prototype.selectLanguageInEditor = function (selectedLanguage) {
        $('#MailTemplateEditor-LanguageSelect').val(selectedLanguage);
        this.selectTemplateTypeInEditor($('#MailTemplateEditorTemplateType').val());
    };

    ITSMailTemplateEditorEditor.prototype.selectOtherTemplateInEditor = function (selectedTemplate) {
        this.showTemplateWithIndex(selectedTemplate);
    };

    ITSMailTemplateEditorEditor.prototype.addNewTemplate = function () {
        var defaultTemplate = {};
        defaultTemplate.ID = 'other';
        defaultTemplate.language = $('#MailTemplateEditor-LanguageSelect').val();
        defaultTemplate.body = "...";
        defaultTemplate.description = "Template #" + this.templates.length;
        defaultTemplate.subject = "Template #" + this.templates.length;
        defaultTemplate._objectType = "ITSObject";
        this.templates.push(defaultTemplate);
        this.showTemplateWithIndex(this.templates.length-1);
    };

    ITSMailTemplateEditorEditor.prototype.removeCurrentTemplate = function () {
        this.templates.splice(this.currentTemplateIndex,1);
        this.showTemplateWithIndex(0);
    };

    ITSMailTemplateEditorEditor.prototype.saveCurrentTemplate = function () {
        // update on the server
        $('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";

        // remove mail templates without description
        for (var i=this.templates.length-1; i >= 0; i--) {
            if (this.templates[i].description.trim() == "") {
                this.templates.splice(i, 1);
            } else {
                this.templates[i]._objectType = "ITSObject";
            }
        }

        switch (this.Scope) {
            case 'master':
                ITSInstance.genericAjaxUpdate('systemsettings/MailTemplates', ITSJSONStringify(this.mailTemplates),
                    function () { $('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>"; },
                     function () {  $('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>"; ITSInstance.UIController.showError('mailTemplateSaveError', 'The e-mail templates could not be saved at this moment. Please try again later.'); }, "Y", "N" );
                break;
            case 'organisation':
                ITSInstance.genericAjaxUpdate('systemsettings/MailTemplates', ITSJSONStringify(this.mailTemplates),
                     function () {$('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";},
                     function () { $('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>"; ITSInstance.UIController.showError('mailTemplateSaveError', 'The e-mail templates could not be saved at this moment. Please try again later.'); }, "N", "Y" );
                break;
            case 'personal':
                ITSInstance.users.currentUser.PluginData.MailTemplates = this.mailTemplates;
                ITSInstance.users.currentUser.saveToServer(function () {$('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>"; },
                    function () { $('#MailTemplateEditor-saveIcon')[0].outerHTML = "<i id='MailTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>"; ITSInstance.UIController.showError('mailTemplateSaveError', 'The e-mail templates could not be saved at this moment. Please try again later.'); });
                break;
            default:
                ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };


    ITSMailTemplateEditorEditor.prototype.fillLanguagesInEditor = function () {
        $('#MailTemplateEditor-LanguageSelect').empty();
        var desc = "";
        var selected = "";
        for (var i = 0; i < ITSSupportedLanguages.length; i++) {
            desc = ITSInstance.translator.getLanguageDescription(ITSSupportedLanguages[i].languageCode);
            selected = "";
            if (ITSSupportedLanguages[i].languageCode == this.currentTemplate.language) selected = " selected='selected' ";
            $('#MailTemplateEditor-LanguageSelect').append(
                '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                desc + '</option>'
            );
        }
    };

    // register the portlet
    ITSInstance.MailTemplateEditorController = new ITSMailTemplateEditorEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.MailTemplateEditorController);
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsOrganisationSupervisor) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', '#MailTemplateEditorController.OrganisationMailTemplatesMenu', ITSInstance.translator.translate("#MailTemplateEditorController.OrganisationMailTemplatesMenu", "Manage e-mail templates"), "fa-mail-bulk", "ITSRedirectPath(\'MailTemplateEditor&Scope=organisation\');");
        }
        if (ITSInstance.users.currentUser.IsMasterUser) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', '#MailTemplateEditorController.ServerMailTemplatesMenu', ITSInstance.translator.translate("#MailTemplateEditorController.ServerMailTemplatesMenu", "Manage server e-mail templates"), "fa-wrench", "ITSRedirectPath(\'MailTemplateEditor&Scope=master\');");
        }
        ITSInstance.UIController.registerMenuItem('#submenuSettingsLI', '#MailTemplateEditorController.MyMailTemplatesMenu', ITSInstance.translator.translate("#MailTemplateEditorController.MyMailTemplatesMenu", "My e-mail templates"), "fa-mail-bulk", "ITSRedirectPath(\'MailTemplateEditor&Scope=personal\');");
    }, true);

    // translate the portlet
    ITSInstance.translator.translateDiv("#MailTemplateEditorInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE