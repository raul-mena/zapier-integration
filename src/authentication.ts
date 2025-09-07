import { WISTIA_ENDPOINTS } from "./config.js";

const authentication = {
  type: "custom" as const,
  fields: [
    {
      key: "apiToken",
      label: "API Token",
      required: true,
      type: "password" as const,
      helpText: "Your Wistia API token. You can find this in your Wistia account settings.",
    },
  ],
  test: {
    url: WISTIA_ENDPOINTS.ACCOUNT,
    method: "GET" as const,
  },
  connectionLabel: "Wistia Account ({{bundle.authData.apiToken}})",
};

export default authentication;
