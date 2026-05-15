import { useState } from "react";
import { flights, fareClasses } from "../data/mockData";
import type { FareClass } from "../data/mockData";
import { ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";

const statusBadge: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
  waitlist: "bg-amber-100 text-amber-700",
};
const statusLabel: Record<string, string> = {
  open: "판매중",
  closed: "마감",
  waitlist: "대기",
};

export default function FareManagement() {
  const [selectedFlight, setSelectedFlight] = useState(flights[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [fares, setFares] = useState<FareClass[]>(fareClasses);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const flight = flights.find((f) => f.id === selectedFlight)!;
  const lf = Math.round((flight.bookedSeats / flight.totalSeats) * 100);
  const flightFares = fares
    .filter((fc) => fc.flightId === selectedFlight)
    .sort((a, b) => sortDir === "asc"
      ? a.fare - b.fare
      : b.fare - a.fare
    );

  const startEdit = (fc: FareClass) => {
    setEditingId(`${fc.flightId}-${fc.bookingClass}`);
    setEditValue(String(fc.fare));
  };
  const saveEdit = (fc: FareClass) => {
    const newFare = parseInt(editValue, 10);
    if (!isNaN(newFare) && newFare > 0) {
      setFares((prev) =>
        prev.map((item) =>
          item.flightId === fc.flightId && item.bookingClass === fc.bookingClass
            ? { ...item, fare: newFare }
            : item
        )
      );
    }
    setEditingId(null);
  };

  const lfColor =
    lf >= 85 ? "text-red-600 bg-red-50" :
    lf >= 65 ? "text-amber-600 bg-amber-50" :
    "text-blue-600 bg-blue-50";

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800">운임 관리</h2>

      {/* Flight selector */}
      <div className="flex flex-wrap gap-2">
        {flights.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFlight(f.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              selectedFlight === f.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            <span className="font-bold">{f.flightNo}</span>
            <span className="ml-1.5 text-xs opacity-80">{f.route} {f.date.slice(5)} {f.departureTime}</span>
          </button>
        ))}
      </div>

      {/* Flight summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-6 items-center">
        <div>
          <div className="text-xs text-gray-400">항공편</div>
          <div className="font-bold text-gray-800 text-lg">{flight.flightNo}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">노선</div>
          <div className="font-semibold text-gray-700">{flight.route}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">출발</div>
          <div className="font-semibold text-gray-700">{flight.date} {flight.departureTime}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">좌석</div>
          <div className="font-semibold text-gray-700">{flight.bookedSeats} / {flight.totalSeats}</div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${lfColor}`}>
          LF {lf}%
        </div>
      </div>

      {/* Fare table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Booking Class</th>
              <th
                className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none"
                onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              >
                <span className="flex items-center justify-end gap-1">
                  운임 (KRW)
                  {sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">예약/가용</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">LF</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">상태</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">수정</th>
            </tr>
          </thead>
          <tbody>
            {flightFares.map((fc) => {
              const key = `${fc.flightId}-${fc.bookingClass}`;
              const isEditing = editingId === key;
              const classLf = Math.round((fc.bookedSeats / fc.availableSeats) * 100);
              return (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                      {fc.bookingClass}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-28 border border-blue-400 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(fc); if (e.key === "Escape") setEditingId(null); }}
                      />
                    ) : (
                      fc.fare.toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {fc.bookedSeats} / {fc.availableSeats}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${classLf >= 85 ? "text-red-600" : classLf >= 65 ? "text-amber-600" : "text-blue-600"}`}>
                      {classLf}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[fc.status]}`}>
                      {statusLabel[fc.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <button onClick={() => saveEdit(fc)} className="text-emerald-600 hover:text-emerald-700"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-500"><X size={16} /></button>
                      </span>
                    ) : (
                      <button
                        onClick={() => startEdit(fc)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
