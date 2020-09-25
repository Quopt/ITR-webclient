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
    $.get(ITSJavaScriptVersion + '/Plugins/CreditsUsedPortlet/portlet.html', function (htmlLoaded) {
        // init the portlet
        var ITSPortletCreditManagement = {
            info: new ITSPortletAndEditorRegistrationInformation('8ce5ec6e-c125-4d15-ba41-b67740ef0453', 'Credits used portlet', '1.0', 'Copyright 2018 Quopt IT Services BV', 'Shows credit usage of the company and remaining credit units.'),
            defaultShowOrder : 4,
            html : htmlLoaded,
            addToInterface : function () {
                AdminInterfaceCreditManagementPortletDiv = $('<div class="col-md-4" id="AdminInterfaceCreditManagement" style="display:none">');
                $('#AdminInterfacePortlets').append(AdminInterfaceCreditManagementPortletDiv);
                $('#AdminInterfaceCreditManagement').append(this.html);
            },
            afterOfficeLogin: function () {
                ITSLogger.logMessage(logLevel.INFO,'Init portlet credit management');
                ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletCreditManagement.init_after_load);
                ITSInstance.portletCreditManagement.init_after_load();
            },
            init_after_load: function () {
                if (ITSInstance.companies.currentCompany) {
                    ITSInstance.companies.currentCompany.reloadCreditUsagesPerMonth(
                        ITSInstance.portletCreditManagement.creditUsagesLoaded,
                        ITSInstance.portletCreditManagement.creditUsagesError);
                    ITSInstance.portletCreditManagement.currentCompanyLoaded();
                }
            },
            hide: function () {
                $("#AdminInterfaceCreditManagement").css("display", "none");
                $('#AdminInterfaceCreditManagement').hide();
            },
            show: function () {
                $("#AdminInterfaceCreditManagement").css("display", "block");
                $('#AdminInterfaceCreditManagement').show();
            },
            currentCompanyLoaded: function () {
                $('#AdminInterfaceCreditManagementBodyAmount').text(ITSInstance.companies.currentCompany.CurrentCreditLevel);
                try{
                  if (ITSInstance.users.currentUser.HasPersonalCreditPool) {
                      $('#AdminInterfaceCreditManagementBodyAmount').text(ITSInstance.users.currentUser.CurrentPersonalCreditLevel);
                  }
                } catch(err) {};
            },
            creditUsagesLoaded: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet credit usages loaded');
                try {
                // init the graph
                $('#AdminInterfaceCreditManagementChart').empty();
                if (ITSInstance.companies.currentCompany.CreditUsagesPerMonth.length > 0) {
                        var ctx = $("#AdminInterfaceCreditManagementChart");

                        Chart.scaleService.updateScaleDefaults('linear', {
                            ticks: {
                                beginAtZero: true
                            }
                        });
                        Chart.defaults.global.defaultFontSize = 14;
                        Chart.defaults.global.animation.duration = 2000;

                        var adminInterfaceCreditManagementChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: ["", "", "", "", "", "", ""],
                                datasets: [
                                    {
                                        label: ITSInstance.translator.getTranslatedString('CreditsUsedPortlet', 'GraphHeader', 'Credit usage (ticks)'),
                                        data: [0, 0, 0, 0, 0, 0, 0],
                                        pointRadius: 3,
                                        borderWidth: 1
                                    }]
                            },
                            options: {
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }],
                                    xAxes: [{
                                        ticks: {
                                            autoSkip: false
                                        }
                                    }]
                                }
                            }
                        });


                        adminInterfaceCreditManagementChart.chart.config.data.labels.length = 0;
                        adminInterfaceCreditManagementChart.chart.config.data.datasets[0].data.length = 0;
                        for (i = 0; (i < 6) && (i < ITSInstance.companies.currentCompany.CreditUsagesPerMonth.length); i++) {
                            adminInterfaceCreditManagementChart.data.labels[6 - i] = ITSInstance.companies.currentCompany.CreditUsagesPerMonth[i].year + '/' + ITSInstance.companies.currentCompany.CreditUsagesPerMonth[i].month;
                            adminInterfaceCreditManagementChart.chart.config.data.datasets[0].data[6 - i] = ITSInstance.companies.currentCompany.CreditUsagesPerMonth[i].ticks;
                        }
                        adminInterfaceCreditManagementChart.data.labels[0] = '';
                        adminInterfaceCreditManagementChart.chart.config.data.datasets[0].data[0] = 0;
                        adminInterfaceCreditManagementChart.update();
                    }
                } catch (err) {
                    ITSLogger.logMessage(logLevel.ERROR,'CreditsUsedPortlet, creating graph failed : ' + err.message);
                }
            },
            creditUsagesError: function () {
                ITSLogger.logMessage(logLevel.INFO,'Portlet credit usages loading gives error');
            },
            loadPortletWhenCompanyKnown : function () {
                if ((ITSInstance.users.currentUser.IsOrganisationSupervisor) || (ITSInstance.users.currentUser.IsMasterUser) || (ITSInstance.users.currentUser.MayOrderCredits)) {
                    $('#AdminInterfaceCreditManagementOrderButton').hide();
                    ITSInstance.portletCreditManagement.show();
                    ITSInstance.portletCreditManagement.init_after_load();
                    $('#AdminInterfaceCreditManagementViewButton').show();
                    if (ITSInstance.users.currentUser.MayOrderCredits) $('#AdminInterfaceCreditManagementOrderButton').show();
                    ITSInstance.MessageBus.subscribe("CurrentCompany.Refreshed", ITSInstance.portletCreditManagement.init_after_load);
                }
            }
        }

        // register the portlet
        ITSInstance.portletCreditManagement = Object.create(ITSPortletCreditManagement);
        ITSInstance.UIController.registerPortlet(ITSInstance.portletCreditManagement);
        ITSInstance.portletCreditManagement.hide();

        ITSInstance.MessageBus.subscribe("CurrentUser.Loaded", function () {
            setTimeout(ITSInstance.portletCreditManagement.loadPortletWhenCompanyKnown,1000);
        }, true);


        })

})() // iife