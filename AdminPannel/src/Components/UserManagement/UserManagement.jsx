import React, { useState, useEffect, useMemo } from "react";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiSlash,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiMapPin,
  FiShoppingBag,
  FiTrash2,
  FiInbox,
  FiShield,
} from "react-icons/fi";
import API from "../../services/api";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch users from real MongoDB database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/auth/users");
      if (res.data?.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(
        err.response?.data?.message ||
          "Could not load users from server. Please check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user status (Active <-> Blocked)
  const toggleUserStatus = async (id, currentStatus, name) => {
    const nextStatus = currentStatus === "Active" ? "Blocked" : "Active";
    setActionLoadingId(id);
    try {
      const res = await API.patch(`/auth/users/${id}/status`, { status: nextStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id || u._id === id ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete user from database
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      await API.delete(`/auth/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search.trim() ||
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.phone || "").includes(search) ||
        (u.address || "").toLowerCase().includes(search.toLowerCase());

      const matchRole =
        roleFilter === "all" ||
        (u.role || "").toLowerCase() === roleFilter.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        (u.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const subscribers = users.filter((u) => (u.role || "").toLowerCase() === "subscriber").length;
    const corporate = users.filter((u) => (u.role || "").toLowerCase() === "corporate").length;
    const active = users.filter((u) => (u.status || "").toLowerCase() === "active").length;
    return { total, subscribers, corporate, active };
  }, [users]);

  return (
    <div className="UserManagement">
      <header className="UserManagement-header">
        <div className="UserManagement-heading">
          <div className="UserManagement-headingIcon">
            <FiUsers />
          </div>
          <div>
            <h1>User &amp; Customer Management</h1>
            <span className="UserManagement-subHeading">
              Live registered customers and accounts from database
            </span>
          </div>
        </div>
        <div className="UserManagement-actions">
          <button
            type="button"
            className="UserManagement-btn secondary"
            onClick={fetchUsers}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="UserManagement-statsGrid">
        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon total">
            <FiUsers />
          </div>
          <div>
            <span className="UserManagement-statLabel">Registered Users</span>
            <span className="UserManagement-statValue">{stats.total}</span>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon subs">
            <FiShoppingBag />
          </div>
          <div>
            <span className="UserManagement-statLabel">Subscribers</span>
            <span className="UserManagement-statValue">{stats.subscribers}</span>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon corp">
            <FiMapPin />
          </div>
          <div>
            <span className="UserManagement-statLabel">Corporate Accounts</span>
            <span className="UserManagement-statValue">{stats.corporate}</span>
          </div>
        </div>

        <div className="UserManagement-statCard">
          <div className="UserManagement-statIcon active">
            <FiCheckCircle />
          </div>
          <div>
            <span className="UserManagement-statLabel">Active &amp; Verified</span>
            <span className="UserManagement-statValue">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="UserManagement-controlBar">
        <div className="UserManagement-searchBox">
          <FiSearch className="UserManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or neighborhood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="UserManagement-filterGroup">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All User Roles</option>
            <option value="Retail Customer">Retail Customer</option>
            <option value="Subscriber">Subscriber</option>
            <option value="Corporate">Corporate</option>
            <option value="Administrator">Administrator</option>
          </select>

          <div className="UserManagement-statusTabs">
            <button
              type="button"
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={statusFilter === "active" ? "active" : ""}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={statusFilter === "blocked" ? "active" : ""}
              onClick={() => setStatusFilter("blocked")}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && <div className="UserManagement-alert error">{error}</div>}

      {/* Table */}
      <div className="UserManagement-tableCard">
        {loading ? (
          <div className="UserManagement-loadingState">
            <FiRefreshCw className="spin" />
            <span>Loading user accounts from database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="UserManagement-emptyState">
            <FiInbox size={42} />
            <h3>No Users Found</h3>
            <p>
              {users.length === 0
                ? "No registered users in the database yet. New accounts created on http://localhost:5173/login will appear here in real-time."
                : "No users match your search and filter criteria."}
            </p>
          </div>
        ) : (
          <table className="UserManagement-table">
            <thead>
              <tr>
                <th>Customer Name / Role</th>
                <th>Contact Info</th>
                <th>Address / Location</th>
                <th>Subscription Plan</th>
                <th>Orders / Spent</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isPrimaryAdmin =
                  u.email === "admin@alkadrops.com" || u.role === "Administrator";
                const isActing = actionLoadingId === (u.id || u._id);

                return (
                  <tr key={u.id || u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      <span className="UserManagement-subText">
                        {isPrimaryAdmin ? <FiShield /> : <FiUsers />} {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="UserManagement-contact">
                        <FiMail /> {u.email}
                      </span>
                      <span className="UserManagement-subText">
                        <FiPhone /> {u.phone}
                      </span>
                    </td>
                    <td>{u.address}</td>
                    <td>
                      <span className="UserManagement-planBadge">{u.plan}</span>
                    </td>
                    <td>
                      <strong>{u.totalSpend}</strong>
                      <span className="UserManagement-subText">
                        {u.ordersCount} orders
                      </span>
                    </td>
                    <td>
                      <span
                        className={`UserManagement-statusPill ${
                          (u.status || "Active").toLowerCase()
                        }`}
                      >
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!isPrimaryAdmin && (
                        <div className="UserManagement-actionsGroup">
                          <button
                            type="button"
                            className={`UserManagement-blockBtn ${
                              u.status === "Active" ? "block" : "unblock"
                            }`}
                            onClick={() =>
                              toggleUserStatus(u.id || u._id, u.status, u.name)
                            }
                            disabled={isActing}
                          >
                            {u.status === "Active" ? "Block" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="UserManagement-deleteBtn"
                            onClick={() =>
                              handleDeleteUser(u.id || u._id, u.name)
                            }
                            disabled={isActing}
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

