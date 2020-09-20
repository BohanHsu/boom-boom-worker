export type OutMessageType = {
  isPlaying?: boolean,
  ip?: string,
  duang?: {
    requestId: string, 
    duangPlayed: boolean, 
    rejectReason?: string
  },
  config?: string,
};

export type InMessageType = {
  httpCode: number,
  globalSwitch: boolean,
  shouldPlay?: boolean,
  duang?: string,
  mp3FilePath?: string,
  requireConfig?: boolean,
};

export type OutConfigMessageType = {
  config: string,
  availableMp3s: Array<string>,
};
