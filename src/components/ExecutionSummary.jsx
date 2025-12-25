function ExecutionSummary({ executionSummary }) {
  if (!executionSummary) return null;

  const cards = [
    {
      label: "Total Elements",
      value: executionSummary.total || 0,
      color: "bg-blue-600",
      icon: "📊",
    },
    {
      label: "Attempted",
      value: executionSummary.attempted || 0,
      color: "bg-yellow-600",
      icon: "⚡",
    },
    {
      label: "Successful",
      value: executionSummary.successful || 0,
      color: "bg-green-600",
      icon: "✅",
    },
    {
      label: "Failed",
      value: executionSummary.failed || 0,
      color: "bg-red-600",
      icon: "❌",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className={`${card.color} text-white text-xs px-2 py-1 rounded`}>
              {card.label}
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

export default ExecutionSummary;

