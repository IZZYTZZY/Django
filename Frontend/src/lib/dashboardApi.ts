import { apiClient } from "./apiClient";

export async function fetchDashboardData() {
  const response = await apiClient.get("/api/dashboard/");
  return response.data;
}

export async function fetchUserLeadMagnets() {
  const response = await apiClient.get("/api/lead-magnets/");
  return response.data;
}

export async function fetchTemplates() {
  const response = await apiClient.get("/api/templates/");
  return response.data;
}

export async function deleteLeadMagnet(id: string) {
  const response = await apiClient.delete(`/api/lead-magnets/${id}/`);
  return response.data;
}
