# pricing-summary-component

UI Component showing a summary of yearly or monthly cost

# Usage

As a no-build html import

``` html
<html>
  <head>
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.2.10/webcomponents-loader.js"></script>
    <script type="module" src="pricing-summary-component.mjs"></script>
  </head>
  <body>
    <pricing-summary-component></pricing-summary-component>
  </body>
</html>
```

As a node import

``` bash
npm install Rise-Vision/pricing-summary-component
```

Then in a parent component that is an entry point for a bundler

``` js
import "pricing-summary-component/lib/pricing-summary-component.js"
```

The webcomponents-loader.js is a Polymer [requirement](https://polymer-library.polymer-project.org/3.0/docs/polyfills).
It is required in both cases.

# Attribute configuration

 - apply-discount
 - pricing-data
 - period ("yearly" | "monthly")
 - display-count

# Development

Change the .mjs file then test, build, commit.

`npm run build` will update the `lib` dir and merging that to master is a release for the node library.

The html import is deployed as part of the circle-ci job via GCS update


### Demo

Start a local http server and load pricing-summary-component-demo.html in browser.

### Testing

#### Live browser test

Start a local http server and then browse to pricing-summary-component-test.html.
It's best to load with devtools open and cache disabled.

#### Webdriver test

Start a local http server.

Start chromedriver.

``` bash
npm install
npm run test-ci

```

--------

This project does not use WCT since it is fragile and [not well supported](https://github.com/Polymer/tools/issues/3398).
