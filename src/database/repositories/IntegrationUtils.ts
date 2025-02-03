import { GoogleIntegrationRepository } from "./GoogleIntegrationRepository"

export class IntegrationRepository {
    integrationName: string = ''
    async findByUserId(userId: number): Promise<any> {
        throw new Error('Method not implemented.')
    }
    async deleteIntegrationForUser(userId: number): Promise<any> {
        throw new Error('Method not implemented.')
    }
}

const repositories = [new GoogleIntegrationRepository()]

export async function getAllIntegrationsForUser(userId: number) {
    const integrations: { [key: string]: any } = {}
    for (const repository of repositories) {
        const integration = await repository.findByUserId(userId)
        if (integration) {
            integrations[repository.integrationName] = integration
        }
    }
    return integrations
}

export async function disconnectAllIntegrationsForUser(userId: number) {
    for (const repository of repositories) {
        await repository.deleteIntegrationForUser(userId)
    }
}