const chromium = require("chrome-aws-lambda");
var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-northeast-2",
});
let lambda = new AWS.Lambda();

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    let browser = await chromium.puppeteer.launch({
      // Required
      executablePath: await chromium.executablePath,

      // Optional
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: false,
    });

    const page = await browser.newPage();
    const naver_id = "gangpo1";
    const naver_pw = "pw1111";

    page.setDefaultNavigationTimeout(0);
    await page.goto("https://www.isolarcloud.com.hk");

    await page.click(".agree-btn");
    await page.evaluate(
      (id, pw) => {
        document.querySelector("#userAcct").value = id;
        document.querySelector("#userPswd").value = pw;
      },
      naver_id,
      naver_pw
    );
    await page.waitFor(2000);

    await page.waitFor("#login-btn");
    await page.waitFor(2000);

    await page.waitFor(".privacy-agree");
    await page.waitFor(2000);
    await page.waitFor(5000);

    const content = await page.content();
    console.log(content);

    // let currentPower_text = await page.waitFor("#currentpower");
    // // console.log(irra_text);
    // let currentpower = await page.evaluate(
    //   (currentPower_text) => currentPower_text.textContent,
    //   currentPower_text
    // );
    // console.log(`현재출력 ${currentpower}`);

    // let todaypower_text = await page.waitFor("#todaypower");
    // // console.log(irra_text);
    // let todaypower = await page.evaluate(
    //   (todaypower_text) => todaypower_text.textContent,
    //   todaypower_text
    // );
    // console.log(`오늘발전량 ${todaypower}`);
    // // console.log($("#currentpower"));

    // let currentUnit_text = await page.waitFor("#currentUnit");
    // // console.log(irra_text);
    // let currentUnit = await page.evaluate(
    //   (currentUnit_text) => currentUnit_text.textContent,
    //   currentUnit_text
    // );
    // console.log(`현재출력단위 ${currentUnit}`);
    // // console.log($("#currentpower"));

    // let todayUnit_text = await page.waitFor("#todayUnit");
    // // console.log(irra_text);
    // let todayUnit = await page.evaluate(
    //   (todayUnit_text) => todayUnit_text.textContent,
    //   todayUnit_text
    // );
    // console.log(`오늘발전량단위 ${todayUnit}`);

    // let date = new Date(Date.now() + 1000 * 60 * 60 * 9); //한국시간
    // let name = "GU2103020I-I1";
    // let powerTotalAC = currentpower;
    // let energyToday = todaypower;

    // // console.log($("#currentpower"));
    // let jsonData = {
    //   ID: name,
    //   dataTimeStamp: date,
    //   powerTotalAC: powerTotalAC,
    //   energyTodayTotal: energyToday,
    //   currentUnit: currentUnit,
    //   todayUnit: todayUnit,
    // };

    // var params = {
    //   FunctionName: "crawling_sungrow",
    //   Payload: JSON.stringify({
    //     data: jsonData,
    //   }),
    // };

    // lambda.invoke(params, function (err, data) {
    //   if (err) console.log(err, err.stack);
    //   else {
    //     console.log("lambda invoke success");
    //   }
    // });

    await browser.close();
  } catch (error) {
    console.log("==================\n");
    console.log(error, "\n");
    console.log("===================\n");
    console.log(error.message, "\n");
    console.log("===================\n");
  } finally {
    console.log("everything is done");
  }
};
