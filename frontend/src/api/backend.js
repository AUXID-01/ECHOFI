export const BACKEND_API = "http://localhost:8000/api/v1";

export const backend = {
  get: (path) =>
    fetch(`${BACKEND_API}${path}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }),

  post: (path, body) =>
    fetch(`${BACKEND_API}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
};
