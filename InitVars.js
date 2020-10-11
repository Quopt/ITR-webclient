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

// load all the required components for the test taking environment ONLY
// %TESTRUNSTART%

// %TESTRUNEND%

var loadOfficeComponentsAlreadyCalled = false;
var loadPortletsCount, loadEditorsCount;

function loadOfficeComponents() {
    if (! loadOfficeComponentsAlreadyCalled) {
        loadOfficeComponentsAlreadyCalled = true;

        loadPortletsCount = 0;
        // %OFFICEPORTLETSTART%
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionNewPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionProgressPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionOverviewPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TestCatalogPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CourseCatalogPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/UserPreferencesPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/UsersLoggedInPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CourseTeachingSessionPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CourseClassroomSessionPortlet/init.js"); loadPortletsCount ++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CourseIndividualSessionPortlet/init.js"); loadPortletsCount ++;
        // %OFFICEPORTLETEND%

        // load all the editors and viewers
        loadEditorsCount = 0;
        // %OFFICEEDITORSTART%
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionNewEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TestCatalogViewer/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ScreenTemplateEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TestTemplateEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionMailer/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionViewAnswers/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionViewReports/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ReportTemplateEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/PersonLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/PersonEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ResetPassword/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ConsultantLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ConsultantEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/OrganisationLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/OrganisationEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/GrantCredits/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ScreenTemplateLocalPublisher/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TestTemplateLocalPublisher/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ReportTemplateLocalPublisher/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CreditsOrderByMail/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ServerSettings/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ServerSettingsPublics/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CustomerSettings/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/MailTemplateEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionChangeEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/BatteryLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/BatteryEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/GroupSessionEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/GroupSessionLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/DownloadData/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TranslationEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/TokenLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedListerServer/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CreditsGrantedLister/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ServerLogs/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/SessionAuditTrail/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/ServerData/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/PublicSessionEditor/init.js"); loadEditorsCount++;
        $.getScript(ITSJavaScriptVersion + "/Plugins/CourseTeachingSession/init.js"); loadEditorsCount++;
        // %OFFICEEDITOREND%
    }
};