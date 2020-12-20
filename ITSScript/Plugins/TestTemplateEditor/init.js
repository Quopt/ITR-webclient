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
//# sourceURL=TestTemplateEditor/init.js

// define the new candidate editor object in the global memspace so that everybody can use it
function ITSTestTemplateEditor(session) {
    this.ITSSession = session;
    this.path = "TestTemplateEditor";

    this.screenListElement = "<div id=\"AdminInterfaceTestTemplateEditorScreenList%%NR%%\" NoTranslate %%ADDITIONALSTYLE%% class=\"row mx-0 px-0 form-control-sm col-12\">\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.moveScreenUp(%%NR%%);\"><i class=\"fa fa-xs fa-arrow-up\"></i></button>\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.moveScreenDown(%%NR%%);\"><i class=\"fa fa-xs fa-arrow-down\"></i></button>\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.copyToNewScreen(%%NR%%);\"><i class=\"fa fa-xs fa-copy\"></i></button>\n" +
        "<div notranslate id=\"AdminInterfaceTestTemplateEditorScreenRow\"><input style=\"width:120px\" type=\"text\" id=\"TestTemplateEditorSCREEN%%NR%%\" onfocus=\"ITSInstance.newITSTestEditorController.focusOnScreen(%%NR%%);\" onkeyup=\"ITSInstance.newITSTestEditorController.editScreenDescription(%%NR%%, this.value);\" value=\"%%ROW%%\" />" +
        "&nbsp;<button type=\"button\" class=\"btn-xs btn-warning\" onclick=\"ITSInstance.newITSTestEditorController.deleteScreen(%%NR%%);\"><i class=\"fa fa-xs fa-trash\"></i></button>"+
        "</div>\n" +
        "</div>";
    this.screenListElementID = /%%NR%%/g;
    this.screenListElementTestID = /%%ROW%%/g;
    this.screenListElementAdditionalStyle = /%%ADDITIONALSTYLE%%/g;

    this.screenComponentListElement =
        "<div id=\"AdminInterfaceTestTemplateEditorScreenContents%%NR%%\" NoTranslate onclick=\"ITSInstance.newITSTestEditorController.focusOnScreenComponent(%%NR%%);\" class=\"row m-0 p-0 col-12 form-control-sm\">\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.moveScreenComponentUp(%%NR%%);\"><i class=\"fa fa-xs fa-arrow-up\"></i></button>\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.moveScreenComponentDown(%%NR%%);\"><i class=\"fa fa-xs fa-arrow-down\"></i></button>\n" +
        "<button type=\"button\" class=\"btn-xs btn-success\" onclick=\"ITSInstance.newITSTestEditorController.copyScreenComponent(%%NR%%);\"><i class=\"fa fa-xs fa-copy\"></i></button>\n" +
        "<div notranslate id=\"AdminInterfaceTestTemplateEditorScreenRow\"><input style=\"width:200px\"  type=\"text\" id=\"TestTemplateEditorSCREENCOMPONENT%%NR%%\" onkeyup=\"ITSInstance.newITSTestEditorController.editScreenComponentDescription(%%NR%%, this.value);\" value=\"%%ROW%%\" />\n" +
        "<button type=\"button\" class=\"btn-xs btn-warning\" onclick=\"ITSInstance.newITSTestEditorController.deleteScreenComponent(%%NR%%);\"><i class=\"fa fa-xs fa-trash\"></i></button>\n" +
        "<span>" +
        "<input type=\"checkbox\" notranslate id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_Privacy%%NR%%\" %%PRIVACY%% onchange=\"ITSInstance.newITSTestEditorController.changeScreenComponentPrivacy(%%NR%%, this.checked);\">\n" +
        "<label id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_PrivacyLabel\" for=\"AdminInterfaceTestTemplateEditorScreenComponentRow_Privacy%%NR%%\">Exclude from anonimised</label>" +
        "</span>" +
        "<span>" +
        "<input type=\"checkbox\" notranslate id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_SessionStore%%NR%%\" %%SESSIONSTORE%% onchange=\"ITSInstance.newITSTestEditorController.changeScreenComponentSessionStore(%%NR%%, this.checked);\">\n" +
        "<label id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_SessionStoreLabel\" for=\"AdminInterfaceTestTemplateEditorScreenComponentRow_SessionStore%%NR%%\">Store at session level</label>" +
        "</span>" +
        "<span>" +
        "<input type=\"checkbox\" notranslate id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_SessionShow%%NR%%\" %%SESSIONSHOW%% onchange=\"ITSInstance.newITSTestEditorController.changeScreenComponentShow(%%NR%%, this.checked);\">\n" +
        "<label id=\"AdminInterfaceTestTemplateEditorScreenComponentRow_ShowLabel\" for=\"AdminInterfaceTestTemplateEditorScreenComponentRow_SessionShow%%NR%%\">Show</label>" +
        "</span>" +
        "</div></div>\n" +
        "<div id=\"AdminInterfaceTestTemplateEditorScreenContentsPreview%%NR%%\" NoTranslate class=\"row mx-0 px-0 col-12\">\n" +
        "%%PREVIEW%%\n" +
        "</div>" +
        "%%PREVIEW%%\n";
    this.screenComponentListElementID = /%%NR%%/g;
    this.screenComponentListElementPreviewID = /%%PREVIEW%%/g;
    this.screenComponentListElementRowID = /%%ROW%%/g;
    this.screenComponentListElementPrivacyStatus = /%%PRIVACY%%/g;
    this.screenComponentListElementSessionStoreStatus = /%%SESSIONSTORE%%/g;
    this.screenComponentListElementSessionShowStatus = /%%SESSIONSHOW%%/g;

    this.screenDynamics = "<tr>\n" +
        "<th scope=\"row\">%%NR1%%</th>\n" +
        " <td><select notranslate class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenDynamics_sourcecomponentlist_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScreenDynamicsSource(%%NR%%, this.value);\"></select>\n" +
        " </td>\n" +
        " <td><select notranslate class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenDynamics_sourcecomparison_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScreenDynamicsComparison(%%NR%%, this.value);\">"+
        "  <option value=\"==\">=</option>" +
        "  <option value=\"!=\">!=</option>" +
        "  <option value=\">\">&gt;</option>" +
        "  <option value=\"<\">&lt;</option>" +
        "  </select>\n" +
        " </td>\n" +
        " <td><input type=\"text\" class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenDynamics_sourcevalue_%%NR%%\"\n" +
        "  notranslate onkeyup=\"ITSInstance.newITSTestEditorController.changeScreenDynamicsSourceValue(%%NR%%, this.value);\">\n" +
        " </td>\n" +
        " <td><select notranslate class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenDynamics_targetcomponentlist_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScreenDynamicsTarget(%%NR%%, this.value);\"></select>\n" +
        " </td>\n" +
        " <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"checkbox\"\n" +
        "  class=\"form-check-input form-check-input-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenDynamics_visible_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScreenDynamicsTargetVisibility(%%NR%%, this.checked);\">\n" +
        " </td>\n" +
        " <td nowrap>\n" +
        "  <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "   onclick=\"ITSInstance.newITSTestEditorController.moveScreenDynamicsUp(%%NR%%);\">\n" +
        "   <i class=\"fa fa-xs fa-arrow-up\"></i></button>\n" +
        "  <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "   onclick=\"ITSInstance.newITSTestEditorController.moveScreenDynamicsDown(%%NR%%);\">\n" +
        "   <i class=\"fa fa-xs fa-arrow-down\"></i></button>\n" +
        "  <button type=\"button\" class=\"btn-xs btn-warning\"\n" +
        "   onclick=\"ITSInstance.newITSTestEditorController.removeScreenDynamics(%%NR%%);\">\n" +
        "   <i class=\"fa fa-xs fa-trash\"></i></button>\n" +
        "  </td>\n" +
        "</tr>";
    this.screenDynamicsID = /%%NR%%/g;
    this.screenDynamicsIDPlusOne = /%%NR1%%/g;

    this.scoreRule = "<tr>\n" +
        " <th scope=\"row\">%%NR1%%</th>\n" +
        " <td><select notranslate=\"\" class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenScales_sourcecomponentlist_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScaleScoreSource(%%NR%%, this.value);\"></select>\n" +
        " </td>\n" +
        " <td><input type=\"text\" class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenScales_sourcevalue_%%NR%%\"\n" +
        "  notranslate onkeyup=\"ITSInstance.newITSTestEditorController.changeScaleScoreSourceValue(%%NR%%, this.value);\">\n" +
        " </td>\n" +
        " <td><select notranslate=\"\" class=\"form-control form-control-sm\"\n" +
        "  id=\"AdminInterfaceTestTemplateEditorScreenScales_targetscalelist_%%NR%%\"\n" +
        "  notranslate onchange=\"ITSInstance.newITSTestEditorController.changeScaleTarget(%%NR%%, this.value);\"></select>\n" +
        " </td>\n" +
        " <td><input type=\"text\" class=\"form-control form-control-sm\" id=\"AdminInterfaceTestTemplateEditorScreenScales_targetscalescore_%%NR%%\" value title data-toggle=\"tooltip\" data-original-title=\"Enter a number (like 1 or -2) or %%QuestionValue%% to add the value returned by the question to the scale score. Please note that if the resulting value is NOT numeric that the value will be ignored when the target scales is numeric. If the target scales is textual then the resulting value will replace the scale value altogether.\"\n" +
        "  notranslate onkeyup=\"ITSInstance.newITSTestEditorController.changeScaleTargetScore(%%NR%%, this.value);\">\n" +
        " </td>\n" +
        " <td>\n" +
        " <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "  onclick=\"ITSInstance.newITSTestEditorController.moveScaleScoreUp(%%NR%%);\"><i\n" +
        "  class=\"fa fa-xs fa-arrow-up\"></i></button>\n" +
        " <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "  onclick=\"ITSInstance.newITSTestEditorController.moveScaleScoreDown(%%NR%%);\"><i\n" +
        "  class=\"fa fa-xs fa-arrow-down\"></i></button>\n" +
        " <button type=\"button\" class=\"btn-xs btn-warning\"\n" +
        "  onclick=\"ITSInstance.newITSTestEditorController.removeScaleScore(%%NR%%);\"><i\n" +
        "  class=\"fa fa-xs fa-trash\"></i></button>\n" +
        " </td>\n" +
        "</tr>";
    this.scoreRuleID = /%%NR%%/g;
    this.scoreRuleIDPlusOne = /%%NR1%%/g;

    this.normMatrixLinePart1 = "  <table notranslate=\"\" class=\"table table-sm\">\n" +
        "  <thead>\n" +
        "  <tr>\n" +
        "   <th colspan=4><label id='AdminInterfaceTestTemplateEditorNorm_ScaleHeader'>Scale</label> %%SCALEDESCRIPTION%%</th>\n" +
        "  </tr>\n" +
        "  <tr>\n" +
        "   <th scope=\"col\">#</th>\n" +
        "   <th id=\"AdminInterfaceTestTemplateEditorNorm_RawHeader\" scope=\"col\">Raw score</th>\n" +
        "   <th id=\"AdminInterfaceTestTemplateEditorNorm_NormHeader\" scope=\"col\">Norm value</th>\n" +
        "   <th id=\"AdminInterfaceTestTemplateEditorNorm_PercentileHeader\" scope=\"col\">Percentile value</th>\n" +
        "   <th scope=\"col\"></th>\n" +
        "  </tr>\n" +
        "  </thead>\n" +
        "  <tbody>\n";
    this.normMatrixLinePart2 = "  <tr>\n" +
        "   <th scope=\"row\">%%NR1%%</th>\n" +
        "   <td><input type=\"text\" class=\"form-control form-control-sm\"\n" +
        "    id=\"AdminInterfaceTestTemplateEditorNorm_RawCol_%%NR2%%\"\n" +
        "    notranslate onkeyup=\"%%NRCHECKSCALE%% ITSInstance.newITSTestEditorController.changeNormColumnRawValue('%%SCALEID%%','%%NR%%', this.value);\">\n" +
        "   </td>\n" +
        "   <td><input type=\"text\" class=\"form-control form-control-sm\"\n" +
        "    id=\"AdminInterfaceTestTemplateEditorNorm_ValCol_%%NR2%%\"\n" +
        "    notranslate onkeyup=\"%%NRCHECKNORM%% ITSInstance.newITSTestEditorController.changeNormColumnNormValue('%%SCALEID%%','%%NR%%', this.value);\">\n" +
        "   </td>\n" +
        "   <td><input type=\"text\" class=\"form-control form-control-sm\"\n" +
        "    id=\"AdminInterfaceTestTemplateEditorNorm_PercCol_%%NR2%%\"\n" +
        "    notranslate onkeyup=\" this.value = this.value.replace(/[^0-9.]/g,''); ITSInstance.newITSTestEditorController.changeNormColumnPercentileValue('%%SCALEID%%','%%NR%%', this.value);\">\n" +
        "   </td>\n" +
        "   <td nowrap>\n" +
        "   <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "    onclick=\"ITSInstance.newITSTestEditorController.moveNormColumnUp('%%SCALEID%%','%%NR%%');\">\n" +
        "    <i class=\"fa fa-xs fa-arrow-up\"></i></button>\n" +
        "   <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "    onclick=\"ITSInstance.newITSTestEditorController.moveNormColumnDown('%%SCALEID%%','%%NR%%');\">\n" +
        "    <i class=\"fa fa-xs fa-arrow-down\"></i></button>\n" +
        "   <button type=\"button\" class=\"btn-xs btn-warning\"\n" +
        "    onclick=\"ITSInstance.newITSTestEditorController.removeNormColumn('%%SCALEID%%','%%NR%%');\">\n" +
        "    <i class=\"fa fa-xs fa-trash\"></i></button>\n" +
        "   </td>\n" +
        "  </tr>\n";
    this.normMatrixLinePart3 = "</tbody></table>\n" +
        "  <button id=\"AdminInterfaceTestTemplateEditorAddNormColumnButton\" type=\"button\"\n" +
        "   class=\"btn-xs btn-success\"\n" +
        "   onclick=\"ITSInstance.newITSTestEditorController.addNewNormColumn('%%SCALEID%%');\"><i\n" +
        "   class=\"fa fa-fw fa-plus\"></i>Add new norm border value\n" +
        "  </button>";
    this.normMatrixLineCheckNumber = "this.value = this.value.replace(/[^0-9.]/g,''); ";
    this.normMatrixScaleID = /%%SCALEID%%/g;
    this.normMatrixScaleDescription = /%%SCALEDESCRIPTION%%/g;
    this.normMatrixNr = /%%NR%%/g;
    this.normMatrixNrPlusOne = /%%NR1%%/g;
    this.normMatrixNrPlusTwo = /%%NR2%%/g;
    this.normMatrixNrCheckScale = /%%NRCHECKSCALE%%/g;
    this.normMatrixNrCheckNorm = /%%NRCHECKNORM%%/g;

    this.fileUploadPart = "<tr>\n" +
        "    <th scope=\"row\">%%NR1%%</th>\n" +
        "    <td><input type=\"text\" class=\"form-control form-control-sm\" readonly value='%%FILENAME%%' \n" +
        "              notranslate  id=\"AdminInterfaceTestTemplateEditorMedia_FileNameCol%%NR%%\">\n" +
        "    </td>\n" +
        "    <td><input type=\"text\" class=\"form-control form-control-sm\" readonly value='%%FILELINK%%' \n" +
        "              notranslate  id=\"AdminInterfaceTestTemplateEditorMedia_LinkCol%%NR%%\">\n" +
        "    </td>\n" +
        "    <td nowrap>\n" +
        "        <button type=\"button\" class=\"btn-xs btn-warning\"\n" +
        "                onclick=\"ITSInstance.newITSTestEditorController.removeMediaFile('%%FILENAME%%',%%NR%%);\">\n" +
        "            <i class=\"fa fa-xs fa-trash\"></i></button>\n" +
        "        <button type=\"button\" class=\"btn-xs btn-success\"\n" +
        "               id=\"AdminInterfaceTestTemplateEditorMedia_FileNameButton%%NR%%\" \n" +
        "                onclick=\"saveFileLocallyFromURL('%%FILENAME%%','%%FILELINK%%');\">\n" +
        "            <i class=\"fa fa-xs fa-download\"></i></button>\n" +
        "    </td>\n" +
        "</tr>";
    this.catalogUploadPart = " <tr>\n" +
        "     <th scope=\"row\">%%NR1%%</th>\n" +
        "     <td><input type=\"text\"class=\"form-control form-control-sm\" readonly value='%%FILENAME%%'\n" +
        "               notranslate  id=\"AdminInterfaceTestTemplateEditorMedia_CatalogFileNameCol%%NR%%\">\n" +
        "     </td>\n" +
        "     <td><input type=\"text\"class=\"form-control form-control-sm\" readonly value='%%FILELINK%%'\n" +
        "               notranslate  id=\"AdminInterfaceTestTemplateEditorMedia_CatalogFileLinkCol%%NR%%\">\n" +
        "     </td>\n" +
        "     <td nowrap>\n" +
        "         <button type=\"button\"class=\"btn-xs btn-warning\"\n" +
        "                notranslate  onclick=\"ITSInstance.newITSTestEditorController.removeCatalogFile('%%FILENAME%%',%%NR%%);\">\n" +
        "             <i class=\"fa fa-xs fa-trash\"></i></button>\n" +
        "         <button type=\"button\"class=\"btn-xs btn-success\"\n" +
        "               id=\"AdminInterfaceTestTemplateEditorMedia_CatalogNameButton%%NR%%\" \n" +
        "               notranslate  onclick=\"saveFileLocallyFromURL('%%FILENAME%%','%%FILELINK%%');\">\n" +
        "             <i class=\"fa fa-xs fa-download\"></i></button>\n" +
        "     </td>\n" +
        " </tr>";
    this.fileUploadNr = /%%NR%%/g;
    this.fileUploadNrPlusOne = /%%NR1%%/g;
    this.fileUploadName = /%%FILENAME%%/g;
    this.fileUploadLink = /%%FILELINK%%/g;

    this.currentTest = {};
    this.currentTestIndex = -1;
    this.currentScreen = {};
    this.currentScreenIndex = -1;
    this.currentScreenComponent = {};
    this.currentScreenComponentIndex = -1;
    this.currentNorm = {};
    this.currentNormIndex = -1;
    this.currentTemplate = {};

    this.currentScale = null;
    this.currentScaleIndex = -1;

};

ITSTestTemplateEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('58b59ec0-8e9f-44e5-8cd3-babc4286bb48', 'Test template editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Define and edit tests.');

ITSTestTemplateEditor.prototype.afterOfficeLogin = function () {
    // load the available tests for this company. details of the test are loaded when the template is selected by the user
    ITSInstance.tests.loadAvailableTests(this.populateTests.bind(this), function () {
        ITSLogger.logMessage(logLevel.ERROR,'ITSTestTemplateEditor : Loading screen tests failed.');
    });
    ITSInstance.screenTemplates.loadAvailableScreenTemplates(this.loadTestScreenTemplates.bind(this), function () {
        ITSLogger.logMessage(logLevel.ERROR,'ITSTestTemplateEditor : Loading screen test templates failed.');
    });
};

// load the tests
ITSTestTemplateEditor.prototype.populateTests = function () {
    $('#AdminInterfaceTestTemplateEditorSelectListLoading').empty();
    $('#AdminInterfaceTestTemplateEditor-CopyFromSelect').empty();
    var newElement = "";
    var testType= getUrlParameterValue('TestType');
    for (var i = 0; i < ITSInstance.tests.testList.length; i++) {
        if ( (ITSInstance.tests.testList[i].dbsource == 0) && (ITSInstance.tests.testList[i].TestType == testType) ) {
            newElement = "<li value='" + i + "' onclick='ITSInstance.newITSTestEditorController.redirectToTestIndex(this.value);' > <i class='fa fa-fw fa-book-reader'></i>&nbsp;&nbsp;" + ITSInstance.tests.testList[i].testNameWithDBIndicator() + "</li>";
            $('#AdminInterfaceTestTemplateEditorSelectListLoading').append(newElement);
            newElement = "<option NoTranslate value='" + ITSInstance.tests.testList[i].ID + "'>" + ITSInstance.tests.testList[i].testNameWithDBIndicator() + "</option>";
            $('#AdminInterfaceTestTemplateEditor-CopyFromSelect').append(newElement);
            if (i == 0) {
                this.selectSourceTestForCopy(ITSInstance.tests.testList[i].ID);
            }
        }
    }
    this.loadTestScreenTemplates();
};

ITSTestTemplateEditor.prototype.redirectToTestIndex = function (testIndex) {
    this.currentTestIndex = testIndex;
    this.currentTest = ITSInstance.tests.testList[testIndex];
    if (this.currentTest.dbsource >= 1) {
        ITSInstance.UIController.showInfo("ITSTestTemplateEditor.centralTemplate", "Centrally managed tests cannot be edited.");
    } else {
        ITSRedirectPath(this.path, 'id=' + ITSInstance.tests.testList[testIndex].ID+"&TestType="+getUrlParameterValue('TestType'));
    }
};

ITSTestTemplateEditor.prototype.show = function () {
    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#AdminInterfaceTestTemplateEditor').show();
    this.showTab('AdminInterfaceTestTemplateEditor_TabTestInformation', 'AdminInterfaceTestTemplateEditorTabTestInformation');
    ITSInstance.UIController.initNavBar();

    $('#AdminInterfaceCourseTemplateEditorHeaderH4').hide();
    $('#AdminInterfaceTestTemplateEditorHeaderH4').hide();
    if (parseInt(getUrlParameterValue("TestType")) >= 1000) {
        $('#AdminInterfaceCourseTemplateEditorHeaderH4').show();
    } else {
        $('#AdminInterfaceTestTemplateEditorHeaderH4').show();
    }

    // load the available tests for this company. details of the test are loaded when the template is selected by the user
    if (!ITSInstance.tests.testListLoaded) {
        if (!ITSInstance.tests.currentlyLoading) {
            ITSInstance.tests.loadAvailableTests(this.populateTests.bind(this), function () {
                ITSLogger.logMessage(logLevel.ERROR,'ITSTestTemplateEditor : Loading screen tests failed.');
            });
            ITSInstance.screenTemplates.loadAvailableScreenTemplates(this.loadTestScreenTemplates.bind(this), function () {
                ITSLogger.logMessage(logLevel.ERROR,'ITSTestTemplateEditor : Loading screen test templates failed.');
            });
        }
        setTimeout(this.show.bind(this), 500);
    } else {
        var tempID = getUrlParameterValue('id');
        if (tempID && (tempID != "")) {
            this.switchToTestEditView();
            if (!this.templatesLoading) this.loadTestScreenTemplates();
            this.redirectUrl(tempID);
        } else {
            $('#AdminInterfaceTestTemplateEditorEdit').hide();
            $('#AdminInterfaceTestTemplateEditorSelect').show();
            this.populateTests();
        }
    }
};

ITSTestTemplateEditor.prototype.loadTest = function (testIndex) {
    // load all information on the current test into the screen
    this.currentTestIndex = testIndex;
    this.currentTest = ITSInstance.tests.testList[testIndex];
    if (!this.currentTest.detailsLoaded) {
        // load the test details first
        ITSInstance.UIController.showInterfaceAsWaitingOn(0);
        this.currentTest.loadTestDetailDefinition(this.loadCurrentTestOnScreen.bind(this),
            function () {
                ITSInstance.UIController.showInterfaceAsWaitingOff();
                ITSLogger.logMessage(logLevel.ERROR,'ITSTestTemplateEditor.loadTest : loading test detail information failed.');
                ITSInstance.UIController.showDialog("ITSTestTemplateEditorLoadTestError", "Test could not be loaded", "The test could not be loaded. Please close your browser and try again.",
                    [{btnCaption: "OK"}]);
            })
    } else {
        this.loadCurrentTestOnScreen();
    }
};

ITSTestTemplateEditor.prototype.loadCurrentTestOnScreen = function () {
    // load the current test information on the screen
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    this.switchToTestEditView();
    this.showTab('AdminInterfaceTestTemplateEditor_TabTestInformation', 'AdminInterfaceTestTemplateEditorTabTestInformation');
    this.processTestCapabilities();
};


ITSTestTemplateEditor.prototype.addNewTestDefinition = function () {
    this.currentTest = ITSInstance.tests.addNewTest();
    var newScale = new ITSTestScale(this.currentTest, ITSSession);
    newScale.scaleDescription = 'Score';
    this.currentTest.scales = [];
    this.currentTest.scales.push(newScale);
    this.currentTestIndex = ITSInstance.tests.testList.length - 1;
    this.currentTest.TestType = parseInt(getUrlParameterValue("TestType"));
    this.switchToTestEditView();
};

ITSTestTemplateEditor.prototype.switchToTestEditView = function () {
    // now switch to the tests screen
    $('#AdminInterfaceTestTemplateEditorHeader').hide();
    $('#AdminInterfaceTestTemplateEditorEdit').show();
    $('#AdminInterfaceTestTemplateEditorSelect').hide();
    this.showTab('AdminInterfaceTestTemplateEditor_TabTestInformation', 'AdminInterfaceTestTemplateEditorTabTestInformation');
};


ITSTestTemplateEditor.prototype.hide = function () {
    $('#AdminInterfaceTestTemplateEditor').hide();
};


ITSTestTemplateEditor.prototype.redirectUrl = function (tempID) {
    // try to find the tempID in the array and if found switch to editing that template
    for (var i = 0; i < ITSInstance.tests.testList.length; i++) {
        if (ITSInstance.tests.testList[i].ID == tempID) {
            this.loadTest(i);
            break;
        }
    }
    if (ITSInstance.tests.testList.length == 0) {
        setTimeout(this.redirectUrl.bind(this, tempID), 500);
    }
};

ITSTestTemplateEditor.prototype.processBackClick = function () {
    if (this.currentTest.saveToServerRequired()) {
        ITSInstance.UIController.showDialog("ITSTestTemplateEditorSaveTestRequired", "Save test", "You have not saved your changes. Would you like to save now?",
            [{
                btnCaption: "No",
                btnType: "btn-warning",
                btnOnClick: "ITSInstance.newITSTestEditorController.processBackClickNow();"
            },
                {
                    btnCaption: "Yes",
                    btnType: "btn-success",
                    btnOnClick: "ITSInstance.newITSTestEditorController.saveCurrentTest(); ITSInstance.newITSTestEditorController.processBackClickNow();"
                }]);
    } else {
        this.processBackClickNow();
    }
};

ITSTestTemplateEditor.prototype.processBackClickNow = function () {
    $('#AdminInterfaceTestTemplateEditorHeader').show();
    $('#AdminInterfaceTestTemplateEditorEdit').hide();
    $('#AdminInterfaceTestTemplateEditorSelect').show();
    window.history.back();
};

ITSTestTemplateEditor.prototype.showTab = function (id, tabID) {
    $('#AdminInterfaceTestTemplateEditorTabTestInformation').hide();
    $('#AdminInterfaceTestTemplateEditorTabScreens').hide();
    $('#AdminInterfaceTestTemplateEditorTabScoring').hide();
    $('#AdminInterfaceTestTemplateEditorTabNorms').hide();
    $('#AdminInterfaceTestTemplateEditorTabCatalog').hide();
    $('#AdminInterfaceTestTemplateEditorTabMedia').hide();
    $('#AdminInterfaceTestTemplateEditorTestCostsDiv').hide();
    $('#AdminInterfaceTestTemplateEditor_TabTestInformation').removeClass("text-info");
    $('#AdminInterfaceTestTemplateEditor_TabScreens').removeClass("text-info");
    $('#AdminInterfaceTestTemplateEditor_TabScoring').removeClass("text-info");
    $('#AdminInterfaceTestTemplateEditor_TabNorms').removeClass("text-info");
    $('#AdminInterfaceTestTemplateEditor_TabCatalog').removeClass("text-info");
    $('#AdminInterfaceTestTemplateEditor_TabMedia').removeClass("text-info");
    // class="text-info"
    $('#' + tabID).show();
    $('#' + id).addClass("text-info");

    switch (tabID) {
        case "AdminInterfaceTestTemplateEditorTabTestInformation" :
            this.fillTestInformationTab();
            this.processTestCapabilities();
            if (ITSInstance.users.currentUser.IsMasterUser) {
                $('#AdminInterfaceTestTemplateEditorTestCostsDiv').show();
            }
            break;
        case "AdminInterfaceTestTemplateEditorTabScreens" :
            ITSInstance.UIController.showInterfaceAsWaitingOn(-1);
            this.loadScreensListEmpty();
            setTimeout(this.fillScreenTab.bind(this),250);
            break;
        case "AdminInterfaceTestTemplateEditorTabScoring" :
            this.fillScoringTab();
            break;
        case "AdminInterfaceTestTemplateEditorTabNorms" :
            this.fillNormsTab();
            break;
        case "AdminInterfaceTestTemplateEditorTabCatalog" :
            this.fillCatalogTab();
            break;
        case "AdminInterfaceTestTemplateEditorTabMedia" :
            if (this.currentTest.newTest) {
                ITSInstance.UIController.showDialog("ITSTestTemplateEditorSaveRequiredMedia", "Saving the test is required", "To manage test media you need to save the test. The test will be saved now.",
                    [{btnCaption: "OK"}]);
                this.saveCurrentTest();
                this.fillMediaTab();
            } else {
                this.fillMediaTab();
            }
            break;
    }
};

// test information tab functions
ITSTestTemplateEditor.prototype.fillTestInformationTab = function () {
    DataBinderTo('AdminInterfaceTestTemplateEditorTabTestInformation', ITSInstance.newITSTestEditorController);
    this.fillLanguagesInEditor();
};

//////////////////////////////////////////////////////////////////////////// end of information functions

// screen tab functions
ITSTestTemplateEditor.prototype.fillScreenTab = function () {
    // check if there is at least one screen
    if (this.currentTest.screens.length == 0) { this.addNewScreen(); }

    this.loadScreensList();

    ITSInstance.UIController.showInterfaceAsWaitingOff();
};

ITSTestTemplateEditor.prototype.addNewScreen = function () {
    this.currentScreen = this.currentTest.addNewTestScreen();
    this.currentScreenIndex = this.currentTest.screens.length - 1;
    this.currentScreen.varName = ITSInstance.translator.getTranslatedString('TestTemplateEditor', 'screen', 'Screen') + (this.currentScreenIndex + 1);
    this.currentTest.makeTestScreenVarNamesUnique();
    this.loadScreensList();
    this.setCurrentScreenIndex(this.currentScreenIndex);
};

ITSTestTemplateEditor.prototype.loadScreensListEmpty = function () {
    $('#AdminInterfaceTestTemplateEditorScreenHeader').empty();
    $('#AdminInterfaceTestTemplateEditorScreenContentsHeader').empty();
    $('#AdminInterfaceTestTemplateEditorScreenVar').empty();
};

ITSTestTemplateEditor.prototype.loadScreensList = function () {
    this.loadScreensListEmpty();

    var newScreenElement = "";
    for (var i = 0; i < this.currentTest.screens.length; i++) {
        newScreenElement = this.screenListElement;
        newScreenElement = newScreenElement.replace(this.screenListElementID, i);
        newScreenElement = newScreenElement.replace(this.screenListElementTestID, this.currentTest.screens[i].varName);
        if ((this.currentTest.screens[i].UseLayoutsFromPreviousScreen) && (i > 0)) {
            newScreenElement = newScreenElement.replace(this.screenListElementAdditionalStyle, 'style="border-left: 4px dotted green;"');
        } else {
            newScreenElement = newScreenElement.replace(this.screenListElementAdditionalStyle, '');
        }
        $('#AdminInterfaceTestTemplateEditorScreenHeader').append(newScreenElement);
    }
    if ((this.currentScreenIndex < 0) || (this.currentScreenIndex >= this.currentTest.screens.length)) {
        this.setCurrentScreenIndex(0, true);
    } else {
        this.setCurrentScreenIndex(this.currentScreenIndex, true);
    }
};

ITSTestTemplateEditor.prototype.setCurrentScreenIndex = function (screenNum, testTemplateVarGeneration) {
    var templateIndex = -1;
    $('#AdminInterfaceTestTemplateEditorScreenContentButtons').hide();
    $('#AdminInterfaceTestTemplateEditorScreenDynamicsDiv').hide();

    if ((screenNum >= 0) && (screenNum < this.currentTest.screens.length)) {
        $('#AdminInterfaceTestTemplateEditorScreenContentButtons').show();
        if (this.currentTest.PluginData.testHasScreenDynamics) $('#AdminInterfaceTestTemplateEditorScreenDynamicsDiv').show();
        this.highlightScreen(screenNum);
        this.currentScreenIndex = screenNum;
        this.currentScreen = this.currentTest.screens[screenNum];
        $('#AdminInterfaceTestTemplateEditorScreenContentsHeader').empty();
        tinyMCE.get("AdminInterfaceTestTemplateEditorScreenExplanation").setContent(this.currentScreen.remarks);
        $('#AdminInterfaceTestTemplateEditor-uselayoutfromprevious').prop('checked', this.currentScreen.UseLayoutsFromPreviousScreen );
        var newScreenComponent = "";
        var template = {};
        if ((this.currentScreenComponentIndex < 0) || (this.currentScreenComponentIndex >= this.currentScreen.screenComponents.length)) {
            this.currentScreenComponentIndex = 0;
        }
        // load screen component list
        for (var i = 0; i < this.currentScreen.screenComponents.length; i++) {
            var x = this.currentScreen.screenComponents[i];
            newScreenComponent = this.screenComponentListElement;
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementID, i);
            // now generate the screen component with the default template values
            var newDivID = "ITSTestTemplateEditorQuestionComponent" + i;
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementPreviewID, '<div class="col-12 row" NoTranslate id="' + newDivID + '"></div>');
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementRowID, x.varComponentName);
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementPrivacyStatus, x.excludeFromAnonimisedTestResults ? "checked" : "")
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementSessionStoreStatus, x.storeAtSessionLevel ? "checked" : "")
            newScreenComponent = newScreenComponent.replace(this.screenComponentListElementSessionShowStatus, x.show ? "checked" : "")

            template = ITSInstance.screenTemplates.findTemplateById(ITSInstance.screenTemplates.screenTemplates, x.templateID);
            if (template >= 0) {
                template = ITSInstance.screenTemplates.screenTemplates[template];
                // generate_test_taking_view div, add_to_div, id, templatevalues, pnp_view
                $('#AdminInterfaceTestTemplateEditorScreenContentsHeader').append(newScreenComponent);
                template.generate_test_taking_view(newDivID, true, 'X' + i + 'Y', x.templateValues, false, true, 'TE', undefined, undefined, undefined, undefined, i);
                // and generate the template editor if this is the current screen component index
                if (testTemplateVarGeneration && (this.currentScreenComponentIndex == i)) {
                    this.generateCurrentScreenIndexTemplateVariables(i, x.templateValues, template);
                }
            }
        }
        // load dynamics
        this.fillScreenDynamicsTable();
    }
};

ITSTestTemplateEditor.prototype.generateCurrentScreenIndexTemplateVariables = function (screenComponentNum, templateValues, template, template_id) {
    $('#AdminInterfaceTestTemplateEditorScreenVar').empty();
    if (template_id) {
        template = ITSInstance.screenTemplates.findTemplateById(ITSInstance.screenTemplates.screenTemplates, template_id);
        if (template >= 0) {
            template = ITSInstance.screenTemplates.screenTemplates[template];
        }
    }
    if ((screenComponentNum >= 0) && (screenComponentNum < this.currentScreen.screenComponents.length)) {
        this.currentScreenComponentIndex = screenComponentNum;
        this.currentScreenComponent = this.currentScreen.screenComponents[screenComponentNum];
        var placeholderlist = this.currentScreen.generatePlaceholderOverviewFor(screenComponentNum, this.currentScreen.screenComponents);
        this.currentTemplate = template;
        this.highlightScreenComponent(screenComponentNum);
        // generate_test_editor_view div, id, templatevalues, pnp_template, on_change_function, on_add_element_function, on_delete_element_function
        $('#AdminInterfaceTestTemplateEditorScreenVarNameText').text('');
        if (template) {
            // show screen template description
            $('#AdminInterfaceTestTemplateEditorScreenVarNameText').text(this.currentTemplate.Description);
            template.generate_test_editor_view('AdminInterfaceTestTemplateEditorScreenVar', 'TE' + screenComponentNum + 'Y', templateValues, false,
                'ITSInstance.newITSTestEditorController.templateValueChanged();',
                'ITSInstance.newITSTestEditorController.templateAddElement();',
                'ITSInstance.newITSTestEditorController.templateDeleteElement();',
                placeholderlist, "ITSInstance.newITSTestEditorController.templatePlaceHolderChanged(this.value);",
                this.currentScreenComponent.placeholderName,
                this.currentTest,
                "ITSInstance.newITSTestEditorController.templatePlaceHolderCommand",
                this.currentScreenIndex);
            $('#AdminInterfaceTestTemplateEditorScreenVar').append('<small>' + this.currentScreenComponent.getColumnName() + '</small>');
        }
    }
};
ITSTestTemplateEditor.prototype.templatePlaceHolderChanged = function (newVal) {
    this.currentScreenComponent.placeholderName = newVal;
};
ITSTestTemplateEditor.prototype.templatePlaceHolderCommand = function (Command, value1, value2) {
    console.log(Command, value1, value2);
    if (Command == "DELETE") {
        ITSInstance.newITSTestEditorController.currentTemplate.deleteElement(value1, ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues);
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == "UP") {
        ITSInstance.newITSTestEditorController.currentTemplate.swap(value1,value1-1,ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues);
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == "DOWN") {
        ITSInstance.newITSTestEditorController.currentTemplate.swap(value1,value1+1,ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues);
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == 'ACTIONCHANGED') {
        ITSInstance.newITSTestEditorController.templateValueChangedProcess();
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
    }
    if (Command == 'ACTIONADD') {
        ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1].ActionCounter++;
        ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1]['Action'+ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1].ActionCounter] = {};
        for (var i=ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1].ActionCounter-1; i > value2; i--) {
            swapInObject(i+1, i, 'Action', ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1]);
        }
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == 'ACTIONDELETE') {
        for (var i=value2; i <= ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1].ActionCounter; i++) {
            swapInObject(i, i+1, 'Action', ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1]);
        }
        ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1].ActionCounter--;
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == 'ACTIONDOWN') {
        swapInObject(value2, value2+1, 'Action', ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1]);
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
    if (Command == 'ACTIONUP') {
        swapInObject(value2, value2-1, 'Action', ITSInstance.newITSTestEditorController.currentScreenComponent.templateValues[value1]);
        ITSInstance.newITSTestEditorController.editScreenComponentDescription(ITSInstance.newITSTestEditorController.currentScreenComponentIndex, ITSInstance.newITSTestEditorController.currentScreenComponent.varComponentName);
        ITSInstance.newITSTestEditorController.templateValueChanged();
    }
};

ITSTestTemplateEditor.prototype.templateValueChanged = function () {
    if (!this.nextTemplateValueChangedRefresh) this.nextTemplateValueChangedRefresh = new Date();
    //var dateNow = new Date();
    //if ((dateNow.getTime() - this.nextTemplateValueChangedRefresh.getTime()) > 1000) {
        this.nextTemplateValueChangedRefresh = new Date();
        setTimeout(this.templateValueChangedProcessTimed, 501);
    //}
};

// this procedure does not required this but works on ITSInstance directly to avoid caching problems and memory shortage
ITSTestTemplateEditor.prototype.templateValueChangedProcessTimed = function () {
    var dateNow = new Date();
    if ((Math.abs(dateNow.getTime() - ITSInstance.newITSTestEditorController.nextTemplateValueChangedRefresh.getTime()) ) > 500) {
        ITSInstance.newITSTestEditorController.nextTemplateValueChangedRefresh = new Date();
        ITSInstance.newITSTestEditorController.templateValueChangedProcess();
    }
};

ITSTestTemplateEditor.prototype.templateValueChangedProcess = function () {
    var oldValues = this.currentScreenComponent.templateValues;
    this.currentScreenComponent.templateValues = this.currentTemplate.extract_test_editor_view_templatevalues("AdminInterfaceTestTemplateEditorScreenVar", "", false);
    if (oldValues != this.currentScreenComponent.templateValues) {
        //this.generateCurrentScreenIndexTemplateVariables(this.currentScreenComponentIndex, this.currentScreenComponent.templateValues, undefined, this.currentScreenComponent.templateID);
        this.setCurrentScreenIndex(this.currentScreenIndex, false);
        this.highlightScreenComponent(this.currentScreenComponentIndex);
    }
};

ITSTestTemplateEditor.prototype.templateAddElement = function () {
    this.currentScreenComponent.templateValues.RepeatBlockCount = this.currentScreenComponent.templateValues.RepeatBlockCount + 1;
    var x = this.currentScreenComponentIndex;
    this.currentScreenComponentIndex = -1;
    this.focusOnScreenComponent(x);
};

ITSTestTemplateEditor.prototype.templateDeleteElement = function () {
    this.currentScreenComponent.templateValues.RepeatBlockCount = this.currentScreenComponent.templateValues.RepeatBlockCount - 1;
    var x = this.currentScreenComponentIndex;
    this.currentScreenComponentIndex = -1;
    this.focusOnScreenComponent(x);
};

ITSTestTemplateEditor.prototype.focusOnScreen = function (index) {
    $('#AdminInterfaceTestTemplateEditorScreenVar').empty();
    this.setCurrentScreenIndex(index, true);
};

ITSTestTemplateEditor.prototype.highlightScreen = function (index) {
    for (var i = 0; i < this.currentTest.screens.length; i++) {
        //$('#TestTemplateEditorSCREEN' + i).removeClass("bg-light");
        $('#AdminInterfaceTestTemplateEditorScreenList' + i).removeClass("bg-secondary");
    }
    //$('#TestTemplateEditorSCREEN' + index).addClass("bg-light");
    $('#AdminInterfaceTestTemplateEditorScreenList' + index).addClass("bg-secondary");
};


ITSTestTemplateEditor.prototype.focusOnScreenComponent = function (index) {
    if (this.currentScreenComponentIndex != index) {
        this.generateCurrentScreenIndexTemplateVariables(index,
            this.currentScreen.screenComponents[index].templateValues, undefined,
            this.currentScreen.screenComponents[index].templateID);
    }
};

ITSTestTemplateEditor.prototype.highlightScreenComponent = function (index) {
    // bg-light bg-secondary
    for (var i = 0; i < this.currentScreen.screenComponents.length; i++) {
        $('#AdminInterfaceTestTemplateEditorScreenContents' + i).removeClass("bg-light");
        $('#AdminInterfaceTestTemplateEditorScreenContentsPreview' + i).removeClass("bg-light");
    }
    $('#AdminInterfaceTestTemplateEditorScreenContents' + index).addClass("bg-light");
    $('#AdminInterfaceTestTemplateEditorScreenContentsPreview' + index).addClass("bg-light");
};

ITSTestTemplateEditor.prototype.editScreenDescription = function (id, newText) {
    this.currentTest.screens[id].varName = newText.replace(/\W/g, '');
    $('#TestTemplateEditorSCREEN' + id).val(this.currentTest.screens[id].varName);
};

ITSTestTemplateEditor.prototype.editScreenComponentDescription = function (id, newText) {
    this.currentScreen.screenComponents[id].varComponentName = newText.replace(/\W/g, '');
    $('#TestTemplateEditorSCREENCOMPONENT' + id).val(this.currentScreen.screenComponents[id].varComponentName);
    this.generateCurrentScreenIndexTemplateVariables(this.currentScreenComponentIndex,
        this.currentScreenComponent.templateValues, undefined,
        this.currentScreenComponent.templateID);
};

ITSTestTemplateEditor.prototype.editScreenComponent = function (id) {
    this.focusOnScreenComponent(id);
};

ITSTestTemplateEditor.prototype.addScreenTemplate = function (templateID) {
    var newTemplate = ITSInstance.screenTemplates.findTemplateById(ITSInstance.screenTemplates.screenTemplates, templateID);
    if (newTemplate >= 0) {
        newTemplate = ITSInstance.screenTemplates.screenTemplates[newTemplate];
        if (newTemplate.detailsLoaded) {
            this.addNewScreenTemplate(templateID);
        } else {
            newTemplate.loadDetailDefinition(this.addNewScreenTemplate.bind(this, templateID), function () {
                alert.log('ITSTestTemplateEditor : failed to load screen template');
            })
        }
    }
};

ITSTestTemplateEditor.prototype.addNewScreenTemplate = function (templateID) {
    var newComp = this.currentScreen.newTestScreenComponent();
    newComp.templateID = templateID;
    newComp.varComponentName = ITSInstance.translator.getTranslatedString('TestTemplateEditor', 'varName', 'ScreenComponent') + this.currentScreen.screenComponents.length;
    this.setCurrentScreenIndex(this.currentScreenIndex, false);
    this.currentScreenComponentIndex = this.currentScreen.screenComponents.length - 1;
    this.currentScreenComponent = this.currentScreen.screenComponents[this.currentScreenComponentIndex];
    this.generateCurrentScreenIndexTemplateVariables(this.currentScreenComponentIndex, this.currentScreenComponent.templateValues, undefined, this.currentScreenComponent.templateID);
};

ITSTestTemplateEditor.prototype.loadTestScreenTemplates = function () {
    var me= ITSInstance.newITSTestEditorController;
    //console.log(me);
    $('#AdminInterfaceTestTemplateEditorAddScreenComponentListDiv').empty();
    // check if all templates are fully loaded. we need me to get at the plugindata
    me.templatesLoading = false;
    for (var i = 0; i < ITSInstance.screenTemplates.screenTemplates.length; i++) {
        if (!ITSInstance.screenTemplates.screenTemplates[i].detailsLoaded) {
            if (!ITSInstance.screenTemplates.screenTemplates[i].currentlyLoading) {
                ITSInstance.screenTemplates.screenTemplates[i].loadDetailDefinition(me.loadTestScreenTemplates.bind(me),
                    function () {
                        ITSInstance.UIController.showError('TestTemplateEditor.ScreenTemplateLoadFailure', 'A test screen template could not be loaded. Please save the test and refresh your browser screen. ');
                    });
            }
            me.templatesLoading = true;
        }
    }
    if (me.templatesLoading) return;
    // generate the list
    for (var i = 0; i < ITSInstance.screenTemplates.screenTemplates.length; i++) {
        if ((ITSInstance.screenTemplates.screenTemplates[i].PluginData.LegacyTemplate) && (!$('#AdminInterfaceTestTemplateEditorAddScreenComponent-legacy').is(':checked')) ) {
            // do nothing for legacy templates
        } else {
            $('<button notranslate onmouseenter="$(this).popover(\'show\');" onmouseleave="$(this).popover(\'hide\');" id="'+ i + '-' + ITSInstance.screenTemplates.screenTemplates[i].ID +
                '" type="button" notranslate class="btn btn-outline-success" data-html="true" title=" " onclick=\"ITSInstance.newITSTestEditorController.addScreenTemplate(\'' +
                ITSInstance.screenTemplates.screenTemplates[i].ID +
                '\');\"><i class="fa fa-fw fa-plus"></i><span>' +
                ITSInstance.screenTemplates.screenTemplates[i].descriptionWithDBIndicator() +
                '</span></button>').appendTo('#AdminInterfaceTestTemplateEditorAddScreenComponentListDiv');
            //$('<i class="fa fa-fw fa-info-circle" onclick=" ITSInstance.UIController.showInfo(\'ScreenTemplate.\' + ITSInstance.screenTemplates.screenTemplates['+i+'].ID + \'.explanation\', ITSInstance.screenTemplates.screenTemplates['+i+'].Explanation) "></i>').appendTo('#AdminInterfaceTestTemplateEditorAddScreenComponentListDiv');
            if (ITSInstance.screenTemplates.screenTemplates[i].Explanation != '') {
                $('<i class="fa fa-fw fa-info-circle" onclick=" ITSInstance.UIController.showInfo(\'\', ITSInstance.screenTemplates.screenTemplates[' + i + '].Explanation) "></i>').appendTo('#AdminInterfaceTestTemplateEditorAddScreenComponentListDiv');
            }
        }
    }
    // now set the tooltip texts
    for (var i = 0; i < ITSInstance.screenTemplates.screenTemplates.length; i++) {
        try {
            $('#' + i + '-' + ITSInstance.screenTemplates.screenTemplates[i].ID).prop('title',ITSInstance.screenTemplates.screenTemplates[i].Explanation);
        } catch (e) { }
    }
};

ITSTestTemplateEditor.prototype.deleteScreen = function (screenId) {
    this.currentTest.screens.splice(screenId, 1);
    this.loadScreensList();
    if (screenId > 0) {
        this.setCurrentScreenIndex(screenID - 1);
    } else {
        this.setCurrentScreenIndex(0);
    }
};

ITSTestTemplateEditor.prototype.deleteScreenComponent = function (screenComponentId) {
    this.currentScreen.screenComponents.splice(screenComponentId, 1);
    this.setCurrentScreenIndex(this.currentScreenIndex, true);
};

ITSTestTemplateEditor.prototype.moveScreenUp = function (screenId) {
    if (screenId > 0) {
        var x = this.currentTest.screens[screenId];
        var y = this.currentTest.screens[screenId - 1];
        this.currentTest.screens[screenId] = y;
        this.currentTest.screens[screenId - 1] = x;
    }
    this.loadScreensList();
    this.setCurrentScreenIndex(screenId);
};

ITSTestTemplateEditor.prototype.moveScreenDown = function (screenId) {
    if (screenId < (this.currentTest.screens.length - 1)) {
        var x = this.currentTest.screens[screenId];
        var y = this.currentTest.screens[screenId + 1];
        this.currentTest.screens[screenId] = y;
        this.currentTest.screens[screenId + 1] = x;
    }
    this.loadScreensList();
    this.setCurrentScreenIndex(screenId);
};

ITSTestTemplateEditor.prototype.moveScreenComponentUp = function (screenComponentId) {
    if (screenComponentId > 0) {
        var x = this.currentScreen.screenComponents[screenComponentId];
        var y = this.currentScreen.screenComponents[screenComponentId - 1];
        this.currentScreen.screenComponents[screenComponentId] = y;
        this.currentScreen.screenComponents[screenComponentId - 1] = x;
    }
    this.setCurrentScreenIndex(this.currentScreenIndex, true);
};

ITSTestTemplateEditor.prototype.moveScreenComponentDown = function (screenComponentId) {
    if (screenComponentId < (this.currentScreen.screenComponents.length - 1)) {
        var x = this.currentScreen.screenComponents[screenComponentId + 1];
        var y = this.currentScreen.screenComponents[screenComponentId];
        this.currentScreen.screenComponents[screenComponentId + 1] = y;
        this.currentScreen.screenComponents[screenComponentId] = x;
    }
    this.setCurrentScreenIndex(this.currentScreenIndex, true);
};

ITSTestTemplateEditor.prototype.copyScreenComponent = function (screenComponentId) {
    if (screenComponentId < (this.currentScreen.screenComponents.length - 1)) {
        this.currentScreen.copyScreenComponentToNewScreenComponent(screenComponentId,screenComponentId);
    }
    this.setCurrentScreenIndex(this.currentScreenIndex, true);
};

ITSTestTemplateEditor.prototype.copyToNewScreen = function (sourceIndex) {
    if (!sourceIndex) {
        this.currentTest.copyTestScreen(this.currentScreenIndex, this.currentScreenIndex);
    } else {
        this.currentTest.copyTestScreen(sourceIndex, sourceIndex);
    }
    this.loadScreensList();
    this.setCurrentScreenIndex(this.currentScreenIndex + 1);
};

ITSTestTemplateEditor.prototype.fillScreenDynamicsTable = function () {
    // build the list of options
    var optionList = "";
    var optionListTarget = "";
    var newVal = "";
    for (var i = 0; i < this.currentTest.screens.length; i++) {
        for (var j = -1; j < this.currentTest.screens[i].screenComponents.length; j++) {
            if (j == -1) {
                newVal = "<option value ='" + this.currentTest.screens[i].id + "'>" +
                    this.currentTest.screens[i].varName +
                    "</option>";
                optionListTarget = optionListTarget + newVal;
            }
            else {
                newVal = "<option value ='" + this.currentTest.screens[i].id + "." + this.currentTest.screens[i].screenComponents[j].id + "'>" +
                    this.currentTest.screens[i].varName + "." + this.currentTest.screens[i].screenComponents[j].varComponentName +
                    "</option>";
                optionList = optionList + newVal;
                optionListTarget = optionListTarget + newVal;
            }
        }
    }
    // go through all screens and their variables and add them to the table lines
    $('#AdminInterfaceTestTemplateEditorScreenDynamics_tbody').empty();
    for (var i = 0; i < this.currentScreen.screenDynamics.length; i++) {
        var tempSD = this.currentScreen.screenDynamics[i];
        var tempSDSourceScreen = this.currentScreen;
        var tempSDSourceComponent = null;
        var tempSDTargetScreen = this.currentScreen;
        var tempSDTargetComponent = null;
        // validate if all information is still valid, otherwise this line should be removed and not shown
        if (tempSD.sourceScreenID != this.currentScreen.id) {
            tempSDSourceScreen = this.currentTest.findScreenByID(tempSD.sourceScreenID);
        }
        if (tempSD.targetScreenID != this.currentScreen.id) {
            tempSDTargetScreen = this.currentTest.findScreenByID(tempSD.targetScreenID);
        }
        if (tempSDSourceScreen != null) {
            tempSDSourceComponent = tempSDSourceScreen.findComponentByID(tempSD.sourceVariableID);
        }
        if (tempSDTargetScreen != null) {
            if (tempSD.targetVariableID != "") {
                tempSDTargetComponent = tempSDTargetScreen.findComponentByID(tempSD.targetVariableID);
            } else {
                tempSDTargetComponent = "";
            }
        }
        // check for line removal
        if ((tempSDSourceScreen == null) || (tempSDTargetScreen == null) || (tempSDSourceComponent == null) || (tempSDTargetComponent == null)) {
            this.currentScreen.screenDynamics.splice(i, 1);
            this.fillScreenDynamicsTable();
            return;
        }
        // now generate the line
        var newScreenElement = this.screenDynamics;
        newScreenElement = newScreenElement.replace(this.screenDynamicsID, i);
        newScreenElement = newScreenElement.replace(this.screenDynamicsIDPlusOne, i + 1);

        $('#AdminInterfaceTestTemplateEditorScreenDynamics_tbody').append(newScreenElement);
        // fill the values
        $('#AdminInterfaceTestTemplateEditorScreenDynamics_sourcevalue_' + i)[0].value = tempSD.sourceValue;
        $('#AdminInterfaceTestTemplateEditorScreenDynamics_visible_' + i)[0].checked = tempSD.targetVisible;
        $('#AdminInterfaceTestTemplateEditorScreenDynamics_sourcecomparison_' + i).val(tempSD.comparison);

        var listID = "'" + tempSDSourceScreen.id + '.' + tempSDSourceComponent.id + "'";
        $('#AdminInterfaceTestTemplateEditorScreenDynamics_sourcecomponentlist_' + i)[0].innerHTML = optionList.replace(listID, listID + ' selected ');
        if (typeof tempSDTargetComponent.id != "undefined") {
            var listID = "'" + tempSDTargetScreen.id + '.' + tempSDTargetComponent.id + "'";
        } else {
            var listID = "'" + tempSDTargetScreen.id + "'" ;
        }
        $('#AdminInterfaceTestTemplateEditorScreenDynamics_targetcomponentlist_' + i)[0].innerHTML = optionListTarget.replace(listID, listID + ' selected ');
    }

    // finally bind the scripts
    DataBinderTo('AdminInterfaceTestTemplateEditorTabScreens', ITSInstance.newITSTestEditorController);
};


ITSTestTemplateEditor.prototype.newScreenDynamicsRule = function () {
    if (this.currentScreen.screenComponents.length > 1) {
        var newRule = this.currentScreen.newTestDynamicsRule();
        newRule.sourceScreenID = this.currentScreen.id;
        newRule.targetScreenID = this.currentScreen.id;
        newRule.sourceVariableID = this.currentScreen.screenComponents[0].id;
        newRule.targetVariableID = this.currentScreen.screenComponents[1].id;
        newRule.targetVisible = true;
        newRule.sourceValue = "-";
        this.fillScreenDynamicsTable();
    }
};

ITSTestTemplateEditor.prototype.changeScreenDynamicsSource = function (nr, newIndex) {
    var newScreenID = newIndex.split('.')[0];
    var newVarID = newIndex.split('.')[1];
    this.currentScreen.screenDynamics[nr].sourceScreenID = newScreenID;
    this.currentScreen.screenDynamics[nr].sourceVariableID = newVarID;
};

ITSTestTemplateEditor.prototype.changeScreenDynamicsSourceValue = function (nr, newVal) {
    this.currentScreen.screenDynamics[nr].sourceValue = newVal;
};

ITSTestTemplateEditor.prototype.changeScreenDynamicsComparison = function (nr, newVal) {
    this.currentScreen.screenDynamics[nr].comparison = newVal;
};

ITSTestTemplateEditor.prototype.changeScreenDynamicsTarget = function (nr, newIndex) {
    var newScreenID = newIndex.split('.')[0];
    var newVarID = newIndex.split('.')[1];
    this.currentScreen.screenDynamics[nr].targetScreenID = newScreenID;
    this.currentScreen.screenDynamics[nr].targetVariableID = "";
    if (typeof newVarID != "undefined") {
        this.currentScreen.screenDynamics[nr].targetVariableID = newVarID;
    }
};


ITSTestTemplateEditor.prototype.changeScreenDynamicsTargetVisibility = function (nr, newVal) {
    this.currentScreen.screenDynamics[nr].targetVisible = newVal;
};


ITSTestTemplateEditor.prototype.moveScreenDynamicsUp = function (nr) {
    if (nr > 0) {
        var newNr = nr - 1;
        toMove = this.currentScreen.screenDynamics[nr];
        toReplace = this.currentScreen.screenDynamics[nr - 1];
        this.currentScreen.screenDynamics[nr] = toReplace;
        this.currentScreen.screenDynamics[nr - 1] = toMove;
        this.fillScreenDynamicsTable();
    }
};

ITSTestTemplateEditor.prototype.moveScreenDynamicsDown = function (nr) {
    if (nr < this.currentScreen.screenDynamics.length - 1) {
        var newNr = nr - 1;
        toMove = this.currentScreen.screenDynamics[nr + 1];
        toReplace = this.currentScreen.screenDynamics[nr];
        this.currentScreen.screenDynamics[nr + 1] = toReplace;
        this.currentScreen.screenDynamics[nr] = toMove;
        this.fillScreenDynamicsTable();
    }
};

ITSTestTemplateEditor.prototype.removeScreenDynamics = function (nr) {
    this.currentScreen.screenDynamics.splice(nr, 1);
    this.fillScreenDynamicsTable();
};

ITSTestTemplateEditor.prototype.changeScreenComponentPrivacy = function (nr, value) {
    this.currentScreen.screenComponents[nr].excludeFromAnonimisedTestResults = value;
};

ITSTestTemplateEditor.prototype.changeScreenComponentSessionStore = function (nr, value) {
    this.currentScreen.screenComponents[nr].storeAtSessionLevel = value;
};

ITSTestTemplateEditor.prototype.changeScreenComponentShow = function (nr, value) {
    this.currentScreen.screenComponents[nr].show = value;
};

//////////////////////////////////////////////////////////////////////////// end of screen functions

ITSTestTemplateEditor.prototype.fillScoringTab = function () {
    $('#AdminInterfaceTestTemplateEditorScaleDiv :input').attr('disabled', this.currentTest.scales.length == 0);
    $('#AdminInterfaceTestTemplateEditor-ScaleSelect').attr('disabled', this.currentTest.scales.length == 0);
    tinymce.get('AdminInterfaceTestTemplateEditorScaleExplanation').getBody().setAttribute('contenteditable', this.currentTest.scales.length > 0);

    if (this.currentTest.scales.length > 0) {
        if (this.currentScale == null) {
            this.currentScale = this.currentTest.scales[0];
            this.currentScaleIndex = 0;
        }

        // populate scales
        $('#AdminInterfaceTestTemplateEditor-ScaleSelect').empty();
        for (var i = 0; i < this.currentTest.scales.length; i++) {
            var selectStr = (this.currentScaleIndex == i) ? " selected " : "";
            var tempStr = "<option value='" + this.currentTest.scales[i].id + "'" + selectStr + ">" + this.currentTest.scales[i].scaleDescription + "</option>"
            $('#AdminInterfaceTestTemplateEditor-ScaleSelect').append(tempStr);
        }

        DataBinderTo('AdminInterfaceTestTemplateEditorTabScoring', ITSInstance.newITSTestEditorController);
    } else {
        this.currentScale = null;

        $('#AdminInterfaceTestTemplateEditor-ScaleSelect').empty();
        var tempObj = {};
        tempObj.currentScale = new ITSTestScale();
        DataBinderTo('AdminInterfaceTestTemplateEditorTabScoring', tempObj);
    }

    // load the score matrix
    this.loadScoringMatrix();
};


ITSTestTemplateEditor.prototype.addNewScale = function () {
    this.currentTest.addNewScale();
    this.currentScaleIndex = this.currentTest.scales.length - 1;
    this.currentScale = this.currentTest.scales[this.currentScaleIndex];
    this.fillScoringTab();
};

ITSTestTemplateEditor.prototype.removeScale = function () {
    this.currentTest.scales.splice(this.currentScaleIndex, 1);
    this.currentScale = null;
    this.fillScoringTab();
};

ITSTestTemplateEditor.prototype.showScaleInEditor = function (newIndex) {
    this.currentScaleIndex = newIndex;
    this.currentScale = this.currentTest.scales[this.currentScaleIndex];
    this.fillScoringTab();
};

ITSTestTemplateEditor.prototype.loadScoringMatrix = function () {
    // build the list of options
    var optionList = "";
    for (var i = 0; i < this.currentTest.screens.length; i++) {
        for (var j = 0; j < this.currentTest.screens[i].screenComponents.length; j++) {
            optionList = optionList + "<option value ='" + this.currentTest.screens[i].id + "." + this.currentTest.screens[i].screenComponents[j].id + "'>" +
                this.currentTest.screens[i].varName + "." + this.currentTest.screens[i].screenComponents[j].varComponentName +
                "</option>";
        }
    }

    // build the list of options for scales
    var optionListScales = "";
    for (var i = 0; i < this.currentTest.scales.length; i++) {
        optionListScales = optionListScales + "<option value ='" + this.currentTest.scales[i].id + "'>" +
            this.currentTest.scales[i].scaleDescription +
            "</option>";
    }

    $('#AdminInterfaceTestTemplateEditorTabScalesScoreTable_tbody').empty();
    for (var i = 0; i < this.currentTest.scoreRules.length; i++) {
        var tempSD = this.currentTest.scoreRules[i];
        var tempSDSourceScreen = tempSD.SourceScreenID;
        var tempSDSourceComponent = tempSD.SourceQuestionID;
        var tempSDTargetScale = tempSD.TargetScale;
        // validate if all information is still valid, otherwise this line should be removed and not shown
        if (tempSD.SourceScreenID != this.currentScreen.id) {
            tempSDSourceScreen = this.currentTest.findScreenByID(tempSD.SourceScreenID);
            if (tempSDSourceScreen != null) {
                tempSDSourceScreen = tempSDSourceScreen.id;
            }
        }
        if (tempSD.TargetScale != this.currentScale.id) {
            tempSDTargetScale = this.currentTest.findScaleByID(tempSD.TargetScale);
            if (tempSDTargetScale != null) {
                tempSDTargetScale = tempSDTargetScale.id;
            }
        }
        if (tempSDSourceScreen != null) {
            tempSDSourceComponent = this.currentTest.findScreenByID(tempSDSourceScreen).findComponentByID(tempSDSourceComponent);
            if (tempSDSourceComponent != null) {
                tempSDSourceComponent = tempSDSourceComponent.id;
            }
        }
        if ((tempSDSourceScreen != null) && (tempSDSourceComponent == null) && (this.currentTest.findScreenByID(tempSDSourceScreen).screenComponents.length > 0)) {
            tempSDSourceComponent = this.currentTest.findScreenByID(tempSDSourceScreen).screenComponents[0];
        }

        // check for line removal
        if ((tempSDSourceScreen == null) || (tempSDTargetScale == null) || (tempSDSourceComponent == null)) {
            this.currentTest.scoreRules.splice(i, 1);
            this.loadScoringMatrix();
            return;
        }
        // now generate the line
        var newScreenElement = this.scoreRule;
        newScreenElement = newScreenElement.replace(this.scoreRuleID, i);
        newScreenElement = newScreenElement.replace(this.scoreRuleIDPlusOne, i + 1);

        $('#AdminInterfaceTestTemplateEditorTabScalesScoreTable_tbody').append(newScreenElement);
        // fill the values
        $('#AdminInterfaceTestTemplateEditorScreenScales_sourcevalue_' + i)[0].value = tempSD.SourceValue;
        $('#AdminInterfaceTestTemplateEditorScreenScales_targetscalescore_' + i)[0].value = tempSD.TargetScaleValue;

        var listID = "'" + tempSDSourceScreen + '.' + tempSDSourceComponent + "'";
        $('#AdminInterfaceTestTemplateEditorScreenScales_sourcecomponentlist_' + i)[0].innerHTML = optionList.replace(listID, listID + ' selected ');
        var listID = "'" + tempSDTargetScale + "'";
        $('#AdminInterfaceTestTemplateEditorScreenScales_targetscalelist_' + i)[0].innerHTML = optionListScales.replace(listID, listID + ' selected ');
    }
};

ITSTestTemplateEditor.prototype.addNewScaleScoreMatrix = function () {
    if ((this.currentTest.screens.length > 0) && (this.currentTest.scales.length > 0)) {
        var tempRule = this.currentTest.addNewScoreRule();

        tempRule.SourceScreenID = this.currentTest.screens[0].id;
        tempRule.SourceQuestionID = this.currentTest.screens[0].screenComponents[0].id;
        tempRule.TargetScale = this.currentTest.scales[0].id;

        this.loadScoringMatrix();
    }
};

ITSTestTemplateEditor.prototype.changeScaleScoreSource = function (scoreRuleNr, newQuestion) {
    this.currentTest.scoreRules[scoreRuleNr].SourceScreenID = newQuestion.split(".")[0];
    this.currentTest.scoreRules[scoreRuleNr].SourceQuestionID = newQuestion.split(".")[1];

};

ITSTestTemplateEditor.prototype.changeScaleScoreSourceValue = function (scoreRuleNr, newValue) {
    this.currentTest.scoreRules[scoreRuleNr].SourceValue = newValue;
};

ITSTestTemplateEditor.prototype.changeScaleTarget = function (scoreRuleNr, newScale) {
    this.currentTest.scoreRules[scoreRuleNr].TargetScale = newScale;
};

ITSTestTemplateEditor.prototype.changeScaleTargetScore = function (scoreRuleNr, newScore) {
    this.currentTest.scoreRules[scoreRuleNr].TargetScaleValue = newScore;
};

ITSTestTemplateEditor.prototype.moveScaleScoreUp = function (nr) {
    if (nr > 0) {
        var newNr = nr - 1;
        var toMove = this.currentTest.scoreRules[nr];
        var toReplace = this.currentTest.scoreRules[nr - 1];
        this.currentTest.scoreRules[nr] = toReplace;
        this.currentTest.scoreRules[nr - 1] = toMove;
        this.loadScoringMatrix();
    }
};

ITSTestTemplateEditor.prototype.moveScaleScoreDown = function (nr) {
    if (nr < this.currentTest.scoreRules.length - 1) {
        var newNr = nr - 1;
        var toMove = this.currentTest.scoreRules[nr + 1];
        var toReplace = this.currentTest.scoreRules[nr];
        this.currentTest.scoreRules[nr + 1] = toReplace;
        this.currentTest.scoreRules[nr] = toMove;
        this.loadScoringMatrix();
    }
};

ITSTestTemplateEditor.prototype.removeScaleScore = function (nr) {
    this.currentTest.scoreRules.splice(nr, 1);
    this.loadScoringMatrix();
};

//////////////////////////////////////////////////////////////////////////// end of score functions

ITSTestTemplateEditor.prototype.fillNormsTab = function () {
    $('#AdminInterfaceTestTemplateEditorNormDiv :input').attr('disabled', this.currentTest.norms.length == 0);
    $('#AdminInterfaceTestTemplateEditor-NormSelect').attr('disabled', this.currentTest.norms.length == 0);
    tinymce.get('AdminInterfaceTestTemplateEditorNormExplanation').getBody().setAttribute('contenteditable', this.currentTest.norms.length > 0);

    if (this.currentTest.norms.length > 0) {
        if (this.currentNormIndex < 0) {
            this.currentNorm = this.currentTest.norms[0];
            this.currentNormIndex = 0;
        }

        // populate scales
        $('#AdminInterfaceTestTemplateEditor-NormSelect').empty();
        for (var i = 0; i < this.currentTest.norms.length; i++) {
            var selectStr = (this.currentNormIndex == i) ? " selected " : "";
            var tempStr = "<option value='" + this.currentTest.norms[i].id + "'" + selectStr + ">" + this.currentTest.norms[i].normDescription + "</option>"
            $('#AdminInterfaceTestTemplateEditor-NormSelect').append(tempStr);
        }

        DataBinderTo('AdminInterfaceTestTemplateEditorTabNorms', ITSInstance.newITSTestEditorController);
    } else {
        this.currentNorm = null;
        this.currentNormIndex = -1;

        $('#AdminInterfaceTestTemplateEditor-NormSelect').empty();
        tempObj = {};
        tempObj.currentNorm = new ITSTestNorm();
        DataBinderTo('AdminInterfaceTestTemplateEditorTabNorms', tempObj);
    }

    // load the score matrix
    this.loadNormMatrix();
};

ITSTestTemplateEditor.prototype.loadNormMatrix = function () {
    if (this.currentNorm) {
        this.currentNorm.removeInvalidScalesFromNormColumns();
    }

    $('#AdminInterfaceTestTemplateEditorNorm_NormColumnTable').empty();

    toAdd = this.loadNormMatrixSub(false);
    $('#AdminInterfaceTestTemplateEditorNorm_NormColumnTable').append(toAdd);
    this.loadNormMatrixSub(true);
};

ITSTestTemplateEditor.prototype.loadNormMatrixSub = function (setValue) {
    var toAdd = "";
    for (var i = 0; i < this.currentTest.scales.length; i++) {
        var newScreenElement = this.normMatrixLinePart1;
        newScreenElement = newScreenElement.replace(this.normMatrixScaleID, this.currentTest.scales[i].id);
        newScreenElement = newScreenElement.replace(this.normMatrixScaleDescription, this.currentTest.scales[i].scaleDescription);
        toAdd = toAdd + newScreenElement;

        if (this.currentNorm) {
            for (var j = 0; j < this.currentNorm.normColumns.length; j++) {
                if (this.currentNorm.normColumns[j].scaleID == this.currentTest.scales[i].id) {

                    for (var k = 0; k < this.currentNorm.normColumns[j].normColumnValues.length; k++) {
                        var newScreenElement = this.normMatrixLinePart2;
                        newScreenElement = newScreenElement.replace(this.normMatrixScaleID, this.currentTest.scales[i].id);
                        newScreenElement = newScreenElement.replace(this.normMatrixScaleDescription, this.currentTest.scales[i].scaleDescription);
                        newScreenElement = newScreenElement.replace(this.normMatrixNr, i + "_" + k);
                        newScreenElement = newScreenElement.replace(this.normMatrixNrPlusOne, k + 1);
                        newScreenElement = newScreenElement.replace(this.normMatrixNrPlusTwo, i + "_" + k);
                        if (this.currentTest.scales[i].scaleType == "N") {
                            newScreenElement = newScreenElement.replace(this.normMatrixNrCheckScale, this.normMatrixLineCheckNumber);
                        } else {
                            newScreenElement = newScreenElement.replace(this.normMatrixNrCheckScale, "");
                        }
                        if (this.currentNorm.normIsNumeric()) {
                            newScreenElement = newScreenElement.replace(this.normMatrixNrCheckNorm, this.normMatrixLineCheckNumber);
                        } else {
                            newScreenElement = newScreenElement.replace(this.normMatrixNrCheckNorm, "");
                        }

                        toAdd = toAdd + newScreenElement;

                        // now set the values
                        if (setValue) {
                            x = this.currentNorm.normColumns[j].normColumnValues[k].rawScoreBorder;
                            $('#AdminInterfaceTestTemplateEditorNorm_RawCol_' + i + "_" + k)[0].value = x;
                            $('#AdminInterfaceTestTemplateEditorNorm_ValCol_' + i + "_" + k)[0].value = this.currentNorm.normColumns[j].normColumnValues[k].normValue;
                            $('#AdminInterfaceTestTemplateEditorNorm_PercCol_' + i + "_" + k)[0].value = this.currentNorm.normColumns[j].normColumnValues[k].percentileValue;
                        }
                    }
                }
            }
        }

        var newScreenElement = this.normMatrixLinePart3;
        newScreenElement = newScreenElement.replace(this.normMatrixScaleID, this.currentTest.scales[i].id);
        newScreenElement = newScreenElement.replace(this.normMatrixScaleDescription, this.currentTest.scales[i].scaleDescription);
        toAdd = toAdd + newScreenElement;
    }
    return toAdd;
};

ITSTestTemplateEditor.prototype.addNewNorm = function () {
    if (this.currentTest.scales.length > 0) {
        this.currentNorm = this.currentTest.addNewNorm();
        this.currentNormIndex = this.currentTest.norms.length - 1;
        this.fillNormsTab();
    }
};

ITSTestTemplateEditor.prototype.removeNorm = function () {
    this.currentTest.norms.splice(this.currentNormIndex, 1);
    this.currentNorm = null;
    this.fillNormsTab();
};

ITSTestTemplateEditor.prototype.showNormInEditor = function (nr) {
    this.currentNorm = this.currentTest.norms[nr];
    this.currentNormIndex = nr;
    this.fillNormsTab();
};

ITSTestTemplateEditor.prototype.addNewNormColumn = function (scaleID) {
    var newNormColumn = null;
    for (var j = 0; j < this.currentNorm.normColumns.length; j++) {
        if (this.currentNorm.normColumns[j].scaleID == scaleID) {
            newNormColumn = this.currentNorm.normColumns[j].addNewNormColumn();
            this.fillNormsTab();
        }
    }
    if (newNormColumn == null) {
        // there is no norm column for this scale yet, add it.
        newNormColumn = this.currentNorm.addScaleToNormColumns(scaleID).addNewNormColumn();
        this.fillNormsTab();
    }
};

ITSTestTemplateEditor.prototype.removeNormColumn = function (scaleID, index) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        normColumns.normColumnValues.splice(updateIndex[1], 1);
        this.fillNormsTab();
    }
};

ITSTestTemplateEditor.prototype.moveNormColumnUp = function (scaleID, index) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        toMove = parseInt(updateIndex[1]);
        if (toMove > 0) {
            var x = normColumns.normColumnValues[toMove];
            normColumns.normColumnValues[toMove] = normColumns.normColumnValues[toMove - 1];
            normColumns.normColumnValues[toMove - 1] = x;
        }
        this.fillNormsTab();
    }
};

ITSTestTemplateEditor.prototype.moveNormColumnDown = function (scaleID, index) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        toMove = parseInt(updateIndex[1]);
        if (toMove < normColumns.normColumnValues.length - 1) {
            var x = normColumns.normColumnValues[toMove];
            normColumns.normColumnValues[toMove] = normColumns.normColumnValues[toMove + 1];
            normColumns.normColumnValues[toMove + 1] = x;
        }
        this.fillNormsTab();
    }
};

ITSTestTemplateEditor.prototype.changeNormColumnRawValue = function (scaleID, index, newValue) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        normColumns.normColumnValues[updateIndex[1]].rawScoreBorder = newValue;
        if (normColumns.normColumnValues[updateIndex[1]].validate()) {
            this.fillNormsTab();
        }
    }
};

ITSTestTemplateEditor.prototype.changeNormColumnNormValue = function (scaleID, index, newValue) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        normColumns.normColumnValues[updateIndex[1]].normValue = newValue;
        if (normColumns.normColumnValues[updateIndex[1]].validate()) {
            this.fillNormsTab();
        }
        $('#AdminInterfaceTestTemplateEditorNorm_PercCol_' + index)[0].value = normColumns.normColumnValues[updateIndex[1]].percentileValue;
    }
};

ITSTestTemplateEditor.prototype.changeNormColumnPercentileValue = function (scaleID, index, newValue) {
    var normColumns = this.currentNorm.findNormColumnsWithScaleID(scaleID);
    if (normColumns != null) {
        var updateIndex = index.split('_');
        normColumns.normColumnValues[updateIndex[1]].percentileValue = newValue;
        if (normColumns.normColumnValues[updateIndex[1]].validate()) {
            this.fillNormsTab();
        }
    }
};


//////////////////////////////////////////////////////////////////////////// end of norm functions

ITSTestTemplateEditor.prototype.fillCatalogTab = function () {
    DataBinderTo('AdminInterfaceTestTemplateEditorTabCatalog', ITSInstance.newITSTestEditorController);
};

//////////////////////////////////////////////////////////////////////////// end of catalog functions

ITSTestTemplateEditor.prototype.fillMediaTab = function () {
    this.populateMediaTabLists();
};

ITSTestTemplateEditor.prototype.populateMediaTabLists = function () {
    this.currentTest.loadMediaFiles(this.populateMediaTabListFilesAfterLoad.bind(this), function () {});
    this.currentTest.loadCatalogFiles(this.populateMediaTabListCatalogAfterLoad.bind(this), function () {});
};

ITSTestTemplateEditor.prototype.populateMediaTabListFilesAfterLoad = function () {
    $('#AdminInterfaceTestTemplateEditorMedia_File_tbody').empty();
    for (var i = 0; i < this.currentTest.files.length; i++) {
        var toAdd = this.fileUploadPart;
        toAdd = toAdd.replace(this.fileUploadNr, i);
        toAdd = toAdd.replace(this.fileUploadNrPlusOne, i + 1);
        toAdd = toAdd.replace(this.fileUploadName, this.currentTest.files[i]);
        toAdd = toAdd.replace(this.fileUploadLink, this.currentTest.createLinkForFile(i));
        $('#AdminInterfaceTestTemplateEditorMedia_File_tbody').append(toAdd);
    }
};

ITSTestTemplateEditor.prototype.populateMediaTabListCatalogAfterLoad = function () {
    $('#AdminInterfaceTestTemplateEditorMedia_Cat_tbody').empty();
    for (var i = 0; i < this.currentTest.media.length; i++) {
        var toAdd = this.catalogUploadPart;
        toAdd = toAdd.replace(this.fileUploadNr, i);
        toAdd = toAdd.replace(this.fileUploadNrPlusOne, i + 1);
        toAdd = toAdd.replace(this.fileUploadName, this.currentTest.media[i]);
        toAdd = toAdd.replace(this.fileUploadLink, this.currentTest.createLinkForMedia(i));
        $('#AdminInterfaceTestTemplateEditorMedia_Cat_tbody').append(toAdd);
    }
};

ITSTestTemplateEditor.prototype.removeMediaFile = function (fileName, index) {
    this.currentTest.removeTestFile(index, this.populateMediaTabLists.bind(this));
};


ITSTestTemplateEditor.prototype.removeCatalogFile = function (fileName, index) {
    this.currentTest.removeMediaFile(index, this.populateMediaTabLists.bind(this));
};


ITSTestTemplateEditor.prototype.uploadTestFile = function (fileNames) {
    // upload the files
    for (var i = 0; i < fileNames.length; i++) {
        var fileName = fileNames[i];
        loadFileLocally(fileNames[i], this.uploadTestFileSingle.bind(this), true);
    }
};

ITSTestTemplateEditor.prototype.uploadTestFileSingle = function (fileContents, file) {
    // upload the files
    ITSInstance.uploadFile(ITSInstance.companies.currentCompany.ID + '/' + this.currentTest.ID + "/test/" + file.name, fileContents, this.populateMediaTabLists.bind(this));
};

ITSTestTemplateEditor.prototype.uploadCatalogFile = function (fileNames) {
    for (var i = 0; i < fileNames.length; i++) {
        var fileName = fileNames[i];
        loadFileLocally(fileNames[i], this.uploadCatalogFileSingle.bind(this), true);
    }
};

ITSTestTemplateEditor.prototype.uploadCatalogFileSingle = function (fileContents, file) {
    // upload the files
    ITSInstance.uploadFile(ITSInstance.companies.currentCompany.ID + '/' + this.currentTest.ID + "/media/" + file.name, fileContents, this.populateMediaTabLists.bind(this));
};

//////////////////////////////////////////////////////////////////////////// end of media functions


ITSTestTemplateEditor.prototype.downloadCurrentTemplate = function () {
    if (! this.binariesLoading) {
        this.binariesLoading = true;
        this.currentTest.loadFilesAsBinary();
        ITSInstance.UIController.showInterfaceAsWaitingOn();
    }
    if (this.currentTest.files_binary.loadcount < this.currentTest.files_binary.list.length) {
        setTimeout(this.downloadCurrentTemplate.bind(this), 250);
    } else {
        this.binariesLoading = false;
        this.downloadCurrentTemplateProcess();
    }
}

ITSTestTemplateEditor.prototype.downloadCurrentTemplateProcess = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    this.currentTest.persistentProperties.push("files_binary");
    try {
        saveFileLocally(this.currentTest.Description.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".itrtesttemplate", ITSJSONStringify(this.currentTest));
    } finally {
        this.currentTest.persistentProperties.pop();
    }
};

ITSTestTemplateEditor.prototype.uploadCurrentTemplate = function (fileName) {
    loadFileLocally(fileName, this.uploadCurrentTemplate_process.bind(this));
};

ITSTestTemplateEditor.prototype.uploadCurrentTemplate_process = function (fileContents) {
    var newTest = this.currentTest.newTest;
    currentTestId = this.currentTest.ID;
    if (newTest) {
        this.currentTest.scales.length = 0;
    }

    ITSJSONLoad(this.currentTest, fileContents, this.currentTest, ITSInstance, "ITSTest");
    if (!newTest) {
        this.currentTest.ID = currentTestId;
    }

    // now post the files if there are any
    var prefix = "";
    if (ITSInstance.baseURL.indexOf("localhost") > 0) {
        //prefix = ITSInstance.baseURL + "/api/" ;
    }
    if (this.currentTest.files_binary.list) {
        for (var i = 0; i < this.currentTest.files_binary.list.length; i++) {
            if (this.currentTest.files_binary.list[i].type == "media") {
                var tempSrc = prefix + 'files/' + ITSInstance.companies.currentCompany.ID + "/" + this.currentTest.ID + '/test/' + this.currentTest.files_binary.list[i].name
            } else {
                var tempSrc = prefix + 'files/' + ITSInstance.companies.currentCompany.ID + "/" + this.currentTest.ID + '/media/' + this.currentTest.files_binary.list[i].name
            }
            var tempDat = stringToBinArray(this.currentTest.files_binary.list[i].data);
            ITSInstance.genericAjaxUpdate(tempSrc, tempDat, function () {
            }, function () {
            }, "N", "Y", 'application/octet-stream')
        }
    }
    this.populateTests();
    this.currentTest.detailsLoaded = true;
    this.loadTest(this.currentTestIndex);
};

ITSTestTemplateEditor.prototype.saveCurrentTest = function () {
    // make sure that the show status is true on all screens. During test development this may be changed when debugging the test
    this.currentTest.resetScreensShowStatus();
    // update on the server
    $('#AdminInterfaceTestTemplateEditor-saveIcon')[0].outerHTML = "<i id='AdminInterfaceTestTemplateEditor-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
    this.currentTest.saveToServer(function () {
        $('#AdminInterfaceTestTemplateEditor-saveIcon')[0].outerHTML = "<i id='AdminInterfaceTestTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
    }, function (errorText) {
        $('#AdminInterfaceTestTemplateEditor-saveIcon')[0].outerHTML = "<i id='AdminInterfaceTestTemplateEditor-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
        ITSInstance.UIController.showDialog("ITSScreenTestEditorTemplateSaveError", "Test details cannot be saved", "The test could not be saved. Please try again. Error details {0}", [{btnCaption: "OK"}], [errorText]);
    });
    this.populateTests();
};


ITSTestTemplateEditor.prototype.copyCurrentTest = function () {
    var newTest = this.currentTest.copyTest();
    newTest.Description = "Copy - " + newTest.Description;
    ITSInstance.tests.testList.push(newTest);
    this.currentTestIndex = ITSInstance.tests.testList.length - 1;
    this.populateTests();
    //history.back();
    ITSInstance.UIController.showDialog("ITSTestTemplateEditorCopyTest", "Copy test", "The test is copied. Please change the name of the test now. Please note that any test media are used from the original copied test. If you do not want this then delete the old test files, upload new test files and relink the files in the test screens and other places where you have used them.",
        [{btnCaption: "OK"}]);
    this.redirectToTestIndex(this.currentTestIndex);
};

ITSTestTemplateEditor.prototype.deleteCurrentTest = function () {
    // delete from the server
    this.currentTest.deleteFromServer(function () {
    }, function () {
    });
    // delete locally
    ITSInstance.tests.testList.splice(this.currentTestIndex, 1);
    this.populateTests();
    window.history.back();
};

ITSTestTemplateEditor.prototype.deleteCurrentTestWarning = function () {
    ITSInstance.UIController.showDialog("ITSTestTemplateEditorDeleteTest", "Delete test", "Are you sure you want to delete this test?",
        [{
            btnCaption: "Yes",
            btnType: "btn-warning",
            btnOnClick: "ITSInstance.newITSTestEditorController.deleteCurrentTest();"
        }, {btnCaption: "No"}]);
};

ITSTestTemplateEditor.prototype.trialRunTest = function (PnPRequired) {

};

//////////////////////////////////////////////////////////////////////////// end of button functions

ITSTestTemplateEditor.prototype.fillLanguagesInEditor = function () {
    $('#AdminInterfaceTestTemplateEditor-LanguageSelect').empty();
    $('#AdminInterfaceTestTemplateEditor-SourceLanguageSelect').empty();
    $('#AdminInterfaceTestTemplateEditor-TargetLanguageSelect').empty();
    var desc = "";
    var selected = "";
    for (var i = 0; i < ITSSupportedLanguages.length; i++) {
        desc = ITSInstance.translator.getLanguageDescription(ITSSupportedLanguages[i].languageCode);
        selected = "";
        if (ITSSupportedLanguages[i].languageCode == this.currentTest.LanguageSupport) {
            selected = " selected='selected' ";

            this.translate_source_language = ITSSupportedLanguages[i].languageCode;
            this.translate_target_language = ITSSupportedLanguages[i].languageCode;
        }
        $('#AdminInterfaceTestTemplateEditor-LanguageSelect').append(
            '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
            desc + '</option>'
        );
        if (ITSSupportedLanguages[i].translations_available) {
            $('#AdminInterfaceTestTemplateEditor-SourceLanguageSelect').append(
                '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                desc + '</option>'
            );
            $('#AdminInterfaceTestTemplateEditor-TargetLanguageSelect').append(
                '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                desc + '</option>'
            );
        }
    }
};

ITSTestTemplateEditor.prototype.processTestCapabilities = function () {
    $('#AdminInterfaceTestTemplateEditor_TabScoring_li').hide();
    $('#AdminInterfaceTestTemplateEditor_TabNorms_li').hide();
    $('#AdminInterfaceTestTemplateEditor_TabCatalog_li').hide();
    $('#AdminInterfaceTestTemplateEditor_TabMedia_li').hide();
    $('#AdminInterfaceTestTemplateEditorScreenDynamicsDiv').hide();
    $('#AdminInterfaceTestTemplateEditorTabScreensColScreenList').hide();
    $('#AdminInterfaceTestTemplateEditorTabScreensColScreenListButtons').hide();
    //$('#AdminInterfaceTestTemplateEditorTestDescriptionDiv').hide();
    $('#AdminInterfaceTestTemplateEditorTestCopyrightsDiv').hide();
    $('#AdminInterfaceTestTemplateEditorTestCostsDiv').hide();
    $('#AdminInterfaceTestTemplateEditorTestExplanationDiv').hide();
    $('#AdminInterfaceTestTemplateEditorTabScreensColScreenItemSettings').addClass('col-6');
    $('#AdminInterfaceTestTemplateEditorTabScreensColScreenItemSettings').removeClass('col-4');

    if ((this.currentTest.TestType >= 1000) && (this.currentTest.TestType < 2000)) {
        $('#AdminInterfaceTestTemplateEditorTestCapabilitiesDiv').hide();
        this.currentTest.PluginData.testHasScoring = true;
        this.currentTest.PluginData.testHasNorms = false;
        this.currentTest.PluginData.testHasCatalog = false;
        this.currentTest.PluginData.testHasMedia = true;
        this.currentTest.PluginData.testHasMultipleScreens = true;
        this.currentTest.PluginData.testHasScreenDynamics = false;

    } else {
        $('#AdminInterfaceTestTemplateEditorTestCapabilitiesDiv').show();
    }

    if (this.currentTest.PluginData) {
        if (this.currentTest.PluginData.testHasScoring) {
            $('#AdminInterfaceTestTemplateEditor_TabScoring_li').show();
            if ((this.currentTest.TestType >= 1000) && (this.currentTest.TestType < 2000)) $('#AdminInterfaceTestTemplateEditorTabScalesComplexScoringDiv').hide();
        }
        if (this.currentTest.PluginData.testHasNorms) {
            $('#AdminInterfaceTestTemplateEditor_TabNorms_li').show();
        }
        if (this.currentTest.PluginData.testHasCatalog) {
            $('#AdminInterfaceTestTemplateEditor_TabCatalog_li').show();
            //$('#AdminInterfaceTestTemplateEditorTestDescriptionDiv').show();
            $('#AdminInterfaceTestTemplateEditorTestCopyrightsDiv').show();
            $('#AdminInterfaceTestTemplateEditorTestExplanationDiv').show();
            $('#AdminInterfaceTestTemplateEditorTestCostsDiv').show();
        }
        if (this.currentTest.PluginData.testHasMedia) {
            $('#AdminInterfaceTestTemplateEditor_TabMedia_li').show();
        }
        if (this.currentTest.PluginData.testHasMultipleScreens) {
            $('#AdminInterfaceTestTemplateEditorTabScreensColScreenList').show();
            $('#AdminInterfaceTestTemplateEditorTabScreensColScreenListButtons').show();
            $('#AdminInterfaceTestTemplateEditorTabScreensColScreenItemSettings').addClass('col-4');
            $('#AdminInterfaceTestTemplateEditorTabScreensColScreenItemSettings').removeClass('col-6');
        }
        if (this.currentTest.PluginData.testHasScreenDynamics) {
            $('#AdminInterfaceTestTemplateEditorScreenDynamicsDiv').show();
            $('#AdminInterfaceTestTemplateEditorScreenDynamics_section')[0].style.visibility = 'hidden';
            $('#AdminInterfaceTestTemplateEditorScreenDynamics_section')[0].style.display = 'none';
        }
    }
};

ITSTestTemplateEditor.prototype.selectLanguageInEditor = function (i) {
    this.currentTest.LanguageSupport = ITSSupportedLanguages[i].languageCode;
};

ITSTestTemplateEditor.prototype.selectAllScreensForTranslation = function (checkval){
    this.translate_all_screens = checkval;
};
ITSTestTemplateEditor.prototype.selectSourceLanguageForTranslation = function (value){
    this.translate_source_language = value;
};
ITSTestTemplateEditor.prototype.selectTargetLanguageForTranslation = function (value){
    this.translate_target_language = value;
};
ITSTestTemplateEditor.prototype.startTranslation = function () {
    this.translate_screen_index = 0;
    this.translate_calls = 0;
    ITSInstance.UIController.showInterfaceAsWaitingOn();
    this.translate_screen_index_end = this.currentTest.screens.length;
    if (this.translate_all_screens) {
        this.translateScreen(0);
    } else {
        this.translate_screen_index_end = this.currentScreenIndex + 1;
        this.translateScreen(this.currentScreenIndex );
    }
};
ITSTestTemplateEditor.prototype.translateScreen = function (screenIndex) {
    this.translate_component_index = -1;
    this.translation_calls = [];
    this.translation_call_index = 0;
    if (this.translate_screen_index < this.currentTest.screens.length) {
        for (var i=screenIndex; i < this.translate_screen_index_end; i++) {
            this.translate_screen_index = i;
            this.translateScreenComponent(i);
        }
    }
    if (this.translate_calls > 0) {
        this.loadCurrentTestOnScreen();
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.translateIndexedCall(0);
    } else {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
    }
};
ITSTestTemplateEditor.prototype.translateScreenComponent = function (componentIndex) {
    this.translate_component_index = componentIndex ;
    for (var i=0; i < this.currentTest.screens[this.translate_screen_index].screenComponents.length; i++) {
        var thisTemplate = ITSInstance.screenTemplates.findTemplateById(ITSInstance.screenTemplates.screenTemplates,
               this.currentTest.screens[this.translate_screen_index].screenComponents[i].templateID );
        this.translate_component_index = i;
        if (thisTemplate >= 0) {
            var template = ITSInstance.screenTemplates.screenTemplates[thisTemplate];
            this.translate_template = template;
            this.translate_component_variable_index = -1;
            for (var j=0; j < this.translate_template.TemplateVariables.length; j++) {
                this.translateScreenComponentVariable(j);
            }
        }
    }
};
ITSTestTemplateEditor.prototype.translateScreenComponentVariable = function (componentVariableIndex) {
    this.translate_component_variable_index = componentVariableIndex;

    console.log(this.translate_template.TemplateVariables[this.translate_component_variable_index]);
    if (this.translate_template.TemplateVariables[this.translate_component_variable_index].translatable) {
        for (var i=1; i <= this.currentTest.screens[this.translate_screen_index].screenComponents[this.translate_component_index].templateValues.RepeatBlockCount; i++) {
            var postfix = "";
            if (i > 1 ) postfix = "_"+ i;
            var toTranslate = this.currentTest.screens[this.translate_screen_index].screenComponents[this.translate_component_index].templateValues[
                this.translate_template.TemplateVariables[this.translate_component_variable_index].variableName + postfix];
            var tempHeaders = {
                'SessionID': ITSInstance.token.IssuedToken,
                'CompanyID': ITSInstance.token.companyID
            };
            this.translate_calls++;
            ITSLogger.logMessage(logLevel.INFO,ITSInstance.baseURLAPI + "translate/" + this.translate_source_language + "/" + this.translate_target_language + " " + toTranslate);
            if ((toTranslate != undefined) && (toTranslate != "")) {
                this.translateCall(this.translate_screen_index, this.translate_component_index, this.translate_component_variable_index, this.translate_template, postfix, tempHeaders, toTranslate);
            }
        }
    }
};
ITSTestTemplateEditor.prototype.translateCall = function (translate_screen_index, translate_component_index, translate_component_variable_index,translate_template,  postfix, tempHeaders, toTranslate) {
    var context = {};
    context.translate_screen_index = translate_screen_index;
    context.translate_component_index = translate_component_index;
    context.translate_component_variable_index = translate_component_variable_index;
    context.translate_template = translate_template;
    context.postfix = postfix;
    context.tempHeaders = tempHeaders;
    context.data = toTranslate.replace(/(\r\n|\n|\r|\t)/gm, "");
    context.url =  ITSInstance.baseURLAPI + "translate/" + this.translate_source_language + "/" + this.translate_target_language;
    this.translation_calls.push(context);
};
ITSTestTemplateEditor.prototype.translateIndexedCall = function (index) {
   this.translation_call_index = index;
   var context = this.translation_calls[index];
   this.translation_calls[index].tempHeaders.ToTranslate = encodeURI(this.translation_calls[index].data);
   $.ajax({
        url: this.translation_calls[index].url,
        headers: this.translation_calls[index].tempHeaders,
        error: function (xhr, ajaxOptions, thrownError) {
            ITSInstance.newITSTestEditorController.translateError();
        }.bind(this),
        dataType: "text",
        success: function (data) {
            ITSInstance.newITSTestEditorController.translateSuccess(data, context.translate_screen_index, context.translate_component_index, context.translate_component_variable_index, context.translate_template, context.postfix);
        }.bind(context),
        type: 'GET'
    });
};
ITSTestTemplateEditor.prototype.translateSuccess = function (data, translate_screen_index, translate_component_index, translate_component_variable_index, translate_template, postfix) {
    this.currentTest.screens[translate_screen_index].screenComponents[translate_component_index].templateValues[
        translate_template.TemplateVariables[translate_component_variable_index].variableName + postfix ] = data;
    if (this.translation_call_index +1 < this.translation_calls.length) {
        this.translateIndexedCall(this.translation_call_index+1);
    } else {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
    }
};
ITSTestTemplateEditor.prototype.translateError = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError('TestTemplateEditor.TranslationNotFound', 'The translation failed. Please check if the azure translate string is set and if this user has the proper rights.');
};

ITSTestTemplateEditor.prototype.selectSourceTestForCopy = function (selValue) {
    this.selectedTestIdForCopy = selValue;
    var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, selValue);
    if (testIndex > -1) {
        this.selectedTestForCopy = ITSInstance.tests.testList[testIndex];
        if (ITSInstance.tests.testList[testIndex].detailsLoaded) {
            this.selectSourceTestForCopyLoadQuestionList();
        } else {
            ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(
                this.selectSourceTestForCopyLoadQuestionList.bind(this)
                ,function () {
                    ITSInstance.UIController.showDialog("ITSTestTemplateEditorLoadTestError", "Test could not be loaded", "The test could not be loaded. Please close your browser and try again.",
                        [{btnCaption: "OK"}]);
                }
             );
        }
    }
};
ITSTestTemplateEditor.prototype.selectSourceTestForCopyLoadQuestionList = function () {
    var newScreenElement = "";
    $('#AdminInterfaceTestTemplateEditor-CopyFromScreenSelect').empty();
    for (var i = 0; i < this.selectedTestForCopy.screens.length; i++) {
        this.selectedTestScreenIdForCopy = 0;
        newScreenElement = "<option NoTranslate value='" + i + "'>" + this.selectedTestForCopy.screens[i].varName + "</option>";
        $('#AdminInterfaceTestTemplateEditor-CopyFromScreenSelect').append(newScreenElement);
    }
};
ITSTestTemplateEditor.prototype.selectSourceScreenForCopy = function (selValue) {
    this.selectedTestScreenIdForCopy = selValue;
};
ITSTestTemplateEditor.prototype.copyFromTestScreen = function () {
    this.currentTest.copyTestScreenFromOtherTest(this.selectedTestForCopy, this.selectedTestScreenIdForCopy, this.currentScreenIndex+1);
    this.loadScreensListEmpty();
    this.currentTest.makeTestScreenVarNamesUnique();
    setTimeout(this.fillScreenTab.bind(this),250);
};

(function () { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfaceDiv = $('<div class="container-fluid" id="AdminInterfaceTestTemplateEditor" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfaceDiv);
    $(AdminInterfaceDiv).load(ITSJavaScriptVersion + '/Plugins/TestTemplateEditor/editor.html', function () {

        // register the editor
        ITSInstance.newITSTestEditorController = new ITSTestTemplateEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.newITSTestEditorController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfaceTestTemplateEditor");

        // init the view
        $('#AdminInterfaceTestTemplateEditorEdit').hide();
        $('#AdminInterfaceTestTemplateEditorSelect').show();
        $('#AdminInterfaceTestTemplateEditorScreenContentButtons').hide();
        $('#AdminInterfaceTestTemplateEditorScreenDynamicsDiv').hide();
    })

})() //iife

// register the menu items
ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
    if (ITSInstance.users.currentUser.IsTestAuthor) {
        ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#AdminInterfaceTestTemplateEditor.EditMenu", ITSInstance.translator.translate("#AdminInterfaceTestTemplateEditor.EditMenu", "Edit test definitions"), "fa-book-reader", "ITSRedirectPath(\'TestTemplateEditor&TestType=0\');");
        ITSInstance.UIController.registerMenuItem('#submenuCourseBuilderLI', "#AdminInterfaceTestTemplateEditor.EditCourseMenu", ITSInstance.translator.translate("#AdminInterfaceTestTemplateEditor.EditCourseMenu", "Course (part) builder"), "fa-book-reader", "ITSRedirectPath(\'TestTemplateEditor&TestType=1000\');");
    }
}, true);