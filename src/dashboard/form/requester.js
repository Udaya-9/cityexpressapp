import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequisitionModal from "../../procurement/form/modal"; 
import "./DashboardContent.css";

const DashboardContent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); 

  return (
    <div className="dash-content">
      {/* PAGE HEAD */}
      <div className="dash-page-head">
        <div>
          <div className="dash-page-title">My Dashboard</div>
          <div className="dash-page-sub">
            Welcome back — create new requests or track your existing submissions
          </div>
        </div>     
      </div>

      {/* HERO ACTIONS */}
      <div className="hero-actions">
        <div
          className="hero-card"
          onClick={() => setIsModalOpen(true)} // 👈 Open Modal here
        >
          <div className="hero-icon hero-icon-req">📋</div>
          <div className="hero-content">
            <div className="hero-title">Create New Requisition</div>
            <div className="hero-desc">
              Request items like keyboard, pen, diary, or any office supplies. Your request will be routed to the approver.
            </div>
          </div>
          <div className="hero-arrow">→</div>
        </div>

        <div
          className="hero-card"
          onClick={() => navigate("/memo/create")}
        >
          <div className="hero-icon hero-icon-memo">✍️</div>
          <div className="hero-content">
            <div className="hero-title">Create New Memo</div>
            <div className="hero-desc">
              Draft a memo for purchase orders, policy updates, or general announcements. Send for approval.
            </div>
          </div>
          <div className="hero-arrow">→</div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">My Requisitions</span>
            <div className="kpi-icon ic-blue">📋</div>
          </div>
          <div className="kpi-value">12</div>
          <div className="kpi-foot">
            <span className="trend up">▲ 3 this week</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Pending Approval</span>
            <div className="kpi-icon ic-orange">⏳</div>
          </div>
          <div className="kpi-value">3</div>
          <div className="kpi-foot">
            <span>awaiting approver</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Approved</span>
            <div className="kpi-icon ic-green">✅</div>
          </div>
          <div className="kpi-value">8</div>
          <div className="kpi-foot">
            <span className="trend up">▲ 2 this week</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">My Memos</span>
            <div className="kpi-icon ic-purple">🧾</div>
          </div>
          <div className="kpi-value">5</div>
          <div className="kpi-foot">
            <span>2 pending · 3 approved</span>
          </div>
        </div>
      </div>

      {/* 👈 Render Modal outside the main content */}
      <RequisitionModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {      
          console.log("Requisition created successfully");
        }}
      />
    </div>
  );
};

export default DashboardContent;