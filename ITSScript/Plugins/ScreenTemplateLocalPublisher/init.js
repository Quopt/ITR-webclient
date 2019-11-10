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
    var EditorDiv = $('<div class="container-fluid" id="ScreenTemplateLocalPublisherInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/ScreenTemplateLocalPublisher/editor.html', function () {
       // things to do after loading the html
    });

    var ITSScreenTemplateLocalPublisherEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('7fb3a9d8-7918-4951-a699-6ef4f267def4', 'ScreenTemplateLocalPublisher editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Publish screen templates for usage of all organisations on the server.');
        this.path = "ScreenTemplateLocalPublisher";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='6' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.ScreenTemplateLocalPublisherController.search();\"" +
            " id=\"ScreenTemplateLocalPublisherListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.ScreenTemplateLocalPublisherController.search();'>" +
            " <i class=\"fa fa-search\"></i></button></th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSScreenTemplateLocalPublisherEditor_DescriptionLogin\" scope=\"col\">Description</th>" +
            "   <th id=\"ITSScreenTemplateLocalPublisherEditor_DescriptionName\" scope=\"col\">Explanation</th>" +
            "   <th scope=\"col\"><span id=\"ITSScreenTemplateLocalPublisherEditor_Publish\">Publish</span></th>" +
            "   <th scope=\"col\"><span id=\"ITSScreenTemplateLocalPublisherEditor_Revoke\">Revoke</span></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate>%%Description%%</span></td>" +
            "   <td><span notranslate'>%%Explanation%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success %%hide%% \"" +
            "    onclick=\'ITSInstance.ScreenTemplateLocalPublisherController.publish(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-cart-plus\"></i></button>" +
            "   </td><td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-warning %%hiderevoke%%\"" +
            "    onclick=\'ITSInstance.ScreenTemplateLocalPublisherController.revokePublish(\"%%ID%%\");\'>" +
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

    ITSScreenTemplateLocalPublisherEditor.prototype.init=function () {
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.hide= function () {
        $('#ScreenTemplateLocalPublisherInterfaceSessionEdit').hide();
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#ScreenTemplateLocalPublisherInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "Description";
            this.archived = "N"; // N No Y Yes

            $('#ScreenTemplateLocalPublisherListerTable').empty();
            this.searchField = "";
            this.status = "";

            this.buildFilter(true);
        }
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#ScreenTemplateLocalPublisherListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.fireRequest = function () {
        // ITSSession.prototype.JSONAjaxLoader = function (URL, objectToPutDataIn, OnSuccess, OnError, DefaultObjectType, PageNumber, PageSize, PageSort, IncludeArchived, IncludeMaster, IncludeClient, Filter) {
        this.templatesList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();

        //ITSInstance.screenTemplates.loadAvailableScreenTemplates(this.listLoaded.bind(this), this.listLoadingFailed.bind(this), this.searchField);
        ITSInstance.JSONAjaxLoader('screentemplates' , this.templatesList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSScreenTemplate', this.currentPage, 0,
            this.sortField, this.archived, "Y", "Y", this.filter, this.searchField);
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        // generate the records for the returned data
        for (var i=0; i < this.templatesList.length; i++) {
            var rowText = this.tablePart2;
            rowText = rowText.replace(this.mNR, i + this.currentPage * 25 + 1);
            rowText = rowText.replace(this.mID, this.templatesList[i].id);
            rowText = rowText.replace(this.mDescription, this.templatesList[i].descriptionWithDBIndicator());
            rowText = rowText.replace(this.mExplanation, this.templatesList[i].Explanation);
            if (this.templatesList[i].dbsource >= 1) {
                rowText = rowText.replace(this.mHide, "d-none");
            } else {
               rowText = rowText.replace(this.mHide, "");
            }
            if (this.templatesList[i].dbsource == 0) {
                rowText = rowText.replace(this.mHideRevoke, "d-none");
            } else {
                rowText = rowText.replace(this.mHideRevoke, "");
            }

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#ScreenTemplateLocalPublisherListerTableFindMoreButton').hide();
        //if (this.templatesList.length >= 25) { $('#ScreenTemplateLocalPublisherListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#ScreenTemplateLocalPublisherListerTable').empty();
        $('#ScreenTemplateLocalPublisherListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#ScreenTemplateLocalPublisherInterfaceSessionEdit");

        $('#ScreenTemplateLocalPublisherListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };
        $('#ScreenTemplateLocalPublisherListerTableSearchText').focus();
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSScreenTemplateLocalPublisherLister.LoadListFailed", "The screen templates list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.search = function () {
        this.searchField = $('#ScreenTemplateLocalPublisherListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.publish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.screenTemplates.findTemplateById(this.templatesList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.templatesList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadDetailDefinition( this.saveToMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSScreenTemplateLocalPublisherLister.LoadTemplateFailed", "The screen template could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.saveToMaster();
            }
        }
    };
    ITSScreenTemplateLocalPublisherEditor.prototype.saveToMaster = function () {
        this.currentTemplate.saveToServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSScreenTemplateLocalPublisherLister.SaveTemplateOK", "The screen template was successfully published.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSScreenTemplateLocalPublisherLister.SaveTemplateFailed", "The screen template could not be published at this moment."); }
        )
    };

    ITSScreenTemplateLocalPublisherEditor.prototype.revokePublish = function (ID) {
        this.templateID = ID;
        this.templateIndex = ITSInstance.screenTemplates.findTemplateById(this.templatesList, ID);
        if (this.templateIndex >= 0) {
            this.currentTemplate = this.templatesList[this.templateIndex];
            if (!this.currentTemplate.detailsLoaded) {
                this.currentTemplate.loadDetailDefinition( this.removeFromMaster.bind(this),
                    function () {
                        ITSInstance.UIController.showError("ITSScreenTemplateLocalPublisherLister.LoadTemplateFailed", "The screen template could not be loaded at this moment.", '',
                            'window.history.back();');
                    });
            } else {
                this.removeFromMaster();
            }
        }
    };
    ITSScreenTemplateLocalPublisherEditor.prototype.removeFromMaster = function () {
        this.currentTemplate.deleteFromServerMaster(
            function () { ITSInstance.UIController.showInfo ("ITSScreenTemplateLocalPublisherLister.SaveTemplateOK", "The screen template was successfully revoked as published template.");
                this.fireRequest(); }.bind(this),
            function () { ITSInstance.UIController.showError("ITSScreenTemplateLocalPublisherLister.SaveTemplateFailed", "The screen template could not be published at this moment."); }
        )
    };

    // register the portlet
    ITSInstance.ScreenTemplateLocalPublisherController = new ITSScreenTemplateLocalPublisherEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.ScreenTemplateLocalPublisherController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#ScreenTemplateLocalPublisherInterfaceSessionEdit");

    // register the menu items if applicable

    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if ( (ITSInstance.users.currentUser.IsTestScreenTemplateAuthor) && (ITSInstance.users.currentUser.IsMasterUser) ) {
            ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#ScreenTemplateLocalPublisherController.LocalPublisherMenu", ITSInstance.translator.translate("#ScreenTemplateLocalPublisherController.LocalPublisherMenu", "Publish screen templates"), "fa-door-open", "ITSRedirectPath(\'ScreenTemplateLocalPublisher\');");
        }
    }, true);

    // messagebus subscriptions
    ITSInstance.MessageBus.subscribe("ScreenTemplate.Delete", function () { ITSInstance.ScreenTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ScreenTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("ScreenTemplate.Create", function () { ITSInstance.ScreenTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ScreenTemplateLocalPublisherController.currentPage =0; } );
    ITSInstance.MessageBus.subscribe("ScreenTemplate.Update", function () { ITSInstance.ScreenTemplateLocalPublisherController.alreadyLoaded = false; ITSInstance.ScreenTemplateLocalPublisherController.currentPage =0; } );

})()// IIFE