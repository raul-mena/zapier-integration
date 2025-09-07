import { defineApp, version as platformVersion } from "zapier-platform-core";
import authentication from "./authentication.js";
import { addAuthHeader, handleErrors } from "./middleware.js";
import NewMedia from "./triggers/new_media.js";
import CreateProject from "./creates/create_project.js";

export default defineApp({
  version: "1.0.3",
  platformVersion,
  authentication,
  beforeRequest: [addAuthHeader],
  afterResponse: [handleErrors],
  triggers: { [NewMedia.key]: NewMedia },
  creates: { [CreateProject.key]: CreateProject },
});
