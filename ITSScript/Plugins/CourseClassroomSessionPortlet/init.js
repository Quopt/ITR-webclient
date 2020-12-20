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
//# sourceURL=CourseClassroomSessionPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    $.get(ITSJavaScriptVersion + '/Plugins/CourseClassroomSessionPortlet/portlet.html', function (htmlLoaded) {
        var ITSportletTeachingClassroomSessions = {
            info: new ITSPortletAndEditorRegistrationInformation('09cadcc8-17fe-41e8-beeb-63db6d5c5ee2\n', 'Teaching classroom group sessions portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Presents an overview of classroom sessions, an option to view the list and an option to create a new one.'),
            defaultShowOrder : 101,
            html : htmlLoaded,
            addToInterface : function () {
                var AdminInterfaceTeachingClassroomPortletDiv = $('<div class="col-md-4" id="AdminInterfaceTeachingClassroomPortlet">');
                $('#AdminInterfacePortlets').append(AdminInterfaceTeachingClassroomPortletDiv);
                $('#AdminInterfaceTeachingClassroomPortlet').append(this.html);
                $('#AdminInterfaceTeachingClassroomPortlet').hide();
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet teaching sessions');
                ITSInstance.portletTeachingClassroomSessions.reloadAfterDelay();
            },
            loadSuccess: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet teaching loaded');
                $('#AdminInterfaceTeachingClassroomPortletTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletTeachingClassroomSessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceTeachingClassroomPortletTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionType=1000&SessionID=' + ITSInstance.portletTeachingClassroomSessions.sessionsToShow[i].id + '");>' + ITSInstance.portletTeachingClassroomSessions.sessionsToShow[i].Description + '</td></tr>');
                }
                ITSInstance.portletTeachingClassroomSessions.waitingForReloadAfterDelay = false;
            },
            loadError: function () {
                ITSLogger.logMessage(logLevel.INFO,'teaching generated an error');
                ITSInstance.portletTeachingClassroomSessions.waitingForReloadAfterDelay = false;
            },
            newPortletReadySession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletTeachingClassroomSessions.sessionsToShow[ITSInstance.portletTeachingClassroomSessions.sessionsToShow.length] = newObj;
                return newObj;
            },
            reload: function () {
                //setTimeout(ITSInstance.portletTeachingClassroomSessions.reload, 60000);
                ITSInstance.portletTeachingClassroomSessions.sessionsToShow.length = 0;
                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'groupsessionsview',
                        ITSInstance.portletTeachingClassroomSessions.sessionsToShow,
                        ITSInstance.portletTeachingClassroomSessions.loadSuccess,
                        ITSInstance.portletTeachingClassroomSessions.loadError,
                        ITSInstance.portletTeachingClassroomSessions.newPortletReadySession,
                        0,
                        3,
                        'EndedAt desc', "N", "N", "Y", "SessionType=1000", "", true
                    );
                }.bind(this), 1);
            },
            reloadAfterDelay: function () {
                if (! ITSInstance.portletTeachingClassroomSessions.waitingForReloadAfterDelay) {
                    ITSInstance.portletTeachingClassroomSessions.waitingForReloadAfterDelay = true;
                    setTimeout(ITSInstance.portletTeachingClassroomSessions.reload, 1000);
                }
            },
            sessionsToShow: [],
            hide: function () {
                $('#AdminInterfaceTeachingClassroomPortlet').hide();
            },
            show: function () {
                $('#AdminInterfaceTeachingClassroomPortlet').show();
            },
            newSession: function() {
                ITSInstance.newCandidateSessionController.createNewSession('');
                ITSRedirectPath('GroupSession&SessionType=1000');
            }
        }

        // register the portlet
        ITSInstance.portletTeachingClassroomSessions = Object.create(ITSportletTeachingClassroomSessions);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletTeachingClassroomSessions);
        ITSInstance.portletTeachingClassroomSessions.waitingForReloadAfterDelay = false;

        ITSInstance.MessageBus.subscribe("SessionGroup.Delete", ITSInstance.portletTeachingClassroomSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("SessionGroup.Update", ITSInstance.portletTeachingClassroomSessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletTeachingClassroomSessions.reloadAfterDelay);

        // show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasEducationalOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceTeachingClassroomPortlet').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceTeachingClassroomPortlet').hide(); }, 1000);
            }
        }, true);

    })

})() //iife