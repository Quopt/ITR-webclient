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
// Initialize the default variables and load all the javascript files required for the ITS application
// all scripts are loaded deferred so the user can login while the scripts are loading

var ITSJavaScriptVersion="ITSScript"; // the required sub folder where the javascript and plugins are loaded from
// this is the base path to the application on the server. Many paths are linked to this path in javascript for security reasons (same site policy)
var configBaseURL = "https://" + document.location.host;
if (document.location.host.indexOf("localhost") == 0) configBaseURL = "http://localhost:443";
var CopyrightString = ""; // this copyright line is shown by default. You will need to claim copyright of the pages server for your customers protection (copyright laws ... sigh)
var CompanyName = ""; // this is the default company name
var DebugMode=false;
