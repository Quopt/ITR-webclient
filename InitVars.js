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
// Initialize the default variables and load all the javascript files required for the ITS application
// all scripts are loaded deferred so the user can login while the scripts are loading

// and now init the application
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/ITSBootstrap.js'><\/script>");

loadOfficeComponentsAlreadyCalled = false;

function loadOfficeComponents() {
    if (! loadOfficeComponentsAlreadyCalled) {
        loadOfficeComponentsAlreadyCalled = true;

        // %OFFICEPORTLETSTART%
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionNewPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionProgressPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionOverviewPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TestCatalogPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CreditsUsedPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/UserPreferencesPortlet/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/UsersLoggedInPortlet/init.js' defer><\/script>");
        // %OFFICEPORTLETEND%

        // load all the editors and viewers
        // %OFFICEEDITORSTART%
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionNewEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TestCatalogViewer/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ScreenTemplateEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TestTemplateEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionMailer/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionViewAnswers/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionViewReports/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ReportTemplateEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/PersonLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/PersonEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ResetPassword/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ConsultantLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ConsultantEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/OrganisationLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/OrganisationEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/GrantCredits/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ScreenTemplateLocalPublisher/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TestTemplateLocalPublisher/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ReportTemplateLocalPublisher/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CreditsUsedLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CreditsOrderByMail/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ServerSettings/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ServerSettingsPublics/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CustomerSettings/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/MailTemplateEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/SessionChangeEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/BatteryLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/BatteryEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/GroupSessionEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/GroupSessionLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/DownloadData/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TranslationEditor/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/TokenLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CreditsUsedListerServer/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/CreditsGrantedLister/init.js' defer><\/script>");
        document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Plugins/ServerLogs/init.js' defer><\/script>");
        // %OFFICEEDITOREND%
    }
};

if (window.location.href.indexOf('TestTakingOnly=Y') < 0 ) {
    // load all the required components for the office and test taking environment
    // load all the portlets. Do not remove the %TAG% values below this line! They are user for plugin and portlet management.

    loadOfficeComponents();

    if (window.location.href.indexOf('DevMode=Y') >= 0 ) {
        var DebugMode=true;
        // %DEVMODESTART%

        // %DEVMODEEND%
    }

    if (window.location.href.indexOf('TestMode=Y') >= 0 ) {
        // TODO : add stubbing to the generic ajax calls
        // %TESTMODESTART%

        // %TESTMODEEND%
    }

} else {
    // load all the required components for the test taking environment ONLY
    // %TESTRUNSTART%

    // %TESTRUNEND%
}