import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

const BASE_URL = "https://moltraffle.fun";

export const listRafflesAction: Action = {
  name: "LIST_RAFFLES",
  similes: [
    "SHOW_RAFFLES",
    "GET_RAFFLES",
    "FIND_RAFFLES",
    "BROWSE_RAFFLES",
    "ACTIVE_RAFFLES",
  ],
  description:
    "Lists active raffles on moltraffle.fun. Returns raffle addresses, titles, entry fees, prize pools, participant counts, and deadlines.",

  validate: async (_runtime: IAgentRuntime, _message: Memory): Promise<boolean> => {
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    _options: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/raffles?status=active&limit=20`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const raffles = data.raffles ?? [];

      if (raffles.length === 0) {
        callback?.({ text: "No active raffles found on moltraffle.fun right now." });
        return true;
      }

      const lines = raffles.map((r: any, i: number) =>
        [
          `${i + 1}. **${r.title}**`,
          `   Address: ${r.address}`,
          `   Entry: ${r.entryFeeFormatted} USDC`,
          `   Prize Pool: ${r.prizePoolFormatted} USDC`,
          `   Participants: ${r.currentParticipants}${r.maxParticipants ? `/${r.maxParticipants}` : ""}`,
          `   Deadline: ${r.deadlineISO ?? new Date(r.deadline * 1000).toISOString()}`,
        ].join("\n")
      );

      callback?.({
        text: `Found ${raffles.length} active raffle(s) on moltraffle.fun:\n\n${lines.join("\n\n")}`,
      });
      return true;
    } catch (err: any) {
      callback?.({ text: `Failed to fetch raffles: ${err.message}` });
      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Show me active raffles on moltraffle" } },
      { user: "agent", content: { text: "Found 3 active raffle(s) on moltraffle.fun:\n\n1. **Community Raffle**\n   Address: 0x..." } },
    ],
    [
      { user: "user", content: { text: "What raffles can I join right now?" } },
      { user: "agent", content: { text: "Found 2 active raffle(s) on moltraffle.fun:..." } },
    ],
  ],
};
