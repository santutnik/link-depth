import http, { IncomingMessage } from "node:http";
import https from "node:https";
import { Response } from "express";
import { TARGET_WIKI_HREF } from "../config/config";
import { extractHrefs } from "./parser";

/**
 * Handles the content of an HTTP response and then returns the result to the callback function.
 *
 * @param res - The incoming HTTP response message.
 * @param callbackReturnContent - A callback function that receives the content as a string.
 */
function handleContent(res: IncomingMessage, callbackReturnContent: (urlContent: string) => void) {
    const data: Buffer[] = [];

    res.on("data", (chunk: Buffer) => {
        data.push(chunk);
    });

    res.on("end", () => {
        var result = Buffer.concat(data).toString();
        callbackReturnContent(result);
    });
}

/**
 * Downloads the content of a given URL using the HTTP protocol and processes it.
 *
 * @param url - The URL to fetch the HTML content from.
 * @param callbackReturnContent - A callback function that receives the fetched content as a string.
 */
export function downloadUrlHTTP(url: string, callbackReturnContent: (urlContent: string) => void) {
    console.log("Fetch HTML content for: " + url);
    http.request(url, (res: IncomingMessage) => {
        handleContent(res, callbackReturnContent);
    }).end();
}

/**
 * Downloads the content of a given URL using the HTTPS protocol and processes it.
 *
 * @param url - The URL to fetch content from.
 * @param callbackReturnContent - A callback function that receives the fetched content as a string.
 */
export function downloadUrlHTTPS(url: string, callbackReturnContent: (content: string) => void) {
    console.log("Fetch HTML content for: " + url);
    https
        .request(url, (res: IncomingMessage) => {
            handleContent(res, callbackReturnContent);
        })
        .end();
}

/**
 * Processes a list of URLs to search for a specific target link within a specified depth limit.
 * 
 * @param mainQueue - An array of URLs to be processed.
 * @param depth - The current depth of the search.
 * @param depthLimit - The maximum depth allowed for the search.
 * @param batchLimit - The maximum number of URLs to process in a single batch.
 * @param res - The HTTP response object used to send the result back to the client.
 * 
 * The function processes URLs in batches, downloading their content and extracting additional
 * links. If the target link is found, it sends a response with the current depth. If the depth
 * limit is reached without finding the target, the process is terminated.
 */
export async function processQueue(
    mainQueue: string[],
    depth: number,
    depthLimit: number,
    batchLimit: number,
    res: Response
) {
    let auxQueue: string[] = [];
    let responseSent: boolean = false;
    const processBatch = async (batch: string[]) => {
        const promises = batch.map((url) => {
            return new Promise<void>((resolve, reject) => {
                if (responseSent) {
                    return resolve();
                }
                downloadUrlHTTPS(url, (content: string) => {
                    if (responseSent) {
                        return resolve();
                    }
                    if (content.search(TARGET_WIKI_HREF) > 0) {
                        console.log("### ### ### ### ### ### ### ### ### ### ### ### ### ### ###");
                        console.log("DONE! Link separation equal to " + depth + " and matched URL is " + url);
                        console.log("### ### ### ### ### ### ### ### ### ### ### ### ### ### ###");
                        responseSent = true;
                        res.status(200).send(depth.toString());
                        return resolve();
                    }

                    const additionalHrefs = extractHrefs(content);
                    auxQueue.push(...additionalHrefs);

                    if (mainQueue.length === 0 && auxQueue.length > 0) {
                        if (depth + 1 > depthLimit) {
                            console.log("Depth limit of " + depthLimit + " reached! Terminating...");
                            reject();
                        }
                        depth++;
                        console.log("Depth increased by one to: " + depth);
                        mainQueue.push(...auxQueue);
                        console.log("HREF queue reinitialized with " + auxQueue.length + " items...");
                        auxQueue.length = 0;
                    }
                    return resolve();
                });
            });
        });

        await Promise.all(promises);
    };

    while (!responseSent && mainQueue.length > 0) {
        const batch = mainQueue.splice(0, batchLimit);
        await processBatch(batch);
    }
}
