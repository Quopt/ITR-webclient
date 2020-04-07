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

    $.get(ITSJavaScriptVersion + '/Plugins/SessionNewPortlet/portlet.html', function (htmlLoaded) {
        var ITSPortletInviteNewCandidate = {
            info: new ITSPortletAndEditorRegistrationInformation('d922f006-de57-4d2b-b5cc-ec76f0991ccb', 'New session portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Allows from the switchboard to easily jump into the create new session editor.'),
            defaultShowOrder : 1,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfaceNewSessionPortletDiv = $('<div class="col-md-4" id="AdminInterfaceInviteNewCandidate">');
                $('#AdminInterfacePortlets').append(AdminInterfaceNewSessionPortletDiv);
                $('#AdminInterfaceInviteNewCandidate').append(this.html);

                // disable the portlet while the tests are not available
                $("#AdminInterfaceInviteNewCandidate").prop('disabled', true);
                $("#AdminInterfaceInviteNewCandidate").children().prop('disabled', true);
                $("#AdminInterfaceInviteNewCandidate").fadeTo("quick", 0.3);
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet invite new candidate');
                ITSInstance.batteries.loadAvailableBatteries(function () {}, function () {});
                ITSInstance.tests.loadAvailableTests(
                    function () {
                        ITSLogger.logMessage(logLevel.INFO,'Tests loaded');
                        $("#AdminInterfaceInviteNewCandidate").children().prop('disabled', false);
                        $("#AdminInterfaceInviteNewCandidate").prop('disabled', false);
                        $("#AdminInterfaceInviteNewCandidate").fadeTo("slow", 1);
                    },
                    function () {
                    }
                );
            },
            hide: function () {
                $('#AdminInterfaceInviteNewCandidate').hide();
            },
            show: function () {
                $('#AdminInterfaceInviteNewCandidate').show();
            },
        }

        // register the portlet
        ITSInstance.portletInviteNewCandidate = Object.create(ITSPortletInviteNewCandidate);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletInviteNewCandidate);

        $('#AdminInterfaceInviteNewCandidateInputUsername').keypress(function (e) {
            if (e.which == '13') {
                $('#AdminInterfaceInviteNewCandidateButton').click();
            }
        });

    })

})() // iife