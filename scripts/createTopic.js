import { Client, TopicCreateTransaction, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), '..', '.env.local') });

// Load operator account (your Hedera testnet account)
const operatorId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const operatorKey = PrivateKey.fromString(process.env.HEDERA_TESTNET_PRIVATE_KEY);

// Connect to Hedera testnet
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function createTopic() {
  const txResponse = await new TopicCreateTransaction()
    .setSubmitKey(operatorKey)  // only your key can submit if you want control
    .execute(client);

  const receipt = await txResponse.getReceipt(client);
  console.log("✅ Topic created with ID:", receipt.topicId.toString());
}

createTopic();
