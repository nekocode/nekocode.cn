import * as PIXI from "pixi.js";
import { ILayerData } from "./types/interfaces";

export class ImageLayer extends PIXI.Container {
  constructor(public data: ILayerData, route: string) {
    super();

    this.visible = data.visible;
    this.alpha = data.opacity;

    if (data.image) {
      const image = PIXI.Sprite.from(route + "/" + data.image, {
        scaleMode: PIXI.SCALE_MODES.NEAREST,
      });
      this.addChild(image);
    }
  }
}
