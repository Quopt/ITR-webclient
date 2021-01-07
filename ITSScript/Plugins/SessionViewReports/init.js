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
//# sourceURL=SessionViewReports/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="SessionViewReportsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionViewReports/editor.html', function () {
       // things to do after loading the html
        ITSInstance.translator.translateDiv("#SessionViewReportsInterfaceSessionEdit");
    });

    var ITSSessionViewReportsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('a45c8b40-e34b-4f47-9c1b-e8598c0ae8ea', 'SessionViewReports editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'View the answers of a test in a session');
        this.path = "SessionViewReports";
        this.currentSession = {};
    };

    ITSSessionViewReportsEditor.prototype.init=function () {

    };

    ITSSessionViewReportsEditor.prototype.hide= function () {
        $('#SessionViewReportsInterfaceSessionEdit').hide();
    };

    ITSSessionViewReportsEditor.prototype.show=function () {
        if ((getUrlParameterValue('SessionID')) && (getUrlParameterValue('SessionTestID'))) {
            this.SessionID = getUrlParameterValue('SessionID');
            this.SessionTestID = getUrlParameterValue('SessionTestID');
            this.checkAnswers = "";
            if (getUrlParameterValue('checkAnswers')) this.checkAnswers = getUrlParameterValue('checkAnswers');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#SessionViewReportsInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if (!ITSInstance.companies.currentCompany.detailsLoaded) { setTimeout(this.show.bind(this),1000); return; }
            if (ITSInstance.companies.currentCompany.outOfCredits()) {
                ITSInstance.UIController.showError('OutOfCredits', 'You have no credit units left. Please order new credit units.', '',
                    "ITSRedirectPath('CreditsOrderByMail');" );
            } else {
                if ((!this.currentSession) || (this.currentSession.ID != this.SessionID)) {
                    // load the session
                    this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
                    ITSInstance.UIController.showInterfaceAsWaitingOn(0);
                    this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadError.bind(this));
                } else {
                    this.sessionLoaded();
                }

                $(window).off('popstate');
                $(window).on('popstate', function (e) {
                    $("#SessionViewReportsInterfaceEditTestAnswers").empty();
                });
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSSessionViewReportsEditor.prototype.sessionLoaded =function () {
        if (! ITSInstance.reports.listLoaded) {
            ITSInstance.reports.loadAvailableReportsList(this.sessionLoaded.bind(this), this.sessionLoadError.bind(this));
        } else {
            ITSInstance.UIController.showInterfaceAsWaitingOff();
            // try to locate the test id in the session
            var ct = {};
            var found = -1;
            for (var i = 0; i < this.currentSession.SessionTests.length; i++) {
                ct = this.currentSession.SessionTests[i];
                if (ct.ID == this.SessionTestID) {
                    found = i;
                    this.currentSessionTest = ct;
                    break;
                }
            }
            this.currentTestIndex = found;
            if (found == -1) {
                this.sessionLoadError();
            } else {
                // generate the test reports overview
                $("#SessionViewReportsReportContent").empty();
                // load the tests in the dropdown
                $('#SessionViewReportsSelectHeaderDropdownButtonOptions').empty();

                var reportsFound = 0;
                var firstReportID = "";
                for (i = 0; i < ITSInstance.reports.reportsList.length; i++) {
                    if (ITSInstance.reports.reportsList[i].TestID == this.currentSessionTest.TestID) {
                        $('#SessionViewReportsSelectHeaderDropdownButtonOptions').append('<button class="dropdown-item" type="button" onclick="ITSInstance.SessionViewReportsSessionController.showReport(\'' + ITSInstance.reports.reportsList[i].ID + '\');">' +
                            ITSInstance.reports.reportsList[i].getReportDescriptionWithDBIndicator() + '</button>');
                        reportsFound++;
                        if (firstReportID == "") {
                            firstReportID = ITSInstance.reports.reportsList[i].ID;
                        }
                    }
                }

                if (reportsFound == 0) {
                    ITSInstance.UIController.showInfo('SessionViewReports.NoReports', 'There are no reports to show for this test.', "", "window.history.back();");
                }

                if (reportsFound >= 1) {
                    this.showReport(firstReportID);
                }

            }
        }
    };

    ITSSessionViewReportsEditor.prototype.sessionLoadError =function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("SessionViewReportsEditor.SessionLoadingFailed", "The session could not be loaded, please refresh your browser page and try again.");
        history.back();
    };
    ITSSessionViewReportsEditor.prototype.reportLoadError =function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("SessionViewReportsEditor.ReportLoadingFailed", "The report could not be loaded, please refresh your browser page and try again.");
        history.back();
    };

    ITSSessionViewReportsEditor.prototype.showReport =function (reportID) {
        // locate the report
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        $('#SessionViewReportsReportOriginalCheck').hide();
        $('#SessionViewReportsReportModifiedCheck').hide();

        var repToGen = ITSInstance.reports.findReportByID(ITSInstance.reports.reportsList, reportID);
        if (!repToGen.detailsLoaded) {
            ITSInstance.UIController.showInterfaceAsWaitingOn(0);
            repToGen.loadDetailDefinition(this.showReport.bind(this,reportID), this.reportLoadError.bind(this) );
        } else if (! this.currentSession.generatedReports.listLoaded) {
            this.currentSession.generatedReports.loadGeneratedReportsForSession(this.showReport.bind(this,reportID), this.reportLoadError.bind(this));
        }
        else {
            if (repToGen) {
                this.currentReport = repToGen;
                var storedReport = this.currentSession.generatedReports.findFirst(reportID);
                var reportText = "";
                if (typeof storedReport != "undefined" ){
                    $('#SessionViewReportsReportModifiedCheck').show();
                    if (storedReport.detailsLoaded) {
                        reportText = storedReport.ReportText;
                    } else {
                        storedReport.loadDetail(function (newContent) {
                            tinyMCE.get("SessionViewReportsReportContent").setContent( newContent );
                        }.bind(this), function () {});
                        return;
                    }
                } else {
                    $('#SessionViewReportsReportOriginalCheck').show();
                    reportText = repToGen.generateTestReport(this.currentSession, this.currentSessionTest, false);
                }
                tinyMCE.get("SessionViewReportsReportContent").setContent( reportText );
            }
        }
    };

    ITSSessionViewReportsEditor.prototype.saveReport = function () {
        var storedReport = this.currentSession.generatedReports.findFirst(this.currentReport.ID);
        if (typeof storedReport != "undefined" ) {
            storedReport.ReportText = tinyMCE.get("SessionViewReportsReportContent").getContent();
            storedReport.saveToServer(function () {}, function () {});
        } else {
            this.currentSession.generatedReports.newReport(this.currentReport.ID, this.currentReport.Description, tinyMCE.get("SessionViewReportsReportContent").getContent());
            storedReport = this.currentSession.generatedReports.findFirst(this.currentReport.ID);
            storedReport.saveToServer(function () {}, function () {});
        };
        $('#SessionViewReportsReportModifiedCheck').show();
        $('#SessionViewReportsReportOriginalCheck').hide();
    };

    ITSSessionViewReportsEditor.prototype.deleteStoredReport = function () {
        this.currentSession.generatedReports.deleteOne(this.currentReport.ID, true, function () {}, function () {});
        this.showReport(this.currentReport.ID);
    };

    ITSSessionViewReportsEditor.prototype.downloadReportAsDoc = function () {
        tinyMCE.triggerSave();
        Export2Doc(tinyMCE.get("SessionViewReportsReportContent").getContent(), this.currentReport.Description );
    };


    ITSSessionViewReportsEditor.prototype.showOriginalReport = function () {
        reportText = this.currentReport.generateTestReport(this.currentSession, this.currentSessionTest, false);
        tinyMCE.get("SessionViewReportsReportContent").setContent( reportText );
        $('#SessionViewReportsReportModifiedCheck').hide();
        $('#SessionViewReportsReportOriginalCheck').show();
    };

    ITSSessionViewReportsEditor.prototype.showModifiedReport = function () {
        this.showReport(this.currentReport.ID);
    };

    // register the portlet
    ITSInstance.SessionViewReportsSessionController = new ITSSessionViewReportsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.SessionViewReportsSessionController);

    // register the menu items if applicable

})()// IIFE