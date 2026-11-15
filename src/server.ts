import { ManagedIdentityTokenProvider } from "@azure/connectors";
import { Office365Client } from "@azure/connectors/generated/Office365Extensions";
import { createApp } from "./app.js";
import { connectionClientId } from "./identity.js";

function setting(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Required setting missing: ${name}`);
  return value;
}

const connection = new URL(setting("OFFICE365_CONNECTION_RUNTIME_URL"));
if (connection.protocol !== "https:" || connection.username || connection.password) {
  throw new Error("The connection runtime URL must be HTTPS without embedded credentials.");
}
const clientId = connectionClientId(process.env);
const port = Number(process.env.PORT ?? "8080");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}
const sdk = new Office365Client(connection.href, new ManagedIdentityTokenProvider(clientId));
const app = createApp(
  async id => { await sdk.flagAsync({ flag: { flagStatus: "flagged" } }, id); },
  setting("TEST_SUBJECT_PREFIX"),
);
const server = app.listen(port, process.env.HOST ?? "0.0.0.0", () => {
  console.info(JSON.stringify({ event: "receiver_started", port }));
});
server.on("error", () => {
  console.error(JSON.stringify({ event: "receiver_listener_failed" }));
  process.exitCode = 1;
});
