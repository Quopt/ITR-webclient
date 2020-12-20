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
//# sourceURL=TestCatalogPortlet/init.js

(function() { // iife to prevent pollution of the global memspace

    $.get(ITSJavaScriptVersion + '/Plugins/TestCatalogPortlet/portlet.html', function (htmlLoaded) {
        // disable the portlet while the tests are not available
        //$("#AdminInterfaceInviteTCatalog").prop('disabled', true);
        //$("#AdminInterfaceInviteTCatalog").children().prop('disabled', true);
        //$("#AdminInterfaceInviteTCatalog").fadeTo("quick", 0.3);

        var ITSPortletTestCatalog = {
            info: new ITSPortletAndEditorRegistrationInformation('020247ef-5afd-4ab4-9f99-0aa1f4466978', 'Test catalog portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Shows a portlet that will allow easy linking into the test catalog information.'),
            defaultShowOrder : 123,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfaceInviteTCatalogDiv = $('<div class="col-md-4" id="AdminInterfaceInviteTCatalog">');
                $('#AdminInterfacePortlets').append(AdminInterfaceInviteTCatalogDiv);
                $('#AdminInterfaceInviteTCatalog').append(this.html);
                $("#AdminInterfaceInviteTCatalog").css("display", "none");
            },
            testList: [],
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet test catalog');
                ITSInstance.tests.loadAvailableTests(
                    function () {
                        // load the tests in the dropdown
                        $('#AdminInterfaceInviteTCatalogdropdownMenuItems').empty();
                        //<button class="dropdown-item" type="button">Test 1</button>
                        for (i = 0; i < ITSInstance.tests.testList.length; i++) {
                            if (ITSInstance.tests.testList[i].TestType==0) {
                                $('#AdminInterfaceInviteTCatalogdropdownMenuItems').append('<button class="dropdown-item" type="button" onclick="ITSRedirectPath(\'Catalog&TestType=0&TestID=' + ITSInstance.tests.testList[i].ID + '\');">' +
                                    ITSInstance.tests.testList[i].Description + '</button>');
                            }
                        }
                    },
                    function () {
                    }
                );
            },
            hide: function () {
                $('#AdminInterfaceInviteTCatalog').hide();
            },
            show: function () {
                $('#AdminInterfaceInviteTCatalog').show();
            },
        }

        // register the portlet
        ITSInstance.portletTestCatalog = Object.create(ITSPortletTestCatalog);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletTestCatalog);

        //show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasTestingOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceInviteTCatalog').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceInviteTCatalog').hide(); }, 1000);
            }
        }, true);
    })

})() // iife