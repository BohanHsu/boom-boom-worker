export type OutMessageType = {
  isPlaying?: Boolean,
  ipAddress?: String,
};

export type InMessageType = {
  httpCode: Number,
  shouldPlay?: Boolean,
};
