import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import prisma from "../lib/prisma.ts";
import { URL } from "url";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

const CONCURRENCY = 1; // ⚠️ baisse à 1
const THROTTLE_MS = 2500; // 2.5 secondes entre chaque page
const MAX_PAGES = 100;
const listingRoots = ["https://www.cotizup.com/campaigns/religion"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchUrl(url, attempt = 1) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 20000,
    });
    return res;
  } catch (err) {
    if (err.response?.status === 429 && attempt <= 5) {
      const wait = 10000 * attempt; 
      console.warn(`⚠️ 429 reçu (${attempt}/5) → on attend ${wait / 1000}s avant retry: ${url}`);
      await sleep(wait);
      return fetchUrl(url, attempt + 1);
    }
    console.warn(`⚠️ Erreur fetch ${url}: ${err.message}`);
    return null;
  }
}


async function extractCampaignsFromListing(url) {
  try {
    const res = await fetchUrl(url);
    if (!res) return [];
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

      // 🔍 Récupération de la date FR : "le 30 mars 2024"
      const dateText = $(el).find(".organize-by-all").text();
      const dateMatch = dateText.match(/le\s+([0-9]{1,2}\s+\w+\s+[0-9]{4})/i);
      let start_date = null;

      if (dateMatch) {
        const raw = dateMatch[1].toLowerCase();

        // 🗓️ Mois français → anglais
        const months = {
          janvier: "january",
          février: "february",
          fevrier: "february",
          mars: "march",
          avril: "april",
          mai: "may",
          juin: "june",
          juillet: "july",
          août: "august",
          aout: "august",
          septembre: "september",
          octobre: "october",
          novembre: "november",
          décembre: "december",
          decembre: "december",
        };

        const converted = raw.replace(
          new RegExp(Object.keys(months).join("|"), "gi"),
          (m) => months[m.toLowerCase()]
        );

        start_date = new Date(converted);
        if (isNaN(start_date)) start_date = null;
      }

      // Détection du statut (open / closed)
      let status = "open";
      const btnText = $(el).find(".btn-donation, .btn-disabled, .fa-lock").text();
      if (/clôtur|fermé|fermée|lock/i.test(btnText)) {
        status = "closed";
      }

      campaigns.push({
        titre,
        lien,
        image,
        start_date,
        status,
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

/* --- Étape 2: Scraper les détails de chaque cagnotte --- */
async function extractDetailsFromPage(lien) {
  const res = await fetchUrl(lien);
  if (!res) return {};

  const $ = cheerio.load(res.data);

  // 🕓 Date de lancement
  const startText = $(".organize-by").text().match(/Lancée\s+le\s+([0-9]{1,2}\s+\w+\s+[0-9]{4})/i);
  const start_date = startText ? new Date(startText[1]) : null;

  // 🕓 Date de fermeture (si présente)
  const endText = $(".price-tocollect").text().match(/Fermée\s+depuis\s+le?\s*([0-9]{1,2}\s+\w+\s+[0-9]{4})/i);
  const end_date = endText ? new Date(endText[1]) : null;

  // 🧠 Détection du statut via le bouton
  const button = $(".btn-donation a");
  const buttonText = button.text().toLowerCase();
  const buttonClasses = button.attr("class") || "";

  let status = "unknown";

  if (
    buttonClasses.includes("btn-disabled") ||
    buttonText.includes("clôturée") ||
    buttonText.includes("fermé") ||
    button.find("i.fa-lock").length > 0 ||
    $(".price-tocollect").text().includes("Fermée")
  ) {
    status = "closed";
  } else if (
    buttonText.includes("je participe") ||
    (button.attr("href") && button.attr("href").includes("payment"))
  ) {
    status = "open";
  }

  return { start_date, end_date, status };
}


/* --- Étape 3: Boucle principale --- */
async function main() {
  try {
    const limit = pLimit(CONCURRENCY);
    const allCampaigns = [];

    // --- Récupération des campagnes ---
    for (const root of listingRoots) {
      console.log("🚀 Scraping catégorie:", root);
      let page = 1;

      while (page <= MAX_PAGES) {
        const url = page === 1 ? root : `${root}?page=${page}`;
        console.log("📜 Lecture page:", url);

        const campaigns = await extractCampaignsFromListing(url);
        if (!campaigns.length) break;

        allCampaigns.push(...campaigns);
        console.log(`➡️ ${campaigns.length} cagnottes trouvées (total: ${allCampaigns.length})`);
        page++;
        await sleep(1000);
      }
    }

    // Supprimer les doublons par lien
    const uniqueCampaigns = Array.from(
      new Map(allCampaigns.map((c) => [c.lien, c])).values()
    );

    console.log(`✅ Total ${uniqueCampaigns.length} campagnes uniques.`);

    // --- Scraper les détails ---
    const tasks = uniqueCampaigns.map((c, idx) =>
      limit(async () => {
        const details = await extractDetailsFromPage(c.lien);
        const data = { ...c, ...details };

        try {
          await prisma.cagnotte.upsert({
            where: { lien: data.lien },
            update: data,
            create: data,
          });
          console.log(
            `[${idx + 1}/${uniqueCampaigns.length}] ✅ ${data.titre} (${data.status})`
          );
        } catch (err) {
          console.warn(`❌ Erreur DB pour ${data.lien}:`, err.message);
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
