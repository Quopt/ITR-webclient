/* Copyright 2021 by Quopt IT Services BV
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
//# sourceURL=SessionPnPPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

    $.get(ITSJavaScriptVersion + '/Plugins/SessionPnPPortlet/portlet.html', function (htmlLoaded) {
        var ITSportletPnPSession = {
            info: new ITSPortletAndEditorRegistrationInformation('33404c03-58e6-447d-bef7-f073acbd6fee', 'PnP session portlet', '1.0', 'Copyright 2021 Quopt IT Services BV', 'Copy answers from paper into the system using a special test booklet.'),
            defaultShowOrder : 190,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfacePnPSessionPortletDiv = $('<div class="col-md-4" id="AdminInterfaceInvitePnPSession">');
                $('#AdminInterfacePortlets').append(AdminInterfacePnPSessionPortletDiv);
                $('#AdminInterfaceInvitePnPSession').append(this.html);
                $('#AdminInterfaceInvitePnPSession').hide();

            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet pnp session');
                ITSInstance.batteries.loadAvailableBatteries(function () {}, function () {});
                ITSInstance.tests.loadAvailableTests(function () { ITSInstance.portletPnPSession.testListLoaded(); },function () {});
            },
            testListLoaded: function () {
                $('#AdminInterfaceInvitePnPSessionTestName').empty();
                for (i = 0; i < ITSInstance.tests.testList.length; i++) {
                    if (ITSInstance.tests.testList[i].TestType==0) {
                        $('#AdminInterfaceInvitePnPSessionTestName').append('<option notranslate class="form-control form-control-sm" value="'+ITSInstance.tests.testList[i].ID+'">'+ITSInstance.tests.testList[i].Description+'</option>');
                    }
                }
            },
            startNewSession: function () {
                // check inputs, session name is mandatory
                var testID = $('#AdminInterfaceInvitePnPSessionTestName').val();
                var sessionDescription = $('#AdminInterfaceInvitePnPSessionInputSessionName').val().trim();
                var tempTest = ITSInstance.tests.testList[ ITSInstance.tests.findTestById(ITSInstance.tests.testList, testID) ];
                if ((testID != "") && (sessionDescription != "")) {
                    // create a new session and add a test
                    var newSession = ITSInstance.candidateSessions.newCandidateSession();
                    ITSInstance.portletPnPSession.newSession = newSession;
                    newSession.Description = sessionDescription;
                    newSession.PersonID = '00000000-0000-0000-0000-000000000000';
                    newSession.Person.ID = newSession.PersonID;
                    newSession.Person.Active = false;
                    newSession.Person.EMail = ITSInstance.translator.getTranslatedString( 'ITS', 'NullSystemUSer', 'Inactive system user')
                    newSession.Person.PersonType = 1;
                    newSession.SessionType = 3;
                    newSession.Status = 30;
                    newSession.newCandidateSessionTest( tempTest );
                    newSession.SessionTests[0].Status = 30;
                    newSession.EndedAt = new Date.now();
                    newSession.saveToServerIncludingTestsAndPerson( ITSInstance.portletPnPSession.startNewSessionOK,
                         function () { ITSInstance.UIController.showInfo('portletPnPSession.InputMissing', 'Please enter a description and select a test for the PnP session.', "", "") } );
                } else {
                    ITSInstance.UIController.showInfo('portletPnPSession.InputMissing', 'Please enter a description and select a test for the PnP session.', "", "");
                }
            },
            startNewSessionOK: function () {
                var SessionID = ITSInstance.portletPnPSession.newSession.ID;
                var FirstLink = 'Session&SessionType=3&SessionID='+ SessionID;
                var SecondLink = 'SessionViewAnswers&SessionType=3&checkAnswers=1&SessionID='+ SessionID + '&SessionTestID=' + ITSInstance.portletPnPSession.newSession.SessionTests[0].ID;
                history.pushState(FirstLink, FirstLink, Global_OriginalURL + '?Path=' + FirstLink);
                ITSRedirectPath(SecondLink);
            },
            hide: function () {
                $('#AdminInterfaceInvitePnPSession').hide();
            },
            show: function () {
                $('#AdminInterfaceInvitePnPSession').show();
            },
        }

        // register the portlet
        ITSInstance.portletPnPSession = Object.create(ITSportletPnPSession);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletPnPSession);

        //show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceInvitePnPSession').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceInvitePnPSession').hide(); }, 1000);
            }
        }, true);

        $('#AdminInterfaceInvitePnPSessionInputUsername').keypress(function (e) {
            if (e.which == '13') {
                $('#AdminInterfaceInvitePnPSessionButton').click();
            }
        });

    })

})() // iife