const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const BASE = "https://www.officequotes.net/"

// Adapted from https://github.com/cheeriojs/cheerio/issues/839#issuecomment-205077830
function cleanQuote($, html) {
  var breakToken = "_______break_______",
    lineBreakedHtml = html
      .replace(/<br\s?\/?>/gi, breakToken)
      .replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + "$1" + breakToken);
  return $("<div>")
    .html(lineBreakedHtml)
    .text()
    .replace(new RegExp(breakToken, "g"), "\n")
    .split("\n")
    .map((t) => t.trim())
    .join("\n");
}

async function scrape(url) {
  console.log("Scraping", url);
  const contents = await axios.get(BASE + url);

  const $ = cheerio.load(contents.data);

  const quotes = $(".quote")
    .map(function () {
      return cleanQuote($, $(this).html());
    })
    .get();

  console.log(quotes[0]);

  return quotes;
}

async function run() {
  const homepage = await axios.get(BASE)
  const $ = cheerio.load(homepage.data)

  let hrefs = new Set()

  $("a").each((i, el) => {
      const href = $(el).attr("href")
      console.log(href);
      if (href && href.startsWith("/no")) {
        hrefs.add(href)
      }
  })

  console.log(hrefs);

  hrefs = Array.from(hrefs)

  let results = [];

  for (i in hrefs) {
    const h = hrefs[i];
    try {
      const quotes = await scrape(h);
      results.push(
        ...quotes.map((q) => ({
          text: q.trim(),
          ep: h.slice(1).replace(".php", ""),
        }))
      );
      console.log(h, "complete");
    } catch (e) {
      console.log(h, "failed", e);
    }
  }

  fs.writeFileSync("./quotes.json", JSON.stringify(results));
}

run();
