import { InjectionKey } from "vue";
import { die } from "../core/physics/utils";
import type { ISaveLoadService } from "./schema";
export const SaveLoadService$$: InjectionKey<ISaveLoadService> = Symbol();
export const saveLoadDefaultImpl: ISaveLoadService = {
  load() {
    return die("Method not implemented");
  },
  save() {
    return die("Method not implemented");
  },
};
