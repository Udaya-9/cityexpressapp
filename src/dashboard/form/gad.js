import React from "react";
import "./AdminDashboardContent.css";

const AdminDashboardContent = () => {
  return (
    <div className="admin-dash">
      {/* PAGE HEAD */}
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">Dashboard & Analytics</div>
          <div className="admin-page-sub">Overview of requisitions, approvals, dispatch & stock — FY 2024-25</div>
        </div>
        <div className="admin-page-actions">
          <button className="btn">📅 This Month</button>
          <button className="btn">⬇️ Export</button>
          <button className="btn btn-primary">＋ New Requisition</button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Total Requisitions</span>
            <div className="kpi-icon ic-blue">📋</div>
          </div>
          <div className="kpi-value">1,284</div>
          <div className="kpi-foot">
            <span className="trend up">▲ 12.4%</span>
            <span>vs last month</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Pending Approvals</span>
            <div className="kpi-icon ic-orange">⏳</div>
          </div>
          <div className="kpi-value">48</div>
          <div className="kpi-foot">
            <span className="trend down">▲ 8.2%</span>
            <span>needs attention</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Dispatched Today</span>
            <div className="kpi-icon ic-green">🚚</div>
          </div>
          <div className="kpi-value">96</div>
          <div className="kpi-foot">
            <span className="trend up">▲ 5.6%</span>
            <span>vs yesterday</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Low Stock Items</span>
            <div className="kpi-icon ic-red">⚠️</div>
          </div>
          <div className="kpi-value">14</div>
          <div className="kpi-foot">
            <span className="trend down">▲ 3 new</span>
            <span>reorder suggested</span>
          </div>
        </div>
      </div>

      {/* ROW 1: Requisition Trend + Status Donut */}
      <div className="grid-2">
        {/* Bar chart */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot"></span>
              Requisition Trend
            </div>
            <a className="card-link">View Report →</a>
          </div>

          <div className="chart-wrap">
            <div className="chart-bars">
              {[
                { label: "Jan", rejected: 12, pending: 20, approved: 48 },
                { label: "Feb", rejected: 8, pending: 26, approved: 56 },
                { label: "Mar", rejected: 10, pending: 18, approved: 64 },
                { label: "Apr", rejected: 6, pending: 22, approved: 70 },
                { label: "May", rejected: 14, pending: 30, approved: 52 },
                { label: "Jun", rejected: 8, pending: 16, approved: 76 },
                { label: "Jul", rejected: 10, pending: 24, approved: 68 }
              ].map((item) => (
                <div className="bar-col" key={item.label}>
                  <div className="bar-stack">
                    <div className="bar-seg bar-rejected" style={{ height: `${item.rejected}%` }}></div>
                    <div className="bar-seg bar-pending" style={{ height: `${item.pending}%` }}></div>
                    <div className="bar-seg bar-approved" style={{ height: `${item.approved}%` }}></div>
                  </div>
                  <div className="bar-label">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: "var(--success)" }}></span>
                Approved
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: "var(--brand)" }}></span>
                Pending
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: "var(--danger)" }}></span>
                Rejected
              </div>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot"></span>
              Requisition Status
            </div>
          </div>

          <div className="donut-wrap">
            <div className="donut" style={{ background: "conic-gradient(var(--success) 0deg 234deg, var(--brand) 234deg 306deg, var(--danger) 306deg 342deg, #EEF1F6 342deg 360deg)" }}>
              <div className="donut-center">
                <div className="donut-center-val">1,284</div>
                <div className="donut-center-lbl">Total</div>
              </div>
            </div>

            <div className="donut-legend">
              <div className="dlegend-item">
                <div className="dlegend-left">
                  <span className="legend-dot" style={{ background: "var(--success)" }}></span>
                  Approved
                </div>
                <span className="dlegend-val">834</span>
              </div>
              <div className="dlegend-item">
                <div className="dlegend-left">
                  <span className="legend-dot" style={{ background: "var(--brand)" }}></span>
                  Pending
                </div>
                <span className="dlegend-val">256</span>
              </div>
              <div className="dlegend-item">
                <div className="dlegend-left">
                  <span className="legend-dot" style={{ background: "var(--danger)" }}></span>
                  Rejected
                </div>
                <span className="dlegend-val">128</span>
              </div>
              <div className="dlegend-item">
                <div className="dlegend-left">
                  <span className="legend-dot" style={{ background: "#EEF1F6" }}></span>
                  Cancelled
                </div>
                <span className="dlegend-val">66</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Recent Requisitions + Pending Approvals */}
      <div className="grid-2">
        {/* Recent requisitions */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot"></span>
              Recent Requisitions
            </div>
            <a className="card-link">View All →</a>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Requester</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cell-id">#REQ-1042</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="list-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>RS</div>
                      <span className="cell-strong">Ram Sharma</span>
                    </div>
                  </td>
                  <td>Keyboard, Mouse</td>
                  <td><span className="pill pill-info"><i></i>Pending</span></td>
                  <td style={{ textAlign: "right" }}><button className="action-btn">👁️</button></td>
                </tr>
                <tr>
                  <td className="cell-id">#REQ-1041</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="list-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>ST</div>
                      <span className="cell-strong">Sita Thapa</span>
                    </div>
                  </td>
                  <td>Pen, Diary × 5</td>
                  <td><span className="pill pill-success"><i></i>Approved</span></td>
                  <td style={{ textAlign: "right" }}><button className="action-btn">👁️</button></td>
                </tr>
                <tr>
                  <td className="cell-id">#REQ-1040</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="list-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>HG</div>
                      <span className="cell-strong">Hari Gurung</span>
                    </div>
                  </td>
                  <td>Cap × 10</td>
                  <td><span className="pill pill-success"><i></i>Dispatched</span></td>
                  <td style={{ textAlign: "right" }}><button className="action-btn">👁️</button></td>
                </tr>
                <tr>
                  <td className="cell-id">#REQ-1039</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="list-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>BK</div>
                      <span className="cell-strong">Bikash Rai</span>
                    </div>
                  </td>
                  <td>Notebook × 20</td>
                  <td><span className="pill pill-danger"><i></i>Rejected</span></td>
                  <td style={{ textAlign: "right" }}><button className="action-btn">👁️</button></td>
                </tr>
                <tr>
                  <td className="cell-id">#REQ-1038</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="list-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>AK</div>
                      <span className="cell-strong">Anita Karki</span>
                    </div>
                  </td>
                  <td>Marker, Whiteboard</td>
                  <td><span className="pill pill-purple"><i></i>Partial</span></td>
                  <td style={{ textAlign: "right" }}><button className="action-btn">👁️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending approvals */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot" style={{ background: "var(--warning)" }}></span>
              Pending Approvals
            </div>
            <a className="card-link">Review →</a>
          </div>

          <div className="card-body">
            <div className="list-row">
              <div className="list-avatar" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>RS</div>
              <div className="list-main">
                <div className="list-title">Ram Sharma — IT Dept</div>
                <div className="list-sub">Keyboard, Mouse · 2 items</div>
              </div>
              <div className="list-right">
                <div className="pill pill-warning"><i></i>4h ago</div>
              </div>
            </div>

            <div className="list-row">
              <div className="list-avatar" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>SM</div>
              <div className="list-main">
                <div className="list-title">Suman Maharjan — HR</div>
                <div className="list-sub">Pen, Diary · 5 items</div>
              </div>
              <div className="list-right">
                <div className="pill pill-warning"><i></i>6h ago</div>
              </div>
            </div>

            <div className="list-row">
              <div className="list-avatar" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>PK</div>
              <div className="list-main">
                <div className="list-title">Prakash K.C — Finance</div>
                <div className="list-sub">Calculator, Stapler · 3 items</div>
              </div>
              <div className="list-right">
                <div className="pill pill-danger"><i></i>1d ago</div>
              </div>
            </div>

            <div className="list-row">
              <div className="list-avatar" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>NJ</div>
              <div className="list-main">
                <div className="list-title">Nisha Joshi — Marketing</div>
                <div className="list-sub">Marker, Chart paper · 4 items</div>
              </div>
              <div className="list-right">
                <div className="pill pill-warning"><i></i>2h ago</div>
              </div>
            </div>

            <div className="list-row">
              <div className="list-avatar" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>RB</div>
              <div className="list-main">
                <div className="list-title">Rajan Basnet — Operations</div>
                <div className="list-sub">Cap, T-shirt · 25 items</div>
              </div>
              <div className="list-right">
                <div className="pill pill-warning"><i></i>8h ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Stock Alerts + Top Items + Quick Actions */}
      <div className="grid-3">
        {/* Stock alerts */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot" style={{ background: "var(--danger)" }}></span>
              Low Stock Alerts
            </div>
            <a className="card-link">Manage →</a>
          </div>

          <div className="card-body">
            {[
              { name: "Keyboard", qty: 4, total: 50, color: "pf-red", width: "8%" },
              { name: "Diary", qty: 12, total: 100, color: "pf-orange", width: "12%" },
              { name: "Pen (Blue)", qty: 28, total: 200, color: "pf-orange", width: "14%" },
              { name: "Cap", qty: 18, total: 150, color: "pf-orange", width: "12%" },
              { name: "A4 Paper Ream", qty: 35, total: 300, color: "pf-green", width: "12%" }
            ].map((item, idx) => (
              <div className="stock-item" key={idx}>
                <div className="stock-top">
                  <span className="stock-name">{item.name}</span>
                  <span className="stock-qty"><b>{item.qty}</b> / {item.total}</span>
                </div>
                <div className="progress"><div className={`progress-fill ${item.color}`} style={{ width: item.width }}></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top requested items */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot" style={{ background: "var(--purple)" }}></span>
              Top Requested Items
            </div>
            <a className="card-link">Report →</a>
          </div>

          <div className="card-body">
            {[
              { rank: "1", name: "Pen (Blue)", reqs: 214, qty: 1240 },
              { rank: "2", name: "A4 Paper Ream", reqs: 186, qty: 980 },
              { rank: "3", name: "Diary", reqs: 142, qty: 620 },
              { rank: "4", name: "Keyboard", reqs: 98, qty: 112 },
              { rank: "5", name: "Cap", reqs: 76, qty: 340 }
            ].map((item, idx) => (
              <div className="list-row" key={idx}>
                <div className="list-avatar" style={{ background: "var(--purple-soft)", color: "var(--purple)" }}>{item.rank}</div>
                <div className="list-main">
                  <div className="list-title">{item.name}</div>
                  <div className="list-sub">{item.reqs} requisitions</div>
                </div>
                <div className="list-right" style={{ fontWeight: 700, color: "var(--navy)" }}>{item.qty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="card-title-dot" style={{ background: "var(--accent)" }}></span>
              Quick Actions
            </div>
          </div>

          <div className="quick-grid">
            <div className="quick-card">
              <div className="quick-icon ic-blue">📋</div>
              <div className="quick-label">New Requisition</div>
              <div className="quick-sub">Create a request</div>
            </div>

            <div className="quick-card">
              <div className="quick-icon ic-green">✅</div>
              <div className="quick-label">Approve Items</div>
              <div className="quick-sub">5 pending</div>
            </div>

            <div className="quick-card">
              <div className="quick-icon ic-orange">🚚</div>
              <div className="quick-label">Dispatch Order</div>
              <div className="quick-sub">3 waiting</div>
            </div>

            <div className="quick-card">
              <div className="quick-icon ic-purple">📦</div>
              <div className="quick-label">Add Stock</div>
              <div className="quick-sub">Update inventory</div>
            </div>

            <div className="quick-card">
              <div className="quick-icon ic-red">⚠️</div>
              <div className="quick-label">Reorder Items</div>
              <div className="quick-sub">14 low stock</div>
            </div>

            <div className="quick-card">
              <div className="quick-icon ic-blue">📈</div>
              <div className="quick-label">View Reports</div>
              <div className="quick-sub">Analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Department consumption */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <span className="card-title-dot"></span>
            Department-wise Consumption (This Month)
          </div>
          <a className="card-link">Full Report →</a>
        </div>

        <div style={{ padding: "20px 20px 8px" }}>
          {[
            { dept: "IT Department", items: 342, cost: "128,400", color: "pf-green", width: "82%" },
            { dept: "Operations", items: 286, cost: "96,200", color: "pf-green", width: "68%" },
            { dept: "Finance", items: 198, cost: "62,800", color: "pf-orange", width: "48%" },
            { dept: "Human Resources", items: 156, cost: "48,500", color: "pf-orange", width: "38%" },
            { dept: "Marketing", items: 112, cost: "34,100", color: "pf-orange", width: "28%" },
            { dept: "Admin", items: 84, cost: "21,600", color: "pf-green", width: "20%" }
          ].map((item, idx) => (
            <div className="stock-item" key={idx}>
              <div className="stock-top">
                <span className="stock-name">{item.dept}</span>
                <span className="stock-qty"><b>{item.items}</b> items · Rs. {item.cost}</span>
              </div>
              <div className="progress" style={{ height: 10 }}><div className={`progress-fill ${item.color}`} style={{ width: item.width }}></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;