import { appiumOptions } from "./src/config/appium";

export const config: WebdriverIO.Config = {
    runner: 'local',
    specs: [
        './tests/**/*.spec.ts'
    ],
    maxInstances: 1,
    capabilities: [appiumOptions.capabilities],
    hostname: appiumOptions.hostname,
    port: appiumOptions.port,
    path: appiumOptions.path,
    logLevel: 'info',
    bail: 0,
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000
    },
}
