export type TaskCategory = 'revenue' | 'build' | 'admin' | 'general';

export interface FocusTask {
  id: string;
  title: string;
  time: string | null;      // "HH:MM" format for sorting
  displayTime: string | null; // e.g. "10:00"
  priority: 'high' | 'medium' | 'low';
  category: TaskCategory;
  checked: boolean;
  notified?: boolean;
}

export interface DailyFocusResult {
  tasks: FocusTask[];
  needAcc: string[];
  rawInput: string;
}

export function parseTimeAndText(itemText: string): { displayTime: string | null; time: string | null; title: string } {
  let matchedText = "";
  let hour = -1;
  let minute = 0;
  let period: 'pagi' | 'siang' | 'sore' | 'malam' | 'am' | 'pm' | null = null;

  // Regex 1: Explicit time with separator and optional period, e.g. "13:30", "10.30 pagi", "at 14:00"
  const r1 = /\b(?:jam|pukul|at)?\s*(\d{1,2})[.:](\d{2})\s*(pagi|siang|sore|malam|am|pm)?\b/i;
  // Regex 2: Word prefixed number, e.g. "jam 10 pagi", "jam 13", "jam 2 siang", "pukul 8 malam"
  const r2 = /\b(?:jam|pukul)\s*(\d{1,2})\b\.?\s*(pagi|siang|sore|malam|am|pm)?/i;
  // Regex 3: Number followed by period of day, e.g. "10 pagi", "2 siang", "8 malam"
  const r3 = /\b(\d{1,2})\b\.?\s*(pagi|siang|sore|malam|am|pm)\b/i;

  let match = itemText.match(r1);
  if (match) {
    matchedText = match[0];
    hour = parseInt(match[1], 10);
    minute = parseInt(match[2], 10);
    if (match[3]) period = match[3].toLowerCase() as any;
  } else {
    match = itemText.match(r2);
    if (match) {
      matchedText = match[0];
      hour = parseInt(match[1], 10);
      minute = 0;
      if (match[2]) period = match[2].toLowerCase() as any;
    } else {
      match = itemText.match(r3);
      if (match) {
        matchedText = match[0];
        hour = parseInt(match[1], 10);
        minute = 0;
        period = match[2].toLowerCase() as any;
      }
    }
  }

  if (hour !== -1 && hour >= 0 && hour <= 23) {
    // Adjust hour based on period/modifier
    if (period) {
      if (period === 'siang' && hour < 12) {
        hour += 12;
      } else if (period === 'sore' && hour < 12) {
        hour += 12;
      } else if (period === 'malam' && hour < 12) {
        hour += 12;
      } else if (period === 'pm' && hour < 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
    }

    const padH = String(hour).padStart(2, '0');
    const padM = String(minute).padStart(2, '0');
    const timeVal = `${padH}:${padM}`;

    // Clean up title by removing the time phrase and connecting words
    let title = itemText.replace(matchedText, "");
    
    // Clean up connecting words like "di", "pada", "untuk", "dan", "nanti", etc. at the start/end
    title = title
      .replace(/^\s*(?:di|pada|untuk|dan|nanti|ada|ide|lagi)\s+/i, "")
      .replace(/\s+(?:di|pada|untuk|jam|pukul|nanti)\s*$/i, "")
      .trim();

    // Clean bullet symbols and punctuation
    title = title.replace(/^[-*•\d.]+\s*/, "").replace(/[,.;:]+$/, "").trim();

    return {
      displayTime: timeVal,
      time: timeVal,
      title: title || itemText
    };
  }

  // No time matched
  const title = itemText.replace(/^[-*•\d.]+\s*/, "").replace(/[,.;:]+$/, "").trim();
  return {
    displayTime: null,
    time: null,
    title
  };
}

export function parsePriority(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase();
  if (
    lower.includes('[high]') || 
    lower.includes('penting') || 
    lower.includes('darurat') || 
    lower.includes('segera') || 
    lower.includes('urgent') || 
    lower.includes('asap') || 
    lower.includes('prioritas')
  ) {
    return 'high';
  }
  if (
    lower.includes('[low]') || 
    lower.includes('nanti') || 
    lower.includes('santai') || 
    lower.includes('kapan-kapan')
  ) {
    return 'low';
  }
  return 'medium';
}

const revenueKeywords = ["lead", "prospek", "follow-up", "jualan", "closing", "sales", "pitch", "deal"];
const buildKeywords = ["website", "crm", "hermes", "agent", "fitur", "coding", "token", "trading", "build", "product", "develop", "dev", "glories"];
const adminKeywords = ["invoice", "finance", "admin", "rapihin", "catatan", "cek", "system", "rapikan"];

export function parseCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (revenueKeywords.some((kw) => lower.includes(kw))) return 'revenue';
  if (buildKeywords.some((kw) => lower.includes(kw))) return 'build';
  if (adminKeywords.some((kw) => lower.includes(kw))) return 'admin';
  return 'general';
}

export function generateDailyFocusFromBrainDump(input: string): DailyFocusResult {
  const result: DailyFocusResult = {
    tasks: [],
    needAcc: [],
    rawInput: input,
  };

  if (!input || !input.trim()) return result;

  // Split by commas, semicolons, newlines, or period (not preceded by digit) followed by space
  const rawItems = input
    .split(/[,\n;]|(?<!\d)\.\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);

  const accKeywords = ["kirim", "publish", "dm", "deploy", "delete", "trade", "acc", "persetujuan"];

  rawItems.forEach((item, index) => {
    const lowerItem = item.toLowerCase();

    // Check for ACC needs
    const isAcc = accKeywords.some((kw) => lowerItem.includes(kw));
    if (isAcc) {
      result.needAcc.push(item);
    }

    // Parse time, priority and category
    const parsedTime = parseTimeAndText(item);
    const priority = parsePriority(item);
    const category = parseCategory(item);

    result.tasks.push({
      id: `task_${Date.now()}_${index}`,
      title: parsedTime.title,
      time: parsedTime.time,
      displayTime: parsedTime.displayTime,
      priority,
      category,
      checked: false,
      notified: false
    });
  });

  // Sort tasks chronologically: tasks with time go first (sorted by time), unscheduled/all-day tasks go last
  result.tasks.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  return result;
}

export function formatDailyFocusText(result: DailyFocusResult): string {
  let text = "📋 CEO Daily Focus Hari Ini\n\n";

  // Scheduled tasks
  const scheduled = result.tasks.filter(t => t.time);
  const unscheduled = result.tasks.filter(t => !t.time);

  if (scheduled.length > 0) {
    text += "⏰ Scheduled Tasks:\n";
    scheduled.forEach((task) => {
      const status = task.checked ? "✅" : "☐";
      const priorityStr = task.priority !== 'medium' ? ` [${task.priority.toUpperCase()}]` : "";
      const catStr = task.category !== 'general' ? ` #${task.category.toUpperCase()}` : "";
      text += `${status} ${task.displayTime} • ${task.title}${priorityStr}${catStr}\n`;
    });
    text += "\n";
  }

  if (unscheduled.length > 0) {
    text += "📅 Unscheduled / All Day:\n";
    unscheduled.forEach((task) => {
      const status = task.checked ? "✅" : "☐";
      const priorityStr = task.priority !== 'medium' ? ` [${task.priority.toUpperCase()}]` : "";
      const catStr = task.category !== 'general' ? ` #${task.category.toUpperCase()}` : "";
      text += `${status} ${task.title}${priorityStr}${catStr}\n`;
    });
    text += "\n";
  }

  if (result.needAcc.length > 0) {
    text += "⚠️ Need Well ACC:\n";
    result.needAcc.forEach((item) => {
      text += `- ${item}\n`;
    });
    text += "\n";
  }

  return text.trim();
}


