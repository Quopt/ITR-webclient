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

function ITSCompany (uParent) {
    this.myParent = uParent;
    this.ID = newGuid();
    this.CostsPerTestInUnits = 0;
    this.Active = true;
    this.CurrentCreditLevel = 0;
    this.TestTakingDiscount = 0;
    this.YearlyLicenseDiscount = 0;
    this.YearlyLicenseFee = 0;
    this.ConcurrentOpenSessions = 0;
    this.CompanyName = "";
    this.CompanyCountry = "";
    this.InternationalVATNr = "";
    this.InvoiceAddress = "";
    this.MailAddress = "";
    this.VisitingAddress = "";
    this.CompanyLogo = "";
    this.ContactPerson = "";
    this.ContactPhone = "";
    this.ContactEMail = "";
    this.CCEMail = '';
    this.AllowNegativeCredits = false;
    this.NoPublicTests = false;
    this.VATPercentage = "21";
    this.LicenseStartDate = new Date();
    this.LicenseEndDate = new Date(2100,1,1);
    this.InvoiceCurrency = "Euro";
    this.AdministrativeID = "";
    this.MFAEnabled = false;
    this.CreditUsagesPerMonth = [];
    this.PluginData = {};
    this.PluginData.persistentProperties = "*ALL*";
    this.PluginData.ForbiddenPaths ='';
    this.PricePerCreditUnit = 0.1;

    this.persistentProperties = [
      'ID','CostsPerTestInUnits','Active','CurrentCreditLevel','TestTakingDiscount','YearlyLicenseDiscount',
        'YearlyLicenseFee','ConcurrentOpenSessions','CompanyName','CompanyCountry',
        'InternationalVATNr','InvoiceAddress','MailAddress','VisitingAddress','CompanyLogo','ContactPerson','ContactPhone',
        'ContactEMail','AllowNegativeCredits','NoPublicTests','VATPercentage','LicenseStartDate','LicenseEndDate',
        'InvoiceCurrency','AdministrativeID', 'CCEMail', 'PluginData', 'MFAEnabled', 'PricePerCreditUnit'
    ];
    
    this.newCompany = false;
    this.detailsLoaded = false;
}

ITSCompany.prototype.outOfCredits = function() {
    return ((this.CurrentCreditLevel <= 0) && (! this.AllowNegativeCredits));
};
ITSCompany.prototype.getCostsForTest = function(TestCode, DefaultCosts) {
    var tempCosts = DefaultCosts;
    if (typeof this.PluginData.Invoicing != "undefined") {
        if (typeof this.PluginData.Invoicing[TestCode] != "undefined") {
            tempCosts = this.PluginData.Invoicing[TestCode];
        }
    }
    return tempCosts;
};

ITSCompany.prototype.resetCreditUsagesPerMonth = function () {
    this.CreditUsagesPerMonth = [];
};
ITSCompany.prototype.newCreditUsagesPerMonth = function () {
    oldLength = this.CreditUsagesPerMonth.length;
    newObj = new ITSCreditUsagePerMonth(this);
    this.CreditUsagesPerMonth[oldLength] = newObj;
    return newObj;
};
ITSCompany.prototype.reloadCreditUsagesPerMonth = function (creditUsagesLoaded, creditUsagesError) {
    this.resetCreditUsagesPerMonth();

    setTimeout( function () {
        ITSInstance.genericAjaxLoader(
            'creditusagespermonth',
            this.CreditUsagesPerMonth,
            creditUsagesLoaded,
            creditUsagesError,
            function () {
                return this.newCreditUsagesPerMonth(this);
            }.bind(this)
        );
    }.bind(this), 1 );
};

ITSCompany.prototype.loadDetails = function (OnSuccess, OnError) {
    this.loadDetailsOK = OnSuccess;
    this.loadDetailsError = OnError;
    ITSInstance.JSONAjaxLoader('companies/' + this.ID , this,
        this.loadDetailsOK.bind(this), this.loadDetailsError.bind(this));
};
ITSCompany.prototype.loadDetailsOK = function () {
    this.postLoad();
    this.newCompany = false;
    this.detailsLoaded = true;
    this.loadDetailsOK();
};
ITSCompany.prototype.loadDetailsError = function () {
    this.loadDetailsError();
};

ITSCompany.prototype.postLoad = function () {
    this.parseDates();
};

ITSCompany.prototype.parseDates = function () {
    if ($.type(this.LicenseStartDate) === "string") {
        this.LicenseStartDate = convertISOtoDate(this.LicenseStartDate );
    }
    if ($.type(this.LicenseEndDate) === "string") {
        this.LicenseEndDate = convertISOtoDate(this.LicenseEndDate );
    }
};

ITSCompany.prototype.saveToServer = function (OnSuccess, OnError) {
    this.lastSavedJSON = ITSJSONStringify(this);
    ITSInstance.genericAjaxUpdate('companies/' + this.ID, this.lastSavedJSON, OnSuccess, OnError, "N", "Y");
    if (this.newCompany) {
        ITSInstance.MessageBus.publishMessage("Company.Create", this);
    }
    else {
        ITSInstance.MessageBus.publishMessage("Company.Update", this);
    }
    this.newCompany = false;
};

ITSCompany.prototype.deleteFromServer = function (OnSuccess, OnError) {
    ITSInstance.genericAjaxDelete('companies/' + this.ID, OnSuccess, OnError, false, true);
    ITSInstance.MessageBus.publishMessage("Company.Delete", this);
};

function ITSCompanies (sess) {
    this.ITSSession = sess;
    this.currentCompanyAvailable = false;

    this.currentCompany = new ITSCompany(this); // contains information about the current company
};

ITSCompanies.prototype.loadCurrentCompany = function (whenLoaded, onError, refreshOnly ) {
    ITSLogger.logMessage(logLevel.INFO,"loading current company");
    this.currentCompanyLoaded = whenLoaded;
    this.currentCompanyError = onError;
    this.refreshOnly = refreshOnly;
    ITSInstance.genericAjaxLoader('companies/currentcompany', ITSInstance.companies.currentCompany, this.loadCurrentCompanyOK.bind(this), this.loadCurrentCompanyError.bind(this), undefined, undefined, undefined,undefined,undefined,undefined,undefined,undefined,undefined,true);
    // also load the companies this user is allowed to see
    ITSInstance.companies.otherCompanies = [];
    ITSInstance.genericAjaxLoader('logins/currentuser/companies', ITSInstance.companies.otherCompanies,function () {}, function () {}, undefined, -1,99999,
        'CompanyName',"N", "Y", "N" );

};

ITSCompanies.prototype.findOtherCompanyByID = function (CompanyID) {
    for (var i=0; i < ITSInstance.companies.otherCompanies.length; i ++) {
        if (ITSInstance.companies.otherCompanies[i].ID == CompanyID) {
            return ITSInstance.companies.otherCompanies[i];
        }
    }
    return undefined;
};

ITSCompanies.prototype.loadCurrentCompanyOK = function () {
    if (this.currentCompanyLoaded) this.currentCompanyLoaded();
    this.currentCompanyAvailable = true;
    if (this.refreshOnly) {
        ITSInstance.MessageBus.publishMessage("CurrentCompany.Refreshed", this);
    } else {
        ITSInstance.MessageBus.publishMessage("CurrentCompany.Loaded", this);
    }
};

ITSCompanies.prototype.loadCurrentCompanyError = function () {
    if (this.currentCompanyError) this.currentCompanyError();
};

ITSCompanies.prototype.createNewCompany = function () {
    return new ITSCompany(this.ITSSession);
};
