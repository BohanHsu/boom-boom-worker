// @flow

import type {PlayerOperatorConfig} from '../playerOperator/playerOperator';

function inPlaceMergeKeyToOldObjIfKeyExistsInNewObj(key:string, oldObj: any, newObj: any): void {
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
}

module.exports = function(oldConfig:any, newConfig:any): {[string]: PlayerOperatorConfig|any} {
  let mergedConfig = JSON.parse(JSON.stringify(oldConfig));

  inPlaceMergePlayerOperatorConfig("shouldPlay", mergedConfig, newConfig);
  inPlaceMergePlayerOperatorConfig("duang", mergedConfig, newConfig);

  return mergedConfig;
};
