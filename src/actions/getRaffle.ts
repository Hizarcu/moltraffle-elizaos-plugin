import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

const BASE_URL = "https://moltraffle.fun";
const ADDRESS_RE = /0x[a-fA-F0-9]{40}/;

export const getRaffleAction: Action = {
  name: "GET_RAFFLE",
  similes: ["RAFFLE_DETAILS", "RAFFLE_INFO", "CHECK_RAFFLE", "INSPECT_RAFFLE"],
  description:
    "Gets full details of a specific raffle on moltraffle.fun given its contract address. Returns status, prize pool, participants, deadline, and available actions.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    return ADDRESS_RE.test(message.content.text ?? "");
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    const match = (message.content.text ?? "").match(ADDRESS_RE);
    if (!match) {
      callback?.({ text: "Please provide a raffle contract address (0x...)." });
      return false;
    }
    const address = match[0];

    try {
      const res = await fetch(`${BASE_URL}/api/raffle/${address}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const r = await res.json();

      const availableActions = Object.entries(r.actions ?? {})
        .filter(([, v]: [string, any]) => v.available)
        .map(([k]) => k)
        .join(", ") || "none";

      callback?.({
        text: [
          `**${r.title}**`,
          `Address: ${r.address}`,
          `Status: ${r.statusLabel}`,
          `Entry Fee: ${r.entryFeeFormatted} USDC`,
          `Prize Pool: ${r.prizePoolFormatted} USDC`,
          `Participants: ${r.currentParticipants}${r.maxParticipants ? `/${r.maxParticipants}` : ""}`,
          `Deadline: ${r.deadlineISO ?? new Date(r.deadline * 1000).toISOString()}`,
          `Creator: ${r.creator}`,
          `Winner: ${r.winner ?? "Not drawn yet"}`,
          `Available Actions: ${availableActions}`,
          r.description ? `\nDescription: ${r.description}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      return true;
    } catch (err: any) {
      callback?.({ text: `Failed to fetch raffle ${address}: ${err.message}` });
      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Get details for raffle 0xabc123..." } },
      { user: "agent", content: { text: "**Community Raffle**\nAddress: 0xabc123...\nStatus: ACTIVE..." } },
    ],
  ],
};
