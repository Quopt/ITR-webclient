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
    var EditorDiv = $('<div class="container-fluid" id="SessionViewAnswersInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionViewAnswers/editor.html', function () {
       // things to do after loading the html
        ITSInstance.translator.translateDiv("#SessionViewAnswersInterfaceSessionEdit");
    });

    var ITSSessionViewAnswersEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('a45c8b40-e34b-4f47-9c1b-e8598c0ae8ea', 'SessionViewAnswers editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'View the answers of a test in a session');
        this.path = "SessionViewAnswers";
        this.currentSession = {};
    };

    ITSSessionViewAnswersEditor.prototype.init=function () {

    };

    ITSSessionViewAnswersEditor.prototype.hide= function () {
        $('#SessionViewAnswersInterfaceSessionEdit').hide();
    };

    ITSSessionViewAnswersEditor.prototype.show=function () {
        if ((getUrlParameterValue('SessionID')) && (getUrlParameterValue('SessionTestID'))) {
            this.SessionID = getUrlParameterValue('SessionID');
            this.SessionTestID = getUrlParameterValue('SessionTestID');
            this.checkAnswers = "";
            if (getUrlParameterValue('checkAnswers')) this.checkAnswers = getUrlParameterValue('checkAnswers');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#SessionViewAnswersInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if (!ITSInstance.companies.currentCompany.detailsLoaded) { setTimeout(this.show.bind(this),1000); return; }
            if (ITSInstance.companies.currentCompany.outOfCredits()) {
                ITSInstance.UIController.showError('OutOfCredits', 'You have no credit units left. Please order new credit units.', '',
                    "ITSRedirectPath('CreditsOrderByMail');");
            } else {
                if ((!this.currentSession) || (this.currentSession.ID != this.SessionID)) {
                    // load the session
                    this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
                    this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadError.bind(this));
                } else {
                    this.sessionLoaded();
                }


                $(window).off('popstate');
                $(window).on('popstate', function (e) {
                    $("#SessionViewAnswersInterfaceEditTestAnswers").empty();
                });
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSSessionViewAnswersEditor.prototype.sessionLoaded =function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // try to locate the test id in the session
        var ct = {};
        var found = -1;
        for (var i=0; i < this.currentSession.SessionTests.length; i++) {
            ct = this.currentSession.SessionTests[i];
            if (ct.ID == this.SessionTestID) {
                found = i;
                break;
            }
        }
        this.currentTestIndex = found;
        if (found == -1 ) {
            this.sessionLoadError();
        } else {
            // score and norm test
            //this.currentSession.SessionTests[found].calculateScores(true,true);

            // setup the autosave support in the test taking controller for non test taking controller saves
            ITSInstance.testTakingController.autoStoreSessionTest =  this.saveTestResults.bind(this);

            // generate the test answers overview
            var PnPchecker = "";
            if (this.checkAnswers != "") {PnPchecker = true;}
            this.genNumber = "" + getNewSimpleGeneratorNumber('SessionViewAnswersInterfaceEdit_gen', 9999)

            
            $("#SessionViewAnswersInterfaceEditTestAnswers").empty();
            this.currentSession.SessionTests[found].testDefinition.generateQuestionOverview( "SessionViewAnswersInterfaceEditTestAnswers",
                this.currentSession.SessionTests[found].Results, true, "_" + this.checkAnswers + this.genNumber);
            ITSInstance.UIController.showInterfaceAsWaitingOff();

            // disable all controls
            if (!PnPchecker) {
                $("#SessionViewAnswersInterfaceEditTestAnswers *").attr("disabled", true);
            } else {
                // add a save button
                $("#SessionViewAnswersInterfaceEditTestAnswers").append ('<button type="button" class="btn btn-default btn-success" id="SessionViewAnswersInterfaceEditTestAnswers_saveButton" onclick="ITSInstance.SessionViewAnswersSessionController.saveTestResults();"><i id="SessionViewAnswersInterfaceEditTestAnswers-saveIcon" class="fa fa-fw fa-thumbs-up"></i> <span id="SessionViewAnswersInterfaceEditTestAnswers-saveButtonLabel">Save changes</span></button>')
            }
        }
    };

    ITSSessionViewAnswersEditor.prototype.saveTestResults = function () {
        var oneday = new Date();
        oneday.setHours(oneday.getHours() - 24);
        if ( (this.currentSession.SessionTests[this.currentTestIndex].TestEnd < new Date(2001,1,1) ) ||
            (this.currentSession.SessionTests[this.currentTestIndex].testDefinition.Costs <= 0) ||
            (this.currentSession.SessionTests[this.currentTestIndex].TestEnd >= oneday) ) {
                // this.currentTestDefinition.screens[this.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(this.currentSessionTest.Results);
                this.currentSession.SessionTests[this.currentTestIndex].testDefinition.updateResultsStorageFromQuestionOverview("SessionViewAnswersInterfaceEditTestAnswers",
                    this.currentSession.SessionTests[this.currentTestIndex].Results, true, "_" + this.checkAnswers + this.genNumber);
                $('#SessionViewAnswersInterfaceEditTestAnswers-saveIcon')[0].outerHTML = "<i id='SessionViewAnswersInterfaceEditTestAnswers-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
                this.currentSession.SessionTests[this.currentTestIndex].saveToServer( this.saveSessionTestOK.bind(this), this.saveSessionTestError.bind(this) );
        } else {
            ITSInstance.UIController.showError("ITSSessionEditor.NoEditTest", "You cannot edit these results any more. Paid test results can only be edited for 24 hours.");
        }
    };

    ITSSessionViewAnswersEditor.prototype.saveSessionTestOK = function () {
        $('#SessionViewAnswersInterfaceEditTestAnswers-saveIcon')[0].outerHTML = "<i id='SessionViewAnswersInterfaceEditTestAnswers-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
    };

    ITSSessionViewAnswersEditor.prototype.saveSessionTestError = function () {
        $('#SessionViewAnswersInterfaceEditTestAnswers-saveIcon')[0].outerHTML = "<i id='SessionViewAnswersInterfaceEditTestAnswers-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
        ITSInstance.UIController.showError("SessionViewAnswersEditor", "SaveTestFailed", "The test information could not be saved, please refresh your browser page and try again.");
    };

    ITSSessionViewAnswersEditor.prototype.sessionLoadError =function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("SessionViewAnswersEditor", "SessionLoadingFailed", "The session could not be loaded, please refresh your browser page and try again.");
        history.back();
    };

    // register the portlet
    ITSInstance.SessionViewAnswersSessionController = new ITSSessionViewAnswersEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.SessionViewAnswersSessionController);

    // register the menu items if applicable

})()// IIFE
