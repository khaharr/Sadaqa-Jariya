import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import prisma from "../lib/prisma.ts";
import { URL } from "url";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";
const THROTTLE_MS = 1500;
const CONCURRENCY = 2;
const MAX_PAGES = 100;
const listingRoots = ["https://www.cotizup.com/campaigns/religion"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchUrl(url) {
  return axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 15000,
  });
}

/* --- extraire toutes les cagnottes directement depuis la page de listing --- */
async function extractCampaignsFromListing(url) {
  try {
    const res = await fetchUrl(url);
    const $ = cheerio.load(res.data);
    const campaigns = [];

    $("article.col-lg-4").each((_, el) => {
      const relativeHref = $(el).find("a.thumbnail").attr("href");
      if (!relativeHref) return;

      const lien = relativeHref.startsWith("http")
        ? relativeHref
        : new URL(relativeHref, url).href;

      const titre =
        $(el).find("h2.all-collect").first().text().trim() ||
        $(el).find(".organize-by-all span").first().text().trim() ||
        "Sans titre";

      const image =
        $(el)
          .find(".img-bg-collect")
          .first()
          .attr("style")
          ?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || "";

      const dateText = $(el)
        .find(".organize-by-all")
        .text()
        .match(/le\s+([0-9]{1,2}\s+\w+\s+[0-9]{4})/i);
      const start_date = dateText ? new Date(dateText[1]) : null;

      campaigns.push({
        titre,
        lien,
        image,
        start_date,
        status: "open",
        platform: "cotizup",
        scraped_at: new Date(),
      });
    });

    return campaigns;
  } catch (err) {
    console.warn("⚠️ Erreur listing:", url, err.message);
    return [];
  }
}

async function main() {
  try {
    const limit = pLimit(CONCURRENCY);
    const allCampaigns = [];

    for (const root of listingRoots) {
      console.log("🚀 Scraping catégorie:", root);
      let page = 1;

      while (page <= MAX_PAGES) {
        const url = page === 1 ? root : `${root}?page=${page}`;
        console.log("📜 Lecture page:", url);

        const campaigns = await extractCampaignsFromListing(url);
        if (!campaigns.length) break;

        campaigns.forEach((c) => allCampaigns.push(c));
        console.log(`➡️ ${campaigns.length} cagnottes trouvées (total: ${allCampaigns.length})`);
        page++;
        await sleep(1000);
      }
    }

    console.log(`✅ Total ${allCampaigns.length} campagnes uniques.`);

    // 🔁 Enregistrement dans la base
    const tasks = allCampaigns.map((c, idx) =>
      limit(async () => {
        try {
          await prisma.cagnotte.upsert({
            where: { lien: c.lien },
            update: c,
            create: c,
          });
          console.log(`[${idx + 1}/${allCampaigns.length}] ✅ Sauvé: ${c.titre}`);
        } catch (err) {
          console.warn(`❌ Erreur DB pour ${c.lien}:`, err.message);
        }
      })
    );

    await Promise.all(tasks);
    console.log("🎉 Scraping terminé !");
  } catch (err) {
    console.error("💥 Erreur fatale:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
