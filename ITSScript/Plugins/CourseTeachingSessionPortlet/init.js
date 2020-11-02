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
    $.get(ITSJavaScriptVersion + '/Plugins/CourseTeachingSessionPortlet/portlet.html', function (htmlLoaded) {
        var ITSportletTeachingSessions = {
            info: new ITSPortletAndEditorRegistrationInformation('06155c4c-a288-47f5-a4d4-5290a06bfb42', 'Teaching sessions portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Presents an overview of teaching sessions, an option to view the list and an option to create a new one.'),
            defaultShowOrder : 103,
            html : htmlLoaded,
            addToInterface : function () {
                var AdminInterfaceTeachingPortletDiv = $('<div class="col-md-4" id="AdminInterfaceTeachingPortlet">');
                $('#AdminInterfacePortlets').append(AdminInterfaceTeachingPortletDiv);
                $('#AdminInterfaceTeachingPortlet').append(this.html);
                $('#AdminInterfaceTeachingPortlet').hide();
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet teaching sessions');
                ITSInstance.portletTeachingSessions.reloadAfterDelay();
            },
            loadSuccess: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet teaching loaded');
                $('#AdminInterfaceTeachingPortletTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletTeachingSessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceTeachingPortletTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionType=1001&SessionID=' + ITSInstance.portletTeachingSessions.sessionsToShow[i].id + '");>' + ITSInstance.portletTeachingSessions.sessionsToShow[i].Description + '</td></tr>');
                }
                ITSInstance.portletTeachingSessions.waitingForReloadAfterDelay = false;
            },
            loadError: function () {
                ITSLogger.logMessage(logLevel.INFO,'teaching generated an error');
                ITSInstance.portletTeachingSessions.waitingForReloadAfterDelay = false;
            },
            newPortletReadySession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletTeachingSessions.sessionsToShow[ITSInstance.portletTeachingSessions.sessionsToShow.length] = newObj;
                return newObj;
            },
            reload: function () {
                //setTimeout(ITSInstance.portletTeachingSessions.reload, 60000);
                ITSInstance.portletTeachingSessions.sessionsToShow.length = 0;
                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'sessionsview',
                        ITSInstance.portletTeachingSessions.sessionsToShow,
                        ITSInstance.portletTeachingSessions.loadSuccess,
                        ITSInstance.portletTeachingSessions.loadError,
                        ITSInstance.portletTeachingSessions.newPortletReadySession,
                        0,
                        3,
                        'EndedAt desc', "N", "N", "Y", "SessionType=1001,ConsultantID=" + ITSInstance.users.currentUser.ID, "", true
                    );
                }.bind(this), 1);
            },
            reloadAfterDelay: function () {
                if (! ITSInstance.portletTeachingSessions.waitingForReloadAfterDelay) {
                    ITSInstance.portletTeachingSessions.waitingForReloadAfterDelay = true;
                    setTimeout(ITSInstance.portletTeachingSessions.reload, 1000);
                }
            },
            sessionsToShow: [],
            hide: function () {
                $('#AdminInterfaceTeachingPortlet').hide();
            },
            show: function () {
                $('#AdminInterfaceTeachingPortlet').show();
            },
            newSession: function() {
                ITSInstance.newCandidateSessionController.createNewSession('');
                ITSRedirectPath('NewSession&Mode=Teaching&SessionType=1001');
            }
        }

        // register the portlet
        ITSInstance.portletTeachingSessions = Object.create(ITSportletTeachingSessions);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletTeachingSessions);
        ITSInstance.portletTeachingSessions.waitingForReloadAfterDelay = false;

        ITSInstance.MessageBus.subscribe("Session.Delete", ITSInstance.portletTeachingSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("Session.Update", ITSInstance.portletTeachingSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletTeachingSessions.reloadAfterDelay);

        // show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasEducationalOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceTeachingPortlet').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceTeachingPortlet').hide(); }, 1000);
            }
        }, true);

    })

})() //iife