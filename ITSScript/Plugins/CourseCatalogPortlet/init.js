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

    $.get(ITSJavaScriptVersion + '/Plugins/CourseCatalogPortlet/portlet.html', function (htmlLoaded) {
        // disable the portlet while the tests are not available
        //$("#AdminInterfaceInviteCCatalog").prop('disabled', true);
        //$("#AdminInterfaceInviteCCatalog").children().prop('disabled', true);
        //$("#AdminInterfaceInviteCCatalog").fadeTo("quick", 0.3);

        var ITSPortletCourseCatalog = {
            info: new ITSPortletAndEditorRegistrationInformation('392d01b4-b224-4e07-b9cd-c1dab2512999', 'Course catalog portlet', '1.0', 'Copyright 2020 Quopt IT Services BV', 'Shows a portlet that will allow easy linking into the course catalog information.'),
            defaultShowOrder : 6,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfaceInviteCCatalogDiv = $('<div class="col-md-4" id="AdminInterfaceInviteCCatalog">');
                $('#AdminInterfacePortlets').append(AdminInterfaceInviteCCatalogDiv);
                $('#AdminInterfaceInviteCCatalog').append(this.html);
                $("#AdminInterfaceInviteCCatalog").prop('disabled', true);
                $("#AdminInterfaceInviteCCatalog").children().prop('disabled', true);
                $("#AdminInterfaceInviteCCatalog").fadeTo("quick", 0.3);
            },
            testList: [],
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet test catalog');
                ITSInstance.tests.loadAvailableTests(
                    function () {
                        $("#AdminInterfaceInviteCCatalog").children().prop('disabled', false);
                        $("#AdminInterfaceInviteCCatalog").prop('disabled', false);
                        $("#AdminInterfaceInviteCCatalog").fadeTo("slow", 1);
                        // load the tests in the dropdown
                        $('#AdminInterfaceInviteCCatalogdropdownMenuItems').empty();
                        //<button class="dropdown-item" type="button">Test 1</button>
                        for (i = 0; i < ITSInstance.tests.testList.length; i++) {
                            if (ITSInstance.tests.testList[i].TestType==1000) {
                                $('#AdminInterfaceInviteCCatalogdropdownMenuItems').append('<button class="dropdown-item" type="button" onclick="ITSRedirectPath(\'Catalog&TestType=1000&TestID=' + ITSInstance.tests.testList[i].ID + '\');">' +
                                    ITSInstance.tests.testList[i].Description + '</button>');
                            }
                        }
                    },
                    function () {
                    }
                );
            },
            hide: function () {
                $('#AdminInterfaceInviteCCatalog').hide();
            },
            show: function () {
                $('#AdminInterfaceInviteCCatalog').show();
            },
        }

        // register the portlet
        ITSInstance.portletCourseCatalog = Object.create(ITSPortletCourseCatalog);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletCourseCatalog);

        //show the portlet
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.HasEducationalOfficeAccess) {
                setTimeout(function() { $('#AdminInterfaceInviteCCatalog').show(); }, 1000);
            } else {
                setTimeout(function() { $('#AdminInterfaceInviteCCatalog').hide(); }, 1000);
            }
        }, true);
    })

})() // iife