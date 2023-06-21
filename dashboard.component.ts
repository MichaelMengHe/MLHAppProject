import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { BaseComponent } from '../base/baseComponent';
import { DashboardDrawComponent } from './dashboard-draw.component';
import { FundingService } from '../../services/funding.service';
import { FundingElement } from '../../models/fundingElement';
import { MultipleChartComponent } from './multiple-chart.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [FundingService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  @Input() defaultView: boolean;
  // @ViewChild(DashboardDrawComponent) drawComponentReference;
  @ViewChild(MultipleChartComponent) drawComponentReference;
  ministryList = [];
  orgList = [];
  progList = [];
  programList = [];
  fiscalList = [];
  selectedOrg = [];
  selectedMinistry = [];
  selectedProgram = [];
  selectedFiscal = [];
  fundingData: FundingElement[];
  constructor(private fundingService: FundingService) {
    super(null);
  }

  ngOnInit() {
    if (this.defaultView === undefined) {
      this.defaultView = false;
    }
    
  }

  loadData() {
    this.fundingData = this.drawComponentReference.fundingData;
    this.setMinistryList();
    this.setOrgList();
    this.setProgramList();
    this.setFiscalList();    
  }

 
  private setMinistryList() {
    this.ministryList = Array.from(new Set(this.fundingData.map(s => s["minId"])))
      .map(item => {
        return {
          value: item,
          label: this.fundingData.find(s => s["minId"] == item)["minName"]
        }
      });
  }

  private setOrgList() {
    this.orgList = Array.from(new Set(this.fundingData.map(s => s["orgId"])))
      .map(item => {
        return {
          value: item,
          label: this.fundingData.find(s => s["orgId"] == item)["orgName"]
        }
      });
  }

  private setProgramList() {
    this.programList = Array.from(new Set(this.fundingData.map(s => s["progId"])))
      .map(item => {
        return {
          value: item,
          label: this.fundingData.find(s => s["progId"] == item)["progName"]
        }
      })
  }

  private setFiscalList() {
    this.fiscalList = Array.from(new Set(this.fundingData.map(s => s["name"])))
      .map(item => {
        return {
          value: item,
          label: item + "-" + (Number.parseInt(item) + 1).toString()
        }
      });
  }

  selectionChanged(e: any) {
    this.drawComponentReference.fundingData = this.fundingData.filter((item) => {
      return (this.selectedMinistry.length === 0 || this.selectedMinistry.includes(item["minId"])) &&
        (this.selectedProgram.length === 0 || this.selectedProgram.includes(item["prodId"])) &&
        (this.selectedFiscal.length === 0 || this.selectedFiscal.includes(item["name"])) &&
        (this.selectedOrg.length === 0 || this.selectedOrg.includes(item["orgId"]));
    });

    this.drawComponentReference.analyzeFundingData();
    this.drawComponentReference.generateTableDate();
  }

  // private analyzeFundingData(fundingData: object[]) {
  //   var totalFundReceived = 0
  //   fundingData.forEach((item) => {
  //     totalFundReceived += item["value"];
  //   });

  //   var averagePerYear = totalFundReceived / fundingData.length;
  //   var recentlyApproved = fundingData[fundingData.length-1]["progName"];

  //   this.drawComponentReference.totalFundReceived = totalFundReceived;
  //   this.drawComponentReference.averagePerYear = averagePerYear;
  //   this.drawComponentReference.recentlyApproved = recentlyApproved;
  // }
}
