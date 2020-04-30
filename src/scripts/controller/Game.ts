import * as PIXI from "pixi.js";
import { Character } from "./Character";
import { TiledMap } from "../tiled";

export class Game {
  private me: Character;

  constructor(private app: PIXI.Application, map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    app.stage.addChild(map);

    // Add character to frist layer of map
    this.me = Character.new({
      baseTexture: PIXI.BaseTexture.from("texMe"),
      characterWidth: 32,
      characterHeight: 32,
      map: map,
      tileX: 13,
      tileY: 11,
    });
    (map.getChildAt(0) as PIXI.Container).addChild(this.me);
  }

  public update(_: number) {
    this.updateCamera();
  }

  private updateCamera() {
    const position = this.me.getActualPosition();
    this.app.stage.pivot.x = position.x;
    this.app.stage.pivot.y = position.y;
    this.app.stage.position.x = this.app.renderer.width / 2;
    this.app.stage.position.y = this.app.renderer.height / 2;
  }
}
