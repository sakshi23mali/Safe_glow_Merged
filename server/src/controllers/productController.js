import axios from "axios";

function normalizeImageUrl(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://"))
    return `https://${trimmed.slice("http://".length)}`;
  if (trimmed.startsWith("https://")) return trimmed;
  return null;
}

function isWebpUrl(url) {
  return /\.webp(\?|#|$)/i.test(String(url || ""));
}

function pickFirstUsableImageUrl(candidates) {
  let firstValid = null;

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate);
    if (!normalized) continue;
    if (!firstValid) firstValid = normalized;
    if (!isWebpUrl(normalized)) return normalized;
  }

  if (firstValid && !isWebpUrl(firstValid)) return firstValid;
  return null;
}

function pickImageUrlFromSearchItem(item) {
  const pagemap = item?.pagemap || {};
  const metatags = pagemap?.metatags?.[0] || {};

  return pickFirstUsableImageUrl([
    pagemap?.cse_image?.[0]?.src,
    pagemap?.imageobject?.[0]?.url,
    pagemap?.cse_thumbnail?.[0]?.src,
    metatags["og:image"],
    metatags["twitter:image"],
  ]);
}

export function analyzeSafetyForSkinType(skinType, text) {
  const lower = String(text || "").toLowerCase();

  const hasFragrance =
    lower.includes("fragrance") ||
    lower.includes("parfum") ||
    lower.includes("perfume");

  const hasHarshAlcohol =
    lower.includes("alcohol denat") || lower.includes("denatured alcohol");

  const hasScrubOrPeel =
    lower.includes("scrub") ||
    lower.includes("exfoliating") ||
    lower.includes("peeling") ||
    lower.includes("peel");

  const isHeavyProduct =
    lower.includes("heavy cream") ||
    lower.includes("rich cream") ||
    lower.includes("body butter") ||
    lower.includes("facial oil") ||
    lower.includes("nourishing oil") ||
    lower.includes("face oil");

  const mentionsOily =
    lower.includes("for oily skin") ||
    lower.includes("oily skin") ||
    lower.includes("oil control") ||
    lower.includes("oil-control") ||
    lower.includes("oil free") ||
    lower.includes("oil-free") ||
    lower.includes("mattifying") ||
    lower.includes("matte finish") ||
    lower.includes("anti acne") ||
    lower.includes("acne control");

  const mentionsDry =
    lower.includes("for dry skin") ||
    lower.includes("dry skin") ||
    lower.includes("very dry skin") ||
    lower.includes("intense hydration") ||
    lower.includes("deeply moisturizing") ||
    lower.includes("extra nourishing");

  const mentionsSensitive =
    lower.includes("for sensitive skin") || lower.includes("sensitive skin");

  const brighteningActives =
    lower.includes("brightening") ||
    lower.includes("whitening") ||
    lower.includes("lightening") ||
    lower.includes("retinol") ||
    lower.includes("vitamin c") ||
    lower.includes("aha") ||
    lower.includes("bha") ||
    lower.includes("peel");

  switch (skinType) {
    case "dry":
      if (mentionsOily) return "avoid";
      if (hasHarshAlcohol) return "avoid";
      if (hasScrubOrPeel || hasFragrance) return "caution";
      break;
    case "oily":
      if (isHeavyProduct || mentionsDry) return "avoid";
      if (mentionsSensitive) return "caution";
      break;
    case "combination":
      if (isHeavyProduct && mentionsDry) return "avoid";
      if (mentionsOily || mentionsDry) return "caution";
      if (hasFragrance) return "caution";
      break;
    case "sensitive":
      if (hasFragrance || hasHarshAlcohol || hasScrubOrPeel) return "avoid";
      if (brighteningActives) return "caution";
      break;
    case "normal":
    default:
      if (hasHarshAlcohol || isHeavyProduct) return "caution";
      break;
  }

  return "safe";
}

function getMockProducts(skinType) {
  const mockItems = [
    {
      title: "CeraVe Moisturizing Cream",
      snippet:
        "A non-comedogenic, fragrance-free moisturizer ideal for dry and normal skin types. Contains essential ceramides and hyaluronic acid.",
      link: "https://www.cerave.com/skincare/moisturizers/moisturizing-cream",
      displayLink: "cerave.com",
      pagemap: {
        cse_image: [
          {
            src: "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/master/us/products/moisturizing-cream/cerave_moisturizing_cream_16oz_jar_front-v2.jpg",
          },
        ],
      },
    },
    {
      title: "La Roche-Posay Effaclar Mat",
      snippet:
        "Daily face moisturizer for oily skin that targets excess oil and helps reduce the look of pores. Matte finish.",
      link: "https://www.laroche-posay.us/our-products/face-care/face-moisturizer/effaclar-mat-moisturizer-for-oily-skin-3337872413025.html",
      displayLink: "laroche-posay.us",
      pagemap: {
        cse_image: [
          {
            src: "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-laroche-posay-master-catalog/default/dw76950280/product/3337872413025_effaclar_mat.jpg",
          },
        ],
      },
    },
    {
      title: "The Ordinary Hyaluronic Acid 2% + B5",
      snippet:
        "A water-based serum that provides deep hydration. Suitable for all skin types, especially dry and sensitive.",
      link: "https://theordinary.com/en-us/hyaluronic-acid-2-b5-face-serum-100425.html",
      displayLink: "theordinary.com",
      pagemap: {
        cse_image: [
          {
            src: "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master-catalog/default/dw10619721/images/products/The%20Ordinary/rdn-hyaluronic-acid-2-b5-30ml.png",
          },
        ],
      },
    },
    {
      title: "Cetaphil Gentle Skin Cleanser",
      snippet:
        "Clinically proven to hydrate while cleansing, and helps strengthen skin's moisture barrier. Ideal for sensitive skin.",
      link: "https://www.cetaphil.com/us/cleansers/gentle-skin-cleanser/302993910002.html",
      displayLink: "cetaphil.com",
      pagemap: {
        cse_image: [
          {
            src: "https://www.cetaphil.com/dw/image/v2/BFCV_PRD/on/demandware.static/-/Sites-galderma-cetaphil-us-master-catalog/default/dwb7d7f7e9/images/products/302993910002_Cetaphil_Gentle_Skin_Cleanser_16oz_Front.png",
          },
        ],
      },
    },
  ];

  return mockItems.map((item) => {
    const title = item.title || "";
    const snippet = item.snippet || "";
    const link = item.link || "";
    const source = item.displayLink || "Official Store";
    const image = pickImageUrlFromSearchItem(item);
    const verdict = analyzeSafetyForSkinType(skinType, `${title} ${snippet}`);
    return { title, snippet, link, source, image, verdict };
  });
}

export const recommendProducts = async (req, res, next) => {
  try {
    const { skinType } = req.query;

    const apiKey = process.env.GOOGLE_CSE_KEY;
    const cx = process.env.GOOGLE_CSE_CX;

    // Fallback data if search provider is not configured
    if (!apiKey || !cx) {
      console.warn(
        "Search provider (Google CSE) not configured. Using mock fallback data."
      );
      return res.json({ products: getMockProducts(skinType) });
    }

    let items = [];
    try {
      const query = `${skinType} skin best skincare products`;
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
      )}&key=${apiKey}&cx=${cx}`;

      const response = await axios.get(url);
      items = response.data.items || [];
    } catch (err) {
      console.error(
        "Google CSE API Error, falling back to mock data:",
        err.message
      );
      if (err.response) {
        console.error(
          "Details:",
          JSON.stringify(err.response.data.error || err.response.data)
        );
      }
      return res.json({ products: getMockProducts(skinType) });
    }

    const products = items.map((item) => {
      const title = item.title || "";
      const snippet = item.snippet || "";
      const link = item.link || "";
      const source = item.displayLink || item.link?.split("/")[2] || "Unknown";
      const image = pickImageUrlFromSearchItem(item);

      const verdict = analyzeSafetyForSkinType(skinType, `${title} ${snippet}`);

      return { title, snippet, link, source, image, verdict };
    });

    res.json({ products });
  } catch (err) {
    if (err.response) {
      console.error("Google CSE API Error:", {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error("Product suggestion error:", err.message);
    }
    next(err);
  }
};
