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
function ITSScreenTemplateEditor(session) {
    this.ITSSession = session;
    this.path = "ScreenTemplateEditor";
    this.currentTemplateIndex = -1;
    this.currentVariableIndex = -1;
    this.currentTemplate = {};
    this.currentVariable = {};
};

ITSScreenTemplateEditor.prototype.info = new ITSPortletAndEditorRegistrationInformation('16563d48-4585-428f-99b7-7e0dd6604ca9', 'Screen template editor', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Define and edit screen templates that are used in tests.');

ITSScreenTemplateEditor.prototype.afterOfficeLogin = function () {
    // load the available screen templates for this company. details of the template are loaded when the template is selected by the user
    ITSInstance.screenTemplates.loadAvailableScreenTemplates(this.populateTemplates, function () {
        console.log('ITSScreenTemplateEditor : Loading screen templates failed.');
    });
};

ITSScreenTemplateEditor.prototype.hide = function () {
    $('#AdminInterfaceScreenTemplateEditor').hide();
};

ITSScreenTemplateEditor.prototype.show = function () {
    $('#NavbarsAdmin').show();
    $('#NavbarsAdmin').visibility = 'visible';
    $('#NavBarsFooter').show();
    $('#AdminInterfaceScreenTemplateEditor').show();
    ITSInstance.UIController.initNavBar();

    var tempID = getUrlParameterValue('id');
    if (tempID && (tempID != "")) {
        var found=false;
        // try to find the tempID in the array and if found switch to editing that template
        for (var i=0; i< ITSInstance.screenTemplates.screenTemplates.length; i++ ) {
            if ( ITSInstance.screenTemplates.screenTemplates[i].ID == tempID ) {
                this.selectTemplate(i);
                found =true;
                break;
            }
        }
        if (!found) { setTimeout (this.show.bind(this), 250); } // try again in 250 ms
    }
    else {
        $('#AdminInterfaceScreenTemplateEdit').hide();
        $('#AdminInterfaceScreenTemplateSelect').show();
        this.populateTemplates();
    }
};

ITSScreenTemplateEditor.prototype.redirectToTemplate = function (template_id) {
    ITSRedirectPath(this.path, 'id=' + template_id);
};

ITSScreenTemplateEditor.prototype.redirectToTemplateIndex = function (index) {
    if (ITSInstance.screenTemplates.screenTemplates[index].dbsource >= 1) {
        ITSInstance.UIController.showInfo ("ITSScreenTemplateEditor.centralTemplate", "Centrally managed screen templates cannot be edited.");
    } else {
        ITSRedirectPath(this.path, 'id=' + ITSInstance.screenTemplates.screenTemplates[index].ID);
    }
};

ITSScreenTemplateEditor.prototype.addNewTemplate = function () {
    // initialise a new template and load that in the template editor.
    var newTemplate = ITSInstance.screenTemplates.newScreenTemplate();
    newTemplate.detailsLoaded = true;
    this.selectTemplate(ITSInstance.screenTemplates.screenTemplates.length - 1);
    this.populateTemplates();
    this.redirectToTemplateIndex(ITSInstance.screenTemplates.screenTemplates.length - 1);

    this.currentTemplate.HTMLContent = $('#AdminInterfaceScreenTemplate-htmltemplate').val();
    this.currentTemplate.get_value_snippet = $('#AdminInterfaceScreenTemplate-getvalue').val();
    this.currentTemplate.set_value_snippet = $('#AdminInterfaceScreenTemplate-setvalue').val();
    this.currentTemplate.init_value_snippet = $('#AdminInterfaceScreenTemplate-initscript').val();
    this.currentTemplate.validation_snippet = $('#AdminInterfaceScreenTemplate-validatescript').val();
    this.currentTemplate.isanswered_snippet = $('#AdminInterfaceScreenTemplate-isansweredscript').val();
    this.currentTemplate.generator_snippet = $('#AdminInterfaceScreenTemplate-genscript').val();
    this.currentTemplate.generator_pnp_snippetsnippet = $('#AdminInterfaceScreenTemplate-genscript-PnP').val();
};

ITSScreenTemplateEditor.prototype.populateTemplates = function () {
    // load the available templates in the select list
    $('#AdminInterfaceScreenTemplateSelectList').empty();
    var newElement = "";
    for (var i = 0; i < ITSInstance.screenTemplates.screenTemplates.length; i++) {
        newElement = "<li value='" + i + "' onclick='ITSInstance.newITSScreenTemplateEditorController.redirectToTemplateIndex(this.value);' > <i class='fa fa-fw fa-object-group'></i>&nbsp;&nbsp;" + ITSInstance.screenTemplates.screenTemplates[i].descriptionWithDBIndicator() + "</li>";
        $('#AdminInterfaceScreenTemplateSelectList').append(newElement);
    }
};

ITSScreenTemplateEditor.prototype.populateTemplateVariableList = function () {
    var oldIndex = $('#AdminInterfaceScreenTemplate-TemplateVarSelect')[0].selectedIndex;

    $('#AdminInterfaceScreenTemplate-TemplateVarSelect').empty();
    for (var i = 0; i < this.currentTemplate.TemplateVariables.length; i++) {
        newElement = "<option onclick='ITSInstance.newITSScreenTemplateEditorController.showVariableInEditor('+i+');' >" + this.currentTemplate.TemplateVariables[i].variableName + "</option>";
        $('#AdminInterfaceScreenTemplate-TemplateVarSelect').append(newElement);
    }
    if (oldIndex >= 0) {
        $('#AdminInterfaceScreenTemplate-TemplateVarSelect')[0].selectedIndex = oldIndex;
    }
}

ITSScreenTemplateEditor.prototype.selectTemplate = function (array_index) {
    // select the template from the templates array using the array_index, check if the details are loaded. If not load them and continue with showing that template in the editor.

    $('#AdminInterfaceScreenTemplateEdit').show();
    $('#AdminInterfaceScreenTemplateSelect').hide();
    $('#AdminInterfaceScreenTemplateEditHeader').hide();

    $('#AdminInterfaceScreenTemplate-TEPreview').empty();
    $('#AdminInterfaceScreenTemplate-TEPreview').empty();
    $('#AdminInterfaceScreenTemplate-TTPreview').empty();
    $('#AdminInterfaceScreenTemplate-PnPPreview').empty();

    this.currentTemplateIndex = array_index;
    this.currentTemplate = ITSInstance.screenTemplates.screenTemplates[array_index];
    this.currentVariableIndex = -1;

    if (this.currentTemplate.detailsLoaded) {
        this.selectTemplateShowDetails();
    } else {
        ITSInstance.UIController.showInterfaceAsWaitingOn();
        this.currentTemplate.loadDetailDefinition(this.selectTemplateShowDetails.bind(this),
            function () {
                // notify user
                ITSInstance.UIController.showInterfaceAsWaitingOff();
                ITSInstance.UIController.showDialog("ITSScreenTemplateEditorTemplateLoadError","Template details cannot be loaded", "The template could not be loaded. Please return to the template overview screen and try to load the details again.",[ {btnCaption : "OK"} ]);
            }
            );
    }
};

ITSScreenTemplateEditor.prototype.selectTemplateShowDetails = function () {
    ITSInstance.UIController.showInterfaceAsWaitingOff();
    $('#AdminInterfaceScreenTemplate-description').val(this.currentTemplate.Description);
    $('#AdminInterfaceScreenTemplate-explanation').val(this.currentTemplate.Explanation);
    $('#AdminInterfaceScreenTemplate-remarks').val(this.currentTemplate.Remarks);

    $('#AdminInterfaceScreenTemplate-htmltemplate').val(this.currentTemplate.HTMLContent);
    $('#AdminInterfaceScreenTemplate-pnptemplate').val(this.currentTemplate.HTMLContentPnP);
    $('#AdminInterfaceScreenTemplate-getvalue').val(this.currentTemplate.get_value_snippet);
    $('#AdminInterfaceScreenTemplate-setvalue').val(this.currentTemplate.set_value_snippet);
    $('#AdminInterfaceScreenTemplate-initscript').val(this.currentTemplate.init_value_snippet);
    $('#AdminInterfaceScreenTemplate-validatescript').val(this.currentTemplate.validation_snippet);
    if (this.currentTemplate.isanswered_snippet.trim() == "") { this.currentTemplate.isanswered_snippet = "return true;" }
    $('#AdminInterfaceScreenTemplate-isansweredscript').val(this.currentTemplate.isanswered_snippet);
    $('#AdminInterfaceScreenTemplate-genscript').val(this.currentTemplate.generator_snippet);
    $('#AdminInterfaceScreenTemplate-genscript-PnP').val(this.currentTemplate.generator_pnp_snippet);

    this.populateTemplateVariableList.call(this);

    if (this.currentTemplate.TemplateVariables.length > 0) {
        this.showVariableInEditor(0);
    } else {
        this.showVariableInEditor(-1);
    }
};

ITSScreenTemplateEditor.prototype.showVariableInEditor = function (var_index) {
    $('#AdminInterfaceScreenTemplate-TemplateVarSelect').val('');
    $('#AdminInterfaceScreenTemplate-varname').val('');
    $('#AdminInterfaceScreenTemplate-vardescription').val('');
    $('#AdminInterfaceScreenTemplate-vardefaultvalue').val('');
    $('#AdminInterfaceScreenTemplate-vartype').val('');

    if (var_index >= 0) {
        $('#AdminInterfaceScreenTemplate-TemplateVarSelect').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-varname').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-vardescription').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-vardefaultvalue').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-vartype').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-vartranslatable').removeAttr('disabled');
        $('#AdminInterfaceScreenTemplate-removeTemplateVar').removeAttr('disabled');
        this.currentVariableIndex = var_index;
        if ($('#AdminInterfaceScreenTemplate-TemplateVarSelect')[0].selectedIndex != var_index) {
            $('#AdminInterfaceScreenTemplate-TemplateVarSelect')[0].selectedIndex = var_index;
        }
        var cur_var = this.currentTemplate.TemplateVariables[var_index];
        this.currentVariable = cur_var;
        $('#AdminInterfaceScreenTemplate-varname').val(cur_var.variableName);
        $('#AdminInterfaceScreenTemplate-vardescription').val(cur_var.description);
        $('#AdminInterfaceScreenTemplate-vardefaultvalue').val(cur_var.defaultValue);
        $('#AdminInterfaceScreenTemplate-vartranslatable')[0].checked = cur_var.translatable;
        $('#AdminInterfaceScreenTemplate-vartype'+cur_var.variableType)[0].selected = true;
        //$('#AdminInterfaceScreenTemplate-vartype').val(cur_var.variableType);
    } else {
        $('#AdminInterfaceScreenTemplate-TemplateVarSelect').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-varname').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-vardescription').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-vardefaultvalue').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-vartype').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-vartranslatable').attr('disabled', 'disabled');
        $('#AdminInterfaceScreenTemplate-removeTemplateVar').attr('disabled', 'disabled');
    }
};

ITSScreenTemplateEditor.prototype.addVariableInEditor = function () {
    this.currentTemplate.newScreenTemplateVariable();
    this.populateTemplateVariableList();
    this.showVariableInEditor(this.currentTemplate.TemplateVariables.length - 1);
}

ITSScreenTemplateEditor.prototype.removeVariableInEditor = function () {
    this.currentTemplate.TemplateVariables.splice(this.currentVariableIndex,1);
    this.populateTemplateVariableList();
    this.showVariableInEditor(this.currentTemplate.TemplateVariables.length - 1);
};


ITSScreenTemplateEditor.prototype.showTestEditorPreviewJSon = function () {
    alert(JSON.stringify(this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false)));
};

ITSScreenTemplateEditor.prototype.showTestTakingPreviewJSon = function () {
    alert(JSON.stringify(this.currentTemplate.runtime_get_values(this.testTakingID, this.currentTemplate.RepeatBlockCount, this.currentTemplate)));
    valMess = this.currentTemplate.runtime_validate(this.testTakingID, this.currentTemplate.RepeatBlockCount, 'ST',
            this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false));
    if (valMess != "") {
        alert (valMess);
    }
};

ITSScreenTemplateEditor.prototype.showTestTakingPnPPreviewJSon = function () {
    alert(JSON.stringify(this.currentTemplate.runtime_get_values(this.testTakingPnPID, this.currentTemplate.RepeatBlockCount, this.currentTemplate)));
};

ITSScreenTemplateEditor.prototype.generatePreviews = function () {
    $('#AdminInterfaceScreenTemplate-TEPreview').empty();
    $('#AdminInterfaceScreenTemplate-TTPreview').empty();
    $('#AdminInterfaceScreenTemplate-PnPPreview').empty();

    // now generate 3 different IDs to substitute
    this.testEditorID = "X" + getNewSimpleGeneratorNumber('ui_gen', 999999) + "Y";
    this.testTakingID = "X" + getNewSimpleGeneratorNumber('ui_gen', 999999) + "Y";
    this.testTakingPnPID = "X" + getNewSimpleGeneratorNumber('ui_gen', 999999) + "Y";

    this.currentTemplate.generate_test_editor_view('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, {}, false,
        'ITSInstance.newITSScreenTemplateEditorController.updatePreviews();',
        'ITSInstance.newITSScreenTemplateEditorController.addRepeatBlock();',
        'ITSInstance.newITSScreenTemplateEditorController.removeRepeatBlock();');
    //xxx this.currentTemplate.runtime_init_values(this.testEditorID, this.currentTemplate.RepeatBlockCount, 'ST');

    //  (div, add_to_div, id, templatevalues, varvalues, pnp_view)
    this.currentTemplate.generate_test_taking_view('AdminInterfaceScreenTemplate-TTPreview', false, this.testTakingID,
        this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false), false, true, 'ST');
    //this.currentTemplate.runtime_init_values(this.testTakingID, this.currentTemplate.RepeatBlockCount, 'ST');

    this.currentTemplate.generate_test_taking_view('AdminInterfaceScreenTemplate-PnPPreview', false, this.testTakingPnPID,
        this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false), true, true, 'ST');
    //this.currentTemplate.runtime_init_values(this.testTakingPnPID, this.currentTemplate.RepeatBlockCount, 'ST');
};

ITSScreenTemplateEditor.prototype.updatePreviews = function () {
    var tempval = this.currentTemplate.runtime_get_values(this.testTakingID, this.currentTemplate.RepeatBlockCount, this.currentTemplate);
    this.currentTemplate.generate_test_taking_view('AdminInterfaceScreenTemplate-TTPreview', false, this.testTakingID,
        this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false), false, true, 'ST');
    //this.currentTemplate.runtime_init_values(this.testTakingID, this.currentTemplate.RepeatBlockCount, 'ST');
    this.currentTemplate.runtime_set_values(this.testTakingID, this.currentTemplate.RepeatBlockCount, tempval, this.currentTemplate );

    var tempval = this.currentTemplate.runtime_get_values(this.testTakingPnPID, this.currentTemplate.RepeatBlockCount, this.currentTemplate);
    this.currentTemplate.generate_test_taking_view('AdminInterfaceScreenTemplate-PnPPreview', false, this.testTakingPnPID,
        this.currentTemplate.extract_test_editor_view_templatevalues('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, false), true, true, 'ST');
    //this.currentTemplate.runtime_init_values(this.testTakingPnPID, this.currentTemplate.RepeatBlockCount, 'ST');
    this.currentTemplate.runtime_set_values(this.testTakingPnPID, this.currentTemplate.RepeatBlockCount, tempval, this.currentTemplate );
};

ITSScreenTemplateEditor.prototype.addRepeatBlock = function () {
    this.currentTemplate.RepeatBlockCount = this.currentTemplate.RepeatBlockCount + 1;

    this.currentTemplate.generate_test_editor_view('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, {}, false,
        'ITSInstance.newITSScreenTemplateEditorController.updatePreviews();',
        'ITSInstance.newITSScreenTemplateEditorController.addRepeatBlock();',
        'ITSInstance.newITSScreenTemplateEditorController.removeRepeatBlock();');
    //xxx this.currentTemplate.runtime_init_values(this.testEditorID, this.currentTemplate.RepeatBlockCount, 'ST');

    this.updatePreviews();
};

ITSScreenTemplateEditor.prototype.removeRepeatBlock = function () {
    if (this.currentTemplate.RepeatBlockCount > 0) {
        this.currentTemplate.RepeatBlockCount = this.currentTemplate.RepeatBlockCount - 1;

        this.currentTemplate.generate_test_editor_view('AdminInterfaceScreenTemplate-TEPreview', this.testEditorID, {}, false,
            'ITSInstance.newITSScreenTemplateEditorController.updatePreviews();',
            'ITSInstance.newITSScreenTemplateEditorController.addRepeatBlock();',
            'ITSInstance.newITSScreenTemplateEditorController.removeRepeatBlock();');
        //xxx this.currentTemplate.runtime_init_values(this.testEditorID, this.currentTemplate.RepeatBlockCount, 'ST');

        this.updatePreviews();
    }
};

ITSScreenTemplateEditor.prototype.saveCurrentTemplate = function () {
    // update on the server
    $('#AdminInterfaceScreenTemplate-saveIcon')[0].outerHTML = "<i id='AdminInterfaceScreenTemplate-saveIcon' class='fa fa-fw fa-life-ring fa-spin fa-lg'></i>";
    this.currentTemplate.saveToServer(function(){
        $('#AdminInterfaceScreenTemplate-saveIcon')[0].outerHTML = "<i id=\'AdminInterfaceScreenTemplate-saveIcon' class='fa fa-fw fa-thumbs-up'</i>";
    }, function(errorText){
        $('#AdminInterfaceScreenTemplate-saveIcon')[0].outerHTML = "<i id='AdminInterfaceScreenTemplate-saveIcon' class='fa fa-fw fa-thumbs-up'></i>";
        ITSInstance.UIController.showDialog("ITSScreenTemplateEditorTemplateSaveError","Template details cannot be saved", "The template could not be saved. Please try again. Error details {0}",[ {btnCaption : "OK"} ], [ errorText ]);
    });
};


ITSScreenTemplateEditor.prototype.copyCurrentTemplate = function () {
    var tempAsJson = ITSJSONStringify(this.currentTemplate);
    // create a new template
    var newTemplate = ITSInstance.screenTemplates.newScreenTemplate();
    ITSJSONLoad(newTemplate, tempAsJson);
    // copy the values
//    shallowCopy(tempAsJson, newTemplate);
//    newTemplate.TemplateVariables = JSON.parse(newTemplate.TemplateVariables);
///    newTemplate.afterLoad();
    newTemplate.detailsLoaded = true;
    // reset the properties to a new template
    newTemplate.ID = newGuid();
    newTemplate.Description = "Copy - " + newTemplate.Description;
    // show in UI
    this.selectTemplate(ITSInstance.screenTemplates.screenTemplates.length - 1);
    this.populateTemplates();
    this.redirectToTemplateIndex(ITSInstance.screenTemplates.screenTemplates.length - 1);
    // notify user
    ITSInstance.UIController.showDialog("ITSScreenTemplateEditorCopyTemplate","Template copied", "The template has been copied and can now be edited. It will not be stored until you choose to save it.",[ {btnCaption : "OK"} ]);
};


ITSScreenTemplateEditor.prototype.deleteCurrentTemplateWarning = function () {
    ITSInstance.UIController.showDialog("ITSScreenTemplateEditorDeleteTemplate","Delete template", "Are you sure you want to delete this template?",
        [ {btnCaption : "Yes", btnType : "btn-warning", btnOnClick : "ITSInstance.newITSScreenTemplateEditorController.deleteCurrentTemplate();"}, {btnCaption : "No"} ]);
};


ITSScreenTemplateEditor.prototype.deleteCurrentTemplate = function () {
    // delete from the server
    this.currentTemplate.deleteFromServer(function(){}, function(){});
    // delete locally
    ITSInstance.screenTemplates.screenTemplates.splice(this.currentTemplateIndex,1);
    this.populateTemplates();
    window.history.back();
};

ITSScreenTemplateEditor.prototype.downloadCurrentTemplate = function () {
  saveFileLocally(this.currentTemplate.Description.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".itrscreentemplate", ITSJSONStringify(this.currentTemplate) );
};

ITSScreenTemplateEditor.prototype.uploadCurrentTemplate = function (fileName) {
  loadFileLocally(fileName, this.uploadCurrentTemplate_process.bind(this));
};

ITSScreenTemplateEditor.prototype.uploadCurrentTemplate_process = function (fileContents) {
    ITSJSONLoad(this.currentTemplate, fileContents);
    this.selectTemplateShowDetails();
};

(function () { // iife to prevent pollution of the global memspace

// add the portlet at the proper place, add portlet.html to AdminInterfacePortlets
    var AdminInterfaceTestScreenTemplateEditorDiv = $('<div class="container-fluid" id="AdminInterfaceScreenTemplateEditor" style="display: none;">');
    $('#ITSMainDiv').append(AdminInterfaceTestScreenTemplateEditorDiv);
    $(AdminInterfaceTestScreenTemplateEditorDiv).load(ITSJavaScriptVersion + '/Plugins/ScreenTemplateEditor/editor.html', function () {

        // register the editor
        ITSInstance.newITSScreenTemplateEditorController = new ITSScreenTemplateEditor(ITSInstance);
        ITSInstance.UIController.registerEditor(ITSInstance.newITSScreenTemplateEditorController);

        // translate the portlet
        ITSInstance.translator.translateDiv("#AdminInterfaceScreenTemplateEditor");

        // register the menu items
        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            if (ITSInstance.users.currentUser.IsTestScreenTemplateAuthor) {
                ITSInstance.UIController.registerMenuItem('#submenuTestsAndReportsLI', "#AdminInterfaceScreenTemplateEditor.EditMenu", ITSInstance.translator.translate("#AdminInterfaceScreenTemplateEditor.EditMenu", "Edit test screen templates"), "fa-object-group", "ITSRedirectPath(\'ScreenTemplateEditor\');");
            }
        }, true);

        // init the view
        $('#AdminInterfaceScreenTemplateEdit').hide();
        $('#AdminInterfaceScreenTemplateSelect').show();
    })

})() //iife