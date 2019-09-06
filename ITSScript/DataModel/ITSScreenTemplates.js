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

function ITSScreenTemplates(session) {
    this.ITSSession = session;
    this.screenTemplates = []; // array of ITS Screen templates

    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.currentlyLoading = false;
}

ITSScreenTemplates.prototype.loadAvailableSucces = function () {
    this.currentlyLoading = false;
    this.templatesLoaded = true;
    for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};
ITSScreenTemplates.prototype.loadAvailableError = function () {
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSScreenTemplates.prototype.loadAvailableScreenTemplates = function (whenLoaded, onError) {
    //console.log("loading available test screen templates");
    ITSInstance.screenTemplates.screenTemplates.length = 0;
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (onError) {
        this.onErrorCallbacks.push(onError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;

        ITSInstance.genericAjaxLoader('screentemplates', this, this.loadAvailableSucces.bind(this), this.loadAvailableError.bind(this),
            function () {
                var tempObj = new ITSScreenTemplate(this, ITSInstance);
                ITSInstance.screenTemplates.screenTemplates.push(tempObj);
                return tempObj;
            }.bind(this), 0, 999999, '', 'Y', 'Y', 'Y');
    }
};

ITSScreenTemplates.prototype.findTemplateById = function (theCollectionToSearch, TemplateID) {
    var i = 0;
    var found = false;
    while ((i < theCollectionToSearch.length) && (!found)) {
        if (theCollectionToSearch[i].ID.toUpperCase() == TemplateID.toUpperCase()) {
            found = true;
        } else {
            i = i + 1;
        }
    }
    if (found) {
        return i;
    } else {
        return -1;
    }
};

ITSScreenTemplates.prototype.newScreenTemplate = function () {
    var newTemplate = new ITSScreenTemplate(this, this.ITSSession);
    this.screenTemplates.push(newTemplate);
    newTemplate.Description = 'Template' + this.screenTemplates.length;
    return newTemplate;
}

function ITSScreenTemplate(parent, session) {
    this.ITSSession = session;
    this.parent = parent;

    // id and basic data
    this.ID = newGuid();
    this.Description = "";
    this.Explanation = "";
    this.Remarks = "";
    this.TemplateType = 0; // 0 = screen component template, 10 = screen layout template

    // array of ITSScreenTemplateVariable values
    this.TemplateVariables = [];
    // the number of repeat blocks (1 block by default)
    this.RepeatBlockCount = 1;

    this.constIDtext = /%%ID%%/g;
    this.constRepeatBlockNrtext = /%%RepeatBlockNr%%/g;
    this.constNrOfRepeatBlockstext = /%%NrOfRepeatBlocks%%/g;
    this.constRepeatBlockIDPostFixtext = /%%RepeatBlockID%%/g;
    this.constRepeatBlockTest = '<!--REPEATBLOCK-->';
    this.constVarEnvelope = '%%';

    // HTML template
    this.HTMLContent = "";
    this.HTMLContentPnP = "";

    // generator and get/set value snippets
    this.get_value_snippet = "";
    this.set_value_snippet = "";
    this.init_value_snippet = "";
    this.generator_snippet = "";
    this.generator_pnp_snippet = "";
    this.generator_summary_snippet = "";
    this.validation_snippet = "";
    this.isanswered_snippet = "";

    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";

    // internal loading status variables
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.currentlyLoading = false;
    this.detailsLoaded = false;

    this.persistentProperties = ['ID', 'Description', 'Explanation', 'Remarks', 'TemplateVariables',
        'HTMLContent', 'HTMLContentPnP', 'get_value_snippet', 'set_value_snippet', 'TemplateType',
        'init_value_snippet', 'generator_snippet', 'generator_pnp_snippet', 'generator_summary_snippet',
        'validation_snippet', 'isanswered_snippet', 'PluginData'];
}

ITSScreenTemplate.prototype.descriptionWithDBIndicator = function () {
    if (this.dbsource) {
        if (this.dbsource == 1) {
            return this.Description + " " + ITSInstance.translator.getTranslatedString("js", "MasterTag", "[centrally managed]");;
        } else {
            return this.Description;
        }
    } else {
        return this.Description;
    }
};

ITSScreenTemplate.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('screentemplates/' + this.ID, OnSuccess, OnError, "N", "Y");
};

ITSScreenTemplate.prototype.deleteFromServerMaster = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('screentemplates/' + this.ID, OnSuccess, OnError, "Y", "N");
};

ITSScreenTemplate.prototype.saveToServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxUpdate('screentemplates/' + this.ID, ITSJSONStringify(this), OnSuccess, OnError, "N", "Y");
};

ITSScreenTemplate.prototype.saveToServerMaster = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxUpdate('screentemplates/' + this.ID, ITSJSONStringify(this), OnSuccess, OnError, "Y", "N");
};

ITSScreenTemplate.prototype.newScreenTemplateVariable = function () {
    var newTemplateVar = new ITSScreenTemplateVariable(this, this.ITSSession);
    this.TemplateVariables.push(newTemplateVar);
    newTemplateVar.variableName = "Var" + this.TemplateVariables.length;
    return newTemplateVar;
};

ITSScreenTemplate.prototype.loadDetailSucces = function () {
    console.log("Loaded screen template details " + this.Description);
    this.currentlyLoading = false;
    for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
    this.detailsLoaded = true;
}

ITSScreenTemplate.prototype.loadDetailError = function () {
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
}

ITSScreenTemplate.prototype.loadDetailDefinition = function (whenLoaded, OnError) {
    //console.log("loading screen template details " + this.Description);
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (OnError) {
        this.onErrorCallbacks.push(OnError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;
        var myITSSession = this.ITSSession;

        if (this.dbsource ==0) {
            ITSInstance.JSONAjaxLoader('screentemplates/' + this.ID, this, this.loadDetailSucces.bind(this), this.loadDetailError.bind(this),
                undefined, 0, 999999, '','', 'N', "Y");
        } else {
            ITSInstance.JSONAjaxLoader('screentemplates/' + this.ID, this, this.loadDetailSucces.bind(this), this.loadDetailError.bind(this),
                undefined, 0, 999999, '', '', 'Y', "N");
        }
    }
};


ITSScreenTemplate.prototype.generateTemplateFunctions = function () {
    // this function will generate the following functions on this object instance (so NOT on the prototype)
    //   runtime_get_values( template_id, num_blocks )
    //   runtime_set_values( template_id, num_blocks, var_values)
    //   runtime_init(template_id, num_blocks, test_mode, template_values)
    //     note that test_mode is empty if in a test taking mode, TE if in Test Editor preview mode and ST when in screen template preview mode
    //   runtime_generate(template_id, num_blocks)
    //   runtime_generate_pnp(template_id, num_blocks)
    eval("emptyfunc = function () {};");
    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, template_values) { " + this.get_value_snippet + " }; ");
    } catch (err) {
        console.log("get_value_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_get_values'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, varvalue, template_values) { " + this.set_value_snippet + " }; ");
    } catch (err) {
        console.log("set_value_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_set_values'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, test_mode, template_values) { " + this.init_value_snippet + " }; ");
    } catch (err) {
        console.log("init_value_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_init_values'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, template_values) { " + this.generator_snippet + " }; ");
    } catch (err) {
        console.log("generator_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_generate'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, template_values) { " + this.generator_pnp_snippet + " }; ");
    } catch (err) {
        console.log("generator_pnp_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_generate_pnp'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, template_values, current_values_array) { " + this.generator_summary_snippet + " }; ");
    } catch (err) {
        console.log("generator_summary_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_generate_summary'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, test_mode, template_values, runtime_values) { " + this.validation_snippet + " }; ");
    } catch (err) {
        console.log("validation_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_validate'] = func;

    var func = emptyfunc;
    try {
        eval("func = function(id, num_blocks, test_mode, template_values, runtime_values) { " + this.isanswered_snippet + " }; ");
    } catch (err) {
        console.log("isanswered_snippet contains error " + this.Description + " " + err.message );
    }
    this['runtime_isanswered'] = func;
};

ITSScreenTemplate.prototype.getVariableValue = function (varName) {
    for (var i = 0; i < this.TemplateVariables.length; i++) {
        if (this.TemplateVariables[i].variableName == varName) {
            return this.TemplateVariables[i].varValue;
        }
    }
    return "";
};

ITSScreenTemplate.prototype.generate_template_and_scan_for_repeatblocks = function (templatevalues, pnp_template, id, div) {
    this.generateTemplateFunctions();
    var template = "";

    if (!templatevalues) {
        templatevalues = {"RepeatBlockCount": this.RepeatBlockCount};
        templatevalues.persistentProperties = "*ALL*";
    }
    if (!templatevalues.RepeatBlockCount) {
        templatevalues.RepeatBlockCount = this.RepeatBlockCount;
    }
    var RepeatBlockCount = templatevalues.RepeatBlockCount;

    // generate the template
    if (!pnp_template) {
        template = this.runtime_generate(id, RepeatBlockCount, templatevalues);
        if (typeof template == "undefined") {
            template = this.HTMLContent;
        }
    } else {
        template = this.runtime_generate_pnp(id, RepeatBlockCount, templatevalues);
        if (typeof template == "undefined") {
            template = this.HTMLContentPnP;
            if (template == "") {
                template = this.HTMLContent;
            }
        }
    }
    var template_id = id;

    // replace %%ID%% with the given ID (prefixed with X and postfixed with Y) and insert the amount of repeatblocks
    template = template.replace(this.constIDtext, template_id);
    template = template.replace(this.constNrOfRepeatBlockstext, RepeatBlockCount);


    // determine all variables inside the repeat block (they will have to be repeated for each repeatblock)
    var find_pos = template.indexOf(this.constRepeatBlockTest, 0);
    var repeat_block_vars = [];
    var block_to_scan = "";
    // there is a repeat block
    while (find_pos >= 0) {
        start_pos = find_pos;
        end_pos = template.indexOf(this.constRepeatBlockTest, start_pos + 1);
        block_to_scan = template.substr(start_pos, end_pos - start_pos);
        if (end_pos > 0) {
            find_pos = end_pos + 1;

            // now locate a variable in the block if there
            for (var i = 0; i < this.TemplateVariables.length; i++) {
                // try to locate the variable
                if (block_to_scan.indexOf(this.constVarEnvelope + this.TemplateVariables[i].variableName + this.constVarEnvelope) >= 0) {
                    repeat_block_vars.push(this.TemplateVariables[i]);
                }
            }
        }
        find_pos = template.indexOf(this.constRepeatBlockTest, find_pos);
    }

    return {
        templatevalues: templatevalues,
        template_id: template_id,
        repeat_block_vars: repeat_block_vars,
        template: template
    };
}

ITSScreenTemplate.prototype.generate_test_editor_view = function (div, id, templatevalues, pnp_template, on_change_function, on_add_element_function, on_delete_element_function, placeholderlist, onplaceholderchangefunction, placeholdervalue, testdefinition) {
    // div - place to generate the view in the html page
    // id - id of this template
    // templatesvalues - any already filled in values for this template (js object)
    // pnp_template - true if this test editor view has to be generated with the PnP template

    var __ret = this.generate_template_and_scan_for_repeatblocks(templatevalues, pnp_template, id, div);

    templatevalues = __ret.templatevalues;
    var template_id = __ret.template_id;
    var repeat_block_vars = __ret.repeat_block_vars;
    this.RepeatBlockCount = templatevalues.RepeatBlockCount; // assume that we will start editing this view, may not be the case

    // prepare the div object
    $('#' + div).empty();

    // generate the placeholder list
    if (placeholderlist) {
        if (placeholderlist.length > 0) {
            // there are placeholders to generate
            var select = '<div NoTranslate class="row">' +
                '<label NoTranslate for="PLACEHOLDER' + div + '" class="col-2 col-form-label">' + 'Generate in' + '</label>' +
                '<div NoTranslate class="col">' +
                '<select NoTranslate class="form-control" onchange="' + onplaceholderchangefunction + '" onkeyup="' + onplaceholderchangefunction + '" id="PLACEHOLDER' + div + '">';
            select = select + '<option NoTranslate value="">-</option>';
            for (var i=0; i < placeholderlist.length; i++) {
                // now add the options from the default settings
                if (placeholdervalue == placeholderlist[i]) {
                    select = select + '<option selected NoTranslate value="' +placeholderlist[i] + '">' + placeholderlist[i] + '</option>';
                } else {
                    select = select + '<option NoTranslate value="' +placeholderlist[i] + '">' + placeholderlist[i] + '</option>';
                }
            }
            select = select + '</select></div></div>';
            $('#' + div).append(select);
        }
    }
    // generate interface components for all variables, taking the amount of repeatblocks into account and the variables inside that repeatblock
    for (var i = 0; i < this.TemplateVariables.length; i++) {
        // is this a repeat block var? If so generate at the bottom ...
        if (repeat_block_vars.indexOf(this.TemplateVariables[i]) < 0) {
            this.TemplateVariables[i].generate_variable_for_test_editor(this, div, templatevalues, 0, on_change_function, testdefinition);
        }
    }
    for (var repeat_block_counter = 0; repeat_block_counter < this.RepeatBlockCount; repeat_block_counter++) {
        for (var i = 0; i < this.TemplateVariables.length; i++) {
            // is this a repeat block var? If so we can generate it now !
            if (repeat_block_vars.indexOf(this.TemplateVariables[i]) >= 0) {
                this.TemplateVariables[i].generate_variable_for_test_editor(this, div, templatevalues, repeat_block_counter + 1, on_change_function, testdefinition);
            }
        }
    }

    // and add the add and delete buttons if there is a repeatblock present
    if (repeat_block_vars.length > 0) {
        $('#' + div).append('<button type="button" class="btn-sm btn-success" onclick="' + on_add_element_function + '"><i class="fa fa-sm fa-plus"></i></button>');
        $('#' + div).append('<button type="button" class="btn-sm btn-success" onclick="' + on_delete_element_function + '"><i class="fa fa-sm fa-minus"></i></button>');
    }
};

ITSScreenTemplate.prototype.extract_test_editor_view_templatevalues = function (div, id, pnp_template) {
    // repeatblockcount is taken from this object. This means UI state is in this object. Fine for now.
    var templatevalues = {};
    templatevalues.persistentProperties = "*ALL*";
    templatevalues.RepeatBlockCount = this.RepeatBlockCount;

    var __ret = this.generate_template_and_scan_for_repeatblocks(templatevalues, pnp_template, id, div);

    templatevalues = __ret.templatevalues;
    var template_id = __ret.template_id;
    var repeat_block_vars = __ret.repeat_block_vars;
    this.RepeatBlockCount = templatevalues.RepeatBlockCount; // assume that we will start editing this view, may not be the case

    // get values for regular variables
    for (var i = 0; i < this.TemplateVariables.length; i++) {
        // is this a repeat block var? If so generate at the bottom ...
        if (repeat_block_vars.indexOf(this.TemplateVariables[i]) < 0) {
            templatevalues[this.TemplateVariables[i].variableName] = this.TemplateVariables[i].get_variable_value_for_test_editor(this, div, 0);
        }
    }
    // get values for repeat block variables
    for (var repeat_block_counter = 0; repeat_block_counter < this.RepeatBlockCount; repeat_block_counter++) {
        for (var i = 0; i < this.TemplateVariables.length; i++) {
            // is this a repeat block var? If so we can generate it now !
            if (repeat_block_vars.indexOf(this.TemplateVariables[i]) >= 0) {
                if (repeat_block_counter > 0) {
                    templatevalues[this.TemplateVariables[i].variableName + "_" + (repeat_block_counter + 1)] = this.TemplateVariables[i].get_variable_value_for_test_editor(this, div, repeat_block_counter + 1);
                } else {
                    templatevalues[this.TemplateVariables[i].variableName] = this.TemplateVariables[i].get_variable_value_for_test_editor(this, div, repeat_block_counter + 1);
                }
            }
        }
    }

    return templatevalues;
};


ITSScreenTemplate.prototype.expand_repeat_block_and_parameters_with_blockcount = function (RepeatBlockCount, template, repeat_block_vars) {
    if (RepeatBlockCount >= 1) {
        var find_pos = template.indexOf(this.constRepeatBlockTest, 0);
        var block_to_scan = "";
        // there is a repeat block
        while (find_pos >= 0) {
            var repeat_blocks = "";
            var start_pos = find_pos;
            var end_pos = template.indexOf(this.constRepeatBlockTest, start_pos + 1);
            block_to_scan = template.substr(start_pos, end_pos - start_pos);
            old_block_to_scan_length = block_to_scan.length;
            var new_block_to_scan = "";
            if (end_pos > 0) {
                find_pos = end_pos + 1;

                for (var i = 1; i <= RepeatBlockCount; i++) {
                    // substitute the vars in the repeat block with postfixes vars
                    new_block_to_scan = block_to_scan;
                    for (var var_counter = 0; var_counter < repeat_block_vars.length; var_counter++) {
                        if (i > 1) {
                            var toReplace = this.constVarEnvelope + repeat_block_vars[var_counter].variableName + this.constVarEnvelope;
                            var newVal = this.constVarEnvelope + repeat_block_vars[var_counter].variableName + "_" + i + this.constVarEnvelope;
                            new_block_to_scan = new_block_to_scan.replace(new RegExp(toReplace, 'g'), newVal);
                        }
                    }

                    // replace the optional placeholders with the right values
                    new_block_to_scan = new_block_to_scan.replace(this.constRepeatBlockNrtext, i);
                    if (i > 1) {
                        new_block_to_scan = new_block_to_scan.replace(this.constRepeatBlockIDPostFixtext, "_" + i);
                    } else {
                        new_block_to_scan = new_block_to_scan.replace(this.constRepeatBlockIDPostFixtext, "");
                    }

                    // add it to the substitute block
                    repeat_blocks = repeat_blocks + new_block_to_scan;
                }
            }
            new_block_to_scan_length = repeat_blocks.length;

            // now replace the original repeatblock with the substitute new_block_to_scan

            template = template.substr(0, start_pos) + repeat_blocks + template.substr(end_pos);
            find_pos = find_pos + (new_block_to_scan_length - old_block_to_scan_length);

            // look for the next repeat block
            find_pos = template.indexOf(this.constRepeatBlockTest, find_pos);
        }

    }
    return template;
}

ITSScreenTemplate.prototype.replace_variables_with_actual_values = function (repeat_block_vars, template, varvalues, RepeatBlockCount, id) {
// replace all variables with the indicated values
    for (var i = 0; i < this.TemplateVariables.length; i++) {
        // is this a repeat block var? If so generate at the bottom ...
        if (repeat_block_vars.indexOf(this.TemplateVariables[i]) < 0) {
            var toReplace = this.constVarEnvelope + this.TemplateVariables[i].variableName + this.constVarEnvelope;
            var newVal = varvalues[this.TemplateVariables[i].variableName] ? varvalues[this.TemplateVariables[i].variableName] : this.TemplateVariables[i].defaultValue;
            newVal = this.check_value_for_specials(this.TemplateVariables[i].variableType, id, newVal);
            template = template.replace(new RegExp(toReplace, 'g'), newVal);
        }
    }
    var repeat_str = "";
    for (var repeat_block_counter = 0; repeat_block_counter < RepeatBlockCount; repeat_block_counter++) {
        if (repeat_block_counter > 0) {
            repeat_str = "_" + (repeat_block_counter + 1);
        }
        for (var i = 0; i < this.TemplateVariables.length; i++) {
            // is this a repeat block var? If so we can generate it now !
            if (repeat_block_vars.indexOf(this.TemplateVariables[i]) >= 0) {
                var toReplace = this.constVarEnvelope + this.TemplateVariables[i].variableName + repeat_str + this.constVarEnvelope;
                var newVal = varvalues[this.TemplateVariables[i].variableName + repeat_str] ? varvalues[this.TemplateVariables[i].variableName + repeat_str] : this.TemplateVariables[i].defaultValue;
                newVal = this.check_value_for_specials(this.TemplateVariables[i].variableType, id, newVal);
                template = template.replace(new RegExp(toReplace, 'g'), newVal);
            }
        }
    }
    // now scan for any remaining expressions. these will start with constVarEnvelope and end with constVarEnvelope
    template = envSubstitute(template, this, true);
    return template;
}

ITSScreenTemplate.prototype.check_value_for_specials = function (variableType, id, newVal) {
    if (variableType == "P") {
        newVal = id + "_" + newVal;
    } else if (variableType == "L") {
        if (newVal.indexOf('|') >= 0) {
            var new_option = newVal.split('|');
            newVal = new_option[0];
        }
    }

    return newVal;
};

ITSScreenTemplate.prototype.generate_test_taking_view = function (div, add_to_div, id, templatevalues, pnp_view, full_initialisation, init_mode) {
    // div - place to generate the view in the html page
    // id - id of this template
    // templatesvalues - any already filled in values for this template (js object)
    // varvalues as set by the candidate
    // full_initialisation if true init script is called

    var __ret = this.generate_template_and_scan_for_repeatblocks(templatevalues, pnp_view, id, div);

    templatevalues = __ret.templatevalues;
    var template_id = __ret.template_id;
    var repeat_block_vars = __ret.repeat_block_vars;
    var template = __ret.template;
    var RepeatBlockCount = templatevalues.RepeatBlockCount;

    // prepare the div object
    if (!add_to_div) {
        $('#' + div).empty();
    }

    // generate sufficient copies of the repeat block(s)
    template = this.expand_repeat_block_and_parameters_with_blockcount(RepeatBlockCount, template, repeat_block_vars);
    template = this.replace_variables_with_actual_values(repeat_block_vars, template, templatevalues, RepeatBlockCount, id);

    // generate the template in the correct position
    if (!add_to_div) {
        $('#' + div)[0].innerHTML = template;
    } else {
        $('#' + div).append(template);
    }

    // init the values
    if (full_initialisation) {
        if (!init_mode) {init_mode="";}
        this.runtime_init_values(id, RepeatBlockCount, init_mode, templatevalues);
    }};

function ITSScreenTemplateVariable(parent, session) {
    this.ITSSession = session;
    this.parent = parent;
    this.ID = newGuid();
    this.variableName = "";
    this.description = "";
    this.defaultValue = "";
    this.varValue = null;
    this.variableType = "T"; // T = text, A = textarea, H = HTML text, L = list, B = boolean, C = color picker, P = placeholder I = Image
    this.varTraceID = "";
    this.translatable = false;
    this.RepeatBlockCounter = 0;

    this.persistentProperties = ['ID', 'variableName', 'description', 'defaultValue', 'variableType', 'translatable'];
};

ITSScreenTemplateVariable.prototype.traceID = function (template_parent, repeat_block_counter) {
    if (this.varTraceID == "") {
//        var traceID = "V" + repeat_block_counter + template_parent.ID + this.ID + "Y";
        var traceID = "TEMPLATEVAR" + getNewSimpleGeneratorNumber('ui_tempvar_gen', 99999999);
//        traceID = traceID.replace("-", "");
        this.varTraceID = traceID;
    }
    return this.varTraceID + repeat_block_counter + "Y";
};

ITSScreenTemplateVariable.prototype.generate_variable_for_test_editor = function (template_parent, div_to_add_to, template_values, repeat_block_counter, on_change_function, testdefinition) {
    var traceID = this.traceID(template_parent, repeat_block_counter);
    var colorpicker = false;
    var bgcolor = "#FFFFFF";
    if (repeat_block_counter % 2 == 1) {
        bgcolor = "#F0F0F0";
    }
    if (repeat_block_counter <= 1) {
        var varNameForTemplateValues = this.variableName;
    } else {
        var varNameForTemplateValues = this.variableName + "_" + repeat_block_counter;
    }
    // generate the variable in the div
    switch (this.variableType) { // T = text, A = textarea, H = HTML text, L = list, B = boolean, E = explanation (no controls), C = Color picker, P = Placeholder
        case "T" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<input NoTranslate class="form-control" type="text" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" placeholder="screen template default value" id="' + traceID + '">' +
                '</div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        case "P" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<input NoTranslate class="form-control" type="text" onchange="' + on_change_function + '" onkeyup="this.value = this.value.replace(/\\W/g, \'\'); ' + on_change_function + '" placeholder="screen template default value" id="' + traceID + '">' +
                '</div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        case "C" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<input NoTranslate class="form-control jscolor" type="text" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" placeholder="screen template default value" id="' + traceID + '">' +
                '</div></div>';
            $('#' + div_to_add_to).append(select);
            colorpicker = true;
            break;
        case "A" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<textarea NoTranslate class="form-control" rows="1" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" placeholder="screen template default value" id="' + traceID + '">' +
                '</textarea></div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        case "H" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<textarea-htmledit NoTranslate class="form-control" rows="1" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" placeholder="screen template default value" id="' + traceID + '">' +
                '</textarea-htmledit></div></div>';
            $('#' + div_to_add_to).append(select);
            tinymce.remove('textarea-htmledit');
            break;
        case "L" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<select NoTranslate class="form-control" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" id="' + traceID + '">';
            // now add the options from the default settings
            var option_array = this.defaultValue.split(',');
            var new_option = "";
            for (var i = 0; i < option_array.length; i++) {
                if (option_array[i].indexOf('|') >= 0) {
                    new_option = option_array[i].split('|');
                    select = select + '<option NoTranslate value="' + new_option[0] + '">' + new_option[1] + '</option>';
                } else {
                    select = select + '<option NoTranslate value="' + option_array[i] + '">' + option_array[i] + '</option>';
                }
            }
            select = select + '</select></div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        case "I" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<select NoTranslate class="form-control" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" id="' + traceID + '">';
            // now add the options from the default settings
            if (typeof testdefinition != "undefined") {
                var new_option = "";
                for (var i = 0; i < testdefinition.files.length; i++) {
                   select = select + '<option NoTranslate value="' + testdefinition.createLinkForFile(i) + '">' + testdefinition.files[i] + '</option>';
                }
            }
            select = select + '</select></div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        case "B" :
            var select = '<div NoTranslate class="row" style="background-color: '+bgcolor+'">' +
                '<label NoTranslate for="' + traceID + '" class="col-2 col-form-label">' + this.variableName + '</label>' +
                '<div NoTranslate class="col">' +
                '<input NoTranslate class="form-control" type="checkbox" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" data-toggle="toggle" id="' + traceID + '">' +
                '</div></div>';
            $('#' + div_to_add_to).append(select);
            break;
        default :
            // only add text
            $('#' + div_to_add_to).append(this.variableName);
    }
    // set the value of the generated variable control
    if (template_values[varNameForTemplateValues]) {
        switch (this.variableType) { // T = text, A = textarea, H = HTML text, L = list, B = boolean, C= color picker, P=Placeholder
            case "T" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "P" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "C" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "A" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "H" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "L" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "I" :
                $('#' + traceID).val(template_values[varNameForTemplateValues]);
                break;
            case "B" :
                $('#' + traceID).prop('checked', template_values[varNameForTemplateValues] == 'T');
                break;
        }
    } else {
        $('#' + traceID).val(this.defaultValue);
    }

    $('#' + traceID).attr('data-toggle', "tooltip");
    $('#' + traceID).attr('title', this.description);
    $('[data-toggle="tooltip"]').tooltip();

    // install jscolor
    if (colorpicker) {
        jscolor.installByClassName('jscolor');
    }
};

ITSScreenTemplateVariable.prototype.get_variable_value_for_test_editor = function (template_parent, div_to_add_to, repeat_block_counter) {
    // generate variable name
    var traceID = this.traceID(template_parent, repeat_block_counter);
    // now get the value depending on the type of variable
    switch (this.variableType) { // T = text, A = textarea, H = HTML text, L = list, B = boolean, C= color picker, P=Placeholder
        case "T" :
            return $('#' + traceID).val();
            break;
        case "P" :
            return $('#' + traceID).val();
            break;
        case "C" :
            return $('#' + traceID).val();
            break;
        case "A" :
            return $('#' + traceID).val();
            break;
        case "H" :
            tinymce.triggerSave();
            return $('#' + traceID).val();
            break;
        case "L" :
            return $('#' + traceID).val();
            break;
        case "I" :
            return $('#' + traceID).val();
            break;
        case "B" :
            return $('#' + traceID)[0].checked ? 'T' : 'F';
            break;
    }
}