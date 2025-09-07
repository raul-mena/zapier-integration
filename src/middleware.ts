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
    const retryAfter = Number(response.headers["retry-after"] || "5");
    throw new z.errors.ThrottledError(
      `Rate limited. Retry after ${retryAfter} seconds.`
    );
  }
  if (response.status >= 400) {
    throw new Error(`Wistia API error ${response.status}: ${response.content}`);
  }
  return response;
};
