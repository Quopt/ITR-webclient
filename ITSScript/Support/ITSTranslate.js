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

var ITSSupportedLanguages = [ // these are internal ITS language codes, not the browser supported ones
    {languageCode: "af", languageDescription: "Afrikaans", translations_available : true},
    {languageCode: "ar", languageDescription: "Arabic", translations_available : true},
    {languageCode: "bn", languageDescription: "Bangla", translations_available : true},
    {languageCode: "bs", languageDescription: "Bosnian (Latin)", translations_available : true},
    {languageCode: "bg", languageDescription: "Bulgarian", translations_available : true},
    {languageCode: "yue", languageDescription: "Cantonese (Traditional)", translations_available : false},
    {languageCode: "ca", languageDescription: "Catalan", translations_available : true},
    {languageCode: "zh", languageDescription: "Chinese Simplified", translations_available : true},
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
    {languageCode: "sr-cyrl", languageDescription: "Serbian (Cyrillic)", translations_available : false},
    {languageCode: "sr-latn", languageDescription: "Serbian (Latin)", translations_available : true},
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
    {languageCode: "zh", ITSlanguageCode: "zh"},
    {languageCode: "zu", ITSlanguageCode: "en"}
];

var ITSCurrencyCode = [
    {currencyCode: 'AED',currencyDescription:'United Arab Emirates dirham' },
    {currencyCode: 'AFN',currencyDescription:'Afghan afghani' },
    {currencyCode: 'ALL',currencyDescription:'Albanian lek' },
    {currencyCode: 'AMD',currencyDescription:'Armenian dram' },
    {currencyCode: 'ANG',currencyDescription:'Netherlands Antillean guilder' },
    {currencyCode: 'AOA',currencyDescription:'Angolan kwanza' },
    {currencyCode: 'ARS',currencyDescription:'Argentine peso' },
    {currencyCode: 'AUD',currencyDescription:'Australian dollar' },
    {currencyCode: 'AWG',currencyDescription:'Aruban florin' },
    {currencyCode: 'AZN',currencyDescription:'Azerbaijani manat' },
    {currencyCode: 'BAM',currencyDescription:'Bosnia and Herzegovina convertible mark' },
    {currencyCode: 'BBD',currencyDescription:'Barbados dollar' },
    {currencyCode: 'BDT',currencyDescription:'Bangladeshi taka' },
    {currencyCode: 'BGN',currencyDescription:'Bulgarian lev' },
    {currencyCode: 'BHD',currencyDescription:'Bahraini dinar' },
    {currencyCode: 'BIF',currencyDescription:'Burundian franc' },
    {currencyCode: 'BMD',currencyDescription:'Bermudian dollar' },
    {currencyCode: 'BND',currencyDescription:'Brunei dollar' },
    {currencyCode: 'BOB',currencyDescription:'Boliviano' },
    {currencyCode: 'BRL',currencyDescription:'Brazilian real' },
    {currencyCode: 'BSD',currencyDescription:'Bahamian dollar' },
    {currencyCode: 'BTN',currencyDescription:'Bhutanese ngultrum' },
    {currencyCode: 'BWP',currencyDescription:'Botswana pula' },
    {currencyCode: 'BYN',currencyDescription:'Belarusian ruble' },
    {currencyCode: 'BZD',currencyDescription:'Belize dollar' },
    {currencyCode: 'CAD',currencyDescription:'Canadian dollar' },
    {currencyCode: 'CDF',currencyDescription:'Congolese franc' },
    {currencyCode: 'CHF',currencyDescription:'Swiss franc' },
    {currencyCode: 'CLP',currencyDescription:'Chilean peso' },
    {currencyCode: 'CNY',currencyDescription:'Chinese yuan' },
    {currencyCode: 'COP',currencyDescription:'Colombian peso' },
    {currencyCode: 'CRC',currencyDescription:'Costa Rican colon' },
    {currencyCode: 'CUC',currencyDescription:'Cuban convertible peso' },
    {currencyCode: 'CUP',currencyDescription:'Cuban peso' },
    {currencyCode: 'CVE',currencyDescription:'Cape Verdean escudo' },
    {currencyCode: 'CZK',currencyDescription:'Czech koruna' },
    {currencyCode: 'DJF',currencyDescription:'Djiboutian franc' },
    {currencyCode: 'DKK',currencyDescription:'Danish krone' },
    {currencyCode: 'DOP',currencyDescription:'Dominican peso' },
    {currencyCode: 'DZD',currencyDescription:'Algerian dinar' },
    {currencyCode: 'EGP',currencyDescription:'Egyptian pound' },
    {currencyCode: 'ERN',currencyDescription:'Eritrean nakfa' },
    {currencyCode: 'ETB',currencyDescription:'Ethiopian birr' },
    {currencyCode: 'EUR',currencyDescription:'Euro' },
    {currencyCode: 'FJD',currencyDescription:'Fiji dollar' },
    {currencyCode: 'FKP',currencyDescription:'Falkland Islands pound' },
    {currencyCode: 'GBP',currencyDescription:'Pound sterling' },
    {currencyCode: 'GEL',currencyDescription:'Georgian lari' },
    {currencyCode: 'GHS',currencyDescription:'Ghanaian cedi' },
    {currencyCode: 'GIP',currencyDescription:'Gibraltar pound' },
    {currencyCode: 'GMD',currencyDescription:'Gambian dalasi' },
    {currencyCode: 'GNF',currencyDescription:'Guinean franc' },
    {currencyCode: 'GTQ',currencyDescription:'Guatemalan quetzal' },
    {currencyCode: 'GYD',currencyDescription:'Guyanese dollar' },
    {currencyCode: 'HKD',currencyDescription:'Hong Kong dollar' },
    {currencyCode: 'HNL',currencyDescription:'Honduran lempira' },
    {currencyCode: 'HRK',currencyDescription:'Croatian kuna' },
    {currencyCode: 'HTG',currencyDescription:'Haitian gourde' },
    {currencyCode: 'HUF',currencyDescription:'Hungarian forint' },
    {currencyCode: 'IDR',currencyDescription:'Indonesian rupiah' },
    {currencyCode: 'ILS',currencyDescription:'Israeli new shekel' },
    {currencyCode: 'INR',currencyDescription:'Indian rupee' },
    {currencyCode: 'IQD',currencyDescription:'Iraqi dinar' },
    {currencyCode: 'IRR',currencyDescription:'Iranian rial' },
    {currencyCode: 'ISK',currencyDescription:'Icelandic króna' },
    {currencyCode: 'JMD',currencyDescription:'Jamaican dollar' },
    {currencyCode: 'JOD',currencyDescription:'Jordanian dinar' },
    {currencyCode: 'JPY',currencyDescription:'Japanese yen' },
    {currencyCode: 'KES',currencyDescription:'Kenyan shilling' },
    {currencyCode: 'KGS',currencyDescription:'Kyrgyzstani som' },
    {currencyCode: 'KHR',currencyDescription:'Cambodian riel' },
    {currencyCode: 'KMF',currencyDescription:'Comoro franc' },
    {currencyCode: 'KPW',currencyDescription:'North Korean won' },
    {currencyCode: 'KRW',currencyDescription:'South Korean won' },
    {currencyCode: 'KWD',currencyDescription:'Kuwaiti dinar' },
    {currencyCode: 'KYD',currencyDescription:'Cayman Islands dollar' },
    {currencyCode: 'KZT',currencyDescription:'Kazakhstani tenge' },
    {currencyCode: 'LAK',currencyDescription:'Lao kip' },
    {currencyCode: 'LBP',currencyDescription:'Lebanese pound' },
    {currencyCode: 'LKR',currencyDescription:'Sri Lankan rupee' },
    {currencyCode: 'LRD',currencyDescription:'Liberian dollar' },
    {currencyCode: 'LSL',currencyDescription:'Lesotho loti' },
    {currencyCode: 'LYD',currencyDescription:'Libyan dinar' },
    {currencyCode: 'MAD',currencyDescription:'Moroccan dirham' },
    {currencyCode: 'MDL',currencyDescription:'Moldovan leu' },
    {currencyCode: 'MGA',currencyDescription:'Malagasy ariary' },
    {currencyCode: 'MKD',currencyDescription:'Macedonian denar' },
    {currencyCode: 'MMK',currencyDescription:'Myanmar kyat' },
    {currencyCode: 'MNT',currencyDescription:'Mongolian tögrög' },
    {currencyCode: 'MOP',currencyDescription:'Macanese pataca' },
    {currencyCode: 'MRU',currencyDescription:'Mauritanian ouguiya' },
    {currencyCode: 'MUR',currencyDescription:'Mauritian rupee' },
    {currencyCode: 'MVR',currencyDescription:'Maldivian rufiyaa' },
    {currencyCode: 'MWK',currencyDescription:'Malawian kwacha' },
    {currencyCode: 'MXN',currencyDescription:'Mexican peso' },
    {currencyCode: 'MYR',currencyDescription:'Malaysian ringgit' },
    {currencyCode: 'MZN',currencyDescription:'Mozambican metical' },
    {currencyCode: 'NAD',currencyDescription:'Namibian dollar' },
    {currencyCode: 'NGN',currencyDescription:'Nigerian naira' },
    {currencyCode: 'NIO',currencyDescription:'Nicaraguan córdoba' },
    {currencyCode: 'NOK',currencyDescription:'Norwegian krone' },
    {currencyCode: 'NPR',currencyDescription:'Nepalese rupee' },
    {currencyCode: 'NZD',currencyDescription:'New Zealand dollar' },
    {currencyCode: 'OMR',currencyDescription:'Omani rial' },
    {currencyCode: 'PAB',currencyDescription:'Panamanian balboa' },
    {currencyCode: 'PEN',currencyDescription:'Peruvian sol' },
    {currencyCode: 'PGK',currencyDescription:'Papua New Guinean kina' },
    {currencyCode: 'PHP',currencyDescription:'Philippine peso' },
    {currencyCode: 'PKR',currencyDescription:'Pakistani rupee' },
    {currencyCode: 'PLN',currencyDescription:'Polish złoty' },
    {currencyCode: 'PYG',currencyDescription:'Paraguayan guaraní' },
    {currencyCode: 'QAR',currencyDescription:'Qatari riyal' },
    {currencyCode: 'RON',currencyDescription:'Romanian leu' },
    {currencyCode: 'RSD',currencyDescription:'Serbian dinar' },
    {currencyCode: 'RUB',currencyDescription:'Russian ruble' },
    {currencyCode: 'RWF',currencyDescription:'Rwandan franc' },
    {currencyCode: 'SAR',currencyDescription:'Saudi riyal' },
    {currencyCode: 'SBD',currencyDescription:'Solomon Islands dollar' },
    {currencyCode: 'SCR',currencyDescription:'Seychelles rupee' },
    {currencyCode: 'SDG',currencyDescription:'Sudanese pound' },
    {currencyCode: 'SEK',currencyDescription:'Swedish krona/kronor' },
    {currencyCode: 'SGD',currencyDescription:'Singapore dollar' },
    {currencyCode: 'SHP',currencyDescription:'Saint Helena pound' },
    {currencyCode: 'SLL',currencyDescription:'Sierra Leonean leone' },
    {currencyCode: 'SOS',currencyDescription:'Somali shilling' },
    {currencyCode: 'SRD',currencyDescription:'Surinamese dollar' },
    {currencyCode: 'SSP',currencyDescription:'South Sudanese pound' },
    {currencyCode: 'STN',currencyDescription:'São Tomé and Príncipe dobra' },
    {currencyCode: 'SVC',currencyDescription:'Salvadoran colón' },
    {currencyCode: 'SYP',currencyDescription:'Syrian pound' },
    {currencyCode: 'SZL',currencyDescription:'Swazi lilangeni' },
    {currencyCode: 'THB',currencyDescription:'Thai baht' },
    {currencyCode: 'TJS',currencyDescription:'Tajikistani somoni' },
    {currencyCode: 'TMT',currencyDescription:'Turkmenistan manat' },
    {currencyCode: 'TND',currencyDescription:'Tunisian dinar' },
    {currencyCode: 'TOP',currencyDescription:'Tongan paʻanga' },
    {currencyCode: 'TRY',currencyDescription:'Turkish lira' },
    {currencyCode: 'TTD',currencyDescription:'Trinidad and Tobago dollar' },
    {currencyCode: 'TWD',currencyDescription:'New Taiwan dollar' },
    {currencyCode: 'TZS',currencyDescription:'Tanzanian shilling' },
    {currencyCode: 'UAH',currencyDescription:'Ukrainian hryvnia' },
    {currencyCode: 'UGX',currencyDescription:'Ugandan shilling' },
    {currencyCode: 'USD',currencyDescription:'United States dollar' },
    {currencyCode: 'UYU',currencyDescription:'Uruguayan peso' },
    {currencyCode: 'UZS',currencyDescription:'Uzbekistan som' },
    {currencyCode: 'VES',currencyDescription:'Venezuelan bolívar soberano' },
    {currencyCode: 'VND',currencyDescription:'Vietnamese đồng' },
    {currencyCode: 'VUV',currencyDescription:'Vanuatu vatu' },
    {currencyCode: 'WST',currencyDescription:'Samoan tala' },
    {currencyCode: 'YER',currencyDescription:'Yemeni rial' },
    {currencyCode: 'ZAR',currencyDescription:'South African rand' },
    {currencyCode: 'ZMW',currencyDescription:'Zambian kwacha' },
    {currencyCode: 'ZWL',currencyDescription:'Zimbabwean dollar' }
];

var ITSCountryList = [
    {countryName: 'Afghanistan',countryCode:'AFG' },
    {countryName: 'Åland Islands',countryCode:'ALA' },
    {countryName: 'Albania',countryCode:'ALB' },
    {countryName: 'Algeria',countryCode:'DZA' },
    {countryName: 'American Samoa',countryCode:'ASM' },
    {countryName: 'Andorra',countryCode:'AND' },
    {countryName: 'Angola',countryCode:'AGO' },
    {countryName: 'Anguilla',countryCode:'AIA' },
    {countryName: 'Antarctica',countryCode:'ATA' },
    {countryName: 'Antigua and Barbuda',countryCode:'ATG' },
    {countryName: 'Argentina',countryCode:'ARG' },
    {countryName: 'Armenia',countryCode:'ARM' },
    {countryName: 'Aruba',countryCode:'ABW' },
    {countryName: 'Australia',countryCode:'AUS' },
    {countryName: 'Austria',countryCode:'AUT' },
    {countryName: 'Azerbaijan',countryCode:'AZE' },
    {countryName: 'Bahamas',countryCode:'BHS' },
    {countryName: 'Bahrain',countryCode:'BHR' },
    {countryName: 'Bangladesh',countryCode:'BGD' },
    {countryName: 'Barbados',countryCode:'BRB' },
    {countryName: 'Belarus',countryCode:'BLR' },
    {countryName: 'Belgium',countryCode:'BEL' },
    {countryName: 'Belize',countryCode:'BLZ' },
    {countryName: 'Benin',countryCode:'BEN' },
    {countryName: 'Bermuda',countryCode:'BMU' },
    {countryName: 'Bhutan',countryCode:'BTN' },
    {countryName: 'Bolivia',countryCode:'BOL' },
    {countryName: 'Bonaire',countryCode:'BES' },
    {countryName: 'Bosnia and Herzegovina',countryCode:'BIH' },
    {countryName: 'Botswana',countryCode:'BWA' },
    {countryName: 'Bouvet Island',countryCode:'BVT' },
    {countryName: 'Brazil',countryCode:'BRA' },
    {countryName: 'British Indian Ocean Territory',countryCode:'IOT' },
    {countryName: 'Brunei Darussalam',countryCode:'BRN' },
    {countryName: 'Bulgaria',countryCode:'BGR' },
    {countryName: 'Burkina Faso',countryCode:'BFA' },
    {countryName: 'Burundi',countryCode:'BDI' },
    {countryName: 'Cabo Verde',countryCode:'CPV' },
    {countryName: 'Cambodia',countryCode:'KHM' },
    {countryName: 'Cameroon',countryCode:'CMR' },
    {countryName: 'Canada',countryCode:'CAN' },
    {countryName: 'Cayman Islands',countryCode:'CYM' },
    {countryName: 'Central African Republic',countryCode:'CAF' },
    {countryName: 'Chad',countryCode:'TCD' },
    {countryName: 'Chile',countryCode:'CHL' },
    {countryName: 'China',countryCode:'CHN' },
    {countryName: 'Christmas Island',countryCode:'CXR' },
    {countryName: 'Cocos (Keeling) Islands',countryCode:'CCK' },
    {countryName: 'Colombia',countryCode:'COL' },
    {countryName: 'Comoros',countryCode:'COM' },
    {countryName: 'Congo (the Democratic Republic of the)',countryCode:'COD' },
    {countryName: 'Congo',countryCode:'COG' },
    {countryName: 'Cook Islands',countryCode:'COK' },
    {countryName: 'Costa Rica',countryCode:'CRI' },
    {countryName: 'Côte d\'Ivoire',countryCode:'CIV' },
    {countryName: 'Croatia',countryCode:'HRV' },
    {countryName: 'Cuba',countryCode:'CUB' },
    {countryName: 'Curaçao',countryCode:'CUW' },
    {countryName: 'Cyprus',countryCode:'CYP' },
    {countryName: 'Czechia',countryCode:'CZE' },
    {countryName: 'Denmark',countryCode:'DNK' },
    {countryName: 'Djibouti',countryCode:'DJI' },
    {countryName: 'Dominica',countryCode:'DMA' },
    {countryName: 'Dominican Republic',countryCode:'DOM' },
    {countryName: 'Ecuador',countryCode:'ECU' },
    {countryName: 'Egypt',countryCode:'EGY' },
    {countryName: 'El Salvador',countryCode:'SLV' },
    {countryName: 'Equatorial Guinea',countryCode:'GNQ' },
    {countryName: 'Eritrea',countryCode:'ERI' },
    {countryName: 'Estonia',countryCode:'EST' },
    {countryName: 'Eswatini',countryCode:'SWZ' },
    {countryName: 'Ethiopia',countryCode:'ETH' },
    {countryName: 'Falkland Islands',countryCode:'FLK' },
    {countryName: 'Faroe Islands',countryCode:'FRO' },
    {countryName: 'Fiji',countryCode:'FJI' },
    {countryName: 'Finland',countryCode:'FIN' },
    {countryName: 'France',countryCode:'FRA' },
    {countryName: 'French Guiana',countryCode:'GUF' },
    {countryName: 'French Polynesia',countryCode:'PYF' },
    {countryName: 'French Southern Territories',countryCode:'ATF' },
    {countryName: 'Gabon',countryCode:'GAB' },
    {countryName: 'Gambia',countryCode:'GMB' },
    {countryName: 'Georgia',countryCode:'GEO' },
    {countryName: 'Germany',countryCode:'DEU' },
    {countryName: 'Ghana',countryCode:'GHA' },
    {countryName: 'Gibraltar',countryCode:'GIB' },
    {countryName: 'Greece',countryCode:'GRC' },
    {countryName: 'Greenland',countryCode:'GRL' },
    {countryName: 'Grenada',countryCode:'GRD' },
    {countryName: 'Guadeloupe',countryCode:'GLP' },
    {countryName: 'Guam',countryCode:'GUM' },
    {countryName: 'Guatemala',countryCode:'GTM' },
    {countryName: 'Guernsey',countryCode:'GGY' },
    {countryName: 'Guinea',countryCode:'GIN' },
    {countryName: 'Guinea-Bissau',countryCode:'GNB' },
    {countryName: 'Guyana',countryCode:'GUY' },
    {countryName: 'Haiti',countryCode:'HTI' },
    {countryName: 'Heard Island and McDonald Islands',countryCode:'HMD' },
    {countryName: 'Holy See',countryCode:'VAT' },
    {countryName: 'Honduras',countryCode:'HND' },
    {countryName: 'Hong Kong',countryCode:'HKG' },
    {countryName: 'Hungary',countryCode:'HUN' },
    {countryName: 'Iceland',countryCode:'ISL' },
    {countryName: 'India',countryCode:'IND' },
    {countryName: 'Indonesia',countryCode:'IDN' },
    {countryName: 'Iran',countryCode:'IRN' },
    {countryName: 'Iraq',countryCode:'IRQ' },
    {countryName: 'Ireland',countryCode:'IRL' },
    {countryName: 'Isle of Man',countryCode:'IMN' },
    {countryName: 'Israel',countryCode:'ISR' },
    {countryName: 'Italy',countryCode:'ITA' },
    {countryName: 'Jamaica',countryCode:'JAM' },
    {countryName: 'Japan',countryCode:'JPN' },
    {countryName: 'Jersey',countryCode:'JEY' },
    {countryName: 'Jordan',countryCode:'JOR' },
    {countryName: 'Kazakhstan',countryCode:'KAZ' },
    {countryName: 'Kenya',countryCode:'KEN' },
    {countryName: 'Kiribati',countryCode:'KIR' },
    {countryName: 'Korea (the Democratic People\'s Republic of)',countryCode:'PRK' },
    {countryName: 'Korea (the Republic of)',countryCode:'KOR' },
    {countryName: 'Kuwait',countryCode:'KWT' },
    {countryName: 'Kyrgyzstan',countryCode:'KGZ' },
    {countryName: 'Lao People\'s Democratic Republic',countryCode:'LAO' },
    {countryName: 'Latvia',countryCode:'LVA' },
    {countryName: 'Lebanon',countryCode:'LBN' },
    {countryName: 'Lesotho',countryCode:'LSO' },
    {countryName: 'Liberia',countryCode:'LBR' },
    {countryName: 'Libya',countryCode:'LBY' },
    {countryName: 'Liechtenstein',countryCode:'LIE' },
    {countryName: 'Lithuania',countryCode:'LTU' },
    {countryName: 'Luxembourg',countryCode:'LUX' },
    {countryName: 'Macao',countryCode:'MAC' },
    {countryName: 'Madagascar',countryCode:'MDG' },
    {countryName: 'Malawi',countryCode:'MWI' },
    {countryName: 'Malaysia',countryCode:'MYS' },
    {countryName: 'Maldives',countryCode:'MDV' },
    {countryName: 'Mali',countryCode:'MLI' },
    {countryName: 'Malta',countryCode:'MLT' },
    {countryName: 'Marshall Islands',countryCode:'MHL' },
    {countryName: 'Martinique',countryCode:'MTQ' },
    {countryName: 'Mauritania',countryCode:'MRT' },
    {countryName: 'Mauritius',countryCode:'MUS' },
    {countryName: 'Mayotte',countryCode:'MYT' },
    {countryName: 'Mexico',countryCode:'MEX' },
    {countryName: 'Micronesia',countryCode:'FSM' },
    {countryName: 'Moldova',countryCode:'MDA' },
    {countryName: 'Monaco',countryCode:'MCO' },
    {countryName: 'Mongolia',countryCode:'MNG' },
    {countryName: 'Montenegro',countryCode:'MNE' },
    {countryName: 'Montserrat',countryCode:'MSR' },
    {countryName: 'Morocco',countryCode:'MAR' },
    {countryName: 'Mozambique',countryCode:'MOZ' },
    {countryName: 'Myanmar',countryCode:'MMR' },
    {countryName: 'Namibia',countryCode:'NAM' },
    {countryName: 'Nauru',countryCode:'NRU' },
    {countryName: 'Nepal',countryCode:'NPL' },
    {countryName: 'Netherlands',countryCode:'NLD' },
    {countryName: 'New Caledonia',countryCode:'NCL' },
    {countryName: 'New Zealand',countryCode:'NZL' },
    {countryName: 'Nicaragua',countryCode:'NIC' },
    {countryName: 'Niger',countryCode:'NER' },
    {countryName: 'Nigeria',countryCode:'NGA' },
    {countryName: 'Niue',countryCode:'NIU' },
    {countryName: 'Norfolk Island',countryCode:'NFK' },
    {countryName: 'North Macedonia',countryCode:'MKD' },
    {countryName: 'Northern Mariana Islands',countryCode:'MNP' },
    {countryName: 'Norway',countryCode:'NOR' },
    {countryName: 'Oman',countryCode:'OMN' },
    {countryName: 'Pakistan',countryCode:'PAK' },
    {countryName: 'Palau',countryCode:'PLW' },
    {countryName: 'Palestine, State of',countryCode:'PSE' },
    {countryName: 'Panama',countryCode:'PAN' },
    {countryName: 'Papua New Guinea',countryCode:'PNG' },
    {countryName: 'Paraguay',countryCode:'PRY' },
    {countryName: 'Peru',countryCode:'PER' },
    {countryName: 'Philippines ',countryCode:'PHL' },
    {countryName: 'Pitcairn',countryCode:'PCN' },
    {countryName: 'Poland',countryCode:'POL' },
    {countryName: 'Portugal',countryCode:'PRT' },
    {countryName: 'Puerto Rico',countryCode:'PRI' },
    {countryName: 'Qatar',countryCode:'QAT' },
    {countryName: 'Réunion',countryCode:'REU' },
    {countryName: 'Romania',countryCode:'ROU' },
    {countryName: 'Russian Federation',countryCode:'RUS' },
    {countryName: 'Rwanda',countryCode:'RWA' },
    {countryName: 'Saint Barthélemy',countryCode:'BLM' },
    {countryName: 'Saint Helena',countryCode:'SHN' },
    {countryName: 'Saint Kitts and Nevis',countryCode:'KNA' },
    {countryName: 'Saint Lucia',countryCode:'LCA' },
    {countryName: 'Saint Martin (French part)',countryCode:'MAF' },
    {countryName: 'Saint Pierre and Miquelon',countryCode:'SPM' },
    {countryName: 'Saint Vincent and the Grenadines',countryCode:'VCT' },
    {countryName: 'Samoa',countryCode:'WSM' },
    {countryName: 'San Marino',countryCode:'SMR' },
    {countryName: 'Sao Tome and Principe',countryCode:'STP' },
    {countryName: 'Saudi Arabia',countryCode:'SAU' },
    {countryName: 'Senegal',countryCode:'SEN' },
    {countryName: 'Serbia',countryCode:'SRB' },
    {countryName: 'Seychelles',countryCode:'SYC' },
    {countryName: 'Sierra Leone',countryCode:'SLE' },
    {countryName: 'Singapore',countryCode:'SGP' },
    {countryName: 'Sint Maarten (Dutch part)',countryCode:'SXM' },
    {countryName: 'Slovakia',countryCode:'SVK' },
    {countryName: 'Slovenia',countryCode:'SVN' },
    {countryName: 'Solomon Islands',countryCode:'SLB' },
    {countryName: 'Somalia',countryCode:'SOM' },
    {countryName: 'South Africa',countryCode:'ZAF' },
    {countryName: 'South Georgia and the South Sandwich Islands',countryCode:'SGS' },
    {countryName: 'South Sudan',countryCode:'SSD' },
    {countryName: 'Spain',countryCode:'ESP' },
    {countryName: 'Sri Lanka',countryCode:'LKA' },
    {countryName: 'Sudan ',countryCode:'SDN' },
    {countryName: 'Suriname',countryCode:'SUR' },
    {countryName: 'Svalbard',countryCode:'SJM' },
    {countryName: 'Sweden',countryCode:'SWE' },
    {countryName: 'Switzerland',countryCode:'CHE' },
    {countryName: 'Syrian Arab Republic ',countryCode:'SYR' },
    {countryName: 'Taiwan (Province of China)',countryCode:'TWN' },
    {countryName: 'Tajikistan',countryCode:'TJK' },
    {countryName: 'Tanzania, the United Republic of',countryCode:'TZA' },
    {countryName: 'Thailand',countryCode:'THA' },
    {countryName: 'Timor-Leste',countryCode:'TLS' },
    {countryName: 'Togo',countryCode:'TGO' },
    {countryName: 'Tokelau',countryCode:'TKL' },
    {countryName: 'Tonga',countryCode:'TON' },
    {countryName: 'Trinidad and Tobago',countryCode:'TTO' },
    {countryName: 'Tunisia',countryCode:'TUN' },
    {countryName: 'Turkey',countryCode:'TUR' },
    {countryName: 'Turkmenistan',countryCode:'TKM' },
    {countryName: 'Turks and Caicos Islands ',countryCode:'TCA' },
    {countryName: 'Tuvalu',countryCode:'TUV' },
    {countryName: 'Uganda',countryCode:'UGA' },
    {countryName: 'Ukraine',countryCode:'UKR' },
    {countryName: 'United Arab Emirates',countryCode:'ARE' },
    {countryName: 'United Kingdom of Great Britain and Northern Ireland',countryCode:'GBR' },
    {countryName: 'United States Minor Outlying Islands',countryCode:'UMI' },
    {countryName: 'United States of America',countryCode:'USA' },
    {countryName: 'Uruguay',countryCode:'URY' },
    {countryName: 'Uzbekistan',countryCode:'UZB' },
    {countryName: 'Vanuatu',countryCode:'VUT' },
    {countryName: 'Venezuela',countryCode:'VEN' },
    {countryName: 'Viet Nam',countryCode:'VNM' },
    {countryName: 'Virgin Islands (British)',countryCode:'VGB' },
    {countryName: 'Virgin Islands (U.S.)',countryCode:'VIR' },
    {countryName: 'Wallis and Futuna',countryCode:'WLF' },
    {countryName: 'Western Sahara',countryCode:'ESH' },
    {countryName: 'Yemen',countryCode:'YEM' },
    {countryName: 'Zambia',countryCode:'ZMB' },
    {countryName: 'Zimbabwe',countryCode:'ZWE' }
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

ITSTranslator.prototype.load = function (afterLoad) {
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
    this.loadAvailableTranslations(afterLoad);
};

ITSTranslator.prototype.loadAvailableTranslations = function (onSuccess, onError) {
    this.availableTranslations = [];
    if (onSuccess) { this.availableTranslationsOnSuccess = onSuccess; }
    if (onError) { this.availableTranslationsOnError = onError; }

    if (!this.availableTranslationsLoading) {
        this.availableTranslationsLoading = true;
        var transFile = ITSInstance.baseURLAPI + 'translations';
        $.ajax({
            url: transFile,
            type: 'GET',
            headers: { 'BrowserID': ITSInstance.BrowserID},
            success: function (data) {
                this.availableTranslations = data;
                this.availableTranslationsLoading = false;
                if (this.availableTranslationsOnSuccess) {
                    this.availableTranslationsOnSuccess();
                }
                ITSInstance.MessageBus.publishMessage("Translations.AvailableTranslationsLoaded","");
            }.bind(this),
            error: function (xhr) {
                ITSLogger.logMessage(logLevel.ERROR,"Error loading available translations : " + xhr.status + ": " + xhr.statusText);
                this.availableTranslationsLoading = false;
                if (this.availableTranslationsOnError) {
                    this.availableTranslationsOnError();
                }
            }.bind(this)
        });
    } else {
        if (onSuccess) { onSuccess(); }
    }
};

ITSTranslator.prototype.storeCurrentLanguageInCookie = function () {
    // set language preference cookie for this session
    cookieHelper.setCookie('ITRLanguage',ITSLanguage,600);
};

ITSTranslator.prototype.switchLanguage = function (langCode, postLoadFunction) {
    if (this.loadingLanguage) {
        if (langCode != this.currentTranslatedLanguage) {
            setTimeout(this.switchLanguage.bind(this, langCode, postLoadFunction), 500);
        }
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
            ITSLogger.logMessage(logLevel.INFO,'Loading translation ' + transFile);
            ITSLanguage = langCode;
            this.postLoadFunction = postLoadFunction;

            $.ajax({
                    url: transFile,
                    type: 'GET',
                    headers: { 'BrowserID': ITSInstance.BrowserID},
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
                        ITSInstance.MessageBus.publishMessage("Translations.LanguageSwitched",this.currentTranslatedLanguage);
                    }.bind(this),
                    error: function (xhr) {
                        this.loadingLanguage = false;
                        ITSLogger.logMessage(logLevel.ERROR,"Error loading translations : " + xhr.status + ": " + xhr.statusText);
                        this.languageFileLoaded = true;
                        for (var i = 0; i < this.divsToTranslate.length; i++) {
                            this.translateDiv(this.divsToTranslate[i]);
                        }
                    }.bind(this)
                }
            )
        } else {
            this.switchToEnglish();
            if (postLoadFunction) postLoadFunction();
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

ITSTranslator.prototype.retranslateInterface = function () {
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
                this.toTranslate.some(function (elem) {
                    return elem.id == indexID;
                });

                if ((!this.toTranslate.some(function (elem) { return elem.id == indexID;})) && (originalString != "")) {
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

ITSTranslator.prototype.translateDiv = function (divId, showLog, skipDivRegistration) {
    if (typeof skipDivRegistration == "undefined") {
        if (this.divsToTranslate.indexOf(divId) < 0) this.divsToTranslate.push(divId);
    }
    if ((this.languageFileLoaded) || (ITSLanguage=="en")) {
        // translate this div
        var tN, tId;
        var self = this;
        $(divId + ' *').children().each(function () {
            if (showLog) ITSLogger.logMessage(logLevel.INFO,this.tagName);
            if (this.tagName) {
                tN = this.tagName.toUpperCase();
                tId = this.id.toUpperCase();
                // if this child has the Translate tag then skip else translate
                if (((!this.hasAttribute("NoTranslate")) || (!this.hasAttribute("notranslate"))) && (this.id != "") && (tN != 'DIV') && (tId.indexOf('MCEU_') == -1) && (tId.indexOf('ACE-') == -1) && (tN != 'TEXTAREA-HTMLEDIT') && (tN != 'I') && (tN != 'B') && (tN != 'A') && (tN != 'TEXTAREA') && (tN != 'TBODY') && (tN != 'TABLE')) {
                    var transStr = divId + "." + this.id;
                    if (self.translatedStrings[transStr] == undefined) transStr = this.id; // try with just the id
                    if (showLog) ITSLogger.logMessage(logLevel.INFO,transStr);
                    if (self.translatedStrings[transStr] != undefined) {
                        if (this.placeholder != undefined) {
                            this.placeholder = self.translate(transStr, this.placeholder);
                            if (showLog) ITSLogger.logMessage(logLevel.INFO,this.placeholder);
                        }
                        else if (this.text != undefined) {
                            this.text = self.translate(transStr, this.text);
                            if (showLog) ITSLogger.logMessage(logLevel.INFO,this.text);
                        }
                        else if (this.innerHTML != undefined) {
                            this.innerHTML = self.translate(transStr, this.innerHTML);
                            if (showLog) ITSLogger.logMessage(logLevel.INFO,this.innerHTML);
                        }
                        else if (this.val != undefined) {
                            this.val = self.translate(transStr, this.val);
                            if (showLog) ITSLogger.logMessage(logLevel.INFO,this.val);
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
                                if (showLog) ITSLogger.logMessage(logLevel.INFO,transStr + ' ignored for translation');
                            } else {
                                if (tempObj.value != "") {
                                    if (!self.toTranslate.some(function (elem) {
                                        return elem.id == transStr;
                                    })) self.toTranslate.push(tempObj);
                                }
                                if (showLog) ITSLogger.logMessage(logLevel.INFO,transStr + ' not present');
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
    var tempVal = JSON.stringify(newStrings, null, 1);
    //ITSLogger.logMessage(logLevel.ERROR,tempVal);
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
            if (to_translate.trim().length > 3) {
                ITSLogger.logMessage(logLevel.INFO,'New translations found for the current language. Posting for machine translation : ' + to_translate);
                ITSInstance.genericAjaxUpdate('translations/' + tempLangCode, to_translate, function () {
                    },
                    function () {
                    });
            }
            this.toTranslate = []; // do not post twice
        }
    } else {
        //ITSLogger.logMessage(logLevel.ERROR,'PLEASE NOTE : new translations can only be successfully posted when logged is as master user or translator.');
    }
};

ITSTranslator.prototype.postNewTranslationsNoPars  = function () {
    this.postNewTranslations();
};

ITSTranslator.prototype.postFullTranslations = function (langCode) {
    ITSLogger.logMessage(logLevel.ERROR,'PLEASE NOTE : new translations can only be successfully posted when logged is as master user or translator.');
    var to_translate =  JSON.stringify(this.originalStrings);
    var tempLangCode = this.currentTranslatedLanguage;
    if (langCode) {
        langCode = langCode.toLowerCase();
        tempLangCode = langCode;
        ITSInstance.genericAjaxUpdate('translations/' + tempLangCode, to_translate, function () {}, function () {})
    }
};

