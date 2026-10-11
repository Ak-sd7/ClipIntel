import { createPayloadIndexes } from "./services/retrieval.service";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { createCollection } = await import("./services/qdrant.service");

    await createCollection();
    await createPayloadIndexes();

    console.log("Qdrant initialized");
  }
}