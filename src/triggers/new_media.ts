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

interface CursorData {
  updated: string;
  id: string;
}

const perform: PollingTriggerPerform = async (z, bundle) => {
  // Early return for sample loading - no API calls or cursor operations
  if (bundle.meta?.isLoadingSample) {
    return [SAMPLE];
  }

  // Robust cursor handling with try/catch for both read and write
  let cursorData: CursorData | null = null;
  try {
    const cursorStr = await z.cursor.get();
    if (cursorStr) {
      try {
        // Try to parse as JSON (new format with updated + id)
        cursorData = JSON.parse(cursorStr);
      } catch {
        // Fallback for legacy cursor (just updated timestamp)
        cursorData = { updated: cursorStr, id: "" };
      }
    }
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

    // Filter by cursor using (updated, id) pair for deduplication
    const filtered = cursorData
      ? items.filter((m) => {
          if (!m.updated || !m.id) return false;
          // Compare by updated timestamp first, then by id for tie-breaking
          if (m.updated > cursorData!.updated) return true;
          if (m.updated === cursorData!.updated && m.id > cursorData!.id) return true;
          return false;
        })
      : items;

    // Update cursor with the latest (updated, id) pair from ALL items
    if (items.length > 0) {
      try {
        // Sort by updated desc, then by id desc for tie-breaking
        const sortedItems = items
          .filter((m) => m.updated && m.id)
          .sort((a, b) => {
            if (a.updated! !== b.updated!) {
              return a.updated! > b.updated! ? -1 : 1;
            }
            return a.id > b.id ? -1 : 1;
          });
        
        if (sortedItems.length > 0) {
          const latest = sortedItems[0];
          if (latest && latest.updated && latest.id) {
            const newCursor: CursorData = {
              updated: latest.updated,
              id: latest.id,
            };
            await z.cursor.set(JSON.stringify(newCursor));
          }
        }
      } catch (e: any) {
        z.console.log("cursor.set failed:", e?.message);
      }
    }

    // Respect bundle.meta.limit if defined
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
