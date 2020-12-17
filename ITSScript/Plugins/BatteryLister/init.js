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
    var EditorDiv = $('<div class="container-fluid" id="BatteryListerInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/BatteryLister/editor.html', function () {
       // things to do after loading the html
    });

    var ITSBatteryListerEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('73aef9bb-5d84-4ab2-aef6-b37ca101c347', 'BatteryLister editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'List batteries (archived or not)');
        this.path = "BatteryLister";
        this.archivedStatus = "All";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "<tr><th colspan='5' class='text-right text-nowrap'>" +
            "<input type=\"text\" maxlength=\"100\" onkeydown=\"if (event.keyCode == 13) ITSInstance.BatteryListerController.search();\"" +
            " id=\"BatteryListerTableSearchText\" /> <button type=\"button\" class=\"btn-xs btn-success\" onclick='ITSInstance.BatteryListerController.search();'><i class=\"fa fa-search\"></i></button>" +
            "        <div class=\"form-check \">\n" +
            "            <input class=\"form-check-input\" type=\"radio\"  onclick='ITSInstance.BatteryListerController.search(\"All\");' name=\"inlineRadioOptions\" id=\"BatteryListerSearchAll\" value=\"All\">\n" +
            "            <label class=\"form-check-label\" for=\"BatteryListerSearchAll\">All</label>\n" +
            "        </div>\n" +
            "        <div class=\"form-check \">\n" +
            "            <input class=\"form-check-input\" type=\"radio\"  onclick='ITSInstance.BatteryListerController.search(\"Archived\");' name=\"inlineRadioOptions\" id=\"BatteryListerSearchArchived\" value=\"Archived\">\n" +
            "            <label class=\"form-check-label\" for=\"BatteryListerSearchArchived\">Archived</label>\n" +
            "        </div>\n" +
            "        <div class=\"form-check \">\n" +
            "            <input class=\"form-check-input\" type=\"radio\"  onclick='ITSInstance.BatteryListerController.search(\"NotArchived\");' name=\"inlineRadioOptions\" id=\"BatteryListerSearchNotArchived\" value=\"NotArchived\">\n" +
            "            <label class=\"form-check-label\" for=\"BatteryListerSearchNotArchived\">Not archived</label>\n" +
            "        </div>" +
            " </th></tr>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSBatteryListerEditor_Description\" scope=\"col\">Description</th>" +
            "   <th id=\"ITSBatteryListerEditor_ArchivedHeader\" class='d-none d-sm-table-cell' scope=\"col\">Archived</th>" +
            "   <th scope=\"col\"></th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <th scope=\"row\">%%NR%%</th>" +
            "   <td><span notranslate onclick='ITSInstance.BatteryListerController.viewThis(\"%%ID%%\");'>%%DESCRIPTION%%</span></td>" +
            "   <td class='d-none d-sm-table-cell'><span notranslate onclick='ITSInstance.BatteryListerController.viewThis(\"%%ID%%\");'>%%ARCHIVED%%</span></td>" +
            "   <td nowrap>" +
            "   <button type=\"button\" class=\"btn-xs btn-success\"" +
            "    onclick=\'ITSInstance.BatteryListerController.viewThis(\"%%ID%%\");\'>" +
            "    <i class=\"fa fa-xs fa-eye\"></i></button>" +
            "   </td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mID = /%%ID%%/g;
        this.mNR = /%%NR%%/g;
        this.mDESCRIPTION = /%%DESCRIPTION%%/g;
        this.mARCHIVED = /%%ARCHIVED%%/g;
    };

    ITSBatteryListerEditor.prototype.init=function () {
    };

    ITSBatteryListerEditor.prototype.hide= function () {
        $('#BatteryListerInterfaceSessionEdit').hide();
    };

    ITSBatteryListerEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#BatteryListerInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();

        // refresh the battery list so users will always have the latest batteries available in other part of the system
        ITSInstance.batteries.loadAvailableBatteries(function () {}, function () {});

        if ((!this.alreadyLoaded) || (this.alreadyLoaded != document.URL)) {
            this.currentPage = 0;

            this.sortField = "BatteryName";
            this.archived = "N"; // N No Y Yes

            // fields to show in the list for a session : Description, StartedAt, EndedAt, AllowedStartDateTime, AllowedEndDateTime
            $('#BatteryListerTable').empty();
            this.searchField = "";
            this.status = "";

            if (getUrlParameterValue('Status')) {
                this.status = getUrlParameterValue('Status');
            }

            this.buildFilter(true);
        }
    };

    ITSBatteryListerEditor.prototype.buildFilter = function (fireRequest) {
        this.currentPage = 0;
        $('#BatteryListerTableFindMoreButton').hide();
        this.waitForSearch = false;
        this.filter = "";

        if (fireRequest) {
            this.fireRequest();
        }
    };

    ITSBatteryListerEditor.prototype.fireRequest = function () {
        this.itemsList = {};
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.archived = "";

        if (this.archivedStatus == "Archived") this.archived = "Y";
        if (this.archivedStatus == "NotArchived") this.archived = "N";
        ITSInstance.JSONAjaxLoader('batteries' , this.itemsList, this.listLoaded.bind(this), this.listLoadingFailed.bind(this), 'ITSBattery', this.currentPage, 25,
            this.sortField, this.archived, "N", "Y", this.filter, this.searchField);
    };

    ITSBatteryListerEditor.prototype.listLoaded = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        if (this.currentPage ==0) {
            // generate table header
            this.generatedTable = this.tablePart1;
        }

        var batteryType = parseInt(getUrlParameterValue("BatteryType"));
        var itemCounter = 1;
        // generate the records for the returned data
        for (var i=0; i < this.itemsList.length; i++) {
            if (this.itemsList[i].BatteryType != batteryType) continue;

            var rowText = this.tablePart2;

            rowText = rowText.replace( this.mNR, itemCounter++ );
            rowText = rowText.replace( this.mID, this.itemsList[i].ID );
            rowText = rowText.replace( this.mDESCRIPTION, this.itemsList[i].BatteryName );
            rowText = rowText.replace( this.mARCHIVED, this.itemsList[i].Active ? "<i class=\"fa fa-times\"></i>" : "<i class=\"fa fa-check\"></i>" );

            this.generatedTable += rowText;
        }

        // if returned data is less than 25 records then hide the load more button
        $('#BatteryListerTableFindMoreButton').hide();
        if (this.itemsList.length >= 25) { $('#BatteryListerTableFindMoreButton').show(); };

        // replace the div contents with the generated table
        $('#BatteryListerTable').empty();
        $('#BatteryListerTable').append(this.generatedTable + this.tablePart3);

        ITSInstance.translator.translateDiv("#BatteryListerInterfaceSessionEdit");

        $('#BatteryListerTableSearchText').val(this.searchField);
        if (this.setFocusOnSearchField) {
            this.setFocusOnSearchField = false;
        };


        if (this.archivedStatus == "Archived") {
            $('#BatteryListerSearchArchived').attr('checked', true);
        } else if (this.archivedStatus == "NotArchived") {
            $('#BatteryListerSearchNotArchived').attr('checked', true);
        } else {
            $('#BatteryListerSearchAll').attr('checked', true);
        }

        $('#BatteryListerTableSearchText').focus();

        if (this.currentPage > 0) {
            $('html, body').animate({scrollTop: $('html, body').get(0).scrollHeight }, 2000);
        }
    };

    ITSBatteryListerEditor.prototype.listLoadingFailed = function () {
        ITSInstance.UIController.showInterfaceAsWaitingOff();
        ITSInstance.UIController.showError("ITSBatteryLister.LoadListFailed", "The battery list could not be loaded at this moment.", '',
            'window.history.back();');
    };

    ITSBatteryListerEditor.prototype.search = function (archived) {
        if (archived) {
            this.archivedStatus = archived;
        }
        this.searchField = $('#BatteryListerTableSearchText').val();
        this.setFocusOnSearchField = true;
        if (!this.waitForSearch) {
            this.waitForSearch = true;
            this.buildFilter(true);
        }
    };

    ITSBatteryListerEditor.prototype.findMore = function () {
        this.currentPage++;
        this.fireRequest();
    };

    ITSBatteryListerEditor.prototype.viewThis = function (ID) {
        this.alreadyLoaded = document.URL;
        var TestType = parseInt(getUrlParameterValue("BatteryType"));
        TestType == 10 ? TestType = 0 : TestType = TestType;
        ITSRedirectPath("BatteryEditor&BatteryID=" + ID + "&BatteryType=" + getUrlParameterValue("BatteryType")+ "&TestType=" + TestType);
    };

    ITSBatteryListerEditor.prototype.addNew = function (ID) {
        this.alreadyLoaded = document.URL;
        var TestType = parseInt(getUrlParameterValue("BatteryType"));
        TestType == 10 ? TestType = 0 : TestType = TestType;
        ITSRedirectPath("BatteryEditor&BatteryType=" + getUrlParameterValue("BatteryType")+ "&TestType=" + TestType);
    };

    // register the portlet
    ITSInstance.BatteryListerController = new ITSBatteryListerEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.BatteryListerController);
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (! ITSInstance.users.currentUser.MayWorkWithBatteriesOnly) {
            ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#BatteryListerController.ListMenu", ITSInstance.translator.translate("#BatteryListerController.ListMenu", "Edit test batteries"), "fa-check-double", "ITSRedirectPath(\'BatteryLister&BatteryType=10\');");
            ITSInstance.UIController.registerMenuItem('#submenuCourseBuilderLI', "#BatteryListerController.ListCourseMenu", ITSInstance.translator.translate("#BatteryListerController.ListCourseMenu", "Compose course batteries"), "fa-check-double", "ITSRedirectPath(\'BatteryLister&BatteryType=1000\');");
        }
    }, true);

    ITSInstance.MessageBus.subscribe("Battery.Delete", function () {
        ITSInstance.BatteryListerController.alreadyLoaded = "";
    }.bind(this));
    ITSInstance.MessageBus.subscribe("Battery.Update", function () {
        ITSInstance.BatteryListerController.alreadyLoaded = "";
    }.bind(this));

    // translate the portlet
    ITSInstance.translator.translateDiv("#BatteryListerInterfaceSessionEdit");

})()// IIFE