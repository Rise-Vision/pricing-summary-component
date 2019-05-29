const assert = require("assert");
COMPLETION_TIMEOUT = 10000;
RETRY_DELAY = 3000;

describe("pricing-summary-component", ()=>{
  browser.url("http://localhost:8080/pricing-summary-component-test.html");
  it("passes in-browser tests", ()=>{
    let allTestsPassed = null;

    browser.waitUntil(()=>{
      let allTestsCompleted = false;

      const results = browser.execute(()=>{
        return checkTests();

        function checkTests(suites = [window.mocha.suite]) {
          console.log(suites.length)
          return suites.reduce((results, suite)=>{
            console.log("Suite count: ", suite.suites.length);

            const testResults = suite.tests.map(test=>({
              state: test.state || null,
              title: test.title,
              suite: suite.title
            }));

            return results.concat(testResults).concat(checkTests(suite.suites));
          }, []);
        }
      });

      console.log(results);
      allTestsCompleted = results.every(result=>result.state !== null);
      allTestsPassed = results.every(result=>result.state === "passed");

      return allTestsCompleted;
    }, COMPLETION_TIMEOUT, "Timed out waiting for all tests to finish", RETRY_DELAY);

    assert(allTestsPassed);
  });
});
