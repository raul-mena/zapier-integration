import { WISTIA_ENDPOINTS } from "./config.js";

const authentication = {
  type: "custom" as const,
  fields: [
    {
      key: "apiToken",
      label: "API Token",
      required: true,
      type: "password" as const,
      helpText: "Your Wistia API token. Get yours at: Account Settings → API → Generate new token. [Learn more](https://wistia.com/support/developers/data-api#authentication)",
    },
  ],
  test: {
    url: WISTIA_ENDPOINTS.PROJECTS,
    method: "GET" as const,
    params: {
      per_page: 1,
      page: 1,
    },
  },
  connectionLabel: "Wistia ({{bundle.authData.apiToken.substring(0, 8)}}...)",
};

export default authentication;
