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
//# sourceURL=SessionFindPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

    $.get(ITSJavaScriptVersion + '/Plugins/SessionSearchPortlet/portlet.html', function (htmlLoaded) {
        var ITSPortletSessionSearch = {
            info: new ITSPortletAndEditorRegistrationInformation('9695e4f3-a138-42af-b889-16c85c2544fe', 'Session serach portlet', '1.0', 'Copyright 2021 Quopt IT Services BV', 'Allows to search in all sessions in the system.'),
            defaultShowOrder : 4,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfaceSearchSessionPortletDiv = $('<div class="col-md-4" id="AdminInterfaceSessionSearch">');
                $('#AdminInterfacePortlets').append(AdminInterfaceSearchSessionPortletDiv);
                $('#AdminInterfaceSessionSearch').append(this.html);
                $('#AdminInterfaceSessionSearch').hide();

            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet search sessions');
            },
            hide: function () {
                $('#AdminInterfaceSessionSearch').hide();
            },
            show: function () {
                $('#AdminInterfaceSessionSearch').show();
            },
        }

        // register the portlet
        ITSInstance.portletSessionSearch = Object.create(ITSPortletSessionSearch);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletSessionSearch);

        //show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceSessionSearch').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceSessionSearch').hide(); }, 1000);
            }
        }, true);

        $('#AdminInterfaceSessionSearchInputUsername').keypress(function (e) {
            if (e.which == '13') {
                $('#AdminInterfaceSessionSearchButton').click();
            }
        });

    })

})() // iife