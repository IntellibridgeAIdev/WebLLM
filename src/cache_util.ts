import * as tvmjs from "tvmjs";
import {
  AppConfig,
  prebuiltAppConfig,
} from "./config";

function findModelRecord(modelId: string, appConfig?: AppConfig) {
  const matchedItem = appConfig?.model_list.find(
    item => item.model_id == modelId
  );
  if (matchedItem !== undefined) {
    return matchedItem;
  }
  throw Error("Cannot find model_url for " + modelId);
}

export async function hasModelInCache(modelId: string, appConfig?: AppConfig): Promise<boolean> {
  if (appConfig === undefined) {
    appConfig = prebuiltAppConfig;
  }
  const modelRecord = await findModelRecord(modelId, appConfig);
  const modelUrl = modelRecord.model_url;
  return tvmjs.hasNDArrayInCache(modelUrl, "webllm/model");
}

export async function deleteModelAllInfoInCache(modelId: string, appConfig?: AppConfig) {
  // function to delete model all information in cache
  if (appConfig === undefined) {
    appConfig = prebuiltAppConfig;
  }
  // delete model and tokenizer in Cache
  await deleteModelInCache(modelId, appConfig);
  // delete wasm in cache
  await deleteModelWasmInCache(modelId, appConfig);
  // delete chat config 
  await deleteChatConfigInCache(modelId, appConfig);
}


export async function deleteModelInCache(modelId: string, appConfig?: AppConfig) {
  // delete the model NDArray In Cache
  if (appConfig === undefined) {
    appConfig = prebuiltAppConfig;
  }
  const modelRecord = await findModelRecord(modelId, appConfig);
  tvmjs.deleteNDArrayCache(modelRecord.model_url, "webllm/model");
  const modelCache = new tvmjs.ArtifactCache("webllm/model");
  await modelCache.deleteInCache(new URL("tokenizer.model", modelRecord.model_url).href);
  await modelCache.deleteInCache(new URL("tokenizer.json", modelRecord.model_url).href);
}

export async function deleteChatConfigInCache(modelId: string, appConfig?: AppConfig) {
  // delete the chat configuration in Cache
  if (appConfig === undefined) {
    appConfig = prebuiltAppConfig;
  }
  const modelRecord = await findModelRecord(modelId, appConfig);
  const configCache = new tvmjs.ArtifactCache("webllm/config");
  const configUrl = new URL("mlc-chat-config.json", modelRecord.model_url).href;
  await configCache.deleteInCache(configUrl);
}


export async function deleteModelWasmInCache(modelId: string, appConfig?: AppConfig) {
  // delete the wasm in Cache
  if (appConfig === undefined) {
    appConfig = prebuiltAppConfig;
  }
  const modelRecord = await findModelRecord(modelId, appConfig);
  const wasmCache = new tvmjs.ArtifactCache("webllm/wasm");
  await wasmCache.deleteInCache(modelRecord.model_lib_url);
}
