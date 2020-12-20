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
//# sourceURL=SessionProgressPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

    $.get(ITSJavaScriptVersion + '/Plugins/SessionProgressPortlet/portlet.html', function (htmlLoaded) {
        var ITSportletBusySessions = {
            info: new ITSPortletAndEditorRegistrationInformation('a460c1b9-7b5e-4612-8407-fea11385c964', 'Session prepared and in progress portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Presents an overview of sessions that have recently finished and an option to view them'),
            defaultShowOrder : 2,
            html : htmlLoaded,
            addToInterface: function () {
                AdminInterfaceSessionProgressPortletDiv = $('<div class="col-md-4" id="AdminInterfaceSessionProgressPortlet">');
                $('#AdminInterfacePortlets').append(AdminInterfaceSessionProgressPortletDiv);
                $('#AdminInterfaceSessionProgressPortlet').append(this.html);
                $('#AdminInterfaceSessionProgressPortlet').hide();
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet prepared and busy sessions');
                ITSInstance.portletBusySessions.reloadAfterDelay();
            },
            loadSuccess: function () {
                $('#AdminInterfaceSessionProgressPortletTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletBusySessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceSessionProgressPortletTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionID=' + ITSInstance.portletBusySessions.sessionsToShow[i].id + '");>' + ITSInstance.portletBusySessions.sessionsToShow[i].Description + " / " + ITSInstance.portletBusySessions.sessionsToShow[i].EMail + '</td></tr>');
                }
                ITSInstance.portletBusySessions.waitingForReloadAfterDelay = false;
            },
            loadSuccessBusy: function () {
                $('#AdminInterfaceSessionProgressBusyTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletBusySessions.sessionsToShowBusy.length); i++) {
                    $('#AdminInterfaceSessionProgressBusyTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionID=' + ITSInstance.portletBusySessions.sessionsToShowBusy[i].id + '");>' + ITSInstance.portletBusySessions.sessionsToShowBusy[i].Description + " / " + ITSInstance.portletBusySessions.sessionsToShowBusy[i].EMail + '</td></tr>');
                }
                ITSInstance.portletBusySessions.waitingForReloadAfterDelay = false;
            },
            loadError: function () {
                ITSLogger.logMessage(logLevel.INFO,'Sessions generated an error');
                ITSInstance.portletBusySessions.waitingForReloadAfterDelay = false;
            },
            newPortletSession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletBusySessions.sessionsToShow[ITSInstance.portletBusySessions.sessionsToShow.length] = newObj;
                return newObj;
            },
            newPortletBusySession: function () {
                newObj = Object.create(ITSCandidateSession);
                ITSInstance.portletBusySessions.sessionsToShowBusy[ITSInstance.portletBusySessions.sessionsToShowBusy.length] = newObj;
                return newObj;
            },
            reload: function () {
                ITSInstance.portletBusySessions.sessionsToShow.length = 0;
                ITSInstance.portletBusySessions.sessionsToShowBusy.length = 0;

                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'sessionsview',
                        ITSInstance.portletBusySessions.sessionsToShow,
                        ITSInstance.portletBusySessions.loadSuccess,
                        ITSInstance.portletBusySessions.loadError,
                        ITSInstance.portletBusySessions.newPortletSession,
                        0,
                        3,
                        'CreateDate desc, AllowedStartDateTime desc', "N", "N", "Y", "Status=10,SessionType=0", "", true
                    );
                }.bind(this), 1);
                setTimeout( function () {
                    ITSInstance.genericAjaxLoader(
                        'sessionsview',
                        ITSInstance.portletBusySessions.sessionsToShowBusy,
                        ITSInstance.portletBusySessions.loadSuccessBusy,
                        ITSInstance.portletBusySessions.loadError,
                        ITSInstance.portletBusySessions.newPortletBusySession,
                        0,
                        3,
                        'StartedAt desc', "N", "N", "Y", "Status=20,Status=21,SessionType=0", "", true
                    );
                }.bind(this), 1);
            },
            reloadAfterDelay: function () {
                 if (! ITSInstance.portletBusySessions.waitingForReloadAfterDelay) {
                     ITSInstance.portletBusySessions.waitingForReloadAfterDelay = true;
                     setTimeout(ITSInstance.portletBusySessions.reload, 1000);
                 }
            },
            sessionsToShow: [],
            sessionsToShowBusy: [],
            hide: function () {
                $('#AdminInterfaceSessionProgressPortlet').hide();
            },
            show: function () {
                $('#AdminInterfaceSessionProgressPortlet').show();
            },
        }

        // register the portlet
        ITSInstance.portletBusySessions = Object.create(ITSportletBusySessions);
        ITSInstance.portletBusySessions.waitingForReloadAfterDelay = false;
        ITSInstance.UIController.registerPortlet(ITSInstance.portletBusySessions);

        ITSInstance.MessageBus.subscribe("Session.Update", ITSInstance.portletBusySessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("Session.Delete", ITSInstance.portletBusySessions.reloadAfterDelay);
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletBusySessions.reloadAfterDelay);

        // show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceSessionProgressPortlet').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceSessionProgressPortlet').hide(); }, 1000);
            }
        }, true);

    })

})() //iife