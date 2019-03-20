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
    AdminInterfaceTestCatalogViewDiv = $('<div class="container-fluid" id="AdminInterfaceTestCatalogView" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfaceTestCatalogViewDiv);
    $(AdminInterfaceTestCatalogViewDiv).load(ITSJavaScriptVersion + '/Plugins/TestCatalogViewer/viewer.html', function () {
        ITSInstance.translator.translateDiv("#AdminInterfaceTestCatalogView");
    });

    var ITSTestCatalogViewer = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('a83bbacb-14ba-4e4a-ba9b-c86ce785ae69', 'Test catalog viewer', '1.0', 'Copyright 2018 Quopt IT Services BV', 'View the information of a test in the test catalog.');
        this.path = "Catalog";
    };

    ITSTestCatalogViewer.prototype.init = function () {
    };

    ITSTestCatalogViewer.prototype.hide = function () {
        $('#AdminInterfaceTestCatalogView').hide();
    };

    ITSTestCatalogViewer.prototype.show = function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#AdminInterfaceTestCatalogView').show();
        ITSInstance.UIController.initNavBar();

        this.generateTestDropdown();

        this.currentTest = {};

        if (getUrlParameterValue('TestID')) {
            this.TestID = getUrlParameterValue('TestID');

            if (ITSInstance.tests.testListLoaded) {
                this.showTest(this.TestID);
            } else {
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                ITSInstance.tests.loadAvailableTests(function () {
                    this.generateTestDropdown();
                    this.showTest(this.TestID);
                }.bind(this),
                  function () {
                      ITSInstance.UIController.showInterfaceAsWaitingOff();
                      ITSInstance.UIController.showError("ITSOrganisationLister.LoadListFailed", "The Organisation list could not be loaded at this moment.", '',
                          'window.history.back();');
                  } );
            }
        }
    };

    ITSTestCatalogViewer.prototype.generateTestDropdown = function () {
        // load the tests in the dropdown
        $('#AdminInterfaceViewTestCatalogDropdownMenu').empty();
        //<button class="dropdown-item" type="button">Test 1</button>
        for (i = 0; i < ITSInstance.tests.testList.length; i++) {
            $('#AdminInterfaceViewTestCatalogDropdownMenu').append('<button class="dropdown-item" type="button" onclick="ITSInstance.viewCatalogController.showTest(\'' + ITSInstance.tests.testList[i].ID + '\');">' +
                ITSInstance.tests.testList[i].getTestFormatted() + '</button>');
        }
    };

    ITSTestCatalogViewer.prototype.showTest = function (testID) {
        // check if this test is present
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList,testID);
        if (testIndex >= 0) {
            this.currentTest = ITSInstance.tests.testList[testIndex];
            DataBinderTo('AdminInterfaceTestCatalogView', this.currentTest);
            if (!this.currentTest.detailsLoaded) {
                ITSInstance.UIController.showInterfaceAsWaitingOn();
                this.currentTest.loadTestDetailDefinition(this.showTest.bind(this,testID), function () { ITSInstance.UIController.showInterfaceAsWaitingOff(); });
            }
        }
    };

    // register the portlet
    ITSInstance.viewCatalogController = new ITSTestCatalogViewer();
    ITSInstance.UIController.registerEditor(ITSInstance.viewCatalogController);

    // register the menu items

})() //iife