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
    $.get(ITSJavaScriptVersion + '/Plugins/CourseIndividualSessionPortlet/portlet.html', function (htmlLoaded) {
        var ITSportletTeachingIndividualSessions = {
            info: new ITSPortletAndEditorRegistrationInformation('fb29d2ae-f735-4361-a01b-6fef87f20fa1', 'Teaching individual sessions portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Presents an overview of individual teaching sessions, an option to view the list and an option to create a new one.'),
            defaultShowOrder : 102,
            html : htmlLoaded,
            addToInterface : function () {
                var AdminInterfaceTeachingIndividualPortletDiv = $('<div class="col-md-4" id="AdminInterfaceTeachingIndividualPortlet">');
                $('#AdminInterfacePortlets').append(AdminInterfaceTeachingIndividualPortletDiv);
                $('#AdminInterfaceTeachingIndividualPortlet').append(this.html);
                $('#AdminInterfaceTeachingIndividualPortlet').hide();
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet teaching sessions');
                ITSInstance.portletTeachingIndividualSessions.reloadAfterDelay();
            },
            loadSuccess: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet teaching loaded');
                $('#AdminInterfaceTeachingIndividualPortletTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletTeachingIndividualSessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceTeachingIndividualPortletTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionType=1003&SessionID=' + ITSInstance.portletTeachingIndividualSessions.sessionsToShow[i].id + '");>' + ITSInstance.portletTeachingIndividualSessions.sessionsToShow[i].Description + '</td></tr>');
                }
                ITSInstance.portletTeachingIndividualSessions.waitingForReloadAfterDelay = false;
            },
            loadError: function () {
                ITSLogger.logMessage(logLevel.INFO,'teaching generated an error');
                ITSInstance.portletTeachingIndividualSessions.waitingForReloadAfterDelay = false;
            },
            newPortletReadySession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletTeachingIndividualSessions.sessionsToShow[ITSInstance.portletTeachingIndividualSessions.sessionsToShow.length] = newObj;
                return newObj;
            },
            reload: function () {
                //setTimeout(ITSInstance.portletTeachingIndividualSessions.reload, 60000);
                ITSInstance.portletTeachingIndividualSessions.sessionsToShow.length = 0;
                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'sessionsview',
                        ITSInstance.portletTeachingIndividualSessions.sessionsToShow,
                        ITSInstance.portletTeachingIndividualSessions.loadSuccess,
                        ITSInstance.portletTeachingIndividualSessions.loadError,
                        ITSInstance.portletTeachingIndividualSessions.newPortletReadySession,
                        0,
                        3,
                        'EndedAt desc', "N", "N", "Y", "SessionType=1003", "", true
                    );
                }.bind(this), 1);
            },
            reloadAfterDelay: function () {
                if (! ITSInstance.portletTeachingIndividualSessions.waitingForReloadAfterDelay) {
                    ITSInstance.portletTeachingIndividualSessions.waitingForReloadAfterDelay = true;
                    setTimeout(ITSInstance.portletTeachingIndividualSessions.reload, 1000);
                }
            },
            sessionsToShow: [],
            hide: function () {
                $('#AdminInterfaceTeachingIndividualPortlet').hide();
            },
            show: function () {
                $('#AdminInterfaceTeachingIndividualPortlet').show();
            },
            newSession: function() {
                ITSInstance.newCandidateSessionController.createNewSession('');
                ITSRedirectPath('NewSession&SessionType=1003');
            }
        }

        // register the portlet
        ITSInstance.portletTeachingIndividualSessions = Object.create(ITSportletTeachingIndividualSessions);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletTeachingIndividualSessions);
        ITSInstance.portletTeachingIndividualSessions.waitingForReloadAfterDelay = false;

        ITSInstance.MessageBus.subscribe("Session.Delete", ITSInstance.portletTeachingIndividualSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("Session.Update", ITSInstance.portletTeachingIndividualSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletTeachingIndividualSessions.reloadAfterDelay);

        // show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasEducationalOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceTeachingIndividualPortlet').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceTeachingIndividualPortlet').hide(); }, 1000);
            }
        }, true);

    })

})() //iife