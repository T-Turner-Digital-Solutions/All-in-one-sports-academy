"use client";

import { useActionState } from "react";
import { sendMessageAction, type SendMessageState } from "@/lib/actions/messages";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";

const initialState: SendMessageState = {};

type MessageItem = { id: string; body: string; createdAt: string; senderName: string; isMine: boolean };

export function MessageThread({ threadKey, messages }: { threadKey: string; messages: MessageItem[] }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);

  return (
    <div className="aio-card flex h-[28rem] flex-col p-5">
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-aio-silver">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] ${m.isMine ? "ml-auto text-right" : ""}`}>
              <p className={`inline-block px-3 py-2 text-sm ${m.isMine ? "bg-aio-red text-white" : "bg-white/10"}`}>{m.body}</p>
              <p className="mt-1 text-[10px] text-aio-silver">
                {m.senderName} · {formatDateTime(m.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
      <form action={formAction} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
        <input type="hidden" name="threadKey" value={threadKey} />
        <input
          name="body"
          required
          placeholder="Type a message..."
          className="flex-1 border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Send
        </Button>
      </form>
      {state.error ? <p className="mt-2 text-xs text-aio-red">{state.error}</p> : null}
    </div>
  );
}
