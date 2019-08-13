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
    AdminInterfaceSessionEditorDiv = $('<div class="container-fluid" id="AdminInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfaceSessionEditorDiv);

    $(AdminInterfaceSessionEditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionEditor/editor.html', function () {
        // after load html initialisation
        ITSInstance.translator.translateDiv("#AdminInterfaceSessionEdit");
    });

    var ITSSessionEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('c71988fb-0fc6-4321-8a49-69c4f04dd16b', 'Session editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Allows viewing sessions that are new, done or in progress');
        this.path = "Session";
        this.currentSession = {};

        this.testCardElementDone =
            "<div NoTranslate id=\"AdminInterfaceEditSessionEditTestCards%%ID%%\">" +
            "<div class=\"card\">" +
            "<h5 class=\"card-header\">%%TESTTITLE%%</h5>" +
            "<div class=\"card-body col-12 row\">" +
            "<div class=\"col-sm-12\">" +
            "<h5 class=\"card-title\"id=\"AdminInterfaceEditSessionEditTestScores\">Test scores</h5>" +
            "<p class=\"card-text\">%%TESTSCORES%%</p>" +
            "<button type=\"button\"onclick=\"ITSInstance.editSessionController.viewAnswers(%%NR%%);\"class=\"btn-sm btn-success\"><i class=\"fa fa-fw fa-eye aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditViewResults\">View answers</span></button>" +
            "<button type=\"button\"onclick=\"ITSInstance.editSessionController.checkAnswers(%%NR%%);\"class=\"btn-sm btn-success\"><i class=\"fa fa-fw fa-user-edit aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditCheckAnswers\">Check answers</span></button>" +
            "<button type=\"button\"onclick=\"ITSInstance.editSessionController.deleteTest(%%NR%%);\"class=\"btn-sm btn-warning\"><i class=\"fa fa-fw fa-trash aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditDeleteTest\">Delete test</span></button>" +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button type=\"button\"onclick=\"ITSInstance.editSessionController.testReports(%%NR%%);\"class=\"btn-sm btn-success\"><i class=\"fa fa-fw fa-pen-alt aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditReportTest\">Test reports</span></button>" +
            "</div>" +
            //            "<div class=\"col-sm-6\">"+
            //            "<h5 class=\"card-title\"id=\"AdminInterfaceEditSessionEditTestGraphs\">Test graph</h5>"+
            //            "<p class=\"card-text\">%%GRAPH%%</p>"+
            //            "</div>"+
            "</div>" +
            "</div>" +
            "</div>";
        this.testCardElementID = /%%NR%%/g;
        this.testCardElementTracker = /%%I%%/g;
        this.testCardElementTitle = /%%TESTTITLE%%/g;
        this.testCardElementScores = /%%TESTSCORES%%/g;
        this.testCardElementGraph = /%%GRAPH%%/g;
        this.testCardElementProgress = /%%PROGRESS%%/g;
        this.testCardElementStarted = /%%TESTSTART%%/g;
        this.testCardElementScale = /%%SCALE%%/g;
        this.testCardElementScaleName = /%%SCALENAME%%/g;
        this.testCardElementNorm1 = /%%NORM1%%/g;
        this.testCardElementNorm2 = /%%NORM2%%/g;
        this.testCardElementNorm3 = /%%NORM3%%/g;
        this.testCardElementPerc1 = /%%PERC1%%/g;
        this.testCardElementPerc2 = /%%PERC2%%/g;
        this.testCardElementPerc3 = /%%PERC3%%/g;
        this.testCardElementRaw = /%%RAW%%/g;

        this.testCardElementInProgress =
            "<div NoTranslate id=\"AdminInterfaceEditSessionEditTestCards%%NR%%\">" +
            "<div class=\"card\">" +
            "<h5 class=\"card-header\">%%TESTTITLE%%</h5>" +
            "<div class=\"card-body col-12 row\">" +
            "<div class=\"progress col-sm-12\">" +
            "<div class=\"progress-bar-animated progress-bar-striped bg-success\" role=\"progressbar\" notranslate id=\"AdminInterfaceEditSessionEditTestCardsProgress%%NR%%\" style=\"width: %%PROGRESS%%%\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>" +
            "</div>" +
            "<br/>" +
            "<label id=\"AdminInterfaceEditSessionEditTestCardsTestStarted\">Test started : </label>&nbsp;<label id=\"AdminInterfaceEditSessionEditTestCardsTestStarted%%NR%%\">%%TESTSTART%%</label>" +
            "<div class=\"col-sm-12\">" +
            "<button type=\"button\" onclick=\"ITSInstance.editSessionController.restartTest(%%NR%%);\"class=\"btn-sm btn-warning\"><i id=\"AdminInterfaceEditSessionEditRestartTestIcon%%NR%%\" class=\"fa fa-fw fa-recycle aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditRestartTest\">Restart test</span></button>" +
            "<button type=\"button\" onclick=\"ITSInstance.editSessionController.endTest(%%NR%%);\"class=\"btn-sm btn-warning\"><i id=\"AdminInterfaceEditSessionEditEndTestIcon%%NR%%\" class=\"fa fa-fw fa-arrow-right aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditEndTest\">End test</span></button>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";

        this.testCardElementWaitingForStart =
            "<div NoTranslate id=\"AdminInterfaceEditSessionEditTestCards%%NR%%\">" +
            "<div class=\"card\">" +
            "<h5 class=\"card-header\">%%TESTTITLE%%</h5>" +
            "<div class=\"card-body col-12 row\">" +
            "<label id=\"AdminInterfaceEditSessionEditTestCardsTestWaiting\">Test waiting to be started.</label>&nbsp;&nbsp;&nbsp;" +
            "<div><button type=\"button\" onclick=\"ITSInstance.editSessionController.deleteTest(%%NR%%);\"class=\"btn-sm btn-warning\"><i class=\"fa fa-fw fa-trash aria-hidden='true'\"></i><span id=\"AdminInterfaceEditSessionEditDeleteUnstarted\">Delete test</span></button></div>" +
            "</div>" +
            "</div>" +
            "</div>";


        this.scoreMatrixLinePart1 = "  <table notranslate=\"\" class=\"table table-sm\">" +
            "  <thead><tr>" +
            "   <th col='A%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_ScaleHeader_%%NR%%\">Scale</th>" +
            "   <th col='B%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_RawHeader_%%NR%%\" scope=\"col\">Score</th>" +
            "   <th col='C%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_NormHeader1_%%NR%%\" scope=\"col\">Norm <select notranslate=\"\" class=\"form-control form-control-sm\" id=\"AdminInterfaceTestTemplateEditorNorm%%NR%%-Norm1Select\" onchange=\"ITSInstance.editSessionController.selectNormInEditor(1,%%NR%%,this );\"></th>" +
            "   <th col='D%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_PercentileHeader1_%%NR%%\" scope=\"col\">Percentile 1</th>" +
            "   <th col='E%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_NormHeader2_%%NR%%\" scope=\"col\">Norm <select notranslate=\"\" class=\"form-control form-control-sm\" id=\"AdminInterfaceTestTemplateEditorNorm%%NR%%-Norm2Select\" onchange=\"ITSInstance.editSessionController.selectNormInEditor(2,%%NR%%,this );\"></th>" +
            "   <th col='F%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_PercentileHeader2_%%NR%%\" scope=\"col\">Percentile 2</th>" +
            "   <th col='G%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_NormHeader3_%%NR%%\" scope=\"col\">Norm <select notranslate=\"\" class=\"form-control form-control-sm\" id=\"AdminInterfaceTestTemplateEditorNorm%%NR%%-Norm3Select\" onchange=\"ITSInstance.editSessionController.selectNormInEditor(3,%%NR%%,this );\"></th>" +
            "   <th col='H%%NR%%' id=\"AdminInterfaceTestTemplateEditorNorm_PercentileHeader3_%%NR%%\" scope=\"col\">Percentile 3</th>" +
            "  </tr>" +
            "  </thead>";
        this.scoreMatrixLinePart2 = "<tr>" +
            "<td NoTranslate col='A%%NR%%' id='%%SCALE%%_%%NR%%_Scale'>%%SCALENAME%%</td>" +
            "<td NoTranslate col='B%%NR%%' id='%%SCALE%%_%%NR%%_Raw'>%%RAW%%</td>" +
            "<td NoTranslate col='C%%NR%%' id='%%SCALE%%_%%NR%%_Norm1'>%%NORM1%%</td>" +
            "<td NoTranslate col='D%%NR%%' id='%%SCALE%%_%%NR%%_Perc1'>%%PERC1%%</td>" +
            "<td NoTranslate col='E%%NR%%' id='%%SCALE%%_%%NR%%_Norm2'>%%NORM2%%</td>" +
            "<td NoTranslate col='F%%NR%%' id='%%SCALE%%_%%NR%%_Perc2'>%%PERC2%%</td>" +
            "<td NoTranslate col='G%%NR%%' id='%%SCALE%%_%%NR%%_Norm3'>%%NORM3%%</td>" +
            "<td NoTranslate col='H%%NR%%' id='%%SCALE%%_%%NR%%_Perc3'>%%PERC3%%</td>" +
            "</tr>";
        this.scoreMatrixLinePart3 = "</tbody></table>";
    };

    ITSSessionEditor.prototype.init = function () {
    };
    ITSSessionEditor.prototype.editSession = function (Id) {
        console.log("Edit test session requested " + Id);
    };
    ITSSessionEditor.prototype.hide = function () {
        $('#AdminInterfaceSessionEdit').hide();
    };
    ITSSessionEditor.prototype.show = function () {
        if (getUrlParameterValue('SessionID')) {
            this.SessionID = getUrlParameterValue('SessionID');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#AdminInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if (!ITSInstance.companies.currentCompany.detailsLoaded) { setTimeout(this.show.bind(this),1000); return; }
            if (!ITSInstance.screenTemplates.templatesLoaded ) {
                ITSInstance.screenTemplates.loadAvailableScreenTemplates(function () {
                    this.show();
                }.bind(this), function () {
                });
                return;
            }
            if (ITSInstance.companies.currentCompany.outOfCredits()) {
                ITSInstance.UIController.showError('OutOfCredits', 'You have no credit units left. Please order new credit units.', '',
                    "ITSRedirectPath('CreditsOrderByMail');" );
            } else {

                // load the session
//                if ((!this.currentSession) || (this.currentSession.ID != this.SessionID)) {
                    this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
                    ITSInstance.UIController.showInterfaceAsWaitingOn();
                    this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this));
//                } else {
//                    this.sessionLoaded();
//                }
                this.loadAvailableTestsToAdd();
            }
        }
        else // no session id will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };
    ITSSessionEditor.prototype.sessionLoaded = function () {
        // session is loaded
        $('#AdminInterfaceEditSessionEditHeaderName')[0].innerHTML = this.currentSession.Description;
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // to do : check if the session type is OK to be viewed with this viewer
        this.toggleButtons();
        this.generateTestsList();
        this.loadAvailableTestsToAdd();
    };
    ITSSessionEditor.prototype.sessionLoadingFailed = function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("SessionEditor", "SessionLoadingFailed", "The session could not be loaded, please refresh your browser page and try again.");
        history.back();
    };

    ITSSessionEditor.prototype.toggleButtons = function () {
        $('#AdminInterfaceEditSessionEditAddTest').hide();
        $('#AdminInterfaceEditSessionEditArchiveTest').show();
        if (!this.currentSession.Active) $('#AdminInterfaceEditSessionEditArchiveTest').hide();
        $('#AdminInterfaceEditSessionEditUnarchiveTest').show();
        if (this.currentSession.Active) $('#AdminInterfaceEditSessionEditUnarchiveTest').hide();
        $('#AdminInterfaceEditSessionEditResendInvitation').show();
        $('#AdminInterfaceEditSessionEditResendInvitationNoReset').show();
        $('#AdminInterfaceEditSessionEditStartNow').show();
        if (this.currentSession.Status >= 30) {
            $('#AdminInterfaceEditSessionEditResendInvitation').hide();
            $('#AdminInterfaceEditSessionEditResendInvitationNoReset').hide();
            $('#AdminInterfaceEditSessionEditStartNow').hide();
        }
    }

    ITSSessionEditor.prototype.generateTestsList = function (saveAfterCalculate) {
        $('#AdminInterfaceEditSessionEditTestsList').empty();
        this.currentSession.SessionTests.sort(function (a, b) {
            return a.Sequence - b.Sequence;
        });
        var ct = {};
        var template = "";
        var allTestsDone = true;
        if (saveAfterCalculate == undefined) saveAfterCalculate = -1;

        for (var i = 0; i < this.currentSession.SessionTests.length; i++) {
            ct = this.currentSession.SessionTests[i];
            if (ct.Status <= 10) {
                // not started
                template = this.testCardElementWaitingForStart;
                allTestsDone = false;
            } else if (ct.Status <= 20) {
                // in progress
                template = this.testCardElementInProgress;
                allTestsDone = false;
            } else {
                // done
                template = this.testCardElementDone;

                // make sure results are up to date and auto saved back to the server if not present yet
                ct.calculateScores(true, true);

                if (saveAfterCalculate >= 0) {
//                    this.currentSession.SessionTests[saveAfterCalculate].saveToServer(function () {},
//                        function () { });
                }
            }

            // replace tokens
            var percent = Math.round((ct.CurrentPage / ct.TotalPages)  * 100);
            template = template.replace(this.testCardElementID, i);
            template = template.replace(this.testCardElementTitle, ct.testDefinition.Description);
            template = template.replace(this.testCardElementScores, "<div id='AdminInterfaceEditSessionEditTestsTable" + i + "'></div>");
            template = template.replace(this.testCardElementGraph, "<div id='AdminInterfaceEditSessionEditTestsGraph" + i + "'></div>");
            template = template.replace(this.testCardElementProgress, percent);
            template = template.replace(this.testCardElementStarted, ITSToDatePicker(ct.TestStart));

            $('#AdminInterfaceEditSessionEditTestsList').append(template);

            if ((ct.Status > 10) && (ct.Status <= 20)) {
                // set the progress bar
                $('#AdminInterfaceEditSessionEditTestCardsProgress' + i)[0].setAttribute("aria-valuenow",percent);
                $('#AdminInterfaceEditSessionEditTestCardsProgress' + i).text( percent + "%" );
            }

            this.generateNormTable(ct, i, $('#AdminInterfaceEditSessionEditTestsTable' + i));
            var resultsTable = "";
            ITSInstance.translator.translateDiv("#AdminInterfaceSessionEdit");
        }
        if ( (!allTestsDone) && ( $('#AdminInterfaceSessionEdit').is(':visible') ) ) {
            setTimeout( this.refreshSession.bind(this), 60000);
        }
    };

    ITSSessionEditor.prototype.refreshSession = function () {
        this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this));
    };

    ITSSessionEditor.prototype.generateNormTable = function (currentTest, testNr, divElement) {
        divElement.empty();
        var template = this.scoreMatrixLinePart1;
        var totalToAdd = "";
        var perc1Valid = false, perc2Valid = false, perc3Valid = false;
        template = template.replace(this.testCardElementID, testNr);
        //divElement.append(template);
        totalToAdd = template;

        for (var i = 0; i < currentTest.testDefinition.scales.length; i++) {
            if (currentTest.testDefinition.scales[i].showScale) {
                template = this.scoreMatrixLinePart2;
                template = template.replace(this.testCardElementID, testNr);
                template = template.replace(this.testCardElementScale, currentTest.testDefinition.scales[i].scaleVarName);
                template = template.replace(this.testCardElementScaleName, currentTest.testDefinition.scales[i].scaleDescription);
                template = template.replace(this.testCardElementTracker, testNr);

                var normIndex = currentTest.testDefinition.findNormById(currentTest.NormID2)
                if (normIndex >= 0) {
                    currentTest.normScores(normIndex);
                    template = template.replace(this.testCardElementNorm2, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].NormScore);
                    if (currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScoreSet) {
                        template = template.replace(this.testCardElementPerc2, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScore);
                        perc2Valid = true;
                    } else {
                        template = template.replace(this.testCardElementPerc2, '-');
                    }
                } else {
                    template = template.replace(this.testCardElementNorm2, '-');
                }
                var normIndex = currentTest.testDefinition.findNormById(currentTest.NormID3)
                if (normIndex >= 0) {
                    currentTest.normScores(normIndex);
                    template = template.replace(this.testCardElementNorm3, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].NormScore);
                    if (currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScoreSet) {
                        template = template.replace(this.testCardElementPerc3, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScore);
                        perc3Valid = true;
                    } else {
                        template = template.replace(this.testCardElementPerc3, '-');
                    }
                } else {
                    template = template.replace(this.testCardElementNorm3, '-');
                }
                // make sure that norm 1 is always present. In case of accidental saves this is the proper norm. Only one norm is stored.
                var normIndex = currentTest.testDefinition.findNormById(currentTest.NormID1)
                if (normIndex >= 0) {
                    currentTest.normScores(normIndex);
                    template = template.replace(this.testCardElementNorm1, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].NormScore);

                    if (currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScoreSet) {
                        template = template.replace(this.testCardElementPerc1, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].PercentileScore);
                        perc1Valid = true;
                    } else {
                        template = template.replace(this.testCardElementPerc1, '-');
                    }
                } else {
                    template = template.replace(this.testCardElementNorm1, '-');
                }
                template = template.replace(this.testCardElementRaw, currentTest.Scores["__" + currentTest.testDefinition.scales[i].id].Score);

                //divElement.append(template);
                totalToAdd += template;
            }
        }

        template = this.scoreMatrixLinePart3;
        //divElement.append(template);
        totalToAdd += template;
        divElement.append(totalToAdd);

        // load the tests norms
        $('#AdminInterfaceTestTemplateEditorNorm' + testNr + '-Norm1Select').append(this.generateNormSelection(
            currentTest.testDefinition.norms, currentTest.NormID1
        ));
        $('#AdminInterfaceTestTemplateEditorNorm' + testNr + '-Norm2Select').append(this.generateNormSelection(
            currentTest.testDefinition.norms, currentTest.NormID2
        ));
        $('#AdminInterfaceTestTemplateEditorNorm' + testNr + '-Norm3Select').append(this.generateNormSelection(
            currentTest.testDefinition.norms, currentTest.NormID3
        ));

        // switch off unused columns
        if (currentTest.testDefinition.norms.length < 3) {
            // switch off norm 3
            $("[col='H" + testNr + "']").hide();
            $("[col='G" + testNr + "']").hide();
        }
        if (currentTest.testDefinition.norms.length < 2) {
            // switch off norm 2
            $("[col='F" + testNr + "']").hide();
            $("[col='E" + testNr + "']").hide();
        }
        if (currentTest.testDefinition.norms.length < 1) {
            // switch off norm 1
            $("[col='D" + testNr + "']").hide();
            $("[col='C" + testNr + "']").hide();
        }

        // "<td col='A%%NR%%' id='%%SCALE%%_%%NR%%_Scale'>%%SCALENAME%%</td>" +
        // "<td col='B%%NR%%' id='%%SCALE%%_%%NR%%_Raw'>%%RAW%%</td>" +
        // "<td col='C%%NR%%' id='%%SCALE%%_%%NR%%_Norm1'>%%NORM1%%</td>" +
        // "<td col='D%%NR%%' id='%%SCALE%%_%%NR%%_Perc1'>%%PERC1%%</td>" +
        // "<td col='E%%NR%%' id='%%SCALE%%_%%NR%%_Norm2'>%%NORM2%%</td>" +
        // "<td col='F%%NR%%' id='%%SCALE%%_%%NR%%_Perc2'>%%PERC2%%</td>" +
        // "<td col='G%%NR%%' id='%%SCALE%%_%%NR%%_Norm3'>%%NORM3%%</td>" +
        // "<td col='H%%NR%%' id='%%SCALE%%_%%NR%%_Perc3'>%%PERC3%%</td>" +

        if (!perc1Valid) $("[col='D" + testNr + "']").hide();
        if (!perc2Valid) $("[col='F" + testNr + "']").hide();
        if (!perc3Valid) $("[col='H" + testNr + "']").hide();
    };

    ITSSessionEditor.prototype.selectNormInEditor = function (normNr, testNr, normValue) {
        switch (normNr) {
            case 1 :
                this.currentSession.SessionTests[testNr].NormID1 = normValue.value;
                break;
            case 2 :
                this.currentSession.SessionTests[testNr].NormID2 = normValue.value;
                break;
            case 3 :
                this.currentSession.SessionTests[testNr].NormID3 = normValue.value;
                break;
        };
        this.generateTestsList(testNr);
    };

    ITSSessionEditor.prototype.generateNormSelection = function (normsList, defaultNormID) {
        var result = "<option value='00000000-0000-0000-0000-000000000000' notranslate>-</option>";
        var selected = "";
        for (var i = 0; i < normsList.length; i++) {
            selected = '';
            if (normsList[i].id == defaultNormID) {
                selected = "selected='selected' ";
            }
            result += "<option notranslate " + selected + "value ='" + normsList[i].id + "'>" + normsList[i].normDescription + "</option>";
        }
        return result;
    };

    ITSSessionEditor.prototype.viewAnswers = function (testIndex) {
        if (this.currentSession.SessionTests.length > testIndex) {
            var testSessionID = this.currentSession.SessionTests[testIndex].ID;
            ITSInstance.SessionViewAnswersSessionController.currentSession = this.currentSession;
            ITSRedirectPath('SessionViewAnswers&SessionID=' + this.currentSession.ID + '&SessionTestID=' + testSessionID);
        }
    };

    ITSSessionEditor.prototype.testReports = function (testIndex) {
        if (this.currentSession.SessionTests.length > testIndex) {
            var testSessionID = this.currentSession.SessionTests[testIndex].ID;
            ITSInstance.SessionViewReportsSessionController.currentSession = this.currentSession;
            ITSRedirectPath('SessionViewReports&SessionID=' + this.currentSession.ID + '&SessionTestID=' + testSessionID);
        }
    };

    ITSSessionEditor.prototype.loadAvailableTestsToAdd= function () {
        var tempTest;
        $('#AdminInterfaceEditSessionEditAddTestList').empty();
        for (var i=0; i < ITSInstance.tests.testList.length; i++) {
            tempTest = ITSInstance.tests.testList[i];
             $('<a class=\"dropdown-item\" onclick=\"ITSInstance.editSessionController.addTest(\'' +
                 ITSInstance.tests.testList[i].ID +
                 '\');\">' +
                 tempTest.getTestFormatted() +
                 '</a>').appendTo('#AdminInterfaceEditSessionEditAddTestList');
        }
    };

    ITSSessionEditor.prototype.checkAnswers = function (testIndex) {
        if (this.currentSession.SessionTests.length > testIndex) {
            var testSessionID = this.currentSession.SessionTests[testIndex].ID;
            var oneday = new Date();
            oneday.setHours(oneday.getHours() - 24);
            if ( (this.currentSession.SessionTests[testIndex].TestEnd < new Date(2001,1,1) ) ||
                 (this.currentSession.SessionTests[testIndex].testDefinition.Costs <= 0) ||
                 (this.currentSession.SessionTests[testIndex].TestEnd >= oneday) ) {
                ITSInstance.SessionViewAnswersSessionController.currentSession = this.currentSession;
                ITSInstance.UIController.showInterfaceAsWaitingOn(0);
                ITSRedirectPath('SessionViewAnswers&SessionID=' + this.currentSession.ID + '&SessionTestID=' + testSessionID + "&checkAnswers=1");
            } else {
                ITSInstance.UIController.showError("ITSSessionEditor.NoEditTest", "You cannot edit these results any more. Paid test results can only be edited for 24 hours.");
            }
        }
    };

    ITSSessionEditor.prototype.deleteTest = function (index) {
        // are you sure question
        ITSInstance.UIController.showDialog("ITSSessionEditor.DeleteTest", "Delete test", "Are you sure you want to delete this test? If this is the only test in this session then the session will be deleted as well.",
            [{
                btnCaption: "Yes, delete this test",
                btnType: "btn-warning",
                btnOnClick: "ITSInstance.editSessionController.deleteCurrentTest(" + index + ");"
            }, {btnCaption: "No"}]);
    };

    ITSSessionEditor.prototype.deleteCurrentTest = function (index) {
        this.currentSession.SessionTests[index].deleteFromServer(function () {
        }, function () {
        });
        if (this.currentSession.SessionTests.length <= 1) {
            this.currentSession.deleteFromServer(function () {
            }, function () {
            });
            window.history.back();
        } else {
            this.currentSession.SessionTests.splice(index,1);
            this.generateTestsList();
            if (this.currentSession.firstTestToTake() < 0) {
                this.currentSession.Status = 30;
                this.currentSession.saveToServer(function () {}, function () {});
                this.toggleButtons();
            }
        }
    };

    ITSSessionEditor.prototype.endTest = function (index) {
        this.currentSession.SessionTests[index].Status = 30;
        this.currentSession.SessionTests[index].TestEnd = Date.now();
        this.currentSession.EndedAt = Date.now();
        this.currentSession.SessionTests[index].calculateScores(true, true);
        $("#AdminInterfaceEditSessionEditEndTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditEndTestIcon' + index + '" class=\"fa fa-fw fa-life-ring fa-spin \"></i>';
        this.currentSession.SessionTests[index].saveToServer(this.endTestOK.bind(this,index), this.endTestError.bind(this,index));
        if (this.currentSession.firstTestToTake() < 0) {
            this.currentSession.Status = 30;
            this.currentSession.saveToServer(function () {}, function () {});
            this.toggleButtons();
        }
    };
    ITSSessionEditor.prototype.endTestOK = function (index) {
        $("#AdminInterfaceEditSessionEditEndTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditEndTestIcon' + index + '" class=\"fa fa-fw fa-arrow-right \"></i>';
        this.generateTestsList();
    };
    ITSSessionEditor.prototype.endTestError = function (index) {
        $("#AdminInterfaceEditSessionEditEndTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditEndTestIcon' + index + '" class=\"fa fa-fw fa-arrow-right \"></i>';
        ITSInstance.UIController.showError('ITSSessionEditor.EndingTestFailed', 'The test could not be ended at this moment');
        this.generateTestsList();
    };

    ITSSessionEditor.prototype.restartTest = function (index) {
        this.currentSession.Status = 20;
        this.currentSession.saveToServer(function () {}, function () {});
        var oldTest = this.currentSession.SessionTests[index];
        this.currentSession.SessionTests[index] = new ITSCandidateSessionTest(oldTest.myParent, ITSInstance);
        this.currentSession.SessionTests[index].ID = oldTest.ID;
        this.currentSession.SessionTests[index].SessionID = oldTest.SessionID;
        this.currentSession.SessionTests[index].TestID = oldTest.TestID;
        this.currentSession.SessionTests[index].PersID = oldTest.PersID;
        this.currentSession.SessionTests[index].Sequence = oldTest.Sequence;
        this.currentSession.SessionTests[index].TestLanguage = oldTest.TestLanguage;
        this.currentSession.SessionTests[index].NormID1 = oldTest.NormID1;
        this.currentSession.SessionTests[index].NormID2 = oldTest.NormID2;
        this.currentSession.SessionTests[index].NormID3 = oldTest.NormID3;
        this.currentSession.SessionTests[index].testDefinition = oldTest.testDefinition;
        $("#AdminInterfaceEditSessionEditRestartTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditRestartTestIcon' + index + '" class=\"fa fa-fw fa-life-ring fa-spin \"></i>';
        this.currentSession.SessionTests[index].saveToServer(this.restartTestOK.bind(this,index), this.restartTestError.bind(this,index));
    };
    ITSSessionEditor.prototype.restartTestOK = function (index) {
        $("#AdminInterfaceEditSessionEditRestartTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditRestartTestIcon' + index + '" class=\"fa fa-fw fa-arrow-right \"></i>';
        this.generateTestsList();
    };
    ITSSessionEditor.prototype.restartTestError = function (index) {
        $("#AdminInterfaceEditSessionEditRestartTestIcon" + index)[0].outerHTML = '<i id="AdminInterfaceEditSessionEditRestartTestIcon' + index + '" class=\"fa fa-fw fa-arrow-right \"></i>';
        ITSInstance.UIController.showError('ITSSessionEditor.RestartTestFailed', 'The test could not be restarted at this moment');
        this.generateTestsList();
    };

    ITSSessionEditor.prototype.deleteSession = function () {
        ITSInstance.UIController.showDialog("ITSSessionEditor.DeleteSession", "Delete session", "Are you sure you want to delete this session?",
            [{
                btnCaption: "Yes",
                btnType: "btn-warning",
                btnOnClick: "ITSInstance.editSessionController.deleteSessionNow();"
            }, {btnCaption: "No"}]);
    };

    ITSSessionEditor.prototype.deleteSessionNow= function () {
        this.currentSession.deleteSession(function () {},
            function () { ITSInstance.UIController.showError('ITSSessionEditor.DeleteSessionFailed', 'The session could not be deleted at this moment'); }
            );
        setTimeout(function () { window.history.back();},500);
    };

    ITSSessionEditor.prototype.addTest = function (testID) {
        if (!this.currentSession.Active) {
            // if this session is not active then activate it
            this.currentSession.Active = true;
        }
        if (this.currentSession.Status >= 30) this.currentSession.Status = 20;

        if (!this.currentSession.Person.Active ) {
            this.currentSession.Person.Active = true;
            this.currentSession.Person.saveToServer(function () {}, function () {});
            //setTimeout ( function () { ITSInstance.UIController.showError('ITSSessionEditor.PersonUnarchived', 'The person belonging to this session has been assigned a new login password. Please resend the test invitation.'); }, 100 );
        }

        var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList,  testID);
        var newCST = this.currentSession.newCandidateSessionTest(ITSInstance.tests.testList[testIndex]);
        newCST.Sequence = this.currentSession.SessionTests.length + 1;
        newCST.Scores = newCST.testDefinition.prepareScalesStorage(newCST.Scores);
        newCST.Results = newCST.testDefinition.prepareResultsStorage(newCST.Results);
        this.currentSession.resequence();
        this.currentSession.saveToServer(function () {}, function () { ITSInstance.UIController.showError('ITSSessionEditor.AddTestToSessionFailed', 'The test could not be added to the session at this moment'); } );
        newCST.saveToServer(function () {}, function () { ITSInstance.UIController.showError('ITSSessionEditor.AddTestToSessionFailed', 'The test could not be added to the session at this moment'); } ,false);
        this.generateTestsList();
        this.toggleButtons();
    };

    ITSSessionEditor.prototype.archiveSession= function () {
        this.currentSession.Active = false;
        if (this.currentSession.Status < 30) this.currentSession.Status = 30;
        $("#AdminInterfaceEditSessionEditArchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditArchiveTestIcon" class="fa fa-fw fa-life-ring fa-spin "></i>';
        this.currentSession.saveToServer(this.archiveSessionOK.bind(this),this.archiveSessionError.bind(this));
        this.toggleButtons();
    };
    ITSSessionEditor.prototype.unarchiveSession= function () {
        this.currentSession.Active = true;
        // reset this session to busy if there are still tests to take
        if (this.currentSession.firstTestToTake() >= 0) this.currentSession.Status = 20;
        $("#AdminInterfaceEditSessionEditUnarchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditUnarchiveTestIcon" class="fa fa-fw fa-life-ring fa-spin "></i>';
        this.currentSession.saveToServer(this.archiveSessionOK.bind(this),this.archiveSessionError.bind(this));
    };
    ITSSessionEditor.prototype.archiveSessionOK = function () {
        $("#AdminInterfaceEditSessionEditUnarchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditUnarchiveTestIcon" class="fa fa-fw fa-archive "></i>';
        $("#AdminInterfaceEditSessionEditArchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditArchiveTestIcon" class="fa fa-fw fa-archive "></i>';
        this.toggleButtons();
    };
    ITSSessionEditor.prototype.archiveSessionError = function () {
        $("#AdminInterfaceEditSessionEditUnarchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditUnarchiveTestIcon" class="fa fa-fw fa-archive "></i>';
        $("#AdminInterfaceEditSessionEditArchiveTestIcon" )[0].outerHTML = '<i id="AdminInterfaceEditSessionEditArchiveTestIcon" class="fa fa-fw fa-archive "></i>';
        ITSInstance.UIController.showError('ITSSessionEditor.ArchiveSessionFailed', 'The session archive status could not be changed at this moment');
    };

    ITSSessionEditor.prototype.resendInvitation = function (passwordReset) {
        if (ITSInstance.users.currentUser.IsPasswordManager) {
            this.currentSession.Person.requestPassword(this.resendInvitationContinue.bind(this,passwordReset),
                function () { ITSInstance.UIController.showError("SessionEditor", "GettingPasswordFailed", "The users password could not be retrieved. Please refresh your browser page and try again."); }
                );
        } else {
            this.resendInvitationContinue(passwordReset);
        }
    };

    ITSSessionEditor.prototype.resendInvitationContinue = function (passwordReset) {
        ITSInstance.SessionMailerSessionController.currentSession = this.currentSession;
        if (!ITSInstance.users.currentUser.IsPasswordManager) {
            this.currentSession.Person.Password = "";
        }
        if (passwordReset) {
            this.currentSession.Person.regeneratePassword();
            this.currentSession.Person.saveToServer(function () {}, function () {});
        }
        ITSRedirectPath('SessionMailer&SessionID=' + this.currentSession.ID);
    };

    ITSSessionEditor.prototype.startNowSession = function () {
        this.currentSession.Person.regeneratePassword();
        this.currentSession.Person.saveToServer(this.startNowSessionCallback.bind(this),
            function () { ITSInstance.UIController.showError("SessionEditor", "SessionStartFailed", "The session could not be started, please refresh your browser page and try again."); } );
    };
    ITSSessionEditor.prototype.startNowSessionCallback = function () {
        // redirect to login screen
        ITSInstance.logoutController.logout("UserID=" + this.currentSession.Person.EMail + "&Password=" + this.currentSession.Person.Password);
    };

    ITSSessionEditor.prototype.changeSession = function () {
        ITSInstance.changeSessionController.currentSession = this.currentSession;
        ITSRedirectPath('ChangeSession&SessionID=' + this.currentSession.ID);
    };

    // register the portlet
    ITSInstance.editSessionController = new ITSSessionEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.editSessionController);
})()// IIFE
