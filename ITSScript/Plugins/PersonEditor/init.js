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
    var EditorDiv = $('<div class="container-fluid" id="PersonInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/PersonEditor/editor.html', function () {
       // things to do after loading the html
    });

    var ITSPersonEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('27b4271a-c9a0-4af4-a14c-3d83b541d7b1', 'Person editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Edit and maintain candidate information');
        this.path = "Person";
    };

    ITSPersonEditor.prototype.init=function () {
    };

    ITSPersonEditor.prototype.hide= function () {
        $('#PersonInterfaceSessionEdit').hide();
    };

    ITSPersonEditor.prototype.show=function () {
        if (getUrlParameterValue('PersonID')) {
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#PersonInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();

            if ((!this.personID) || (this.personID != getUrlParameterValue('PersonID'))) {
                this.personID = getUrlParameterValue('PersonID');
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                ITSInstance.candidates.loadCurrentCandidate(this.personID, this.personLoaded.bind(this), this.personLoadingFailed.bind(this));
            } else {
                this.personLoaded();
            }
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    ITSPersonEditor.prototype.personLoaded=function () {
        $('#PersonInterfaceEditButtonBar_ViewPassword').hide();
        if (ITSInstance.users.currentUser.IsPasswordManager) {
            $('#PersonInterfaceEditButtonBar_ViewPassword').show();
        }

        ITSInstance.UIController.showInterfaceAsWaitingOff();
        // bind the persons data to this interface
        DataBinderTo('PersonInterfaceSessionEdit', ITSInstance.candidates.currentCandidate );
        $('#PersonInterfaceEditSessionEditHeaderEMail').text( ITSInstance.candidates.currentCandidate.EMail );
    };

    ITSPersonEditor.prototype.personLoadingFailed=function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError('ITSPersonEditor.LoadingPersonFailed', 'Loading this person failed.', '',
            'ITSInstance.logoutController.logout();');
    };

    ITSPersonEditor.prototype.showSessions=function () {
        ITSRedirectPath("SessionLister&SessionType=0&PersonID=" + this.personID);
    };

    ITSPersonEditor.prototype.resetPassword=function () {
        ITSInstance.candidates.currentCandidate.regeneratePassword();
        ITSInstance.candidates.currentCandidate.saveToServer(function () {}, function () {});
        ITSInstance.SessionMailerSessionController.currentPerson = ITSInstance.candidates.currentCandidate;
        ITSRedirectPath("SessionMailer&Template=defaultPassword&PersonID=" + this.personID);
    };

    ITSPersonEditor.prototype.viewPassword=function () {
        ITSInstance.candidates.currentCandidate.requestPassword( function( ) {
            ITSInstance.UIController.showInfo('ITSPersonEditorShowPassword', 'The password of this user is : ', ITSInstance.candidates.currentCandidate.Password);
        }, function () {
            ITSInstance.UIController.showError('ITSPersonEditorShowPasswordError', 'The password cannot be shown.') ;
        })
    };

    ITSPersonEditor.prototype.deleteCurrentPersonWarning = function () {
        ITSInstance.UIController.showDialog("ITSPersonEditorDeletePerson","Delete person", "Are you sure you want to delete this person? All related sessions and test information will be permanently deleted !",
            [ {btnCaption : "Yes", btnType : "btn-warning", btnOnClick : "ITSInstance.PersonSessionController.deleteCurrentPerson();"}, {btnCaption : "No"} ]);
    };

    ITSPersonEditor.prototype.deleteCurrentPerson = function () {
        ITSInstance.candidates.currentCandidate.deleteFromServer(function() {},
            function () { ITSInstance.UIController.showError('ITSPersonEditor.DeletePersonFailed', 'The person could not be deleted.');  } );
        setTimeout(this.goBack().bind(this),1000);
    };

    ITSPersonEditor.prototype.goBack = function() {
        window.history.back();
    };

    ITSPersonEditor.prototype.save=function () {
        // check if the email is filled in and unique
        $('#PersonInterfaceEditButtonBar_SaveIcon')[0].outerHTML = "<i id='PersonInterfaceEditButtonBar_SaveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
        DataBinderFrom('PersonInterfaceSessionEdit', ITSInstance.candidates.currentCandidate );

        if (! isValidDate(ITSInstance.candidates.currentCandidate.BirthDate)) {
            ITSInstance.UIController.showError('ITSPersonEditor.BirthDateError', 'The birthdate is not correct. Please enter a valid date into the birthdate field. ');
        }

        ITSInstance.candidates.currentCandidate.checkForDuplicateLogins(ITSInstance.candidates.currentCandidate.EMail ,this.saveProceed.bind(this),
            function () { $('#PersonInterfaceEditButtonBar_SaveIcon')[0].outerHTML = "<i id='PersonInterfaceEditButtonBar_SaveIcon' class='fa fa-fw fa-thumbs-up'</i>";
                          ITSInstance.UIController.showError('ITSPersonEditor.DuplicatePersonFound', 'This login id is already in use! Please change it to another value or check the archived persons.'); }
            );
    };

    ITSPersonEditor.prototype.saveProceed=function () {
        // save
        DataBinderFrom('PersonInterfaceSessionEdit', ITSInstance.candidates.currentCandidate );
        ITSInstance.candidates.currentCandidate.saveToServer(
            function () { $('#PersonInterfaceEditButtonBar_SaveIcon')[0].outerHTML = "<i id='PersonInterfaceEditButtonBar_SaveIcon' class='fa fa-fw fa-thumbs-up'</i>"; },
            function () { $('#PersonInterfaceEditButtonBar_SaveIcon')[0].outerHTML = "<i id='PersonInterfaceEditButtonBar_SaveIcon' class='fa fa-fw fa-thumbs-up'</i>";
                ITSInstance.UIController.showError('ITSPersonEditor.SavingFailed', 'Saving the person failed.'); }
        );
    };

    // register the portlet
    ITSInstance.PersonSessionController = new ITSPersonEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.PersonSessionController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#PersonInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE