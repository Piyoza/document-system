import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function ManagerDashboard() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  async function fetchPendingDocuments() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://worker.sfundo-xulu-digifycx.workers.dev/api/manager/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending invoices.");
    }
  }

  async function approveInvoice(id) {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `https://worker.sfundo-xulu-digifycx.workers.dev/api/manager/approve/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(res.data.message);

    // Reload pending invoices
    fetchPendingDocuments();

  } catch (err) {
    console.error(err);
    alert("Approval failed.");
  }
}

  return (
    <Layout>
      <h1>Manager Dashboard</h1>

      <h3>Pending Invoices</h3>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
       <thead>
  <tr>
    <th>ID</th>
    <th>Vendor</th>
    <th>Invoice No.</th>
    <th>Invoice Date</th>
    <th>VAT</th>
    <th>Total Amount</th>
    <th>Status</th>
    <th>Action</th>
  </tr>
</thead>

        <tbody>
  {documents.length === 0 ? (
    <tr>
      <td colSpan="8" style={{ textAlign: "center" }}>
        No pending invoices.
      </td>
    </tr>
  ) : (
    documents.map((doc) => (
      <tr key={doc.id}>
        <td>{doc.id}</td>

        <td>{doc.vendor_name || "Not Found"}</td>

        <td>{doc.invoice_number || "Not Found"}</td>

        <td>
          {doc.invoice_date
            ? new Date(doc.invoice_date).toLocaleDateString()
            : "Not Found"}
        </td>

        <td>
          R {Number(doc.vat || 0).toLocaleString()}
        </td>

        <td>
          <strong>
            R {Number(doc.amount || 0).toLocaleString()}
          </strong>
        </td>

        <td>{doc.status}</td>

        <td>
          <button
            onClick={() => approveInvoice(doc.id)}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ✅ Approve
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