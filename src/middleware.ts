import type {
  BeforeRequestMiddleware,
  AfterResponseMiddleware,
} from "zapier-platform-core";

export const addAuthHeader: BeforeRequestMiddleware = (request, z, bundle) => {
  const token = bundle?.authData?.apiToken as string;
  if (token) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
};

export const handleErrors: AfterResponseMiddleware = async (
  response,
  z,
  bundle
) => {
  if (response.status === 429) {
    const retryAfter = Number(response.headers["retry-after"] || response.headers["Retry-After"] || "5");
    throw new z.errors.ThrottledError(
      `Rate limited. Retry after ${retryAfter} seconds.`
    );
  }
  
  if (response.status >= 400) {
    // Log traceability identifiers from backend
    const requestId = response.headers["x-request-id"] || response.headers["X-Request-ID"] || "unknown";
    const traceId = response.headers["x-trace-id"] || response.headers["X-Trace-ID"] || "unknown";
    
    z.console.log(`API Error - Status: ${response.status}, Request-ID: ${requestId}, Trace-ID: ${traceId}`);
    
    // Extract safe portion of response body for error context
    let errorContext = "";
    try {
      const responseBody = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      // Limit error context to first 200 characters to avoid exposing sensitive data
      errorContext = responseBody.substring(0, 200);
      if (responseBody.length > 200) {
        errorContext += "...";
      }
    } catch {
      errorContext = "Unable to parse response body";
    }
    
    throw new Error(
      `Wistia API error ${response.status} (Request-ID: ${requestId}): ${errorContext}`
    );
  }
  
  return response;
};
