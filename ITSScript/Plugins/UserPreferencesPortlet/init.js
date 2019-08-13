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
    AdminInterfaceSettingsDiv = $('<div class="col-md-4" id="AdminInterfaceSettings">');
    $('#AdminInterfacePortlets').append(AdminInterfaceSettingsDiv);
    $(AdminInterfaceSettingsDiv).load(ITSJavaScriptVersion + '/Plugins/UserPreferencesPortlet/portlet.html', function () {
        var ITSPortletUserPreferences = {
            info: new ITSPortletAndEditorRegistrationInformation('c3095d24-0382-48cf-b51d-d6018526b184', 'User preferences portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Jump to the settings of the current user.'),
            init: function () {

            },
            hide: function () {
                $('#AdminInterfaceSettings').hide();
            },
            show: function () {
                $('#AdminInterfaceSettings').show();
            },
            loadMenu: function () {
                if (ITSInstance.users.currentUser) {
                    $('#AdminInterfaceAdminInterfaceSettingsDropdownButtonItems').empty();
                    var tempButton = "<button class=\"dropdown-item\" id='AdminInterfaceAdminInterfaceSettingsDropdownButtonItemsResetPassword' type=\"button\" onclick='ITSRedirectPath(\"ResetPassword\");'>"+ITSInstance.translator.getTranslatedString('UserPreferencesPortlet', 'ChangePassword', 'Change my password')+"</button>";
                    $('#AdminInterfaceAdminInterfaceSettingsDropdownButtonItems').append(tempButton);
                    if ((ITSInstance.users.currentUser.IsOrganisationSupervisor) || (ITSInstance.users.currentUser.IsMasterUser)) {
                        tempButton = "<button class=\"dropdown-item\" id='AdminInterfaceAdminInterfaceSettingsDropdownButtonItemsManageConsultants' type=\"button\" onclick='ITSRedirectPath(\"ConsultantLister\");'>"+ITSInstance.translator.getTranslatedString('UserPreferencesPortlet', 'ManageConsultants', 'Manage consultants')+"</button>";
                        $('#AdminInterfaceAdminInterfaceSettingsDropdownButtonItems').append(tempButton);
                    }
                    if (ITSInstance.users.currentUser.IsMasterUser) {
                        tempButton = "<button class=\"dropdown-item\" id='AdminInterfaceAdminInterfaceSettingsDropdownButtonItemsManageOrganisations' type=\"button\" onclick='ITSRedirectPath(\"OrganisationLister\");'>"+ITSInstance.translator.getTranslatedString('UserPreferencesPortlet', 'ManageOrganisations', 'Manage organisations')+"</button>";
                        $('#AdminInterfaceAdminInterfaceSettingsDropdownButtonItems').append(tempButton);
                    }
                }
            }
        }

        // register the portlet
        ITSInstance.portletUserPreferences = Object.create(ITSPortletUserPreferences);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletUserPreferences);
        ITSInstance.portletUserPreferences.loadMenu();

        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            ITSInstance.portletUserPreferences.loadMenu();
        }, true);
    })

})() // iife