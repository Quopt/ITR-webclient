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
    AdminInterfaceSessionProgressPortletDiv = $('<div class="col-md-4" id="AdminInterfaceSessionProgressPortlet">');
    $('#AdminInterfacePortlets').append(AdminInterfaceSessionProgressPortletDiv);
    $(AdminInterfaceSessionProgressPortletDiv).load(ITSJavaScriptVersion + '/Plugins/SessionProgressPortlet/portlet.html', function () {
        var ITSportletBusySessions = {
            info: new ITSPortletAndEditorRegistrationInformation('a460c1b9-7b5e-4612-8407-fea11385c964', 'Session prepared and in progress portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Presents an overview of sessions that have recently finished and an option to view them'),
            afterOfficeLogin: function () {
                console.log('Init portlet prepared and busy sessions');
                this.reloadAfterDelay();
            },
            loadSuccess: function () {
                $('#AdminInterfaceSessionProgressPortletTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletBusySessions.sessionsToShow.length); i++) {
                    $('#AdminInterfaceSessionProgressPortletTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionID=' + ITSInstance.portletBusySessions.sessionsToShow[i].id + '");>' + ITSInstance.portletBusySessions.sessionsToShow[i].Description + " / " + ITSInstance.portletBusySessions.sessionsToShow[i].EMail + '</td></tr>');
                }
            },
            loadSuccessBusy: function () {
                $('#AdminInterfaceSessionProgressBusyTable tr').remove();
                for (i = 0; (i < 3) && (i < ITSInstance.portletBusySessions.sessionsToShowBusy.length); i++) {
                    $('#AdminInterfaceSessionProgressBusyTable').append('<tr><td onclick=ITSRedirectPath("Session&SessionID=' + ITSInstance.portletBusySessions.sessionsToShowBusy[i].id + '");>' + ITSInstance.portletBusySessions.sessionsToShowBusy[i].Description + " / " + ITSInstance.portletBusySessions.sessionsToShow[i].EMail + '</td></tr>');
                }
            },
            loadError: function () {
                console.log('Sessions generated an error');
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
                //setTimeout(ITSInstance.portletBusySessions.reload, 60000);
                ITSInstance.portletBusySessions.sessionsToShow.length = 0;
                ITSInstance.portletBusySessions.sessionsToShowBusy.length = 0;
                ITSInstance.genericAjaxLoader(
                    'sessionsview',
                    ITSInstance.portletBusySessions.sessionsToShow,
                    ITSInstance.portletBusySessions.loadSuccess,
                    ITSInstance.portletBusySessions.loadError,
                    ITSInstance.portletBusySessions.newPortletSession,
                    0,
                    5,
                    'CreateDate desc, AllowedStartDateTime desc', "N", "N", "Y", "Status=10,SessionType=0"
                );
                ITSInstance.genericAjaxLoader(
                    'sessionsview',
                    ITSInstance.portletBusySessions.sessionsToShowBusy,
                    ITSInstance.portletBusySessions.loadSuccessBusy,
                    ITSInstance.portletBusySessions.loadError,
                    ITSInstance.portletBusySessions.newPortletBusySession,
                    0,
                    5,
                    'StartedAt desc', "N", "N", "Y", "Status=20,Status=21,SessionType=0"
                );
            },
            reloadAfterDelay: function () {
                 setTimeout(ITSInstance.portletBusySessions.reload, 1000);
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
        ITSInstance.UIController.registerPortlet(ITSInstance.portletBusySessions);
        ITSInstance.MessageBus.subscribe("Session.Update", ITSInstance.portletBusySessions.reloadAfterDelay.bind(ITSInstance.portletBusySessions));
        ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletBusySessions.reload.bind(ITSInstance.portletBusySessions));

        // make sure the portlet is reloaded every 5 minutes
        //setTimeout(ITSInstance.portletBusySessions.reload, 300000);
    })

})() //iife