const chromium = require("chrome-aws-lambda");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    let browser = await chromium.puppeteer.launch({
      // Required
      executablePath: await chromium.executablePath,

      // Optional
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const user_id = "gangpo1";
    const user_pw = "pw1111";

    await page.goto("https://www.isolarcloud.com.hk");
    await page.click(".agree-btn");
    await page.evaluate(
      (id, pw) => {
        document.querySelector("#userAcct").value = id;
        document.querySelector("#userPswd").value = pw;
      },
      user_id,
      user_pw
    );
    await page.waitFor(2000);

    await page.click("#login-btn");
    await page.waitFor(2000);

    await page.click(".privacy-agree");
    await page.waitFor(5000);

    const content = await page.content();

    let currentPower_text = await page.waitFor("#currentpower");
    // console.log(irra_text);
    let currentpower = await page.evaluate(
      (currentPower_text) => currentPower_text.textContent,
      currentPower_text
    );
    console.log(`현재출력 ${currentpower}`);

    let todaypower_text = await page.waitFor("#todaypower");
    // console.log(irra_text);
    let todaypower = await page.evaluate(
      (todaypower_text) => todaypower_text.textContent,
      todaypower_text
    );
    console.log(`오늘발전량 ${todaypower}`);
    // console.log($("#currentpower"));

    let currentUnit_text = await page.waitFor("#currentUnit");
    // console.log(irra_text);
    let currentUnit = await page.evaluate(
      (currentUnit_text) => currentUnit_text.textContent,
      currentUnit_text
    );
    console.log(`현재출력단위 ${currentUnit}`);
    // console.log($("#currentpower"));

    let todayUnit_text = await page.waitFor("#todayUnit");
    // console.log(irra_text);
    let todayUnit = await page.evaluate(
      (todayUnit_text) => todayUnit_text.textContent,
      todayUnit_text
    );
    console.log(`오늘발전량단위 ${todayUnit}`);

    let date = new Date(Date.now() + 1000 * 60 * 60 * 9); //한국시간
    const datetime = date.toISOString(); // 2019-08-02T01:34:16.278Z 이런식으로 출력된다

    let name = "GU2103020I-I1";
    let powerTotalAC = currentpower;
    let energyToday = todaypower;

    if (currentUnit == "MW") {
      powerTotalAC = powerTotalAC * 1000;
    }

    if (todayUnit == "MWh") {
      energyToday = energyToday * 1000;
    }

    let operStatus = 0;

    if (powerTotalAC > 0) {
      operStatus = 1;
    }

    let params = {
      TableName: "RTUData", //데이터 insert할 테이블 이름
      Item: {
        ID: { S: name }, //인버터 아이디
        dataTimeStamp: { S: datetime }, //정렬키(sort key)는 현재 한국 시간
        powerTotalAC: { N: String(powerTotalAC) },
        energyTodayTotal: { N: String(energyToday) },
        operStatus: { N: String(operStatus) },
      },
    };

    dynamodb.putItem(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
    await page.waitFor(5000);

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
