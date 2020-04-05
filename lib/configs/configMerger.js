function inPlaceMergeKeyToOldObjIfKeyExistsInNewObj(key, oldObj, newObj) {
  if (!newObj) {
    return;
  }

  const nVal = newObj[key];

  if (nVal !== null && nVal !== undefined) {
    oldObj[key] = nVal;
  }
}

function inPlaceMergePlayerOperatorConfig(key, oldConfig, newConfig) {
  let oldObj = oldConfig[key];

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

module.exports = function (oldConfig, newConfig) {
  let mergedConfig = JSON.parse(JSON.stringify(oldConfig));
  inPlaceMergePlayerOperatorConfig("shouldPlay", mergedConfig, newConfig);
  inPlaceMergePlayerOperatorConfig("duang", mergedConfig, newConfig);
  return mergedConfig;
};