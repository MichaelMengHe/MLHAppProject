import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Data } from '../../models/data';
import { GlobalViewStateService } from '../../services/global-view-state.service';
import { LogService } from '../../services/log.service';
import { Page } from '../../models/PageFlow';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ValidationService } from '../../services/validation.service';
import { StorageService } from '../../services/storage.service';
import { UtilityService } from '../../services/utility.service';
import { __states, __provinces, __countries } from '../../models/inputOptions';
import { NavStepperRegisterService } from '../../services/navStepperRegisterService';
import { OrgAddressService } from '../../services/orgAddressService';

import { HeaderService } from '../../services/headerService';

declare var pca: any;
declare var addressComplete: any;

@Component({
    selector: 'app-customer-address',
    templateUrl: './customerAddress.component.html',
    styleUrls: []
})
export class CustomerAddressComponent implements OnInit {

    @Input() orgId;
    @Output() step = new EventEmitter<number>();
    @Output() pageFrom = new EventEmitter<number>();
    @Output() addressType = new EventEmitter<String>();
    @Output() postalCode = new EventEmitter<String>();

    private currentPage = Page.CustomerAddress;
    newReg = false;
    states = __states;
    countries = __countries;
    provinces = __provinces;
    loadedsiteAddress;
    loadedOrganizationProfile;
    businesschanged = false;
    mailingchanged = false;
    manualEntry = false;

    siteAddress =
        {
            byPclookup: false,
            civicNumber: null,
            civicNumberSuffix: null,
            country: "CA",
            creationTime: null,
            deliveryId: null,
            deliveryMode: null,
            deliveryType: null,
            lastModifiedTime: null,
            line1: null,
            line2: null,
            municipality: null,
            objectId: null,
            poboxNumber: null,
            postalCode: null,
            province: null,
            ruralRouteNumber: null,
            ruralRouteType: null,
            streetDirectionCode: null,
            streetName: null,
            streetType: null,
            typeCode: 0,
            unitNumber: null,
            unitTypeCode: null,
            version: 0
        };

    siteAddressEdit = { country: 'CA', postalCode: '' };

    mailingAddressSameAsSupplierAddress = false;
    restrictedAddress = false;

    // pageKey;
    // pageUrl;
    // orgProfile;
    // public defaultNewOrganizationProfile = {
    //     objectId: 0,
    //     version: 0,
    //     addressNotProvided: false,
    //     postalCode: '',
    //     country: '',
    //     mailingAddressSameAsSupplierAddress: null,
    //     registrationStatus: 'Draft',
    //     typeCode: 0,
    // };
    // addressLookType = null;

    // title = 'pclookuppoc';
    // fields: Data[];
    // options: any;

    constructor(private apiService: ApiService, route: ActivatedRoute,
        public storageService: StorageService, public viewState: GlobalViewStateService,
        public validationService: ValidationService, private sessionStorage: StorageService,
        private utilityService: UtilityService, private logger: LogService,
        public navStepperRegisterService: NavStepperRegisterService, private orgAddressService: OrgAddressService,
        private headerService: HeaderService) {
        // if next (stepper button) is clicked, next() is executed
        this.orgAddressService.changeMessage.subscribe((message) => {
            if (message) {
                // this.saveAddressToDb();
                this.navStepperRegisterService.changeMessage('address verified');
            }
        });
        this.headerService.changeMessage.subscribe((message) => {
            if (message === 'register new org') {
                this.updateNewReg();
            }
        });
    }

    ngOnInit() {
    }

    changeEntry(){
        this.manualEntry = !this.manualEntry
        console.log("HII")
    }
//         if (this.newReg) {
//             this.orgId = 0;
//         }
//         this.pageKey = 'OrgAddressList_' + this.orgId;
//         this.pageUrl = '/OrgAddressList/' + this.orgId;
//         this.viewState.scrollToMessageArea();
//         this.viewState.clearMessages();
//         let pageState = this.sessionStorage.popPageState(this.pageKey);
//         //console.log(pageState);
//         if (pageState) {
//             //console.log("if pagestate", pageState);
//             this.restoreOrganizationAndAddresses(pageState);
//             this.processCallback();
//         } else {
//             //console.log("else pagestate", pageState);
//             this.loadAddressByOrgId();
//         };
//     }

    updateNewReg() {
        this.newReg = true;
        this.navStepperRegisterService.changeMessage('refresh');
        this.ngOnInit()
    }

//     // Not used fo now
//     getAddressFromSearch() {
//         this.fields = [{ element: "search-address", field: "", mode: pca.fieldMode.DEFAULT },
//         { element: "street-address", field: "Line1", mode: pca.fieldMode.POPULATE },
//         //{ element: "street-address2", field: "Line2", mode: pca.fieldMode.POPULATE },
//         { element: "city", field: "City", mode: pca.fieldMode.POPULATE },
//         { element: "state", field: "ProvinceName", mode: pca.fieldMode.POPULATE },
//         { element: "postcode", field: "PostalCode" },
//         { element: "country", field: "CountryName", mode: pca.fieldMode.COUNTRY },
//             //   { element: "unit", field: "BuildingNumber", mode: pca.fieldMode.POPULATE },
//             //  { element: "unit-type", field: "Type", mode: pca.fieldMode.POPULATE },
//         ],
//             this.options = { key: "DJ24-WY32-RW43-KZ96" };
//         this.options.bar = { showLogo: true, visible: false };
//         //console.log(this.fields);
//         var control = new pca.Address(this.fields, this.options);
//         console.dir(control);
//         console.log(addressComplete);
//         addressComplete.listen('ready', function () {
//             addressComplete = { Country: "Canada" }
//             let unitFld: any;
//             let streetAddressFld: any;
//             console.log(addressComplete);
//             control.listen("populate", function (address: any) {
//                 console.dir(address)
//                 unitFld = document.getElementById("unit");
//                 streetAddressFld = document.getElementById("street-address");
//                 if (address.SubBuilding == "Unit") {
//                     unitFld.value = address.BuildingNumber;
//                     streetAddressFld.value = ((address.Line1).substr((address.Line1).indexOf(' '))).trim();
//                 } else {
//                     unitFld.value = '';
//                     streetAddressFld.value = address.Line1;
//                 }
//             });
//         });
//     }

//     getAddressFromLookup() {
//         let pclookupRetKeyBus = "pclookup/" + 'business/' + this.orgId;
//         console.log(this.sessionStorage.getAppData(pclookupRetKeyBus));
//         if (!(this.sessionStorage.getAppData(pclookupRetKeyBus) == null)) {
//             this.siteAddress = Object.assign({}, this.sessionStorage.getAppData(pclookupRetKeyBus));
//             // this.loadedOrganizationProfile.siteAddress = this.siteAddress;
//             if (this.sessionStorage.getAppData(pclookupRetKeyBus).unitTypeCode !== "") {
//                 this.siteAddress.line1 = this.sessionStorage.getAppData(pclookupRetKeyBus).unitTypeCode + " " + this.sessionStorage.getAppData(pclookupRetKeyBus).unitNumber + ", " + this.sessionStorage.getAppData(pclookupRetKeyBus).civicNumber + " " + this.sessionStorage.getAppData(pclookupRetKeyBus).streetName + " " + this.sessionStorage.getAppData(pclookupRetKeyBus).streetType;
//             }
//             else {
//                 this.siteAddress.line1 = this.sessionStorage.getAppData(pclookupRetKeyBus).civicNumber + " " + this.sessionStorage.getAppData(pclookupRetKeyBus).streetName + " " + this.sessionStorage.getAppData(pclookupRetKeyBus).streetType;
//             }
//         }
//         let pclookupRetKeyMail = "pclookup/" + 'mailing/' + this.orgId;
//         if (!(this.sessionStorage.getAppData(pclookupRetKeyMail) == null)) {
//             this.siteAddress = Object.assign({}, this.sessionStorage.getAppData(pclookupRetKeyMail));
//             // this.loadedOrganizationProfile.mailingAddress = this.mailingAddress;
//             if (this.sessionStorage.getAppData(pclookupRetKeyMail).unitTypeCode !== "") {
//                 this.siteAddress.line1 = this.sessionStorage.getAppData(pclookupRetKeyMail).unitTypeCode + " " + this.sessionStorage.getAppData(pclookupRetKeyMail).unitNumber + ", " + this.sessionStorage.getAppData(pclookupRetKeyMail).civicNumber + " " + this.sessionStorage.getAppData(pclookupRetKeyMail).streetName + " " + this.sessionStorage.getAppData(pclookupRetKeyMail).streetType;
//             }
//             else {
//                 this.siteAddress.line1 = this.sessionStorage.getAppData(pclookupRetKeyMail).civicNumber + " " + this.sessionStorage.getAppData(pclookupRetKeyMail).streetName + " " + this.sessionStorage.getAppData(pclookupRetKeyMail).streetType;
//             }
//         }
//         this.sessionStorage.clearAppData(pclookupRetKeyBus);
//         // this.sessionStorage.clearAppData(pclookupRetKeyMail);

//     }
//     dirtyFormChecker() {
//         console.log(this.orgProfile);
//         console.log(this.loadedOrganizationProfile);
//         let noAddrFlagChanged = (this.loadedOrganizationProfile.addressNotProvided != this.orgProfile.addressNotProvided);
//         let sameAddrFlagChanged = (this.loadedOrganizationProfile.mailingAddressSameAsSupplierAddress
//             != this.orgProfile.mailingAddressSameAsSupplierAddress);

//         // this.logger.debug(`changed profile:${profileChanged}, noAddres:${noAddrFlagChanged}, sameAddress:${sameAddrFlagChanged}`);
//         if (noAddrFlagChanged || sameAddrFlagChanged) {
//             return true;
//         }
//         console.log(this.loadedOrganizationProfile.siteAddress);
//          console.log(this.loadedOrganizationProfile.mailingAddress);
//          console.log(this.siteAddress);
//          console.log(this.mailingAddress);
//         return !(this.utilityService.isEquals(this.loadedOrganizationProfile.siteAddress, this.siteAddress) &&
//             this.utilityService.isEquals(this.loadedOrganizationProfile.mailingAddress, this.mailingAddress));
//     }

//     next() {
//         let pageToGo = this.viewState.getNextPage(this.currentPage);
//         console.log(pageToGo);
//         if (pageToGo) {
//             this.saveAddressToDb();
//             this.step.emit(pageToGo);
//         } else {
//             this.logger.error('geNext() can not find Next page: ', pageToGo);
//         }
//         this.saveAddressToDb();
//     }

//     back() {
//         let pageToGo = this.viewState.getPreviousPage(this.currentPage);
//         if (pageToGo) {
//             this.step.emit(pageToGo);
//         } else {
//             this.logger.error('goBack() can not find Previous page: ', pageToGo);
//         }
//     }

//     loadAddressByOrgId() {
//         //console.log("loadaddrssbyorgidbefore", this.siteAddress);
//         if (this.orgId > 0) {
//             this.sessionStorage.clearAppData('OrgAddress');
//             this.apiService.callAPIGet(
//                 '/api/v1/data/address/list/' + this.orgId,
//                 (result) => {
//                     console.log(result);
//                     this.setOrganizationAddresses(result);
//                     this.loadedsiteAddress = result.siteAddress;
//                 },
//                 null
//             );
//         } else {
//             this.orgProfile = Object.assign({}, this.defaultNewOrganizationProfile);
//             //this.setMessage(true, 'invalid organization id');
//         }
//     }

//     setOrganizationAddresses(theOrg) {
//         // console.log("setOrganizationAddresses", theOrg);
//         this.viewState.setOrgProfile(theOrg);
//         if (theOrg !== this.orgProfile) {
//             this.orgProfile = Object.assign({}, theOrg);
//         }
//         if (this.orgProfile.addressNotProvided === 'true' ||
//             this.orgProfile.addressNotProvided === true) {
//             this.orgProfile.addressNotProvided = true;
//         } else {
//             this.orgProfile.addressNotProvided = false;
//         }

//         // if (this.orgProfile.mailingAddressSameAsBusinessAddress === 'true' ||
//         //     this.orgProfile.mailingAddressSameAsBusinessAddress === true) {
//         //     this.orgProfile.mailingAddressSameAsBusinessAddress = true;
//         // } else {
//         //     this.orgProfile.mailingAddressSameAsBusinessAddress = false;
//         // }
//         // if (this.orgProfile.businessAddress.typeCode == null) {
//         //     this.orgProfile.businessAddress.typeCode = 0;
//         // }
//         // if (this.orgProfile.mailingAddress.typeCode == null) {
//         //     this.orgProfile.mailingAddress.typeCode = 0;
//         // }
//         // try {
//         //     if (this.orgProfile.businessAddress.country === undefined
//         //         || this.orgProfile.businessAddress.country == null) {
//         //         this.orgProfile.businessAddress.country = 'CA';
//         //     }
//         //     if (this.orgProfile.mailingAddress.country === undefined
//         //         || this.orgProfile.mailingAddress.country == null) {
//         //         this.orgProfile.mailingAddress.country = 'CA';
//         //     }
//         // } catch (err) {
//         //     this.logger.error('Error in setOrganizationAddresses() ' + err);
//         // }

//         // if (this.orgProfile.businessAddress !== this.siteAddress) {
//         //     this.siteAddress = this.utilityService.objectCopy(this.orgProfile.businessAddress);
//             //console.log(this.orgProfile.businessAddress)
//             //console.log(this.businessAddress);
//         // }

//         // if (this.orgProfile.mailingAddress !== this.mailingAddress) {
//         //     this.mailingAddress = this.utilityService.objectCopy(this.orgProfile.mailingAddress);
//         // }

//         // if (this.orgProfile.objectId !== undefined) {
//         //     this.orgProfile.organizationId = this.orgProfile.objectId;
//             // console.log(this.mailingAddress);
//         // }

//         this.setAddressForEdit(this.siteAddress, this.siteAddress);
//         // this.setAddressForEdit(this.mailingAddress, this.mailingAddressEdit);
//         // this.setAddressForEdit(this.editingAddressBusiness, this.businessAddressEdit);
//         // this.setAddressForEdit(this.editingAddressMailing, this.mailingAddressEdit);

//         this.loadedOrganizationProfile = this.utilityService.objectCopy(this.orgProfile);
//         //console.log("setOrganizationAddresses", theOrg);
//         //this.setWindowUnloadEventHandler(this.isOrganizationAddressChanged);
//         this.retrievePageState();
//         this.getAddressFromLookup();
//     }

//     setAddressForEdit(fullAddress, editAddress) {
//         editAddress.country = fullAddress.country;
//         editAddress.postalCode = fullAddress.postalCode;
//     }

//     addressLookupMailing() {
//         //this.clearAll();
//         // if (this.validateBeforeLookup(this.mailingAddressEdit, 'Mailing')) {
//         //     return;
//         // }

//         // this.prepareAddressLookup('mailing', this.mailingAddressEdit);
//         this.savePageState();
//         this.storageService.clearAppData("PCLookup/page");
//         this.storageService.storeAppData("PCLookup/page", 2);
//         // console.log(this.storageService.getAppData("PCLookup/page"));
//         this.pageFrom.emit(this.currentPage);
//         // console.log(this.currentPage);
//         this.step.emit(Page.AddressLookup);
//         this.addressType.emit('mailing');
//         // this.postalCode.emit(this.mailingAddressEdit.postalCode);
//     }

//     pcLookup() {
//         //this.clearAll();
//         this.step.emit(Page.AddressLookup);

//     }

    // addressLookupBusiness() {
    //     if (this.validateBeforeLookup(this.businessAddressEdit, 'Business')) {
    //         return;
    //     }

    //     this.prepareAddressLookup('business', this.businessAddressEdit);
    //     // this.logger.info(this.businessAddressEdit.postalCode);
    //     this.savePageState();
    //     this.storageService.clearAppData("PCLookup/page");
    //     this.storageService.storeAppData("PCLookup/page", 2);
    //     //console.log(this.storageService.getAppData("PCLookup/page"));
    //     this.pageFrom.emit(this.currentPage);
    //     // console.log(this.currentPage);
    //     this.step.emit(Page.AddressLookup);
    //     this.addressType.emit('business');

    //     // this.postalCode.emit(this.businessAddressEdit.postalCode);
    // }

//     validateBeforeLookup(address, addressType) {
//         this.viewState.clearMessages();
//         let required = ['country', 'postalCode'];
//         let hasError = this.validationService.validateFieldRequired(address, required);
//         if (hasError) {
//             return true;
//         }
//         if (address.country === 'CA') {
//             if (!this.validationService.isCanadianPostalCode(address.postalCode)) {
//                 let errCode = '132';
//                 if (addressType === 'Mailing') {
//                     errCode = '133';
//                 }
//                 //this.logger.debug('validateBeforeLookup() address=', address);
//                 this.viewState.setMessage(true, errCode);
//                 return true;
//             }
//         }
//         return false;
//     }

//     prepareAddressLookup(type, address) {
//         this.addressLookType = type;

//         this.backupOrganizationAndAddresses();

//         let lookupParameter = {
//             returnURL: this.pageUrl, // obsolete keeping for legacy
//             returnorgId: this.orgId,
//             returnStep: 2,
//             type: type,
//             country: address.country,
//             postalCode: address.postalCode,
//             orgOperatingName: this.orgProfile.orgOperatingName
//         };
//         //this.logger.info('step' + lookupParameter.returnStep);
//         this.storageService.storeAppData('pclookup/parameter', lookupParameter);
//     }

//     backupOrganizationAndAddresses() {
//         let pageState = {
//             addressLookType: this.addressLookType,
//             organizationProfile: this.orgProfile,
//             loadedOrganizationProfile: this.loadedOrganizationProfile,
//             // editingAddressBusiness: this.editingAddressBusiness,
//             // editingAddressMailing: this.editingAddressMailing,
//             businessAddress: this.businessAddress,
//             mailingAddress: this.mailingAddress,
//             businessAddressEdit: this.businessAddressEdit,
//             mailingAddressEdit: this.mailingAddressEdit
//         };
//         this.storageService.pushPageState(this.pageKey, pageState);
//     }

//     validateAddress() {
//         //validationManager.validateForm(angular.element(document.querySelector('#orgAddrForm')) );
//         this.viewState.clearValidationErrors();
//         this.viewState.clearMessages();
//         if (this.orgProfile.addressNotProvided) {
//             return false;
//         }
//         let hasError = false;

//         let requiredFieldList = [
//             'line1', 'municipality', 'province', 'country', 'postalCode'
//         ];

//         if (this.validationService.validateFieldRequired(this.businessAddress, requiredFieldList)) {
//             hasError = true;
//             return true;
//         }

//         if (!this.orgProfile.mailingAddressSameAsBusinessAddress) {
//             if (this.validationService.validateFieldRequired(this.mailingAddress, requiredFieldList)) {
//                 hasError = true;
//                 return true;
//             }
//         }

//         if (!this.businessAddress.province || !this.businessAddress.line1 || !this.businessAddress.municipality) {
//             this.viewState.addValidationError('business_address', 'is missing');
//             hasError = true;
//         }

//         if (!this.orgProfile.mailingAddressSameAsBusinessAddress && (!this.mailingAddress.province || !this.mailingAddress.line1 || !this.mailingAddress.municipality)) {
//             this.viewState.addValidationError('mailing_address', 'is missing');
//             hasError = true;
//         }

//         if (this.orgProfile.mailingAddressSameAsBusinessAddress) {
//             if (this.siteAddress.country === 'CA') {
//                 if (!(this.validationService.isCanadianPostalCode(this.siteAddress.postalCode))) {
//                     this.viewState.setMessage(true, '132', true);
//                     this.viewState.setMessage(true, '132');
//                     this.navStepperRegisterService.changeMessage('address validation error');
//                     hasError = true;
//                 }
//             }
//         }
//         else {
//             if (this.siteAddress.country === 'CA') {
//                 if (!(this.validationService.isCanadianPostalCode(this.siteAddress.postalCode))) {
//                     this.viewState.setMessage(true, '132', true);
//                     this.viewState.setMessage(true, '132');
//                     this.navStepperRegisterService.changeMessage('address validation error');
//                     hasError = true;
//                 }
//             }
//             if (this.mailingAddress.country === 'CA') {
//                 if (!(this.validationService.isCanadianPostalCode(this.mailingAddress.postalCode))) {
//                     this.viewState.setMessage(true, '133', true);
//                     this.viewState.setMessage(true, '133');
//                     this.navStepperRegisterService.changeMessage('address validation error');
//                     hasError = true;
//                 }
//             }

//         }
//         this.logger.error('validation failed: ' + hasError);
//         return hasError;
//     }

     public saveAddressToDb() {
//         var nextPage = true;
//         if (this.validateAddress()) {
//             this.navStepperRegisterService.changeMessage('address validation error');
//             return;
//         }
//         if (!this.dirtyFormChecker()) {
//             //if profile verified, set isAddressCompleted (stepper variable) to be true through the service
//             this.navStepperRegisterService.changeMessage('address verified');
//             console.log('didnt save');
//             this.logger.info('skipped save because of no change');
//         }
//         else {
//             // user switched to addressNotProvided provided, but previously having one
//             if (this.orgProfile.addressNotProvided && this.loadedbusinessAddress && this.loadedbusinessAddress.postalCode) {
//                 let decision = window.confirm(('The system detected an existing address. Do you want to delete existing address(es)?'));
//                 if (!decision) {
//                     return;
//                 }
//             }
//             let addressUrl = '/api/v1/data/address/save';
//             let orgProfileToSave;
//             // this.checkType();
//             orgProfileToSave = Object.assign({}, this.orgProfile);
//             orgProfileToSave.version = this.orgProfile.version;
//             orgProfileToSave.siteAddress = Object.assign({}, this.siteAddress);
//             // orgProfileToSave.mailingAddress = Object.assign({}, this.mailingAddress);
//             console.log(orgProfileToSave.businessAddress);
//             console.log(orgProfileToSave.mailingAddress);
//             this.sessionStorage.clearAppData('OrgAddress');
//             this.apiService.callAPIPost(
//                 addressUrl,
//                 orgProfileToSave,
//                 (result) => {
//                     this.setOrganizationAddresses(result);
//                     console.log(result);
//                     //this.logger.info(result);
//                     if (nextPage) {
//                         //should not be able to navigate by clicking save
//                         // this.goNext();
//                     } else {
//                         this.viewState.setMessage(false, 'confirmMsg_changesSaved');
//                     }
//                     //if profile verified, set isAddressCompleted (stepper variable) to be true through the service
//                     this.navStepperRegisterService.changeMessage('address verified');
//                 },
//                 null
//             );
//         }
     }

    goNext() {
        let pageToGo = this.viewState.getNextPage(this.currentPage);
        if (pageToGo) {
            this.step.emit(pageToGo);
        } else {
            this.logger.error('geNext() can not find Next page: ', pageToGo);
        }
    }

//     processCallback() {
//         //pclookup store data in pclookup/postalCode
//         let pclookupRetKey = 'pclookup/' + this.businessAddressEdit.postalCode;
//         if (this.addressLookType === 'mailing') {
//             pclookupRetKey = 'pclookup/' + this.mailingAddressEdit.postalCode;
//         }
//         this.logger.info('addresslooktype' + this.addressLookType);

//         let lookupRetAddress = this.sessionStorage.popAppData(pclookupRetKey);
//         if (lookupRetAddress && lookupRetAddress.typeCode >= 0) {
//             if (this.addressLookType === 'business') {
//                 this.businessAddress = Object.assign({}, lookupRetAddress);
//                 this.setAddressForEdit(this.siteAddress, this.siteAddressEdit);
//                 // this.editingAddressBusiness = Object.assign({}, lookupRetAddress);
//                 // this.setAddressForEdit(this.editingAddressBusiness, this.siteAddressEdit);
//             } else {
//                 this.mailingAddress = Object.assign({}, lookupRetAddress);
//                 this.setAddressForEdit(this.mailingAddress, this.mailingAddressEdit);
//                 // this.editingAddressMailing = Object.assign({}, lookupRetAddress);
//                 // this.setAddressForEdit(this.editingAddressMailing, this.mailingAddressEdit);
//             }
//         }
//     }

//     restoreOrganizationAndAddresses(pageState) {
//         if (pageState) {
//             this.addressLookType = pageState.addressLookType;
//             this.setOrganizationAddresses(pageState.organizationProfile);
//             this.loadedOrganizationProfile = pageState.loadedOrganizationProfile;
//             this.siteAddress = pageState.siteAddress;
//             this.mailingAddress = pageState.mailingAddress;
//             this.siteAddressEdit = pageState.siteAddressEdit;
//             this.mailingAddressEdit = pageState.mailingAddressEdit;
//         }
//     }

//     businessClearProvince() {
//         this.siteAddress.province = '';
//         this.businesschanged = true;
//     }
//     businessReset() {
//         this.businesschanged = false;
//     }

//     mailingClearProvince() {
//         this.mailingAddress.province = '';
//         this.mailingchanged = true;
//     }
//     mailingReset() {
//         this.mailingchanged = false;
//     }
    savePageState() {
        let pageToSave = { siteAddress: null, mailingAddress: null, mailingAddressSameAsSupplierAddress: null, addressNotProvided: null };
        pageToSave.siteAddress = this.siteAddress;
        // pageToSave.mailingAddress = this.mailingAddress;
        // pageToSave.mailingAddressSameAsSupplierAddress = this.orgProfile.mailingAddressSameAsSupplierAddress;
        // pageToSave.addressNotProvided = this.orgProfile.addressNotProvided;
        let pageKey = this.orgId + '/' + 'addressTempStore';
        this.storageService.clearAppData(pageKey);
        this.storageService.storeAppData(pageKey, pageToSave);
    }

//     retrievePageState() {
//         let pageKey = this.orgId + '/' + 'addressTempStore';
//         let pageRetrieved = this.storageService.getAppData(pageKey);
//         if (!(pageRetrieved == null)) {
//             if (pageRetrieved.addressChanged == 'business') {
//                 this.mailingAddress = pageRetrieved.mailingAddress;
//             }
//             else if (pageRetrieved.addressChanged == 'mailing') {
//                 this.siteAddress = pageRetrieved.siteAddress;
//             }
//             else if (pageRetrieved.addressChanged == null) {
//                 this.siteAddress = pageRetrieved.siteAddress;
//                 this.mailingAddress = pageRetrieved.mailingAddress;
//             }
//             this.orgProfile.mailingAddressSameAsSupplierAddress = pageRetrieved.mailingAddressSameAsSupplierAddress;
//             this.orgProfile.addressNotProvided = pageRetrieved.addressNotProvided;
//         }
//         this.storageService.clearAppData(pageKey);
//     }

    changeBusinessFlag() {
        this.restrictedAddress = !this.restrictedAddress;
    }

    changeMailingFlag() {
        this.mailingAddressSameAsSupplierAddress = !this.mailingAddressSameAsSupplierAddress;
        console.log(this.mailingAddressSameAsSupplierAddress)
    }

//     checkTypeBusiness() {
//         if (this.siteAddress.typeCode == 1) {
//                     let tempAdd = Object.assign({}, this.siteAddress);
//                     this.siteAddress = Object.assign({}, this.defaultAddress);
//                     this.siteAddress.line1 = tempAdd.line1;
//                     this.siteAddress.line2 = tempAdd.line2;
//                     this.siteAddress.municipality = tempAdd.municipality;
//                     this.siteAddress.province = tempAdd.province;
//                     this.siteAddress.country = tempAdd.country;
//                     this.siteAddress.postalCode = tempAdd.postalCode;
//                     this.siteAddress.typeCode = 0;
//         }
//     }

//     checkTypeMailing(){
//         if (this.mailingAddress.typeCode == 1) {
//             let tempAdd = Object.assign({}, this.mailingAddress);
//             this.mailingAddress = Object.assign({}, this.defaultAddress);
//             this.mailingAddress.line1 = tempAdd.line1;
//             this.mailingAddress.line2 = tempAdd.line2;
//             this.mailingAddress.municipality = tempAdd.municipality;
//             this.mailingAddress.province = tempAdd.province;
//             this.mailingAddress.country = tempAdd.country;
//             this.mailingAddress.postalCode = tempAdd.postalCode;
//             this.mailingAddress.typeCode = 0;
//         }
//     }
}
