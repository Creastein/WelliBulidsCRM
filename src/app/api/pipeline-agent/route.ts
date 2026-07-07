import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODE_INSTRUCTIONS: Record<string, string> = {
  "Ask Workflow": "Jawab pertanyaan user tentang workflow build WelliBuilds.",
  "Generate PRD": "Buat PRD dari brief user dalam format WelliBuilds. Extract nama bisnis, kategori, lokasi, dll. Rekomendasikan paket dan DESIGN.md.",
  "Breakdown Tasks": "Pecah fitur menjadi task frontend/backend/integration/deploy/testing.",
  "QA Test Cases": "Buat QA checklist dan test cases.",
  "Tool Prompt": "Buat prompt siap pakai untuk Claude, Codex, Antigravity, Stitch, AI Studio, atau TestSprite.",
  "Review Website": "Review website atau landing page berdasarkan URL/brief user. Fokus pada clarity offer, CTA, trust, conversion, mobile UX, SEO basic, dan improvement tasks.",
  "Lead to PRD": "Ubah data lead dari Lead Finder AI, Google Maps, atau deskripsi bisnis menjadi rekomendasi paket WelliBuilds, PRD awal, dan suggested next action.",
  "CEO / Adrian": "Ubah brain dump user menjadi prioritas harian harian (maksimal 3 fokus utama: Revenue, Build, Admin), tandai item yang butuh ACC (seperti publish, deploy, delete, dll), buat parking lot untuk tugas sisa, dan berikan rekomendasi next action.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, message } = body;

    if (!mode || !message || !String(message).trim()) {
      return NextResponse.json(
        { success: false, error: "Mode and message are required." },
        { status: 400 }
      );
    }

    const instruction = MODE_INSTRUCTIONS[mode] || "Berikan respons sesuai dengan input user.";

    const finalPrompt = `Kamu adalah Pipeline Architect.
Mode: ${mode}
Instruksi mode: ${instruction}
Input user:
${message}`;

    try {
      // TODO: Keep Hermes cwd pointing to the standalone pipeline project for now.
      // The Hermes `pipeline` profile/skill behavior may depend on that project context.
      const { stdout, stderr } = await execFileAsync(
        "hermes",
        [
          "--profile",
          "pipeline",
          "--skills",
          "wellibuilds-prd-generator",
          "--toolsets",
          "safe",
          "--oneshot",
          finalPrompt,
        ],
        {
          cwd: "C:/Work/Project/wellibuilds-pipeline",
          timeout: 180000,
          maxBuffer: 1024 * 1024 * 5,
          windowsHide: true,
        }
      );

      return NextResponse.json({
        success: true,
        output: stdout.trim(),
        logs: stderr ? [stderr] : [],
      });
    } catch (execError) {
      if (mode === "CEO / Adrian") {
        try {
          const { generateDailyFocusFromBrainDump, formatDailyFocusText } = await import("@/lib/dailyFocusHelper");
          const result = generateDailyFocusFromBrainDump(message);
          const formatted = formatDailyFocusText(result);
          return NextResponse.json({
            success: true,
            output: formatted,
            logs: ["Hermes execution failed, fell back to local rule-based parser."],
          });
        } catch (fallbackErr) {
          console.error("Local fallback Daily Focus parser failed:", fallbackErr);
        }
      }

      const err = execError as Error;
      console.error("Failed to execute Hermes CLI:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process request via Hermes.",
          details: err.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("API Route Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
