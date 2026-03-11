import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "physiotrack-patients-v1";

const seedPatients = [
  {
    id: 1,
    name: "Visakamani",
    age: 45,
    gender: "Male",
    phone: "9876543210",
    condition: "Tennis Elbow",
    therapist: "Dr. Javed",
    sessions: 8,
    nextVisit: "2026-03-12",
    status: "Active",
    notes: "improving",
    joinDate: "2026-01-15",
  },
  {
    id: 2,
    name: "Swaminathan",
    age: 32,
    gender: "Male",
    phone: "9123456789",
    condition: "SLAP lesion",
    therapist: "Dr. Javed",
    sessions: 5,
    nextVisit: "2026-03-14",
    status: "Active",
    notes: "Post-op rehabilitation",
    joinDate: "2026-02-01",
  },
];

const THERAPISTS = ["Dr. Javed", "Dr. Bharath Raja"];
const CONDITIONS = [
  "Lower Back Pain",
  "Frozen Shoulder",
  "Knee Osteoarthritis",
  "Sports Injury",
  "Cervical Spondylosis",
  "Post-op Rehab",
  "Stroke Rehabilitation",
  "Tennis Elbow",
  "Golfer's Elbow",
  "PFPS syndrome",
  "Others",
];
const emptyForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  condition: "",
  therapist: "",
  sessions: 0,
  nextVisit: "",
  status: "Active",
  notes: "",
  joinDate: new Date().toISOString().split("T")[0],
};

export default function PhysioApp() {
  const [patients, setPatients] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [saveIndicator, setSaveIndicator] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPatients(JSON.parse(saved));
      } else {
        setPatients(seedPatients);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPatients));
      }
    } catch (e) {
      console.error("Storage error", e);
      setPatients(seedPatients);
    }
    setStorageReady(true);
  }, []);

  // 2. Fast Persist Function
  const persist = useCallback((data) => {
    setSaveIndicator("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Short delay for visual feedback only
      setTimeout(() => setSaveIndicator("saved"), 300);
      setTimeout(() => setSaveIndicator(null), 2000);
    } catch (e) {
      setSaveIndicator("error");
    }
  }, []);

  // 3. Auto-save on change
  useEffect(() => {
    if (!storageReady) return;
    persist(patients);
  }, [patients, storageReady, persist]);

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: patients.length,
    active: patients.filter((p) => p.status === "Active").length,
    completed: patients.filter((p) => p.status === "Completed").length,
    todayVisits: patients.filter(
      (p) => p.nextVisit === new Date().toISOString().split("T")[0]
    ).length,
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.condition || !form.therapist) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (editId) {
      setPatients((ps) =>
        ps.map((p) => (p.id === editId ? { ...form, id: editId } : p))
      );
      showToast("Record updated!");
    } else {
      setPatients((ps) => [
        ...ps,
        { ...form, id: Date.now(), sessions: Number(form.sessions) || 0 },
      ]);
      showToast("Patient registered!");
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleEdit = (p) => {
    setForm(p);
    setEditId(p.id);
    setShowForm(true);
    setView("patients");
    setSelected(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this record?")) {
      setPatients((ps) => ps.filter((p) => p.id !== id));
      showToast("Record deleted", "error");
      setSelected(null);
    }
  };

  const incrementSession = (id) => {
    setPatients((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, sessions: (Number(p.sessions) || 0) + 1 } : p
      )
    );
    if (selected?.id === id)
      setSelected((s) => ({ ...s, sessions: (Number(s.sessions) || 0) + 1 }));
    showToast("Session recorded!");
  };

  if (!storageReady)
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        Initialising PhysioTrack...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "Source Sans 3, sans-serif",
        background: "#f0ebe3",
        minHeight: "100vh",
        color: "#1a1209",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .playfair { font-family: 'Playfair Display', serif; }
        .card { background: #fff; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .btn { cursor: pointer; border: none; border-radius: 4px; font-weight: 600; padding: 10px 18px; transition: 0.2s; }
        .btn-primary { background: #2d5016; color: #fff; }
        .btn-ghost { background: transparent; border: 1px solid #2d5016; color: #2d5016; }
        .nav-item { cursor: pointer; padding: 8px 15px; border-radius: 4px; color: #a0c070; font-size: 14px; }
        .nav-item.active { background: #2d5016; color: #fff; }
        .badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .badge-active { background: #d6eac8; color: #2d5016; }
        .badge-completed { background: #dde0e8; color: #3a4a6b; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #d4c9b5; border-radius: 4px; margin-bottom: 10px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .toast { position: fixed; bottom: 20px; right: 20px; padding: 15px 25px; background: #2d5016; color: #fff; border-radius: 4px; z-index: 200; }
      `}</style>

      {toast && (
        <div
          className="toast"
          style={{ background: toast.type === "error" ? "#8b1a1a" : "#2d5016" }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: "#1a2e0d",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        <div
          style={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>🌿</span>
          <span className="playfair" style={{ fontSize: 20 }}>
            PhysioTrack
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saveIndicator && (
            <span style={{ color: "#7aac5a", fontSize: 12 }}>
              {saveIndicator === "saving" ? "Saving..." : "💾 Saved"}
            </span>
          )}
          <div
            className={`nav-item ${view === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setView("dashboard");
              setSelected(null);
            }}
          >
            Dashboard
          </div>
          <div
            className={`nav-item ${view === "patients" ? "active" : ""}`}
            onClick={() => {
              setView("patients");
              setSelected(null);
            }}
          >
            Patients
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "20px auto", padding: "0 20px" }}>
        {view === "dashboard" && (
          <div>
            <h1 className="playfair" style={{ marginBottom: 20 }}>
              Clinic Overview
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 15,
                marginBottom: 30,
              }}
            >
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Total Patients
                </div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>
                  {stats.total}
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Active Cases</div>
                <div
                  style={{ fontSize: 32, fontWeight: "bold", color: "#2d5016" }}
                >
                  {stats.active}
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Completed</div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>
                  {stats.completed}
                </div>
              </div>
              <div
                className="card"
                style={{ padding: 20, background: "#2d5016", color: "#fff" }}
              >
                <div style={{ fontSize: 12 }}>Today's Visits</div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>
                  {stats.todayVisits}
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setView("patients");
                setShowForm(true);
              }}
            >
              + Register New Patient
            </button>
          </div>
        )}

        {view === "patients" && !selected && (
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <input
                placeholder="Search patients..."
                style={{ width: "60%", margin: 0 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  setForm(emptyForm);
                  setEditId(null);
                  setShowForm(true);
                }}
              >
                Add New
              </button>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "2px solid #f0ebe3",
                    color: "#666",
                  }}
                >
                  <th style={{ padding: 10 }}>Name</th>
                  <th>Condition</th>
                  <th>Therapist</th>
                  <th>Sessions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f0ebe3" }}>
                    <td
                      style={{
                        padding: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#2d5016",
                      }}
                      onClick={() => setSelected(p)}
                    >
                      {p.name}
                    </td>
                    <td>{p.condition}</td>
                    <td>{p.therapist}</td>
                    <td>{p.sessions}</td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          marginRight: 5,
                          background: "none",
                          border: "none",
                          color: "blue",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => incrementSession(p.id)}
                        style={{
                          background: "#2d5016",
                          color: "#fff",
                          border: "none",
                          padding: "2px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        +1
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="card" style={{ padding: 30 }}>
            <button
              onClick={() => setSelected(null)}
              style={{ marginBottom: 20, cursor: "pointer" }}
            >
              ← Back
            </button>
            <h2 className="playfair">{selected.name}</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
                marginTop: 20,
              }}
            >
              <div>
                <p>
                  <strong>Age:</strong> {selected.age}
                </p>
                <p>
                  <strong>Phone:</strong> {selected.phone}
                </p>
                <p>
                  <strong>Condition:</strong> {selected.condition}
                </p>
                <p>
                  <strong>Therapist:</strong> {selected.therapist}
                </p>
              </div>
              <div
                style={{ background: "#fafafa", padding: 20, borderRadius: 4 }}
              >
                <p>
                  <strong>Sessions:</strong> {selected.sessions}
                </p>
                <p>
                  <strong>Notes:</strong>
                </p>
                <p style={{ fontStyle: "italic", color: "#555" }}>
                  {selected.notes || "No notes."}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={() => incrementSession(selected.id)}
              >
                Log Session
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleEdit(selected)}
              >
                Edit Details
              </button>
              <button
                className="btn"
                style={{ color: "red" }}
                onClick={() => handleDelete(selected.id)}
              >
                Delete Patient
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 8,
              width: 500,
              maxWidth: "95%",
            }}
          >
            <h2 className="playfair" style={{ marginBottom: 20 }}>
              {editId ? "Update Record" : "New Patient"}
            </h2>
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label>Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <label>Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              <option value="">Select...</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label>Therapist</label>
            <select
              value={form.therapist}
              onChange={(e) => setForm({ ...form, therapist: e.target.value })}
            >
              <option value="">Select...</option>
              {THERAPISTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleSubmit}
              >
                Save Record
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
