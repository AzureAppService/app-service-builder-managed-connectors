export function connectionClientId(env: NodeJS.ProcessEnv): string {
  const output = env.CONNECTOR_IDENTITY_CLIENT_ID_ENV;
  if (output && !/^Identity_[A-Za-z0-9_]+_ClientId$/.test(output)) {
    throw new Error("CONNECTOR_IDENTITY_CLIENT_ID_ENV must name the selected Connections identity output.");
  }
  if (output && env.AZURE_CLIENT_ID !== undefined) {
    throw new Error("Remove AZURE_CLIENT_ID before selecting the Connections identity output.");
  }
  const clientId = output ? env[output] : env.AZURE_CLIENT_ID;
  if (!clientId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(clientId) ||
    clientId === "00000000-0000-0000-0000-000000000000") {
    throw new Error("The selected app managed identity client GUID is missing or invalid.");
  }
  return clientId;
}
