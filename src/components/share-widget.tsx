"use client";

import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";

type Props = {
  url: string;
  title?: string;
  text?: string;
};

export function ShareWidget({ url, title, text }: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const resolvedTitle = title ?? t("share.defaultTitle");
  const resolvedText = text ?? t("share.defaultText");
  const shareBody = `${resolvedText}\n\n${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(resolvedTitle);
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

    showHint(t("share.hintWhatsapp"));

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
      showHint(t("share.hintInstagram"));
    } catch {
      showHint(t("share.hintInstagramFail"));
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
      <p className="text-sm font-medium text-slate-900">{t("share.title")}</p>
      <p className="mt-1 text-sm text-slate-600">{t("share.subtitle")}</p>

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
          {t("share.whatsapp")}
        </button>
        <button
          type="button"
          onClick={shareInstagram}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("share.instagram")}
        </button>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("share.facebook")}
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${resolvedText} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("share.x")}
        </a>
        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodedEmailBody}`}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {t("share.email")}
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          {copied ? t("share.copied") : t("share.copy")}
        </button>
      </div>
    </div>
  );
}
