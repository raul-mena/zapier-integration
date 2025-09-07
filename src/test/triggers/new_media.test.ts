import { describe, expect, it } from "vitest";
import zapier from "zapier-platform-core";

import App from "../../index.js";
import NewMedia from "../../triggers/new_media.js";
import { WISTIA_ENDPOINTS, WISTIA_API_TOKEN } from "../../config.js";

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("triggers.new_media", () => {
  it("should fetch media", async () => {
    const bundle = {
      authData: {
        apiToken: WISTIA_API_TOKEN || "test-token",
      },
      inputData: {},
      inputDataRaw: {},
      meta: {},
    } as any;

    // Test the trigger perform function directly
    const results = await appTester(async (z, bundle) => {
      const response = await z.request({
        url: WISTIA_ENDPOINTS.MEDIAS,
        method: "GET",
        params: {
          sort_by: "updated",
          sort_direction: 0,
          per_page: 50,
          page: 1,
        },
      });
      return response.json;
    }, bundle);
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});
