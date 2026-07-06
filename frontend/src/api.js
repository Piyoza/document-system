const API_URL =
  "https://worker.sfundo-xulu-digifycx.workers.dev";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  console.log("Status:", response.status);

  const data = await response.json();

  console.log("Data:", data);

  return data;
}

export async function uploadDocument(file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  );

  return await response.json();
}

export async function getMyDocuments() {
  const response = await fetch(
    `${API_URL}/api/my-documents`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return await response.json();
}

export function getDownloadUrl(id) {
  return `${API_URL}/api/documents/${id}/file`;
}
export async function downloadDocument(id) {
  const response = await fetch(
    `${API_URL}/api/documents/${id}/file`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Download failed");
  }

  return await response.blob();
}
export async function getAllUsers() {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return await response.json();
}

export async function getAllDocuments() {
  const response = await fetch(
    `${API_URL}/api/admin/documents`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return await response.json();
}
export async function deleteDocument(id) {

  const response = await fetch(
    `${API_URL}/api/admin/documents/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return await response.json();
}
export async function updateUserRole(id, role) {

  const response = await fetch(
    `${API_URL}/api/admin/users/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ role })
    }
  );

  return await response.json();
}