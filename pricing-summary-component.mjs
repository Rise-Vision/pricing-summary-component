import {PolymerElement, html} from "https://unpkg.com/@polymer/polymer@3.2.0/polymer-element.js?module"

class PricingSummaryComponent extends PolymerElement {
  static get properties() {
    return {
      displayCount: {type: Number, value: 2, reflectToAttribute: true, notify: true},
      applyDiscount: {type: Boolean, value: false, reflectToAttribute: true, notify: true},
      period: {type: String, value: "yearly", reflectToAttribute: true, notify: true},
      monthText: {type: String, computed: "getMonthText(period)"},
      monthOrYearText: {type: String, computed: "getMonthOrYearText(period)"},
      pricingData: {type: Object, value: {}},
      priceTotal: {type: String, notify: true, computed: "getPriceWithDiscount(pricingData, applyDiscount, period, displayCount)"},
      pricePerDisplay: {type: Number, computed: "getMonthlyPricePerDisplay(pricingData, period, displayCount)"},
      industryDiscount: {type: String, computed: "getIndustryDiscount(pricingData, period, displayCount)"}
    };
  }

  getMonthText(period) {return period === "yearly" ? " x 12 months" : "";}
  getMonthOrYearText(period) {return period === "yearly" ? "year" : "month";}

  getIndustryDiscount(pricingData, period, displayCount) {
    const tierPricePennies = this.getTierPricePennies(pricingData, period, displayCount);

    return this.withCommaSep((tierPricePennies * displayCount * 0.10 / 100).toFixed(2));
  }

  getTierPricePennies(pricingData, period, displayCount) {
    if (!pricingData || pricingData.failed || Object.keys(pricingData).length === 0) {return 0;}
    if (displayCount === 0) {return 0;}

    const monthlyPlan = pricingData.filter(plan=>{
      return plan.period === 1 && plan.period_unit === "month" && plan.currency_code === "USD";
    })[0];

    const yearlyPlan = pricingData.filter(plan=>{
      return plan.period === 1 && plan.period_unit === "year" && plan.currency_code === "USD";
    })[0];

    if (!monthlyPlan || !yearlyPlan) {return 0;}

    const monthlyPrice = monthlyPlan.tiers.filter(tier=>{
      const upperPrice = tier.ending_unit ? tier.ending_unit : Number.MAX_SAFE_INTEGER;

      return tier.starting_unit <= displayCount && upperPrice >= displayCount;
    })[0].price;

    const yearlyPrice = yearlyPlan.tiers.filter(tier=>{
      const upperPrice = tier.ending_unit ? tier.ending_unit : Number.MAX_SAFE_INTEGER;

      return tier.starting_unit <= displayCount && upperPrice >= displayCount;
    })[0].price;

    return period === "yearly" ? yearlyPrice : monthlyPrice;
  }

  getMonthlyPricePerDisplay(pricingData, period, displayCount) {
    const pricePennies = this.getTierPricePennies(pricingData, period, displayCount);
    const monthlyPennyPrice = period === "yearly" ? pricePennies / 12 : pricePennies;

    return (monthlyPennyPrice / 100).toFixed(2);
  }

  getAnnualPrice(pricingData, period, displayCount) {
    const pricePennies = this.getTierPricePennies(pricingData, period, displayCount);
    const annualPricePennies = period === "yearly" ? pricePennies : pricePennies * 12;

    return (annualPricePennies / 100 * displayCount).toFixed(2);
  }

  getPriceWithDiscount(pricingData, applyDiscount, period, displayCount) {
    const pricePennies = this.getTierPricePennies(pricingData, period, displayCount);
    const discountPricePennies = applyDiscount ? pricePennies * 0.9 : pricePennies;

    return this.withCommaSep((discountPricePennies / 100 * displayCount).toFixed(2));
  }

  withCommaSep(stringVal) {
    return Number(stringVal).toLocaleString();
  }

  pluralDisplays(displayCount) {
    return displayCount > 1 ? "s" : "";
  }

  inlineOrBlock(applyDiscount) {
    return applyDiscount ? "block" : "inline";
  }

  static get template() {
    return html`
      <style>
        section {
          text-align: center;
        }
        .inline {
          display: inline;
        }
        .block {
          display: block;
        }
        #discount {
          color: #3dbd51;
        }
        #total {
          font-weight: bold;
        }
      </style>
      <section>
        <div id="summary" class$=[[inlineOrBlock(applyDiscount)]]>
          [[displayCount]] Display[[pluralDisplays(displayCount)]] x $[[pricePerDisplay]][[monthText]]
        </div>
        <div id="discount" hidden=[[!applyDiscount]]>
          - $[[industryDiscount]] per [[monthOrYearText]] Education and Non-Profit Discount
        </div>
        <div id="total" class$=[[inlineOrBlock(applyDiscount)]]>= $[[priceTotal]] per [[monthOrYearText]]</div>
      </section>
    `;
  }
}

window.customElements.define("pricing-summary-component", PricingSummaryComponent);
