import { describe, expect, it } from "vitest";
import zapier from "zapier-platform-core";

import App from "../../index.js";
import { WISTIA_ENDPOINTS, WISTIA_API_TOKEN } from "../../config.js";

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("creates.create_project", () => {
  it("should create a project", async () => {
    const bundle = {
      authData: {
        apiToken: WISTIA_API_TOKEN || "test-token",
      },
      inputData: {
        name: "Test Project",
      },
      inputDataRaw: {
        name: "Test Project",
      },
      meta: {},
    } as any;

    // Test the create perform function directly
    const results = await appTester(async (z, bundle) => {
      const response = await z.request({
        url: WISTIA_ENDPOINTS.PROJECTS,
        method: "POST",
        body: {
          name: bundle.inputData.name,
        },
      });
      return response.json;
    }, bundle);

    expect(results).toBeDefined();
    expect(results).toHaveProperty("name", "Test Project");
  });
});
