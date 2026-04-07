import { appiumOptions } from "./src/config/appium";
import { assertInternetConnection } from "./src/utils/network";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

type TestomatioClientInstance = {
    createRun: () => Promise<void>;
    addTestRun: (status?: string, testData?: unknown) => Promise<unknown>;
};

const { TestomatioClient } = require("@testomatio/reporter") as {
    TestomatioClient: new (params: {
        apiKey: string;
        runId: string;
        isBatchEnabled: boolean;
    }) => TestomatioClientInstance;
};

const testomatioReporter: [string, Record<string, unknown>] | null = process.env.TESTOMATIO
    ? ['@testomatio/reporter/wdio', { apiKey: process.env.TESTOMATIO }]
  : null;

let testomatioClientPromise: Promise<TestomatioClientInstance> | null = null;
let s3Folder: string | null = null;

const getS3Folder = (): string => {
    if (!s3Folder) {
        const gmt7 = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timestamp = Date.now();
        s3Folder = `${gmt7.getUTCFullYear()}${pad(gmt7.getUTCMonth() + 1)}${pad(gmt7.getUTCDate())}_${pad(gmt7.getUTCHours())}${pad(gmt7.getUTCMinutes())}${pad(gmt7.getUTCSeconds())}_${timestamp}`;
    }
    return s3Folder;
};

const sanitizeFileName = (value: string): string =>
    value.replace(/[^a-zA-Z0-9.-]+/g, "_").replace(/^_+|_+$/g, "");

const getTestRid = (testTitle: string): string =>
    createHash('md5').update(testTitle).digest('hex');

const getTestomatioClient = async (): Promise<TestomatioClientInstance | null> => {
    const apiKey = process.env.TESTOMATIO;
    const runId = process.env.TESTOMATIO_RUN;

    if (!apiKey || !runId) {
        return null;
    }

    if (!testomatioClientPromise) {
        testomatioClientPromise = (async () => {
            const client = new TestomatioClient({ apiKey, runId, isBatchEnabled: false });
            await client.createRun();

            // Replace Testomat run UUID folder with a yyyymmdd_hhmmss timestamp folder
            const folder = getS3Folder();
            const uploader = (client as unknown as { uploader: { uploadFileByPath: (f: string, p: string[]) => Promise<unknown> } }).uploader;
            const originalUpload = uploader.uploadFileByPath.bind(uploader);
            uploader.uploadFileByPath = (filePath: string, pathInS3: string[]) =>
                originalUpload(filePath, [folder, ...pathInS3.slice(1)]);

            return client;
        })();
    }

    return testomatioClientPromise;
};

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
    reporters: [
        'spec',
        ['junit', {
            outputDir: './reports/junit',
            outputFileFormat: (options: { cid: string }) => `wdio-${options.cid}.xml`
        }],
        ...(testomatioReporter ? [testomatioReporter] : []),
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000
    },
    before: async function () {
        await assertInternetConnection();
    },
    afterTest: async function (test, _context, result) {
        if (result.passed) return;

        const screenshotsDir = join(process.cwd(), 'reports', 'screenshots');
        mkdirSync(screenshotsDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const title = sanitizeFileName(test.fullTitle || test.title || 'test');
        const fileName = `${timestamp}-failed-${title}.png`;
        const screenshotPath = join(screenshotsDir, fileName);

        await browser.saveScreenshot(screenshotPath);

        if (process.env.TESTOMATIO) {
            const testTitle = test.fullTitle || test.title || 'test';
            const client = await getTestomatioClient();

            if (client) {
                await client.addTestRun(undefined, {
                    rid: getTestRid(testTitle),
                    files: [screenshotPath],
                });
            }
        }
    },
}
