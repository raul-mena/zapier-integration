import { describe, expect, it } from "vitest";
import zapier from "zapier-platform-core";

import App from "../index.js";
import { addAuthHeader } from "../middleware.js";
import { WISTIA_ENDPOINTS, WISTIA_API_TOKEN } from "../config.js";

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("wistia api token auth", () => {
  it("middleware adds Bearer token to requests", async () => {
    const bundle = {
      authData: {
        apiToken: WISTIA_API_TOKEN || "test-token",
      },
      inputData: {},
      inputDataRaw: {},
      meta: {},
    } as any;

    const request = {
      url: WISTIA_ENDPOINTS.MEDIAS,
      method: "GET" as const,
      headers: {} as Record<string, string>,
    };
    
    // Test middleware directly
    const z = {} as any; // Mock z object for middleware test
    const processedRequest = await addAuthHeader(request, z, bundle);
    expect(processedRequest.headers?.Authorization).toBe(`Bearer ${WISTIA_API_TOKEN}`);
  });

  it("authentication works with valid token", async () => {
    const bundle = {
      authData: {
        apiToken: WISTIA_API_TOKEN || "test-token",
      },
      inputData: {},
      inputDataRaw: {},
      meta: {},
    } as any;

    // Test authentication by making a simple API request
    const result = await appTester(async (z, bundle) => {
      const response = await z.request({
        url: WISTIA_ENDPOINTS.ACCOUNT,
        method: "GET",
      });
      return response.json;
    }, bundle);
    
    expect(result).toBeDefined();
  });
});
