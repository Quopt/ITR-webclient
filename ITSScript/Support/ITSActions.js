/* Copyright 2020 by Quopt IT Services BV
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

ITSActionList = function(session) {
    this.ITSSession = session;

    this.AvailableActions = [];

    this.registerAction(new ITSActionStore(session));
    this.registerAction(new ITSActionAutoStore(session));
    this.registerAction(new ITSActionCheckSessionTime(session));
    this.registerAction(new ITSActionEndSession(session));
    this.registerAction(new ITSActionEndTest(session));
    this.registerAction(new ITSActionEndTestTimeOut(session));
    this.registerAction(new ITSActionGotoScreen(session));
    this.registerAction(new ITSActionLogout(session));
    this.registerAction(new ITSActionNextScreen(session));
    this.registerAction(new ITSActionNextScreenIfAnswered(session));
    this.registerAction(new ITSActionNextUnansweredScreen(session));
    this.registerAction(new ITSActionNextUnansweredScreenWithProceed(session));
    this.registerAction(new ITSActionPreviousScreen(session));
    this.registerAction(new ITSActionShowItem(session));
    this.registerAction(new ITSActionUpdateCurrentScreenFromSessionStorage(session));
};

ITSActionList.prototype.getActionsForContext = function (context) {
    var foundActions = [];
    // check if this action is known and then delete it
    var found = false;
    for (var i=0; i < this.AvailableActions.length; i++) {
        if (typeof this.AvailableActions[i].ContextArray == "undefined") {
            this.AvailableActions[i].ContextArray = this.AvailableActions[i].Context.split(',');
        }
        found = this.AvailableActions[i].ContextArray.indexOf(context) > -1;
        if (found) foundActions.push(this.AvailableActions[i]);
    }
    return foundActions;
};

ITSActionList.prototype.getActionsForContextAsCSV = function (context) {
    var foundActions = "";
    // check if this action is known and then delete it
    var found = false;
    for (var i=0; i < this.AvailableActions.length; i++) {
        if (typeof this.AvailableActions[i].ContextArray == "undefined") {
            this.AvailableActions[i].ContextArray = this.AvailableActions[i].Context.split(',');
        }
        found = this.AvailableActions[i].ContextArray.indexOf(context) > -1;
        if (found) foundActions += (foundActions.length == 0 ? "" : ",") + this.AvailableActions[i].Name + "|" + this.AvailableActions[i].Description.replace(/,/g, ';');
    }
    return foundActions;
}

ITSActionList.prototype.registerAction = function (actionObject) {
    actionObject.parent = this;
    // check if this action is not available yet, if so the update instead of add
    var found = false;
    for (var i=0; i < this.AvailableActions.length; i++) {
        found = this.AvailableActions[i].Name == actionObject.Name;
        if (found) break;
    }
    if (found) {
        this.AvailableActions[i] = actionObject;
    } else {
        this.AvailableActions.push(actionObject);
    }
};

ITSActionList.prototype.unregisterAction = function (actionName) {
    // check if this action is known and then delete it
    var found = false;
    for (var i=0; i < this.AvailableActions.length; i++) {
        found = this.AvailableActions[i].Name == actionName;
        if (found) break;
    }
    if (found) {
        this.AvailableActions.splice(i,1);
    }
};

ITSActionList.prototype.findAction = function (actionName) {
    // check if this action is known and then delete it
    var found = false;
    for (var i=0; i < this.AvailableActions.length; i++) {
        found = this.AvailableActions[i].Name == actionName;
        if (found) break;
    }
    if (found) {
        return this.AvailableActions[i];
    } else {
        return undefined;
    }
};

ITSActionList.prototype.executeScriptInTestTaking = function (scriptObject, testTakingController, currentTestDefinition, currentSession, currentSessionTest, CurrentPage, ScreenComponentIndex, VariableName, CodeBlockNr, currentActionIndex) {
    // for each context an execute script action will be available. Override the one you need.
    if (typeof currentActionIndex == "undefined") currentActionIndex = 0;
    this.context = {};
    this.context.scriptObject = scriptObject;
    this.context.testTakingController = testTakingController;
    this.context.currentTestDefinition = currentTestDefinition;
    this.context.currentSession = currentSession;
    this.context.currentSessionTest = currentSessionTest;
    this.context.CurrentPage = CurrentPage;
    this.context.ScreenComponentIndex = ScreenComponentIndex;
    this.context.VariableName = VariableName;
    this.context.CodeBlockNr = CodeBlockNr;
    this.context.currentStep = currentActionIndex;
    this.executeScriptInTestTakingStep(scriptObject);
};

ITSActionList.prototype.executeScriptInTestTakingStep = function() {
    // go to the next step
    this.context.currentStep ++;
    if (this.context.currentStep > this.context.scriptObject.ActionCounter) {
        return;
    }
    // locate the action object
    var actionObject = this.findAction(this.context.scriptObject['Action'+ this.context.currentStep].ActionName);
    if (typeof actionObject != "undefined") {
        // execute the action
        try {
            this.context.ActionValue = this.context.scriptObject['Action' +  this.context.currentStep].ActionValue;
            var actionResult = actionObject.executeAction(this.context, this.executeScriptInTestTakingStep.bind(this));
            if (actionObject.AsyncAction) return; // we do not wait for async functions. An async function needs to recall this function and provide its own error handling
            if (!actionResult.StatusOK) {
                if (actionResult.ShowMessage) ITSInstance.UIController.showError('', actionResult.ErrorMessage); // show a message in case of failure as requested by the action. The action is responsible for trnaslation
                if (!actionResult.Continue) return; // the script should be aborted as requested by the action
            }
        } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Action execution failed for "  + actionObject.Name + " in step " + this.context.currentStep + " - cause : " + err);  }
        // execute next step
        this.executeScriptInTestTakingStep();
    } else {
        // action not found, log and continue
        ITSLogger.logMessage(logLevel.ERROR,"Action in step not found when executing script : " + this.context.scriptObject['Action'+ this.context.currentStep].ActionName + " step " + this.context.currentStep + " - " + this.context.scriptObject);
        this.executeScriptInTestTakingStep();
    }
};

ITSAction = function(session) {
    this.parent = {};
    this.session = session;

    this.Name = ""; // name of the action
    this.Description = ""; // description for this action
    this.HelpText = ""; // help text for this action (HTML OK)
    this.Context = "test"; // a CSV seperated list of contexts, values are : test (for usage in testing),
                    // testeditor (for test editor actions) note : reserved for future expansion
                    // reporteditor (for report editor actions) note : reserved for future expansion
                    // report (for usage in a report) note : reserved for future expansion
    this.AsyncAction = false; // async actions will call back the executing object when their activity completes (either succesfull or not)
};

ITSAction.prototype.generateElement = function (traceID, template_values, testdefinition, on_change_function, currentScreenIndex, varNameForTemplateValues, DivToAdd , fullTraceID) {
    // generate the UI element for this action so that the user can do something with it.
    // override for other implementation

};

ITSAction.prototype.getValuesFromGeneratedElement = function (template_parent, div_to_add_to, repeat_block_counter, varNameForTemplateValues, template_values, fullTraceID) {
    // get the values from the generated element and return them (mostly as an object)
    // override for other implementation

};

ITSAction.prototype.executeAction = function (context, callback) {
    // generate the UI element for this action so that the user can do something with it.
    // override for other implementation
    var returnObject = new ITSActionResult();

    processEvent(this.Name,'');

    return returnObject;
};

ITSActionResult = function () {
    this.ShowMessage = false; // show message to the user in case of error conditions
    this.ErrorMessage = ""; // message to show in error conditions
    this.StatusOK = true; // true if the action result is OK
    this.Continue = true; // true if the script can continue excuting
};

// default ITS actions
ITSActionNone = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "None";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "None.Description", "No action");
}

ITSActionStore = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "Store";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "Store.Description", "Store the current results in the database");
}

ITSActionAutoStore = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "AutoStore";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "AutoStore.Description", "Store the current results in the database. This event is called every minute by the ITR automatically.");
};

ITSActionUpdateCurrentScreenFromSessionStorage = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "UpdateCurrentScreenFromSessionStorage";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "UpdateCurrentScreenFromSessionStorage.Description", "Update the current screen from the session storage");
};

ITSActionEndTest = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "EndTest";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "EndTest.Description", "End the current test. If there are tests left in the session then start the next one.");
};

ITSActionEndTestTimeOut = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "EndTestTimeOut";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "EndTestTimeOut.Description", "End the test because of a timeout");
};

ITSActionEndSession = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "EndSession";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "EndSession.Description", "End the current session");
};

ITSActionNextScreenIfAnswered = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "NextScreenIfAnswered";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "NextScreenIfAnswered.Description", "Go to the next screen in the test if the current screen is answered");
};

ITSActionNextScreen = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "NextScreen";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "NextScreen.Description", "Go to the next screen in the test");
};

ITSActionNextUnansweredScreenWithProceed = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "NextUnansweredScreenWithProceed";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "NextUnansweredScreenWithProceed.Description", "Go to the next unanswered screen in the test");
};

ITSActionNextUnansweredScreen = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "NextUnansweredScreen";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "NextUnansweredScreen.Description", "Go to the next unanswered screen in the test or stay on the current one if not answered yet");
};

ITSActionPreviousScreen = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "PreviousScreen";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "PreviousScreen.Description", "Go to the previous screen in the test");
};

ITSActionLogout = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "Logout";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "Logout.Description", "Log the user out");
};

ITSActionCheckSessionTime = function (session) {
    ITSAction.call(this, session);
    this.executeAction = ITSAction.prototype.executeAction;
    this.generateElement = ITSAction.prototype.generateElement;
    this.getValuesFromGeneratedElement = ITSAction.prototype.getValuesFromGeneratedElement;
    this.Name = "CheckSessionTime";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "CheckSessionTime.Description", "Check the session time for a session end date & time as set on the session");
};

ITSActionGotoScreen = function (session) {
    ITSAction.call(this, session);

    this.Name = "GotoScreen";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "GotoScreen.Description", "Goto a specific screen in the test");
};

ITSActionGotoScreen.prototype.generateElement = function (traceID, template_values, testdefinition, on_change_function, currentScreenIndex, varNameForTemplateValues, DivToAdd , fullTraceID, ActionValue) {
    var select =
        '<div NoTranslate class="col-12 mx-0 px-0">' +
        '<select NoTranslate class="form-control" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" id="' + fullTraceID + 'Options1">';
    var selectStr = '';
    // now add the options from the default settings
    for (var i = 0; i < testdefinition.screens.length; i++) {
        selectStr = (testdefinition.screens[i].varName == ActionValue.ScreenName) ? " selected " : "";
        select = select + '<option ' + selectStr + ' NoTranslate value="' + testdefinition.screens[i].varName + '">' + testdefinition.screens[i].varName + '</option>';
    }
    select = select + '</select></div>';
    $('#' + DivToAdd).append("<div class='row m-0 p-0 col-12 form-control-sm'>" + select + "</div>");
};

ITSActionGotoScreen.prototype.getValuesFromGeneratedElement = function (template_parent, div_to_add_to, repeat_block_counter, varNameForTemplateValues, template_values, fullTraceID) {
    var var2 = {};
    var2.persistentProperties = "*ALL*";
    var2._objectType = "ITSObject";

    var2.ScreenName = $('#' + fullTraceID + 'Options1').val()

    return var2;
};

ITSActionGotoScreen.prototype.executeAction = function (context, callback) {
    var returnObject = new ITSActionResult();

    if (context.testTakingController.InTestTaking) context.testTakingController.switchNavBar();
    try {
        var x = context.currentTestDefinition.findScreenIndexByName(context.ActionValue.ScreenName);
        if (x > -1) context.currentSessionTest.CurrentPage = x;
    } catch (err) { ITSLogger.logMessage(logLevel.ERROR,"Setting currentpage failed for "  + context.currentTestDefinition.TestName + "(" + context.currentSessionTest.CurrentPage + ")"  + err);  }
    context.testTakingController.saveCurrentTest();
    context.testTakingController.renderTestPage();

    return returnObject;
};

ITSActionShowItem = function (session) {
    ITSAction.call(this, session);

    this.Name = "ShowItem";
    this.Description = session.translator.getTranslatedString("ITSActions.js", "ShowItem.Description", "Show or hide a specific item on the current screen");
};

ITSActionShowItem.prototype.generateElement = function (traceID, template_values, testdefinition, on_change_function, currentScreenIndex, varNameForTemplateValues, DivToAdd , fullTraceID, ActionValue) {
    var select =
        '<div NoTranslate class="col-12 mx-0 px-0">' +
        '<select NoTranslate class="form-control" onchange="' + on_change_function + '" onkeyup="' + on_change_function + '" id="' + fullTraceID + 'Options1-1">' +
        '<option NoTranslate value="">-</option>';
    var selectStr = '';
    var tempObj = ActionValue;
    // now add the options from the default settings
    for (var i = 0; i < testdefinition.screens[currentScreenIndex].screenComponents.length; i++) {
        selectStr = (testdefinition.screens[currentScreenIndex].screenComponents[i].id == tempObj.Element1) ? " selected " : "";
        select = select + '<option ' + selectStr + ' NoTranslate value="' + testdefinition.screens[currentScreenIndex].screenComponents[i].id + '">' + testdefinition.screens[currentScreenIndex].screenComponents[i].varComponentName + '</option>';
    }
    select = select + '</select></div>';
    selectStr = tempObj.Element1Hide == "on" ? "checked" : "";
    select = select + '<div class="col-12 mx-0 px-0"><input type="checkbox" ' + selectStr + ' class="col-1" onchange="' + on_change_function + '" id="' + fullTraceID + 'Options1-2"><label class="col-11" id="ShowItem_HideInsteadOfShow">Hide the element instead of show</label></div>';
    selectStr = tempObj.ResetShowStatusForAll == "on" ? "checked" : "";
    select = select + '<div class="col-12 mx-0 px-0"><input type="checkbox" ' + selectStr + ' class="col-1" onchange="' + on_change_function + '" id="' + fullTraceID + 'Options3"><label class="col-11" id="ShowItem_ResetAllToInitialShow">Reset all elements to initial Show status</label></div>';
    $('#' + DivToAdd).append("<div class='row m-0 p-0 col-12 form-control-sm'>" + select + "</div>");
};

ITSActionShowItem.prototype.getValuesFromGeneratedElement = function (template_parent, div_to_add_to, repeat_block_counter, varNameForTemplateValues, template_values, fullTraceID) {
    var var2 = {};
    var2.persistentProperties = "*ALL*";
    var2._objectType = "ITSObject";
    var2["Element1"] = $('#' + fullTraceID + 'Options1-1').val();
    var2["Element1Hide"] = ($('#' + fullTraceID + 'Options1-2').prop('checked') ? "on" : "off");
    var2["ResetShowStatusForAll"] = ($('#' + fullTraceID + 'Options3').prop('checked') ? "on" : "off");
    return var2;
};

ITSActionShowItem.prototype.executeAction = function (context, callback) {
    var returnObject = new ITSActionResult();

    var variables = context.ActionValue;
    context.currentTestDefinition.screens[context.currentSessionTest.CurrentPage].saveScreenComponentsShowStatus();
    if (variables.ResetShowStatusForAll=="on") { context.currentTestDefinition.screens[context.currentSessionTest.CurrentPage].restoreScreenComponentsShowStatus(); }
    var showComponent = context.currentTestDefinition.screens[context.currentSessionTest.CurrentPage].findComponentByID(variables.Element1);
    if (typeof showComponent != "undefined") {
        showComponent.show = variables.Element1Hide=="off";
    }

    context.currentTestDefinition.screens[context.currentSessionTest.CurrentPage].updateResultsStorageFromDivs(context.currentSessionTest.Results,  context.testTakingController.generateScreenID, false, context.currentSession.PluginData, context.currentSession.SessionType==1);
    context.testTakingController.saveCurrentTest();
    context.testTakingController.renderTestPage();

    return returnObject;
};
