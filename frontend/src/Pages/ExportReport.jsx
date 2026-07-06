import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "./ExportReport.css";

export default function ExportReport() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://worker.sfundo-xulu-digifycx.workers.dev/api/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(res.data);
    } catch (error) {
      console.error("Failed to load analytics", error);
    }
  }

  const exportPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice Analytics Report", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Metric", "Value"]],
      body: [
        ["Total Documents", analytics.summary.totalDocuments],
        ["Pending Invoices", analytics.summary.pending],
        ["Approved Invoices", analytics.summary.approved],
        ["Total Amount", `R ${analytics.summary.totalAmount}`],
        ["Total VAT", `R ${analytics.summary.totalVAT}`],
      ],
    });

    doc.save("analytics-report.pdf");
  };

  const exportExcel = () => {
    if (!analytics) return;

    const reportData = [
      {
        Metric: "Total Documents",
        Value: analytics.summary.totalDocuments,
      },
      {
        Metric: "Pending Invoices",
        Value: analytics.summary.pending,
      },
      {
        Metric: "Approved Invoices",
        Value: analytics.summary.approved,
      },
      {
        Metric: "Total Amount",
        Value: analytics.summary.totalAmount,
      },
      {
        Metric: "Total VAT",
        Value: analytics.summary.totalVAT,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(reportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Analytics"
    );

    XLSX.writeFile(
      workbook,
      "analytics-report.xlsx"
    );
  };

 return (
  <Layout>
    <div className="export-container">
      <h1 className="export-title">Export Reports</h1>

      <p className="export-subtitle">
        Download analytics reports as PDF or Excel files.
      </p>

      {analytics && (
        <div className="export-cards">
          <div className="export-card">
            <h3>Total Documents</h3>
            <h2>{analytics.summary.totalDocuments}</h2>
          </div>

          <div className="export-card">
            <h3>Pending</h3>
            <h2>{analytics.summary.pending}</h2>
          </div>

          <div className="export-card">
            <h3>Approved</h3>
            <h2>{analytics.summary.approved}</h2>
          </div>

          <div className="export-card">
            <h3>Total Amount</h3>
            <h2>R {analytics.summary.totalAmount}</h2>
          </div>
        </div>
      )}

      <div className="export-actions">
        <button
          className="export-btn pdf-btn"
          onClick={exportPDF}
        >
          📄 Export PDF
        </button>

        <button
          className="export-btn excel-btn"
          onClick={exportExcel}
        >
          📊 Export Excel
        </button>
      </div>
    </div>
  </Layout>
);
}