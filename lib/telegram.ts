/**
 * Best-effort owner notification — a failed/missing Telegram config
 * should never block or fail order placement, so this swallows its
 * own errors rather than throwing.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      },
    );
    if (!response.ok) {
      console.error("[telegram] sendMessage failed:", await response.text());
    }
  } catch (err) {
    console.error("[telegram] sendMessage threw:", err);
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
