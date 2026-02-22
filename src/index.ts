import { Plugin } from "@elizaos/core";
import { listRafflesAction } from "./actions/listRaffles";
import { getRaffleAction } from "./actions/getRaffle";
import { joinRaffleAction } from "./actions/joinRaffle";
import { createRaffleAction } from "./actions/createRaffle";
import { drawWinnerAction } from "./actions/drawWinner";

export const moltrafflePlugin: Plugin = {
  name: "moltraffle",
  description:
    "Interact with moltraffle.fun — permissionless on-chain raffles on Base mainnet. Create raffles, join raffles, draw winners, and claim prizes. All actions return transaction calldata for the agent's wallet provider to sign and send.",
  actions: [
    listRafflesAction,
    getRaffleAction,
    joinRaffleAction,
    createRaffleAction,
    drawWinnerAction,
  ],
  evaluators: [],
  providers: [],
};

export default moltrafflePlugin;

export {
  listRafflesAction,
  getRaffleAction,
  joinRaffleAction,
  createRaffleAction,
  drawWinnerAction,
};
