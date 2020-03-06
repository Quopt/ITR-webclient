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
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%FEATURENAME%%</span></td>" +
            "   <td><span notranslate>%%EXPLANATION%%</span></td>" +
            "   <td><span notranslate>%%LASTREFRESHDATE%%</span></td>" +
            "   <td nowrap><span notranslate id='%%ID%%'>%%ACTIONS%%</span>" +
            "   <button type=\"button\" class=\"btn-xs btn-success %%hide%% \"" +
            "    onclick=\'ITSInstance.ServerSettingsPublicsController.install(\"%%ID%%\",\"%%TYPE%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-plus\"></i></button>" +
            "   <button type=\"button\" class=\"btn-xs btn-warning %%hiderevoke%% \"" +
            "    onclick=\'ITSInstance.ServerSettingsPublicsController.uninstall(\"%%ID%%\",\"%%TYPE%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-arrow-down\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mFEATURENAME = /%%FEATURENAME%%/g;
        this.mNR = /%%NR%%/g;
        this.mID = /%%ID%%/g;
        this.mTYPE = /%%TYPE%%/g;
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
        this.tblTranslationTemplates = this.tablePart1;
        for (var i=0; i < this.translationTemplates.length; i++) {
            //console.log(this.testScreenTemplates[i].name);
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i +1 );
            rowText = rowText.replace( this.mFEATURENAME, this.translationTemplates[i].name );
            rowText = rowText.replace( this.mID, this.translationTemplates[i].name );
            rowText = rowText.replace( this.mTYPE, "TRANS");
            rowText = rowText.replace( this.mEXPLANATION, this.translationTemplates[i].explanation );
            rowText = rowText.replace( this.mLASTREFRESHDATE, this.translationTemplates[i].getdate );
            rowText = rowText.replace( this.mACTIONS, "");

            this.tblTranslationTemplates += rowText;
        }
        $('#ServerSettingsLanguageTemplate-list').empty();
        $('#ServerSettingsLanguageTemplate-list').append(this.tblTranslationTemplates + this.tablePart3);
    };

    ITSServerSettingsPublicsEditor.prototype.testScreenTemplatesLoaded = function () {
        console.log(this.testScreenTemplates);
        this.tblTestScreenTemplates = this.tablePart1;
        for (var i=0; i < this.testScreenTemplates.length; i++) {
            //console.log(this.testScreenTemplates[i].name);
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i +1 );
            rowText = rowText.replace( this.mFEATURENAME, this.testScreenTemplates[i].name );
            rowText = rowText.replace( this.mID, this.testScreenTemplates[i].name );
            rowText = rowText.replace( this.mTYPE, "TST");
            rowText = rowText.replace( this.mEXPLANATION, this.testScreenTemplates[i].explanation );
            rowText = rowText.replace( this.mLASTREFRESHDATE, this.testScreenTemplates[i].getdate );
            rowText = rowText.replace( this.mACTIONS, "");

            this.tblTestScreenTemplates += rowText;
        }
        $('#ServerSettingsPublicsTestScreenTemplate-list').empty();
        $('#ServerSettingsPublicsTestScreenTemplate-list').append(this.tblTestScreenTemplates + this.tablePart3);
    };

    ITSServerSettingsPublicsEditor.prototype.reportTemplatesLoaded = function () {
        this.tblReportTemplates = this.tablePart1;
        for (var i=0; i < this.reportTemplates.length; i++) {
            //console.log(this.testScreenTemplates[i].name);
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i +1 );
            rowText = rowText.replace( this.mFEATURENAME, this.reportTemplates[i].name );
            rowText = rowText.replace( this.mID, this.reportTemplates[i].name );
            rowText = rowText.replace( this.mTYPE, "RT");
            rowText = rowText.replace( this.mEXPLANATION, this.reportTemplates[i].explanation );
            rowText = rowText.replace( this.mLASTREFRESHDATE, this.reportTemplates[i].getdate );
            rowText = rowText.replace( this.mACTIONS, "");

            this.tblReportTemplates += rowText;
        }
        $('#ServerSettingsPublicsReportTemplate-list').empty();
        $('#ServerSettingsPublicsReportTemplate-list').append(this.tblReportTemplates + this.tablePart3);
    };

    ITSServerSettingsPublicsEditor.prototype.testTemplatesLoaded = function () {
        this.tblTestTemplates = this.tablePart1;
        for (var i=0; i < this.testTemplates.length; i++) {
            //console.log(this.testScreenTemplates[i].name);
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i +1 );
            rowText = rowText.replace( this.mFEATURENAME, this.testTemplates[i].name );
            rowText = rowText.replace( this.mID, this.testTemplates[i].name );
            rowText = rowText.replace( this.mTYPE, "TT");
            rowText = rowText.replace( this.mEXPLANATION, this.testTemplates[i].explanation );
            rowText = rowText.replace( this.mLASTREFRESHDATE, this.testTemplates[i].getdate );
            rowText = rowText.replace( this.mACTIONS, "");

            this.tblTestTemplates += rowText;
        }
        $('#ServerSettingsPublicsTestTemplate-list').empty();
        $('#ServerSettingsPublicsTestTemplate-list').append(this.tblTestTemplates + this.tablePart3);
    };

    ITSServerSettingsPublicsEditor.prototype.pluginTemplatesLoaded = function () {
        this.tblPluginTemplates = this.tablePart1;
        for (var i=0; i < this.pluginTemplates.length; i++) {
            //console.log(this.testScreenTemplates[i].name);
            var rowText = this.tablePart2;
            rowText = rowText.replace( this.mNR, i +1 );
            rowText = rowText.replace( this.mFEATURENAME, this.pluginTemplates[i].name );
            rowText = rowText.replace( this.mID, this.pluginTemplates[i].name );
            rowText = rowText.replace( this.mTYPE, "PT");
            rowText = rowText.replace( this.mEXPLANATION, this.pluginTemplates[i].explanation );
            rowText = rowText.replace( this.mLASTREFRESHDATE, this.pluginTemplates[i].getdate );
            rowText = rowText.replace( this.mACTIONS, "");

            this.tblPluginTemplates += rowText;
        }
        $('#ServerSettingsPluginTemplate-list').empty();
        $('#ServerSettingsPluginTemplate-list').append(this.tblPluginTemplates + this.tablePart3);
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
    ITSServerSettingsPublicsEditor.prototype.sourceCodeUpdateFailed= function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.sourceCodeUpdateFailed", "The source code update failed.");
    };

    ITSServerSettingsPublicsEditor.prototype.install = function (fileid, type) {
        if (type == "TRANS") {
            ITSInstance.genericAjaxUpdate('installpublics/itr-translations/'+fileid, {}
                , function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); }
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
                );
        }
        if (type == "TST") {
            this.loadedTestScreenTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-testscreentemplates/'+fileid, this.loadedTestScreenTemplate
                , function (data) {
                    var temp = new ITSScreenTemplate(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.saveToServerMaster(
                    function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                    function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); } );
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
        if (type == "TT") {
            this.loadedTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-testtemplates/'+fileid, this.loadedTemplate
                , function (data) {
                    var temp = new ITSTest(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.saveToServerMaster(
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); },
                        true);
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
        if (type == "RT") {
            this.loadedTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-reporttemplates/'+fileid, this.loadedTemplate
                , function (data) {
                    var temp = new ITSReport(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.saveToServerMaster(
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); },
                        true);
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
    };

    ITSServerSettingsPublicsEditor.prototype.uninstall = function (fileid, type) {
        if (type == "TRANS") {
            ITSInstance.genericAjaxDelete('installpublics/itr-translations/'+fileid
                , function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); }
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
        if (type == "TST") {
            this.loadedTestScreenTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-testscreentemplates/'+fileid, this.loadedTestScreenTemplate
                , function (data) {
                    var temp = new ITSScreenTemplate(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.deleteFromServerMaster(
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); } );
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
        if (type == "TT") {
            this.loadedTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-testtemplates/'+fileid, this.loadedTemplate
                , function (data) {
                    var temp = new ITSTest(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.deleteFromServerMaster(
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); });
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
        if (type == "RT") {
            this.loadedTemplate = "";
            ITSInstance.JSONAjaxLoader('listpublics/itr-reporttemplates/'+fileid, this.loadedTemplate
                , function (data) {
                    var temp = new ITSReport(this, ITSInstance);
                    ITSJSONLoad(temp, data);
                    temp.deleteFromServerMaster (
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallOK", "The action has succeeded."); },
                        function () { ITSInstance.UIController.showInfo("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); },
                        true);
                }.bind(this)
                , function () { ITSInstance.UIController.showError("ITSServerSettingsPublicsEditor.InstallFailed", "The action could not be completed."); }
            );
        }
    };

    ITSServerSettingsPublicsEditor.prototype.installAllTranslationTemplates = function () {
        for (var i=0; i < this.translationTemplates.length; i++) {
            this.install(this.translationTemplates[i].name, "TRANS" );
        }
    };

    ITSServerSettingsPublicsEditor.prototype.installAllReportTemplates = function () {
        for (var i=0; i < this.reportTemplates.length; i++) {
            this.install(this.reportTemplates[i].name , "RT");
        }
    };

    ITSServerSettingsPublicsEditor.prototype.installAllTestTemplates = function () {
        for (var i=0; i < this.testTemplates.length; i++) {
            this.install( this.testTemplates[i].name, "TT" );
        }
    };

    ITSServerSettingsPublicsEditor.prototype.installAllScreenTemplates = function () {
        for (var i=0; i < this.testScreenTemplates.length; i++) {
            this.install(this.testScreenTemplates[i].name, "TST" );
        }
    };

    ITSServerSettingsPublicsEditor.prototype.installNewCode = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        ITSInstance.genericAjaxUpdate('installpublics/itr-webclient', "{}", function () {
            ITSInstance.genericAjaxUpdate('installpublics/itr-public-api', "{}", function () {
                ITSInstance.genericAjaxUpdate('installpublics/itr-api', "{}",
                    function () {
                        // force update
                        ITSInstance.genericAjaxUpdate('installpublics/itr-stop', "{}", function (){}, function (){});
                        ITSInstance.UIController.showInterfaceAsWaitingOff();
                        location.reload(true);
                     }, function () { ITSInstance.ServerSettingsPublicsController.sourceCodeUpdateFailed(); });
            }, function () { ITSInstance.ServerSettingsPublicsController.sourceCodeUpdateFailed(); });
        }, function () { ITSInstance.ServerSettingsPublicsController.sourceCodeUpdateFailed(); });
    };

    // register the portlet
    ITSInstance.ServerSettingsPublicsController = new ITSServerSettingsPublicsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ServerSettingsPublicsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ServerSettingsPublicsInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE