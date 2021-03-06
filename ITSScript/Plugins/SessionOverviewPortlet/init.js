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
//# sourceURL=SessionOverviewPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    $.get(ITSJavaScriptVersion + '/Plugins/SessionOverviewPortlet/portlet.html', function (htmlLoaded) {
        var ITSPortletReadySessions = {
            info: new ITSPortletAndEditorRegistrationInformation('93e0bdc4-3f20-42c8-887e-8aa8ceee2baa', 'Session overview portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Presents an overview of sessions that have recently finished and an option to view them'),
            defaultShowOrder : 3,
            html : htmlLoaded,
            addToInterface : function () {
                AdminInterfaceInviteRRSessionsDiv = $('<div class="col-md-4" id="AdminInterfaceInviteRRSessions">');
                $('#AdminInterfacePortlets').append(AdminInterfaceInviteRRSessionsDiv);
                $('#AdminInterfaceInviteRRSessions').append(this.html);
                $('#AdminInterfaceInviteRRSessions').hide();
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet ready sessions');
                ITSInstance.portletReadySessions.reloadAfterDelay();
            },
            loadSuccess: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet sessions loaded');
                $('#AdminInterfaceInviteRRSessionsTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletReadySessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceInviteRRSessionsTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionID=' + ITSInstance.portletReadySessions.sessionsToShow[i].id + '");>' + ITSInstance.portletReadySessions.sessionsToShow[i].Description  + " / " + ITSInstance.portletReadySessions.sessionsToShow[i].EMail + '</td></tr>');
                }
                ITSInstance.portletReadySessions.waitingForReloadAfterDelay = false;
            },
            loadError: function () {
                ITSLogger.logMessage(logLevel.INFO,'Sessions generated an error');
                ITSInstance.portletReadySessions.waitingForReloadAfterDelay = false;
            },
            newPortletReadySession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletReadySessions.sessionsToShow[ITSInstance.portletReadySessions.sessionsToShow.length] = newObj;
                return newObj;
            },
            reload: function () {
                //setTimeout(ITSInstance.portletReadySessions.reload, 60000);
                ITSInstance.portletReadySessions.sessionsToShow.length = 0;
                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'sessionsview',
                        ITSInstance.portletReadySessions.sessionsToShow,
                        ITSInstance.portletReadySessions.loadSuccess,
                        ITSInstance.portletReadySessions.loadError,
                        ITSInstance.portletReadySessions.newPortletReadySession,
                        0,
                        3,
                        'EndedAt desc', "N", "N", "Y", "Status=30,Status=31,SessionType=0", "",true
                    );
                }.bind(this), 1);
            },
            reloadAfterDelay: function () {
                if (! ITSInstance.portletReadySessions.waitingForReloadAfterDelay) {
                    ITSInstance.portletReadySessions.waitingForReloadAfterDelay = true;
                    setTimeout(ITSInstance.portletReadySessions.reload, 10);
                }
            },
            sessionsToShow: [],
            hide: function () {
                $('#AdminInterfaceInviteRRSessions').hide();
            },
            show: function () {
                $('#AdminInterfaceInviteRRSessions').show();
            },
        }

        // register the portlet
        ITSInstance.portletReadySessions = Object.create(ITSPortletReadySessions);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletReadySessions);
        ITSInstance.portletReadySessions.waitingForReloadAfterDelay = false;

        ITSInstance.MessageBus.subscribe("Session.Delete", ITSInstance.portletReadySessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletReadySessions.reloadAfterDelay);

        // show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceInviteRRSessions').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceInviteRRSessions').hide(); }, 1000);
            }
        }, true);

    })

})() //iife