import { isValidUrl } from "../../src/helpers/validator";

describe("URLs are parsed", () => {
    it("Broken urls return false", async () => {
        expect(isValidUrl("http:://www.com")).toBe(false);
        expect(isValidUrl("http:://www.google.com")).toBe(false);
        expect(isValidUrl("http::\\www.com")).toBe(false);
        expect(isValidUrl("http::\\www.google.com")).toBe(false);
        expect(isValidUrl("http://www.google.com")).toBe(true);
    })
})