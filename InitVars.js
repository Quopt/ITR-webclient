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

function onDemandScript ( url, callback ) {
    callback = (typeof callback != 'undefined') ? callback : {};

    $.ajax({
        type: "GET",
        url: url,
        headers: { 'BrowserID': ITSInstance.BrowserID},
        success: callback,
        dataType: "script",
        cache: true
    });
}

function loadOfficeComponents() {
    if (! loadOfficeComponentsAlreadyCalled) {
        loadOfficeComponentsAlreadyCalled = true;

        loadPortletsCount = 0;
        // %OFFICEPORTLETSTART%
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionNewPortlet/init.js");  loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionProgressPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionOverviewPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TestCatalogPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CourseCatalogPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/UserPreferencesPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/UsersLoggedInPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CourseTeachingSessionPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CourseClassroomSessionPortlet/init.js"); loadPortletsCount ++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CourseIndividualSessionPortlet/init.js"); loadPortletsCount ++;
        // %OFFICEPORTLETEND%

        // load all the editors and viewers
        loadEditorsCount = 0;
        // %OFFICEEDITORSTART%
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionNewEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TestCatalogViewer/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ScreenTemplateEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TestTemplateEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionMailer/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionViewAnswers/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionViewReports/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ReportTemplateEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/PersonLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/PersonEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ResetPassword/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ConsultantLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ConsultantEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/OrganisationLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/OrganisationEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/GrantCredits/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ScreenTemplateLocalPublisher/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TestTemplateLocalPublisher/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ReportTemplateLocalPublisher/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CreditsOrderByMail/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ServerSettings/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ServerSettingsPublics/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CustomerSettings/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/MailTemplateEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionChangeEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/BatteryLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/BatteryEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/GroupSessionEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/GroupSessionLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/DownloadData/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TranslationEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/TokenLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CreditsUsedListerServer/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CreditsGrantedLister/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ServerLogs/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/SessionAuditTrail/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/ServerData/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/PublicSessionEditor/init.js"); loadEditorsCount++;
        onDemandScript(ITSJavaScriptVersion + "/Plugins/CourseTeachingSession/init.js"); loadEditorsCount++;
        // %OFFICEEDITOREND%
    }
};