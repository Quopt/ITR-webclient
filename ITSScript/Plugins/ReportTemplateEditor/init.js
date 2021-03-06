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
//# sourceURL=ReportTemplateEditor/init.js

(function () { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
        var EditorDiv = $('<div class="container-fluid" id="ReportTemplateInterfaceSessionEdit" style="display: none;">');
        $('#ITSMainDiv').append(EditorDiv);

        $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ReportTemplateEditor/editor.html', function () {
            // things to do after loading the html
        });

        var ITSReportTemplateEditor = function () {
            this.info = new ITSPortletAndEditorRegistrationInformation('fde39819-f423-40fd-969d-b99917c85ec1', 'ReportTemplate editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit reports for tests, test sessions and groups.');
            this.path = "ReportTemplateEditor";
            this.currentReport = {};
            this.currentGraph = {};
        };

        ITSReportTemplateEditor.prototype.afterOfficeLogin = function () {
            ITSLogger.logMessage(logLevel.INFO,'Init report editor');
            ITSInstance.reports.loadAvailableReportsList(function () {
            }, function () {
            });
        };

        ITSReportTemplateEditor.prototype.init = function () {

        };

        ITSReportTemplateEditor.prototype.hide = function () {
            $('#ReportTemplateInterfaceSessionEdit').hide();
        };

        ITSReportTemplateEditor.prototype.show = function () {
            if (getUrlParameterValue('ReportType')) {
                $('#NavbarsAdmin').show();
                $('#NavbarsAdmin').visibility = 'visible';
                $('#NavBarsFooter').show();
                $('#ReportTemplateInterfaceSessionEdit').show();
                ITSInstance.UIController.initNavBar();

                $('#ReportTemplateInterfaceEditSelectReport').hide();
                $('#ReportTemplateInterfaceEdit').hide();
                $('#ReportTemplateInterfaceEditSelectTest').hide();

                if (!ITSInstance.reports.listLoaded) {
                    ITSInstance.reports.loadAvailableReportsList(this.showProperView.bind(this), this.showListLoadError.bind(this));
                } else {
                    this.showProperView();
                }
            } else // no parameter will not work for this screen
            {
                ITSInstance.UIController.activateScreenPath('Switchboard');
            }
        };

        ITSReportTemplateEditor.prototype.showListLoadError = function () {
            ITSInstance.UIController.showError("ITSReportTemplateEditor.LoadListFailed", "The report list could not be loaded at this moment.", '',
                'window.history.back();');
        };

        ITSReportTemplateEditor.prototype.showListTestLoadError = function () {
            ITSInstance.UIController.showError("ITSReportTemplateEditor.LoadListFailed", "The report list could not be loaded at this moment.", '',
                'window.history.back();');
        };

        ITSReportTemplateEditor.prototype.showProperView = function () {
            // the report type will filter the reports based on type
            // for for example test reports the report type = 0.
            // report type =0 . if no test id is present then show a list of tests the user can select from.
            //   if test id is present then show the list of reports with the reports for this test. With add new button.
            //   if report and test id is present the show the report editor.
            this.ReportType = getUrlParameterValue('ReportType');
            this.TestID = undefined;
            this.ReportID = undefined;

            if (getUrlParameterValue('TestID')) {
                this.TestID = getUrlParameterValue('TestID');
            } else {
                this.TestID = '{00000000-0000-0000-0000-000000000000}';
            }
            if (getUrlParameterValue('ReportID')) {
                this.ReportID = getUrlParameterValue('ReportID');
            }


            if (!ITSInstance.tests.testListLoaded) {
                ITSInstance.tests.loadAvailableTests(this.showProperView.bind(this), this.testsLoadError.bind(this));
            } else {
                if (this.ReportID) {
                    // we know what to edit show the report editor

                    this.showReportEditorView(this.ReportID);
                } else if (this.TestID != '{00000000-0000-0000-0000-000000000000}') {
                    // we know the test to edit the report for. show the report list and let the user choose
                    if (ITSInstance.reports.listLoaded) {
                        this.showReportListView(this.TestID);
                    } else {
                        // load reports list
                        this.reports.loadAvailableReportsList(this.showReportListView.bind(this, this.TestID), this.reportsLoadError.bind(this));
                    }
                } else {
                    // only the report type is available. for now show the test list and let the user choose
                    if (ITSInstance.tests.testListLoaded) {
                        this.showTestListView();
                    } else {
                        ITSInstance.tests.loadAvailableTests(this.showTestListView.bind(this), this.showListTestLoadError.bind(this));
                    }
                }
            }
        };

        ITSReportTemplateEditor.prototype.testsLoadError = function () {
            ITSInstance.UIController.showError("ITSReportTemplateEditor.LoadTestsFailed", "The test list could not be loaded at this moment.", '',
                'window.history.back();');
        };
        ITSReportTemplateEditor.prototype.reportsLoadError = function () {
            ITSInstance.UIController.showError("ITSReportTemplateEditor.LoadReportsFailed", "The reports list could not be loaded at this moment.", '',
                'window.history.back();');
        };

        ITSReportTemplateEditor.prototype.showReportEditorView = function (ReportID) {
            $('#ReportTemplateInterfaceEdit').show();
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            // locate the report in the reports array
            var report = ITSInstance.reports.findReportByID(ITSInstance.reports.reportsList, this.ReportID);

            if (!report) {
                // load the report
                this.currentReport = ITSInstance.reports.newReport(true);
                this.currentReport.loadDetailDefinition(this.showReportEditorViewLoaded.bind(this), this.showReportEditorViewError.bind(this));
            } else if (!report.detailsLoaded) {
                // load the report details
                this.currentReport = report;
                this.currentReport.loadDetailDefinition(this.showReportEditorViewLoaded.bind(this), this.showReportEditorViewError.bind(this));
            } else {
                this.currentReport = report;
                this.showReportEditorViewLoaded();
            }
        };

        ITSReportTemplateEditor.prototype.showReportEditorViewLoaded = function () {
            ITSInstance.UIController.showInterfaceAsWaitingOff();

            ITSInstance.reports.currentReport = this.currentReport; // set this context for generation of the graphs
            this.candidateSession = new ITSCandidateSession(this, ITSInstance);
            this.candidateSessionTest = new ITSCandidateSessionTest(this, ITSInstance);
            this.candidateSessionTest.TestID = this.TestID ;
            if (this.currentReport.ReportType == -1) this.currentReport.ReportType = parseInt(getUrlParameterValue("ReportType"));

            this.candidateSessionTest.loadTest( function () {
                    ITSInstance.reports.currentReport.generateTestReport(this.candidateSession, this.candidateSessionTest, true);
                    this.populateFillInFields();
                }.bind(this), function () {} );

            this.showTab('ReportTemplateInterfaceEdit_TabReportInformation', 'ReportTemplateInterfaceEditTabReportInformation');
        };

        ITSReportTemplateEditor.prototype.showReportEditorViewError = function () {
            ITSInstance.UIController.showInterfaceAsWaitingOff();
            ITSInstance.UIController.showError("ITSReportTemplateEditor.LoadReportFailed", "The report could not be loaded at this moment.", '',
                'window.history.back();');
        };

        ITSReportTemplateEditor.prototype.showTestListView = function () {
            $('#ReportTemplateInterfaceEditSelectTest').show();

            $('#ReportTemplateInterfaceEditSelectTestList').empty();
            var tmpPath = "";
            var tmpDiv = "";
            var TestType = parseInt(getUrlParameterValue("TestType"));
            for (var i = 0; i < ITSInstance.tests.testList.length; i++) {
                if (ITSInstance.tests.testList[i].TestType != TestType) continue;

                tmpPath = "ITSRedirectPath(\"ReportTemplateEditor&ReportType=" + this.ReportType + "&TestID=" + ITSInstance.tests.testList[i].ID + "\");";
                tmpDiv = "<li value='" + i + "' onclick='" + tmpPath + "' > <i class='fa fa-fw fa-book-reader'></i>&nbsp;&nbsp;" + ITSInstance.tests.testList[i].descriptionWithDBIndicator() + "</li>";
                $('#ReportTemplateInterfaceEditSelectTestList').append(tmpDiv);
            }
        };

        ITSReportTemplateEditor.prototype.showReportListView = function (TestID) {
            $('#ReportTemplateInterfaceEditSelectReport').show();

            $('#ReportTemplateInterfaceEditSelectReportList').empty();
            var tmpPath = "";
            var tmpDiv = "";
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, this.TestID);
            if (testIndex > -1) $('#ReportTemplateInterfaceEditSelectReportHeader2Test')[0].innerHTML = ITSInstance.tests.testList[testIndex].TestName;
            var reportType = parseInt(getUrlParameterValue("ReportType"));
            for (var i = 0; i < ITSInstance.reports.reportsList.length; i++) {
                if (ITSInstance.reports.reportsList[i].TestID == this.TestID) {
                    if ((ITSInstance.reports.reportsList[i].dbsource == 0) && (ITSInstance.reports.reportsList[i].ReportType == reportType)) {
                        tmpPath = "ITSRedirectPath(\"ReportTemplateEditor&ReportType=" + this.ReportType + "&TestID=" + this.TestID + "&ReportID=" + ITSInstance.reports.reportsList[i].ID + "\");";
                        tmpDiv = "<li value='" + i + "' onclick='" + tmpPath + "' > <i class='fa fa-fw fa-newspaper'></i>&nbsp;&nbsp;" + ITSInstance.reports.reportsList[i].getReportDescriptionWithDBIndicator() + "</li>";
                        if (!ITSInstance.reports.reportsList[i].isCentrallyManaged()) $('#ReportTemplateInterfaceEditSelectReportList').append(tmpDiv);
                    }
                }
            }
        };

        ITSReportTemplateEditor.prototype.showTab = function (id, tabID) {
            $('#ReportTemplateInterfaceEditTabReportInformation').hide();
            $('#ReportTemplateInterfaceEditTabReportWriter').hide();
            $('#ReportTemplateInterfaceEditTabGraphBuilder').hide();
            $('#ReportTemplateInterfaceEdit_TabReportInformation').removeClass("text-info");
            $('#ReportTemplateInterfaceEdit_TabReportWriter').removeClass("text-info");
            $('#ReportTemplateInterfaceEdit_TabGraphs').removeClass("text-info");
            // class="text-info"
            $('#' + tabID).show();
            $('#' + id).addClass("text-info");

            DataBinderTo('ReportTemplateInterfaceEditTabReportInformation', this.currentReport);
            DataBinderTo('ReportTemplateInterfaceEditTabReportWriter', this.currentReport);

            switch (tabID) {
                case "ReportTemplateInterfaceEditTabReportInformation" :
                    this.fillReportInformationTab();
                    break;
                case "ReportTemplateInterfaceEditTabReportWriter" :
                    this.fillReportWriterTab();
                    break;
                case "ReportTemplateInterfaceEditTabGraphBuilder" :
                    this.fillGraphsTab();
                    break;
            }

            this.fillLanguagesInEditor();
        };

        ITSReportTemplateEditor.prototype.fillReportInformationTab = function () {
            this.fillLanguagesInEditor();
            DataBinderTo('ReportTemplateInterfaceEditTabReportInformation', this.currentReport);
        };

        ITSReportTemplateEditor.prototype.fillLanguagesInEditor = function () {
            $('#ReportTemplateInterfaceEdit_LanguageSelect').empty();
            var desc = "";
            var selected = "";
            for (var i = 0; i < ITSSupportedLanguages.length; i++) {
                desc = ITSInstance.translator.getLanguageDescription(ITSSupportedLanguages[i].languageCode);
                selected = "";
                if (ITSSupportedLanguages[i].languageCode == this.currentReport.ReportLanguage) selected = " selected='selected' ";
                $('#ReportTemplateInterfaceEdit_LanguageSelect').append(
                    '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                    desc + '</option>'
                );
            }
            this.fillLanguagesInEditorForTranslation();
        };

        ITSReportTemplateEditor.prototype.selectLanguageInEditor = function (i) {
            this.currentReport.ReportLanguage = ITSSupportedLanguages[i].languageCode;
        };

        ITSReportTemplateEditor.prototype.fillReportWriterTab = function () {
            DataBinderTo('ReportTemplateInterfaceEditTabReportWriter', this.currentReport);

            var ReportTemplateInterfaceEditTabReportWriter_PreScriptEditor = ace.initEditJavascript("ReportTemplateInterfaceEditTabReportWriterEditor");
        };

        ITSReportTemplateEditor.prototype.fillGraphsTab = function () {
            $('#GraphEditor').hide();
            this.fillGraphsList();
            if (this.currentGraphIndex >= 0) {
                if (this.currentGraphIndex <= this.currentReport.ReportGraphs.length) {
                    this.showGraphInEditor(this.currentGraphIndex +1);
                } else {
                    this.showGraphInEditor(0);
                }
            } else {
                this.showGraphInEditor(0);
            }
        };

        ITSReportTemplateEditor.prototype.fillGraphsList = function () {
            var oldIndex = $('#ReportTemplateInterfaceEditTabGraphBuilder-Select')[0].selectedIndex;

            $('#ReportTemplateInterfaceEditTabGraphBuilder-Select').empty();
            var tempSelect = "";
            tempSelect = '<option NoTranslate selected=\"selected\" value=\"-1\">-</option>';
            $('#ReportTemplateInterfaceEditTabGraphBuilder-Select').append(tempSelect);
            for (var i = 0; i < this.currentReport.ReportGraphs.length; i++) {
                tempSelect = '<option NoTranslate value=\"' + i + '\">' + this.currentReport.ReportGraphs[i].Name + '</option>';
                $('#ReportTemplateInterfaceEditTabGraphBuilder-Select').append(tempSelect);
            }

            if (oldIndex >= 0) {
               this.showGraphInEditor(oldIndex);
            }
        };

        ITSReportTemplateEditor.prototype.showGraphInEditor = function (index) {
            if (index > 0) {
                index = index - 1;
                this.currentGraph = this.currentReport.ReportGraphs[index];
                this.currentGraphIndex = index;
                $('#GraphEditor').show();
                DataBinderTo('ReportTemplateInterfaceEditTabGraphBuilder', this.currentGraph);
                $('#ReportTemplateInterfaceEditTabGraphBuilder-Select')[0].selectedIndex = index + 1;

                // now show the graphs settings
                this.testEditorID = "X" + getNewSimpleGeneratorNumber('ui_gen', 999999) + "Y";
                this.testTakingID = "X" + getNewSimpleGeneratorNumber('ui_gen', 999999) + "Y";
                this.currentTemplate = ITSInstance.screenTemplates.newScreenTemplate();
                ITSJSONLoad( this.currentTemplate, ITSJSONStringify(ITSGraph_editTemplate) );
                this.currentTemplate.generate_test_editor_view('GraphEditorProperties', this.testEditorID, this.currentReport.ReportGraphs[this.currentGraphIndex], false,
                    'ITSInstance.ReportTemplateSessionController.updatePreviews();',
                    'ITSInstance.ReportTemplateSessionController.addRepeatBlock();',
                    'ITSInstance.ReportTemplateSessionController.removeRepeatBlock();');
                this.updatePreviews();
            } else {
                $('#GraphEditor').hide();
                $('#ReportTemplateInterfaceEditTabGraphBuilder-Select')[0].selectedIndex = 0;
            }
        };

        ITSReportTemplateEditor.prototype.updatePreviews = function () {
            this.currentTemplate.generate_test_taking_view('GraphEditorPreview', false, this.testTakingID,
                this.currentTemplate.extract_test_editor_view_templatevalues('GraphEditorProperties', this.testEditorID, false),
                false, true, 'TT');
            var temp = this.currentTemplate.extract_test_editor_view_templatevalues('GraphEditorProperties', this.testEditorID, false);
            shallowCopy(temp, this.currentReport.ReportGraphs[this.currentGraphIndex]);
        };

        ITSReportTemplateEditor.prototype.addRepeatBlock = function () {
            this.setRepeatBlock( this.currentTemplate.RepeatBlockCount + 1);
        };

        ITSReportTemplateEditor.prototype.removeRepeatBlock = function () {
            this.setRepeatBlock( this.currentTemplate.RepeatBlockCount - 1);
        };

        ITSReportTemplateEditor.prototype.setRepeatBlock = function (repeat_block_count) {
            var temp = this.currentTemplate.extract_test_editor_view_templatevalues('GraphEditorProperties', this.testEditorID, false);
            shallowCopy(temp, this.currentReport.ReportGraphs[this.currentGraphIndex]);
            this.currentTemplate.RepeatBlockCount = repeat_block_count;
            this.currentReport.ReportGraphs[this.currentGraphIndex].RepeatBlockCount = this.currentTemplate.RepeatBlockCount;
            this.currentTemplate.generate_test_editor_view('GraphEditorProperties', this.testEditorID, this.currentReport.ReportGraphs[this.currentGraphIndex], false,
                'ITSInstance.ReportTemplateSessionController.updatePreviews();',
                'ITSInstance.ReportTemplateSessionController.addRepeatBlock();',
                'ITSInstance.ReportTemplateSessionController.removeRepeatBlock();');
        };

        ITSReportTemplateEditor.prototype.addNewGraphInEditor = function () {
            var newGraph = new ITSGraph(); //this.currentReport, ITSInstance);
            newGraph.Name = "" + this.currentReport.ReportGraphs.length;
            this.currentReport.ReportGraphs.push(newGraph);
            this.fillGraphsList();
            this.showGraphInEditor(this.currentReport.ReportGraphs.length );
            $('#ReportTemplateInterfaceEditTabGraphBuilder-Select')[0].selectedIndex = this.currentReport.ReportGraphs.length;
        };

        ITSReportTemplateEditor.prototype.removeGraphFromEditor = function () {
            this.currentReport.ReportGraphs.splice(this.currentGraphIndex, 1);
            this.fillGraphsList();
            $('#GraphEditor').hide();
        };

        ITSReportTemplateEditor.prototype.addNewReportDefinition = function () {
            // locate the test this report is for
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, this.TestID);
            if (testIndex >= 0) {
                // reports are not bound to tests, but in this case they are
                var newReport = ITSInstance.reports.newReport(true);
                this.currentReport = newReport;
                this.ReportID = newReport.ID;
                this.TestID = this.TestID;
                newReport.detailsLoaded = true;
                ITSRedirectPath(this.path, "ReportType=" + this.ReportType + "&TestID=" + this.TestID + "&ReportID=" + this.ReportID);
            }
        };

        ITSReportTemplateEditor.prototype.processBackClick = function () {
            if (this.currentReport.saveToServerRequired()) {
                ITSInstance.UIController.showDialog("ITSReportTemplateEditor", "Save report", "You have not saved your changes. Would you like to save now?",
                    [{
                        btnCaption: "No",
                        btnType: "btn-warning",
                        btnOnClick: "ITSInstance.ReportTemplateSessionController.processBackClickNow();"
                    },
                        {
                            btnCaption: "Yes",
                            btnType: "btn-success",
                            btnOnClick: "ITSInstance.ReportTemplateSessionController.saveCurrentReport(); ITSInstance.ReportTemplateSessionController.processBackClickNow();"
                        }]);
            } else {
                this.processBackClickNow();
            }
        };

        ITSReportTemplateEditor.prototype.processBackClickNow = function () {
            window.history.back();
        };

        ITSReportTemplateEditor.prototype.saveCurrentReport = function () {
            $('#ReportTemplateInterfaceEditTabReportWriter_saveIcon')[0].outerHTML = "<i id='ReportTemplateInterfaceEditTabReportWriter_saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
            this.currentReport.TestID = this.TestID;
            DataBinderFrom('ReportTemplateInterfaceEditTabReportWriter', ITSInstance.ReportTemplateSessionController.currentReport );
            this.currentReport.saveToServer(this.saveCurrentReportSuccess.bind(this), this.saveCurrentReportError.bind(this));
        };
        ITSReportTemplateEditor.prototype.saveCurrentReportSuccess = function () {
            $('#ReportTemplateInterfaceEditTabReportWriter_saveIcon')[0].outerHTML = "<i id='ReportTemplateInterfaceEditTabReportWriter_saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
        };
        ITSReportTemplateEditor.prototype.saveCurrentReportError = function () {
            $('#ReportTemplateInterfaceEditTabReportWriter_saveIcon')[0].outerHTML = "<i id='ReportTemplateInterfaceEditTabReportWriter_saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
            ITSInstance.UIController.showError("ITSReportTemplateEditor.SaveReportFailed", "The report could not be saved at this moment.");
        };

        ITSReportTemplateEditor.prototype.copyCurrentReport = function () {
            var newReport = this.currentReport.copyReport();
            newReport.Description = "Copy" + newReport.Description;
            ITSInstance.reports.reportsList.push(newReport);
            ITSInstance.UIController.showDialog("ITSReportTemplateEditorCopyReport", "Copy report", "The report is copied. Please change the name of the report now.",
                [{btnCaption: "OK"}]);
            this.ReportID = this.currentReport.ID;
            this.currentReport = newReport;
            ITSInstance.ReportTemplateSessionController.showTab('ReportTemplateInterfaceEdit_TabReportInformation', 'ReportTemplateInterfaceEditTabReportInformation');
        };

        ITSReportTemplateEditor.prototype.deleteCurrentReportWarning = function () {
            ITSInstance.UIController.showDialog("ITSTestTemplateEditorDeleteReport", "Delete report", "Are you sure you want to delete this report?",
                [{
                    btnCaption: "Yes",
                    btnType: "btn-warning",
                    btnOnClick: "ITSInstance.ReportTemplateSessionController.deleteCurrentReport();"
                }, {btnCaption: "No"}]);
        };
        ITSReportTemplateEditor.prototype.deleteCurrentReport = function () {
            // delete from the server
            ITSInstance.reports.removeReportByID(this.ReportID, function () {
            }, this.deleteCurrentReportWarningError.bind(this));
            // delete locally
            window.history.back();
        };
        ITSReportTemplateEditor.prototype.deleteCurrentReportWarningError = function () {
            ITSInstance.UIController.showError("ITSReportTemplateEditor.DeleteReportFailed", "The report could not be deleted at this moment.");
        };

        ITSReportTemplateEditor.prototype.downloadCurrentTemplate = function () {
            saveFileLocally(this.currentReport.Description.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".itrreporttemplate", ITSJSONStringify(this.currentReport));
        };
        ITSReportTemplateEditor.prototype.uploadCurrentTemplate = function (fileName) {
            loadFileLocally(fileName, this.uploadCurrentTemplate_process.bind(this));
        };
        ITSReportTemplateEditor.prototype.uploadCurrentTemplate_process = function (fileContents) {
            var newReport = this.currentReport.newReport;
            var currentReportId = this.currentReport.ID;
            ITSJSONLoad(this.currentReport, fileContents, this.currentReport, ITSInstance, "ITSReport");
            if (!newReport) {
                this.currentReport.ID = currentReportId;
            }
            this.currentReport.detailsLoaded = true;
            ITSInstance.ReportTemplateSessionController.showTab('ReportTemplateInterfaceEdit_TabReportInformation', 'ReportTemplateInterfaceEditTabReportInformation');
        };


        ITSReportTemplateEditor.prototype.populateFillInFields = function () {
            var resStr = "";
            var candidate = this.currentReport.candidate.persistentProperties;
            var session = this.currentReport.session.persistentProperties;
            var test = this.currentReport.test.persistentProperties;
            var sessiontest = this.currentReport.sessiontest.persistentProperties;
            var report = this.currentReport.persistentProperties;
            for (var i=0; i < candidate.length; i++) { resStr +=  "%%candidate." + candidate[i] + "%%\n";  }
            for (var i=0; i < session.length; i++) { resStr +=  "%%session." + session[i] + "%%\n";  }
            for (var i=0; i < test.length; i++) { resStr +=  "%%test." + test[i] + "%%\n";  }

            resStr +=  "%%test.getTotalScreens()%%\n";
            resStr +=  "%%test.getTotalVisibleScreens()%%\n";
            resStr +=  "%%test.getScalesList()%%\n";
            resStr +=  "%%test.getNormsList()%%\n";
            resStr +=  "%%test.getScaleVarsList()%%\n";
            resStr +=  "%%test.getNormVarsList()%%\n";
            resStr +=  "%%test.getScalesMinScore()%%\n";
            resStr +=  "%%test.getScalesMaxScore()%%\n";

            for (var i=0; i < sessiontest.length; i++) { resStr +=  "%%sessiontest." + sessiontest[i] + "%%\n";  }

            resStr +=  "%%sessiontest.getScaleScores()%%\n";
            resStr +=  "%%sessiontest.getNormScores()%%\n";
            resStr +=  "%%sessiontest.getNormScores2()%%\n";
            resStr +=  "%%sessiontest.getNormScores3()%%\n";
            resStr +=  "%%sessiontest.getNormPercentileScores()%%\n";
            resStr +=  "%%sessiontest.getNormPercentileScores2()%%\n";
            resStr +=  "%%sessiontest.getNormPercentileScores3()%%\n";
            resStr +=  "%%sessiontest.getMaxNormScore()%%\n";
            resStr +=  "%%sessiontest.getMaxNormScore2()%%\n";
            resStr +=  "%%sessiontest.getMaxNormScore3()%%\n";
            resStr +=  "%%scales%%\n";

            for (var i=0; i < report.length; i++) { resStr +=  "%%" + report[i] + "%%\n";  }
            $('#ReportTemplateInterfaceEdit_ReportWriterFields').text(resStr);
            $('#ReportTemplateInterfaceEdit_GraphFields').text(resStr);
        };

        ITSReportTemplateEditor.prototype.fillLanguagesInEditorForTranslation = function () {
            $('#ReportTemplateInterfaceEdit-SourceLanguageSelect').empty();
            $('#ReportTemplateInterfaceEdit-TargetLanguageSelect').empty();
            var desc = "";
            var selected = "";
            for (var i = 0; i < ITSSupportedLanguages.length; i++) {
                desc = ITSInstance.translator.getLanguageDescription(ITSSupportedLanguages[i].languageCode);
                selected = "";
                if (ITSSupportedLanguages[i].languageCode == this.currentReport.ReportLanguage) {
                    selected = " selected='selected' ";

                    this.translate_source_language = ITSSupportedLanguages[i].languageCode;
                    this.translate_target_language = ITSSupportedLanguages[i].languageCode;
                }
                $('#ReportTemplateInterfaceEdit-LanguageSelect').append(
                    '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                    desc + '</option>'
                );
                if (ITSSupportedLanguages[i].translations_available) {
                    $('#ReportTemplateInterfaceEdit-SourceLanguageSelect').append(
                        '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                        desc + '</option>'
                    );
                    $('#ReportTemplateInterfaceEdit-TargetLanguageSelect').append(
                        '<option NoTranslate ' + selected + 'value=\"' + ITSSupportedLanguages[i].languageCode + '\">' +
                        desc + '</option>'
                    );
                }
            }
        };

        ITSReportTemplateEditor.prototype.selectSourceLanguageForTranslation = function (value){
            this.translate_source_language = value;
        };

        ITSReportTemplateEditor.prototype.selectTargetLanguageForTranslation = function (value){
            this.translate_target_language = value;
        };

        ITSReportTemplateEditor.prototype.startTranslation = function () {
            ITSInstance.UIController.showInterfaceAsWaitingOn();

            ITSInstance.translator.translateLargeStringWithPlaceholders(
                function (newText) {
                    ITSInstance.UIController.showInterfaceAsWaitingOff();
                    tinyMCE.get("ReportTemplateInterfaceEdit_ReportWriter").setContent(newText);
                }.bind(this),
                function () {
                    ITSInstance.UIController.showInterfaceAsWaitingOff();
                    ITSInstance.UIController.showError("ITSReportTemplateEditor.TranslationFailed", "The report could not be translated at this moment.");
                    },
                tinyMCE.get("ReportTemplateInterfaceEdit_ReportWriter").getContent().toString(),
                this.translate_source_language , this.translate_target_language);
        };

        // register the portlet
        ITSInstance.ReportTemplateSessionController = new ITSReportTemplateEditor();
        ITSInstance.UIController.registerEditor(ITSInstance.ReportTemplateSessionController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#ReportTemplateInterfaceSessionEdit");

        // register the menu items
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.IsReportAuthor) {
                ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#ReportTemplateInterfaceSessionEdit.EditMenu", ITSInstance.translator.translate("#ReportTemplateInterfaceSessionEdit.EditMenu", "Edit report definitions"), "fa-newspaper", "ITSRedirectPath(\'ReportTemplateEditor&TestType=0&ReportType=0\');");
                ITSInstance.UIController.registerMenuItem('#submenuCourseBuilderLI', "#ReportTemplateInterfaceSessionEdit.EditCourseReportMenu", ITSInstance.translator.translate("#ReportTemplateInterfaceSessionEdit.EditCourseReportMenu", "Edit report definitions"), "fa-newspaper", "ITSRedirectPath(\'ReportTemplateEditor&TestType=1000&ReportType=1000\');");
            }
        }, true);
    }
)()// IIFE