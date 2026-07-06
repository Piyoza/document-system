import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./FinanceDashboard.css";

export default function Dashboard() {
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

      console.log("Analytics Response:", res.data);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!analytics || !analytics.summary) {
    return <h2>Loading dashboard...</h2>;
  }

  const statusData = [
    {
      name: "Pending",
      value: analytics.summary.pending,
    },
    {
      name: "Approved",
      value: analytics.summary.approved,
    },
  ];

  const COLORS = ["#f59e0b", "#22c55e"];

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>Analytics Dashboard</h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "220px",
            }}
          >
            <h3>Total Documents</h3>
            <h2>{analytics.summary.totalDocuments}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "220px",
            }}
          >
            <h3>Pending</h3>
            <h2>{analytics.summary.pending}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "220px",
            }}
          >
            <h3>Approved</h3>
            <h2>{analytics.summary.approved}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "220px",
            }}
          >
            <h3>Total Amount</h3>
            <h2>R {analytics.summary.totalAmount}</h2>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              minWidth: "220px",
            }}
          >
            <h3>Total VAT</h3>
            <h2>R {analytics.summary.totalVAT}</h2>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Invoice Status</h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}