// node 1_HackerRankAutomation.js --url=https://www.hackerrank.com --config=config.json
// enter userid, password of hackerrank and moderator to be added in config.json

// npm init -y
// npm i minimist puppeteer

let minimist = require('minimist');
let fs = require('fs');
let puppeteer = require('puppeteer');

let args = minimist(process.argv);
let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);
// console.log(config);

// headless: false se cheeze hoti hui dikhayi degi

// let browserLaunchKaPromis = puppeteer.launch({headless:false});
// browserLaunchKaPromis.then(function(browser){
//   let pagesKaPromise = browser.pages();
//   pagesKaPromise.then(function(pages){
//     let responseKaPromise = pages[0].goto(args.url);
//     responseKaPromise.then(function(response){
//       let closeKaPromise = browser.close();
//       closeKaPromise.then(function(){
//         console.log("closed");
//       })
//     })
//   })
// })

// doosra tareeka likhne ka
// manlo koyi ek cheez hai jo promise kar rha hai lekin aap direct maal chahate ho tuh hum await use karte hai
// rule -> await ko async function mei likhna hota hai

async function init(){
  let browser = await puppeteer.launch({
    headless:false,
    args: [
      '--start-maximized'
    ],
    defaultViewport: {
      width: 1366,
      height: 768,
      isMobile: false
    }
  });
  let pages = await browser.pages();
  let page = pages[0];

  await page.goto(args.url);

  await page.waitForSelector("a[data-event-action='Login']");
  await page.click("a[data-event-action='Login']")

  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
  await page.click("a[href='https://www.hackerrank.com/login']");

  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']",configJSO.userid,{delay: 100});

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']",configJSO.password,{delay: 100});

  await page.waitForSelector("button[data-analytics='LoginPassword']");
  await page.click("button[data-analytics='LoginPassword']");

  await page.waitForSelector("a[data-analytics='NavBarContests']");
  await page.click("a[data-analytics='NavBarContests']");

  await page.waitForSelector("a[href='/administration/contests/']");
  await page.click("a[href='/administration/contests/']");

  // find all urls of same page
  await page.waitForSelector("a.backbone.block-center");
  // $$eval method runs Array.from(document.querySelectorAll(selector)) within the page and passes the result as the first argument to the pageFunction.
  let contestUrls = await page.$$eval("a.backbone.block-center", function(atags){
    let urls = [];

    for(let i = 0; i < atags.length; i++){
      let url = atags[i].getAttribute("href");
      urls.push(url);
    }

    return urls;
  })
  
  // handleAPage(contestUrls);
  // console.log(contestUrls);

  await page.waitFor(3000);
  
  for(let i = 0; i < contestUrls.length; i++){
    let contestTab = await browser.newPage();
    
    await handleContest(contestTab, args.url + contestUrls[i], configJSO.moderators);

    await contestTab.close();
    await contestTab.waitFor(2000);
  }
}

async function handleContest(contestTab, fullContestUrl, moderator){
  
  await contestTab.bringToFront();
  await contestTab.goto(fullContestUrl);
  await contestTab.waitFor(1000);

  await contestTab.waitForSelector("li[data-tab='moderators']");
  await contestTab.click("li[data-tab='moderators']");

  await contestTab.waitForSelector("input#moderator");
  await contestTab.type("input#moderator", configJSO.moderators,{delay: 100});

  await contestTab.keyboard.press("Enter");
  await contestTab.waitFor(1500);
}

init();