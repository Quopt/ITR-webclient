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

var ITSSupportedLanguages = [ // these are internal ITS language codes, not the browser supported ones
    {languageCode: "af", languageDescription: "Afrikaans", translations_available : true},
    {languageCode: "ar", languageDescription: "Arabic", translations_available : true},
    {languageCode: "bn", languageDescription: "Bangla", translations_available : true},
    {languageCode: "bs", languageDescription: "Bosnian (Latin)", translations_available : true},
    {languageCode: "bg", languageDescription: "Bulgarian", translations_available : true},
    {languageCode: "yue", languageDescription: "Cantonese (Traditional)", translations_available : false},
    {languageCode: "ca", languageDescription: "Catalan", translations_available : true},
    {languageCode: "zh-Hans", languageDescription: "Chinese Simplified", translations_available : true},
    {languageCode: "hr", languageDescription: "Croatian", translations_available : true},
    {languageCode: "cs", languageDescription: "Czech", translations_available : true},
    {languageCode: "da", languageDescription: "Danish", translations_available : true},
    {languageCode: "nl", languageDescription: "Dutch", translations_available : true},
    {languageCode: "en", languageDescription: "English", translations_available : true},
    {languageCode: "et", languageDescription: "Estonian", translations_available : true},
    {languageCode: "fj", languageDescription: "Fijian", translations_available : false},
    {languageCode: "fil", languageDescription: "Filipino", translations_available : false},
    {languageCode: "fi", languageDescription: "Finnish", translations_available : true},
    {languageCode: "fr", languageDescription: "French", translations_available : true},
    {languageCode: "frr", languageDescription: "Frisian", translations_available : false},
    {languageCode: "de", languageDescription: "German", translations_available : true},
    {languageCode: "el", languageDescription: "Greek", translations_available : true},
    {languageCode: "ht", languageDescription: "Haitian Creole", translations_available : true},
    {languageCode: "he", languageDescription: "Hebrew", translations_available : true},
    {languageCode: "hi", languageDescription: "Hindi", translations_available : true},
    {languageCode: "mww", languageDescription: "Hmong Daw", translations_available : true},
    {languageCode: "hu", languageDescription: "Hungarian", translations_available : true},
    {languageCode: "id", languageDescription: "Indonesian", translations_available : true},
    {languageCode: "it", languageDescription: "Italian", translations_available : true},
    {languageCode: "ja", languageDescription: "Japanese", translations_available : true},
    {languageCode: "sw", languageDescription: "Kiswahili", translations_available : true},
    {languageCode: "tlh", languageDescription: "Klingon", translations_available : true},
    {languageCode: "ko", languageDescription: "Korean", translations_available : true},
    {languageCode: "lv", languageDescription: "Latvian", translations_available : true},
    {languageCode: "lt", languageDescription: "Lithuanian", translations_available : true},
    {languageCode: "mg", languageDescription: "Malagasy", translations_available : false},
    {languageCode: "ms", languageDescription: "Malay", translations_available : true},
    {languageCode: "mt", languageDescription: "Maltese", translations_available : true},
    {languageCode: "nb", languageDescription: "Norwegian", translations_available : true},
    {languageCode: "fa", languageDescription: "Persian", translations_available : true},
    {languageCode: "pl", languageDescription: "Polish", translations_available : true},
    {languageCode: "pt", languageDescription: "Portuguese", translations_available : true},
    {languageCode: "otq", languageDescription: "Queretaro Otomi", translations_available : false},
    {languageCode: "ro", languageDescription: "Romanian", translations_available : true},
    {languageCode: "ru", languageDescription: "Russian", translations_available : true},
    {languageCode: "sm", languageDescription: "Samoan", translations_available : false},
    {languageCode: "sr-Cyrl", languageDescription: "Serbian (Cyrillic)", translations_available : false},
    {languageCode: "sr-Latn", languageDescription: "Serbian (Latin)", translations_available : true},
    {languageCode: "sk", languageDescription: "Slovak", translations_available : true},
    {languageCode: "sl", languageDescription: "Slovenian", translations_available : true},
    {languageCode: "es", languageDescription: "Spanish", translations_available : true},
    {languageCode: "sv", languageDescription: "Swedish", translations_available : true},
    {languageCode: "ty", languageDescription: "Tahitian", translations_available : false},
    {languageCode: "ta", languageDescription: "Tamil", translations_available : true},
    {languageCode: "th", languageDescription: "Thai", translations_available : true},
    {languageCode: "to", languageDescription: "Tongan", translations_available : false},
    {languageCode: "tr", languageDescription: "Turkish", translations_available : true},
    {languageCode: "uk", languageDescription: "Ukrainian", translations_available : true},
    {languageCode: "ur", languageDescription: "Urdu", translations_available : true},
    {languageCode: "vi", languageDescription: "Vietnamese", translations_available : true},
    {languageCode: "cy", languageDescription: "Welsh", translations_available : true},
    {languageCode: "yua", languageDescription: "Yucatec Maya", translations_available : false}
]

var ISO639ToLangCode = [
    {languageCode: "ab", ITSlanguageCode: "en"},
    {languageCode: "aa", ITSlanguageCode: "en"},
    {languageCode: "af", ITSlanguageCode: "af"},
    {languageCode: "ak", ITSlanguageCode: "en"},
    {languageCode: "sq", ITSlanguageCode: "en"},
    {languageCode: "am", ITSlanguageCode: "en"},
    {languageCode: "ar", ITSlanguageCode: "ar"},
    {languageCode: "an", ITSlanguageCode: "en"},
    {languageCode: "hy", ITSlanguageCode: "en"},
    {languageCode: "as", ITSlanguageCode: "en"},
    {languageCode: "av", ITSlanguageCode: "en"},
    {languageCode: "ae", ITSlanguageCode: "en"},
    {languageCode: "ay", ITSlanguageCode: "en"},
    {languageCode: "az", ITSlanguageCode: "en"},
    {languageCode: "bm", ITSlanguageCode: "en"},
    {languageCode: "ba", ITSlanguageCode: "en"},
    {languageCode: "eu", ITSlanguageCode: "en"},
    {languageCode: "be", ITSlanguageCode: "en"},
    {languageCode: "bn", ITSlanguageCode: "bn"},
    {languageCode: "bh", ITSlanguageCode: "en"},
    {languageCode: "bi", ITSlanguageCode: "en"},
    {languageCode: "bs", ITSlanguageCode: "bs"},
    {languageCode: "br", ITSlanguageCode: "en"},
    {languageCode: "bg", ITSlanguageCode: "bg"},
    {languageCode: "my", ITSlanguageCode: "en"},
    {languageCode: "ca", ITSlanguageCode: "ca"},
    {languageCode: "ch", ITSlanguageCode: "en"},
    {languageCode: "ce", ITSlanguageCode: "en"},
    {languageCode: "ny", ITSlanguageCode: "en"},
    {languageCode: "zh", ITSlanguageCode: "en"},
    {languageCode: "cv", ITSlanguageCode: "en"},
    {languageCode: "kw", ITSlanguageCode: "en"},
    {languageCode: "co", ITSlanguageCode: "en"},
    {languageCode: "cr", ITSlanguageCode: "en"},
    {languageCode: "hr", ITSlanguageCode: "hr"},
    {languageCode: "cs", ITSlanguageCode: "cs"},
    {languageCode: "da", ITSlanguageCode: "da"},
    {languageCode: "dv", ITSlanguageCode: "en"},
    {languageCode: "nl", ITSlanguageCode: "nl"},
    {languageCode: "dz", ITSlanguageCode: "en"},
    {languageCode: "en", ITSlanguageCode: "en"},
    {languageCode: "eo", ITSlanguageCode: "en"},
    {languageCode: "et", ITSlanguageCode: "et"},
    {languageCode: "ee", ITSlanguageCode: "en"},
    {languageCode: "fo", ITSlanguageCode: "en"},
    {languageCode: "fj", ITSlanguageCode: "fj"},
    {languageCode: "fi", ITSlanguageCode: "fi"},
    {languageCode: "fr", ITSlanguageCode: "fr"},
    {languageCode: "frr", ITSlanguageCode: "frr"},
    {languageCode: "ff", ITSlanguageCode: "en"},
    {languageCode: "gl", ITSlanguageCode: "en"},
    {languageCode: "ka", ITSlanguageCode: "en"},
    {languageCode: "de", ITSlanguageCode: "de"},
    {languageCode: "el", ITSlanguageCode: "el"},
    {languageCode: "gn", ITSlanguageCode: "en"},
    {languageCode: "gu", ITSlanguageCode: "en"},
    {languageCode: "ht", ITSlanguageCode: "ht"},
    {languageCode: "ha", ITSlanguageCode: "en"},
    {languageCode: "he", ITSlanguageCode: "he"},
    {languageCode: "hz", ITSlanguageCode: "en"},
    {languageCode: "hi", ITSlanguageCode: "hi"},
    {languageCode: "ho", ITSlanguageCode: "en"},
    {languageCode: "hu", ITSlanguageCode: "hu"},
    {languageCode: "ia", ITSlanguageCode: "en"},
    {languageCode: "id", ITSlanguageCode: "id"},
    {languageCode: "ie", ITSlanguageCode: "en"},
    {languageCode: "ga", ITSlanguageCode: "en"},
    {languageCode: "ig", ITSlanguageCode: "en"},
    {languageCode: "ik", ITSlanguageCode: "en"},
    {languageCode: "io", ITSlanguageCode: "en"},
    {languageCode: "is", ITSlanguageCode: "en"},
    {languageCode: "it", ITSlanguageCode: "it"},
    {languageCode: "iu", ITSlanguageCode: "en"},
    {languageCode: "ja", ITSlanguageCode: "ja"},
    {languageCode: "jv", ITSlanguageCode: "en"},
    {languageCode: "kl", ITSlanguageCode: "en"},
    {languageCode: "kn", ITSlanguageCode: "en"},
    {languageCode: "kr", ITSlanguageCode: "en"},
    {languageCode: "ks", ITSlanguageCode: "en"},
    {languageCode: "kk", ITSlanguageCode: "en"},
    {languageCode: "km", ITSlanguageCode: "en"},
    {languageCode: "ki", ITSlanguageCode: "en"},
    {languageCode: "rw", ITSlanguageCode: "en"},
    {languageCode: "ky", ITSlanguageCode: "en"},
    {languageCode: "kv", ITSlanguageCode: "en"},
    {languageCode: "kg", ITSlanguageCode: "en"},
    {languageCode: "ko", ITSlanguageCode: "ko"},
    {languageCode: "ku", ITSlanguageCode: "en"},
    {languageCode: "kj", ITSlanguageCode: "en"},
    {languageCode: "la", ITSlanguageCode: "en"},
    {languageCode: "lb", ITSlanguageCode: "en"},
    {languageCode: "lg", ITSlanguageCode: "en"},
    {languageCode: "li", ITSlanguageCode: "en"},
    {languageCode: "ln", ITSlanguageCode: "en"},
    {languageCode: "lo", ITSlanguageCode: "en"},
    {languageCode: "lt", ITSlanguageCode: "lt"},
    {languageCode: "lu", ITSlanguageCode: "en"},
    {languageCode: "lv", ITSlanguageCode: "lv"},
    {languageCode: "gv", ITSlanguageCode: "en"},
    {languageCode: "mk", ITSlanguageCode: "en"},
    {languageCode: "mg", ITSlanguageCode: "mg"},
    {languageCode: "ms", ITSlanguageCode: "ms"},
    {languageCode: "ml", ITSlanguageCode: "en"},
    {languageCode: "mt", ITSlanguageCode: "mt"},
    {languageCode: "mi", ITSlanguageCode: "en"},
    {languageCode: "mr", ITSlanguageCode: "en"},
    {languageCode: "mh", ITSlanguageCode: "en"},
    {languageCode: "mn", ITSlanguageCode: "en"},
    {languageCode: "na", ITSlanguageCode: "en"},
    {languageCode: "nv", ITSlanguageCode: "en"},
    {languageCode: "nd", ITSlanguageCode: "en"},
    {languageCode: "ne", ITSlanguageCode: "en"},
    {languageCode: "ng", ITSlanguageCode: "en"},
    {languageCode: "nb", ITSlanguageCode: "nb"},
    {languageCode: "nn", ITSlanguageCode: "en"},
    {languageCode: "no", ITSlanguageCode: "en"},
    {languageCode: "ii", ITSlanguageCode: "en"},
    {languageCode: "nr", ITSlanguageCode: "en"},
    {languageCode: "oc", ITSlanguageCode: "en"},
    {languageCode: "oj", ITSlanguageCode: "en"},
    {languageCode: "cu", ITSlanguageCode: "en"},
    {languageCode: "om", ITSlanguageCode: "en"},
    {languageCode: "or", ITSlanguageCode: "en"},
    {languageCode: "os", ITSlanguageCode: "en"},
    {languageCode: "pa", ITSlanguageCode: "en"},
    {languageCode: "pi", ITSlanguageCode: "en"},
    {languageCode: "fa", ITSlanguageCode: "fa"},
    {languageCode: "pox", ITSlanguageCode: "en"},
    {languageCode: "pl", ITSlanguageCode: "pl"},
    {languageCode: "ps", ITSlanguageCode: "en"},
    {languageCode: "pt", ITSlanguageCode: "pt"},
    {languageCode: "qu", ITSlanguageCode: "en"},
    {languageCode: "rm", ITSlanguageCode: "en"},
    {languageCode: "rn", ITSlanguageCode: "en"},
    {languageCode: "ro", ITSlanguageCode: "ro"},
    {languageCode: "ru", ITSlanguageCode: "ru"},
    {languageCode: "sa", ITSlanguageCode: "en"},
    {languageCode: "sc", ITSlanguageCode: "en"},
    {languageCode: "sd", ITSlanguageCode: "en"},
    {languageCode: "se", ITSlanguageCode: "en"},
    {languageCode: "sm", ITSlanguageCode: "sm"},
    {languageCode: "sg", ITSlanguageCode: "en"},
    {languageCode: "sr", ITSlanguageCode: "en"},
    {languageCode: "gd", ITSlanguageCode: "en"},
    {languageCode: "sn", ITSlanguageCode: "en"},
    {languageCode: "si", ITSlanguageCode: "en"},
    {languageCode: "sk", ITSlanguageCode: "sk"},
    {languageCode: "sl", ITSlanguageCode: "sl"},
    {languageCode: "so", ITSlanguageCode: "en"},
    {languageCode: "st", ITSlanguageCode: "en"},
    {languageCode: "es", ITSlanguageCode: "es"},
    {languageCode: "su", ITSlanguageCode: "en"},
    {languageCode: "sw", ITSlanguageCode: "sw"},
    {languageCode: "ss", ITSlanguageCode: "en"},
    {languageCode: "sv", ITSlanguageCode: "sv"},
    {languageCode: "ta", ITSlanguageCode: "ta"},
    {languageCode: "te", ITSlanguageCode: "en"},
    {languageCode: "tg", ITSlanguageCode: "en"},
    {languageCode: "th", ITSlanguageCode: "th"},
    {languageCode: "ti", ITSlanguageCode: "en"},
    {languageCode: "tlh", ITSlanguageCode: "tlh"},
    {languageCode: "bo", ITSlanguageCode: "en"},
    {languageCode: "tk", ITSlanguageCode: "en"},
    {languageCode: "tl", ITSlanguageCode: "en"},
    {languageCode: "tn", ITSlanguageCode: "en"},
    {languageCode: "to", ITSlanguageCode: "to"},
    {languageCode: "tr", ITSlanguageCode: "tr"},
    {languageCode: "ts", ITSlanguageCode: "en"},
    {languageCode: "tt", ITSlanguageCode: "en"},
    {languageCode: "tw", ITSlanguageCode: "en"},
    {languageCode: "ty", ITSlanguageCode: "ty"},
    {languageCode: "ug", ITSlanguageCode: "en"},
    {languageCode: "uk", ITSlanguageCode: "uk"},
    {languageCode: "ur", ITSlanguageCode: "ur"},
    {languageCode: "uz", ITSlanguageCode: "en"},
    {languageCode: "ve", ITSlanguageCode: "en"},
    {languageCode: "vi", ITSlanguageCode: "vi"},
    {languageCode: "vo", ITSlanguageCode: "en"},
    {languageCode: "wa", ITSlanguageCode: "en"},
    {languageCode: "cy", ITSlanguageCode: "cy"},
    {languageCode: "wo", ITSlanguageCode: "en"},
    {languageCode: "fy", ITSlanguageCode: "en"},
    {languageCode: "xh", ITSlanguageCode: "en"},
    {languageCode: "yi", ITSlanguageCode: "en"},
    {languageCode: "yo", ITSlanguageCode: "en"},
    {languageCode: "za", ITSlanguageCode: "en"},
    {languageCode: "zh", ITSlanguageCode: "zh-Hans"},
    {languageCode: "zu", ITSlanguageCode: "en"}
];


function ITSTranslator(thisSession) {
    this.ITSInstance = thisSession;
    // current interface language is in ITSLanguage variable. For en (English) no translation is necessary
    this.translatedStrings = []; // the array of available translated strings. If a string is not translated yet it will be added to this array
    this.originalStrings = {};
    this.divsToTranslate = [];
    this.toTranslate = [];
    this.languageFileLoaded = false;
    this.currentTranslatedLanguage = "";
    this.availableTranslations = [];

    // indicated whether currently a language is being loaded
    this.loadingLanguage = false;
};

ITSTranslator.prototype.findTranslationLanguage = function (langCode) {
    var foundLang = "en";
    langCode = langCode.toLowerCase();
    for (var i = 0; i < ISO639ToLangCode.length; i++) {
        if (ISO639ToLangCode[i].languageCode == langCode) {
            foundLang = ISO639ToLangCode[i].ITSlanguageCode;
            break;
        }
    }
    return foundLang;
};

ITSTranslator.prototype.getLanguageDescription = function (langCode) {
    langCode = langCode.toLowerCase();
    for (var i=0; i < ITSSupportedLanguages.length;i++ ) {
        if (ITSSupportedLanguages[i].languageCode.toLowerCase() == langCode) {
            return this.getTranslatedString('ITSTranslate', langCode, ITSSupportedLanguages[i].languageDescription);
        }
    }
    return "";
};

ITSTranslator.prototype.load = function () {
    this.languageFileLoaded = false;
    this.translatedStrings.length = 0;
    var self = this;
    if (ITSLanguage != "en") {
        // get the main language from the browser language
        var transLang = ITSLanguage;
        if (transLang.indexOf('-') > 0) {
            transLang = transLang.substr(0, transLang.indexOf('-'));
        }

        if (transLang != 'en') {
            this.switchLanguage(transLang);
        }
    }
    // now load the available translations
    this.loadAvailableTranslations();
};

ITSTranslator.prototype.loadAvailableTranslations = function (onSuccess, onError) {
    this.availableTranslations = [];
    if (onSuccess) { this.availableTranslationsOnSuccess = onSuccess; }
    if (onError) { this.availableTranslationsOnError = onError; }

    if (!this.availableTranslationsLoading) {
        var transFile = ITSInstance.baseURLAPI + 'translations';
        $.ajax({
            url: transFile,
            type: 'GET',
            success: function (data) {
                this.availableTranslations = data;
                this.availableTranslationsLoading = false;
                if (this.availableTranslationsOnSuccess) {
                    this.availableTranslationsOnSuccess();
                }
            }.bind(this),
            error: function (xhr) {
                console.log("Error loading available translations : " + xhr.status + ": " + xhr.statusText);
                this.availableTranslationsLoading = false;
                if (this.availableTranslationsOnError) {
                    this.availableTranslationsOnError();
                }
            }.bind(this)
        });
    }
    this.availableTranslationsLoading = true;
};

ITSTranslator.prototype.storeCurrentLanguageInCookie = function () {
    // set language preference cookie for this session
    cookieHelper.setCookie('ITRLanguage',ITSLanguage,600);
};

ITSTranslator.prototype.switchLanguage = function (langCode, postLoadFunction) {
    if (this.loadingLanguage) {
        if (langCode != this.currentTranslatedLanguage) setTimeout(this.switchLanguage.bind(this, langCode, postLoadFunction, true), 500);
    } else {
        langCode = langCode.toLowerCase();
        if (langCode != "en") {
            // check if the language code is in the available translations
            this.loadingLanguage = true;

            // the base should always be english
            this.switchToEnglish();

            this.translatedStrings = [];
            this.toTranslate = [];
            var transLang = this.findTranslationLanguage(langCode);
            this.currentTranslatedLanguage = transLang;

            var transFile = ITSInstance.baseURLAPI + 'translations/' + transLang;
            console.log('Loading translation ' + transFile);
            ITSLanguage = langCode;
            this.postLoadFunction = postLoadFunction;

            $.ajax({
                    url: transFile,
                    type: 'GET',
                    success: function (data) {
                        this.loadingLanguage = false;
                        if (data != "") {
                            this.translatedStrings = JSON.parse(data);
                        }
                        this.languageFileLoaded = true;
                        for (var i = 0; i < this.divsToTranslate.length; i++) {
                            this.translateDiv(this.divsToTranslate[i]);
                        }
                        if (this.postLoadFunction) {
                            this.postLoadFunction();
                        }
                    }.bind(this),
                    error: function (xhr) {
                        this.loadingLanguage = false;
                        console.log("Error loading translations : " + xhr.status + ": " + xhr.statusText);
                        this.languageFileLoaded = true;
                        for (var i = 0; i < this.divsToTranslate.length; i++) {
                            this.translateDiv(this.divsToTranslate[i]);
                        }
                    }.bind(this)
                }
            )
        } else {
            this.switchToEnglish();
        }
    }
};

ITSTranslator.prototype.switchToEnglish = function () {
    ITSLanguage = "en";
    var transLang = this.findTranslationLanguage("en");
    this.currentTranslatedLanguage = transLang;
    for (var i = 0; i < this.divsToTranslate.length; i++) {
        this.translateDiv(this.divsToTranslate[i]);
    }
};

ITSTranslator.prototype.getTranslatedString = function (module, stringid, originalString) {
    if (stringid == "")
    {
        return originalString;
    }
    else {
        indexID = stringid;
        if (module != "") {
            indexID = module + '.' + stringid;
        }
        if (ITSLanguage != "en") {
            if ((this.originalStrings[indexID] == undefined) && (originalString != "")) {
                var tempObj = {};
                tempObj.id = indexID;
                tempObj.value = originalString;
                this.originalStrings[indexID] = tempObj;
            }

            if (this.translatedStrings[indexID] != undefined) {
                return this.translatedStrings[indexID].value;
            } else {
                if ((this.toTranslate[indexID] == undefined) && (originalString != "")) {
                    var tempObj = {};
                    tempObj.id = indexID;
                    tempObj.value = originalString;
                    this.toTranslate.push(tempObj);
                }
            }
            return originalString;
        }
        else {
            if (this.originalStrings[indexID] != undefined) {
                return this.originalStrings[indexID].value;
            }
            else {
                return originalString;
            }
        }
    }
};

ITSTranslator.prototype.translate = function (stringid, originalString) {
    return this.getTranslatedString('', stringid, originalString);
};

ITSTranslator.prototype.translateDiv = function (divId, showLog) {
    if (this.divsToTranslate.indexOf(divId) < 0) this.divsToTranslate.push(divId);
    if ((this.languageFileLoaded) || (ITSLanguage=="en")) {
        // translate this div
        var tN, tId;
        var self = this;
        $(divId + ' *').children().each(function () {
            if (showLog) console.log(this.tagName);
            if (this.tagName) {
                tN = this.tagName.toUpperCase();
                tId = this.id.toUpperCase();
                // if this child has the Translate tag then skip else translate
                if (((!this.hasAttribute("NoTranslate")) || (!this.hasAttribute("notranslate"))) && (this.id != "") && (tN != 'DIV') && (tId.indexOf('MCEU_') == -1) && (tId.indexOf('ACE-') == -1) && (tN != 'TEXTAREA-HTMLEDIT') && (tN != 'I') && (tN != 'B') && (tN != 'A') && (tN != 'TEXTAREA') && (tN != 'TBODY') && (tN != 'TABLE')) {
                    var transStr = divId + "." + this.id;
                    if (self.translatedStrings[transStr] == undefined) transStr = this.id; // try with just the id
                    if (showLog) console.log(transStr);
                    if (self.translatedStrings[transStr] != undefined) {
                        if (this.placeholder != undefined) {
                            this.placeholder = self.translate(transStr, this.placeholder);
                            if (showLog) console.log(this.placeholder);
                        }
                        else if (this.text != undefined) {
                            this.text = self.translate(transStr, this.text);
                            if (showLog) console.log(this.text);
                        }
                        else if (this.innerHTML != undefined) {
                            this.innerHTML = self.translate(transStr, this.innerHTML);
                            if (showLog) console.log(this.innerHTML);
                        }
                        else if (this.val != undefined) {
                            this.val = self.translate(transStr, this.val);
                            if (showLog) console.log(this.val);
                        }
                    } else {
                        if (self.toTranslate[transStr] == undefined) {
                            var tempObj = {};
                            tempObj.id = transStr;
                            tempObj.value = "";
                            if (this.placeholder !== undefined) {
                                tempObj.value = this.placeholder;
                            } else if (this.text !== undefined) {
                                tempObj.value = this.text;
                            }
                            else if (this.innerHTML !== undefined) {
                                tempObj.value = this.innerHTML;
                            }
                            else if (this.val !== undefined) {
                                tempObj.value = this.val;
                            }
                            if ( (tempObj.value.indexOf("<path") == 0) || (tempObj.value.indexOf("<svg id=") >= 0) || (tempObj.value.indexOf("<svg class=") >= 0) || (tempObj.value.indexOf("<option value=") >= 0)) {
                                if (showLog) console.log(transStr + ' ignored for translation');
                            } else {
                                if (tempObj.value != "") {
                                    if (!self.toTranslate.some(function (elem) {
                                        return elem.id == transStr;
                                    })) self.toTranslate.push(tempObj);
                                }
                                if (showLog) console.log(transStr + ' not present');
                            }
                        }
                    }
                }
            }
        });
    }
};

ITSTranslator.prototype.listNewTranslations = function () {
    var newStrings = {};
    this.toTranslate.forEach(
        function (entry) {
            if (entry !== undefined) {
                temp = String(entry.value);
                temp2 = String(entry.id);
                if ( (temp.trim() != "") && (temp2 != "undefined") && (temp2 != "")) {
                    //newStrings.push('"' + entry.id + '" : { "value" : "' + entry.value + '"} ,');
                    newStrings[entry.id] = { value : entry.value };
                }
            }
        }
    )
    tempVal = JSON.stringify(newStrings, null, 1);
    //console.log(tempVal);
    return tempVal;
};

ITSTranslator.prototype.postNewTranslations = function (langCode) {
    // only fill langCode for the initial language file and never do that again afterwards ...
    if (ITSInstance.users.currentUser.IsMasterUser || ITSInstance.users.currentUser.IsTranslator) {
        var to_translate = this.listNewTranslations();
        var tempLangCode = this.currentTranslatedLanguage.toLowerCase();
        if (langCode != undefined) {
            langCode = langCode.toLowerCase();
            tempLangCode = langCode;
        }
        if (tempLangCode != "en") {
            if (to_translate.length > 0) {
                console.log('New translations found for the current language. Posting for machine translation : ' + to_translate);
                ITSInstance.genericAjaxUpdate('translations/' + tempLangCode, to_translate, function () {
                    },
                    function () {
                    });
            }
            this.toTranslate = []; // do not post twice
        }
    } else {
        console.log('PLEASE NOTE : new translations can only be successfully posted when logged is as master user or translator.');
    }
};

ITSTranslator.prototype.postNewTranslationsNoPars  = function () {
    this.postNewTranslations();
};

ITSTranslator.prototype.postFullTranslations = function (langCode) {
    console.log('PLEASE NOTE : new translations can only be successfully posted when logged is as master user or translator.');
    var to_translate =  JSON.stringify(this.originalStrings);
    var tempLangCode = this.currentTranslatedLanguage;
    if (langCode) {
        langCode = langCode.toLowerCase();
        tempLangCode = langCode;
        ITSInstance.genericAjaxUpdate('translations/' + tempLangCode, to_translate, function () {}, function () {})
    }
};

