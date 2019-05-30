import {PolymerElement, html} from "https://unpkg.com/@polymer/polymer@next/polymer-element.js?module"

class PricingSummaryComponent extends PolymerElement {
  static get properties() {
    return {
      displayCount: {type: Number, value: 2, reflectToAttribute: true, notify: true},
      applyDiscount: {type: Boolean, value: false, reflectToAttribute: true, notify: true},
      period: {type: String, value: "yearly", reflectToAttribute: true, notify: true},
      monthText: {type: String, computed: "getMonthText(period)"},
      monthOrYearText: {type: String, computed: "getMonthOrYearText(period)"},
      pricingData: {type: Object, value: {}},
      priceTotal: {type: Number, computed: "getPriceWithDiscount(pricingData, applyDiscount, period, displayCount)"},
      pricePerDisplay: {type: Number, computed: "getMonthlyPricePerDisplay(pricingData, period, displayCount)"},
      industryDiscount: {type: Number, computed: "getIndustryDiscount(pricingData, period, displayCount)"}
    };
  }

  getMonthText(period) {return period === "yearly" ? "12 months" : "1 month";}
  getMonthOrYearText(period) {return period === "yearly" ? "year" : "month";}

  getIndustryDiscount(pricingData, period, displayCount) {
    const tierPricePennies = this.getTierPricePennies(pricingData, period, displayCount);

    return (tierPricePennies * displayCount * 0.10 / 100).toFixed(2);
  }

  getTierPricePennies(pricingData, period, displayCount) {
    if (!pricingData || pricingData.failed || Object.keys(pricingData).length === 0) {return 0;}

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

    return (discountPricePennies / 100 * displayCount).toFixed(2);
  }

  static get template() {
    return html`
      <style>
        section {
          text-align: center;
        }
        #discount span{
          background-color: #fcf5bf;
          font-style: italic;
          color: #3dbd51;
          font-weight: bold;
        }
      </style>
      <section>
        <div id="summary">
          [[displayCount]] Displays x $[[pricePerDisplay]] x [[monthText]]
        </div>
        <div id="discount" hidden=[[!applyDiscount]]>
          <span>- $[[industryDiscount]] per [[monthOrYearText]] Education and Non-Profit Discount</span>
        </div>
        <div id="total">= $[[priceTotal]] per [[monthOrYearText]]</div>
      </section>
    `;
  }
}

window.customElements.define("pricing-summary-component", PricingSummaryComponent);
