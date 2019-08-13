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
    var EditorDiv = $('<div class="container-fluid" id="TranslationEditorInterfaceSessionEdit" style="display: none;">');
    $('#ITSMainDiv').append(EditorDiv);

    $(EditorDiv).load(ITSJavaScriptVersion + '/Plugins/TranslationEditor/editor.html', function () {
       // things to do after loading the html
    });

    var ITSTranslationEditorEditor = function () {
        this.info = new ITSPortletAndEditorRegistrationInformation('5d7f321a-7d9e-49c9-93ce-d4e0e430a699', 'TranslationEditor editor', '1.0', 'Copyright 2019 Quopt IT Services BV', 'With this plugin you can change the server side translations.');
        this.path = "TranslationEditor";

        this.tablePart1 = "  <table notranslate class=\"table col-12 table-responsive w-100 d-block d-md-table\">" +
            "  <thead>" +
            "  <tr>" +
            "   <th scope=\"col\">#</th>" +
            "   <th id=\"ITSTranslationEditor_ID\" scope=\"col\">ID</th>" +
            "   <th id=\"ITSTranslationEditor_Original\" scope=\"col\">Original text</th>" +
            "   <th id=\"ITSTranslationEditor_Translation\" scope=\"col\">Translated text</th>" +
            "   <th id=\"ITSTranslationEditor_NewTranslation\" scope=\"col\">New text</th>" +
            "  </tr>" +
            "  </thead>" +
            "  <tbody>" ;
        this.tablePart2 = "  <tr>" +
            "   <td><span notranslate'>%%COUNT%%</span></td>" +
            "   <td><span notranslate'>%%ID%%</span></td>" +
            "   <td><span notranslate'>%%ORIGINAL%%</span></td>" +
            "   <td><span notranslate'>%%TRANSLATION%%</span></td>" +
            "   <td style='width:25%'><input type='text' notranslate class=\"form-control form-control-sm\" value=\"%%TRANSLATIONESCAPED%%\" onchange='ITSInstance.TranslationEditorController.changeTranslation(\"%%ID%%\", this.value);'></input></td>" +
            "  </tr>";
        this.tablePart3 = "</tbody></table>" ;

        this.mCount = /%%COUNT%%/g;
        this.mID = /%%ID%%/g;
        this.mOriginal = /%%ORIGINAL%%/g;
        this.mTranslation = /%%TRANSLATION%%/g;
        this.mTranslationEscaped = /%%TRANSLATIONESCAPED%%/g;
    };

    ITSTranslationEditorEditor.prototype.init=function () {
    };

    ITSTranslationEditorEditor.prototype.hide= function () {
        $('#TranslationEditorInterfaceSessionEdit').hide();
    };

    ITSTranslationEditorEditor.prototype.show=function () {
        $('#NavbarsAdmin').show();
        $('#NavbarsAdmin').visibility = 'visible';
        $('#NavBarsFooter').show();
        $('#TranslationEditorInterfaceSessionEdit').show();
        ITSInstance.UIController.initNavBar();
        ITSInstance.UIController.showInterfaceAsWaitingOn(-1);
        setTimeout(ITSInstance.TranslationEditorController.buildTranslationsList.bind(this), 250);
    };

    ITSTranslationEditorEditor.prototype.buildTranslationsList = function() {
        var transList = ITSInstance.translator.translatedStrings;
        var orgList = ITSInstance.translator.originalStrings;

        $('#TranslationEditorList').empty();

        var newTable = this.tablePart1;
        var tempLine = "";
        var counter = 0;
        for (var prop in transList) {
            tempLine = this.tablePart2;
            counter++;

            tempLine = tempLine.replace( this.mID, prop );
            tempLine = tempLine.replace( this.mCount, counter );
            if (typeof transList[prop].originalValue == "undefined") {
                try {
                    tempLine = tempLine.replace(this.mOriginal, orgList[prop].value);
                } catch(error) {}
            } else {
                tempLine = tempLine.replace(this.mOriginal, transList[prop].originalValue);
            }
            tempLine = tempLine.replace( this.mTranslation, transList[prop].value );
            tempLine = tempLine.replace( this.mTranslationEscaped, transList[prop].value.replaceAll("\"","&quot;") );


            newTable += tempLine;
        }
        newTable += this.tablePart3;

        $('#TranslationEditorList').html(newTable);

        ITSInstance.UIController.showInterfaceAsWaitingOff();
    };

    ITSTranslationEditorEditor.prototype.changeTranslation = function (id, textbox) {
        ITSInstance.translator.translatedStrings[id].value = textbox;
        // fire it off to the server
        ITSInstance.genericAjaxUpdate('translations/' + ITSInstance.translator.currentTranslatedLanguage,
            '{"'+id+'":{"id":"'+id+'", "value": "'+textbox+'"}}'
            , function () {}, function () {}, "N","N", undefined, "Y")
        ITSInstance.translator.retranslateInterface();
    };

    // register the portlet
    ITSInstance.TranslationEditorController = new ITSTranslationEditorEditor();
    ITSInstance.UIController.registerEditor(ITSInstance.TranslationEditorController);

    // translate the portlet
    ITSInstance.translator.translateDiv("#TranslationEditorInterfaceSessionEdit");

    // register the menu items if applicable
    ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
        if (ITSInstance.users.currentUser.IsTranslator) {
            ITSInstance.UIController.registerMenuItem('#submenuCompaniesLI', "#AdminInterfaceTranslationEditor.EditMenu", ITSInstance.translator.translate("#AdminInterfaceTranslationEditorEditor.EditMenu", "Edit translated strings"), "fa-language", "ITSRedirectPath(\'TranslationEditor\');");
        }
    }, true);
})()// IIFE