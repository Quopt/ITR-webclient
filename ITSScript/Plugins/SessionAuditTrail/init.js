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
    var EditorDiv = $('<div class="container-fluid" id="SessionAuditTrailInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/SessionAuditTrail/editor.html', function () {
       // things to do after loading the html
    });

    var ITSSessionAuditTrailEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('bfad5c2c-2514-461c-b521-2d28fcaa83be', 'SessionAuditTrail editor', '1.0', 'Copyright 2020 Quopt IT Services BV', 'View the audit trail of a session');
        this.path = "SessionAuditTrail";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSSessionAuditTrailEditor_When\" scope=\"col\">Change date/time</th>" +
            "   <th id=\"ITSSessionAuditTrailEditor_Who\" scope=\"col\">By who</th>" +
            "   <th id=\"ITSSessionAuditTrailEditor_Message\" scope=\"col\">Message</th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%DATETIME%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%WHO%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate>%%MESSAGE%%</span></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mNR = /%%NR%%/g;
        this.mDATETIME = /%%DATETIME%%/g;
        this.mWHO = /%%WHO%%/g;
        this.mMESSAGE = /%%MESSAGE%%/g;
    };

    ITSSessionAuditTrailEditor.prototype.init=function () {
    };

    ITSSessionAuditTrailEditor.prototype.hide= function () {
        $('#SessionAuditTrailInterfaceSessionEdit').hide();
    };

    ITSSessionAuditTrailEditor.prototype.show=function () {
        if (getUrlParameterValue('SessionID')) {
            this.SessionID = getUrlParameterValue('SessionID');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#SessionAuditTrailInterfaceSessionEdit').show();
            $('#SessionAuditTrailObjectTypeHeader').hide();
            $('#SessionAuditTrailInterfaceEditHeader').show()
            ITSInstance.UIController.initNavBar();

            // make sure all necessary stuff is loaded
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            if (!ITSInstance.companies.currentCompany.detailsLoaded) { setTimeout(this.show.bind(this),1000); return; }
            if (!ITSInstance.screenTemplates.templatesLoaded ) {
                ITSInstance.screenTemplates.loadAvailableScreenTemplates(function () {
                    this.show();
                }.bind(this), function () {
                });
                return;
            }

            if (typeof this.personArray == "undefined") {
                this.personArray = {};
            }

            // load the session and generate the overview
            this.currentSession = ITSInstance.candidateSessions.newCandidateSession();
            ITSInstance.UIController.showInterfaceAsWaitingOn(0);
            $('#SessionAuditTrailList').empty();
            this.currentSession.loadSession(this.SessionID, this.sessionLoaded.bind(this), this.sessionLoadingFailed.bind(this));
        }
        else if (getUrlParameterValue('ObjectType')) {
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#SessionAuditTrailInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();
            ITSInstance.UIController.showInterfaceAsWaitingOn();
            $('#SessionAuditTrailInterfaceEditHeader').hide();
            $('#SessionAuditTrailObjectTypeHeader').show();

            this.loadByObjectType(getUrlParameterValue('ObjectType'));
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSSessionAuditTrailEditor.prototype.sessionLoaded = function () {
        // session is loaded now load the audit trail
        this.currentSession.loadAuditTrail(this.auditTrailLoaded.bind(this), this.sessionLoadingFailed.bind(this));
    };
    ITSSessionAuditTrailEditor.prototype.sessionLoadingFailed = function () {
        // go back to the previous page and show error
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("SessionAuditTrail.SessionLoadingFailed", "The session could not be loaded at this moment, please refresh your browser page and try again.", "", "history.back();");
    };

    ITSSessionAuditTrailEditor.prototype.loadByObjectType = function (otype) {
        this.currentSession = {};
        this.currentSession.AuditTrail = {};
        this.personArray = {};
        ITSInstance.JSONAjaxLoader('audittrail/objecttype/' + otype, this.currentSession.AuditTrail, this.auditTrailLoaded.bind(this), this.sessionLoadingFailed.bind(this), "ITSObject", 0, 999, "CreateDate desc");
    };

    ITSSessionAuditTrailEditor.prototype.auditTrailLoaded = function () {
        // session and audit trail are loaded, check if we have all persons
        for (var i=0; i < this.currentSession.AuditTrail.length; i++) {
            if (this.currentSession.AuditTrail[i].UserID != '00000000-0000-0000-0000-000000000000') {
                if (typeof this.personArray[this.currentSession.AuditTrail[i].UserID] == "undefined") {
                    // first load the person and then try again
                    this.personArray[this.currentSession.AuditTrail[i].UserID] = {};
                    this.personArray[this.currentSession.AuditTrail[i].UserID].EMail =
                        ITSInstance.translator.getTranslatedString("SessionAuditTrail.init.js", "PersonNotFound", "Unknown");
                    ITSInstance.JSONAjaxLoader('persons/' + this.currentSession.AuditTrail[i].UserID,
                        this.personArray[this.currentSession.AuditTrail[i].UserID],
                        this.auditTrailLoaded.bind(this), this.auditTrailLoaded.bind(this));
                    ITSInstance.JSONAjaxLoader('logins/' + this.currentSession.AuditTrail[i].UserID,
                        this.personArray[this.currentSession.AuditTrail[i].UserID],
                        function () {
                        }, function () {
                        });
                    return;
                }
            }
        }
        setTimeout(this.generateAuditTrail.bind(this), 1000);
    };

    ITSSessionAuditTrailEditor.prototype.generateAuditTrail = function () {
        // all data loaded, show the audit trail on screen
        $('#SessionAuditTrailList').empty();
        var newTable = this.tablePart1;
        var rowText = "";
        for (var i=0; i < this.currentSession.AuditTrail.length; i++) {
            rowText = this.tablePart2;

            rowText = rowText.replace( this.mNR, i+1);
            rowText = rowText.replace( this.mDATETIME, convertISOtoITRDate(this.currentSession.AuditTrail[i].CreateDate));
            if (this.currentSession.AuditTrail[i].UserID == '00000000-0000-0000-0000-000000000000') {
                rowText = rowText.replace(this.mWHO, ITSInstance.translator.getTranslatedString("SessionAuditTrail.init.js", "PersonNotFound", "Unknown"));
            }
            else if (typeof this.personArray[this.currentSession.AuditTrail[i].UserID].Email == "undefined") {
                rowText = rowText.replace(this.mWHO, this.personArray[this.currentSession.AuditTrail[i].UserID].EMail);
            } else {
                rowText = rowText.replace(this.mWHO, this.personArray[this.currentSession.AuditTrail[i].UserID].Email);
            }

            var newVal = {};
            try {
                newVal = JSON.parse(this.currentSession.AuditTrail[i].NewData);
                newVal.TestID = ITSInstance.tests.testList[ITSInstance.tests.findTestById(ITSInstance.tests.testList,newVal.TestID)].Description;
            } catch (err) {};
            // CurrentPage SessionStatus TestID
            var message = ITSInstance.translator.getTranslatedString("SessionAuditTrail.init.js",
                  this.currentSession.AuditTrail[i].ObjectType + "." + this.currentSession.AuditTrail[i].MessageID,
                this.currentSession.AuditTrail[i].AuditMessage );

            message = envSubstitute(message, newVal,false);

            rowText = rowText.replace(this.mMESSAGE, message);

            newTable += rowText;
        }
        newTable += this.tablePart3;

        $('#SessionAuditTrailList').append(newTable);
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.translator.translateDiv("#SessionAuditTrailInterfaceSessionEdit");
    };

    // register the portlet
    ITSInstance.SessionAuditTrailController = new ITSSessionAuditTrailEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.SessionAuditTrailController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#SessionAuditTrailInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsOrganisationSupervisor) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#AdminInterfaceEMailAuditTrail.ViewMenu", ITSInstance.translator.translate("#AdminInterfaceEMailAuditTrail.ViewMenu", "View mail log"), "fa-envelope", "ITSRedirectPath(\'SessionAuditTrail&ObjectType=1001\');");
        }
    }, true);

})()// IIFE