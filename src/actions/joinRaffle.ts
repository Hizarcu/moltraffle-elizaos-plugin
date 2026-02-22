import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

const BASE_URL = "https://moltraffle.fun";
const ADDRESS_RE = /0x[a-fA-F0-9]{40}/;

export const joinRaffleAction: Action = {
  name: "JOIN_RAFFLE",
  similes: ["ENTER_RAFFLE", "BUY_TICKET", "PARTICIPATE_RAFFLE", "JOIN_MOLTRAFFLE"],
  description:
    "Returns the calldata needed to join a moltraffle raffle. Provide the raffle address and optionally a ticket count. The agent's wallet provider must sign and send the transaction.",

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
    const text = message.content.text ?? "";
    const match = text.match(ADDRESS_RE);
    if (!match) {
      callback?.({ text: "Please provide a raffle contract address (0x...) to join." });
      return false;
    }
    const address = match[0];

    const ticketMatch = text.match(/(\d+)\s*ticket/i);
    const ticketCount = ticketMatch ? parseInt(ticketMatch[1], 10) : 1;

    try {
      const res = await fetch(`${BASE_URL}/api/raffle/${address}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const raffle = await res.json();

      const joinAction = raffle.actions?.join;
      if (!joinAction?.available) {
        callback?.({
          text: `Cannot join raffle ${address}: ${joinAction?.reason ?? "join not available"}`,
        });
        return false;
      }

      const entryFee = BigInt(raffle.entryFee ?? "0");
      const totalValue = (entryFee * BigInt(ticketCount)).toString();

      callback?.({
        text: [
          `Ready to join **${raffle.title}** with ${ticketCount} ticket(s).`,
          ``,
          `Transaction details:`,
          `  to: ${joinAction.to}`,
          `  value: ${totalValue} (${raffle.entryFeeFormatted} USDC × ${ticketCount})`,
          `  calldata: ${joinAction.calldata_example}`,
          `  function: ${joinAction.function}`,
          ``,
          `Note: Adjust calldata ticketCount arg to ${ticketCount} if different from example.`,
          `Sign and send this transaction with your wallet provider to enter the raffle.`,
        ].join("\n"),
        action: "JOIN_RAFFLE",
        data: {
          to: joinAction.to,
          value: totalValue,
          calldata: joinAction.calldata_example,
          ticketCount,
          raffle: { address, title: raffle.title, entryFee: raffle.entryFee },
        },
      });
      return true;
    } catch (err: any) {
      callback?.({ text: `Failed to get join calldata for ${address}: ${err.message}` });
      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Join raffle 0xabc... with 2 tickets" } },
      { user: "agent", content: { text: "Ready to join **Community Raffle** with 2 ticket(s).\n\nTransaction details:\n  to: 0xabc..." } },
    ],
  ],
};
