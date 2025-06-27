// src/lib/asset-manager.ts
'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'SpinRichesAssets';
const STORE_NAME = 'assets';
const DB_VERSION = 1;
const VERSION_KEY = 'asset_manifest_version';

interface Asset {
    key: string;
    path: string;
    critical?: boolean;
}

interface AssetManifest {
    version: string;
    baseUrl: string;
    assets: Asset[];
}

class AssetManager {
    private dbPromise: Promise<IDBPDatabase> | null = null;
    private manifest: AssetManifest | null = null;

    constructor() {
        // Constructor is empty and safe to call on the server.
    }

    private getDb(): Promise<IDBPDatabase> {
        if (this.dbPromise) {
            return this.dbPromise;
        }

        if (typeof window !== 'undefined') {
            this.dbPromise = openDB(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                    }
                },
            });
            return this.dbPromise;
        }

        return Promise.reject(new Error("Cannot access IndexedDB on the server."));
    }

    /**
     * Fetches the manifest, checks version, and downloads all assets.
     * @param manifestUrl - The URL to the asset manifest JSON file.
     * @param onProgress - Optional callback for download progress.
     * @returns A promise that resolves to true if this was a fresh download, false otherwise.
     */
    public async init(manifestUrl: string, onProgress?: (progress: number) => void): Promise<boolean> {
        console.log("AssetManager: Initializing and loading all assets...");
        let isFreshLoad = false;
        
        try {
            const response = await fetch(manifestUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch asset manifest at ${manifestUrl}`);
            const manifest: AssetManifest = await response.json();
            this.manifest = manifest;
            
            const db = await this.getDb();
            const storedVersion = await db.get(STORE_NAME, VERSION_KEY);
            
            if (storedVersion !== manifest.version) {
                isFreshLoad = true;
                console.log(`AssetManager: New version found (Old: ${storedVersion}, New: ${manifest.version}). Clearing cache.`);
                await this.clearCache();
                await db.put(STORE_NAME, manifest.version, VERSION_KEY);
            }

            await this.downloadAssets(manifest.assets, onProgress);
            
            console.log("AssetManager: All assets are downloaded and ready.");
            return isFreshLoad;

        } catch (error) {
            console.error("AssetManager: A critical error occurred during initialization.", error);
            throw error;
        }
    }

    /**
     * Downloads a specific list of assets and stores them in the cache.
     * @param assets - An array of asset objects to download.
     * @param onProgress - Optional callback to report download progress.
     */
    public async downloadAssets(assets: Asset[], onProgress?: (progress: number) => void): Promise<void> {
        if (!this.manifest) {
            throw new Error("Asset manifest is not loaded. Call init() first.");
        }
        if (!assets.length) {
            onProgress?.(100);
            return;
        }

        const db = await this.getDb();
        const totalAssets = assets.length;
        let downloadedCount = 0;

        const assetsToDownload: Asset[] = [];
        
        for (const asset of assets) {
            const existing = await db.get(STORE_NAME, asset.key);
            if (!existing) {
                assetsToDownload.push(asset);
            }
        }
        
        downloadedCount = assets.length - assetsToDownload.length;
        
        onProgress?.(Math.round((downloadedCount / totalAssets) * 100));

        await Promise.all(assetsToDownload.map(async (asset) => {
            const assetUrl = `${this.manifest!.baseUrl}${asset.path}`;
            try {
                const assetResponse = await fetch(assetUrl);
                if (!assetResponse.ok) throw new Error(`Failed to download ${asset.path}`);
                
                const blob = await assetResponse.blob();
                await db.put(STORE_NAME, blob, asset.key);
                
                downloadedCount++;
                onProgress?.(Math.round((downloadedCount / totalAssets) * 100));

            } catch (error) {
                console.error(`AssetManager: Failed to download or cache asset '${asset.key}' from ${assetUrl}`, error);
            }
        }));
    }
    
    /**
     * Retrieves all currently cached assets as a map of key to object URL.
     * @returns A promise that resolves to a record of asset keys and their corresponding object URLs.
     */
    public async getAllCachedUrls(): Promise<Record<string, string>> {
        const db = await this.getDb();
        const keys = await db.getAllKeys(STORE_NAME);
        const urls: Record<string, string> = {};

        for (const key of keys) {
            if (key === VERSION_KEY) continue;
            const url = await this.get(key as string);
            if (url) {
                urls[key as string] = url;
            }
        }
        return urls;
    }

    /**
     * Retrieves a single asset from the cache.
     * @param key - The key of the asset to retrieve.
     * @returns A promise that resolves to an object URL for the asset, or null if not found.
     */
    public async get(key: string): Promise<string | null> {
        const db = await this.getDb();
        const blob = await db.get(STORE_NAME, key);

        if (blob instanceof Blob) {
            return URL.createObjectURL(blob);
        }
        
        return null;
    }

    /**
     * Clears the entire asset cache from IndexedDB.
     */
    public async clearCache(): Promise<void> {
        console.log("AssetManager: Clearing cache...");
        const db = await this.getDb();
        await db.clear(STORE_NAME);
        console.log("AssetManager: Cache cleared.");
    }
}

export const assetManager = new AssetManager();
