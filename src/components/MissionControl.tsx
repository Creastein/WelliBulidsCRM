import React, { useState, useEffect } from "react";
import {
  Target,
  MessageSquare,
  Reply,
  Handshake,
  DollarSign,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ListTodo,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Data
const kpiData = [
  {
    title: "Total DM Terkirim",
    value: 37,
    target: "Target: 800 dalam 20 hari",
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    progress: (37 / 800) * 100,
  },
  {
    title: "Total Reply",
    value: 2,
    target: "Target: ~48 reply (6%)",
    icon: Reply,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    progress: (2 / 48) * 100,
  },
  {
    title: "Closing / Deal",
    value: 0,
    target: "Target: 3–5 klien",
    icon: Handshake,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    progress: 0,
  },
  {
    title: "Revenue Masuk",
    value: "Rp 0",
    target: "Target: Rp 10.000.000",
    icon: DollarSign,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    progress: 0,
  },
];

const pipelineData = [
  {
    status: "🔁 Follow Up",
    count: 4,
    percentage: 11,
    action: "Kirim WA follow up",
    color: "#3b82f6",
  },
  {
    status: "🔇 Tidak Respon",
    count: 0,
    percentage: 0,
    action: "Follow up 7 hari lagi",
    color: "#6b7280",
  },
  {
    status: "📨 Sudah Dihubungi",
    count: 24,
    percentage: 65,
    action: "Pantau & follow up",
    color: "#8b5cf6",
  },
  {
    status: "📤 Belum Dihubungi",
    count: 2,
    percentage: 5,
    action: "Kirim DM sekarang",
    color: "#f59e0b",
  },
  {
    status: "💬 Negosiasi",
    count: 0,
    percentage: 0,
    action: "Kirim proposal + closing",
    color: "#ec4899",
  },
  {
    status: "✅ Deal / Closing",
    count: 0,
    percentage: 0,
    action: "Kerjakan project",
    color: "#10b981",
  },
  {
    status: "❌ Ditolak",
    count: 0,
    percentage: 0,
    action: "Archive, lanjut ke lead baru",
    color: "#ef4444",
  },
];

const progressData = {
  target: 10000000,
  current: 0,
  clientsNeeded: 4,
  daysRemaining: 60,
  percentAchieved: 0.0,
};

const scheduleData = [
  {
    time: "08:00–10:30",
    activity: "🔍 OUTREACH SPRINT — Scraping GMaps + Kirim 40-50 DM",
    category: "Tier 1 Revenue",
    output: "50 DM terkirim + dicatat di tracker",
    duration: "2.5 jam",
    active: true,
  },
  {
    time: "10:30–12:00",
    activity: "🔁 FOLLOW UP — Cek reply, negosiasi, kirim proposal",
    category: "Tier 1 Revenue",
    output: "0 lead tanpa follow up > 3 hari",
    duration: "1.5 jam",
    active: false,
  },
  {
    time: "12:00–13:30",
    activity: "🍽️ Break — Makan + Istirahat",
    category: "Maintenance",
    output: "Tidur siang 20 mnt jika bisa",
    duration: "1.5 jam",
    active: false,
  },
  {
    time: "13:30–16:00",
    activity: "💻 BUILD — Kerjakan project klien / buat demo website",
    category: "Tier 1/2",
    output: "Progress project terdokumentasi",
    duration: "2.5 jam",
    active: false,
  },
  {
    time: "16:00–17:00",
    activity: "🏋️ Olahraga — 30–45 mnt (lari/bodyweight)",
    category: "Maintenance",
    output: "Wajib, cognitive reset sebelum malam",
    duration: "1 jam",
    active: false,
  },
  {
    time: "19:00–19:30",
    activity: "🎬 TikTok — 1 video (before/after website atau tips)",
    category: "Tier 2 Brand",
    output: "1 video published atau draft selesai",
    duration: "30 mnt",
    active: false,
  },
  {
    time: "21:00–21:10",
    activity: "📊 Review — Cek saham 5 mnt + prep leads besok",
    category: "Maintenance",
    output: "List 50 leads siap untuk besok",
    duration: "10 mnt",
    active: false,
  },
  {
    time: "22:00",
    activity: "🔴 SHUTDOWN — Matikan layar, tidur",
    category: "Server Maint.",
    output: "Tidur 7–8 jam WAJIB",
    duration: "—",
    active: false,
  },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Target size={20} />
            <span className="font-mono text-sm tracking-wider uppercase font-semibold">
              Mission Control
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Project Dashboard
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-sm flex items-center gap-2">
            <RefreshCw size={14} className="text-gray-500" />
            Last Update: 18 February 2026
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#111] p-4 rounded-xl border border-[#222]">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
              Target Revenue
            </p>
            <p className="text-xl font-mono text-white">
              {formatCurrency(progressData.target)}
            </p>
          </div>
          <div className="w-px h-10 bg-[#333]"></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
              Days Remaining
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              <p className="text-xl font-mono text-white">
                {progressData.daysRemaining}{" "}
                <span className="text-sm text-gray-500">days</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Metrics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">KPI Metrics</h2>
          <span className="text-xs font-mono text-gray-500 bg-[#111] px-2 py-1 rounded border border-[#222] ml-2">
            Isi Manual Setiap Minggu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-[#111] border border-[#222] rounded-xl p-5 relative overflow-hidden group hover:border-[#444] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${kpi.bg}`}>
                  <kpi.icon size={24} className={kpi.color} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-mono font-bold text-white mb-2">
                  {kpi.value}
                </p>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">{kpi.target}</span>
                </div>
              </div>

              {/* Progress Bar at bottom */}
              <div className="absolute bottom-0 left-0 h-1 bg-[#222] w-full">
                <div
                  className={`h-full ${kpi.color.replace("text-", "bg-")}`}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Status */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">
              Pipeline Status
            </h2>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222] bg-[#1a1a1a]">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Jumlah Lead
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      % Total
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {pipelineData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#1a1a1a] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-white font-medium">
                          {item.count}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-400 w-8">
                            {item.percentage}%
                          </span>
                          <div className="w-24 h-1.5 bg-[#222] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                          {item.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Progress Menuju Rp 10 Juta */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-200">
              Progress Menuju Rp 10 Juta
            </h2>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl p-6 h-[calc(100%-2rem)]">
            <div className="flex flex-col items-center justify-center mb-8 relative">
              {/* Simple CSS Donut Chart */}
              <div className="w-48 h-48 rounded-full border-[16px] border-[#222] flex items-center justify-center relative">
                <div
                  className="absolute inset-0 rounded-full border-[16px] border-orange-500"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                ></div>
                <div className="text-center">
                  <p className="text-4xl font-mono font-bold text-white mb-1">
                    {progressData.percentAchieved}%
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Tercapai
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Target Total</span>
                <span className="font-mono text-white font-medium">
                  {formatCurrency(progressData.target)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Revenue Masuk</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {formatCurrency(progressData.current)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Sisa Target</span>
                <span className="font-mono text-orange-400 font-medium">
                  {formatCurrency(progressData.target - progressData.current)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                <span className="text-sm text-gray-400">Klien Dibutuhkan</span>
                <span className="font-mono text-white font-medium">
                  {progressData.clientsNeeded}{" "}
                  <span className="text-xs text-gray-500">(@ Rp2.5 jt)</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Jadwal Harian */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-200">
            Jadwal Harian — Protokol Wajib
          </h2>
        </div>

        <div className="relative pl-4 md:pl-8">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[23px] md:left-[39px] top-4 bottom-4 w-px bg-[#222]"></div>

          <div className="space-y-6">
            {scheduleData.map((item, idx) => {
              const currentHour = currentTime.getHours();
              const currentMin = currentTime.getMinutes();
              const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

              let isActive = false;
              if (item.time.includes("–")) {
                const [start, end] = item.time.split("–");
                isActive = currentTimeStr >= start && currentTimeStr < end;
              } else {
                isActive = currentTimeStr >= item.time; // For 22:00 onwards
              }

              return (
                <div key={idx} className="relative flex items-start gap-6 group">
                  {/* Timeline Node */}
                  <div
                    className={`relative z-10 w-3 h-3 mt-1.5 rounded-full border-2 bg-[#111] transition-colors ${
                      isActive
                        ? "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        : "border-[#444] group-hover:border-gray-400"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div
                    className={`flex-1 rounded-xl border p-5 transition-all ${
                      isActive
                        ? "bg-[#1a1a1a] border-orange-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                        : "bg-[#111] border-[#222] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`font-mono text-sm ${isActive ? "text-orange-400 font-bold" : "text-gray-400"}`}
                          >
                            {item.time}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded border ${
                              isActive
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : "bg-[#222] text-gray-500 border-[#333]"
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <h3
                          className={`text-base md:text-lg font-medium ${isActive ? "text-white" : "text-gray-300"}`}
                        >
                          {item.activity}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-[#222] shrink-0">
                        <Clock size={14} />
                        <span className="font-mono text-xs">{item.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-3 border-t border-[#222]/50">
                      <CheckCircle2
                        size={16}
                        className={
                          isActive
                            ? "text-orange-500 mt-0.5 shrink-0"
                            : "text-emerald-500/50 mt-0.5 shrink-0"
                        }
                      />
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-0.5">
                          Output Wajib
                        </span>
                        <span
                          className={`text-sm ${isActive ? "text-gray-300" : "text-gray-400"}`}
                        >
                          {item.output}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
