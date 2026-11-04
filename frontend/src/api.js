import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const getNodes = () => API.get("/nodes").then((r) => r.data);

export const getRoute = (start, end, accessible) =>
  API.get("/route", { params: { start, end, accessible } }).then((r) => r.data);
export const setStatus = (code, isActive, key) =>
  API.patch(`/nodes/${code}/status`, null, {
    params: { is_active: isActive },
    headers: { "X-Admin-Key": key },
  }).then((r) => r.data);