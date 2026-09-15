"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Copy,
  Trash2,
  CheckCircle,
  X,
  Eye,
  Clock,
  Plus,
  Bell,
  BellOff,
  AlertTriangle,
  Edit2,
  Check,
  Volume2,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  generateDailyFocusFromBrainDump,
  formatDailyFocusText,
  parseTimeAndText,
  parsePriority,
  parseCategory,
  type DailyFocusResult,
  type FocusTask
} from "@/lib/dailyFocusHelper";

export default function CEODailyFocusPanel() {
  const [brainDump, setBrainDump] = useState("");
  const [output, setOutput] = useState<DailyFocusResult | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [soundProfile, setSoundProfile] = useState<string>("zen"); // 'zen' | 'retro' | 'classic' | 'silent'
  
  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");

  // Rollover state
  const [yesterdayTasks, setYesterdayTasks] = useState<FocusTask[]>([]);
  const [lastPercent, setLastPercent] = useState(0);

  // Initialize and load from localStorage
  useEffect(() => {
    const savedDump = localStorage.getItem("wb:ceo_brain_dump");
    const savedOutput = localStorage.getItem("wb:ceo_daily_focus");
    const savedSound = localStorage.getItem("wb:ceo_notif_sound");
    const savedDate = localStorage.getItem("wb:ceo_focus_date");
    
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (savedDump) setBrainDump(savedDump);
    if (savedSound) setSoundProfile(savedSound);

    if (savedOutput) {
      try {
        const parsed = JSON.parse(savedOutput) as DailyFocusResult;
        if (parsed && Array.isArray(parsed.tasks)) {
          // Check if tasks are from a previous day
          if (savedDate && savedDate !== todayStr) {
            const unfinished = parsed.tasks.filter(t => !t.checked);
            if (unfinished.length > 0) {
              setYesterdayTasks(unfinished);
            }
            // Update stored date to today but keep current tasks clean or reset them
            localStorage.setItem("wb:ceo_focus_date", todayStr);
            // Re-generate result for today (or start empty)
            const emptyToday: DailyFocusResult = {
              tasks: [],
              needAcc: [],
              rawInput: ""
            };
            setOutput(emptyToday);
            localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(emptyToday));
          } else {
            setOutput(parsed);
          }
        } else {
          localStorage.removeItem("wb:ceo_daily_focus");
        }
      } catch (e) {
        console.error("Failed to parse daily focus from localStorage:", e);
      }
    } else {
      // Set focus date for first time setup
      localStorage.setItem("wb:ceo_focus_date", todayStr);
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Web Audio Synth Sound Library
  const playSound = (soundType: string) => {
    if (soundType === "silent") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (soundType === "zen") {
        // Zen Bell: High-frequency sine bell with slow decay
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2); // Decay to A4
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.6);
      } else if (soundType === "retro") {
        // Retro Arpeggio (8-bit style)
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.02, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
        });
      } else {
        // Classic Double Beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn("Audio Context not supported or interaction blocked:", e);
    }
  };

  // Notification Permission Request
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Browser Anda tidak mendukung notifikasi.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      toast.success("Notifikasi berhasil diaktifkan!");
    } else if (permission === "denied") {
      toast.error("Notifikasi ditolak. Aktifkan manual di pengaturan browser.");
    }
  };

  // Background Task Time-based notification polling
  useEffect(() => {
    if (!output || notifPermission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeVal = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      let updated = false;
      const updatedTasks = output.tasks.map(task => {
        if (task.time && !task.checked && !task.notified) {
          // Trigger if current time matches or has passed the scheduled task time
          if (currentTimeVal >= task.time) {
            try {
              new Notification("⏰ CEO Daily Focus", {
                body: `Saatnya: ${task.title} (${task.displayTime})`,
                icon: "/logo.png",
                tag: `task_${task.id}`,
                requireInteraction: true
              });
              playSound(soundProfile);
            } catch (e) {
              console.error("Failed to show web notification:", e);
            }
            toast(`⏰ Saatnya: ${task.title}`, { icon: "🔔", duration: 8000 });
            updated = true;
            return { ...task, notified: true };
          }
        }
        return task;
      });

      if (updated) {
        const newOutput = { ...output, tasks: updatedTasks };
        setOutput(newOutput);
        localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [output, notifPermission, soundProfile]);

  // Handle Confetti Particles Loop
  const triggerConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#F97316", "#3B82F6", "#10B981", "#EAB308", "#EC4899"];
    const particles: any[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 5 + 3,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 8 - 4,
        tiltAngleIncremental: Math.random() * 0.05 + 0.02,
        tiltAngle: 0
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 2.5 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

        if (p.y <= canvas.height) {
          active = true;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (active) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();
  };

  const totalTasks = output?.tasks.length || 0;
  const checkedTasksCount = output?.tasks.filter(t => t.checked).length || 0;
  const completionPercent = totalTasks > 0 ? Math.round((checkedTasksCount / totalTasks) * 100) : 0;

  // Watch completion progress to trigger confetti at 100%
  useEffect(() => {
    if (completionPercent === 100 && lastPercent < 100 && totalTasks > 0) {
      triggerConfetti();
      toast.success("🏆 Keren! Semua task hari ini selesai!", { icon: "🔥", duration: 5000 });
    }
    setLastPercent(completionPercent);
  }, [completionPercent, lastPercent, totalTasks]);

  const handleGenerate = () => {
    if (!brainDump.trim()) {
      toast.error("Tulis isi pikiran atau task Anda terlebih dahulu!");
      return;
    }

    const result = generateDailyFocusFromBrainDump(brainDump);
    setOutput(result);
    
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem("wb:ceo_brain_dump", brainDump);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(result));
    localStorage.setItem("wb:ceo_focus_date", todayStr);
    
    toast.success("Daily Focus Checklist berhasil disusun!");
    setShowDrawer(true);
  };

  const handleClear = () => {
    setBrainDump("");
    setOutput(null);
    setShowDrawer(false);
    localStorage.removeItem("wb:ceo_brain_dump");
    localStorage.removeItem("wb:ceo_daily_focus");
    toast.success("Daily Focus dibersihkan.");
  };

  const handleCopy = () => {
    if (!output) return;
    const formattedText = formatDailyFocusText(output);
    navigator.clipboard.writeText(formattedText)
      .then(() => toast.success("Checklist disalin ke clipboard!"))
      .catch(() => toast.error("Gagal menyalin ke clipboard."));
  };

  const toggleTaskChecked = (taskId: string) => {
    if (!output) return;
    const updatedTasks = output.tasks.map(t =>
      t.id === taskId ? { ...t, checked: !t.checked } : t
    );
    const newOutput = { ...output, tasks: updatedTasks };
    setOutput(newOutput);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
  };

  const deleteTask = (taskId: string) => {
    if (!output) return;
    const updatedTasks = output.tasks.filter(t => t.id !== taskId);
    const newOutput = { ...output, tasks: updatedTasks };
    setOutput(newOutput);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
    toast.success("Task dihapus.");
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !output) return;

    const parsedTime = parseTimeAndText(newTaskInput);
    const priority = parsePriority(newTaskInput);
    const category = parseCategory(newTaskInput);

    const newTask: FocusTask = {
      id: `task_${Date.now()}`,
      title: parsedTime.title,
      time: parsedTime.time,
      displayTime: parsedTime.displayTime,
      priority,
      category,
      checked: false,
      notified: false
    };

    const updatedTasks = [...output.tasks, newTask].sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

    // Check if the new task input contains ACC indicators and update needAcc list
    const accKeywords = ["kirim", "publish", "dm", "deploy", "delete", "trade", "acc", "persetujuan"];
    const updatedNeedAcc = [...output.needAcc];
    if (accKeywords.some(kw => newTaskInput.toLowerCase().includes(kw))) {
      updatedNeedAcc.push(newTaskInput);
    }

    const newOutput: DailyFocusResult = {
      ...output,
      tasks: updatedTasks,
      needAcc: updatedNeedAcc
    };

    setOutput(newOutput);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
    setNewTaskInput("");
    toast.success("Task baru berhasil ditambahkan!");
  };

  // Rollover implementation
  const handleRolloverTasks = () => {
    if (!output) return;
    
    const rolloverTasksMapped = yesterdayTasks.map((t, idx) => ({
      ...t,
      id: `task_rollover_${Date.now()}_${idx}`,
      checked: false,
      notified: false
    }));

    const updatedTasks = [...output.tasks, ...rolloverTasksMapped].sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

    const newOutput = {
      ...output,
      tasks: updatedTasks
    };

    setOutput(newOutput);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
    setYesterdayTasks([]);
    toast.success(`${rolloverTasksMapped.length} tugas kemarin dipindahkan ke hari ini!`);
    setShowDrawer(true);
  };

  // Sound selection change handler
  const handleSoundChange = (val: string) => {
    setSoundProfile(val);
    localStorage.setItem("wb:ceo_notif_sound", val);
    playSound(val);
    toast.success(`Profil suara: ${val.toUpperCase()}`);
  };

  // Inline editing save handler
  const startEditing = (task: FocusTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditTime(task.displayTime || "");
  };

  const saveEditedTask = (taskId: string) => {
    if (!output) return;
    
    // Parse time if edited
    let newTimeVal: string | null = null;
    let newDisplayTime: string | null = null;

    if (editTime.trim()) {
      const parsed = parseTimeAndText(`jam ${editTime}`);
      newTimeVal = parsed.time;
      newDisplayTime = parsed.displayTime;
    }

    const updatedTasks = output.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          title: editTitle.trim(),
          time: newTimeVal,
          displayTime: newDisplayTime,
          category: parseCategory(editTitle),
          notified: false // reset notification for reschedule
        };
      }
      return t;
    }).sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

    const newOutput = { ...output, tasks: updatedTasks };
    setOutput(newOutput);
    localStorage.setItem("wb:ceo_daily_focus", JSON.stringify(newOutput));
    setEditingTaskId(null);
    toast.success("Task diperbarui!");
  };

  // Group tasks for rendering
  const scheduledTasks = output?.tasks.filter(t => t.time) || [];
  const unscheduledTasks = output?.tasks.filter(t => !t.time) || [];

  // Helper for category styling
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "revenue":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "build":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "admin":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <>
      {/* Confetti Overlay Canvas */}
      <canvas
        id="confetti-canvas"
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full"
      />

      <section className="bg-[#111]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden group hover:border-white/10 transition-all">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.06),rgba(249,115,22,0.0)_65%)] blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.04),rgba(168,85,247,0.0)_65%)] blur-2xl" />
        </div>

        {/* Compact layout: header + input + button in a tight grid */}
        <div className="flex flex-col gap-3">
          {/* Yesterday's Rollover alert */}
          {yesterdayTasks.length > 0 && (
            <div className="flex items-center justify-between gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-300">
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                <span>Ada <strong>{yesterdayTasks.length} tugas</strong> belum selesai kemarin!</span>
              </div>
              <button
                onClick={handleRolloverTasks}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-3 py-1 rounded-lg shrink-0 transition-colors"
              >
                Pindahkan ke Hari Ini
              </button>
            </div>
          )}

          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                <Brain size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  CEO Daily Focus
                  <span className="text-[9px] font-mono font-normal bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                    Adrian Agent
                  </span>
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {output && (
                <button
                  onClick={() => setShowDrawer(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold text-white hover:bg-white/10 transition-colors"
                  title="Lihat Daily Focus"
                >
                  <Eye size={12} />
                  <span className="hidden sm:inline">Lihat Checklist</span>
                </button>
              )}
              {output && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold text-white hover:bg-white/10 transition-colors"
                  title="Copy Daily Focus"
                >
                  <Copy size={12} />
                  <span className="hidden sm:inline">Salin</span>
                </button>
              )}
              <button
                onClick={handleClear}
                disabled={!brainDump && !output}
                className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Clear draft"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Input + Generate row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              id="brain-dump-input"
              rows={2}
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none font-sans"
              placeholder="Tulis ide & waktu (misal: jam 10 pagi konten tiktok, jam 13:00 testing agent)..."
            />
            <button
              onClick={handleGenerate}
              className="sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-[0_0_12px_rgba(249,115,22,0.12)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] shrink-0"
            >
              <Zap size={14} fill="currentColor" />
              <span>Generate</span>
            </button>
          </div>

          {/* Notification Quick Toggle & Safety Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 pt-2 text-[10px] leading-relaxed">
            <div className="flex items-center gap-2 text-[#caa984]/60 font-sans">
              <CheckCircle size={10} className="text-[#f0b26b]/50 shrink-0" />
              <p>Adrian menyusun prioritas berbasis waktu. ACC tetap di Well.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono">Notifikasi HP/Web:</span>
              {notifPermission === "granted" ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Bell size={10} className="animate-bounce" /> Aktif
                </span>
              ) : (
                <button
                  onClick={requestNotificationPermission}
                  className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold bg-orange-500/5 hover:bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 transition-all"
                >
                  <BellOff size={10} /> Aktifkan
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OUTPUT DRAWER/MODAL — Interactive Checklist output
         ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDrawer && output && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowDrawer(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-[85vh] sm:h-auto max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-[#111]/95 backdrop-blur-xl flex items-center justify-between p-4 sm:p-5 border-b border-white/5 z-10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Daily Focus Checklist</h3>
                    <p className="text-[10px] text-gray-500 font-mono">Dikelola oleh Adrian Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <Copy size={13} />
                    Salin List
                  </button>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar Header section */}
              {totalTasks > 0 && (
                <div className="px-4 sm:px-5 pt-4 shrink-0 space-y-1.5">
                  <div className="bg-[#181818] border border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-400">Progress Checklist Hari Ini</span>
                      <span className="text-orange-400">{checkedTasksCount} / {totalTasks} Task Selesai ({completionPercent}%)</span>
                    </div>
                    <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-orange-600 to-orange-400 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer Content - Scrollable Checklist */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                
                {/* 1. Scheduled Tasks Section */}
                {scheduledTasks.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Tugas Terjadwal</span>
                    </h4>
                    <div className="space-y-1.5">
                      <AnimatePresence initial={false}>
                        {scheduledTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                              task.checked 
                                ? "bg-white/[0.02] border-white/5 opacity-60" 
                                : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => toggleTaskChecked(task.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                  task.checked 
                                    ? "bg-orange-500 border-orange-500 text-white" 
                                    : "border-white/20 hover:border-orange-500/50"
                                }`}
                              >
                                {task.checked && <CheckCircle size={12} className="stroke-[3]" />}
                              </button>

                              {editingTaskId === task.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    placeholder="HH:MM"
                                    className="w-16 bg-[#0a0a0a] border border-[#333] rounded px-1.5 py-0.5 text-xs text-orange-400 font-mono font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-2 py-0.5 text-xs text-white"
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 shrink-0">
                                    {task.displayTime}
                                  </span>

                                  {/* Category tag */}
                                  {task.category !== 'general' && (
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border capitalize shrink-0 ${getCategoryStyles(task.category)}`}>
                                      {task.category}
                                    </span>
                                  )}

                                  <span className={`text-xs sm:text-sm truncate font-medium ${
                                    task.checked ? "line-through text-gray-500" : "text-white"
                                  }`}>
                                    {task.title}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5">
                              {editingTaskId === task.id ? (
                                <button
                                  onClick={() => saveEditedTask(task.id)}
                                  className="p-1 text-emerald-400 hover:text-emerald-300 rounded transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEditing(task)}
                                  className="p-1 text-gray-500 hover:text-white rounded transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              {/* Priority badge */}
                              {task.priority !== 'medium' && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                                  task.priority === 'high'
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                  {task.priority}
                                </span>
                              )}

                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* 2. Unscheduled Tasks Section */}
                {unscheduledTasks.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
                      <Zap size={12} />
                      <span>Tugas Bebas Waktu / All Day</span>
                    </h4>
                    <div className="space-y-1.5">
                      <AnimatePresence initial={false}>
                        {unscheduledTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                              task.checked 
                                ? "bg-white/[0.02] border-white/5 opacity-60" 
                                : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => toggleTaskChecked(task.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                  task.checked 
                                    ? "bg-orange-500 border-orange-500 text-white" 
                                    : "border-white/20 hover:border-orange-500/50"
                                }`}
                              >
                                {task.checked && <CheckCircle size={12} className="stroke-[3]" />}
                              </button>

                              {editingTaskId === task.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    placeholder="HH:MM"
                                    className="w-16 bg-[#0a0a0a] border border-[#333] rounded px-1.5 py-0.5 text-xs text-orange-400 font-mono font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-2 py-0.5 text-xs text-white"
                                  />
                                </div>
                              ) : (
                                <>
                                  {/* Category tag */}
                                  {task.category !== 'general' && (
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border capitalize shrink-0 ${getCategoryStyles(task.category)}`}>
                                      {task.category}
                                    </span>
                                  )}

                                  <span className={`text-xs sm:text-sm truncate font-medium ${
                                    task.checked ? "line-through text-gray-500" : "text-white"
                                  }`}>
                                    {task.title}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5">
                              {editingTaskId === task.id ? (
                                <button
                                  onClick={() => saveEditedTask(task.id)}
                                  className="p-1 text-emerald-400 hover:text-emerald-300 rounded transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEditing(task)}
                                  className="p-1 text-gray-500 hover:text-white rounded transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              {/* Priority badge */}
                              {task.priority !== 'medium' && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                                  task.priority === 'high'
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                  {task.priority}
                                </span>
                              )}

                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {output.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                    <Zap size={32} className="text-gray-600 animate-pulse" />
                    <p className="text-xs text-gray-500">Belum ada tugas hari ini. Ketik di brain dump atau tambah langsung di bawah!</p>
                  </div>
                )}

                {/* 3. Need Well ACC Section (Highlighted list) */}
                {output.needAcc.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle size={13} />
                      <span>Membutuhkan ACC Well</span>
                    </div>
                    <div className="space-y-1.5">
                      {output.needAcc.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Task Form & Quick controls footer */}
              <div className="sticky bottom-0 bg-[#111]/95 border-t border-white/5 p-4 sm:p-5 space-y-3 shrink-0">
                <form onSubmit={handleAddNewTask} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Tambah task baru (misal: jam 15:00 meeting)..."
                    className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-orange-600 hover:bg-orange-500 rounded-xl p-2.5 text-white transition-all shrink-0"
                    title="Tambah task"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Notifications settings block & Custom Synth Sound controls */}
                <div className="flex flex-col gap-2 pt-1 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Notifikasi Browser:</span>
                    {notifPermission === "granted" ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Bell size={10} /> Aktif & Terjadwal
                      </span>
                    ) : (
                      <button
                        onClick={requestNotificationPermission}
                        className="text-orange-400 hover:underline flex items-center gap-1"
                      >
                        <BellOff size={10} /> Klik untuk Aktifkan
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Volume2 size={11} /> Profil Alarm Suara:
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#222] rounded-lg p-0.5">
                      {["zen", "retro", "classic", "silent"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleSoundChange(type)}
                          className={`px-2 py-0.5 rounded capitalize ${
                            soundProfile === type
                              ? "bg-orange-500 text-white font-bold"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
