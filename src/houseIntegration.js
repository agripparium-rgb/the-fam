const HOUSE_BRAND_COLORS = {
  ember: "#C0392B",
  tide: "#2471A3",
  grove: "#1E8449",
  dawn: "#F39C12",
};

function normalizeHouseName(houseName) {
  if (!houseName || typeof houseName !== "string") {
    throw new TypeError("houseName must be a non-empty string");
  }

  const normalized = houseName.trim().replace(/\s+/g, " ");
  if (!normalized) {
    throw new TypeError("houseName must be a non-empty string");
  }

  return normalized;
}

function houseKey(houseName) {
  return normalizeHouseName(houseName).toLowerCase();
}

function createHouseBrandingMark(houseName) {
  const normalized = normalizeHouseName(houseName);
  const key = houseKey(normalized);
  const monogram = normalized
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 3)
    .join("");

  return {
    houseName: normalized,
    houseKey: key,
    monogram,
    color: HOUSE_BRAND_COLORS[key] || "#2C3E50",
    badgeText: `HOUSE-${monogram || "UNK"}`,
  };
}

function transformWorkbookRecord(record) {
  if (!record || typeof record !== "object") {
    throw new TypeError("record must be an object");
  }

  const branding = createHouseBrandingMark(record.houseName);

  return {
    ...record,
    houseName: branding.houseName,
    houseKey: branding.houseKey,
    branding,
    updatedAt: new Date().toISOString(),
  };
}

function transformWorkbookRows(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError("rows must be an array");
  }

  return rows.map(transformWorkbookRecord);
}

async function writeRowsInChunks({ firestore, collectionName, rows, chunkSize = 200 }) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new TypeError("chunkSize must be a positive integer");
  }

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await Promise.all(
      chunk.map((row) =>
        firestore.collection(collectionName).doc(row.houseKey).set(row, { merge: true }),
      ),
    );
  }
}

async function writeRowsWithBatches({
  firestore,
  collectionName,
  rows,
  batchSize = 500,
}) {
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new TypeError("batchSize must be a positive integer");
  }

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = firestore.batch();
    const chunk = rows.slice(index, index + batchSize);
    chunk.forEach((row) => {
      const docRef = firestore.collection(collectionName).doc(row.houseKey);
      batch.set(docRef, row, { merge: true });
    });
    await batch.commit();
  }
}

async function upsertHouseRecord({ firestore, collectionName = "houses", record }) {
  if (!firestore || typeof firestore.collection !== "function") {
    throw new TypeError("firestore must expose a collection(name) function");
  }

  const transformed = transformWorkbookRecord(record);
  const docRef = firestore.collection(collectionName).doc(transformed.houseKey);

  await docRef.set(transformed, { merge: true });
  return transformed;
}

async function syncWorkbookToFirestore({
  firestore,
  collectionName = "houses",
  rows = [],
}) {
  if (!firestore || typeof firestore.collection !== "function") {
    throw new TypeError("firestore must expose a collection(name) function");
  }

  const transformedRows = transformWorkbookRows(rows);
  const seenKeys = new Set();
  for (const row of transformedRows) {
    if (seenKeys.has(row.houseKey)) {
      throw new Error(`Duplicate houseKey found in workbook rows: ${row.houseKey}`);
    }
    seenKeys.add(row.houseKey);
  }

  if (typeof firestore.batch === "function") {
    await writeRowsWithBatches({
      firestore,
      collectionName,
      rows: transformedRows,
    });
  } else {
    await writeRowsInChunks({ firestore, collectionName, rows: transformedRows });
  }

  return transformedRows.length;
}

module.exports = {
  HOUSE_BRAND_COLORS,
  normalizeHouseName,
  createHouseBrandingMark,
  transformWorkbookRecord,
  transformWorkbookRows,
  writeRowsInChunks,
  writeRowsWithBatches,
  upsertHouseRecord,
  syncWorkbookToFirestore,
};
