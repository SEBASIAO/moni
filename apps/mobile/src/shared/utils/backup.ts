import { Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { pick, types } from '@react-native-documents/picker';

const DB_NAME = 'watermelon.db';

/** Staging path for a pending restore — checked at app startup. */
const PENDING_RESTORE_PATH = `${RNFS.CachesDirectoryPath}/moni-pending-restore.db`;

/**
 * Returns the expected DB path where WatermelonDB stores its file.
 */
function getExpectedDbPath(): string {
  const appDir = `${RNFS.DocumentDirectoryPath}/..`;
  if (Platform.OS === 'android') {
    return `${appDir}/${DB_NAME}`;
  }
  return `${RNFS.LibraryDirectoryPath}/${DB_NAME}`;
}

/**
 * Returns the actual DB path by checking known locations.
 * Falls back to the expected path if none found (first launch).
 */
async function getDbPath(): Promise<string> {
  const candidates: string[] = [];
  const appDir = `${RNFS.DocumentDirectoryPath}/..`;

  if (Platform.OS === 'android') {
    candidates.push(
      `${appDir}/${DB_NAME}`,
      `${appDir}/watermelon`,
      `${appDir}/databases/${DB_NAME}`,
      `${appDir}/databases/watermelon`,
    );
  } else {
    candidates.push(
      `${RNFS.LibraryDirectoryPath}/${DB_NAME}`,
      `${RNFS.LibraryDirectoryPath}/watermelon`,
      `${RNFS.DocumentDirectoryPath}/${DB_NAME}`,
      `${RNFS.DocumentDirectoryPath}/watermelon`,
    );
  }

  for (const path of candidates) {
    if (await RNFS.exists(path)) {
      return path;
    }
  }

  // Not found — return expected path (for first-launch or fresh install)
  return getExpectedDbPath();
}

function backupFileName(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `moni-backup-${date}.db`;
}

export interface ExportResult {
  fileName: string;
}

/**
 * Copies the SQLite file to Downloads (Android) or opens the share sheet (iOS).
 */
export async function exportBackup(): Promise<ExportResult> {
  const dbPath = await getDbPath();
  const fileName = backupFileName();

  if (Platform.OS === 'android') {
    const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    await RNFS.copyFile(dbPath, destPath);
    return { fileName };
  } else {
    const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await RNFS.copyFile(dbPath, destPath);
    await Share.share({ url: `file://${destPath}` });
    return { fileName };
  }
}

/**
 * Lets the user pick a backup file and stages it for restore.
 * The actual restore happens on next app launch via applyPendingRestore().
 */
export async function stageRestore(): Promise<void> {
  const [result] = await pick({
    type: [types.allFiles],
  });

  if (result == null) {
    throw new Error('No file selected');
  }

  if (await RNFS.exists(PENDING_RESTORE_PATH)) {
    await RNFS.unlink(PENDING_RESTORE_PATH);
  }

  try {
    await RNFS.copyFile(result.uri, PENDING_RESTORE_PATH);
  } catch {
    throw new Error('Could not read selected file');
  }

  // Validate SQLite magic bytes (use readFile — RNFS.read integer args crash on iOS New Arch)
  const content = await RNFS.readFile(PENDING_RESTORE_PATH, 'ascii');
  if (!content.startsWith('SQLite format')) {
    await RNFS.unlink(PENDING_RESTORE_PATH);
    throw new Error('Invalid backup file');
  }
}

/**
 * Applies a pending restore BEFORE WatermelonDB opens the database.
 * Called by initDatabase() at app startup.
 */
export async function applyPendingRestore(): Promise<boolean> {
  const hasPending = await RNFS.exists(PENDING_RESTORE_PATH);
  if (!hasPending) {
    return false;
  }

  const dbPath = await getDbPath();

  // Delete the live DB + WAL/SHM/journal files
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    const filePath = `${dbPath}${suffix}`;
    if (await RNFS.exists(filePath)) {
      await RNFS.unlink(filePath);
    }
  }

  // Move the staged backup into place
  await RNFS.moveFile(PENDING_RESTORE_PATH, dbPath);

  // Mark onboarding as complete — the restored DB has full data
  await AsyncStorage.setItem(
    'moni-onboarding',
    JSON.stringify({ state: { isOnboarded: true }, version: 0 }),
  );

  return true;
}
