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
    var EditorDiv = $('<div class="container-fluid" id="ReportTemplateLocalPublisherInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ReportTemplateLocalPublisher/editor.html', function () {
       // things to do after loading the html
    });

    var ITSReportTemplateLocalPublisherEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('918a66ae-d432-4a09-9510-a9bbcbcd6be4', 'ReportTemplateLocalPublisher editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Publish tests for usage of all organisations on the server.');
        this.path = "ReportTemplateLocalPublisher";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.ReportTemplateLocalPublisherController.search();\"" +
            " id=\"ReportTemplateLocalPublisherListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.ReportTemplateLocalPublisherController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSReportTemplateLocalPublisherEditor_DescriptionLogin\" scope=\"col\">Report name</th>" +
            "   <th id=\"ITSReportTemplateLocalPublisherEditor_DescriptionName\" scope=\"col\">Test description</th>" +
            "   <th scope=\"col\"><span id=\"ITSReportTemplateLocalPublisherEditor_Publish\">Publish</span></th>" +
            "   <th scope=\"col\"><span id=\"ITSReportTemplateLocalPublisherEditor_Revoke\">Revoke</span></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%Description%%</span></td>" +
            "   <td><span notranslate'>%%Explanation%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success %%hide%% \"" +
            "    onclick=\'ITSInstance.ReportTemplateLocalPublisherController.publish(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-plus\"></i></button>" +
            "   </td><td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-warning %%hiderevoke%%\"" +
            "    onclick=\'ITSInstance.ReportTemplateLocalPublisherController.revokePublish(\"%%ID%%\");\'>" +
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

    ITSReportTemplateLocalPublisherEditor.prototype.init=function () {
    };

    ITSReportTemplateLocalPublisherEditor.prototype.hide= function () {
        $('#ReportTemplateLocalPublisherInterfaceSessionEdit').hide();
    };

    ITSReportTemplateLocalPublisherEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ReportTemplateLocalPublisherInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "Description";
            this.archived = "N"; // N No Y Yes

            $('#ReportTemplateLocalPublisherListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };

    ITSReportTemplateLocalPublisherEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#ReportTemplateLocalPublisherListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSReportTemplateLocalPublisherEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.reportsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();

        //ITSInstance.ReportTemplates.loadAvailableReportTemplates(this.listLoaded.bind(this), this.listLoadingFailed.bind(this), this.searchField);
        ITSInstance.JSONAjaxLoader('reportdefinitions' , this.reportsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSReport', this.currentPage, 25,
            this.sortField, this.archived, "Y", "Y", this.filter, this.searchField);
    };

    ITSReportTemplateLocalPublisherEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.reportsList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace(this.mNR, i + this.currentPage * 25 + 1);
            rowText = rowText.replace(this.mID, this.reportsList[i].id);
            rowText = rowText.replace(this.mDescription, this.reportsList[i].Description);

            var testIndex = ITSInstance.tests.findTestById(ITSInstance.tests.testList, this.reportsList[i].TestID);
            if (testIndex >= 0) {
                rowText = rowText.replace(this.mExplanation, ITSInstance.tests.testList[testIndex].TestName);
            } else {
                rowText = rowText.replace(this.mExplanation, "-");
            }

            if (this.reportsList[i].dbsource >= 1) {
                rowText = rowText.replace(this.mHide, "d-none");
            } else {
               rowText = rowText.replace(this.mHide, "");
            }

            if (this.reportsList[i].dbsource == 0) {
                rowText = rowText.replace(this.mHideRevoke, "d-none");
            } else {
                rowText = rowText.replace(this.mHideRevoke, "");
            }

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#ReportTemplateLocalPublisherListerTableFindMoreButton').hide();
        //if (this.reportsList.length >= 25) { $('#ReportTemplateLocalPublisherListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#ReportTemplateLocalPublisherListerTable').empty();
        $('#ReportTemplateLocalPublisherListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#ReportTemplateLocalPublisherInterfaceSessionEdit");

        $('#ReportTemplateLocalPublisherListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#ReportTemplateLocalPublisherListerTableSearchText').focus();
    };

    ITSReportTemplateLocalPublisherEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSReportTemplateLocalPublisherLister.LoadListFailed", "The report list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSReportTemplateLocalPublisherEditor.prototype.search = function () {
        this.searchField = $('#ReportTemplateLocalPublisherListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSReportTemplateLocalPublisherEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSReportTemplateLocalPublisherEditor.prototype.publish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.tests.findTestById(this.reportsList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.reportsList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadDetailDefinition( this.saveToMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSReportTemplateLocalPublisherLister.LoadTemplateFailed", "The report could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.saveToMaster();
            }
        }
    };
    ITSReportTemplateLocalPublisherEditor.prototype.saveToMaster = function () {
        this.currentTemplate.saveToServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSReportTemplateLocalPublisherLister.SaveTemplateOK", "The report template was successfully published.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSReportTemplateLocalPublisherLister.SaveTemplateFailed", "The report template could not be published at this moment."); },
            true
        )
    };

    ITSReportTemplateLocalPublisherEditor.prototype.revokePublish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.ReportTemplates.findTemplateById(this.reportsList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.reportsList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadTestDetailDefinition( this.removeFromMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSReportTemplateLocalPublisherLister.LoadTemplateFailed", "The report template could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.removeFromMaster();
            }
        }
    };
    ITSReportTemplateLocalPublisherEditor.prototype.removeFromMaster = function () {
        this.currentTemplate.deleteFromServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSReportTemplateLocalPublisherLister.SaveTemplateOK", "The report template was successfully revoked as published template.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSReportTemplateLocalPublisherLister.SaveTemplateFailed", "The report template could not be published at this moment."); }
        )
    };

    // register the portlet
    ITSInstance.ReportTemplateLocalPublisherController = new ITSReportTemplateLocalPublisherEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ReportTemplateLocalPublisherController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ReportTemplateLocalPublisherInterfaceSessionEdit");

    // register the menu items if applicable

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if ( (ITSInstance.users.currentUser.IsReportAuthor) && (ITSInstance.users.currentUser.IsMasterUser) ) {
            ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#ReportTemplateLocalPublisherController.LocalPublisherMenu", ITSInstance.translator.translate("#ReportTemplateLocalPublisherController.LocalPublisherMenu", "Publish report templates"), "fa-door-open", "ITSRedirectPath(\'ReportTemplateLocalPublisher\');");
        }
    });

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("ReportTemplate.Delete", function () { ITSInstance.ReportTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ReportTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("ReportTemplate.Create", function () { ITSInstance.ReportTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ReportTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("ReportTemplate.Update", function () { ITSInstance.ReportTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ReportTemplateLocalPublisherController.currentPage =0; } );

})()// IIFE