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
    var EditorDiv = $('<div class="container-fluid" id="DownloadDataInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/DownloadData/editor.html', function () {
       // things to do after loading the html
    });

    var ITSDownloadDataEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('ff17b35b-f3d5-4134-be88-ee430afccc32', 'DownloadData editor', '1.0', 'Copyright 2019 Quopt IT Services BV', 'Download test session data for research purposes');
        this.path = "DownloadData";
    };

    ITSDownloadDataEditor.prototype.init =function () {
    };

    ITSDownloadDataEditor.prototype.hide = function () {
        $('#DownloadDataInterfaceSessionEdit').hide();
    };

    ITSDownloadDataEditor.prototype.show = function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#DownloadDataInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();
        $('#DownloadDataMasterDiv').hide();
        if (ITSInstance.users.currentUser.IsMasterUser) $('#DownloadDataMasterDiv').show();

    };

    ITSDownloadDataEditor.prototype.downloadSample=function () {
        this.flatteneddataset = [];
        this.headers = {};
        this.datagathering = [];
        if (this.checkFields()) {
            this.loadAll = false;
            ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                undefined, 0, 25, '','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y" );
        } else {
            ITSInstance.UIController.showError('ITSDownloadEditor.FieldsMissing', 'Please fill all fields to start the download');
        }
    };

    ITSDownloadDataEditor.prototype.loadDataSucces = function () {
        var recCount = this.datagathering.length;
        if (recCount > 0) {
            this.flattenDataSet();
            if (this.loadAll) {
                this.pageNumber++;
                ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                    undefined, this.pageNumber, 25, '','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y" );
            } else {
                this.showPreview();
            }
        } else {
            $('#AdminInterfaceGroupSessionLoginOverview-dialog').modal("show");
            if (this.loadAll) {
                this.allDataLoaded();
            }
        }

    };

    ITSDownloadDataEditor.prototype.flattenDataSet = function () {
        for (var i=0; i < this.datagathering.length; i++) {
            var myRec = this.datagathering[i];
            var flatRec = {};

            // now flatten the record
            this.flattenDataSetRecursed("",myRec, this.headers, flatRec);
            this.flatteneddataset.push(flatRec);
        }
    };

    ITSDownloadDataEditor.prototype.flattenDataSetRecursed = function ( fieldLead, myObject, myHeaders, myRec ) {
        var fieldDot = "";
        if (fieldLead != "") {
            fieldDot = ".";
        }
        for (var property1 in myObject) {
            if (property1.indexOf("__") == 0) {
                // do nothing with __ properties
            } else if (myObject[property1] instanceof Object) {
                this.flattenDataSetRecursed(fieldLead + fieldDot + property1, myObject[property1], myHeaders, myRec)
            } else if ( ["PersonData","GroupData","SessionData","TestData","PluginData"].includes(property1) ) {
                var tempObject = {};
                ITSJSONLoad(tempObject, myObject[property1], ITSInstance, ITSObject, "ITSObject");
                this.flattenDataSetRecursed(fieldLead + fieldDot + property1, tempObject, myHeaders, myRec);
            } else {
                if (!myHeaders[fieldLead + fieldDot + property1]) {
                    myHeaders[fieldLead + fieldDot + property1] = "";
                }
                myRec[fieldLead + fieldDot + property1] = myObject[property1];
            }
        }
    };

    ITSDownloadDataEditor.prototype.showPreview = function () {
        $('#DownloadDataSampleTable').html(makeHTMLTableBasedOnObjects(this.flatteneddataset, this.headers ));
    };

    ITSDownloadDataEditor.prototype.loadDataError=function () {
        ITSInstance.UIController.showError('ITSDownloadEditor.LoadError', 'Data could not be loaded. Please refresh and try again.');
    };

    ITSDownloadDataEditor.prototype.checkFields=function () {
        // check all fields, all are required
        // $('#DownloadDataStartDate').val()
        // convertITRToDate($('#DownloadDataStartDate').val())
        if ( $('#DownloadDataSessionFilter').val().trim() == "" ||
            $('#DownloadDataTestNameFilter').val().trim() == "" ||
            $('#DownloadDataStartDate').val().trim() == "" ||
            $('#DownloadDataEndDate').val().trim() == "" ) {
            return false;
        } else {
            return true;
        }
    };

    ITSDownloadDataEditor.prototype.downloadAll = function () {
        this.flatteneddataset = [];
        this.headers = {};
        this.datagathering = [];
        if (this.checkFields()) {
            this.loadAll = true;
            this.pageNumber = 0;
            $('#AdminInterfaceGroupSessionLoginOverview-dialog').modal("show");
            ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                undefined, 0, 25, '','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y" );
        } else {
            ITSInstance.UIController.showError('ITSDownloadEditor.FieldsMissing', 'Please fill all fields to start the download');
        }
    };

    ITSDownloadDataEditor.prototype.allDataLoaded = function () {
        // now start the download from the browser to the client

    };

    // register the portlet
    ITSInstance.DownloadDataController = new ITSDownloadDataEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.DownloadDataController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#DownloadDataInterfaceSessionEdit");

    // register the menu items if applicable
    // register the menu items
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsMasterUser) $('#DownloadDataMasterDiv').show();
        if (ITSInstance.users.currentUser.IsResearcher) {
           ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#AdminInterfaceDataDownload.DownloadMenu", ITSInstance.translator.translate("#AdminInterfaceDataDownload.DownloadMenu", "Download test data"), "fa-file-export", "ITSRedirectPath(\'DownloadData\');");
        }
    }, true);
})()// IIFE