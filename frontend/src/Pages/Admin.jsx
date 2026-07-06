import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getAllUsers,
  getAllDocuments,
  deleteDocument,
  updateUserRole
} from "../api";

function Admin() {

  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const userResult = await getAllUsers();

    if (userResult.users) {
      setUsers(userResult.users);
    }

    const documentResult = await getAllDocuments();

    if (documentResult.documents) {
      setDocuments(documentResult.documents);
    }
  }

  async function handleDelete(id) {

    const confirmDelete = window.confirm(
      "Delete this document?"
    );

    if (!confirmDelete) {
      return;
    }

    const result = await deleteDocument(id);

    alert(result.message);

    // Reload the tables after deleting
    loadData();
  }
  async function handleRoleChange(id, currentRole) {

  const newRole =
    currentRole === "admin" ? "user" : "admin";

  const result = await updateUserRole(id, newRole);

  alert(result.message);

  loadData();
}

  return (
    <Layout>

      <h1>Admin Dashboard</h1>

      <hr />

      <h2>Users</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
  <th>Name</th>
  <th>Email</th>
  <th>Role</th>
  <th>Action</th>
</tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
  <td>{user.name}</td>
  <td>{user.email}</td>
  <td>{user.role}</td>

  <td>
    <button
      onClick={() =>
        handleRoleChange(user.id, user.role)
      }
    >
      Make {user.role === "admin" ? "User" : "Admin"}
    </button>
  </td>
</tr>
          ))}
        </tbody>
      </table>

      <br />

      <h2>Documents</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice</th>
            <th>Status</th>
            <th>Uploaded By</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.vendor_name}</td>
              <td>{doc.invoice_number}</td>
              <td>{doc.status}</td>
              <td>{doc.uploaded_by_email}</td>
              <td>
                <button onClick={() => handleDelete(doc.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </Layout>
  );
}

export default Admin;