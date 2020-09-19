// @flow

import type {PlayerOperatorConfig} from '../playerOperator/playerOperator';

function inPlaceMergeKeyToOldObjIfKeyExistsInNewObj(key:string, oldObj: any, newObj: any): void {
  if (!newObj) {
    return;
  }

  const nVal = newObj[key];
  if (nVal !== null && nVal !== undefined) {
    oldObj[key] = nVal;
  }
}

function inPlaceMergePlayerOperatorConfig(key: string, oldConfig:any, newConfig:any): void {
  let oldObj = oldConfig[key]

  if (!oldObj) {
    oldConfig[key] = {};
  }

  let newObj = newConfig[key];

  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("mp3Files", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("pickOneMp3OtherwisePlayAll", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("infinityLoop", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("timesToPlayLowBoundary", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("timesToPlayUpBoundary", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("timeoutLowBoundaryMS", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("timeoutUpBoundaryMS", oldObj, newObj);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("volumePercentage", oldObj, newObj);
}

module.exports = function(oldConfig:any, newConfig:any): {
  [string]: PlayerOperatorConfig|any,
  restartWorkerSyncCnt?: number,
  restartWorkerScript?: string,
} {
  let mergedConfig = JSON.parse(JSON.stringify(oldConfig));

  inPlaceMergePlayerOperatorConfig("shouldPlay", mergedConfig, newConfig);
  inPlaceMergePlayerOperatorConfig("duang", mergedConfig, newConfig);

  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("shouldRestartWorker", mergedConfig, newConfig);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("restartWorkerSyncCnt", mergedConfig, newConfig);
  inPlaceMergeKeyToOldObjIfKeyExistsInNewObj("restartWorkerScript", mergedConfig, newConfig);

  return mergedConfig;
};
