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
  requireConfig?: boolean,
};
