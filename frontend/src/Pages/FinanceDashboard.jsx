import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./FinanceDashboard.css";

export default function FinanceDashboard() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceDocuments();
  }, []);

  async function fetchFinanceDocuments() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://worker.sfundo-xulu-digifycx.workers.dev/api/finance/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load finance invoices.");
    } finally {
      setLoading(false);
    }
  }

  async function finalApprove(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `https://worker.sfundo-xulu-digifycx.workers.dev/api/finance/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      fetchFinanceDocuments();
    } catch (err) {
      console.error(err);
      alert("Finance approval failed.");
    }
  }

  async function rejectInvoice(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `https://worker.sfundo-xulu-digifycx.workers.dev/api/finance/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      fetchFinanceDocuments();
    } catch (err) {
      console.error(err);
      alert("Finance rejection failed.");
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchMatch =
        (doc.vendor_name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (doc.invoice_number || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "All" ||
        doc.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [documents, search, statusFilter]);

  const totalInvoices = documents.length;

  const approvedInvoices = documents.filter(
    (doc) => doc.status === "Approved"
  ).length;

  const rejectedInvoices = documents.filter(
    (doc) => doc.status === "Rejected"
  ).length;

  const totalAmount = documents.reduce(
    (sum, doc) => sum + Number(doc.amount || 0),
    0
  );

  return (
    <Layout>
      <div className="finance-dashboard">

        <h1>💰 Finance Dashboard</h1>

        <div className="summary-cards">

          <div className="summary-card card-blue">
            <h4>Total Invoices</h4>
            <h2>{totalInvoices}</h2>
          </div>

          <div className="summary-card card-orange">
            <h4>Awaiting Finance</h4>
            <h2>{documents.length}</h2>
          </div>

          <div className="summary-card card-green">
            <h4>Approved</h4>
            <h2>{approvedInvoices}</h2>
          </div>

          <div className="summary-card card-red">
            <h4>Total Value</h4>
            <h2>
              R {totalAmount.toLocaleString()}
            </h2>
          </div>

        </div>

        <div className="search-bar">

          <input
            type="text"
            placeholder="🔍 Search Vendor or Invoice..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Manager Approved">
              Manager Approved
            </option>
            <option value="Approved">
              Approved
            </option>
            <option value="Rejected">
              Rejected
            </option>
          </select>

        </div>

        <div className="table-container">

          <table className="finance-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Vendor</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>
                              {loading ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>

                    <td>{doc.vendor_name}</td>

                    <td>{doc.invoice_number}</td>

                    <td>
                      <strong>
                        R {Number(doc.amount || 0).toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status ${
                          doc.status === "Approved"
                            ? "approved"
                            : doc.status === "Rejected"
                            ? "rejected"
                            : "manager-approved"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="btn-view"
                          onClick={() =>
                            alert(
                              `Vendor: ${doc.vendor_name}

Invoice: ${doc.invoice_number}

Amount: R ${doc.amount}

Status: ${doc.status}`
                            )
                          }
                        >
                          👁 View
                        </button>

                        {doc.status === "Manager Approved" && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() =>
                                finalApprove(doc.id)
                              }
                            >
                              ✅ Approve
                            </button>

                            <button
                              className="btn-reject"
                              onClick={() =>
                                rejectInvoice(doc.id)
                              }
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>📊 Finance Summary</h3>

          <p>
            <strong>Total Documents:</strong> {totalInvoices}
          </p>

          <p>
            <strong>Approved:</strong> {approvedInvoices}
          </p>

          <p>
            <strong>Rejected:</strong> {rejectedInvoices}
          </p>

          <p>
            <strong>Total Value:</strong> R{" "}
            {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </Layout>
  );
}