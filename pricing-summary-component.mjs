import {PolymerElement, html} from "https://unpkg.com/@polymer/polymer@next/polymer-element.js?module"

class PricingSummaryComponent extends PolymerElement {
  static get properties() {
    return {
      showDisplayCountSection: {type: Boolean, value: false},
      displayCountText: {type: String, value: "How many Displays do you want?"},
      displayCount: {type: Number, value: 2, reflectToAttribute: true, notify: true},
      showCountBox: {type: Boolean, value: false},
      showDiscountSection: {type: Boolean, value: false},
      applyDiscount: {type: Boolean, value: false, reflectToAttribute: true, notify: true},
      discountPrompt: {type: String, value: "Are you a school or a non-profit?"},
      discountPromptYesText: {type: String, value: "(get a 10% discount)"},
      discountPromptNoText: {type: String, value: ""},
      showPeriodSection: {type: Boolean, value: false},
      periodYearlyText: {type: String, value: "I want to pay yearly"},
      periodMonthlyText: {type: String, value: "I want to pay monthly"},
      period: {type: String, value: "yearly", reflectToAttribute: true, notify: true},
      periodYearly: {type: Boolean, computed: "isYearly(period)"},
      periodMonthly: {type: Boolean, computed: "isMonthly(period)"},
      pricingData: {type: Object, value: {}},
      yearlySavings: {type: String, computed: "getYearlySavings(pricingData)"}
    };
  }

  updateDisplayCount() {
    const sliderCount = this.shadowRoot.getElementById("displayCountSlider").value;

    if (sliderCount === "100") {
      const boxCount = parseInt(this.shadowRoot.getElementById("displayCountBox").value) || 100;

      this.set("displayCount", Math.max(boxCount, 100));
      this.shadowRoot.getElementById("displayCountBox").value = this.displayCount;
    } else {
      this.set("displayCount", sliderCount);
    }
  }

  updateCountBox() {
    this.updateDisplayCount();
    this.updateCountBoxVisibility();
  }

  updateCountBoxVisibility() {
    this.set("showCountBox", parseInt(this.displayCount) >= 100);
  }

  discountYes() {
    this.applyDiscount = true;
  }

  discountNo() {
    this.applyDiscount = false;
  }

  setYearly() {
    this.period = "yearly";
  }

  setMonthly() {
    this.period = "monthly";
  }

  isYearly(period) {return period === "yearly"}
  isMonthly(period) {return period === "monthly"}
  getYearlySavings(pricingData) {
    if (Object.keys(pricingData).length === 0) {return "";}

    const monthlyPlan = pricingData.filter(plan=>{
      return plan.period === 1 && plan.period_unit === "month" && plan.currency_code === "USD";
    })[0];

    const yearlyPlan = pricingData.filter(plan=>{
      return plan.period === 1 && plan.period_unit === "year" && plan.currency_code === "USD";
    })[0];

    if (!monthlyPlan || !yearlyPlan) {return "";}

    const monthlyPrice = monthlyPlan.tiers.filter(tier=>{
      const upperPrice = tier.ending_unit ? tier.ending_unit : Number.MAX_SAFE_INTEGER;

      return tier.starting_unit <= this.displayCount && upperPrice >= this.displayCount;
    })[0].price;

    const yearlyPrice = yearlyPlan.tiers.filter(tier=>{
      const upperPrice = tier.ending_unit ? tier.ending_unit : Number.MAX_SAFE_INTEGER;

      return tier.starting_unit <= this.displayCount && upperPrice >= this.displayCount;
    })[0].price;

    const savings = (monthlyPrice * 12) - yearlyPrice;

    return `Save $${savings} every year!`;
  }

  static get template() {
    return html`
      <style>
        #main {
          width: 25em;
          text-align: center;
        }
        section {
          margin-bottom: 2em;
        }
        .toggleContainer {
          display: flex;
          align-items: stretch;
          border: solid 1px #292b2c;
          border-radius: 4px;
          width: 100%
        }
        .discountOption {
          width: 50%;
          cursor: pointer;
        }
        .discountOption span {
          font-size: small;
        }
        .discountOption[selected] {
          background-color: #e8e8e8;
        }
        .discountOption[selected]::after {
          content: "\\002714";
          margin: 0.5em;
        }
        .promptText {
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        #displayCountSlider {
          outline: none
        }
        #displayCountBox {
          text-align: center;
          width: 4em;
          margin: 0.5em 0;
        }
        input[type=range] {
          -webkit-appearance: none;
          height: 12px;
          width: 100%;
          margin: 0;
          padding-top: 0.5em;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: black;
          margin-top: -5;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 10px;
          background: #e8e8e8;
          border-radius: 3px;
        }
      </style>
      <div id="main">

        <section id="displayCountSection" hidden=[[!showDisplayCountSection]]>
          <div class="promptText">[[displayCountText]]</div>
          <div id="displayCountText" hidden=[[showCountBox]]>[[displayCount]]</div>
          <input type="text" id="displayCountBox" on-change="updateCountBox" hidden=[[!showCountBox]] value=[[displayCount]] />
          <input id="displayCountSlider" on-input="updateDisplayCount" on-change="updateCountBoxVisibility" type="range" value="{{displayCount}}">
        </section>

        <section id="discountSection" hidden=[[!showDiscountSection]]>
          <div class="promptText">[[discountPrompt]]</div>
          <div id=discountContainer class="toggleContainer">
            <div id="discountYes" on-click="discountYes" class="discountOption" selected$=[[applyDiscount]]>Yes <span>[[discountPromptYesText]]</span></div>
            <div id="discountNo" on-click="discountNo" class="discountOption" selected$=[[!applyDiscount]]>No [[discountPromptNoText]]</div>
          </div>
        </section>

        <section id="periodSection" hidden=[[!showPeriodSection]]>
          <div id=periodContainer class="toggleContainer">
            <div id="periodYearly" on-click="setYearly" class="discountOption" selected$=[[periodYearly]]>[[periodYearlyText]] <span>[[yearlySavings]]</span></div>
            <div id="periodMonthly" on-click="setMonthly" class="discountOption" selected$=[[periodMonthly]]><div>[[periodMonthlyText]]</div></div>
          </div>
        </section>
      </div>
    `;
  }
}

window.customElements.define("pricing-summary-component", PricingSummaryComponent);
