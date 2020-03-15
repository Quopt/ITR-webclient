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
    var EditorDiv = $('<div class="container-fluid" id="ServerLogsInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ServerLogs/editor.html', function () {
       // things to do after loading the html
    });

    var ITSServerLogsEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('6355e38c-3d38-4286-8c93-c076e7be859f', 'ServerLogs editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'View server logs');
        this.path = "ServerLogs";
    };

    ITSServerLogsEditor.prototype.init=function () {
    };

    ITSServerLogsEditor.prototype.hide= function () {
        $('#ServerLogsInterfaceSessionEdit').hide();
    };

    ITSServerLogsEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ServerLogsInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        this.LOG_HANDLER_BACKUP_COUNT = "";
        this.lastRefresh = new Date(2000,1,1);

        ITSInstance.JSONAjaxLoader('systemsettings/LOG_HANDLER_BACKUP_COUNT', this.LOG_HANDLER_BACKUP_COUNT, this.LogHandlerBackupCountLoaded.bind(this), this.ParsLoadedError.bind(this), ITSObject,
            0, 999, "", "N", "Y", "N");

        this.loadLogs();
    };

    ITSServerLogsEditor.prototype.LogHandlerBackupCountLoaded = function (newValue) {
        this.LOG_HANDLER_BACKUP_COUNT = newValue;
        // set this as max
        $('#ServerLogsDiv-HistoricCount')[0].setAttribute('max', newValue);
    };

    ITSServerLogsEditor.prototype.ParsLoadedError = function (xhr) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (xhr.status != 404) {
            ITSInstance.UIController.showError("ITSServerLogsEditor.ParsLoadError", "The server settings could not be loaded at this moment.", '',
                'window.history.back();');
        }
    };

    ITSServerLogsEditor.prototype.logsLoadedError = function (xhr) {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        $('#ServerLogsDiv-Now').prop("checked",true)
        ITSInstance.UIController.showError("ITSServerLogsEditor.LogsLoadError", "The server logs could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSServerLogsEditor.prototype.loadLogs = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOn(0);
        if ( $('#ServerLogsDiv-Now').is(":checked") ) {
            ITSInstance.genericAjaxLoader('log/0/ALL', undefined,
                function(mydata, textStatus, xhr) {
                $('#ServerLogsDiv-LogText').val(mydata.join(''));
                this.logLines = mydata;
                ITSInstance.UIController.showInterfaceAsWaitingOff();
                if ( $('#ServerLogsDiv-AutoUpdate').is(":checked") ) { setTimeout(this.refreshLogs.bind(this), 30000); }
                }.bind(this), this.logsLoadedError,undefined,0,0,"",true)
        } else {
            $('#ServerLogsDiv-LogText').val('');
            ITSInstance.genericAjaxLoader('log/'+$('#ServerLogsDiv-HistoricCount').val()+'/ALL', undefined,
                function(mydata, textStatus, xhr) {
                $('#ServerLogsDiv-LogText').val(mydata.join(''));
                this.logLines = mydata;
                ITSInstance.UIController.showInterfaceAsWaitingOff();
                }.bind(this), this.logsLoadedError,undefined,0,0,"",true)
        }
    };

    ITSServerLogsEditor.prototype.refreshLogs = function () {
        var dateNow = new Date();
        if ((Math.abs(dateNow.getTime() - this.lastRefresh) ) > 29000) {
            this.lastRefresh = dateNow;
            if ($('#ServerLogsDiv-AutoUpdate').is(':visible')) {
                if ($('#ServerLogsDiv-AutoUpdate').is(':checked')) {
                    console.log('Update logs check')
                    setTimeout(this.refreshLogs.bind(this), 30000);
                    if ($('#ServerLogsDiv-Now').is(":checked")) { // only update when current log is active
                        $('#ServerLogsDiv-LogText').scrollTop(this.logLines.length * 999);

                        lastLineFound = "ALL";
                        lastLineCounter = this.logLines.length - 1;
                        lastLine = this.logLines[lastLineCounter];
                        while (lastLine.indexOf('ITR') != 0 && lastLineCounter > 0) {
                            lastLine = this.logLines[lastLineCounter];
                            lastLineCounter--;
                        }

                        if (lastLine.indexOf('ITR') == 0 && lastLineCounter > 0) {
                            lastLineFound = lastLine.substring(4, 23);
                        }

                        ITSInstance.genericAjaxLoader('log/0/' + lastLineFound, undefined,
                            function (mydata, textStatus, xhr) {
                                this.logLines = this.logLines.concat(mydata);
                                $('#ServerLogsDiv-LogText').val(this.logLines.join(''));
                                $('#ServerLogsDiv-LogText').scrollTop(this.logLines.length * 999);
                            }.bind(this), this.logsLoadedError, undefined, 0, 0, "", true)
                    }
                }
            }
        }
    };

    // register the portlet
    ITSInstance.ServerLogsController = new ITSServerLogsEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ServerLogsController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ServerLogsInterfaceSessionEdit");
})()// IIFE