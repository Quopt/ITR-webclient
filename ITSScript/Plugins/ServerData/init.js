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
//# sourceURL=ServerData/init.js

(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var EditorDiv = $('<div class="container-fluid" id="ServerDataInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ServerData/editor.html', function () {
       // things to do after loading the html
    });

    var ITSServerDataEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('16c87ae1-1aa3-4deb-9650-b46fd684eb0c', 'ServerData editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'View server logs');
        this.path = "ServerData";
    };

    ITSServerDataEditor.prototype.init=function () {
    };

    ITSServerDataEditor.prototype.hide= function () {
        $('#ServerDataInterfaceSessionEdit').hide();
    };

    ITSServerDataEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ServerDataInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

    };

    ITSServerDataEditor.prototype.getData = function () {
        this.dataLoaded = {};
        $('#ServerDataDiv-ServerDataTable').empty();
        ITSInstance.JSONAjaxLoader($('#ServerDataDiv-SourceSelect').val() , this.dataLoaded,this.generateDataTable.bind(this), this.getDataError.bind(this),
            'ITSObject', $('#ServerDataDiv-PageNr').val(), $('#ServerDataDiv-PageAmount').val(),
            $('#ServerDataDiv-Sort').val(), $('#ServerDataDiv-ArchivedCheck').is(':checked') ? "Y": "N",
            $('#ServerDataDiv-MasterCheck').is(':checked') ? "Y": "N",
            $('#ServerDataDiv-MasterCheck').is(':checked') ? "N": "Y",
            $('#ServerDataDiv-Filter').val() );
    };

    ITSServerDataEditor.prototype.getDataError = function () {
        ITSInstance.UIController.showError("ITSServerDataEditor.LoadError","Retrieving data failed. Please try again.");
    };

    ITSServerDataEditor.prototype.generateDataTable = function () {
        $('#ServerDataDiv-ServerDataTable').append( makeHTMLTableBasedOnObject(this.dataLoaded ) );
    };

    // register the portlet
    ITSInstance.ServerDataController = new ITSServerDataEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ServerDataController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ServerDataInterfaceSessionEdit");
})()// IIFE