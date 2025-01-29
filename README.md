# link-depth-api

An app that traverses a wiki web page to measure the link depth between it and a second predefined wiki page.

API endpoints:
- api/health
- api/get-link-separation

## Features

- A service health check
- Link depth traversal endpoint that supports two additional optional params - max depth and batch limit
- A sample UT