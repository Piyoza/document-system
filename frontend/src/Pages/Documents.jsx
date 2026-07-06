import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  getMyDocuments,
  downloadDocument
} from "../api";
import axios from "axios";

function Documents() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Finance users should not access this page
  if (user?.role === "finance") {
    return <Navigate to="/finance" replace />;
  }

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const result = await getMyDocuments();

      if (result.documents) {
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function approveDocument(id) {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://worker.sfundo-xulu-digifycx.workers.dev/api/manager/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, status: "Manager Approved" }
            : doc
        )
      );

      alert("Document approved successfully.");
    } catch (error) {
      console.error(error);
      alert("Approval failed.");
    }
  }

  async function rejectDocument(id) {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://worker.sfundo-xulu-digifycx.workers.dev/api/manager/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, status: "Rejected" }
            : doc
        )
      );

      alert("Document rejected successfully.");
    } catch (error) {
      console.error(error);
      alert("Rejection failed.");
    }
  }

  async function handleDownload(id, filename) {
    try {
      const blob = await downloadDocument(id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed.");
    }
  }

  return (
    <Layout>
      <h1>My Documents</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice</th>
            <th>Status</th>

            {(user?.role === "manager" ||
              user?.role === "admin") && (
              <th>Actions</th>
            )}

            <th>File</th>
          </tr>
        </thead>

        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td
                colSpan={
                  user?.role === "manager" ||
                  user?.role === "admin"
                    ? 5
                    : 4
                }
              >
                No documents found.
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.vendor_name}</td>
                <td>{doc.invoice_number}</td>
                <td>{doc.status}</td>

                {(user?.role === "manager" ||
                  user?.role === "admin") && (
                  <td>
                    {doc.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            approveDocument(doc.id)
                          }
                        >
                          ✅ Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectDocument(doc.id)
                          }
                          style={{ marginLeft: "10px" }}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </td>
                )}

                <td>
                  <button
                    onClick={() =>
                      handleDownload(
                        doc.id,
                        doc.file_url
                      )
                    }
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Layout>
  );
}

export default Documents;