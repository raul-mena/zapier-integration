import { createAppTester } from "zapier-platform-core";
import App from "../index.js";
import NewMedia from "../triggers/new_media.js";
import CreateProject from "../creates/create_project.js";

const appTester = createAppTester(App);

async function runTests() {
  console.log("🧪 Running Local Testing Harness for Wistia Integration\n");

  // Load environment variables
  const apiToken = process.env.WISTIA_API_TOKEN;
  if (!apiToken) {
    console.error("❌ WISTIA_API_TOKEN environment variable is required");
    process.exit(1);
  }

  console.log("✅ API Token loaded from environment");

  // Test 1: Authentication
  console.log("\n🔐 Testing Authentication...");
  try {
    const bundle = {
      authData: { apiToken },
      meta: {},
      inputData: {},
      inputDataRaw: {},
      cleanedRequest: {} as any,
      rawRequest: {} as any,
    };

    // Create a simple auth test function
    const authTestFn = async (z: any, bundle: any) => {
      const response = await z.request({
        url: "https://api.wistia.com/v1/projects.json",
        method: "GET",
        params: { per_page: 1, page: 1 }
      });
      return response.json;
    };

    const authResult = await appTester(authTestFn, bundle) as any;
    console.log("✅ Authentication successful");
    console.log(`   Response: ${JSON.stringify(authResult).substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    return;
  }

  // Test 2: Trigger - Sample Mode
  console.log("\n📡 Testing Trigger (Sample Mode)...");
  try {
    const sampleBundle = {
      authData: { apiToken },
      meta: { isLoadingSample: true },
      inputData: {},
      inputDataRaw: {},
      cleanedRequest: {} as any,
      rawRequest: {} as any,
    };

    const sampleResult = await appTester((NewMedia.operation as any).perform, sampleBundle) as any[];
    console.log("✅ Sample trigger successful");
    console.log(`   Sample count: ${sampleResult.length}`);
    if (sampleResult.length > 0) {
      console.log(`   Sample item: ${JSON.stringify(sampleResult[0]).substring(0, 150)}...`);
    }
  } catch (error) {
    console.error("❌ Sample trigger failed:", error);
  }

  // Test 3: Trigger - Real Mode
  console.log("\n📡 Testing Trigger (Real Mode)...");
  try {
    const triggerBundle = {
      authData: { apiToken },
      meta: { limit: 3 },
      inputData: {},
      inputDataRaw: {},
      cleanedRequest: {} as any,
      rawRequest: {} as any,
    };

    const triggerResult = await appTester((NewMedia.operation as any).perform, triggerBundle) as any[];
    console.log("✅ Real trigger successful");
    console.log(`   Media count: ${triggerResult.length}`);
    if (triggerResult.length > 0) {
      console.log(`   Latest media: ${JSON.stringify(triggerResult[0]).substring(0, 150)}...`);
    }
  } catch (error) {
    console.error("❌ Real trigger failed:", error);
  }

  // Test 4: Create Action
  console.log("\n🏗️  Testing Create Project Action...");
  try {
    const actionBundle = {
      authData: { apiToken },
      meta: {},
      inputData: { name: `Test Project ${Date.now()}` },
      inputDataRaw: {},
      cleanedRequest: {} as any,
      rawRequest: {} as any,
    };

    const actionResult = await appTester((CreateProject.operation as any).perform, actionBundle) as any;
    console.log("✅ Create project successful");
    console.log(`   Created project: ${JSON.stringify(actionResult).substring(0, 150)}...`);
  } catch (error) {
    console.error("❌ Create project failed:", error);
  }

  console.log("\n🎉 Local testing harness completed!");
}

runTests().catch(console.error);
