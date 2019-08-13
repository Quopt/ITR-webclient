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

// define the new candidate editor object in the global memspace so that everybody can use it
function ITSBatteryEditorController (battery) {
    this.ITSBattery = battery;
    this.availableTestsAndBatteries = []; // tests and batteries available to the battery selection
    this.currentBattery = new ITSBattery(this, ITSInstance); // the battery we are changing with this object
    this.path = "BatteryEditor";
    $('#BatteryEditorWarningExistsLabel').hide();
    //$('#BatteryEditorDeleteButton').hide();
};

ITSBatteryEditorController.prototype.info = new ITSPortletAndEditorRegistrationInformation('9b767c7f-e614-43cd-a4b7-4b8ba01e0e0f', 'Change the content of a battery', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Changes the content of battery');

ITSBatteryEditorController.prototype.hide = function () {
    $('#BatteryEditor').hide();
};

ITSBatteryEditorController.prototype.show = function () {
    this.BatteryID = undefined;
    if (getUrlParameterValue('BatteryID')) this.BatteryID = getUrlParameterValue('BatteryID');

    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#BatteryEditor').show();
    ITSInstance.UIController.initNavBar();

    // load the battery
    if (this.BatteryID) {
        this.currentBattery = ITSInstance.batteries.newBattery();
        this.currentBattery.loadBattery(this.BatteryID, this.batteryLoadingSucceeded.bind(this), this.batteryLoadingFailed.bind(this));
        ITSInstance.UIController.showInterfaceAsWaitingOn();
    } else {
        this.currentBattery = ITSInstance.batteries.newBattery();
        this.batteryLoadingSucceeded();
    }
};

ITSBatteryEditorController.prototype.batteryLoadingSucceeded = function () {
    // make sure to populate the test list ONLY with test in ready state.
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    DataBinderTo("BatteryEditor", this.currentBattery);
    this.repopulateTestsLists(true);
    this.loadTestAndBatteriesList();
};

ITSBatteryEditorController.prototype.batteryLoadingFailed = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    ITSInstance.UIController.showError("ITSBatteryEditorController.LoadBatteryFailed", "The battery could not be loaded at this moment.", '',
        'window.history.back();');
};

ITSBatteryEditorController.prototype.afterOfficeLogin = function () {
    // make sure we get the tests and batteries loaded, dont care when it is ready
    ITSInstance.tests.loadAvailableTests(function () {
    }, function () {
    });
    ITSInstance.batteries.loadAvailableBatteries(function () {
    }, function () {
    });
};

ITSBatteryEditorController.prototype.loadTestAndBatteriesList = function() {
    this.availableTestsAndBatteries.length = 0;

    $('#BatteryEditorTestsInputList').empty();
    newLI = "<option value=\"\">" + ITSInstance.translator.getTranslatedString('BatteryChangeEditor','SelectATest','Select a test to add to the battery') + "</option>"
    $('#BatteryEditorTestsInputList').append(newLI);

    ITSInstance.tests.testList.forEach(function callback(currentValue, index, array) {
        var includeTest = false;
        includeTest = currentValue.Active == true;
        if (!$('#BatteryEditorTestsIncludeOtherLanguages').is(':checked')) {
            includeTest = includeTest && (currentValue.supportsLanguage(ITSLanguage));
        }
        if (includeTest) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": currentValue.getTestFormatted()
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + currentValue.getTestFormatted() + "</option>"
            $('#BatteryEditorTestsInputList').append(newLI);
        }
    }, this);
    ITSInstance.batteries.batteryList.forEach(function callback(currentValue, index, array) {
        if (currentValue.Active) {
            this.availableTestsAndBatteries.push({
                "TestID": currentValue.ID,
                "Description": ITSInstance.translator.getTranslatedString('BatteryChangeEditor','BatteryText',"Battery : ") + currentValue.BatteryName
            });
            newLI = "<option value=\""+currentValue.ID+"\">" + ITSInstance.translator.getTranslatedString('BatteryChangeEditor','BatteryText',"Battery : ") + currentValue.BatteryName + "</option>"
            $('#BatteryEditorTestsInputList').append(newLI);
        }
    }, this);
    $('#BatteryEditorTestsInputList').combobox({ forceRenewal : true, onchange : "ITSInstance.BatteryEditorController.TestOrBatterySelected(this.value); " } );
};

ITSBatteryEditorController.prototype.TestOrBatterySelected = function (textFound) {
    var id = "";
    for (var i = 0; i < this.availableTestsAndBatteries.length; i++) {
        if (this.availableTestsAndBatteries[i].Description == textFound) {
            id = this.availableTestsAndBatteries[i].TestID;
            break;
        }
    }
    if (id == "") { return; }

    // and now add this test to the selected tests list
    var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, id);
    var batteryIndex = ITSInstance.batteries.findBatteryById(ITSInstance.batteries.batteryList, id);
    var existsIndex = this.currentBattery.findTestIndexById(id);
    if (testIndex > -1) { // new test found and not added yet
        var newCST = this.currentBattery.newBatteryTest(ITSInstance.tests.testList[testIndex]);
        if (!ITSInstance.tests.testList[testIndex].detailsLoaded) {
            ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(this.repopulateTestsLists.bind(this));
        }
        this.repopulateTestsLists();
    }
    if (batteryIndex > -1) { // battery found, add it
        ITSInstance.batteries.batteryList[batteryIndex].BatteryTests.forEach(  function (item) {
            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, item.TestID);
            if (testIndex >= 0) {
                var newCST = this.currentBattery.newBatteryTest(ITSInstance.tests.testList[testIndex]);
                newCST.NormID1 = item.NormID1;
                newCST.NormID2 = item.NormID2;
                newCST.NormID3 = item.NormID3;
                if (!ITSInstance.tests.testList[testIndex].detailsLoaded) {
                    ITSInstance.tests.testList[testIndex].loadTestDetailDefinition(this.repopulateTestsLists.bind(this));
                }
            }
        }.bind(this));
        this.repopulateTestsLists(true);
    }
    if (existsIndex > -1) {
        setTimeout(function () {
            ITSInstance.UIController.showWarning('ITSBatteryEditorController.DuplicateTestAdded', 'Please note : You have added the same test twice to this battery. ');
        }, 10);
    }
    this.loadTestAndBatteriesList();
};

ITSBatteryEditorController.prototype.createNewBattery= function (EmailAddress) {
    console.log("Change test battery requested " + EmailAddress);
    // create a new and empty battery
    this.currentBattery = ITSInstance.batteries.newBattery();

    // bind it to the div elements BatteryEditor
    DataBinderTo("BatteryEditor", this.currentBattery);

    // for the tests and batteries
    this.loadTestAndBatteriesList();
};

ITSBatteryEditorController.prototype.repopulateTestsLists =  function (animate) {
    var tempBatteryTestList = this.currentBattery.BatteryTests;

    $('#BatteryEditorTestsSelectionBody').empty();
    if (tempBatteryTestList.length == 0) {

        var newTR0 = $('<tr><td id="BatteryEditorTestsSelectionC1">'+
            ITSInstance.translator.getTranslatedString( 'BatteryChangeEditor', 'NoTestsYet', 'No tests added yet')+
            '</td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('#BatteryEditorTestsSelectionBody').append(newTR0);
    }
    for (var i = 0; i < tempBatteryTestList.length; i++) {
        var newTR = $('<TR>');
        var newTD1 = $('<TD id="BatteryEditorTestsSelectionCA' + i + '">');
        var newTD2 = $('<TD id="BatteryEditorTestsSelectionCB' + i + '">');
        var newTD3 = $('<TD id="BatteryEditorTestsSelectionCC' + i + '">');
        var newTD4 = $('<TD id="BatteryEditorTestsSelectionCD' + i + '">');
        var newTD5 = $('<TD id="BatteryEditorTestsSelectionCE' + i + '">');
        var newTD6 = $('<TD style="min-width: 70px" id="BatteryEditorTestsSelectionCF' + i + '">');
        
        var NewIDel = $('<a onclick="ITSInstance.BatteryEditorController.testsListDelete(' + i + ');">');
        NewIDel.append($('<i class="fa fa-fw fa-trash">'));
        newTD6.append(NewIDel);
        if (i > 0) {
            var NewIUp = $('<a onclick="ITSInstance.BatteryEditorController.testsListMoveUp(' + i + ');">');
            NewIUp.append($('<i class="fa fa-fw fa-arrow-circle-up">'));
            newTD6.append(NewIUp);
        }
        if (i < (tempBatteryTestList.length - 1)) {
            var NewIDown = $('<a onclick="ITSInstance.BatteryEditorController.testsListMoveDown(' + i + ');">');
            NewIDown.append($('<i class="fa fa-fw fa-arrow-circle-down">'));
            newTD6.append(NewIDown);
        }

        var testDefinition = ITSInstance.tests.testList[tempBatteryTestList[i].findTest()];
        newTD1.text(testDefinition.TestName);
        newTD2.text(testDefinition.languageSupportHumanReadable());

        // setup the norm dropdowns
        if (!testDefinition.detailsLoaded) { testDefinition.loadTestDetailDefinition(this.repopulateTestsLists.bind(this)); }
        if (testDefinition.detailsLoaded) {
            var tempBatteryTest = tempBatteryTestList[i];
            var tempNorms = testDefinition.norms;
            if (tempBatteryTest.NormID1 == "00000000-0000-0000-0000-000000000000") {
                // check for norm preselection in the test definition
                tempBatteryTest.NormID1 = testDefinition.getDefaultNorm(1);
                tempBatteryTest.NormID2 = testDefinition.getDefaultNorm(2);
                tempBatteryTest.NormID3 = testDefinition.getDefaultNorm(3);
            }
            if (tempNorms.length > 0) {
                var NewNorm1 = $('<select class="form-control form-control-sm" id="normSelect1" onchange="ITSInstance.BatteryEditorController.normSelected(1,this,' + i + ');">');
                for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                    if (tempNorms[normWalker].id == tempBatteryTest.NormID1) {
                        NewNorm1.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                    } else {
                        NewNorm1.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                    }
                }
                newTD3.append(NewNorm1);
            }

            if (tempNorms.length > 1) {
                var NewNorm2 = $('<select class="form-control form-control-sm" id="normSelect2" onchange="ITSInstance.BatteryEditorController.normSelected(2,this,' + i + ');">');
                for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                    if (tempNorms[normWalker].id == tempBatteryTest.NormID2) {
                        NewNorm2.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                    } else {
                        NewNorm2.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                    }
                }
                newTD4.append(NewNorm2);
            }

            if (tempNorms.length > 2) {
                var NewNorm3 = $('<select class="form-control form-control-sm" id="normSelect3" onchange="ITSInstance.BatteryEditorController.normSelected(3,this,' + i + ');">');
                for (var normWalker = 0; normWalker < tempNorms.length; normWalker++) {
                    if (tempNorms[normWalker].id == tempBatteryTest.NormID3) {
                        NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '" selected>' + tempNorms[normWalker].normDescription + '</option>'))
                    } else {
                        NewNorm3.append($('<option value="' + tempNorms[normWalker].id + '">' + tempNorms[normWalker].normDescription + '</option>'))
                    }
                }
                newTD5.append(NewNorm3);
            }
        }

        newTR.append(newTD1);
        newTR.append(newTD2);
        newTR.append(newTD3);
        newTR.append(newTD4);
        newTR.append(newTD5);
        newTR.append(newTD6);
        $('#BatteryEditorTestsSelectionBody').append(newTR);
    }
    if (animate) {
        $('#BatteryEditorTestsSelection').fadeTo("quick", 0.1);
        $('#BatteryEditorTestsSelection').fadeTo("quick", 1);
    }
};

ITSBatteryEditorController.prototype.testsListMoveUp= function (index) {
    var Temp = this.currentBattery.BatteryTests[index];
    this.currentBattery.BatteryTests[index] = this.currentBattery.BatteryTests[index - 1];
    this.currentBattery.BatteryTests[index - 1] = Temp;
    this.repopulateTestsLists();
};

ITSBatteryEditorController.prototype.testsListMoveDown= function (index) {
    var Temp = this.currentBattery.BatteryTests[index];
    this.currentBattery.BatteryTests[index] = this.currentBattery.BatteryTests[index + 1];
    this.currentBattery.BatteryTests[index + 1] = Temp;
    this.repopulateTestsLists();
};

ITSBatteryEditorController.prototype.testsListDelete= function (index) {
    this.currentBattery.BatteryTests.splice(index, 1);
    this.repopulateTestsLists();
};

ITSBatteryEditorController.prototype.normSelected = function (normSequence, selectElement, testArrayIndex) {
    //console.log(normSequence, selectElement, testArrayIndex);
    if (normSequence == 1) {
        this.currentBattery.BatteryTests[testArrayIndex].NormID1 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 2) {
        this.currentBattery.BatteryTests[testArrayIndex].NormID2 = selectElement.options[selectElement.options.selectedIndex].value;
    }
    if (normSequence == 3) {
        this.currentBattery.BatteryTests[testArrayIndex].NormID3 = selectElement.options[selectElement.options.selectedIndex].value;
    }
};

ITSBatteryEditorController.prototype.saveCurrentBattery = function ( onSuccessCallback ) {
    $('#BatteryEditor-saveIcon')[0].outerHTML = "<i id='BatteryEditor-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
    this.currentBattery.saveToServer(this.saveCurrentBatteryOK.bind(this), this.saveCurrentBatteryError.bind(this));
};
ITSBatteryEditorController.prototype.saveCurrentBatteryOK = function ( onSuccessCallback ) {
    $('#BatteryEditor-saveIcon')[0].outerHTML = "<i id='BatteryEditor-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
    // refresh the battery list in the system
    ITSInstance.batteries.loadAvailableBatteries(function () {  ITSInstance.BatteryEditorController.loadTestAndBatteriesList(); }, function () {});
};
ITSBatteryEditorController.prototype.saveCurrentBatteryError = function ( onSuccessCallback ) {
    $('#BatteryEditor-saveIcon')[0].outerHTML = "<i id='BatteryEditor-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
    ITSInstance.UIController.showWarning("BatteryEditor.SaveError","The battery could not be saved. Please try again later.")
};

ITSBatteryEditorController.prototype.deleteCurrentBattery = function () {
    this.currentBattery.deleteFromServer(function () {}, function () { ITSInstance.UIController.showWarning("BatteryEditor.DeleteError","The battery could not be removed. Please try again later.") });
    setTimeout( window.history.back(), 200 );
};


(function() { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var BatteryEditorDiv = $('<div class="container-fluid" id="BatteryEditor" style="display: none;">');
    $('#ITSMainDiv').append(BatteryEditorDiv);
    $(BatteryEditorDiv).load(ITSJavaScriptVersion + '/Plugins/BatteryEditor/editor.html', function () {
        // register the editor
        ITSInstance.BatteryEditorController = new ITSBatteryEditorController(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.BatteryEditorController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#BatteryEditor");
    })

})() //iife