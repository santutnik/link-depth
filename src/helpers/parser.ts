import { load } from "cheerio";

/**
 * Extracts and returns a list of unique Wikipedia URLs from the given HTML content.
 *
 * This function parses the provided HTML content to find all anchor tags (<a>)
 * and extracts their href attributes. It filters out invalid or irrelevant links,
 * such as those starting with "#" or "//". It specifically targets Wikipedia links,
 * either absolute english based URLs containing "en.wikipedia.org/wiki/" or relative
 * paths starting with "/wiki/" or "/". The function returns a list of unique, fully
 * qualified Wikipedia URLs.
 *
 * @param content - The HTML content to parse for anchor tags.
 * @returns An array of unique Wikipedia URLs found in the content.
 */
export function extractHrefs(content: string) {
    const $ = load(content);
    let map: { [key: string]: string } = {};
    $("a").each((_, element) => {
        let href = $(element).attr("href");
        if (href != null && href != undefined && href != "" && !href.startsWith("#") && !href.startsWith("//")) {
            if (href.search("en.wikipedia.org/wiki/") > 0 && !map.hasOwnProperty(href)) {
                map[href] = href;
            } else if (href.startsWith("/wiki/") || href.startsWith("/")) {
                let massagedHref = "https://en.wikipedia.org" + href;
                if (!map.hasOwnProperty(massagedHref)) {
                    map[massagedHref] = massagedHref;
                }
            }
        }
    });
    return Object.values(map);
}
