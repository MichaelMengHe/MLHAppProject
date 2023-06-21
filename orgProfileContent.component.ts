import { Component, Input, Output, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { GlobalViewStateService } from '../../services/global-view-state.service';
import { ValidationService } from '../../services/validation.service';
import { UtilityService } from '../../services/utility.service';
import { TypeaheadMatch } from '../../../../node_modules/ngx-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators';
import { LogService } from '../../services/log.service';
import { Page } from '../../models/PageFlow';
//Christina's changes - open modal//
import { MatDialog } from '@angular/material'

import { ChoiceOption, __yesNoOptions, __ownershipTypeOptions, __organizationalTypeOptions, __selectIfisOrg, __flagAsEgms,  } from '../../models/inputOptions';
import { OrgProfileService } from '../../services/orgProfileService';
import { NavStepperRegisterService } from '../../services/navStepperRegisterService'

import { HeaderService } from '../../services/headerService';


@Component({
	selector: 'app-org-profile-content',
	templateUrl: './orgProfileContent-nd.component.html',
	styleUrls: [],
	styles: [`
	.cancel-button.mat-raised-button{
		color: #2680eb !important;
		background-color: white !important;
		border: 2px solid #2680eb !important;
		width:
	}
	
	.mat-dialog-container{
		width: 150%;
	}
	`],
	providers: [ValidationService, UtilityService]
})

export class OrgProfileContentComponent implements OnInit {
	newReg = false;
	yesNoOptions = __yesNoOptions;
	ownershipTypes = __ownershipTypeOptions;
	organizationalTypes = __organizationalTypeOptions;
	ifisOptions = __selectIfisOrg;
	egmsOptions = __flagAsEgms;
	public loadedOrganizationProfile;
	loadingOrganizations;
	requiresWarning = false;
	declareNoBN9 = false;
	hduserHaveAuthorization = false;
	public orgProfile;
	public defaultNewOrganizationProfile = {
		objectId: 0, version: 0,
		businessNumberEligibility: null,
		registeredCharity: null,
		notForProfit: null,
		ownershipType: null, 
		organizationalType: null, 
		registrationStatus: 'Draft'
	};

	affiliationSearch: any = {
		searchText: ''
	};
	orgSearchResults: Observable<any>;
	affiliationSearchNoResult: boolean;
	typeaheadLoading: Boolean;
	private readonly currentPage = Page.OrgProfile;

	eligibleStatuses = ['Draft', 'Submitted', 'Complete'];
	disallowedStatus = '';
	eligibleStatusReasons: string[] = [];

	sub: Subscription;

	// Affiliation Search testing
	// asyncSelected: string;
	// selectedOption: any;

	@Input() orgId;
	@Output() newOrgId = new EventEmitter<Number>();
	@ViewChild('confirmDialog') confirmDialog: TemplateRef<any>;

	@Output() step = new EventEmitter<number>();

	constructor(private apiService: ApiService, public validationService: ValidationService, private route: ActivatedRoute,
		private router: Router, public viewState: GlobalViewStateService, private utilityService: UtilityService,
		private logger: LogService, public orgProfileService: OrgProfileService,
		public navStepperRegisterService: NavStepperRegisterService, private headerService: HeaderService, private dialog: MatDialog) {
		
		//if next (stepper button) is clicked and the form has been changed, saveAndContinue() is executed
		this.sub = this.orgProfileService.changeMessage.subscribe((message) => {
			this.navStepperRegisterService.changeMessage('profile not yet verified');
			if(message === 'verify profile') {
				this.saveAndContinue();
				// let error = this.validateOrganizationProfile();
				// if (error) {
				// 	this.navStepperRegisterService.changeMessage('profile validation error');
				// 	return;
				// }
				// else if (!error && this.dirtyFormChecker()) {
				// 	this.navStepperRegisterService.changeMessage('profile verified');
				// }
				// else if (!error) {
				// 	this.saveToDb(false);
				// 	return;
				// }
			}
			// if (message && !this.dirtyFormChecker()) {
			// 	this.validateOrganizationProfile();
			// }
			// if(message && this.dirtyFormChecker()) {
			// 	this.validateOrganizationProfile();
			// }
		});
		this.headerService.changeMessage.subscribe((message) => {
			if(message === 'register new org') {
				this.updateNewReg();
			}
		});
	}

	updateNewReg() {
		this.newReg = true;
		this.navStepperRegisterService.changeMessage('refresh');
		this.ngOnInit()
		}

	showBN9() {
		if (this.orgProfile.businessNumberEligibility === 'false') {
			return false;
		} else {
			return true;
		}
	}

	ngOnInit() {
		if (this.newReg) {
			this.orgId = 0;
		}
		this.viewState.clearValidationErrors();
		this.loadOrganizationProfile();
		this.viewState.scrollToMessageArea();
		this.orgSearchResults = Observable.create((observer: any) => {
			observer.next(this.affiliationSearch.searchText);
		})
		.pipe(
			mergeMap((token: string) => this.searchOrganizations(token))
		);
		//console.log(this.loadOrganizationProfile);
	}

	ngOnDestroy() {
		if (this.sub) {
			this.sub.unsubscribe();
		}
	}
    goBack() {
        let pageToGo = this.viewState.getPreviousPage(this.currentPage);
        if (pageToGo) {
            this.step.emit(pageToGo);
        } else {
            this.logger.error('goBack() can not find Previous page: ', pageToGo);
        }
    }
    goNext() {
        let pageToGo = this.viewState.getNextPage(this.currentPage);
         if (pageToGo) {
             this.step.emit(pageToGo);
         } else {
             this.logger.error('geNext() can not find Next page: ', pageToGo);
         }
    }
	loadOrganizationProfile() {
		this.orgProfile = Object.assign({}, this.defaultNewOrganizationProfile);
		if (this.orgId > 0) {
			this.apiService.callAPIGet(
				'/api/v1/data/organization/load/' + this.orgId,
				(result) => {
					this.orgProfile = Object.assign({}, result);
					//console.log(this.orgProfile);
					this.setOrganizationProfile(result);
					//ADDED BY SOHAIB: Incomplete/Unnecessary this.orgProfile.ownershipType = 
					//console.log(this.viewState.orgProfile);
					if (this.orgProfile.businessNumberEligibility === 'false') {
						this.declareNoBN9 = true;
					}
					//console.log(result);
				},
				null
			);
		} else {
			this.setOrganizationProfile(this.defaultNewOrganizationProfile);
		}
	}

	setOrganizationProfile(theOrgProfile) {
		this.viewState.setOrgProfile(theOrgProfile);
		if (this.orgProfile.businessNumberEligibility != null) {
			this.orgProfile.businessNumberEligibility = theOrgProfile.businessNumberEligibility.toString();
		}

		if (this.orgProfile.registeredCharity != null) {
			this.orgProfile.registeredCharity = theOrgProfile.registeredCharity.toString();
		}
		if (this.orgProfile.notForProfit != null) {
			this.orgProfile.notForProfit = theOrgProfile.notForProfit.toString();
		}
		if (this.orgProfile.ownershipType != null) {
			this.orgProfile.ownershipType = theOrgProfile.ownershipType.toString();
		}
		if (this.viewState.isUserTypeHelpDesk && !this.viewState.isInLockupRegistrationStatus) {
			this.determineEligibleStatuses();
			this.determineStatusReasonList();
		}
		this.requiresWarning = false;
		this.hduserHaveAuthorization = false;
		this.orgProfile.statusDescription = '';
		this.loadedOrganizationProfile = this.utilityService.objectCopy(this.orgProfile);
	}

	dirtyFormChecker() {
		return !this.utilityService.isEquals(this.loadedOrganizationProfile, this.orgProfile);
	}

	determineEligibleStatuses() {
		let currentStatus = this.orgProfile.registrationStatus;
		//this.logger.debug('current status=' + currentStatus);
		//this.logger.debug('current statusReason=' + this.orgProfile.statusReason);
		if (this.utilityService.isUndefined(currentStatus) || currentStatus === null || currentStatus === '') {
			currentStatus = 'Draft';
		}
		if (currentStatus === 'Draft') {
			this.disallowedStatus = 'Complete';
		} else if (currentStatus === 'Complete') {
			this.disallowedStatus = 'Draft';
		} else if (currentStatus === 'Submitted') {
			this.disallowedStatus = '';
		}
		//this.logger.debug('disallowedStatus=' + this.disallowedStatus);
	}

	determineStatusReasonList() {
		let currentStatus = this.orgProfile.registrationStatus;
		if (this.utilityService.isUndefined(currentStatus) || currentStatus === null || currentStatus === '' || currentStatus === 'Draft') {
			this.eligibleStatusReasons = ['DraftCreated'];
		} else if (currentStatus === 'Submitted') {
			this.eligibleStatusReasons = ['DraftCreated', 'BNNotRequired', 'BNRequiredButNotProvided', 'BNValidationNotSuccessful'];
		} else if (currentStatus === 'Complete') {
			this.eligibleStatusReasons = ['BNNotRequired', 'BNValidationComplete'];
		}

		// wipe out current status reason if it is not in eligibleStatusReasons
		if (this.eligibleStatusReasons.indexOf(this.orgProfile.statusReason) <= -1) {
			this.logger.debug(`determineStatusReasonList(): will wipe out current status reason due to mis-match, current status=${currentStatus}
				, status reason=${this.orgProfile.statusReason}`);
			this.orgProfile.statusReason = '';
		}
		//this.logger.debug('determineStatusReasonList() eligibleStatusReasons:' + this.eligibleStatusReasons);
	}

	warningOnBN9Revalidation() {
		if (this.orgProfile.registrationStatus === 'Draft') {
			return false;
		}
		let oldBN9 = this.loadedOrganizationProfile.businessNumber;
		let oldLegalName = this.loadedOrganizationProfile.legalName;
		let newBN9 = this.orgProfile.businessNumber;
		let newLegalName = this.orgProfile.legalName;
		this.requiresWarning = (oldBN9 !== newBN9 || oldLegalName !== newLegalName);
		this.logger.info('requiresWarning: ' + this.requiresWarning);
		return false;
	}

	searchOrganizations(val): Observable<any> {
		let returnedObs;
		let excludeRegistrationIDs = [];
		excludeRegistrationIDs.push(this.orgId);
		this.orgProfile.affiliationOrganizations.forEach( (affiliateOrg) => {
			excludeRegistrationIDs.push(affiliateOrg.affiliationOrganization.objectId);
		});
		let searchParam = {
			searchRegBy: 'regName',
			registrationID: '',
			legalOrOperatingName: val,
			businessNumber: '',
			excludeRegistrationIDs: excludeRegistrationIDs
		};
		let theOrgId = this.orgId || 0;
		let searchUrl = '/api/v1/data/organization/affiliation/search/' + theOrgId;
		return this.apiService.rawHttp('POST',	searchUrl, searchParam)
			.pipe(	map(result => result.data) );
	}

	affiliationSearchNoResults(event: boolean): void {
		this.affiliationSearchNoResult = event;
	}

	onSelectOrganization(item) {
		let theOrg = item.item;
		let tpaOrganization = { objectId: this.orgId };
		let selectedOrganization = {
			objectId: theOrg.objectId,
			legalName: theOrg.legalName
		};
		let organizationAffiliation = {
			tpaOrganization: tpaOrganization,
			affiliationOrganization: selectedOrganization
		};
		this.addAffiliation(organizationAffiliation);
		this.affiliationSearch.searchText = '';
	}

	removeAffiliation(rowIndex) {
		this.orgProfile.affiliationOrganizations.splice(rowIndex, 1);
	}

	addAffiliation(organizationAffiliation) {
		this.orgProfile.affiliationOrganizations.push(organizationAffiliation);
	}

	private saveToDb(nextPage: boolean) {
		//$scope.clearAll();
		let hasError = this.validateOrganizationProfile();
		let apiError = false;
		if (hasError) {
			this.logger.error('mandatory fields are missing.');
			return false;
		}
		if (this.warningOnBN9Revalidation()) {
			this.navStepperRegisterService.changeMessage('profile validation error');
			return false;
		}
		console.log(this.dirtyFormChecker());
		if (this.orgProfile.objectId <= 0 || this.dirtyFormChecker()) {
			let saveUrl = '/api/v1/data/organization/create';
			if (this.orgProfile.objectId > 0) {
				saveUrl = '/api/v1/data/organization/update';
			}
			if (this.requiresWarning) {
				this.viewState.showModalProcessing();
			}
			console.log(this.orgProfile);
			this.apiService.callAPIPost(
				saveUrl,
				this.orgProfile,
				(result) => {
					console.log(result);
					this.viewState.closeModalProcessing();
					if (this.orgProfile.objectId === 0) {
						this.setOrganizationProfile(result);
						this.newOrgId.emit(result.organizationId);
					}
					if (nextPage) {
						this.setOrganizationProfile(result);
						this.goNext();
					}
					else {
						this.showMessage();
					}
					//if profile verified, set isProfileCompleted (stepper variable) to be true through the service
					this.navStepperRegisterService.changeMessage('profile verified');
				},
				(error) => {
					this.viewState.closeModalProcessing();
					this.navStepperRegisterService.changeMessage('profile validation error');
					return false;
				}
			);
			this.setOrganizationProfile(this.orgProfile);
		}
		else {
			this.logger.info('OrgProfile.save(), skipped because value not changed.');
			this.navStepperRegisterService.changeMessage('profile verified');
			return true;
		}
	}

	showMessage() {
		let code = this.orgProfile.code;
		if (!code) {
			this.viewState.setMessage(false, '150', true);
		}
		else {
			this.viewState.setMessage(false, this.orgProfile.code, true);
		}
	}

	changeDeclareNoBN9Flag() {
		this.declareNoBN9 = !this.declareNoBN9;
		//console.log(this.declareNoBN9);
	}

	changeHDUserAuthorizationFlag() {
		this.hduserHaveAuthorization = !this.hduserHaveAuthorization;
	}

	checkLog(e: any) {
		//console.log(e);
	}

	validateOrganizationProfile() {
		//validationManager.validateForm(angular.element(document.querySelector('#orgProfileForm')) );
		this.viewState.clearValidationErrors();
		let requiredFieldList = [
			'legalName',
			'operatingName',
			'ownershipType',
			'organizationalType',
			'notForProfit',
			'registeredCharity',
			'businessNumberEligibility'
		];

		if (this.orgProfile.organizationalType === 'NoneOfAbove') {
			requiredFieldList.push('organizationalTypeOther');
		}
		if (this.viewState.isUserTypeHelpDesk && this.orgProfile.objectId > 0) {
			requiredFieldList.push('statusCategory');
		}
		let hasError = this.validationService.validateFieldRequired(this.orgProfile, requiredFieldList);
		if (!hasError && this.orgProfile.businessNumberEligibility === 'false' && !this.declareNoBN9) {
			this.viewState.setMessage(true, '120');
			hasError = true;
		}
		if (this.orgProfile.legalName && !this.validationService.isLegalOrOperatingName(this.orgProfile.legalName)) {
			this.viewState.setMessage(true, '113', true);
			hasError = true;
		}
		if (this.orgProfile.operatingName && !this.validationService.isLegalOrOperatingName(this.orgProfile.operatingName)) {
			this.viewState.setMessage(true, '114', true);
			hasError = true;
		}
		if (!hasError && this.viewState.isUserTypeHelpDesk) {
			if (this.orgProfile.statusCategory === 'BN Not Required'
				&& this.orgProfile.registrationStatus === 'Complete'
				&& this.orgProfile.businessNumberEligibility === 'true') {
				this.viewState.setMessage(true, '144');
				hasError = true;
			}
			this.orgProfile.hduserHaveAuthorization = false;
			if (!hasError && !this.hduserHaveAuthorization) {
				this.viewState.setMessage(true, '154');
				hasError = true;
			} else {
				this.orgProfile.hduserHaveAuthorization = true;
			}
			if (!hasError && (!this.orgProfile.statusDescription ||
				this.orgProfile.statusDescription.trim() === '')) {
				this.viewState.setMessage(true, '145');
				hasError = true;
			}
		}
		//console.log('has error ' + hasError);
		return hasError;
	}

	cancel() {
		if (this.orgProfile.objectId > 0 && this.shouldPromptForSave()) {
			this.router.navigateByUrl('/home');
			return;
		} else {
			this.router.navigateByUrl('/home');
		}
	}

	shouldPromptForSave() {
		return (this.orgProfile.savePrompted === 'false'
			&& this.orgProfile.registrationStatus === 'Draft'
			&& this.orgProfile.objectId > 0
			&& (this.viewState.admin || this.viewState.isUserTypeHelpDesk));
	}

	saveAndContinue() {
		let error = this.saveToDb(false);
		
		if (error) {
			this.goNext();
			//console.log(error);
		}
	}

	openConfirmDialog() {
        let dialogRef = this.dialog.open(this.confirmDialog, {width: '50%'});
        dialogRef.afterClosed().subscribe(result => {
            // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
            if (result !== undefined) {
                if (result === 'yes') {
					// TODO: Replace the following line with your code.
					this.saveAndContinue();
                } else if (result === 'no') {
                    // TODO: Replace the following line with your code.
                }
            }
        })
    }

}