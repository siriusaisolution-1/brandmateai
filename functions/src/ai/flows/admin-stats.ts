import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { getRemoteConfig } from 'firebase-admin/remote-config';

// ... (Initialization)

// ... (getAdminDashboardStatsFlow)

export const getRemoteConfigValuesFlow = defineFlow(
    {
        name: 'getRemoteConfigValuesFlow',
        inputSchema: z.void(),
        outputSchema: z.record(z.boolean()),
        auth: {
            policy: (auth, input) => {
                if (auth?.customClaims?.role !== 'admin') {
                    throw new Error("You must be an admin to access this resource.");
                }
            },
        },
    },
    async () => {
        const template = await remoteConfig.getTemplate();
        const configValues: Record<string, boolean> = {};

        for (const key in template.parameters) {
            const param = template.parameters[key];
            if (param.valueType === 'BOOLEAN' && param.defaultValue) {
                configValues[key] = param.defaultValue.value === 'true';
            }
        }
        return configValues;
    }
);

// ... (setRemoteConfigValueFlow)
