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

// the bootstrap loads all DataModel and Support files
// support files
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Support/ITSTranslate.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Support/ITSHelpers.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Support/ITS_UI.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Support/ITSControllers.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/Support/ITSMessageBus.js'><\/script>");

// datamodel files
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSCompanies.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSTest.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSBattery.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSUsers.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSCreditUsages.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSCandidate.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSCandidateSession.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSScript.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSScreenTemplates.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSGraph.js'><\/script>");
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/DataModel/ITSReport.js'><\/script>");

// only javascript file that is loaded deferred to start the initialisation process, otherwise all else will fail
document.write("<script type='text/javascript' src='" + ITSJavaScriptVersion + "/ITSInit.js' defer><\/script>");
