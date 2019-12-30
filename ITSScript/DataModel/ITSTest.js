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

// Note : when context or testmode is mentioned the options are
//  TT for test taking
//  TE for test editor
//  PnPView for viewing results
//  PnP for preparing a test list for PnP printing

function ITSTest(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.ID = newGuid();
    this.TestName = "";
    this.Description = "";
    this.Explanation = "";
    this.Copyrights = "";
    this.Costs = 0;
    this.TestType = 0; // 0 = Person test = normal session based test for a single candidate.
    this.AuthorInfo = "";
    this.InvoiceCode = "";
    this.Remarks = "";
    this.TestStartDate = "2000-01-01";
    this.TestEndDate = "2100-01-01";
    this.TestDefinitionFrozen = false;
    this.TestDefinitionIsReleased = false;
    this.TestDefinitionIsProtected = true;
    this.Active = false;
    this.SupportsTestTaking = true;
    this.SupportsTestScoring = true;
    this.SupportsOnlyRenorming = true;
    this.IsRestartable = true;
    this.Supports360Degrees = false;
    this.CandidateCanDo360Too = false;
    this.ShowTestClosureScreen = false;
    this.TotalTimeAvailableForThisTest = -1;
    this.MinPercentageOfAnswersRequired = -1;
    this.TotalNumberOfExperiments = -1;
    this.LanguageSupport = "";
    this.Generation = 0;
    this.dbsource = "";
    this.RequiredParsPerson = [];
    this.RequiredParsSession = [];
    this.RequiredParsGroup = [];
    this.RequiredParsOrganisation = [];
    this.CatalogInformation = "";
    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";

    this.ScoringScript = ITSInstance.translator.getTranslatedString("ITSTest.js", "ScaleScoreScript", "/* please see manual for instructions before using complex scripting */");
    this.BeforeScript = ITSInstance.translator.getTranslatedString("ITSTest.js", "BeforeScript", "/* please see manual for instructions before using complex scripting */");
    this.AfterScript = ITSInstance.translator.getTranslatedString("ITSTest.js", "AfterScript", "/* please see manual for instructions before using complex scripting */");
    this.BeforeNormingScript = ITSInstance.translator.getTranslatedString("ITSTest.js", "BeforeNormingScript", "/* please see manual for instructions before using complex scripting */");
    this.AfterNormingScript = ITSInstance.translator.getTranslatedString("ITSTest.js", "AfterNormingScript", "/* please see manual for instructions before using complex scripting */");
    this.Pre360 = ITSInstance.translator.getTranslatedString("ITSTest.js", "Pre360", "/* please see manual for instructions before using complex scripting */");
    this.Per360 = ITSInstance.translator.getTranslatedString("ITSTest.js", "Per360", "/* please see manual for instructions before using complex scripting */");
    this.Post360 = ITSInstance.translator.getTranslatedString("ITSTest.js", "Post360", "/* please see manual for instructions before using complex scripting */");

    // sub lists for this test (with their own persistence information)
    this.screens = []; // object list of ITSTestScreen objects
    this.scales = []; // object list of ITSTestScale objects
    this.norms = []; // object list of ITSTestNorm objects
    this.documents = []; // object list of ITSTestDocument objects
    this.scoreRules = []; // object list of ITSScaleScore objects
    this.graphs = []; // object list of ITSTestGraph objects

    this.media = []; // list of available test media (like pictures, test manual, video, any other image)
    this.files = []; // list of files (pre loading will be done)

    this.newTest = true; // true when the test has not been saved yet

    this.persistentProperties = ['ID',
        'TestName',
        'Description',
        'Explanation',
        'Copyrights',
        'Costs',
        'TestType',
        'AuthorInfo',
        'InvoiceCode',
        'Remarks',
        'TestStartDate',
        'TestEndDate',
        'TestDefinitionFrozen',
        'TestDefinitionIsReleased',
        'Active',
        'SupportsTestTaking',
        'SupportsTestScoring',
        'SupportsOnlyRenorming',
        'IsRestartable',
        'Supports360Degrees',
        'CandidateCanDo360Too',
        'ShowTestClosureScreen',
        'TotalTimeAvailableForThisTest',
        'MinPercentageOfAnswersRequired',
        'TotalNumberOfExperiments',
        'LanguageSupport',
        'Generation',
        'RequiredParsPerson',
        'RequiredParsSession',
        'RequiredParsGroup',
        'RequiredParsOrganisation',
        'ScoringScript',
        'screens',
        'scales',
        'norms',
        'documents',
        'scoreRules',
        'graphs',
        'PluginData',
        'CatalogInformation',
        'BeforeScript',
        'AfterScript',
        'BeforeNormingScript',
        'AfterNormingScript',
        'ScoringScript',
        'Pre360',
        'Per360',
        'Post360',
        'TestDefinitionIsProtected'
        ];

    // process information
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.currentlyLoading = false;
    this.detailsLoaded = false;
}

ITSTest.prototype.getTestFormatted = function () {
    if (!this.Description) return "";
    var x =
        ITSInstance.translator.getTranslatedString('ITSTest','Description','Description ') + " : " + this.Description
        + " (" + this.TestName + ") "+
        ITSInstance.translator.getTranslatedString('ITSTest','Costs','Costs') +
        " : " + this.Costs + ". " +
        ITSInstance.translator.getTranslatedString('ITSTest','Language','Language') +
         " : " +
        ITSInstance.translator.getLanguageDescription(this.LanguageSupport.replace('"', '').replace('"', '') );
    if (this.dbsource == 1) {
        x = x + " " + ITSInstance.translator.getTranslatedString("js", "MasterTag", "[centrally managed]");
    }
    return x;
};

ITSTest.prototype.testNameWithDBIndicator = function () {
    if (this.dbsource) {
        if (this.dbsource == 1) {
            return this.TestName + " " + ITSInstance.translator.getTranslatedString("js", "MasterTag", "[centrally managed]");
        } else {
            return this.TestName;
        }
    } else {
        return this.TestName;
    }
};

ITSTest.prototype.descriptionWithDBIndicator = function () {
    if (this.dbsource) {
        if (this.dbsource == 1) {
            return this.Description + " " + ITSInstance.translator.getTranslatedString("js", "MasterTag", "[centrally managed]");
        } else {
            return this.Description;
        }
    } else {
        return this.Description;
    }
};

ITSTest.prototype.getTotalVisibleScreens = function () {
    var numScreens =0;
    for (var i=0; i < this.screens.length; i++) {
        if (this.screens[i].show) numScreens++;
    }
    return numScreens;
};

ITSTest.prototype.getTotalScreens = function () {
    return this.screens.length;
};

ITSTest.prototype.scale = function (scaleVarName) {
    for (var i=0; i < this.scales.length; i++) {
        if (this.scales[i].scaleVarName == scaleVarName) return this.scales[i];
    }
    return undefined;
};

ITSTest.prototype.screen = function (screenName) {
    for (var i=0; i < this.screens.length; i++) {
        if (this.screens[i].varName == screenName) return this.screens[i];
    }
    return undefined;
};

ITSTest.prototype.screenTemplatesLoaded = function () {
    var allLoaded = true;
    for (var i=0; i < this.screens.length; i++) {
        allLoaded = this.screens[i].screenTemplatesLoaded();
        if (!allLoaded) break;
    }
    return allLoaded;
};

ITSTest.prototype.saveToServer = function (OnSuccess, OnError) {
    this.saveToServerMaster(OnSuccess, OnError, false);
};

ITSTest.prototype.saveToServerMaster = function (OnSuccess, OnError, toMaster) {
    if (this.Generation >= Number.MAX_SAFE_INTEGER) { this.Generation = Number.MIN_SAFE_INTEGER; }
    this.Generation = this.Generation +1;
    this.lastSavedJSON = ITSJSONStringify(this);
    this.newTest = false;
    this.saveToServerMasterSuccess = OnSuccess;
    this.saveToServerMasterError = OnError;
    if (toMaster) {
        ITSInstance.genericAjaxUpdate('tests/' + this.ID, this.lastSavedJSON, this.saveToServerMasterCopyFiles.bind(this), OnError, "Y", "N");
    }  else {
        ITSInstance.genericAjaxUpdate('tests/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    }
};

ITSTest.prototype.saveToServerMasterCopyFiles = function() {
    ITSInstance.genericAjaxUpdate('filecopy/' + this.ID + "/master", '{}', this.saveToServerMasterSuccess, this.saveToServerMasterError);
};

ITSTest.prototype.saveToServerRequired = function () {
   return (this.lastSavedJSON != ITSJSONStringify(this)) ;
};

ITSTest.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('files/'+ this.ITSSession.companies.currentCompany.ID +'/' + this.ID + '/all', function (){}, function (){}, 'Y', 'N');
    ITSInstance.genericAjaxDelete('tests/' + this.ID, OnSuccess, OnError, "N", "Y");
};

ITSTest.prototype.deleteFromServerMaster = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('files/master/' + this.ID + '/all', function (){}, function (){}, 'Y', 'N');
    ITSInstance.genericAjaxDelete('tests/' + this.ID, OnSuccess, OnError, "Y", "N");
};

ITSTest.prototype.copyTest = function () {
    var newTest = new ITSTest(this.myParent, this.ITSSession);

    ITSJSONLoad(newTest, ITSJSONStringify(this), this.myParent, this.ITSSession, 'ITSTest');

    newTest.ID = newGuid();
    newTest.detailsLoaded = true;

    return newTest;
};

ITSTest.prototype.languageSupportHumanReadable = function () {
    var langArr = this.LanguageSupport.split(',');
    var result = "";
    for (var i = 0; i < langArr.length; i++) {
        langArr[i] = langArr[i].replace(/"/g, '').trim();
        var j = 0;
        var found = false;
        while ((!found) && (j < ITSSupportedLanguages.length)) {
            if (ITSSupportedLanguages[j].languageCode == langArr[i]) {
                found = true;
                if (result != "") {
                    result = result + " ";
                }
                result = result + ITSInstance.translator.getLanguageDescription(ITSSupportedLanguages[j].languageCode);
            } else {
                j = j + 1;
            }
        }
    }
    return result;
};

ITSTest.prototype.supportsLanguage = function (languageCodeToTestFor) {
    languageCodeToTestFor = languageCodeToTestFor.split("-")[0];
    return (this.LanguageSupport.toUpperCase().indexOf(languageCodeToTestFor.toUpperCase()) >= 0);
};

ITSTest.prototype.preloadTestImages = function () {
    //this.filesCache = [];
    this.files_images = [];
    for (var i=0; i < this.files.length; i++) {
      tempImg = new Image();
      tempImg.crossOrigin = "Anonymous";

      //tempImg.onload = function () {
      //      var canvas = document.createElement('canvas');
      //      canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
      //      canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

      //      canvas.getContext('2d').drawImage(this, 0, 0);
      //      tempImg.dataURL = canvas.toDataURL('image/png');
      //  }.bind(tempImg);
      var tempSrc = this.createLinkForFile(i);
      if (ITSInstance.baseURL.indexOf("localhost") > 0) tempSrc = this.createLinkForFile(i).replace('/api/', ITSInstance.baseURL + '/api/');
      tempImg.src = tempSrc;
      this.files_images.push(tempImg);

      //ITSInstance.downloadImage(tempImg, this.ID + '/test/' + this.files[i]);
      //this.filesCache[this.files[i]] = tempImg;
    }
};

ITSTest.prototype.loadFilesAsBinary = function () {
    this.files_binary = {};
    this.files_binary.persistentProperties =  ['list' ];
    this.files_binary._objectType = "ITSObject";
    this.files_binary.list = [];
    this.files_binary.loadcount = 0;

    for (var i=0; i < this.files.length; i++) {
        var tempSrc = this.createLinkForFile(i);
        if (ITSInstance.baseURL.indexOf("localhost") > 0) tempSrc = this.createLinkForFile(i).replace('/api/', ITSInstance.baseURL + '/api/');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', tempSrc, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(i, e) {
            //console.log(e.currentTarget.response);
            this.files_binary.list[i].data = binArrayToString(e.currentTarget.response);
            //var temp = stringToBinArray (this.files_binary.list[i]);
            //console.log(temp);
            this.files_binary.loadcount ++;
        }.bind(this, i);
        this.files_binary.list.push({});
        this.files_binary.list[i].name = this.files[i];
        this.files_binary.list[i].type = "media";
        this.files_binary.list[i]._objectType = "ITSObject";
        xhr.send();
    }

    var baseIndex = this.files_binary.list.length;

    for (var i=0; i < this.media.length; i++) {
        var tempSrc = this.createLinkForMedia(i);
        if (ITSInstance.baseURL.indexOf("localhost") > 0) tempSrc = this.createLinkForMedia(i).replace('/api/', ITSInstance.baseURL + '/api/');

        var xhr = new XMLHttpRequest();
        xhr.open('GET', tempSrc, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(i, e) {
            this.files_binary.list[i].data = binArrayToString(e.currentTarget.response);
            this.files_binary.loadcount ++;
        }.bind(this, i + baseIndex);
        this.files_binary.list.push({});
        this.files_binary.list[i + baseIndex].name = this.media[i];
        this.files_binary.list[i + baseIndex].type = "catalog";
        this.files_binary.list[i + baseIndex]._objectType = "ITSObject";

        xhr.send();
    }
};

ITSTest.prototype.createLinkForFile = function (fileIndex, OmitLeadingSlash) {
    var temp = 'files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/test/' + this.files[fileIndex];
    if (OmitLeadingSlash) { return temp; } else { return '/api/' + temp; }
};

ITSTest.prototype.removeTestFile = function (index, OnSucces, OnError) {
    ITSInstance.genericAjaxDelete(this.createLinkForFile(index, true),OnSucces, OnError);
};

ITSTest.prototype.createLinkForMedia = function (fileIndex, OmitLeadingSlash) {
    var temp = 'files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/media/' + this.media[fileIndex];
    if (OmitLeadingSlash) { return temp; } else { return '/api/' + temp; }
};

ITSTest.prototype.removeMediaFile = function (index, OnSucces, OnError) {
    ITSInstance.genericAjaxDelete(this.createLinkForMedia(index, true),OnSucces, OnError);
};

ITSTest.prototype.loadTestDetailSucces = function () {
    console.log("Loaded test details " + this.TestName);
    this.currentlyLoading = false;
    this.detailsLoaded = true;
    this.newTest = false;
    this.lastSavedJSON = ITSJSONStringify(this);
    var waitForTemplateLoading = false;

    // now check for test templates and load them
    var lastCheckedTemplateID = '';
    var templateIndex = 0;
    for (i = 0; i < this.screens.length; i++) {
        for (j=0; j < this.screens[i].screenComponents.length; j++) {
            if (lastCheckedTemplateID != this.screens[i].screenComponents[j].templateID )
            {
                lastCheckedTemplateID = this.screens[i].screenComponents[j].templateID;
                templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, lastCheckedTemplateID);
                if (templateIndex < 0) {
                   console.log("Template missing ! " + lastCheckedTemplateID);
                }
                else if (!this.ITSSession.screenTemplates.screenTemplates[templateIndex].detailsLoaded) {
                    waitForTemplateLoading = true;
                    this.ITSSession.screenTemplates.screenTemplates[templateIndex].loadDetailDefinition(this.loadTestDetailWithTemplateSuccess.bind(this), this.loadTestDetailError.bind(this));
                }
            }
        }
    }

    // pre load all test media
    //ITSInstance.genericAjaxLoader('files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/test', this.files, this.preloadTestImages.bind(this), function () {}, undefined, 0, 999999, '', 'N');
    //ITSInstance.genericAjaxLoader('files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/media', this.media, function () {}, function () {}, undefined, 0, 999999, '', 'N');
    this.loadMediaFiles( this.preloadTestImages.bind(this), function () {});
    this.loadCatalogFiles(function () {},function () {});

    if (!waitForTemplateLoading) this.loadTestDetailWithTemplateSuccess();
};

ITSTest.prototype.loadTestDetailWithTemplateSuccess = function () {
    // check if all templates have details now
    var detailsLoaded = true;
    for (i = 0; i < this.screens.length; i++) {
        for (j=0; j < this.screens[i].screenComponents.length; j++) {
            var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screens[i].screenComponents[j].templateID);
            if (templateIndex < 0) {detailsLoaded = false;}
            else if (!this.ITSSession.screenTemplates.screenTemplates[templateIndex].detailsLoaded) {
                detailsLoaded = false;
                break;
            }
        }
        if (!detailsLoaded) { break; }
    }
    if (detailsLoaded) {
        for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
            setTimeout(this.onSuccessCallbacks[i], i);
        }
        this.onErrorCallbacks.length = 0;
        this.onSuccessCallbacks.length = 0;
    }
};

ITSTest.prototype.loadMediaFiles = function ( OnSucces, OnError ) {
    this.files = [];
    ITSInstance.genericAjaxLoader('files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/test', this.files, OnSucces, OnError, undefined, 0, 999999, '', 'N');
};

ITSTest.prototype.loadCatalogFiles = function ( OnSucces, OnError ) {
    this.media= [];
    ITSInstance.genericAjaxLoader('files/' + this.ITSSession.companies.currentCompany.ID + "/" + this.ID + '/media', this.media, OnSucces, OnError, undefined, 0, 999999, '', 'N');
};

ITSTest.prototype.loadTestDetailError = function () {
    this.currentlyLoading = false;
    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSTest.prototype.loadTestDetailDefinition = function (whenLoaded, OnError) {
    //console.log("loading test details " + this.TestName);
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (OnError) {
        this.onErrorCallbacks.push(OnError);
    }
    if (!this.currentlyLoading) {
        this.currentlyLoading = true;

        if (!this.detailsLoaded) {
            var IncludeMaster = "N";
            var IncludeClient = "Y";
            if (this.dbsource > 0) {
                IncludeMaster = "Y";
                //IncludeClient = "N";
            }
            ITSInstance.JSONAjaxLoader('tests/' + this.ID, this, this.loadTestDetailSucces.bind(this), this.loadTestDetailError.bind(this), 'ITSTest', 0, 999999, '', '', IncludeMaster, IncludeClient);
        } else {
            if (whenLoaded) whenLoaded();
        }
    }
};

ITSTest.prototype.addNewTestScreen = function () {
    var newScreen = new ITSTestScreen(this, ITSSession);
    this.screens.push(newScreen);
    return newScreen;
};

ITSTest.prototype.copyTestScreen = function (source, insertPos) {
    var newScreen = new ITSTestScreen(this, ITSSession);
    var oldScreen = this.screens[source];

    return this.copyTestScreenBase(source, insertPos, oldScreen, newScreen);
};

ITSTest.prototype.copyTestScreenFromOtherTest = function (otherTest, source, insertPos) {
    var newScreen = new ITSTestScreen(this, ITSSession);
    var oldScreen = otherTest.screens[source];

    return this.copyTestScreenBase(source, insertPos, oldScreen, newScreen);
};

ITSTest.prototype.copyTestScreenBase = function (source, insertPos, oldScreen, newScreen) {
    var newID = newScreen.id;

    // insert the new screen in the array at the requested position
    if ( (insertPos < (this.screens.length -1)) && (insertPos >= 0)) {
        this.screens.splice(insertPos,0,newScreen);
    } else {
        this.screens.push(newScreen);
    }

    shallowCopy(oldScreen,newScreen);

    newScreen.screenComponents = [];
    for (var i=0; i < oldScreen.screenComponents.length; i++) {
        var newSC = new ITSTestScreenComponent(this, this.ITSSession);
        var newSCID = newSC.id;
        shallowCopy(oldScreen.screenComponents[i], newSC);
        newSC.id = newSCID;
        newScreen.screenComponents.push(newSC);
    }
    newScreen.screenDynamics = [];
    for (var i=0; i < oldScreen.screenDynamics.length; i++) {
        var newSC = new ITSTestScreenDynamics(this, this.ITSSession);
        var newSCID = newSC.id;
        shallowCopy(oldScreen.screenDynamics[i], newSC);
        newSC.id = newSCID;
        if (newSC.sourceScreenID == oldScreen.id) {
            newSC.sourceScreenID = newID;
        }
        if (newSC.targetScreenID == oldScreen.id) {
            newSC.targetScreenID = newID;
        }
        newScreen.screenDynamics.push(newSC);
    }
    this.makeTestScreenVarNamesUnique();

    newScreen.id = newID;

    return newScreen;
};

ITSTest.prototype.getScalesList = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.scales.length; i++) {
        result += this.scales[i].scaleDescription;
        if (i < this.scales.length-1) result += separator;
    }
    return result;
};

ITSTest.prototype.getScalesMinScore = function () {
    var result = "";
    var tempVal = 0;
    for (var i=0; i < this.scales.length; i++) {
        if (this.scales[i].minimumScore != "") {
            try {
                tempVal = Number(this.scales[i].minimumScore);
                if (! isNaN(tempVal)) {
                    if (result == "" ) {
                        result = tempVal;
                    } else {
                        result = Math.min(result, tempVal);
                    }
                }
            } catch (err) {
                // noop
            }
        }
    }
    return result;
};

ITSTest.prototype.getScalesMaxScore = function () {
    var result = "";
    var tempVal = 0;
    for (var i=0; i < this.scales.length; i++) {
        if (this.scales[i].minimumScore != "") {
            try {
                tempVal = Number(this.scales[i].maximumScore);
                if (! isNaN(tempVal)) {
                    if (result == "" ) {
                        result = tempVal;
                    } else {
                        result = Math.max(result, tempVal);
                    }
                }
            } catch (err) {
                // noop
            }
        }
    }
    return result;
};

ITSTest.prototype.getNormsList = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.norms.length; i++) {
        result += this.norms[i].normDescription;
        if (i < this.norms.length-1) result += separator;
    }
    return result;
};


ITSTest.prototype.getScaleVarsList = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.scales.length; i++) {
        result += this.scales[i].scaleVarName;
        if (i < this.scales.length-1) result += separator;
    }
    return result;
};

ITSTest.prototype.getNormVarsList = function (separator) {
    if (!separator) separator = ",";
    var result = "";
    for (var i=0; i < this.norms.length; i++) {
        result += this.norms[i].NormVarName;
        if (i < this.norms.length-1) result += separator;
    }
    return result;
};

ITSTest.prototype.makeTestScreenVarNamesUnique = function () {
    // make the used test screen var names unique. start at the back of the screens array.
    for (var i = this.screens.length - 1; i >= 0; i--) {
        for (var j = i - 1; j >= 0; j--) {
            if (this.screens[i].varName == this.screens[j].varName) {
                this.screens[i].varName = this.screens[i].varName + 'x';
                // and now check everything again
                this.makeTestScreenVarNamesUnique();
                return;
            }
        }
    }
};

function ITSTests(sess) {
    this.ITSSession = sess;

    this.testList = [];

    this.currentlyLoading = false;
    this.onSuccessCallbacks = [];
    this.onErrorCallbacks = [];
    this.testListLoaded = false;
};

ITSTests.prototype.loadAvailableTestsSucces = function () {
    this.currentlyLoading = false;
    this.testListLoaded = true;

    for (var i = 0; i < this.onSuccessCallbacks.length; i++) {
        setTimeout(this.onSuccessCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};


ITSTests.prototype.loadAvailableTestsError = function () {
    this.currentlyLoading = false;
    this.testListLoaded = false;

    for (var i = 0; i < this.onErrorCallbacks.length; i++) {
        setTimeout(this.onErrorCallbacks[i], i);
    }
    this.onErrorCallbacks.length = 0;
    this.onSuccessCallbacks.length = 0;
};

ITSTests.prototype.loadAvailableTests = function (whenLoaded, onError) {
    //console.log("loading available tests");
    if (whenLoaded) {
        this.onSuccessCallbacks.push(whenLoaded);
    }
    if (onError) {
        this.onErrorCallbacks.push(onError);
    }
    if (!this.currentlyLoading) {
        if (! ITSInstance.companies.currentCompanyAvailable ) {
          setTimeout(this.loadAvailableTests.bind(this,whenLoaded,onError), 500);
          //console.log("Loading tests deferred");
        } else {
            this.currentlyLoading = true;
            ITSInstance.JSONAjaxLoader('tests', this.testList, this.loadAvailableTestsSucces.bind(this), this.loadAvailableTestsError.bind(this),
                "ITSTest",
                0, 999999, '', 'Y', ITSInstance.companies.currentCompany.NoPublicTests ? "N" : "Y", 'Y');
        }
    }
};

ITSTests.prototype.findTestById = function (testCollectionToSearch, TestID) {
    var i = 0;
    var found = false;
    while ((i < testCollectionToSearch.length) && (!found)) {
        if (testCollectionToSearch[i].ID.toUpperCase() == TestID.toUpperCase()) {
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

ITSTests.prototype.addNewTest = function () {
    var newtest = new ITSTest(this, this.ITSSession);
    this.testList.push(newtest);
    return newtest;
};

// Documents
function ITSTestDocument(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.id = newGuid();

    this.documentName = "";
    this.documentLanguage = ""; // from ITSSupportedLanguages
    this.documentType = ""; // Test manual, Factsheet, Scoring form, User instruction, Test construction, Source File, Other etc. In principle any value is fine but only these values are translated.
    this.documentDescription = ""; // HTML OK description of the document, or the document itself. If the document is stored externally this text can contain a URL to the document.
    this.documentExposureLevel = ""; // Test Editor/TE, Test authors/TA, Office users/OU, Public/P. Use values from this list.
    this.remarks = ""; // only shown in the test editor.

    this.persistentProperties = ['id', "documentName", "documentLanguage", "documentType", "documentDescription", "documentExposureLevel", "Remarks"];
}

// Scales
function ITSTestScale(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.id = newGuid();

    // test editor properties
    this.scaleVarName = ""; // the name of the scale variable
    this.scaleDescription = ""; // the description of the scale as shown to the user
    this.scaleType = "N"; // numeric or text (when text HTML is NOT ok)
    this.scaleExplanation = ""; // HTML OK explanation with what this scale is for
    this.defaultValue = "0"; // the default value for this scale
    this.minimumScore = ""; // the minimum scores on this scale (only for numeric scales)
    this.maximumScore = ""; // the maximum score on this scale (numeric only)
    this.calculateSequence = ""; // the sequence this scale is calculated in (if different from the order in the test)
    this.scalePrecision = "0"; // number of digits after the dot this scale is rounded to (numeric only) before being shown to the user
    this.showScale = true; // true or false, if false this is a hidden scale only used as an additional test variable in calculations
    this.remarks = ""; // only shown in the test editor.

    // run time property
    // during run time the scales will be linked to this.scales based on the scale var name
    this.scaleValue = ""; // the current actual value of this scale for the test currently being taken

    // determine what properties to store
    this.persistentProperties = ['id', "scaleVarName", "scaleDescription", "scaleType", "scaleExplanation", "defaultValue", "minimumScore", "maximumScore", "calculateSequence", "scalePrecision", "showScale", "remarks"];

}

ITSTest.prototype.addNewScale = function () {
    var newScale = new ITSTestScale(this, ITSSession);
    this.scales.push(newScale);
    return newScale;
};

ITSTestScale.prototype.getStatusProperties = function () {
    // status properties determine the run time values that need to be stored. They are always an object in the form of ID, columnName, value
    // the colums is the column that will end up in the excel style sheet containing the scores of this test

    // get the runtime stored status properties to store as part of the candidate's session
    return [{'id': this.id, 'columnName': this.scaleVarName, 'value': this.scaleValue}]
};

ITSTestScale.prototype.setStatusProperties = function (props) {
    // when loading check if either the id OR the scale var name is the same. This allows for deleting a scale and rebuilding it with
    // a new var name, but holds the disadvantage that the scale var nane MUST be unique.
    if ((this.id == props.id) || (this.scaleVarName == props.columnName)) {
        this.scaleValue = props.value;
    }
};

ITSTestScale.prototype.prepareForRunTime = function () {
    this.myParent['scale'][this.scaleVarName] = this;
};

// Norms
ITSTest.prototype.getDefaultNorm = function (normSequence) {
    var normFound = null;
    for (var i = 0; i < this.norms.length; i++) {
        if (this.norms[i].parameters.DefaultNormOrder == normSequence) {
            normFound = this.norms[i].id;
            break;
        }
    }

    if (normFound == null) {
        for (var i = 0; i < this.norms.length; i++) {
            if ((i == (normSequence - 1)) && (normFound == null)) {
                normFound = this.norms[i].id;
                break;
            }
        }
    }

    return normFound;
};

ITSTest.prototype.findNormById = function (id) {
    var result = -1;
    for (var i = 0; i < this.norms.length; i++) {
        if (this.norms[i].id == id) {
            result = i;
            break;
        }
    }
    return result;
};

function ITSTestNorm(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.id = newGuid();

    this.active = true;
    this.NormVarName = ""; // the variable name for this norm (used for test calculations if needed)
    this.normDescription = ""; // the description of this norm
    this.normMetric = "D"; // the norm metric. possible values : stanine, decile, vigintile, percentile, text, other SDVPTO
    this.afterNormScript = ""; // a javascript that will be evaluated after the norm tables have been applied
    this.beforeNormScript = ""; // a javascript that will be evaluated after the norm tables have been applied

    this.percentileValuesFilled = false; // if true then the norm metric does not matter, percentile values can be added for norm comparison
    this.explanation = ""; // an explanation of the norm (HTML OK) as shown to the user
    this.remarks = ""; // remarks about this norm (test editor only)

    this.parameters = {}; // additional norm parameters for this norm. These are objects with 2 properties : parName, parValue. during run time the are expanded as properties on this norm
    this.parameters.persistentProperties = "*ALL*";
    this.parameters.DefaultNormOrder = -1; // this norm is not selected by default

    this.normColumns = []; // there is one norm column per scales

    this.persistentProperties = ["id", "active", "NormVarName", "normDescription", "normMetric", "afterNormScript", "beforeNormScript", "percentileValuesFilled", "explanation", "remarks", "parameters", "normColumns"]
};

ITSTestNorm.prototype.normTest = function (session, sessionTest, candidate, results, scores, ITSInstance, normPostFix) {

    if (!normPostFix) normPostFix = 1;

    // Test pre norm script
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, scores, scales, itsinstance, normPostFix) { " + this.myParent.BeforeNormingScript + " }; ");
        func(session, sessionTest, candidate, this, results, scores, ITSInstance, normPostFix);
    } catch (err) { console.log("Test before norming script failed for "  + this.TestName + " " + this.NormVarName + " " + err);  }

    // Norm pre norm script
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, scores, scales, itsinstance, normPostFix) { " + this.beforeNormScript + " }; ");
        func(session, sessionTest, candidate, this, results, scores, ITSInstance, normPostFix);
    } catch (err) { console.log("Norm before norming script failed for "  + this.TestName + " " + this.NormVarName   + err);  }

    // use the norm columns to calculate the norm value
    for (var s =0; s < this.myParent.scales.length; s++){
        var score = scores["__" + this.myParent.scales[s].id];
        var saveNormScore = false;

        if (score) {
            switch (normPostFix) {
                case 1 :
                    score.NormScore = '-';
                    score.PercentileScore = '-';
                    score.PercentileScoreSet = false;
                    score.AppliedNorm = '-';
                    score.AppliedNormDescription = '-';
                    break;
                case 2 :
                    score.NormScore2 = '-';
                    score.PercentileScore2 = '-';
                    score.PercentileScoreSet2 = false;
                    score.AppliedNorm2 = '-';
                    score.AppliedNormDescription2 = '-';
                    break;
                case 3 :
                    score.NormScore3 = '-';
                    score.PercentileScore3 = '-';
                    score.PercentileScoreSet3 = false;
                    score.AppliedNorm3 = '-';
                    score.AppliedNormDescription3 = '-';
                    break;
            }
        }

        var ncs = this.findNormColumnsWithScaleID(this.myParent.scales[s].id);
        if (ncs) {
            for (n=0; n < ncs.normColumnValues.length;n++){
                nc = ncs.normColumnValues[n];

                try {
                    // now get the actual value of the norm
                    score = scores["__" + this.myParent.scales[s].id];

                    if (score) {
                        saveNormScore = false;
                        if ($.isNumeric(nc.rawScoreBorder) && $.isNumeric(score.Score)) {
                            // perform numeric comparison
                            if (Number(nc.rawScoreBorder) <= Number(score.Score)) {
                                saveNormScore = true;
                            }
                        } else {
                            // perform string comparison
                            if (String(nc.rawScoreBorder) == String(score.Score)) {
                                saveNormScore = true;
                            }
                        }
                        if (saveNormScore) {
                            switch (normPostFix) {
                                case 1:
                                    score.NormScore = nc.normValue;
                                    score.PercentileScore = nc.percentileValue;
                                    score.PercentileScoreSet = this.percentileValuesFilled;
                                    score.AppliedNorm = this.NormVarName;
                                    score.AppliedNormDescription = this.normDescription;
                                    break;
                                case 2:
                                    score.NormScore2 = nc.normValue;
                                    score.PercentileScore2 = nc.percentileValue;
                                    score.PercentileScoreSet2 = this.percentileValuesFilled;
                                    score.AppliedNorm2 = this.NormVarName;
                                    score.AppliedNormDescription2 = this.normDescription;
                                    break;
                                case 3:
                                    score.NormScore3 = nc.normValue;
                                    score.PercentileScore3 = nc.percentileValue;
                                    score.PercentileScoreSet3 = this.percentileValuesFilled;
                                    score.AppliedNorm3 = this.NormVarName;
                                    score.AppliedNormDescription3 = this.normDescription;
                                    break;
                            }
                        }
                    }
                } catch  (err) { console.log("Norm column calculations failed for "  + this.TestName + " " + this.NormVarName   + err);  }
            }
        }
    }

    // Norm post norm script
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, scores, scales, itsinstance, normPostFix) { " + this.afterNormScript + " }; ");
        func(session, sessionTest, candidate, this, results, scores, ITSInstance, normPostFix);
    } catch (err) { console.log("Norm after norming script failed for "  + this.TestName + " " + this.NormVarName   + err);  }

    // Test post norm script
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, scores, scales, itsinstance, normPostFix) { " + this.myParent.AfterNormingScript + " }; ");
        func(session, sessionTest, candidate, this, results, scores, ITSInstance, normPostFix);
    } catch (err) { console.log("Test before norming script failed for "  + this.TestName + " " + this.NormVarName   + err);  }

};

ITSTestNorm.prototype.normIsNumeric = function () {
    if ( (this.normMetric == "S" ) ||(this.normMetric == "D" ) ||(this.normMetric == "V" ) ||(this.normMetric == "P" )) { return true; }
    return false;
};

ITSTestNorm.prototype.normMaxScore = function () {
    switch (this.normMetric) {
        case "S": return 9;
        case "D": return 10;
        case "V": return 20;
        case "P" : return 100;
        default : return 10;
    }
};

ITSTestNorm.prototype.getStatusProperties = function () {
    // status properties determine the run time values that need to be stored. They are always an object in the form of ID, columnName, value
    // the colums is the column that will end up in the excel style sheet containing the scores of this test

    // get the runtime stored status properties to store as part of the candidate's session
    status = {};
    for (var i = 0; i < this.NormColumns.length; i++) {
        status[this.NormColumns[i].id] = {
            'id': this.NormColumns[i].id,
            'columnName': this.NormVarName + "/" + this.NormColumns[i].scaleVarName,
            'value': this.NormColumns[i].currentNormValue,
            'scaleVarName': this.NormColumns[i].scaleVarName,
            'percentile': 'N'
        };
        if (this.percentileValuesFilled) {
            status[this.NormColumns[i].id] = [{
                'id': this.NormColumns[i].id,
                'columnName': 'P' + this.NormVarName + "/" + this.NormColumns[i].scaleVarName,
                'value': this.NormColumns[i].currentPercentileValue,
                'scaleVarName': this.NormColumns[i].scaleVarName,
                'percentile': 'Y'
            },
                {
                    'id': this.NormColumns[i].id,
                    'columnName': this.NormVarName + "/" + this.NormColumns[i].scaleVarName,
                    'value': this.NormColumns[i].currentNormValue,
                    'scaleVarName': this.NormColumns[i].scaleVarName,
                    'percentile': 'N'
                }];
        }
    }
    return status;
};

ITSTestNorm.prototype.setStatusProperties = function (props) {
    // when loading check if either the id OR the scale var name is the same. This allows for deleting a scale and rebuilding it with
    // a new var name, but holds the disadvantage that the scale var nane MUST be unique.
    for (var i = 0; i < props.length; i++) {
        for (var j = 0; j < this.normColumns.length; j++) {
            if ((props[i].id == this.normColumns[j].id) || (props[i].scaleVarName == this.normColumns[j].scaleVarName)) {
                if (props[i].percentile) {
                    this.normColumns[j].currentPercentileValue = props[i].value
                } else {
                    this.normColumns[j].currentNormValue = props[i].value
                }
                break;
            }
        }
    }
};

ITSTestNorm.prototype.prepareForRunTime = function () {
    this.myParent['norm'][this.NormVarName] = this;
};

ITSTestNorm.prototype.addScaleToNormColumns = function (scaleID) {
    var newnorm = new ITSTestNormColumns(this, this.ITSSession);
    this.normColumns.push(newnorm);
    newnorm.scaleID = scaleID;
    return newnorm;
};

ITSTestNorm.prototype.findNormColumnsWithScaleID = function (scaleID) {
    for (var i=0; i < this.normColumns.length; i++) {
        if (this.normColumns[i].scaleID == scaleID) {
            return this.normColumns[i];
        }
    }
    return null;
};

ITSTestNorm.prototype.removeInvalidScalesFromNormColumns = function ()  {
    for (var i=0; i < this.normColumns.length; i++) {
        if ( this.myParent.findScaleByID(this.normColumns[i].scaleID) == null ) {
            this.normColumns.splice(i,1);
            this.removeInvalidScalesFromNormColumns();
            return;
        }
    }
};

ITSTest.prototype.addNewNorm = function () {
    var newnorm = new ITSTestNorm(this, this.ITSSession);
    this.norms.push(newnorm);
    return newnorm;
};


function ITSTestNormColumns(par, session) {
    this.ITSSession = session;
    this.myParent = par;

    this.id = newGuid();

    this.normColumnValues = []; // an array if ITSTestNormColumn objects ordered by rawScoreBorder (in case of a numeric scale in numeric order, otherwise textually)
    this.scaleID = ""; // the id of the scale

    // run time properties
    this.currentNormValue = "";
    this.currentPercentileValue = "";

    this.persistentProperties = ["id", "normColumnValues", "scaleID"];
}

ITSTestNormColumns.prototype.addNewNormColumn = function () {
    var newnorm = new ITSTestNormColumn(this, this.ITSSession);
    this.normColumnValues.push(newnorm);
    return newnorm;
};

function ITSTestNormColumn(par, session) {
    this.ITSSession = session;
    this.myParent = par;

    this.rawScoreBorder = "0"; // the border of the raw score upto and including the border value for which this norm value will apply
    this.normValue = "0"; // the normed value
    this.percentileValue = "0"; // the percentile value representation of this normed value

    this.persistentProperties = ["rawScoreBorder", "normValue", "percentileValue"];
}

ITSTestNormColumn.prototype.validate = function () {
    var metric = this.myParent.myParent.normMetric; // SDVPTO
    var fillPercentiles = !this.myParent.myParent.percentileValuesFilled;
    var corrected = false;

    switch (metric) {
        case "S" :
            try { this.normValue = parseInt(this.normValue); } catch(err) { this.normValue = 1; }
            if (this.normValue < 0) { this.normValue = 0; corrected = true; }
            if (this.normValue > 9) { this.normValue = 9; corrected = true; }

            if (fillPercentiles) {
                this.percentileValue = 0;
                switch (this.normValue) {
                    case 1 : this.percentileValue = 2; break;
                    case 2 : this.percentileValue = 8; break;
                    case 3 : this.percentileValue = 16; break;
                    case 4 : this.percentileValue = 31; break;
                    case 5 : this.percentileValue = 50; break;
                    case 6 : this.percentileValue = 68; break;
                    case 7 : this.percentileValue = 83; break;
                    case 8 : this.percentileValue = 93; break;
                    case 9 : this.percentileValue = 98; break;
                }
            }
            break;
        case "D" :
            try { this.normValue = parseInt(this.normValue); }  catch(err) { this.normValue = 1; }
            if (this.normValue < 0) { this.normValue = 0; corrected = true; }
            if (this.normValue > 10) { this.normValue = 10; corrected = true; }
            if (fillPercentiles) {
                this.percentileValue = this.normValue*10;
            }
            break;
        case "V" :
            try { this.normValue = parseInt(this.normValue); }  catch(err) { this.normValue = 1; }
            if (this.normValue < 0) { this.normValue = 0; corrected = true; }
            if (this.normValue > 20) { this.normValue = 20; corrected = true; }
            if (fillPercentiles) {
                this.percentileValue = this.normValue*5;
            }
            break;
        case "P" :
            try { this.normValue = parseInt(this.normValue); }  catch(err) { this.normValue = 1; }
            if (this.normValue < 0) { this.normValue = 0; corrected = true; }
            if (this.normValue > 100) { this.normValue = 100; corrected = true; }
            if (fillPercentiles) {
                this.percentileValue = this.normValue;
            }
            break;
    }

    var test = this.myParent.myParent.myParent;
    var scale = test.findScaleByID( this.myParent.scaleID );
    if ( (scale.minimumScore != scale.maximumScore) && (scale.scaleType == "N")) {
        try { if (parseFloat(this.rawScoreBorder) < parseFloat(scale.minimumScore)) { this.rawScoreBorder = scale.minimumScore; corrected = true; } } catch(err) {}
        try { if (parseFloat(this.rawScoreBorder) > parseFloat(scale.maximumScore)) { this.rawScoreBorder = scale.maximumScore; corrected = true; } } catch(err) {}
    }

    return corrected ;
};

// screens
function ITSTestScreen(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.id = newGuid();

    this.varName = ""; // variable name of this screen needed for scoring
    this.explanation = ""; // the explanation for this question as shown to the office user (HTML OK)
    this.screenGroup = ""; // the name of the screen group this screen belongs to
    this.show = true; // determines whether this screen is shown or not
    this.remarks = ""; // remarks as shown in the test editor

    this.beforeScreenScript = ""; // runs before the screen is shown, for example to shuffle questions or to change answer order
    this.afterScreenScript = ""; // runs after the screen is shown, for example for complex validations

    this.screenComponents = []; //an array of ITSTestScreenComponent objects
    this.screenDynamics = []; //an array of ITSTestScreenDynamics objects

    this.persistentProperties = ["id", "varName", "explanation", "screenGroup", "show", "remarks", "beforeScreenScript",
        "afterScreenScript", "screenComponents" , "screenDynamics"];
}

ITSTestScreen.prototype.generatePlaceholderOverviewFor = function(indexToEnd, screenlist) {
    var placeholdersfound = [];

    for (var i=0; i < Math.min(this.screenComponents.length,indexToEnd); i++){
        var newTemplate = ITSInstance.screenTemplates.findTemplateById(ITSInstance.screenTemplates.screenTemplates, this.screenComponents[i].templateID );
        if (newTemplate >= 0) {
            var template = ITSInstance.screenTemplates.screenTemplates[newTemplate];
            for (var varcount = 0; varcount < template.TemplateVariables.length; varcount++) {
                if (template.TemplateVariables[varcount].variableType == "P") {
                    var templist = screenlist[i].templateValues;
                    var repeatadder = "";
                    for (var repeater =1; repeater <= templist.RepeatBlockCount; repeater++) {
                        if (repeater > 1) {
                            repeatadder = "_" + repeater;
                        }
                        if (placeholdersfound.indexOf(templist[template.TemplateVariables[varcount].variableName + repeatadder]) < 0) {
                            placeholdersfound.push(templist[template.TemplateVariables[varcount].variableName + repeatadder]);
                        }
                    }
                }
            }
        }
    }
    return placeholdersfound;
};

ITSTestScreen.prototype.getVisibilityStatusAsString = function() {
    var visibilityString = "";

    for (var i=0; i < this.screenComponents.length - 1; i++){
        visibilityString += this.screenComponents[i].show ? "Y" : "N";
    }
    return visibilityString;
};

ITSTestScreen.prototype.checkValidations = function (storageObject, messageSeparator, postfix) {
    if (!postfix) postfix = "";
    var validationMessage = "";
    var TestResults = storageObject["__" + this.id] ;
    for (var i = 0; i < this.screenComponents.length; i++) {
        var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[i].templateID);
        var template =  this.ITSSession.screenTemplates.screenTemplates[templateIndex];
        var ComponentResults = TestResults["__" + this.screenComponents[i].id];
        var checkMessage = template.runtime_validate( 'X' + i + 'Y' + postfix, this.screenComponents[i].templateValues.RepeatBlockCount,'TT', this.screenComponents[i].templateValues, ComponentResults);
        if ( (checkMessage!='') && (checkMessage != undefined)) validationMessage = checkMessage + messageSeparator;
    }
    return validationMessage;
};

ITSTestScreen.prototype.checkIsAnswered = function (storageObject, postfix) {
    // checkIsAnswered can have the following values :
    // 999 (no settings for isanswered found or all undefined)
    // 1 (or larger until 999) = all questions in this screen are answered
    // 0 (or smaller) = all questions on this screen are not answered yet
    if (!postfix) postfix = "";
    var checkResult = 999;
    var TestResults = storageObject["__" + this.id] ;
    for (var i = 0; i < this.screenComponents.length; i++) {
        var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[i].templateID);
        var template =  this.ITSSession.screenTemplates.screenTemplates[templateIndex];
        var ComponentResults = TestResults["__" + this.screenComponents[i].id];
        checkMessage = "";
        try {
            var checkMessage = template.runtime_isanswered('X' + i + 'Y' + postfix, this.screenComponents[i].templateValues.RepeatBlockCount, 'TT', this.screenComponents[i].templateValues, ComponentResults);
        } catch(err) { console.log("Is Answered script failed for "  + this.myParent.TestName + "(" +'X' + i + 'Y' + postfix + ") "  + err);   }
        if ( checkMessage != undefined) {
            if (checkMessage !== "") {
                checkResult = Math.min(Number(checkMessage), checkResult);
            }
        }
    }
    return checkResult;
};

ITSTest.prototype.findScreenByID = function (idToFind) {
    for (i = 0; i < this.screens.length; i++) {
        if (this.screens[i].id == idToFind) {
            return this.screens[i];
        }
    }
    return null;
};

ITSTest.prototype.findScreenIndexByName = function (nameToFind) {
    for (i = 0; i < this.screens.length; i++) {
        if (this.screens[i].varName == nameToFind) {
            return i;
        }
    }
    return -1;
};

ITSTest.prototype.findScaleByID = function (idToFind) {
    for (i = 0; i < this.scales.length; i++) {
        if (this.scales[i].id == idToFind) {
            return this.scales[i];
        }
    }
    return null;
};

ITSTest.prototype.generateQuestionOverview = function (hostDiv, resultsToLoad, PnP, additionalText, currentSession, currentSessionTest, candidate) {
    if (! additionalText) additionalText = "";
    for (var i=0; i < this.screens.length; i ++) {
        if (PnP) {
            // execute the screen pre script for PnP view initialisation
            try {
                eval("var func = function(session, sessiontest, candidate, testdefinition, testtakingcontroller, itsinstance, testmode, screen) { " + this.screens[i].beforeScreenScript + " }; ");
                func(currentSession, currentSessionTest, candidate, this, undefined, ITSInstance, "PnPView", this.screens[i] );
            } catch (err) { console.log("Screen pre script failed for "  + this.TestName + "(" + i + ")"  + err);  }
            this.screens[i].generateScreenInDiv(hostDiv, "PnPView", "_" + i + additionalText, PnP);
        }
        else {
            this.screens[i].generateScreenInDiv(hostDiv, "TE", "_" + i + additionalText, PnP);
        }
        $('#'+ hostDiv).append('<hr/>');
        if (resultsToLoad) {
            this.screens[i].updateDivsFromResultStorage(resultsToLoad, "_" + i + additionalText);
        }
    }
};

ITSTest.prototype.updateResultsStorageFromQuestionOverview = function(hostDiv, resultsToSave, PnP, additionalText) {
    if (! additionalText) additionalText = "";
    for (var i=0; i < this.screens.length; i ++) {
        this.screens[i].updateResultsStorageFromDivs(resultsToSave, "_" + i + additionalText, PnP);
    }
};

ITSTest.prototype.scoreTest = function (session, sessionTest, candidate, results, scores, ITSInstance) {
    // first process the scoring rules
    this.prepareScalesStorage(scores, true);
    for (var i=0; i < this.scoreRules.length; i++) {
        //this.SourceScreenID = "";
        //this.SourceQuestionID = "";
        //this.SourceValue = "";
        //this.TargetScale = "";
        //this.TargetScaleValue = "";
        var r = results;
        var s = scores;
        var rule = this.scoreRules[i];
        if (r["__"+rule.SourceScreenID]) {
            var source =  r["__"+rule.SourceScreenID];
            if (source["__" + rule.SourceQuestionID]) {
                source = source["__" + rule.SourceQuestionID];
                if (( (String(source.Value) == String(rule.SourceValue)) ||
                    ((rule.SourceValue.indexOf('%%QuestionValue%%') >= 0) && (rule.TargetScaleValue.indexOf('%%QuestionValue%%') >= 0) ) ) && (s["__" + rule.TargetScale])) {
                    var target = s["__" + rule.TargetScale];
                    //console.log(target);
                    var thisScale = this.findScaleByID(rule.TargetScale);

                    var TargetScaleValue = rule.TargetScaleValue;
                    if (TargetScaleValue.indexOf('%%QuestionValue%%') >= 0) {
                        if (typeof source.Value === "string") {
                            TargetScaleValue = TargetScaleValue.replace(/%%QuestionValue%%/g, source.Value);
                        } else {
                            TargetScaleValue = TargetScaleValue.replace(/%%QuestionValue%%/g, "source.Value");
                        }
                    }

                    if (TargetScaleValue.indexOf('=') == 0) {
                        try {
                            TargetScaleValue = TargetScaleValue.substring(1);
                            if (thisScale.scaleType == "N") {
                                eval("target.Score = Number(target.Score) " + TargetScaleValue)
                            } else {
                                eval("target.Score = " + TargetScaleValue)
                            }
                        } catch (err) { console.log("Calculate scale failed for "  + this.TestName + "(" + i + ")"  + err);  }
                    } else {
                        try {
                            if (thisScale.scaleType == "N") {
                                eval("target.Score = Number(target.Score) + Number(" + TargetScaleValue + ")");
                            } else {
                                eval("target.Score = " + TargetScaleValue );
                            }
                        } catch (err) { console.log("Calculate scale failed for "  + this.TestName + "(" + i + ")"  + err);  }
                    }
                }
            }
        }
    }
    // and then the complex scoring script
    try {
        eval("var func = function(session, sessiontest, candidate, testdefinition, scores, scales, itsinstance) { " + this.ScoringScript + " }; ");
        func(session, sessionTest, candidate, this, results, scores, ITSInstance);
    } catch (err) { console.log("Calculate scores script failed for "  + this.TestName + " "  + err);  }

    // and now round the scales when required
    try {
        for (var i = 0; i < this.scales.length; i++) {
            var s = scores;
            var target = s["__" + this.scales[i].id];

            if ((this.scales[i].scaleType == "N") && (this.scales[i].scalePrecision >= 0)) {
                target.Score = precise_round(Number(target.Score), Number(this.scales[i].scalePrecision));
            }

        }
    } catch (err) { console.log("Rounding scores failed for "  + this.TestName + " "  + err);  }
};

ITSTest.prototype.prepareScalesStorage = function (storageObject, overwriteAllValues) {
    for (i = 0; i < this.scales.length; i++) {
        var TestScoreResults = {};
        TestScoreResults.Score = this.scales[i].defaultValue;
        if (this.scales[i].scaleType == "N") {
            TestScoreResults.NormScore = 0;
        } else {
            TestScoreResults.NormScore = "";
        }
        TestScoreResults.AppliedNorm = "";
        TestScoreResults.PercentileScore = 0;
        TestScoreResults.PercentileScoreSet = false;

        if (storageObject["__" + this.scales[i].id]) {
            if (overwriteAllValues) {
                storageObject["__" + this.scales[i].id] = TestScoreResults;
            } else {
                TestScoreResults = storageObject["__" + this.scales[i].id];
            }
        } else {
            storageObject["__" + this.scales[i].id] = TestScoreResults;
        }
        storageObject[this.scales[i].scaleVarName] = TestScoreResults;
    }
    return storageObject;
};

ITSTest.prototype.prepareResultsStorage = function (storageObject) {
    var tempList = {};

    for (var i = 0; i < this.screens.length; i++) {
        var TestResults = {};
        //TestResults.Score = this.scales[i].defaultValue;
        if (storageObject["__" + this.screens[i].id]) {
            TestResults = storageObject["__" + this.screens[i].id];
        } else if (tempList["__" + this.screens[i].id]) {
            // this is already present but in another tree
            TestResults = tempList["__" + this.screens[i].id];
        }
         else {
            storageObject["__" + this.screens[i].id] = TestResults;
            tempList["__" + this.screens[i].id] = TestResults;
        }
        storageObject[this.screens[i].varName] = TestResults;

        for (var compCounter = 0; compCounter < this.screens[i].screenComponents.length; compCounter++) {
            var ComponentResults = {};
            ComponentResults.Value = "";
            ComponentResults.Visible = true;

            if (TestResults["__" + this.screens[i].screenComponents[compCounter].id]) {
                ComponentResults = TestResults["__" + this.screens[i].screenComponents[compCounter].id];
            } else if (tempList["__" + this.screens[i].screenComponents[compCounter].id]) {
                ComponentResults = tempList["__" + this.screens[i].screenComponents[compCounter].id];
            } else {
                TestResults["__" + this.screens[i].screenComponents[compCounter].id] = ComponentResults;
                tempList["__" + this.screens[i].screenComponents[compCounter].id] = ComponentResults;
            }
            TestResults[this.screens[i].screenComponents[compCounter].varComponentName] = ComponentResults;

            ComponentResults.Visible = this.screens[i].show;
            ComponentResults.Anonimise = this.screens[i].screenComponents[compCounter].excludeFromAnonimisedTestResults;
        }
    }
    return storageObject;
};

ITSTestScreen.prototype.screenTemplatesLoaded = function () {
    var allLoaded = false;

    for (var i=0; i < this.screenComponents.length; i++) {
        var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[i].templateID);
        var template =  this.ITSSession.screenTemplates.screenTemplates[templateIndex];
        if (template) allLoaded = template.detailsLoaded;
        if (!allLoaded)  break;
    }
    return allLoaded;
};

ITSTestScreen.prototype.updateResultsStorageFromDivs = function (storageObject, postfix, PnP, sessionStorageObject) {
    var saveSessionNeeded = false;
    var TestResults = {};
    TestResults = storageObject["__" + this.id] ;

    if (!postfix) { postfix = ""; }
    if (!PnP) {PnP = false; }

    for (var j = 0; j < this.screenComponents.length; j++) {
        var ComponentResults = TestResults["__" + this.screenComponents[j].id];

        var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[j].templateID);
        var template =  this.ITSSession.screenTemplates.screenTemplates[templateIndex];
        template.generateTemplateFunctions();
        try {
            ComponentResults.Visible = this.screenComponents[j].show;

            if (ComponentResults.Visible) {
                try {
                    ComponentResults.Value = template.runtime_get_values('X' + j + 'Y' + postfix, this.screenComponents[j].templateValues.RepeatBlockCount, this.screenComponents[j].templateValues);

                    if (sessionStorageObject && this.screenComponents[j].storeAtSessionLevel) {
                        if (!sessionStorageObject.sessionStorage) sessionStorageObject.sessionStorage = {};
                        sessionStorageObject.sessionStorage._objectType = "ITSObject";
                        sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName] = ComponentResults.Value;
                        saveSessionNeeded = true;
                        //console.log("S" + this.screenComponents[j].varComponentName + "=" + sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName]);
                    }
                }
                catch (err) {
                    console.log("runtime_get_values failed for " +  this.screenComponents[j].varComponentName + " " + err.message );
                }
            }
        } catch (err) {};
    }
    return saveSessionNeeded;
};

ITSTestScreen.prototype.updateDivsFromResultStorage = function (storageObject, postFix, sessionStorageObject) {
    var TestResults = {};
    TestResults = storageObject["__" + this.id] ;

    if (!postFix) { postFix = ""; }

    for (var j = 0; j < this.screenComponents.length; j++) {
        var ComponentResults = TestResults["__" + this.screenComponents[j].id];

        var templateIndex = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[j].templateID);
        var template =  this.ITSSession.screenTemplates.screenTemplates[templateIndex];
        template.generateTemplateFunctions();
        if (sessionStorageObject && this.screenComponents[j].storeAtSessionLevel) {
            if (!sessionStorageObject.sessionStorage) sessionStorageObject.sessionStorage = {};
            if (sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName]) {
                // use the varComponentName instead of the id so it can be re-used over questions and tests in the session
                ComponentResults.Value = sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName];
                //console.log("U" + this.screenComponents[j].varComponentName + "=" + sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName]);
            }
        }
        try {
            template.runtime_set_values('X' + j + 'Y' + postFix, this.screenComponents[j].templateValues.RepeatBlockCount, ComponentResults.Value, this.screenComponents[j].templateValues);
        } catch (err) { console.log("Runtime set values failed " + err.message); }
        try {
            if (ComponentResults.Visible) {
                this.screenComponents[j].show = ComponentResults.Visible;
            }
        } catch (err) {}
    }
};

ITSTestScreen.prototype.updateFromSessionStorage = function (storageObject, sessionStorageObject) {
    var TestResults = {};
    TestResults = storageObject["__" + this.id] ;

    for (var j = 0; j < this.screenComponents.length; j++) {
        var ComponentResults = TestResults["__" + this.screenComponents[j].id];

        if (sessionStorageObject && this.screenComponents[j].storeAtSessionLevel) {
            if (!sessionStorageObject.sessionStorage) sessionStorageObject.sessionStorage = {};
            if (sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName]) {
                ComponentResults.Value = sessionStorageObject.sessionStorage[this.screenComponents[j].varComponentName];
                //console.log(this.screenComponents[j].varComponentName + "=" + ComponentResults.Value);
            }
        }
    }
};

ITSTestScreen.prototype.findComponentByID = function (idToFind) {
    for (i = 0; i < this.screenComponents.length; i++) {
        if (this.screenComponents[i].id == idToFind) {
            return this.screenComponents[i];
        }
    }
    return null;
};

ITSTestScreen.prototype.newTestScreenComponent = function () {
    var newScreen = new ITSTestScreenComponent(this, this.ITSSession);
    this.screenComponents.push(newScreen);
    return newScreen;
};

ITSTestScreen.prototype.newTestDynamicsRule = function () {
    var newRule = new ITSTestScreenDynamics(this, this.ITSSession);
    this.screenDynamics.push(newRule);
    return newRule;
};

ITSTestScreen.prototype.generateScreenInDiv = function (divId, context, divPostfix, PnP) {
    // load screen component list
    if (!context) { context = "TT";}
    if (!divPostfix) { divPostfix = ""; }
    if (!PnP) { PnP = false; }
    for (var i = 0; i < this.screenComponents.length; i++) {
        if (this.screenComponents[i].show) {
            // now generate the screen component with the resultsToLoad
            var newDivID = "";
            if (this.screenComponents[i].placeholderName != "") {
                // try to locate the div to add this screen component to
                for (var toCheck = 0; toCheck <= i; toCheck++) {
                    if ($('#X' + toCheck + 'Y' + divPostfix + "_" + this.screenComponents[i].placeholderName).length == 1) {
                        newDivID = 'X' + toCheck + 'Y' + divPostfix + "_" + this.screenComponents[i].placeholderName;
                        break;
                    }
                }
            }
            if (newDivID == "") {
                newDivID = "ITSTestTakingComponent" + i + divPostfix;
                $('#' + divId).append("<div style='page-break-inside: avoid; pointer-events: none;' id='" + newDivID + "'></div>");
            }

            var template = this.ITSSession.screenTemplates.findTemplateById(this.ITSSession.screenTemplates.screenTemplates, this.screenComponents[i].templateID);
            if (template >= 0) {
                myTemplate = this.ITSSession.screenTemplates.screenTemplates[template];
                //(div, add_to_div, id, templatevalues, pnp_view, full_initialisation, init_mode)
                myTemplate.generate_test_taking_view(newDivID, true, 'X' + i + 'Y' + divPostfix, this.screenComponents[i].templateValues, PnP, true, context);
            }
        }
    }
};

function ITSTestScreenComponent(par, session) {
    this.ITSSession = session;
    this.myParent = par;

    this.id = newGuid();
    this.varComponentName = ""; // variable name of this screen component
    this.excludeFromAnonimisedTestResults = false; // set to true to exclude from the
    this.storeAtSessionLevel = false; // this variable is not only stored in the sessiontest but also in the session (in the PluginData)

    this.templateID = ""; // the link to the test template id
    this.templateValues = {}; // the values use to initialize this template with
    this.runtimeValues = {}; // the values as set by the candidate taking the test
    this.placeholderName = ""; // the name of the placeholder to generate this screen component in

    this.show = true; // persistent property to indicate whether this component should be rendered or not. Used only by screen dynamics or scripting. This is the initial value from the test definition

    this.persistentProperties = ["id", "varComponentName", "templateValues", "excludeFromAnonimisedTestResults", "storeAtSessionLevel", "templateID", "show", "placeholderName"];
}

ITSTestScreenComponent.prototype.getColumnName = function () {
    return this.myParent.varName + "." + this.varComponentName;
};

ITSTestScreen.prototype.getStatusProperties = function () {
    // status properties determine the run time values that need to be stored. They are always an object in the form of ID, columnName, value
    // the colums is the column that will end up in the excel style sheet containing the scores of this test

    // get the runtime stored status properties to store as part of the candidate's session
    status = {};
    for (var i = 0; i < this.screenComponents.length; i++) {
        status[this.screenComponents[i].id] = {
            'id': this.screenComponents[i].id,
            'columnName': this.screenComponents[i].getColumnName(),
            'value': this.screenComponents[i].runtimeValues
        };
    }
    return status;
};

ITSTestScreen.prototype.setStatusProperties = function (props) {
    // when loading check if either the id OR the scale var name is the same. This allows for deleting a scale and rebuilding it with
    // a new var name, but holds the disadvantage that the scale var nane MUST be unique.
    status = props;
    for (var i = 0; i < this.props.length; i++) {
        var x = this.screenComponents[props[i].id];
        if (x) {
            x.columnName = props[i].varComponentName;
            x.runtimeValues = props[i].runtimeValues;
        }
    }
};

ITSTestScreen.prototype.prepareForRunTime = function () {
    this.myParent['screen'][this.varName] = this;
};

// ITSScaleScore
function ITSScaleScore(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.id = newGuid();

    this.SourceScreenID = "";
    this.SourceQuestionID = "";
    this.SourceValue = "";
    this.TargetScale = "";
    this.TargetScaleValue = "";

    this.persistentProperties = ["id", "SourceScreenID", "SourceQuestionID", "SourceValue", "TargetScale", "TargetScaleValue" ];
};

ITSTest.prototype.addNewScoreRule = function () {
    var newRule = new ITSScaleScore(this, ITSSession);
    this.scoreRules.push(newRule);
    return newRule;
};

//ITSTestScreenDynamics
function ITSTestScreenDynamics(par, session) {
    this.ITSSession = session;
    this.myParent = par;

    this.id = newGuid();

    this.sourceScreenID = ""; // the link to the source screen
    this.sourceVariableID = ""; // the link to the source variable id

    this.sourceValue = "";
    this.comparison = "==";

    this.targetScreenID = ""; // the link to the target screen
    this.targetVariableID = ""; // the link to the source variable id

    this.targetVisible = false; // if sourceScreenID.sourceVariableID == SourceValue then targetScreenID.targetVariableID.visible = targetVisible
    this.targetScript = ""; // if targetscript is set then the targetVisible property is ignored and the script is executed

    this.persistentProperties = ["id", "sourceScreenID", "sourceVariableID", "sourceValue", "targetScreenID", "targetVariableID" , "targetVisible", "comparison"];
};

// graphs
function ITSTestGraph(par, session) {
    this.ITSSession = session;
    this.myParent = par;
    this.ID = newGuid();
};
