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
    var EditorDiv = $('<div class="container-fluid" id="TestTemplateLocalPublisherInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/TestTemplateLocalPublisher/editor.html', function () {
       // things to do after loading the html
    });

    var ITSTestTemplateLocalPublisherEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('646efa03-99d7-4135-bd4c-7aeda977215b', 'TestTemplateLocalPublisher editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Publish tests for usage of all organisations on the server.');
        this.path = "TestTemplateLocalPublisher";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.TestTemplateLocalPublisherController.search();\"" +
            " id=\"TestTemplateLocalPublisherListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.TestTemplateLocalPublisherController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSTestTemplateLocalPublisherEditor_DescriptionLogin\" scope=\"col\">Test name</th>" +
            "   <th id=\"ITSTestTemplateLocalPublisherEditor_DescriptionName\" scope=\"col\">Description</th>" +
            "   <th scope=\"col\"><span id=\"ITSTestTemplateLocalPublisherEditor_Publish\">Publish</span></th>" +
            "   <th scope=\"col\"><span id=\"ITSTestTemplateLocalPublisherEditor_Revoke\">Revoke</span></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%Description%%</span></td>" +
            "   <td><span notranslate'>%%Explanation%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success %%hide%% \"" +
            "    onclick=\'ITSInstance.TestTemplateLocalPublisherController.publish(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-plus\"></i></button>" +
            "   </td><td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-warning %%hiderevoke%%\"" +
            "    onclick=\'ITSInstance.TestTemplateLocalPublisherController.revokePublish(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-arrow-down\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mID = /%%ID%%/g;
        this.mNR = /%%NR%%/g;
        this.mDescription = /%%Description%%/g;
        this.mExplanation = /%%Explanation%%/g;
        this.mHide = /%%hide%%/g;
        this.mHideRevoke = /%%hiderevoke%%/g;
    };

    ITSTestTemplateLocalPublisherEditor.prototype.init=function () {
    };

    ITSTestTemplateLocalPublisherEditor.prototype.hide= function () {
        $('#TestTemplateLocalPublisherInterfaceSessionEdit').hide();
    };

    ITSTestTemplateLocalPublisherEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#TestTemplateLocalPublisherInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "TestName";
            this.archived = "N"; // N No Y Yes

            $('#TestTemplateLocalPublisherListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };

    ITSTestTemplateLocalPublisherEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#TestTemplateLocalPublisherListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSTestTemplateLocalPublisherEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.testsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();

        //ITSInstance.TestTemplates.loadAvailableTestTemplates(this.listLoaded.bind(this), this.listLoadingFailed.bind(this), this.searchField);
        ITSInstance.JSONAjaxLoader('tests' , this.testsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSTest', this.currentPage, -1,
            this.sortField, this.archived, "Y", "Y", this.filter, this.searchField);
    };

    ITSTestTemplateLocalPublisherEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.testsList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace(this.mNR, i + this.currentPage * 25 + 1);
            rowText = rowText.replace(this.mID, this.testsList[i].id);
            rowText = rowText.replace(this.mDescription, this.testsList[i].testNameWithDBIndicator());
            rowText = rowText.replace(this.mExplanation, this.testsList[i].Description);
            if (this.testsList[i].dbsource >= 1) {
                rowText = rowText.replace(this.mHide, "d-none");
            } else {
               rowText = rowText.replace(this.mHide, "");
            }
            if (this.testsList[i].dbsource == 0) {
                rowText = rowText.replace(this.mHideRevoke, "d-none");
            } else {
                rowText = rowText.replace(this.mHideRevoke, "");
            }

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#TestTemplateLocalPublisherListerTableFindMoreButton').hide();
        //if (this.testsList.length >= 25) { $('#TestTemplateLocalPublisherListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#TestTemplateLocalPublisherListerTable').empty();
        $('#TestTemplateLocalPublisherListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#TestTemplateLocalPublisherInterfaceSessionEdit");

        $('#TestTemplateLocalPublisherListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#TestTemplateLocalPublisherListerTableSearchText').focus();
    };

    ITSTestTemplateLocalPublisherEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSTestTemplateLocalPublisherLister.LoadListFailed", "The test list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSTestTemplateLocalPublisherEditor.prototype.search = function () {
        this.searchField = $('#TestTemplateLocalPublisherListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSTestTemplateLocalPublisherEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSTestTemplateLocalPublisherEditor.prototype.publish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.tests.findTestById(this.testsList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.testsList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadTestDetailDefinition( this.saveToMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSTestTemplateLocalPublisherLister.LoadTemplateFailed", "The test could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.saveToMaster();
            }
        }
    };
    ITSTestTemplateLocalPublisherEditor.prototype.saveToMaster = function () {
        this.currentTemplate.saveToServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSTestTemplateLocalPublisherLister.SaveTemplateOK", "The test template was successfully published.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSTestTemplateLocalPublisherLister.SaveTemplateFailed", "The test template could not be published at this moment."); },
            true
        )
    };

    ITSTestTemplateLocalPublisherEditor.prototype.revokePublish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.testsList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadTestDetailDefinition( this.removeFromMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSTestTemplateLocalPublisherLister.LoadTemplateFailed", "The test template could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.removeFromMaster();
            }
        }
    };
    ITSTestTemplateLocalPublisherEditor.prototype.removeFromMaster = function () {
        this.currentTemplate.deleteFromServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSTestTemplateLocalPublisherLister.SaveTemplateOK", "The test template was successfully revoked as published template.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSTestTemplateLocalPublisherLister.SaveTemplateFailed", "The test template could not be published at this moment."); }
        )
    };

    // register the portlet
    ITSInstance.TestTemplateLocalPublisherController = new ITSTestTemplateLocalPublisherEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.TestTemplateLocalPublisherController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#TestTemplateLocalPublisherInterfaceSessionEdit");

    // register the menu items if applicable

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if ( (ITSInstance.users.currentUser.IsTestAuthor) && (ITSInstance.users.currentUser.IsMasterUser) ) {
            ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#TestTemplateLocalPublisherController.LocalPublisherMenu", ITSInstance.translator.translate("#TestTemplateLocalPublisherController.LocalPublisherMenu", "Publish test templates"), "fa-door-open", "ITSRedirectPath(\'TestTemplateLocalPublisher\');");
        }
    }, true);

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("TestTemplate.Delete", function () { ITSInstance.TestTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.TestTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("TestTemplate.Create", function () { ITSInstance.TestTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.TestTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("TestTemplate.Update", function () { ITSInstance.TestTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.TestTemplateLocalPublisherController.currentPage =0; } );

})()// IIFE