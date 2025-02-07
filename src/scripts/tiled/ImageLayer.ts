import { Container, Texture, Assets, Sprite } from "pixi.js";
import { ILayerData } from "./types/interfaces";

export class ImageLayer extends Container {
  public static async from(data: ILayerData) {
    let image: Texture | undefined;
    if (data.image) {
      image = await Assets.load(data.image);
    }
    return new ImageLayer(data, image);
  }

  private constructor(public data: ILayerData, image?: Texture) {
    super();

    this.visible = data.visible;
    this.alpha = data.opacity;
    if (image) {
      this.addChild(Sprite.from(image));
    }
  }
}
