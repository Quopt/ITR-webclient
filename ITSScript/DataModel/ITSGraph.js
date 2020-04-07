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

function ITSGraph() {
    this.ID = newGuid();

    this.Name = ""; // The name of the graph. Only allow letters, digits and underscore.
    this.Remarks = "";
    this.Type = "horizontalBar"; //The type of graph to generate radar|Radar,bar|Bar,horizontalBar|Horizontal bar,doughnut|Doughnut,pie|Pie,line|Line,polarArea|Polar
    this.Axis_min_value = 0; //The minimum value the graph is initialised with
    this.Axis_max_value = 100; //The maximum value the graph is initialised with
    this.Show_legend = false; // Show the legend in the graph
    this.Pre_graph_script = ""; // script run before the graph is shown
    this.Series_labels = ""; //A comma seperated list of label names
    this.Stacked = false; // stack the values in the group
    this.Height = "200px"; // height of the graph
    this.Width = "200px"; // width of the graph
    this.DefaultFontSize = 16;

    this.persistentProperties = '*ALL*';
    this._objectType = "ITSGraph";
};

function generateGraph (graphGuid, id, num_blocks, test_mode, template_values, context, animate) {
    var elementID = 'ITSGraph_canvas' +id;

    if (typeof(template_values) == "string") {
        var tempObject = JSON.parse(template_values);
        template_values = {};
        shallowCopy(tempObject, template_values);
    }

    var animationDuration = 2000;
    if (! animate) animationDuration = 0;

    $('<canvas>').attr({
        id: elementID
    }).css({
        width: template_values["Width"],
        height:  template_values["Height"]
    }).appendTo('#'+id);
    var canvas = document.getElementById(elementID);
    var ctx = canvas.getContext('2d');

    if (template_values["Pre_graph_script"] != "") {
        var tempScript = envSubstitute(template_values["Pre_graph_script"], context,true);
        try { eval(tempScript); } catch(err) { ITSLogger.logMessage(logLevel.ERROR,'Pre script on graph failed : ' + err.message); }
    }

    var dsets=[];
    var dsetpostfix = "";
    var start =0;
    var end =0;
    var increment =0;
    for (var i=1; i<=template_values["RepeatBlockCount"]; i++){
        var dsetentry = {};
        if (i>1) dsetpostfix = "_"+i;
        dsetentry["label"] = envSubstitute( template_values["Series_name"+dsetpostfix] ,context,true);
        dsetentry["stack"] = envSubstitute( template_values["StackGroup"+dsetpostfix] ,context,true);
        dsetentry["data"] = envSubstitute( template_values["Series_data"+dsetpostfix]  ,context,true).split(",");
        dsetentry["backgroundColor"] = [];
        dsetentry["backgroundColor"].length = dsetentry["data"].length;
        dsetentry["borderColor"] = [];
        dsetentry["borderColor"].length = dsetentry["data"].length;
        dsetentry["pointBackgroundColor"] = [];
        dsetentry["pointBackgroundColor"].length = dsetentry["data"].length;
        dsetentry["pointBorderColor"] = [];
        dsetentry["pointBorderColor"].length = dsetentry["data"].length;
        dsetentry["pointBorderColor"].fill("#"+ envSubstitute( template_values["Series_color_start"+dsetpostfix] ,context,true));
        dsetentry["borderColor"].fill("#"+ envSubstitute( template_values["Series_color_start"+dsetpostfix] ,context,true));
        dsetentry["fill"] =  envSubstitute( template_values["Series_fill"+dsetpostfix] ,context,true) == "T";

        // Series_line_show Series_line_curve  Series_point_type
        dsetentry["showLine"] = true;
        dsetentry["steppedLine"] = false;
        dsetentry["pointStyle"] = 'circle';
        dsetentry["pointRadius"] = 5;
        dsetentry["pointHoverRadius"] = 6;
        dsetentry["lineTension"] = 0.4;
        try {
            if (template_values["Series_point_size"+dsetpostfix]) {
                dsetentry["pointRadius"] = parseInt(envSubstitute(template_values["Series_point_size" + dsetpostfix], context, true));
                dsetentry["pointHoverRadius"] = parseInt(envSubstitute(template_values["Series_point_size" + dsetpostfix], context, true)) + 1;
            }
        } catch(err) {};
        try { if (template_values["Series_point_type"+dsetpostfix]!="") dsetentry["pointStyle"] = template_values["Series_point_type"+dsetpostfix]; } catch(err) {};
        try { if (template_values["Series_line_tension"+dsetpostfix]!="") dsetentry["lineTension"] = template_values["Series_line_tension"+dsetpostfix]; } catch(err) {};
        try { if (template_values["Series_line_show"+dsetpostfix]) dsetentry["showLine"] = template_values["Series_line_show"+dsetpostfix] == "T"; } catch(err) {};
        try { if (template_values["Series_line_curve"+dsetpostfix]) dsetentry["steppedLine"] = template_values["Series_line_curve"+dsetpostfix] == "T"; } catch(err) {};

        start = RGBstringToNumber( envSubstitute( template_values["Series_color_start"+dsetpostfix] ,context,true));
        end = RGBstringToNumber( envSubstitute( template_values["Series_color_end"+dsetpostfix] ,context,true));
        increment = (end - start) / (dsetentry["data"].length-1);
        for (var j=0; j < dsetentry["data"].length; j++ ){
            dsetentry["backgroundColor"][j] = "#" + RGBnumberToColour(start);
            dsetentry["pointBackgroundColor"][j] = "#" + RGBnumberToColour(start);
            start = start + increment;
        }

        dsetentry["pointBorderWidth"] = 1;
        dsetentry["BorderWidth"] = 2;
        if (template_values["Series_type"+dsetpostfix] != "") dsetentry["type"] = template_values["Series_type"+dsetpostfix];
        dsets.push(dsetentry);
    }


    var tempLabels = envSubstitute(template_values["Series_labels"], context,true);
    var tempMinVal = envSubstitute(template_values["Axis_min_value"], context,true);
    var tempMaxVal = envSubstitute(template_values["Axis_max_value"], context,true);

    Chart.scaleService.updateScaleDefaults('linear', {
        ticks: {
            min: tempMinVal,
            max: tempMaxVal
        }
    });
    Chart.defaults.global.defaultFontSize = parseInt(template_values["DefaultFontSize"]);
    Chart.defaults.global.animation.duration = animationDuration;

    if (template_values["Stacked"] == "T") {
        var myChart = new Chart(ctx, {
            type: template_values["Type"],
            data: {
                labels: tempLabels.split(","),
                datasets: dsets
            },
            options: {
                scales: {
                    xAxes: [{
                        stacked: (template_values["Stacked"] == "T")
                    }],
                    yAxes: [{
                        stacked: (template_values["Stacked"] == "T")
                    }]
                },
                legend: {
                    display: (template_values["Show_legend"] == "T")
                }
            }
        });
    } else {
        var myChart = new Chart(ctx, {
            type: template_values["Type"],
            data: {
                labels: tempLabels.split(","),
                datasets: dsets
            },
            options: {
                legend: {
                    display: (template_values["Show_legend"] == "T")
                }
            }
        });
    }

    return myChart;
};

ITSGraph.prototype.showGraph = function (id, context, animate) {
    return generateGraph(this.ID, id, -1, false, ITSJSONStringify(this), context, animate);
};

ITSGraph.prototype.generateGraphImage = function (textToScan, context) {
    // check if textToScan contains graph images to replace
    var textToLookFor = 'src="%%graph/'  + this.Name + '.png%%"';
    if (textToScan.indexOf(textToLookFor) >= 0) {
        var tempID = "ITSGraphGenerateGraphImage";
        if ($('#' + tempID).length == 0) {
            $(document.body).append('<div id="' + tempID + '" style="visibility: hidden"></div>');
        }
        var myChart = this.showGraph(tempID, context, false);
        var url_base64 = document.getElementById('ITSGraph_canvas' + tempID).toDataURL('image/png');
        var newSrc = 'src="'+url_base64+'"' ;
        var re = new RegExp(textToLookFor,"g");
        textToScan = textToScan.replace( re , newSrc);
        $("div").remove(tempID);
    }

    var textToLookFor = '%%graph.'  + this.Name + '%%';
    if (textToScan.indexOf(textToLookFor) >= 0) {
        var tempID = "ITSGraphGenerateGraphImage";
        if ($('#' + tempID).length == 0) {
            $(document.body).append('<div id="' + tempID + '" style="visibility: hidden"></div>');
        }
        var myChart = this.showGraph(tempID, context, false);
        var url_base64 = document.getElementById('ITSGraph_canvas' + tempID).toDataURL('image/png');
        var newSrc = '<img internal-blob style="background-color:white;" height="'+ this.Height +'" width="'+ this.Width + '" src="'+url_base64+'" alt="..." />' ;
        var re = new RegExp(textToLookFor,"g");
        textToScan = textToScan.replace( re , newSrc);
        $("div").remove(tempID);
    }

    return textToScan;
};

ITSGraph_editTemplate = {
    "_objectType": "ITSScreenTemplate",
    "ID": "b234d12a-fd5d-40c6-9ca0-fd36d44cec01",
    "Description": "Graph",
    "Explanation": "",
    "Remarks": "",
    "persistentProperties": "*ALL*",
    "TemplateVariables": [
//        {
//        "_objectType": "ITSScreenTemplateVariable",
//        "ID": "2206e25c-4d9f-4c2c-00b2-c3dbf91a6035",
//        "variableName": "Name",
//        "description": "The name of the graph",
//        "defaultValue": "",
//        "variableType": "T", "persistentProperties": "*ALL*"
//        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "b3db1080-ca26-4fd7-d0f1-17827bbec8f5",
            "variableName": "Type",
            "description": "The type of graph to generate",
            "defaultValue": "radar|Radar,bar|Bar,horizontalBar|Horizontal bar,doughnut|Doughnut,pie|Pie,line|Line,polarArea|Polar",
            "variableType": "L", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "25f4863a-4194-4808-ae1f-3b51e3b63f0e",
            "variableName": "DefaultFontSize",
            "description": "The default font size of all text in the graph",
            "defaultValue": "16",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "25f4863a-4194-4808-ae1f-3b51e3b63f0e",
            "variableName": "Axis_min_value",
            "description": "The minimum value the graph is initialised with",
            "defaultValue": "0",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "75d088b2-1027-4ab2-f057-3fcaeea78a44",
            "variableName": "Axis_max_value",
            "description": "The maximum value the graph is initialised with",
            "defaultValue": "100",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "ad16dc0b-d5da-43d0-96d1-a2c64c450fbb",
            "variableName": "Show_legend",
            "description": "Show the legend in the graph ",
            "defaultValue": "T",
            "variableType": "B", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "c50045fd-94a8-4f62-fb3f-0a32bfef4a27",
            "variableName": "Pre_graph_script",
            "description": "",
            "defaultValue": "",
            "variableType": "A", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "ea21ac13-0c14-4a55-1842-52784491956f",
            "variableName": "Series_labels",
            "description": "A comma seperated list of label names",
            "defaultValue": "",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "d248a6ff-b950-4201-e7c6-62e97d4b60a9",
            "variableName": "Series_data",
            "description": "A comma seperated list of numeric values",
            "defaultValue": "",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "6bdc4beb-bfc6-4121-76b7-0ddd027f7baa",
            "variableName": "Series_color_start",
            "description": "The color of this series",
            "defaultValue": "EEEEEE",
            "variableType": "C", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "8ffeaca7-3a00-4784-0493-a0ece20762d1",
            "variableName": "Series_name",
            "description": "The name of this series",
            "defaultValue": "",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "19af469c-9df4-4d24-e28f-700c0e83c43c",
            "variableName": "Height",
            "description": "",
            "defaultValue": "200px",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "7829a7a0-236a-4a1a-1eac-9e9866c62888",
            "variableName": "Width",
            "description": "",
            "defaultValue": "200px",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "18a6ed75-d4a7-4825-ba32-4eebfdc8d4b9",
            "variableName": "Series_type",
            "description": "If the series is of another type then the graph override it here, In general only bar and line types can be mixed.",
            "defaultValue": "|None,radar|Radar,bar|Bar,doughnut|Doughnut,pie|Pie,line|Line,polarArea|Polar",
            "variableType": "L", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "7fc268b8-bf68-486d-d765-c3c689ab4e95",
            "variableName": "Series_color_end",
            "description": "",
            "defaultValue": "AAAAAA",
            "variableType": "C", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "4713efff-9a20-4dda-bc52-a5bbfe8cb6bd",
            "variableName": "Series_fill",
            "description": "",
            "defaultValue": "F",
            "variableType": "B", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "46181ecc-a40f-4b87-86ba-47372c9eed8a",
            "variableName": "Stacked",
            "description": "If stack groups are present (and only on line and bar charts) stacking can be switched on",
            "defaultValue": "F",
            "variableType": "B", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "a57cbe44-5094-494a-e7bc-827500ac604a",
            "variableName": "StackGroup",
            "description": "The stack group name",
            "defaultValue": "",
            "variableType": "T", "persistentProperties": "*ALL*"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "fd1e8ef5-e13a-4e3b-f497-071d051535ea",
            "variableName": "Series_line_show",
            "description": "Show the line or not",
            "defaultValue": "T",
            "variableType": "B"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "63b62707-4373-4f27-6a46-8d647c3d4720",
            "variableName": "Series_line_curve",
            "description": "Show the line curved or stepped",
            "defaultValue": "T",
            "variableType": "B"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "d39b5af2-13db-4bba-1e9b-d6b0c4518df3",
            "variableName": "Series_point_type",
            "description": "",
            "defaultValue": "circle|circle,cross|cross,crossRot|rotated cross,dash|dash,line|line,rect|rectangle,rectRounded|rounded rectangle,rectRot|rotated rectangle,star|star,triangle|triangle",
            "variableType": "L"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "ee58ab92-ea6f-4cfa-6c68-54410d1853f2",
            "variableName": "Series_point_size",
            "description": "Size for the point",
            "defaultValue": "3",
            "variableType": "T"
        },
        {
            "_objectType": "ITSScreenTemplateVariable",
            "ID": "6440a904-dfde-447c-b809-bc11b9f8a1bb",
            "variableName": "Series_line_tension",
            "description": "",
            "defaultValue": "0.4",
            "variableType": "T"
        } ],
    "HTMLContent": "<div id=\"%%ID%%\" style=\"height:%%Height%%; width:%%Width%%;\"></div>\n<!--REPEATBLOCK-->\n<!-- %%Series_name%% -->\n<!--%%Series_data%%-->\n<!-- %%Series_color_start%% -->\n<!-- %%Series_color_end%% -->\n<!-- %%Series_type%% -->\n<!-- %%Series_fill%% -->\n<!-- %%StackGroup%% -->\n<!-- %%Series_line_show%% -->\n<!-- %%Series_line_curve%% -->\n<!-- %%Series_point_type%% -->\n<!-- %%Series_point_size%% -->\n<!-- %%Series_line_tension%% -->\n<!--REPEATBLOCK-->\n",
    "HTMLContentPnP": "",
    "HTMLContentSummary" : "",
    "get_value_snippet": "",
    "set_value_snippet": "",
    "init_value_snippet": "generateGraph(\""+this.ID+"\",id, num_blocks, test_mode, template_values, ITSInstance.reports.currentReport, false)",
    "generator_snippet": "",
    "generator_pnp_snippet": "",
    "validation_snippet": "",
    "isanswered_snippet": "return true;",
    "PluginData": {
        "_objectType": "ITSObject",
        "persistentProperties": "*ALL*"
    }
};
