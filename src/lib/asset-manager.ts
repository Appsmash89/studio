// src/lib/asset-manager.ts
'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'SpinRichesAssets';
const STORE_NAME = 'assets';
const DB_VERSION = 1;
const VERSION_KEY = 'asset_manifest_version';

interface AssetManifest {
    version: string;
    baseUrl: string;
    assets: { key: string; path: string }[];
}

class AssetManager {
    private dbPromise: Promise<IDBPDatabase>;

    constructor() {
        this.dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }

    /**
     * Initializes the asset manager. Fetches the asset manifest, checks for cache validity,
     * and downloads any missing assets from the CDN.
     * @param manifestUrl - The URL to the asset manifest JSON file.
     * @param onProgress - Optional callback to report download progress.
     */
    public async init(manifestUrl: string, onProgress?: (progress: number) => void): Promise<void> {
        console.log("AssetManager: Initializing...");
        const db = await this.dbPromise;
        
        try {
            const response = await fetch(manifestUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch asset manifest at ${manifestUrl}`);
            const manifest: AssetManifest = await response.json();
            
            const storedVersion = await db.get(STORE_NAME, VERSION_KEY);
            
            if (storedVersion === manifest.version) {
                console.log("AssetManager: Cache is up to date.");
                onProgress?.(100);
                return;
            }

            console.log(`AssetManager: New version found (Old: ${storedVersion}, New: ${manifest.version}). Updating cache.`);
            await this.clearCache(); // Clear old assets if version mismatch

            const totalAssets = manifest.assets.length;
            let downloadedCount = 0;

            for (const asset of manifest.assets) {
                const assetUrl = `${manifest.baseUrl}${asset.path}`;
                try {
                    const assetResponse = await fetch(assetUrl);
                    if (!assetResponse.ok) throw new Error(`Failed to download ${asset.path}`);
                    
                    const blob = await assetResponse.blob();
                    await db.put(STORE_NAME, blob, asset.key);
                    
                    downloadedCount++;
                    onProgress?.(Math.round((downloadedCount / totalAssets) * 100));

                } catch (error) {
                    console.error(`AssetManager: Failed to download or cache asset '${asset.key}' from ${assetUrl}`, error);
                    // Continue trying to download other assets
                }
            }
            
            await db.put(STORE_NAME, manifest.version, VERSION_KEY);
            console.log("AssetManager: Initialization and caching complete.");

        } catch (error) {
            console.error("AssetManager: A critical error occurred during initialization.", error);
            throw error; // Re-throw to be caught by the UI
        }
    }

    /**
     * Retrieves an asset from the cache.
     * @param key - The key of the asset to retrieve (e.g., 'background', 'chip-1').
     * @returns A promise that resolves to an object URL for the asset, or null if not found.
     */
    public async get(key: string): Promise<string | null> {
        const db = await this.dbPromise;
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
        const db = await this.dbPromise;
        await db.clear(STORE_NAME);
        console.log("AssetManager: Cache cleared.");
    }
}

// Export a singleton instance of the AssetManager
export const assetManager = new AssetManager();
