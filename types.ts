export interface ImageItem {
  id: string;
  url: string;
  isUserUploaded?: boolean;
  isGenerated?: boolean;
}

export interface HistoryItem {
  id: string;
  personUrl: string;
  clothUrl: string;
  resultUrl: string;
  timestamp: number;
}

export enum AppStep {
  SELECT_PERSON = 1,
  SELECT_CLOTH = 2,
  RESULT = 3
}