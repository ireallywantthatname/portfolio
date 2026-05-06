"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/github";

type Contact = { k: string; v: string; href: string | null };

type Props = {
  projects: Project[];
  bio: string;
};

const CONTACT: Contact[] = [
  {
    k: "email",
    v: "irwtn@protonmail.com",
    href: "mailto:irwtn@protonmail.com",
  },
  {
    k: "github",
    v: "github.com/ireallywantthatname",
    href: "https://github.com/ireallywantthatname",
  },
  { k: "blog", v: "akashdesilva.space", href: "https://akashdesilva.space" },
];

const ARCH_LOGO = String.raw`                  -\`
                 .o+\`
                \`ooo/
               \`+oooo:
              \`+oooooo:
              -+oooooo+:
            \`/:-:++oooo+:
           \`/++++/+++++++:
          \`/++++++++++++++:
         \`/+++ooooooooooooo/\`
        ./ooosssso++osssssso+\`
       .oossssso-\`\`\`\`/ossssss+\`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  \`/ossssso+/:-        -:/+osssso+-
 \`+sso+:-\`                 \`.-/+oso:
\`++:.                           \`-/+/
.\`                                 \`/`;

const BOOT_LINES: { d: number; t: string }[] = [
  {
    d: 0,
    t: `<span class="ts">[    0.000000]</span> Linux version 6.8.7-arch1-1 (linux@archlinux) (gcc (GCC) 13.2.1)`,
  },
  {
    d: 60,
    t: `<span class="ts">[    0.012894]</span> Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=akash-portfolio rw quiet`,
  },
  {
    d: 80,
    t: `<span class="ts">[    0.124501]</span> CPU0: Intel(R) Core(TM) i7-1365U @ 2.60GHz`,
  },
  {
    d: 60,
    t: `<span class="ts">[    0.298772]</span> Memory: 32GB DDR5 @ 5200 MT/s`,
  },
  {
    d: 80,
    t: `<span class="ts">[    0.612008]</span> Loading initial ramdisk...`,
  },
  {
    d: 100,
    t: `<span class="ts">[    1.040112]</span> systemd[1]: systemd 255 running in system mode`,
  },
  {
    d: 70,
    t: `<span class="ts">[    1.198443]</span> systemd[1]: Detected architecture <span class="emph">x86-64</span>.`,
  },
  {
    d: 70,
    t: `<span class="ok">  OK  </span> Started <span class="emph">Network Manager</span>.`,
  },
  {
    d: 50,
    t: `<span class="ok">  OK  </span> Started <span class="emph">Nix daemon</span>.`,
  },
  {
    d: 50,
    t: `<span class="ok">  OK  </span> Mounted <span class="emph">/home/akash</span>.`,
  },
  {
    d: 60,
    t: `<span class="ok">  OK  </span> Reached target <span class="emph">Multi-User System</span>.`,
  },
  {
    d: 80,
    t: `<span class="ok">  OK  </span> Started <span class="emph">Hyprland Wayland Compositor</span>.`,
  },
];

const TITLES = [
  "akash@portfolio: ~",
  "akash@portfolio: ~/projects",
  "● akash@portfolio: ~",
  "akash@portfolio: ~",
];

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function closest(s: string, list: string[]): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of list) {
    const d = lev(s, k);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return bestD <= 2 ? best : null;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function countLanguages(projects: Project[]): string {
  const langs = new Map<string, number>();
  for (const p of projects) {
    if (p.lang === "—") continue;
    langs.set(p.lang, (langs.get(p.lang) ?? 0) + 1);
  }
  return [...langs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([l]) => l)
    .join(", ");
}

export function Terminal({ projects, bio }: Props) {
  const bufferRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const uptimeRef = useRef<HTMLSpanElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);

  const [plain, setPlain] = useState(false);
  const [sfxOn, setSfxOn] = useState(false);

  const sfxOnRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionStartRef = useRef<number>(0);

  // keep the ref in sync so the imperative tick() reads current value
  useEffect(() => {
    sfxOnRef.current = sfxOn;
  }, [sfxOn]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);

  // status bar tick
  useEffect(() => {
    const tickStatus = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      if (clockRef.current) clockRef.current.textContent = `${hh}:${mm}:${ss}`;
      if (uptimeRef.current)
        uptimeRef.current.textContent = formatUptime(
          Date.now() - sessionStartRef.current,
        );
    };
    tickStatus();
    const id = setInterval(tickStatus, 1000);
    return () => clearInterval(id);
  }, []);

  // tab title cycling
  useEffect(() => {
    if (plain) {
      document.title = "Akash De Silva";
      return;
    }
    let idx = 0;
    document.title = TITLES[idx];
    const id = setInterval(() => {
      idx = (idx + 1) % TITLES.length;
      document.title = TITLES[idx];
    }, 4000);
    return () => clearInterval(id);
  }, [plain]);

  // body class for plain view
  useEffect(() => {
    document.body.classList.toggle("plain", plain);
  }, [plain]);

  // main shell + boot lifecycle
  useEffect(() => {
    const buffer = bufferRef.current;
    if (!buffer) return;

    let shellLocked = false;
    let currentInputLine: HTMLDivElement | null = null;
    let realInput: HTMLInputElement | null = null;
    let mirror: HTMLSpanElement | null = null;
    const history: string[] = [];
    let historyIdx = -1;
    let bootCancelled = false;
    let onInputTimer: ReturnType<typeof setTimeout> | null = null;

    const el = (tag: string, cls?: string, html?: string) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    };

    const scrollBuffer = () => {
      buffer.scrollTop = buffer.scrollHeight;
    };

    const appendLine = (html: string, cls?: string) => {
      const line = el("div", "line " + (cls ?? ""), html);
      buffer.appendChild(line);
      scrollBuffer();
      return line;
    };

    const appendNode = <T extends Node>(node: T): T => {
      buffer.appendChild(node);
      scrollBuffer();
      return node;
    };

    const blank = (n = 1) => {
      for (let i = 0; i < n; i++) appendLine("&nbsp;");
    };

    const ps1Html = () =>
      `<span class="ps1"><span class="ok">akash</span><span class="at">@</span><span class="host">portfolio</span><span class="colon">:</span><span class="path">~</span><span class="dollar">$</span></span>`;

    const tickSfx = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1100 + Math.random() * 400;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.03);
    };

    type CommandFn = (args: string[], raw: string) => void;
    const COMMANDS: Record<string, { run: CommandFn }> = {
      help: {
        run: () => {
          appendLine(`<span class="emph">available commands</span>`);
          blank();
          const rows: [string, string][] = [
            ["whoami", "print short bio"],
            ["ls projects/", "list public repositories"],
            ["cat &lt;project&gt;", "show details for a project"],
            ["cat contact.txt", "show contact info"],
            ["neofetch", "system info + ASCII portrait"],
            ["uname -a", "kernel info"],
            ["clear", "clear the screen"],
            ["help", "this message"],
          ];
          const grid = el("div", "kv");
          for (const [k, v] of rows) {
            const kk = el("div", "k accent");
            kk.innerHTML = k;
            const vv = el("div", "v");
            vv.innerHTML = v;
            grid.append(kk, vv);
          }
          appendNode(grid);
          blank();
          appendLine(
            `<span class="muted">tip: use </span><span class="emph">tab</span><span class="muted"> to autocomplete, </span><span class="emph">↑/↓</span><span class="muted"> for history.</span>`,
          );
        },
      },

      whoami: {
        run: () => {
          appendLine(
            `<span class="emph">akash de silva</span> <span class="muted">— linux user</span>`,
          );
          blank();
          const wrap = el("div", "card");
          wrap.innerHTML = escapeHtml(bio)
            .replace(/Linux/g, '<span class="accent">Linux</span>')
            .replace(/Rust/g, '<span class="orange">Rust</span>');
          appendNode(wrap);
        },
      },

      ls: {
        run: (args) => {
          const target = (args[0] ?? "").replace(/\/$/, "");
          if (target === "" || target === "." || target === "~") {
            const grid = el("div", "ls-grid");
            const items: [string, "dir" | "file"][] = [
              ["projects/", "dir"],
              ["contact.txt", "file"],
              ["bio.md", "file"],
              [".config/", "dir"],
            ];
            for (const [name, kind] of items) {
              const i = el("div", kind === "dir" ? "dir" : "file");
              i.textContent = name;
              grid.append(i);
            }
            appendNode(grid);
            return;
          }
          if (target === "projects") {
            const t = el("div", "proj-table");
            for (const p of projects) {
              const a = el("a") as HTMLAnchorElement;
              a.className = "name";
              a.href = p.url;
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              a.textContent = p.name;
              const lang = el("div", "lang");
              lang.textContent = p.lang.padEnd(11);
              const desc = el("div", "desc");
              desc.textContent = p.desc;
              t.append(a, lang, desc);
            }
            appendNode(t);
            blank();
            appendLine(
              `<span class="muted">${projects.length} repositories. </span><span class="emph">cat &lt;name&gt;</span><span class="muted"> for details.</span>`,
            );
            return;
          }
          appendLine(
            `<span class="err">ls:</span> cannot access '<span class="emph">${escapeHtml(target)}</span>': No such file or directory`,
          );
        },
      },

      cat: {
        run: (args) => {
          const target = (args[0] ?? "").trim();
          if (!target) {
            appendLine(`<span class="err">cat:</span> missing operand`);
            return;
          }

          if (/^contact(\.txt)?$/.test(target)) {
            const card = el("div", "card");
            const kv = el("div", "kv");
            for (const c of CONTACT) {
              const k = el("div", "k");
              k.textContent = c.k;
              const v = el("div", "v");
              if (c.href) {
                const a = el("a") as HTMLAnchorElement;
                a.href = c.href;
                if (!c.href.startsWith("mailto:")) {
                  a.target = "_blank";
                  a.rel = "noopener noreferrer";
                }
                a.textContent = c.v;
                v.append(a);
              } else {
                v.textContent = c.v;
              }
              kv.append(k, v);
            }
            card.append(kv);
            appendNode(card);
            return;
          }

          if (/^bio(\.md)?$/.test(target)) {
            COMMANDS.whoami.run([], "bio");
            return;
          }

          const slug = target
            .replace(/^projects\//, "")
            .replace(/\.md$/, "");
          const p = projects.find((x) => x.name === slug);
          if (p) {
            appendLine(`<span class="accent"># ${escapeHtml(p.name)}</span>`);
            blank();
            const card = el("div", "card");
            card.innerHTML = `<span class="emph">${escapeHtml(p.desc || "(no description)")}</span>`;
            appendNode(card);
            blank();
            const kv = el("div", "kv");
            const tagsHtml =
              p.tags.length > 0
                ? p.tags
                    .map(
                      (t) =>
                        `<span class="muted">#</span><span class="violet">${escapeHtml(t)}</span>`,
                    )
                    .join("  ")
                : '<span class="muted">none</span>';
            const rows: [string, string][] = [
              [
                "language",
                `<span class="cyan">${escapeHtml(p.lang)}</span>`,
              ],
              ["stars", `<span class="accent">★ ${p.stars}</span>`],
              ["updated", `<span class="emph">${escapeHtml(p.updated)}</span>`],
              ["tags", tagsHtml],
              [
                "url",
                `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.url.replace(/^https?:\/\//, ""))}</a>`,
              ],
              [
                "repo",
                `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.repoUrl.replace(/^https?:\/\//, ""))}</a>`,
              ],
            ];
            for (const [k, v] of rows) {
              const kk = el("div", "k");
              kk.textContent = k;
              const vv = el("div", "v");
              vv.innerHTML = v;
              kv.append(kk, vv);
            }
            appendNode(kv);
            return;
          }

          appendLine(
            `<span class="err">cat:</span> ${escapeHtml(target)}: No such file or directory`,
          );
        },
      },

      neofetch: {
        run: () => {
          const wrap = el("div", "neofetch");
          const pre = el("pre");
          pre.textContent = ARCH_LOGO;
          const info = el("div", "info");
          const langs = countLanguages(projects);
          const totalStars = projects.reduce((a, b) => a + b.stars, 0);
          const upStr = formatUptime(Date.now() - sessionStartRef.current);
          info.innerHTML = `
            <div><span class="k">akash</span><span class="v">@</span><span class="k">portfolio</span></div>
            <div class="muted">${"-".repeat(20)}</div>
            <div><span class="k">OS</span>: <span class="v">Arch Linux x86_64</span></div>
            <div><span class="k">Host</span>: <span class="v">ThinkPad T14 Gen 4</span></div>
            <div><span class="k">Kernel</span>: <span class="v">6.8.7-arch1-1</span></div>
            <div><span class="k">Uptime</span>: <span class="v">${escapeHtml(upStr)}</span></div>
            <div><span class="k">Packages</span>: <span class="v">${projects.length} repos, ${totalStars} ★</span></div>
            <div><span class="k">Shell</span>: <span class="v">zsh 5.9</span></div>
            <div><span class="k">DE</span>: <span class="v">Hyprland</span></div>
            <div><span class="k">Terminal</span>: <span class="v">ghostty</span></div>
            <div><span class="k">CPU</span>: <span class="v">Intel i7-1365U (12)</span></div>
            <div><span class="k">Memory</span>: <span class="v">9.8GiB / 32GiB</span></div>
            <div><span class="k">Languages</span>: <span class="v">${escapeHtml(langs)}</span></div>
            <div><span class="k">Locale</span>: <span class="v">en_LK.UTF-8 / Colombo</span></div>
            <div class="swatch">
              <span style="background:#073642"></span>
              <span style="background:#dc322f"></span>
              <span style="background:#859900"></span>
              <span style="background:#b58900"></span>
              <span style="background:#268bd2"></span>
              <span style="background:#d33682"></span>
              <span style="background:#2aa198"></span>
              <span style="background:#eee8d5"></span>
            </div>
            <div class="swatch">
              <span style="background:#002b36"></span>
              <span style="background:#cb4b16"></span>
              <span style="background:#586e75"></span>
              <span style="background:#657b83"></span>
              <span style="background:#839496"></span>
              <span style="background:#6c71c4"></span>
              <span style="background:#93a1a1"></span>
              <span style="background:#fdf6e3"></span>
            </div>
          `;
          wrap.append(pre, info);
          appendNode(wrap);
        },
      },

      uname: {
        run: (args) => {
          if (args[0] === "-a") {
            appendLine(
              `Linux portfolio 6.8.7-arch1-1 #1 SMP PREEMPT_DYNAMIC Sat May 04 12:34:56 UTC 2026 x86_64 GNU/Linux`,
            );
          } else {
            appendLine(`Linux`);
          }
        },
      },

      clear: {
        run: () => {
          buffer.innerHTML = "";
        },
      },

      sudo: {
        run: () => {
          const responses = [
            `<span class="err">[sudo]</span> password for <span class="emph">akash</span>: <span class="muted">(silent)</span>`,
            `<span class="muted">Sorry, user <span class="emph">akash</span> is not in the sudoers file. This incident will be reported.</span>`,
            `<span class="muted">(but really, this is a portfolio. nice try.)</span>`,
          ];
          for (const r of responses) appendLine(r);
        },
      },

      exit: {
        run: () => {
          appendLine(`<span class="muted">logout</span>`);
          blank();
          appendLine(
            `<span class="emph">[Process completed]</span> <span class="muted">— refresh to start a new session, or try </span><span class="accent">plain view</span><span class="muted">.</span>`,
          );
          shellLocked = true;
        },
      },
    };
    COMMANDS.ll = COMMANDS.ls;
    COMMANDS.dir = COMMANDS.ls;
    COMMANDS.man = COMMANDS.help;
    COMMANDS["?"] = COMMANDS.help;

    const tokenize = (s: string) => s.trim().split(/\s+/).filter(Boolean);

    const runRaw = (raw: string) => {
      const tokens = tokenize(raw);
      if (tokens.length === 0) return;
      const [cmd, ...args] = tokens;
      const c = COMMANDS[cmd];
      if (c) {
        try {
          c.run(args, raw);
        } catch (e) {
          appendLine(
            `<span class="err">error:</span> ${escapeHtml(String(e))}`,
          );
        }
      } else {
        appendLine(
          `<span class="err">zsh:</span> command not found: <span class="emph">${escapeHtml(cmd)}</span>`,
        );
        const guess = closest(cmd, Object.keys(COMMANDS));
        if (guess) {
          appendLine(
            `<span class="muted">did you mean </span><span class="accent">${escapeHtml(guess)}</span><span class="muted">?</span>`,
          );
        }
      }
    };

    const onInput = () => {
      if (!realInput || !mirror || !currentInputLine) return;
      mirror.textContent = realInput.value;
      currentInputLine.classList.remove("idle");
      currentInputLine.classList.add("typing");
      if (sfxOnRef.current) tickSfx();
      if (onInputTimer) clearTimeout(onInputTimer);
      onInputTimer = setTimeout(() => {
        currentInputLine?.classList.remove("typing");
        currentInputLine?.classList.add("idle");
      }, 450);
    };

    const newPromptInPlace = (prevValue: string) => {
      if (!currentInputLine || !realInput || !mirror) return;
      const wrap = currentInputLine.querySelector(
        ".input-wrap",
      ) as HTMLSpanElement | null;
      if (wrap) {
        wrap.innerHTML = `<span class="cmd-text">${escapeHtml(prevValue)}</span>`;
      }
      realInput.disabled = true;
      newPromptLine();
      if (realInput) {
        realInput.value = prevValue;
      }
      if (mirror) {
        mirror.textContent = prevValue;
      }
      realInput?.setSelectionRange(prevValue.length, prevValue.length);
    };

    const autocomplete = () => {
      if (!realInput || !mirror) return;
      const v = realInput.value;
      const parts = v.split(/\s+/);
      if (parts.length === 1) {
        const matches = Object.keys(COMMANDS).filter(
          (c) =>
            (c.startsWith(parts[0]) && !["ll", "dir", "man", "?"].includes(c)) ||
            c === parts[0],
        );
        if (matches.length === 1) {
          realInput.value = matches[0] + " ";
        } else if (matches.length > 1) {
          appendLine(matches.join("  "));
          newPromptInPlace(v);
          return;
        }
      } else {
        const cmd = parts[0];
        const last = parts[parts.length - 1];
        let pool: string[] = [];
        if (cmd === "cat") {
          pool = ["contact.txt", "bio.md", ...projects.map((p) => p.name)];
        } else if (cmd === "ls") {
          pool = ["projects/", "."];
        }
        const matches = pool.filter((x) => x.startsWith(last));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          realInput.value = parts.join(" ");
        } else if (matches.length > 1) {
          appendLine(matches.join("  "));
          newPromptInPlace(v);
          return;
        }
      }
      mirror.textContent = realInput.value;
      realInput.setSelectionRange(realInput.value.length, realInput.value.length);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!realInput || !currentInputLine || !mirror) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const raw = realInput.value;
        realInput.disabled = true;
        const wrap = currentInputLine.querySelector(
          ".input-wrap",
        ) as HTMLSpanElement | null;
        if (wrap) {
          wrap.innerHTML = `<span class="cmd-text">${escapeHtml(raw)}</span>`;
        }
        if (raw.trim()) {
          history.push(raw);
          historyIdx = history.length;
          runRaw(raw);
        }
        if (!shellLocked) newPromptLine();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        historyIdx = Math.max(0, historyIdx - 1);
        realInput.value = history[historyIdx] ?? "";
        mirror.textContent = realInput.value;
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (history.length === 0) return;
        historyIdx = Math.min(history.length, historyIdx + 1);
        realInput.value = history[historyIdx] ?? "";
        mirror.textContent = realInput.value;
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        autocomplete();
        return;
      }
      if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        COMMANDS.clear.run([], "clear");
        newPromptLine();
        return;
      }
      if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        const wrap = currentInputLine.querySelector(
          ".input-wrap",
        ) as HTMLSpanElement | null;
        if (wrap) {
          wrap.innerHTML = `<span class="cmd-text">${escapeHtml(realInput.value)}</span><span class="err">^C</span>`;
        }
        realInput.disabled = true;
        newPromptLine();
        return;
      }
    };

    const newPromptLine = () => {
      if (shellLocked) return;
      const row = el("div", "input-row idle") as HTMLDivElement;
      row.innerHTML = `${ps1Html()}<span class="input-wrap"><span class="input-mirror"></span><span class="cursor"></span><input class="real-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" /></span>`;
      buffer.appendChild(row);
      currentInputLine = row;
      mirror = row.querySelector(".input-mirror") as HTMLSpanElement;
      realInput = row.querySelector(".real-input") as HTMLInputElement;
      realInput.addEventListener("input", onInput);
      realInput.addEventListener("keydown", onKey);
      realInput.focus();
      scrollBuffer();
    };

    const finishBoot = () => {
      if (skipBtnRef.current) skipBtnRef.current.style.display = "none";
      blank();
      appendLine(
        `<span class="emph">Welcome to Arch Linux on portfolio.</span>`,
      );
      appendLine(
        `<span class="muted">Last login: Wed May 06 11:42:18 2026 from 192.168.1.42</span>`,
      );
      blank();
      COMMANDS.neofetch.run([], "neofetch");
      blank();
      appendLine(
        `<span class="muted">Type </span><span class="accent">help</span><span class="muted"> to get started, or </span><span class="accent">ls projects/</span><span class="muted"> to see what I've been building.</span>`,
      );
      blank();
      newPromptLine();
    };

    const runBoot = () => {
      if (skipBtnRef.current) skipBtnRef.current.style.display = "block";
      let i = 0;
      const next = () => {
        if (bootCancelled) return;
        if (i >= BOOT_LINES.length) {
          finishBoot();
          return;
        }
        const line = BOOT_LINES[i++];
        setTimeout(() => {
          if (bootCancelled) return;
          appendLine(line.t, "boot-line");
          next();
        }, line.d);
      };
      next();
    };

    const skipBoot = () => {
      if (bootCancelled) return;
      bootCancelled = true;
      buffer.innerHTML = "";
      finishBoot();
    };

    // expose skip handler so the JSX button + Esc key can call it
    (window as unknown as { __skipBoot?: () => void }).__skipBoot = skipBoot;

    const onEsc = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        skipBtnRef.current &&
        skipBtnRef.current.style.display !== "none"
      ) {
        skipBoot();
      }
    };

    const onClickRefocus = (e: MouseEvent) => {
      if (document.body.classList.contains("plain")) return;
      const target = e.target as HTMLElement;
      if (target.closest("a")) return;
      if (target.closest(".chrome-actions")) return;
      if (target.closest(".skip-boot")) return;
      if (realInput && !realInput.disabled) realInput.focus();
    };

    document.addEventListener("keydown", onEsc);
    document.addEventListener("click", onClickRefocus);

    runBoot();

    return () => {
      bootCancelled = true;
      shellLocked = true;
      if (onInputTimer) clearTimeout(onInputTimer);
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("click", onClickRefocus);
      if (buffer) buffer.innerHTML = "";
      delete (window as unknown as { __skipBoot?: () => void }).__skipBoot;
    };
  }, [projects, bio]);

  const toggleSfx = () => {
    setSfxOn((v) => {
      const next = !v;
      if (next && !audioCtxRef.current) {
        try {
          const Ctor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          audioCtxRef.current = new Ctor();
        } catch {
          // ignore — sfx unavailable
        }
      }
      return next;
    });
  };

  const handleSkip = () => {
    (window as unknown as { __skipBoot?: () => void }).__skipBoot?.();
  };

  return (
    <div className="stage">
      <article className="plain-view">
        <button className="back" onClick={() => setPlain(false)}>
          ← terminal
        </button>
        <h1>Akash De Silva</h1>
        <p>{bio}</p>

        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              <a
                className="pname"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.name}
              </a>{" "}
              <span className="meta">
                — {p.lang}, updated {p.updated}
              </span>
              <br />
              <span style={{ color: "#586e75" }}>{p.desc}</span>
            </li>
          ))}
        </ul>

        <h2>Elsewhere</h2>
        <ul>
          {CONTACT.map((c) => (
            <li key={c.k}>
              {c.href ? (
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    c.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                >
                  {c.k} → {c.v}
                </a>
              ) : (
                <>
                  {c.k} → {c.v}
                </>
              )}
            </li>
          ))}
        </ul>
      </article>

      <div className="term">
        <div className="chrome">
          <div className="lights">
            <span className="light r"></span>
            <span className="light y"></span>
            <span className="light g"></span>
          </div>
          <div className="chrome-title">akash@portfolio: ~</div>
          <div className="chrome-actions">
            <button
              className={`chrome-btn${sfxOn ? " on" : ""}`}
              onClick={toggleSfx}
              title="Keypress sounds"
            >
              {sfxOn ? "🔊 sfx" : "🔇 sfx"}
            </button>
            <button
              className="chrome-btn"
              onClick={() => setPlain(true)}
              title="Plain view"
            >
              plain view
            </button>
          </div>
        </div>

        <div className="buffer" ref={bufferRef} tabIndex={0}></div>

        <div className="statusbar">
          <div className="seg">
            <span className="dot"></span>
            <span className="pill">akash</span>
            <span className="dim">@</span>
            <span>portfolio</span>
          </div>
          <div className="seg dim">zsh</div>
          <div className="seg right">
            <span className="dim">load</span>
            <span>0.12 0.18 0.21</span>
            <span className="dim">|</span>
            <span className="dim">up</span>
            <span ref={uptimeRef}>0s</span>
            <span className="dim">|</span>
            <span ref={clockRef}>--:--:--</span>
          </div>
        </div>

        <div className="scanlines"></div>
        <button
          className="skip-boot"
          ref={skipBtnRef}
          style={{ display: "none" }}
          onClick={handleSkip}
        >
          skip [esc]
        </button>
      </div>
    </div>
  );
}
