import {
  defineTrigger,
  type PollingTriggerPerform,
} from "zapier-platform-core";
import { Media } from "../schemas.js";
import { WISTIA_ENDPOINTS } from "../config.js";

const SAMPLE = {
  id: "12345",
  name: "Sample Video",
  updated: "2024-01-15T10:30:00Z",
  created: "2024-01-15T09:00:00Z",
  hashed_id: "abc123def456",
};

const perform: PollingTriggerPerform = async (z, bundle) => {
  // Return sample data for editor loading
  if (bundle.meta?.isLoadingSample) {
    return [SAMPLE];
  }

  // Get cursor with error handling
  let cursor = "";
  try {
    cursor = (await z.cursor.get()) || "";
  } catch (e: any) {
    z.console.log("cursor.get failed:", e?.message);
  }

  // API request parameters
  const params: Record<string, any> = {
    sort_by: "updated",
    sort_direction: 0, // desc
    per_page: 50,
    page: 1,
  };

  try {
    const response = await z.request({
      url: WISTIA_ENDPOINTS.MEDIAS,
      method: "GET",
      params,
    });

    // Handle empty or invalid responses
    const raw = response.json as unknown[];
    if (!Array.isArray(raw)) {
      z.console.log("Invalid API response: not an array", raw);
      return [];
    }

    if (raw.length === 0) {
      z.console.log("No media found in Wistia account");
      return [];
    }

    // Parse and validate items
    const items: Media[] = [];
    for (const item of raw) {
      try {
        const parsed = Media.parse(item);
        items.push(parsed);
      } catch (parseError: any) {
        z.console.log("Failed to parse media item:", parseError.message, item);
        // Continue with other items instead of failing completely
      }
    }

    // Filter by cursor (high-watermark)
    const filtered = cursor
      ? items.filter((m) => m.updated && m.updated > cursor)
      : items;

    // Update cursor with the latest updated timestamp from ALL items (not filtered)
    if (items.length > 0) {
      try {
        const validTimestamps = items
          .map((m) => m.updated)
          .filter((timestamp): timestamp is string => Boolean(timestamp))
          .sort();
        
        if (validTimestamps.length > 0) {
          const maxUpdated = validTimestamps[validTimestamps.length - 1];
          if (maxUpdated) {
            await z.cursor.set(maxUpdated);
          }
        }
      } catch (e: any) {
        z.console.log("cursor.set failed:", e?.message);
      }
    }

    // Respect limit from bundle.meta
    const limit = typeof bundle.meta?.limit === "number" ? bundle.meta.limit : undefined;
    const result = limit ? filtered.slice(0, limit) : filtered;
    
    z.console.log(`Returning ${result.length} items (${items.length} total, ${filtered.length} after filter)`);
    return result;
    
  } catch (error: any) {
    z.console.log("API request failed:", error.message);
    throw new Error(`Failed to fetch media from Wistia: ${error.message}`);
  }
};

export default defineTrigger({
  key: "new_media",
  noun: "Media",
  display: {
    label: "New/Updated Media",
    description: "Triggers when a media is created or updated in Wistia.",
  },
  operation: {
    type: "polling",
    perform,
    sample: SAMPLE,
    outputFields: [
      { key: "id", label: "ID", primary: true },
      { key: "name", label: "Name" },
      { key: "updated", label: "Updated" },
      { key: "created", label: "Created" },
      { key: "hashed_id", label: "Hashed ID" },
    ],
  },
});
