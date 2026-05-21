import { MdSearch, MdFilterList, MdClose } from "react-icons/md";

export default function SearchFilter({
  search, setSearch,
  filters = [], // [{ label, key, options: [{label, value}] }]
  activeFilters = {},
  setActiveFilters,
  placeholder = "খুঁজুন..."
}) {
  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearch("");
    setActiveFilters({});
  };

  const hasActiveFilters = search || Object.values(activeFilters).some(v => v && v !== "all");

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>

        {/* Search Input */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <MdSearch style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8"
          }} size={20} />
          <input
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 40px",
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: "8px", color: "#f1f5f9",
              fontSize: "14px", outline: "none"
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center"
            }}>
              <MdClose size={18} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {filters.map(filter => (
          <div key={filter.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MdFilterList size={16} style={{ color: "#94a3b8" }} />
            <select
              value={activeFilters[filter.key] || "all"}
              onChange={e => handleFilterChange(filter.key, e.target.value)}
              style={{
                padding: "10px 12px", background: "#1e293b",
                border: `1px solid ${activeFilters[filter.key] && activeFilters[filter.key] !== "all" ? "#6366f1" : "#334155"}`,
                borderRadius: "8px", color: "#f1f5f9",
                fontSize: "14px", outline: "none", cursor: "pointer"
              }}
            >
              <option value="all">{filter.label} — সব</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button onClick={handleClearAll} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 16px", background: "#ef444422",
            border: "1px solid #ef444444", borderRadius: "8px",
            color: "#ef4444", cursor: "pointer", fontSize: "13px"
          }}>
            <MdClose size={16} /> সব মুছুন
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {search && (
            <span style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "4px 10px", background: "#6366f122",
              border: "1px solid #6366f144", borderRadius: "20px",
              color: "#6366f1", fontSize: "12px"
            }}>
              🔍 "{search}"
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none",
                color: "#6366f1", cursor: "pointer", display: "flex"
              }}>
                <MdClose size={14} />
              </button>
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === "all") return null;
            const filter = filters.find(f => f.key === key);
            const option = filter?.options.find(o => o.value === value);
            return (
              <span key={key} style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "4px 10px", background: "#6366f122",
                border: "1px solid #6366f144", borderRadius: "20px",
                color: "#6366f1", fontSize: "12px"
              }}>
                {filter?.label}: {option?.label}
                <button onClick={() => handleFilterChange(key, "all")} style={{
                  background: "none", border: "none",
                  color: "#6366f1", cursor: "pointer", display: "flex"
                }}>
                  <MdClose size={14} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}