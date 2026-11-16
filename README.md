---
page_type: sample
languages: [typescript]
products: [azure-app-service, azure-logic-apps]
name: App Service Builder protected Outlook connector
description: Receive a filtered Outlook event through an authenticated Connector Namespace callback and flag only the matching test message.
urlFragment: app-service-builder-managed-connectors
---

# Receive and flag a test email with App Service Builder

Fork the [canonical sample](https://github.com/AzureAppService/app-service-builder-managed-connectors) into your GitHub account.
This integration is not in the Portal template gallery; follow the manual protected-app and connector setup below.

Receive an Outlook event at a protected Node.js 24 / TypeScript app, then flag only a message with your unique test prefix.
An external Azure Connector Namespace sends the event; your app calls the connector SDK with its managed identity.
This sample is for preview development and testing.
Builder Connections records the existing connection runtime URL and selected
app identity; external connection creation, OAuth consent and trigger management
remain separate. The production catalog advertises Connector Namespace Connections;
qualification of this revision's deployed callback and mailbox effect remains pending.

In this sample, you learn how to:

- Authorize a namespace identity to call a required-auth Builder endpoint.
- Separate app-to-connection access from mailbox-owner OAuth consent.
- Verify one matching message and an unchanged negative control, then remove the isolated resources.

## Prerequisites

- App Service Builder preview access, Node.js 24 activation and Connector Namespace availability in your subscription's West US 2 target.
- Bash, Azure CLI with Bicep, Node.js 24, Python 3 and `jq`.
- Resource deployment permissions and separate directory permissions to create an owned API registration, service principal, federation and direct application-role assignments.
- A GitHub account for your fork and an Outlook test-mailbox owner who can review OAuth permissions, including administrator consent if required.

Use a new resource group and a unique prefix.
Connector activity can incur charges independently of Builder's preview offer; confirm current pricing and limits before provisioning.
The app's only mailbox effect is flagging matching messages, but the owner's actual OAuth permissions can be broader.

## 1. Prepare your fork

Fork this repository, clone **your fork**, and run from its root:

```bash
npm ci
npm test
npm run test:infra
```

These are local build, fake-service and template checks, not cloud tests.
The scoped public npm feed supplies the pinned `@azure/connectors@0.2.0-preview` SDK.
Keep the root `builder.yaml`, which compiles the app, stages production dependencies and starts port 8080.

## 2. Configure and deploy the protected app

Follow the [manual setup guide](docs/setup.md#1-provision-an-isolated-experiment) in order.
It supplies executable Azure CLI/Bicep resource/policy commands, native Builder CLI connection commands and Portal or ZIP-source deployment alternatives.
Native Connections has an explicit release prerequisite; ARM remains usable with older CLI archives.
The sequence creates three managed identities, a namespace, a **source-free** Builder app and a single-tenant receiver API.
It configures **required** customer-Entra authentication **before** attaching source or deploying.

The outbound app identity gets only its connection-scoped policy.
The namespace sender gets a separate policy and API role, while Builder allows only its exact tenant/object ID.
No application secret, Azure RBAC grant, Graph runtime permission or azd project is needed.
Application code relies on this edge gate; never expose it on an unprotected host or disable auth for callbacks.

On **Connections**, select **Connector Namespace Connection**, the existing
`outlook-test` child resource and the already assigned app UAMI. Rename the
runtime URL mapping to `OFFICE365_CONNECTION_RUNTIME_URL`. Keep
`CONNECTOR_IDENTITY_CLIENT_ID_ENV` in Variables with the generated output name
`Identity_id_bld_app_<run>_ClientId`, replacing `<run>` with this experiment's
actual suffix. This names the output; it does not store a client ID or token.
The SDK reads that selected identity's generated client ID. Remove legacy
`AZURE_CLIENT_ID` and manual runtime-URL settings before saving the complete
connection, without an intermediate deployment. The generator in the setup
guide prepares this same object and preserves callback/consent controls.
This profile requires managed identity; mailbox OAuth is owned by the external
Connector Namespace, not a Builder password or key setting.

The [Connections guide](https://builder.appservice.azure.com/docs/guides/connect-to-services/)
documents client availability and the ETag-guarded ARM contract. The
[setup guide](docs/setup.md#save-with-native-builder-cli) has concrete native
commands with a release prerequisite. Saving setup does not deploy or test a mailbox
operation; verify the same isolated callback and matching-message effect below.

## 3. Verify the callback and mailbox effect

Continue with [authentication controls](docs/setup.md#5-verify-authentication-without-mailbox-effects), then [owner-reviewed consent](docs/setup.md#6-connect-the-owner-approved-outlook-account).
Use your ordinary native browser for sign-in/MFA and permission review.
Confirm the connection is **Connected** to the intended mailbox before enabling the [two-message test](docs/setup.md#7-send-exactly-two-test-messages).

Send exactly one harmless uniquely prefixed message and one nonmatching control.
Expect callback 200 with received 1 / flagged 1, the matching email flagged and the control unchanged.
Missing or malformed credentials must return 401; the valid-role wrong-principal control must return 403.
The bounded runner disables the trigger after a result or timeout.
Keep triggers disabled outside the attended test; repeated deliveries can repeat an idempotent flag action.

## Clean up resources

Follow [exact cleanup](docs/setup.md#clean-up-resources) to disable/delete owned triggers, policies and connection, delete the isolated group, and separately delete the receiver service principal and registration.
Verify absence.
Preserve the shared Office365 enterprise application and both test messages unless their owner separately approves a change.

## Related content

- [Setup reference and safe failure checks](docs/setup.md): manual commands and recovery boundaries.
- [Upstream managed-connectors sample](https://github.com/Azure-Samples/app-service-managed-connectors/tree/49055ca720daab2d7378aeb617cdfae00c28b443): the TypeScript adaptation's source, retained under the [MIT license](LICENSE.md).
