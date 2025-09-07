import { defineCreate, type CreatePerform } from "zapier-platform-core";
import { ProjectCreateInput } from "../schemas.js";
import { WISTIA_ENDPOINTS } from "../config.js";

const perform: CreatePerform = async (z, bundle) => {
  const input = ProjectCreateInput.parse(bundle.inputData);

  const resp = await z.request({
    url: WISTIA_ENDPOINTS.PROJECTS,
    method: "POST",
    body: { name: input.name }, // Wistia expects url-encoded for non-GET
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // The `Location` header points to the new project; GET it for object details if needed
  return resp.json;
};

export default defineCreate({
  key: "create_project",
  noun: "Project",
  display: {
    label: "Create Project",
    description: "Creates a new project in Wistia.",
  },
  operation: {
    inputFields: [{ key: "name", label: "Project Name", required: true }],
    perform,
    sample: { id: "abc123", name: "Demo Project" },
  },
});
