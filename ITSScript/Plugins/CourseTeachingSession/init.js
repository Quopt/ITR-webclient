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
    var EditorDiv = $('<div class="container-fluid" id="CourseTeachingSessionInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/CourseTeachingSession/editor.html', function () {
       // things to do after loading the html
    });

    var ITSCourseTeachingSessionEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('215c9527-8c31-47b6-b24b-1004a24ac456', 'CourseTeachingSession guidance', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Show guidance to the teacher during the teaching session');
        this.path = "CourseTeachingSession";

        this.teachingCardElementNoUIElements =
            "<div NoTranslate class=\"col-12\" id=\"CourseTeachingSessionGuidance%%ID%%\" style='break-inside: avoid; break-before: auto;'>" +
            "<div class=\"card\">" +
            "<h3 class=\"card-header\">%%SCREENNUMBER%%</h3>" +
            "<div class=\"card-body col-12 row\">" +
            "<div class=\"col-sm-12\">" +
            "<h4 class=\"card-title\"id=\"CourseTeachingSessionGuidanceExplanationHeader\">Guidance text for this screen</h4>" +
            "<p class=\"card-text\">%%SCREENEXPLANATION%%</p>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        this.teachingCardElementScreenNumber = /%%SCREENNUMBER%%/g;
        this.teachingCardElementScreenExplanation = /%%SCREENEXPLANATION%%/g;
    };

    ITSCourseTeachingSessionEditor.prototype.init=function () {

    };

    ITSCourseTeachingSessionEditor.prototype.hide= function () {
        $('#CourseTeachingSessionInterfaceSessionEdit').hide();
    };

    ITSCourseTeachingSessionEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        if (ITSInstance.testTakingController.InTestTaking) $('#NavbarsAdmin').hide();
        $('#NavBarsFooter').show();
        $('#CourseTeachingSessionInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        this.loadSession();
        setTimeout(this.teachingSessionMonitoring.bind(this), 1000);
    };

    ITSCourseTeachingSessionEditor.prototype.loadSession = function() {
        this.SessionID = getUrlParameterValue('SessionID');
        ITSLogger.logMessage(logLevel.INFO,"loading teaching session %%SessionID%%", this);
        delete this.currentSession;
        this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
        ITSInstance.UIController.showInterfaceAsWaitingOn(0);

        $('#CourseTeachingSessionInformationButtonStart').attr('disabled',true);
        $('#CourseTeachingSessionInformationButtonStop').attr('disabled',true);

        this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this));
    };

    ITSCourseTeachingSessionEditor.prototype.sessionLoaded = function () {
        ITSLogger.logMessage(logLevel.INFO, "Teaching session completely loaded %%SessionID%%", this);
        $('#CourseTeachingSessionGuidanceTestHeader').text(this.currentSession.Description);
        this.currentSession.Person.requestPassword(this.readyForStartTeaching.bind(this), this.sessionLoadingFailed.bind(this));
    };

    ITSCourseTeachingSessionEditor.prototype.readyForStartTeaching= function () {
        $('#CourseTeachingSessionInformationButtonStart').attr('disabled',false);
        $('#CourseTeachingSessionInformationButtonStop').attr('disabled',true);
        ITSInstance.UIController.showInterfaceAsWaitingOff();
    };

    ITSCourseTeachingSessionEditor.prototype.startSession = function () {
        if (this.currentSession.Status >= 30) {
            this.currentSession.Status = 20;
            this.currentSession.SessionTests[this.currentSession.SessionTests.length-1].CurrentPage = this.currentSession.SessionTests[this.currentSession.SessionTests.length-1].TotalPages-1;
            this.currentSession.SessionTests[this.currentSession.SessionTests.length-1].Status = 20;
            this.currentSession.saveToServerIncludingTests(this.startSessionNow.bind(this),this.sessionLoadingFailed.bind(this));
        } else {
            this.startSessionNow();
        }
    };

    ITSCourseTeachingSessionEditor.prototype.startSessionNow = function () {
        this.teachingWindow = window.open(Global_OriginalURL + "?AutoLogin&UserID=" + this.currentSession.Person.EMail + "&Password=" + this.currentSession.Person.Password, '', "resizable");
    };

    ITSCourseTeachingSessionEditor.prototype.stopSession = function () {
        if (typeof this.teachingWindow != "undefined") {
            this.teachingWindow.close();
            delete this.teachingWindow;
            this.stopPublicSessionURL();
        }
    };

    ITSCourseTeachingSessionEditor.prototype.teachingSessionMonitoring = function () {
        if ($('#CourseTeachingSessionHeader').is(":visible")) {
            setTimeout(this.teachingSessionMonitoring.bind(this), 1000);

            try {
                if (ITSInstance.CourseTeachingSessionSessionController.teachingWindow.closed) {
                    delete this.teachingWindow;
                    this.stopPublicSessionURL();
                    this.loadSession();
                }
            } catch (err) { delete this.teachingWindow; }

            $('#CourseTeachingSessionInformationButtonStop').attr('disabled',(typeof this.teachingWindow == "undefined"));
            $('#CourseTeachingSessionInformationButtonStart').attr('disabled',(typeof this.teachingWindow != "undefined"));

            if (typeof this.teachingWindow != "undefined") {
                var template = this.teachingCardElementNoUIElements;
                var currentPage = this.teachingWindow.ITSInstance.testTakingController.currentSessionTest.CurrentPage;
                var currentScreen = this.teachingWindow.ITSInstance.testTakingController.currentTestDefinition.screens[this.teachingWindow.ITSInstance.testTakingController.currentSessionTest.CurrentPage];
                try {
                    var previousScreen = this.teachingWindow.ITSInstance.testTakingController.currentTestDefinition.screens[this.teachingWindow.ITSInstance.testTakingController.currentSessionTest.CurrentPage-1];
                } catch (err) { };
                try {
                    var nextScreen = this.teachingWindow.ITSInstance.testTakingController.currentTestDefinition.screens[this.teachingWindow.ITSInstance.testTakingController.currentSessionTest.CurrentPage+1];
                } catch (err) { };

                template = template.replace(this.teachingCardElementScreenNumber, ITSInstance.translator.translate("ITSCourseTeachingSessionEditor.currentScreenLabel", "Currently at screen #") + currentPage);
                template = template.replace(this.teachingCardElementScreenExplanation, currentScreen.remarks);

                $('#CourseTeachingSessionGuidanceMain').empty();
                $('#CourseTeachingSessionGuidanceMain').append(template);

                template = this.teachingCardElementNoUIElements;
                template = template.replace(this.teachingCardElementScreenNumber, ITSInstance.translator.translate("ITSCourseTeachingSessionEditor.previousScreenLabel", "Previous screen #") + (currentPage-1));
                try {
                    template = template.replace(this.teachingCardElementScreenExplanation, previousScreen.remarks);
                } catch (err) {
                    template = template.replace(this.teachingCardElementScreenExplanation, '...');
                };
                $('#CourseTeachingSessionGuidanceLeft').empty();
                $('#CourseTeachingSessionGuidanceLeft').append(template);

                template = this.teachingCardElementNoUIElements;
                template = template.replace(this.teachingCardElementScreenNumber,  ITSInstance.translator.translate("ITSCourseTeachingSessionEditor.nextScreenLabel", "Next screen #") + (currentPage+1));
                try {
                    template = template.replace(this.teachingCardElementScreenExplanation, nextScreen.remarks);
                } catch (err) {
                    template = template.replace(this.teachingCardElementScreenExplanation, '...');
                };
                $('#CourseTeachingSessionGuidanceRight').empty();
                $('#CourseTeachingSessionGuidanceRight').append(template);

                // re-translate the portlet
                ITSInstance.translator.translateDiv("#CourseTeachingSessionInterfaceSessionEdit");
            } else {
                $('#CourseTeachingSessionGuidanceRight').empty();
                $('#CourseTeachingSessionGuidanceLeft').empty();
                $('#CourseTeachingSessionGuidanceMain').empty();
                this.stopSession();
            }
        }
    };

    ITSCourseTeachingSessionEditor.prototype.showPublicSessionURL = function () {
        // show the URL and create the session in the meantime
        this.newPublicSession = this.currentSession.clone();
        if (typeof this.currentSession.PluginData.teachingSession == "undefined") {
            this.currentSession.PluginData.teachingSession = {};
            this.currentSession.PluginData.teachingSession.PublicSessionID = newGuid();
            this.currentSession.PluginData.teachingSession.PublicPersonID = newGuid();
            this.currentSession.saveToServer(function () {}, function () {});
        }
        this.newPublicSession.ID = this.currentSession.PluginData.teachingSession.PublicSessionID;
        for (var i=0; i < this.newPublicSession.SessionTests.length; i++) {
            this.newPublicSession.SessionTests[i].SessionID = this.newPublicSession.ID;
        }
        this.newPublicSession.SessionType = 1200;
        this.newPublicSession.regenerateCandidate();
        this.newPublicSession.Person.EMail = this.newPublicSession.Description;
        this.newPublicSession.Person.ID = this.currentSession.PluginData.teachingSession.PublicPersonID;
        this.newPublicSession.Person.PersonType = 1000;
        this.newPublicSession.relinkToCurrentPersonID();
        this.newPublicSession.saveToServerIncludingTestsAndPerson(function(){},function(){},false, false);
        ITSInstance.UIController.showInfo('', location.protocol + '//' + location.host + location.pathname.replace("/default.htm","/") + "?Poll=" + this.newPublicSession.ShortLoginCode)
    };

    ITSCourseTeachingSessionEditor.prototype.stopPublicSessionURL = function (OnSuccess) {
        var newPublicSession = this.currentSession.clone();
        newPublicSession.ID = this.currentSession.PluginData.teachingSession.PublicSessionID;
        newPublicSession.Person.ID = this.currentSession.PluginData.teachingSession.PublicPersonID;
        if (typeof OnSuccess == 'undefined') OnSuccess = function () {};
        newPublicSession.deleteGroupSessionQuick(OnSuccess, function () {});
        newPublicSession.Person.deleteFromServer(function () {},function () {});
    };

    ITSCourseTeachingSessionEditor.prototype.sessionLoadingFailed = function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("CourseTeachingSessionEditor.SessionLoadingFailed", "The session could not be loaded at this moment, please refresh your browser page and try again.", "", "history.back();");
    };

    // register the portlet
    ITSInstance.CourseTeachingSessionSessionController = new ITSCourseTeachingSessionEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.CourseTeachingSessionSessionController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#CourseTeachingSessionInterfaceSessionEdit");


})()// IIFE