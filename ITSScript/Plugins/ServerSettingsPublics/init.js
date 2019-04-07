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
    var EditorDiv = $('<div class="container-fluid" id="ServerSettingsPublicsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ServerSettingsPublics/editor.html', function () {
       // things to do after loading the html
    });

    var ITSServerSettingsPublicsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('74e2b659-e354-43ff-9104-bd6478561890', 'ServerSettingsPublics editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit what is installed on the server from the public repos');
        this.path = "ServerSettingsPublics";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ServerSettingsPublics_filename\" scope=\"col\">Feature name</th>" +
            "   <th id=\"ServerSettingsPublics_explanation\" scope=\"col\">Explanation</th>" +
            "   <th id=\"ServerSettingsPublics_refreshdate\" scope=\"col\">Last refresh date and time</th>" +
            "   <th id=\"ServerSettingsPublics_actions\" scope=\"col\">Actions</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%FEATURENAME%%</span></td>" +
            "   <td><span notranslate>%%EXPLANATION%%</span></td>" +
            "   <td><span notranslate>%%LASTREFRESHDATE%%</span></td>" +
            "   <td><span notranslate id='%%ID%%'>%%ACTIONS%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mFEATURENAME = /%%FEATURENAME%%/g;
        this.mNR = /%%NR%%/g;
        this.mID = /%%ID%%/g;
        this.mEXPLANATION = /%%EXPLANATION%%/g;
        this.mLASTREFRESHDATE = /%%LASTREFRESHDATE%%/g;
        this.mACTIONS = /%%ACTIONS%%/g;

        this.testScreenTemplates = {};
        this.testTemplates = {};
        this.reportTemplates = {};
        this.translationTemplates = {};
        this.pluginTemplates = {};

    };

    ITSServerSettingsPublicsEditor.prototype.init=function () {
    };

    ITSServerSettingsPublicsEditor.prototype.hide= function () {
        $('#ServerSettingsPublicsInterfaceSessionEdit').hide();
    };

    ITSServerSettingsPublicsEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ServerSettingsPublicsInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        // fill or update the lists
        ITSInstance.JSONAjaxLoader('listpublics/itr-translations' , this.translationTemplates, this.translationTemplatesLoaded.bind(this), this.translationTemplatesLoadingFailed.bind(this));
        ITSInstance.JSONAjaxLoader('listpublics/itr-testscreentemplates' , this.testScreenTemplates, this.testScreenTemplatesLoaded.bind(this), this.testScreenTemplatesFailed.bind(this));
        ITSInstance.JSONAjaxLoader('listpublics/itr-reporttemplates' , this.reportTemplates, this.reportTemplatesLoaded.bind(this), this.reportTemplatesLoadingFailed.bind(this));
        ITSInstance.JSONAjaxLoader('listpublics/itr-testtemplates' , this.testTemplates, this.testTemplatesLoaded.bind(this), this.testTemplatesLoadingFailed.bind(this));
        ITSInstance.JSONAjaxLoader('listpublics/itr-plugins' , this.pluginTemplates, this.pluginTemplatesLoaded.bind(this), this.pluginTemplatesLoadingFailed.bind(this));
    };

    ITSServerSettingsPublicsEditor.prototype.translationTemplatesLoaded = function () {
        console.log(this.translationTemplates);
    };

    ITSServerSettingsPublicsEditor.prototype.testScreenTemplatesLoaded = function () {
    };

    ITSServerSettingsPublicsEditor.prototype.reportTemplatesLoaded = function () {
    };

    ITSServerSettingsPublicsEditor.prototype.testTemplatesLoaded = function () {
    };

    ITSServerSettingsPublicsEditor.prototype.pluginTemplatesLoaded = function () {
    };

    ITSServerSettingsPublicsEditor.prototype.testScreenTemplatesFailed= function () {
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.LoadScreenTemplatesFailed", "The test screen templates list could not be loaded at this moment.");
    };
    ITSServerSettingsPublicsEditor.prototype.reportTemplatesLoadingFailed= function () {
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.LoadReportTemplatesFailed", "The report template list could not be loaded at this moment.");
    };
    ITSServerSettingsPublicsEditor.prototype.testTemplatesLoadingFailed= function () {
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.LoadTestTemplatesFailed", "The test templates list could not be loaded at this moment.");
    };
    ITSServerSettingsPublicsEditor.prototype.pluginTemplatesLoadingFailed= function () {
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.LoadPluginsListFailed", "The plugins list could not be loaded at this moment.");
    };
    ITSServerSettingsPublicsEditor.prototype.translationTemplatesLoadingFailed= function () {
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.LoadTranslationsFailed", "The translation list could not be loaded at this moment.");
    };

    // register the portlet
    ITSInstance.ServerSettingsPublicsController = new ITSServerSettingsPublicsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ServerSettingsPublicsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ServerSettingsPublicsInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE