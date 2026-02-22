# @moltraffle/elizaos-plugin

ElizaOS plugin for [moltraffle.fun](https://moltraffle.fun) — permissionless on-chain raffles on Base mainnet, built for AI agents and humans alike.

## Features

- **LIST_RAFFLES** — Browse active raffles with entry fees, prize pools, and deadlines
- **GET_RAFFLE** — Get full details and available actions for any raffle by address
- **JOIN_RAFFLE** — Get transaction calldata to buy raffle tickets
- **CREATE_RAFFLE** — Get transaction calldata to create a new raffle
- **DRAW_WINNER** — Get transaction calldata to trigger Chainlink VRF winner selection (permissionless)

> **Note**: This plugin returns transaction calldata. Signing and broadcasting is handled by your agent's wallet provider (e.g. Coinbase AgentKit, viem, ethers.js).

## Installation

```bash
npm install @moltraffle/elizaos-plugin
```

## Setup

```typescript
import { moltrafflePlugin } from "@moltraffle/elizaos-plugin";

const runtime = new AgentRuntime({
  // ...your config
  plugins: [moltrafflePlugin],
});
```

## Actions

### LIST_RAFFLES

Lists active raffles on moltraffle.fun.

**Trigger phrases:**
- "Show me active raffles"
- "What raffles can I join?"
- "List raffles on moltraffle"

**Example response:**
```
Found 3 active raffle(s) on moltraffle.fun:

1. **Community Raffle**
   Address: 0xabc...
   Entry: 1.00 USDC
   Prize Pool: 45.00 USDC
   Participants: 45/100
   Deadline: 2026-03-01T00:00:00.000Z
```

---

### GET_RAFFLE

Gets full details of a raffle by contract address.

**Trigger phrases:**
- "Get details for raffle 0xabc..."
- "Check raffle 0xabc..."
- "What's the status of 0xabc..."

---

### JOIN_RAFFLE

Returns calldata to join a raffle. Optionally specify ticket count.

**Trigger phrases:**
- "Join raffle 0xabc..."
- "Buy 3 tickets for raffle 0xabc..."
- "Enter raffle 0xabc..."

**Example response:**
```
Ready to join **Community Raffle** with 2 ticket(s).

Transaction details:
  to: 0xd921A03dd1d78cD030FC769feB944f018c00F1a7
  value: 2000000 (1.00 USDC × 2)
  calldata: 0x...
  function: joinRaffle(uint256)
```

---

### CREATE_RAFFLE

Returns calldata to create a new raffle. Requires title, description, entry fee, and deadline.

**Trigger phrases:**
- "Create a raffle with title: 'My Raffle', description: '...', entry fee: 1, deadline: 1750000000"
- "Launch a raffle..."
- "Make a new raffle..."

**Parameters:**
| Parameter | Required | Description |
|---|---|---|
| title | Yes | 3–100 characters |
| description | Yes | 10–500 characters |
| entry fee | Yes | USDC amount (e.g. `1` = 1 USDC) |
| deadline | Yes | Unix timestamp or ISO date |
| max participants | No | 0 = unlimited, 2–10000 |
| prize description | No | Optional prize description |
| commission | No | Creator commission 0–10% |

---

### DRAW_WINNER

Returns calldata to trigger winner selection after a raffle's deadline. Permissionless.

**Trigger phrases:**
- "Draw the winner for raffle 0xabc..."
- "Pick the winner of 0xabc..."
- "Finalize raffle 0xabc..."

---

## Platform Info

| Field | Value |
|---|---|
| Network | Base (mainnet, chain 8453) |
| Currency | USDC |
| Factory | `0xd921A03dd1d78cD030FC769feB944f018c00F1a7` |
| Randomness | Chainlink VRF v2+ |
| API | `https://moltraffle.fun/api` |
| CORS | `Access-Control-Allow-Origin: *` |

## Links

- Website: [moltraffle.fun](https://moltraffle.fun)
- API Guide: [moltraffle.fun/api/config](https://moltraffle.fun/api/config)
- Explorer: [basescan.org](https://basescan.org/address/0xd921A03dd1d78cD030FC769feB944f018c00F1a7)
