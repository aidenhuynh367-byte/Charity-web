"use client";

import { useState } from "react";

type Props = {
  url: string;
  title?: string;
  text?: string;
};

const DEFAULT_TITLE = "Charity Link";
const DEFAULT_TEXT =
  "I found Charity Link - a simple way to donate gently used items to local charities helping children in need. Check it out:";

export function ShareWidget({
  url,
  title = DEFAULT_TITLE,
  text = DEFAULT_TEXT,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const shareBody = `${text}\n\n${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedEmailBody = encodeURIComponent(shareBody);
  const encodedWhatsAppText = encodeURIComponent(shareBody);

  async function copyShareBody() {
    await navigator.clipboard.writeText(shareBody);
  }

  function showHint(message: string) {
    setHint(message);
    window.setTimeout(() => setHint(null), 6000);
  }

  async function shareWhatsApp() {
    try {
      await copyShareBody();
    } catch {
      // Clipboard may be blocked; still try opening WhatsApp.
    }

    showHint(
      "Message copied. If WhatsApp only shows the link, paste in the chat (long-press → Paste).",
    );

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${encodedWhatsAppText}`;
      return;
    }
    window.open(
      `https://web.whatsapp.com/send?text=${encodedWhatsAppText}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function shareInstagram() {
    try {
      await copyShareBody();
      showHint(
        "Message copied. Instagram does not allow pre-filled posts from the browser — paste it into a post, story, or DM.",
      );
    } catch {
      showHint(
        "Could not copy the message. Copy it manually, then open Instagram.",
      );
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = "instagram://app";
      return;
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await copyShareBody();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">Share Charity Link</p>
      <p className="mt-1 text-sm text-slate-600">
        Invite friends and family to donate with you.
      </p>

      {hint ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {hint}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={shareInstagram}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Instagram
        </button>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          X
        </a>
        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodedEmailBody}`}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Email
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy message"}
        </button>
      </div>
    </div>
  );
}
