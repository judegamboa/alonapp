import type { Message } from "@/lib/messages";

// Presentational thread transcript, shared by the app and the portal.
// `accent` is the workspace brand color on the portal, the primary teal in-app.
// `labels` names each side from the current viewer's perspective.
export function MessageList({
  messages,
  accent,
  labels,
}: {
  messages: Message[];
  accent: string;
  labels: { freelancer: string; client: string };
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {messages.map((m) => {
        const isClient = m.author_role === "client";
        return (
          <li
            key={m.id}
            className="rounded-lg border px-3 py-2"
            style={
              isClient
                ? { borderColor: accent, backgroundColor: `${accent}0f` }
                : undefined
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs font-medium"
                style={isClient ? { color: accent } : undefined}
              >
                {isClient ? labels.client : labels.freelancer}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
