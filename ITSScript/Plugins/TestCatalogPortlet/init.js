/* Copyright 2019 by Quopt IT Services BV
 *
 *  Licensed under the Artistic License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/Artistic-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    AdminInterfaceInviteTCatalogDiv = $('<div class="col-md-4" id="AdminInterfaceInviteTCatalog">');
    $('#AdminInterfacePortlets').append(AdminInterfaceInviteTCatalogDiv);
    $(AdminInterfaceInviteTCatalogDiv).load(ITSJavaScriptVersion + '/Plugins/TestCatalogPortlet/portlet.html', function () {
        // disable the portlet while the tests are not available
        $("#AdminInterfaceInviteTCatalog").prop('disabled', true);
        $("#AdminInterfaceInviteTCatalog").children().prop('disabled', true);
        $("#AdminInterfaceInviteTCatalog").fadeTo("quick", 0.3);
        var ITSPortletTestCatalog = {
            info: new ITSPortletAndEditorRegistrationInformation('020247ef-5afd-4ab4-9f99-0aa1f4466978', 'Test catalog portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Shows a portlet that will allow easy linking into the test catalog information.'),
            testList: [],
            afterOfficeLogin: function () {
                console.log('Init portlet test catalog');
                ITSInstance.tests.loadAvailableTests(
                    function () {
                        $("#AdminInterfaceInviteTCatalog").children().prop('disabled', false);
                        $("#AdminInterfaceInviteTCatalog").prop('disabled', false);
                        $("#AdminInterfaceInviteTCatalog").fadeTo("slow", 1);
                        // load the tests in the dropdown
                        $('#AdminInterfaceInviteTCatalogdropdownMenuItems').empty();
                        //<button class="dropdown-item" type="button">Test 1</button>
                        for (i = 0; i < ITSInstance.tests.testList.length; i++) {
                            $('#AdminInterfaceInviteTCatalogdropdownMenuItems').append('<button class="dropdown-item" type="button" onclick="ITSRedirectPath(\'Catalog&TestID=' + ITSInstance.tests.testList[i].ID + '\');">' +
                                ITSInstance.tests.testList[i].TestName + '</button>');
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
    })

})() // iife