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
    var EditorDiv = $('<div class="container-fluid" id="XXXInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/XXX/editor.html', function () {
       // things to do after loading the html
    });

    var ITSXXXEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('326eacf4-0357-4288-8fae-176470deb4ef', 'XXX editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Purpose of this plugin');
        this.path = "XXX";
    };

    ITSXXXEditor.prototype.init=function () {
    };

    ITSXXXEditor.prototype.hide= function () {
        $('#XXXInterfaceSessionEdit').hide();
    };

    ITSXXXEditor.prototype.show=function () {
        if (getUrlParameterValue('SessionID')) {
            SessionID = getUrlParameterValue('SessionID');
            $('#NavbarsAdmin').show();
            $('#NavbarsAdmin').visibility = 'visible';
            $('#NavBarsFooter').show();
            $('#XXXInterfaceSessionEdit').show();
            ITSInstance.UIController.initNavBar();
        }
        else // no parameter will not work for this screen
        {
            ITSInstance.UIController.activateScreenPath('Switchboard');
        }
    };

    // register the portlet
    ITSInstance.XXXController = new ITSXXXEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.XXXController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#XXXInterfaceSessionEdit");

    // register the menu items if applicable

})()// IIFE