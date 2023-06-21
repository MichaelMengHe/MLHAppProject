import { Component, Input } from '@angular/core';


@Component({
  selector: 'tpcr-address-widget',
  template: `
  <div class="row">

  <div *ngIf="address && address.province" class="col-md-12">

    <div *ngIf="address.typeCode == 0" >

        <div class="col-md-12" *ngIf="address.line1">{{address.line1|uppercase}}</div>

        <div class="col-md-12" *ngIf="address.line2">{{address.line2|uppercase}}</div>

    </div>


    <div *ngIf="address.typeCode == 1 || address.typeCode == 2">

        <div class="col-md-12" style="text-transform: uppercase"

        *ngIf="address.unitTypeCode||address.unitNumber||address.civicNumber||address.civicNumberSuffix||
        address.streetName||address.streetType||address.streetDirectionCode">

        <span *ngIf="address.unitNumber">{{address.unitTypeCode|translate|uppercase}} {{address.unitNumber}}, </span>

        {{address.civicNumber}} {{address.civicNumberSuffix |uppercase}}

        {{address.streetName |uppercase}} {{address.streetType |uppercase}} {{address.streetDirectionCode |uppercase}}

        </div>

    </div>

    <div *ngIf="address.typeCode == 2 || address.typeCode == 4">

        <div class="col-md-12" *ngIf="address.ruralRouteNumber||address.ruralRouteType">

            <span *ngIf="address.ruralRouteNumber">{{address.ruralRouteNumber}}&nbsp;</span>

            <span *ngIf="address.ruralRouteType">{{address.ruralRouteType | uppercase}}&nbsp;</span>

        </div>

    </div>

    <div *ngIf="address.typeCode >= 3">

        <div class="col-md-12" *ngIf="address.poboxNumber||address.deliveryType||address.deliveryMode||address.deliveryId">

            <span *ngIf="address.poboxNumber">P.O.&nbsp;BOX&nbsp;{{address.poboxNumber}},</span>

            <span *ngIf="address.deliveryType">{{address.deliveryType|uppercase}}&nbsp;</span>

            <span *ngIf="address.deliveryMode">{{address.deliveryMode|uppercase}}&nbsp;</span>

            <span *ngIf="address.deliveryId">{{address.deliveryId|uppercase}}&nbsp;</span>

        </div>

    </div>

    <div class="col-md-12" *ngIf="address.municipality||address.province||address.country||address.postalCode">

        {{address.municipality|uppercase}}, {{address.province|uppercase}} {{address.country |uppercase}} {{address.postalCode|uppercase}}

    </div>


  </div>

</div>

  `
})
export class TpcrAddressWidgetComponent {
    @Input() public address;
}
