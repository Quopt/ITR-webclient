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
    var EditorDiv = $('<div class="container-fluid" id="ResetPasswordInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ResetPassword/editor.html', function () {
       // things to do after loading the html
    });

    var ITSResetPasswordEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('53af9eaa-15d5-40c3-b5cc-3a835be75e18', 'ResetPassword editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Reset the password of the consultant');
        this.path = "ResetPassword";
    };

    ITSResetPasswordEditor.prototype.init=function () {
    };

    ITSResetPasswordEditor.prototype.hide= function () {
        $('#ResetPasswordInterfaceSessionEdit').hide();
    };

    ITSResetPasswordEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ResetPasswordInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();
    };

    ITSResetPasswordEditor.prototype.resetShowPassword = function(id, me) {
        if($('#'+id+' input').attr("type") == "text"){
            $('#'+id+' input').attr('type', 'password');
            $('#'+ me.id).addClass( "fa-eye-slash" );
            $('#'+ me.id).removeClass( "fa-eye" );
        }else if($('#'+id+' input').attr("type") == "password"){
            $('#'+id+' input').attr('type', 'text');
            $('#'+ me.id).removeClass( "fa-eye-slash" );
            $('#'+ me.id).addClass( "fa-eye" );
        }
    };

    ITSResetPasswordEditor.prototype.saveNewPassword = function () {
        var oldPW = $('#ResetPasswordInterfaceInformationOld').val();
        var newPW = $('#ResetPasswordInterfaceInformationNew1').val();
        var newPW2 = $('#ResetPasswordInterfaceInformationNew2').val();
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{10,})");

        if (newPW != newPW2) {
            ITSInstance.UIController.showError('ITSResetPasswordEditor.PasswordsNoMatch', 'The new password and the retyped new password do not match. Please type them again and make sure that the new passwords are the same.');
        } else
        if (!strongRegex.test(newPW)) {
            ITSInstance.UIController.showError('ITSResetPasswordEditor.PasswordTooShort', 'The new password is not good. The password needs to be at least 10 characters long and contain upper and lowercase letters, at least one digit and at least one special character.');
        } else {
            // update the password
            ITSInstance.users.currentUser.resetPassword(oldPW, newPW, function () { ITSInstance.UIController.showInfo('ITSResetPasswordEditor.PasswordOK', 'Your password is successfully updated'); window.history.back(); },
                function () { ITSInstance.UIController.showError('ITSResetPasswordEditor.PasswordNotUpdated', 'The password could not be changed. The old password is not correct. Please retry.'); } )
        }
    };

    // register the portlet
    ITSInstance.ResetPasswordSessionController = new ITSResetPasswordEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ResetPasswordSessionController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ResetPasswordInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        ITSInstance.UIController.registerMenuItem('#submenuSettingsLI', "#ITSResetPasswordEditor.Menu", ITSInstance.translator.translate("#ITSResetPasswordEditor.Menu", "Reset password"), "fa-key", "ITSRedirectPath(\'ResetPassword\');");
    }, true);

})()// IIFE