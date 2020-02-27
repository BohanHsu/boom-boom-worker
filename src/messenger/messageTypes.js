export type OutMessageType = {
  isPlaying?: boolean,
  ipAddress?: string,
};

export type InMessageType = {
  httpCode: number,
  shouldPlay?: boolean,
};
