// export const BACKEND_API = "http://localhost:8000/api/v1";   // banking backend
export const GATEWAY_API = "http://localhost:9000"; 

// Attach JWT automatically
// export const api = {
//   get: async (path) => {
//     return fetch(`${API_BASE}${path}`, {
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//     }).then((res) => res.json());
//   },

//   post: async (path, body) => {
//     return fetch(`${API_BASE}${path}`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     }).then((res) => res.json());
//   },
// };
// // 