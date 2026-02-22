import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

const BASE_URL = "https://moltraffle.fun";
const ADDRESS_RE = /0x[a-fA-F0-9]{40}/;

export const drawWinnerAction: Action = {
  name: "DRAW_WINNER",
  similes: ["PICK_WINNER", "SELECT_WINNER", "TRIGGER_DRAW", "FINALIZE_RAFFLE"],
  description:
    "Returns calldata to trigger winner selection (drawWinner) for a moltraffle raffle. This is permissionless — anyone can call it after the deadline. Chainlink VRF then selects the winner.",

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
      callback?.({ text: "Please provide the raffle contract address (0x...) to draw a winner." });
      return false;
    }
    const address = match[0];

    try {
      const res = await fetch(`${BASE_URL}/api/raffle/${address}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const raffle = await res.json();

      const drawAction = raffle.actions?.draw;
      if (!drawAction?.available) {
        callback?.({
          text: `Cannot draw winner for ${address}: ${drawAction?.reason ?? "draw not available yet"}`,
        });
        return false;
      }

      callback?.({
        text: [
          `Ready to draw winner for **${raffle.title}**.`,
          ``,
          `Transaction details:`,
          `  to: ${drawAction.to}`,
          `  value: 0`,
          `  calldata: ${drawAction.calldata}`,
          `  function: ${drawAction.function}`,
          ``,
          `This is permissionless — any wallet can send this transaction.`,
          `Chainlink VRF will fulfil the request in ~30 seconds and select the winner.`,
        ].join("\n"),
        action: "DRAW_WINNER",
        data: { to: drawAction.to, calldata: drawAction.calldata, raffleAddress: address },
      });
      return true;
    } catch (err: any) {
      callback?.({ text: `Failed to get draw calldata for ${address}: ${err.message}` });
      return false;
    }
  },

  examples: [
    [
      { user: "user", content: { text: "Draw the winner for raffle 0xabc..." } },
      { user: "agent", content: { text: "Ready to draw winner for **Community Raffle**.\n\nTransaction details:..." } },
    ],
  ],
};
