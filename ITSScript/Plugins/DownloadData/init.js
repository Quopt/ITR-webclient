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
//# sourceURL=DownloadData/init.js

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
        this.cancelDownloads = false;
        setTimeout( function () {
            var today = new Date();
            this.calendar1 = flatpickr('#DownloadDataStartDate');
            this.calendar2 = flatpickr('#DownloadDataEndDate');
            this.calendar1.setDate(new Date(today.getFullYear(), 0, 1));
            this.calendar2.setDate(new Date(today.getFullYear(), 11, 31));
        }.bind(this), 1000) ;
    };

    ITSDownloadDataEditor.prototype.downloadSample=function () {
        this.flatteneddataset = [];
        this.headers = {};
        this.datagathering = [];
        if (this.checkFields()) {
            this.loadAll = false;

            $('#DownloadDataSampleTable').html('...');
            this.buildFilter();

            ITSInstance.UIController.showInterfaceAsWaitingOn(-1);

            ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                undefined, 0, 3, '','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y", this.filter );
        } else {
            ITSInstance.UIController.showError('ITSDownloadEditor.FieldsMissing', 'Please fill all fields to start the download');
        }
    };

    ITSDownloadDataEditor.prototype.buildFilter = function () {
        this.filter = "";
        // SessionDescription, TestDescription, CompanyDescription, GroupDescription
        this.filter = "SessionEndData>=" + convertDateToISO(this.calendar1.latestSelectedDateObj);
        if ($('#DownloadDataSessionFilter').val().trim() != "") {
            this.filter += ',SessionDescription%=' + $('#DownloadDataSessionFilter').val() ;
        }
        this.filter += ',TestDescription%=' + $('#DownloadDataTestNameFilter').val();
        if ($('#DownloadDataGroupNameFilter').val().trim() != "") {
            this.filter += ',GroupDescription%=' + $('#DownloadDataSessionFilter').val();
        }
        if ($('#DownloadDataTestCompanyNameFilter').val().trim() != "") {
            this.filter += ',CompanyDescription%=' + $('#DownloadDataTestCompanyNameFilter').val();
        }
        this.filter += ",SessionEndData<=" + convertDateToISO(this.calendar2.latestSelectedDateObj);
    }

    ITSDownloadDataEditor.prototype.loadDataSucces = function () {
        var recCount = this.datagathering.length;
        if (recCount > 0) {
            this.flattenDataSet();
            if ((this.loadAll) && (!this.cancelDownloads)) {
                this.pageNumber++;

                ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                    undefined, this.pageNumber, 5, 'SessionID,TestDescription','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y", this.filter );
            } else {
                this.showPreview();
            }
        } else {
            if (this.loadAll) {
                this.allDataLoaded();
            }
        }
    };

    ITSDownloadDataEditor.prototype.flattenDataSet = function () {
        var currentSessionID = "";
        for (var i=0; i < this.datagathering.length; i++) {
            var myRec = this.datagathering[i];
            var flatRec = {};
            var includeResults = false;
            var includeResultsValues = false;

            // now flatten the record
            if ($('#DownloadDataResultsB').prop('checked')) {
                includeResultsValues = true;
            }
            if ($('#DownloadDataResultsC').prop('checked')) {
                includeResults = true;
            }

            //ITSLogger.logMessage(logLevel.ERROR,"Flattening " + i);
            this.updateCounter(i);

            // get short test code TestName
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList,  myRec.TestID );
            var fieldLead = ""+myRec.TestID;
            if (testIndex > -1) {
                fieldLead = ITSInstance.tests.testList[testIndex].TestName;
            }
            var excludeSessionDescription = $('#DownloadDataRemoveSessionDescription').prop('checked');

                // output to internal memory array
            if ($('#DownloadDataSingleRowResults').prop('checked')) {
                this.flattenDataSetRecursed("", myRec, this.headers, flatRec, includeResults, includeResultsValues,  excludeSessionDescription, '', $('#DownloadDataRemoveEmptyColumns').prop('checked'), fieldLead);

                if (currentSessionID != myRec.SessionID) {
                    this.flatteneddataset.push(flatRec);
                    currentSessionID = myRec.SessionID;
                }
            } else {
                this.flattenDataSetRecursed("", myRec, this.headers, flatRec, includeResults, includeResultsValues,  excludeSessionDescription, '', $('#DownloadDataRemoveEmptyColumns').prop('checked'), fieldLead);
                this.flatteneddataset.push(flatRec);
            }
        }
    };

    ITSDownloadDataEditor.prototype.flattenDataSetRecursed = function ( fieldLead, myObject, myHeaders, myRec, includeFullResults, includeLimitedResults, excludeSessionDescription, fieldEndFilter, removeEmptyColumns, fieldLeadForTestData) {
        var fieldDot = "";
        var Continue = true;
        if (fieldLead != "") {
            fieldDot = ".";
        }

        for (var property1 in myObject) {
            if ((property1.indexOf("__") == 0) || (property1 == "_objectType") || (property1 == "persistentProperties")) {
                // do nothing with __ properties
            } else if (myObject[property1] instanceof Object) {
                this.flattenDataSetRecursed(fieldLead + fieldDot + property1, myObject[property1], myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, fieldEndFilter, removeEmptyColumns)
            } else if ( ["PersonData","GroupData","SessionData","TestData","PluginData"].includes(property1) ) {
                var tempObject = {};
                if (property1 == "TestData") {
                    if (typeof fieldLeadForTestData == "undefined"){
                        fieldLeadForTestData = fieldLead;
                    }
                    if (fieldLeadForTestData == "") { fieldLeadForTestData = property1; }
                    ITSJSONLoad(tempObject, myObject[property1], ITSInstance, ITSObject, "ITSObject");
                    if (includeFullResults || includeLimitedResults) {
                        if (includeLimitedResults) {
                            // remove all fields not ending with .value
                            this.flattenDataSetRecursed(fieldLeadForTestData , tempObject.Results, myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, 'Value', removeEmptyColumns);
                            for (var tempProp in tempObject) {
                                if (tempProp != "Results") {
                                    this.flattenDataSetRecursed(fieldLeadForTestData , tempObject[tempProp], myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, '', removeEmptyColumns);
                                }
                            }
                        } else {
                            this.flattenDataSetRecursed(fieldLeadForTestData, tempObject, myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, fieldEndFilter, removeEmptyColumns);
                        }
                    } else {
                        // include only scale scores
                        for (var tempProp in tempObject) {
                            if (tempProp == "Scores") {
                                this.flattenDataSetRecursed(fieldLeadForTestData , tempObject[tempProp], myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, '', removeEmptyColumns);
                            }
                        }
                    }
                } else {
                    if ((typeof myObject[property1] == "undefined") || (myObject[property1].trim() == "")) {
                        // invalid data, do nothing for now
                    }
                    else {
                        ITSJSONLoad(tempObject, myObject[property1], ITSInstance, ITSObject, "ITSObject");
                        this.flattenDataSetRecursed(fieldLead + fieldDot + property1, tempObject, myHeaders, myRec, includeFullResults, includeLimitedResults,  excludeSessionDescription, fieldEndFilter, removeEmptyColumns);
                    }
                }
            } else {
                Continue = true;
                if ((fieldEndFilter != "") && (property1 != fieldEndFilter)  && (fieldLead.indexOf( '.'+fieldEndFilter) < 0)) {
                    // do nothing with properties that do not match the field end filter
                    Continue = false;
                }
                if (removeEmptyColumns && ((typeof myObject[property1] === "undefined") || (String(myObject[property1]).trim() == ""))) Continue = false;
                // make sure NOT to export session description since this is anonimised data
                if ( (excludeSessionDescription) && ((fieldLead + fieldDot + property1 == "SessionDescription") || (fieldLead + fieldDot + property1 == "SessionData.Description"))) Continue = false;
                // store the data
                if (Continue)
                {
                    if (!myHeaders[fieldLead + fieldDot + property1]) {
                        myHeaders[fieldLead + fieldDot + property1] = "";
                    }
                    myRec[fieldLead + fieldDot + property1] = String(myObject[property1]).replace(/(\r\n|\n|\r)/gm, "");
                }
            }
        }
    };

    ITSDownloadDataEditor.prototype.showPreview = function () {
        var newTable = makeHTMLTableBasedOnObjects(this.headers, this.flatteneddataset, 3);
        //ITSLogger.logMessage(logLevel.ERROR,newTable);
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        $('#DownloadDataSampleTable').html(newTable);
    };

    ITSDownloadDataEditor.prototype.loadDataError=function () {
        ITSInstance.UIController.showError('ITSDownloadEditor.LoadError', 'Data could not be loaded. Please refresh and try again.');
    };

    ITSDownloadDataEditor.prototype.checkFields=function () {
        if ( $('#DownloadDataTestNameFilter').val().trim() == "" ||
            $('#DownloadDataStartDate').val().trim() == "" ||
            $('#DownloadDataEndDate').val().trim() == "" ) {
            return false;
        } else {
            return true;
        }
    };

    ITSDownloadDataEditor.prototype.downloadAll = function () {
        $('#DataRecalculation-Label').css("display", "none");
        $('#DataDownloading-Label').css("display", "");

        this.flatteneddataset = [];
        this.headers = {};
        this.datagathering = [];
        this.buildFilter();
        if (this.checkFields()) {
            this.loadAll = true;
            this.pageNumber = 0;
            this.cancelDownloads = false;
            $('#DownloadData-dialog').modal("show");
            this.updateCounter(0);
            ITSInstance.JSONAjaxLoader('datagathering', this.datagathering, this.loadDataSucces.bind(this), this.loadDataError.bind(this),
                undefined, 0, 5, 'SessionID,TestDescription','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y", this.filter  );
        } else {
            ITSInstance.UIController.showError('ITSDownloadEditor.FieldsMissing', 'Please fill all fields to start the download');
        }
    };

    ITSDownloadDataEditor.prototype.recalcBuildFilter = function() {
        this.filter = "EndedAt>=" + convertDateToISO(this.calendar1.latestSelectedDateObj);
        this.filter += ",EndedAt<=" + convertDateToISO(this.calendar2.latestSelectedDateObj);
        this.filter += ",Status>=30";
    }

    ITSDownloadDataEditor.prototype.recalcAll = function () {
        $('#DataRecalculation-Label').css("display", "");
        $('#DataDownloading-Label').css("display", "none");

        this.recalcBuildFilter();
        if (this.checkFields()) {
            this.pageNumber = 0;
            this.cancelDownloads = false;
            this.recalcsessions = [];
            $('#DownloadData-dialog').modal("show");
            this.updateCounter(0);
            ITSInstance.JSONAjaxLoader('sessions', this.recalcsessions, this.loadRecalcSucces.bind(this), this.loadDataError.bind(this),
                undefined, this.pageNumber, 1, 'EndedAt','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y", this.filter  );
        } else {
            ITSInstance.UIController.showError('ITSDownloadEditor.FieldsMissing', 'Please fill all fields to start the download');
        }
    };

    ITSDownloadDataEditor.prototype.loadRecalcSucces = function () {
        var recCount = this.recalcsessions.length;
        if ( (recCount > 0)  && (!this.cancelDownloads) ) {
            console.log(this.recalcsessions[0].ID, this.recalcsessions[0].Description);
            ITSInstance.editSessionController.recalcSession(this.recalcsessions[0].ID, this.loadRecalcNext.bind(this), this.loadDataError.bind(this));
        } else {
            $('#DownloadData-dialog').modal("hide");
        }
    };

    ITSDownloadDataEditor.prototype.loadRecalcNext = function () {
        this.pageNumber++;
        this.updateCounter(this.pageNumber,1);
        ITSInstance.JSONAjaxLoader('sessions', this.recalcsessions, this.loadRecalcSucces.bind(this), this.loadDataError.bind(this),
            undefined, this.pageNumber, 1, 'EndedAt','', $('#DownloadDataMaster')[0].checked ? "Y" : "N" , $('#DownloadDataMaster')[0].checked ? "N" : "Y", this.filter );
    };

    ITSDownloadDataEditor.prototype.updateCounter  = function (counter, pageSize) {
        if (typeof pageSize == "undefined") pageSize=5;
        $('#DataDownloading-LabelProgress').text(((this.pageNumber * pageSize) ) + " " + ITSInstance.translator.translate("#AdminInterfaceDataDownload.DownloadCounter", "records processed"));
    };

    ITSDownloadDataEditor.prototype.allDataLoaded = function () {
        // now start the download from the browser to the client
        var temp="";
        if ($('#DownloadDataResultsCSV').prop('checked') ) {
            temp = ConvertToSV(this.headers, this.flatteneddataset, ConvertFieldToCSVSafe, ",");
            $('#DownloadData-dialog').modal("hide");
            saveFileLocally("itr_data_download.csv", temp);
        } else {
            temp = ConvertToSV(this.headers, this.flatteneddataset, ConvertFieldToTSVSafe, "\t");
            $('#DownloadData-dialog').modal("hide");
            saveFileLocally("itr_data_download.tsv", temp);
        }
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
            ITSInstance.UIController.registerMenuItem('#submenuCourseBuilderLI', "#AdminInterfaceDataDownload.DownloadCourseDataMenu", ITSInstance.translator.translate("#AdminInterfaceDataDownload.DownloadCourseDataMenu", "Download course data"), "fa-file-export", "ITSRedirectPath(\'DownloadData&SessionType=1000\');");
        }
    }, true);
})()// IIFE