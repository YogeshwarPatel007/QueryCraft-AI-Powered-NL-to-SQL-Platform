export default function ResultTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-sm">No rows returned.</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="bg-surface">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wider whitespace-nowrap border-b border-line"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-line hover:bg-surface-hover transition-colors ${
                i % 2 === 0 ? "bg-ink" : "bg-surface/50"
              }`}
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2.5 text-text whitespace-nowrap">
                  {row[col] === null ? (
                    <span className="text-muted/50 italic text-xs">null</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}