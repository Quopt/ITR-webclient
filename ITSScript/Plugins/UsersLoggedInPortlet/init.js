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

    $.get(ITSJavaScriptVersion + '/Plugins/UsersLoggedInPortlet/portlet.html', function (htmlLoaded) {
        var ITSPortletLoggedInUsers = {
            info: new ITSPortletAndEditorRegistrationInformation('7b0e7c93-0269-48ef-a26f-e26f839766bf', 'Users logged in portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Shows the latest logged in users and allows jumping to the logged in users audit trail.'),
            defaultShowOrder : 5,
            html: htmlLoaded,
            addToInterface : function () {
                AdminInterfaceInviteUserMngtDiv = $('<div class="col-md-4" id="AdminInterfaceInviteUserMngt">');
                $('#AdminInterfacePortlets').append(AdminInterfaceInviteUserMngtDiv);
                $('#AdminInterfaceInviteUserMngt').append(this.html);
            },
            afterOfficeLogin: function () {
                console.log('Init portlet last logged in users');
                ITSInstance.portletLoggedInUsers.objectsToShow.length = 0;
            },
            init_after_load : function () {
                ITSInstance.portletLoggedInUsers.objectsToShow = [];
                ITSInstance.genericAjaxLoader(
                    'logins',
                    ITSInstance.portletLoggedInUsers.objectsToShow,
                    ITSInstance.portletLoggedInUsers.loadSuccess,
                    ITSInstance.portletLoggedInUsers.loadError,
                    ITSInstance.portletLoggedInUsers.newObject,
                    0,
                    4,
                    'LastLoginDateTime desc'
                );
            },
            loadSuccess: function () {
                console.log('Portlet last logged in users loaded');
                $('#AdminInterfaceInviteUserMngtTable tr').remove();
                for (i = 0; i < Math.min(3,ITSInstance.portletLoggedInUsers.objectsToShow.length); i++) {
                    $('#AdminInterfaceInviteUserMngtTable').append('<tr><td>' + ITSInstance.portletLoggedInUsers.objectsToShow[i].Email + '&nbsp;<small>(' + ITSInstance.portletLoggedInUsers.objectsToShow[i].UserName + ')</small></td></tr>');
                }
            },
            loadError: function () {
                console.log('Portlet loading last logged in users generated an error');
            },
            newObject: function () {
                newObj = Object.create(ITSUser);
                ITSInstance.portletLoggedInUsers.objectsToShow[ITSInstance.portletLoggedInUsers.objectsToShow.length] = newObj;
                return newObj;
            },
            reload: function () {
                //ITSInstance.portletLoggedInUsers.init();
                setTimeout(ITSInstance.portletLoggedInUsers.reload, 300000);
            },
            objectsToShow: [],
            hide: function () {
                $('#AdminInterfaceInviteUserMngt').hide();
            },
            show: function () {
                $('#AdminInterfaceInviteUserMngt').show();
            },
        }

        // register the portlet
        ITSInstance.portletLoggedInUsers = Object.create(ITSPortletLoggedInUsers);
        ITSInstance.portletLoggedInUsers.hide();
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if ( (ITSInstance.users.currentUser.IsOrganisationSupervisor) || (ITSInstance.users.currentUser.IsMasterUser) ) {
                ITSInstance.portletLoggedInUsers.show();
                ITSInstance.portletLoggedInUsers.init_after_load();
                ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletLoggedInUsers.init_after_load.bind(ITSInstance.portletLoggedInUsers) );
            }
            // check if the current user's password has expired. If so redirect them to the password reset screen
            if (ITSInstance.ITRSessionType == "office") {
                if (ITSInstance.users.currentUser.PasswordExpirationDate < new Date()) {
                    ITSInstance.UIController.showWarning("passwordExpired", "Your password has expired. Please change your password now.", "", "ITSRedirectPath('ResetPassword');" )
                }
            }
            ITSInstance.translator.retranslateInterface();
        }, true);

        ITSInstance.UIController.registerPortlet(ITSInstance.portletLoggedInUsers);
        ITSInstance.UIController.showPortlets();

        // make sure the list is reloaded every 5 minutes
        setTimeout(ITSInstance.portletLoggedInUsers.reload, 300000);
    })

})() // iife