import http from "http";
import express, { Request, Response, NextFunction } from "express";
import { BATCH_LIMIT, DEPTH_LIMIT, TARGET_WIKI_HREF, SERVER_CONFIG } from "./config/config";
import { logRequest } from "./middleware/requestHandler";
import { handleNoRoute } from "./middleware/errorHandler";
import { downloadUrlHTTP, downloadUrlHTTPS, processQueue } from "./helpers/crawler";
import { extractHrefs } from "./helpers/parser";
import { isValidUrl } from "./helpers/validator";

export const router = express();
export var server: ReturnType<typeof http.createServer>;

export const main = () => {
    router.use(logRequest);

    router.get("/api/health", (req: Request, res: Response, next: NextFunction) => {
        res.status(200).send("Healthy");
    });

    router.get("/api/get-link-separation", (req: Request, res: Response, next: NextFunction) => {
        // extract URL param
        let url = req.query.url?.toString().trim() || "";
        if (!url) {
            console.log("URL param is missing!");
            res.status(404).send("Bad request");
            return;
        } else if (!isValidUrl(url)) {
            console.log("URL is corrupt!");
            res.status(404).send("Bad request");
            return;
        }
        console.log("Finding link separation for: " + url);

        // extract max depth limit
        let depthLimit = DEPTH_LIMIT;
        try {
            if (req.query.depthLimit) {
                let value: number = Number.parseInt(req.query.depthLimit?.toString().trim());
                depthLimit = value > 0 ? value : DEPTH_LIMIT;
            }
        } catch {
            // silent pass
        }
        console.log("Depth limit set to: " + depthLimit);

        // extract max depth limit
        let batchLimit = BATCH_LIMIT;
        try {
            if (req.query.batchLimit) {
                let value: number = Number.parseInt(req.query.batchLimit?.toString().trim());
                batchLimit = value > 0 ? value : BATCH_LIMIT;
            }
        } catch {
            // silent pass
        }
        console.log("Batch limit set to: " + batchLimit);

        let depth = 1;
        let queue: string[] = [];

        async function traverse(content: string): Promise<void> {
            if (content.search(TARGET_WIKI_HREF) > 0) {
                console.log("### ### ### ### ### ### ### ### ### ### ### ### ### ### ###");
                console.log("DONE! Link separation equal to " + depth + " and matched URL is " + url);
                console.log("### ### ### ### ### ### ### ### ### ### ### ### ### ### ###");
                res.status(200).send(depth.toString());
                return;
            }

            if (depth + 1 > depthLimit) {
                console.log("Depth limit of " + depthLimit + " reached! Terminating...");
                res.status(200).send("-1");
                return;
            }

            // href not found on page, increment the depth
            depth++;
            queue = extractHrefs(content);

            try {
                await processQueue(queue, depth, depthLimit, batchLimit, res);
            } catch {
                res.status(200).send("-1");
                return;
            }
        }

        if (url.startsWith("https://")) {
            downloadUrlHTTPS(url, traverse);
        } else {
            downloadUrlHTTP(url, traverse);
        }
    });

    // no route catch-all
    router.use(handleNoRoute);

    server = http.createServer(router);
    server.listen(SERVER_CONFIG.SERVER_PORT, () => {
        console.log("Server started at " + SERVER_CONFIG.SERVER_HOST + ":" + SERVER_CONFIG.SERVER_PORT);
    });
};

main();
