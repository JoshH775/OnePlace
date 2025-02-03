import { GoogleIntegrationRepository } from "./GoogleIntegrationRepository"

const repositories = [new GoogleIntegrationRepository()]

export async function getAllIntegrationsForUser(userId: number) {
    const integrations = []
    for (const repository of repositories) {
        const integration = await repository.findByUserId(userId)
        if (integration) {
            integrations.push({ [repository.integrationName]: integration })
        }
    }
    return integrations
}

export async function disconnectAllIntegrationsForUser(userId: number) {
    for (const repository of repositories) {
        await repository.deleteIntegrationForUser(userId)
    }
}