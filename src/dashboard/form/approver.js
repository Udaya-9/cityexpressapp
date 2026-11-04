import React, { useState } from "react";
import RequisitionModal from "../../procurement/form/modal"; 
import "./DashboardContent.css";

const ApproverDashboardContent = () => {
  // 👈 State to control the Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="approver-dash">      
  
      <div className="approver-page-head">
        <div>
          <div className="approver-page-title">Approver Dashboard</div>          
        </div>     
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Requisition Batches</span>
            <div className="kpi-icon ic-orange">📦</div>
          </div>
          <div className="kpi-value">4</div>
          <div className="kpi-foot">
            <span className="trend down">▲ 2 urgent</span>
            <span>with 23 total requisitions</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Approved Today</span>
            <div className="kpi-icon ic-green">✅</div>
          </div>
          <div className="kpi-value">12</div>
          <div className="kpi-foot">
            <span className="trend up">▲ 20%</span>
            <span>vs yesterday</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Memos to Review</span>
            <div className="kpi-icon ic-blue">📝</div>
          </div>
          <div className="kpi-value">3</div>
          <div className="kpi-foot">
            <span style={{ color: "var(--muted)" }}>2 purchase · 1 general</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <span className="card-title-dot" style={{ background: "var(--accent)" }}></span>
            Quick Actions
          </div>
        </div>
        <div className="quick-row">
          <div className="quick-card">
            <div className="quick-icon ic-green">✅</div>
            <div className="quick-label">Approve Requisition</div>
            <div className="quick-sub">4 batches pending</div>
          </div>
          <div className="quick-card">
            <div className="quick-icon ic-blue">📝</div>
            <div className="quick-label">Approve Memo</div>
            <div className="quick-sub">3 waiting</div>
          </div>
          <div className="quick-card">
            <div className="quick-icon ic-purple">✍️</div>
            <div className="quick-label">Create Memo</div>
            <div className="quick-sub">Draft a new memo</div>
          </div>
          
          {/* 👈 Added onClick to open the Modal */}
          <div className="quick-card" onClick={() => setIsModalOpen(true)}>
            <div className="quick-icon ic-orange">📋</div>
            <div className="quick-label">New Requisition</div>
            <div className="quick-sub">Create request</div>
          </div>
        </div>
      </div>

 
      {/* MEMOS TABLE */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <span className="card-title-dot" style={{ background: "var(--purple)" }}></span>
            Memos Awaiting Approval
          </div>
          <a className="card-link">View All Memos →</a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Memo ID</th>
                <th>Type</th>
                <th>From</th>
                <th>Subject</th>
                <th>Amount</th>
                <th>Waiting</th>              
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-id">#M-021</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="memo-icon memo-icon-purple">📝</div>
                    <span style={{ fontWeight: 600 }}>Purchase Order</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>Admin</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Operations</div>
                </td>
                <td>IT Equipment Procurement</td>
                <td><b style={{ color: "var(--navy)" }}>Rs. 128,500</b></td>
                <td><span className="pill pill-warning"><i></i>5h ago</span></td>
                <td style={{ textAlign: "right" }}><button className="btn-view">👁 View</button></td>
              </tr>
              <tr>
                <td className="cell-id">#M-020</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="memo-icon memo-icon-blue">📄</div>
                    <span style={{ fontWeight: 600 }}>General</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>HR Department</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Human Resources</div>
                </td>
                <td>Policy Update — Leave Rules</td>
                <td style={{ color: "var(--muted)" }}>—</td>
                <td><span className="pill pill-info"><i></i>2h ago</span></td>
                <td style={{ textAlign: "right" }}><button className="btn-view">👁 View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 👈 Render the Modal at the bottom */}
      <RequisitionModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Add logic to refresh the dashboard data here if needed
          console.log("Requisition posted from Approver Dashboard");
        }}
      />

    </div>
  );
};

export default ApproverDashboardContent;