import type { ReviewStatus } from "../../types";

export type RightsStatus = "public-domain" | "licensed" | "user-owned" | "unknown";
export type KnowledgeSourceStatus = "extracted" | "converted" | "needs-review" | "verified";

export type KnowledgeEntry = {
  id: string;
  sourceDocumentId: string;
  bookTitle: string;
  author?: string;
  edition?: string;
  volume?: string;
  chapter?: string;
  section?: string;
  pageStart: number;
  pageEnd: number;
  paragraphOrder: number;
  originalTextSimplified: string;
  textTraditional: string;
  extractionMethod: "text-layer" | "ocr";
  extractionConfidence?: number;
  conversionProfile: "opencc-s2hk";
  conversionReviewed: boolean;
  topics: string[];
  herbs: string[];
  formulas: string[];
  patterns: string[];
  sourceFileName: string;
  sourceFileHash: string;
  rightsStatus: RightsStatus;
  publishable: boolean;
  sourceStatus: KnowledgeSourceStatus;
  reviewStatus: ReviewStatus;
  importedAt: string;
  toolVersion: string;
};

export type KnowledgeDocumentManifest = {
  documentId: string;
  sourceFileName: string;
  bookTitle: string;
  author?: string;
  edition?: string;
  rightsStatus: RightsStatus;
  publishable: boolean;
  sourceFileHash?: string;
  pageCount?: number;
  textLayerPages?: number;
  needsOcrPages?: number[];
  importedAt?: string;
  toolVersion: string;
  reviewStatus: ReviewStatus;
};

export type KnowledgeSearchDocument = {
  id: string;
  bookTitle: string;
  chapter?: string;
  section?: string;
  pageStart: number;
  preview: string;
  topics: string[];
  herbs: string[];
  formulas: string[];
  patterns: string[];
  extractionMethod: "text-layer" | "ocr";
  reviewStatus: ReviewStatus;
  sourceStatus: KnowledgeSourceStatus;
  chunkPath: string;
};

export type KnowledgeCatalog = {
  schemaVersion: number;
  generatedAt: string;
  documents: Array<{
    documentId: string;
    bookTitle: string;
    chapters: string[];
    herbs: string[];
    formulas: string[];
    patterns: string[];
    entryCount: number;
    chunkPaths: string[];
  }>;
};

export const canPublishKnowledgeEntry = (entry: KnowledgeEntry) =>
  entry.publishable === true &&
  ["public-domain", "licensed", "user-owned"].includes(entry.rightsStatus) &&
  entry.reviewStatus === "approved" &&
  entry.sourceStatus !== "needs-review" &&
  !(entry.extractionMethod === "ocr" && entry.reviewStatus !== "approved");
