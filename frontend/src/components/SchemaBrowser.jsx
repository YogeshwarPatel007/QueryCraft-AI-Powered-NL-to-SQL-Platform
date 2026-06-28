import { useEffect, useState } from "react";
import { getTables, getTableDetail } from "../api/dbApi";

const TYPE_COLORS = {
  integer: "bg-info-light text-info",
  bigint: "bg-info-light text-info",
  smallint: "bg-info-light text-info",
  numeric: "bg-info-light text-info",
  real: "bg-info-light text-info",
  "double precision": "bg-info-light text-info",
  text: "bg-teal-light text-teal",
  "character varying": "bg-teal-light text-teal",
  varchar: "bg-teal-light text-teal",
  boolean: "bg-warning-light text-warning",
  date: "bg-accent-light text-accent",
  timestamp: "bg-accent-light text-accent",
  "timestamp with time zone": "bg-accent-light text-accent",
  "timestamp without time zone": "bg-accent-light text-accent",
  json: "bg-danger-light text-danger",
  jsonb: "bg-danger-light text-danger",
  uuid: "bg-surface2 text-muted",
};

function getTypeColor(type) {
  const normalized = type?.toLowerCase() || "";
  return TYPE_COLORS[normalized] || "bg-surface2 text-muted";
}

export default function SchemaBrowser({ connectionId }) {
  const [tables, setTables] = useState([]);
  const [openTable, setOpenTable] = useState(null);
  const [detailByTable, setDetailByTable] = useState({});
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!connectionId) return;
    setTables([]);
    setOpenTable(null);
    setDetailByTable({});
    setLoadingTables(true);
    setError(null);

    getTables(connectionId)
      .then((res) => setTables(res.data.tables))
      .catch((err) => setError(err.response?.data?.error || "Failed to load tables"))
      .finally(() => setLoadingTables(false));
  }, [connectionId]);

  function toggleTable(table) {
    if (openTable === table) {
      setOpenTable(null);
      return;
    }
    setOpenTable(table);
    if (detailByTable[table]) return;

    setLoadingDetail(true);
    setError(null);
    getTableDetail(connectionId, table, 10)
      .then((res) => setDetailByTable((prev) => ({ ...prev, [table]: res.data })))
      .catch((err) => setError(err.response?.data?.error || "Failed to load table preview"))
      .finally(() => setLoadingDetail(false));
  }

  if (!connectionId) return null;

  const filteredTables = tables.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-ink border border-line rounded-2xl shadow-elevation-1 overflow-hidden">
      <div className="px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
          </svg>
          <h3 className="text-sm font-semibold text-text">Schema Browser</h3>
          <span className="text-[10px] bg-surface2 text-muted px-2 py-0.5 rounded-full font-medium">
            {tables.length} table{tables.length !== 1 ? "s" : ""}
          </span>
        </div>

        {tables.length > 3 && (
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search tables…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-line rounded-lg pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
          </div>
        )}
      </div>

      {loadingTables && (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 shimmer-bg rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4">
          <p className="text-xs text-danger bg-danger-light rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      <div className="flex flex-col max-h-[460px] overflow-y-auto">
        {filteredTables.map((t) => {
          const isOpen = openTable === t;
          const detail = detailByTable[t];
          return (
            <div key={t} className="border-b border-line last:border-b-0">
              <button
                onClick={() => toggleTable(t)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-mono transition-colors ${
                  isOpen ? "bg-accent-light text-accent" : "text-text hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                  </svg>
                  <span className="font-medium">{t}</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 py-3 bg-surface border-t border-line animate-slideDown">
                  {loadingDetail && !detail && (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-5 shimmer-bg rounded w-3/4" />
                      ))}
                    </div>
                  )}
                  {detail && (
                    <>
                      {/* Columns */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {detail.columns.map((c) => (
                          <span
                            key={c.column_name}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-mono ${getTypeColor(c.data_type)}`}
                          >
                            <span className="font-semibold">{c.column_name}</span>
                            <span className="opacity-70">{c.data_type}</span>
                          </span>
                        ))}
                      </div>

                      {/* Preview table */}
                      <div className="overflow-x-auto border border-line rounded-lg">
                        <table className="w-full text-[11px] font-mono">
                          <thead className="bg-surface2">
                            <tr>
                              {detail.columns.map((c) => (
                                <th key={c.column_name} className="text-left px-2 py-1.5 text-muted whitespace-nowrap font-semibold">
                                  {c.column_name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {detail.rows.map((row, i) => (
                              <tr key={i} className="border-t border-line">
                                {detail.columns.map((c) => (
                                  <td key={c.column_name} className="px-2 py-1.5 text-text whitespace-nowrap">
                                    {row[c.column_name] === null ? (
                                      <span className="text-muted/40 italic">null</span>
                                    ) : (
                                      String(row[c.column_name])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-muted mt-2">
                        Showing {detail.rows.length} sample row{detail.rows.length !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}