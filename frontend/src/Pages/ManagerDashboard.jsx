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
            <th>Invoice</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td>{doc.vendor_name}</td>
              <td>{doc.invoice_number}</td>
              <td>R {doc.amount}</td>
              <td>{doc.status}</td>

              <td>
                <button onClick={() => approveInvoice(doc.id)}>
  Approve
</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}