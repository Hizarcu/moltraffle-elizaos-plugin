import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

const BASE_URL = "https://moltraffle.fun";

function extractParam(text: string, keys: string[]): string | null {
  for (const key of keys) {
    const re = new RegExp(`${key}[:\\s]+["']?([^"',\\n]+)["']?`, "i");
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

export const createRaffleAction: Action = {
  name: "CREATE_RAFFLE",
  similes: ["NEW_RAFFLE", "MAKE_RAFFLE", "LAUNCH_RAFFLE", "START_RAFFLE"],
  description:
    "Returns calldata to create a new raffle on moltraffle.fun. Requires title, description, entry fee (USDC), deadline (unix timestamp or ISO date), and max participants (0 = unlimited). Agent's wallet must sign and send.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text ?? "";
    return /title|raffle|entry.?fee|create/i.test(text);
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    const text = message.content.text ?? "";

    const title = extractParam(text, ["title"]);
    const description = extractParam(text, ["description", "desc"]);
    const entryFee = extractParam(text, ["entry.?fee", "fee", "price", "cost"]);
    const maxParticipants = extractParam(text, ["max.?participants", "max.?entries", "slots", "max"]) ?? "0";
    const prizeDescription = extractParam(text, ["prize.?description", "prize"]) ?? "";
    const commissionBps = extractParam(text, ["commission", "commission.?bps"]) ?? "0";

    // Parse deadline
    let deadline: number | null = null;
    const deadlineStr = extractParam(text, ["deadline", "ends", "end.?date", "end.?time"]);
    if (deadlineStr) {
      const ts = parseInt(deadlineStr, 10);
      deadline = isNaN(ts) ? Math.floor(new Date(deadlineStr).getTime() / 1000) : ts;
    }

    if (!title || !description || !entryFee || !deadline) {
      callback?.({
        text: [
          "To create a raffle I need: title, description, entry fee (USDC), and deadline.",
          "Example: Create a raffle with title: 'My Raffle', description: 'A fun raffle', entry fee: 1, deadline: 1750000000, max participants: 100",
        ].join("\n"),
      });
      return false;
    }

    try {
      const params = new URLSearchParams({
        title,
        description,
        entryFee,
        deadline: deadline.toString(),
        maxParticipants,
        ...(prizeDescription && { prizeDescription }),
        ...(commissionBps && { creatorCommissionBps: commissionBps }),
      });

      const res = await fetch(`${BASE_URL}/api/factory/calldata?${params}`);
      const data = await res.json();

      if (!res.ok) {
        const details = data.details?.map((d: any) => `  - ${d}`).join("\n") ?? data.error;
        callback?.({ text: `Validation failed:\n${details}` });
        return false;
      }

      callback?.({
        text: [
          `Ready to create raffle **${title}**.`,
          ``,
          `Transaction details:`,
          `  to: ${data.to}`,
          `  value: ${data.valueFormatted}`,
          `  calldata: ${data.calldata}`,
          `  function: ${data.function}`,
          ``,
          `Creation fee: ${data.valueFormatted}`,
          `Sign and send this transaction with your wallet provider.`,
        ].join("\n"),
        action: "CREATE_RAFFLE",
        data,
      });
      return true;
    } catch (err: any) {
      callback?.({ text: `Failed to get create calldata: ${err.message}` });
      return false;
    }
  },

  examples: [
    [
      {
        user: "user",
        content: { text: "Create a raffle with title: 'Weekend Raffle', description: 'Win big this weekend', entry fee: 2, deadline: 1750000000, max participants: 50" },
      },
      { user: "agent", content: { text: "Ready to create raffle **Weekend Raffle**.\n\nTransaction details:..." } },
    ],
  ],
};
