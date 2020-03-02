export type OutMessageType = {
  isPlaying?: boolean,
  ipAddress?: string,
  duang?: {
    requestId: string, 
    duangPlayed: boolean, 
    rejectReason?: string},
};

export type InMessageType = {
  httpCode: number,
  globalSwitch: boolean,
  shouldPlay?: boolean,
  duang?: string,
};
