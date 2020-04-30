import * as PIXI from "pixi.js";
import { Character } from "./Character";
import { TiledMap } from "../tiled";

export class Game {
  private me: Character;
  private cursor: PIXI.Sprite;
  private selection = new PIXI.Graphics();

  constructor(private app: PIXI.Application, private map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    app.stage.addChild(map);

    // Add mouse selection rect
    this.selection.beginFill(0x66000000);
    this.selection.drawRect(0, 0, map.data.tilewidth, map.data.tileheight);
    this.selection.endFill();
    this.selection.alpha = 0.3;
    (map.getChildAt(1) as PIXI.Container).addChild(this.selection);

    // Add character
    this.me = Character.new({
      baseTexture: PIXI.BaseTexture.from("texMe"),
      characterWidth: 32,
      characterHeight: 32,
      map: map,
      tileX: 13,
      tileY: 11,
    });
    (map.getChildAt(1) as PIXI.Container).addChild(this.me);

    // Add cursor
    this.cursor = PIXI.Sprite.from("texCursor");
    app.stage.addChild(this.cursor);
  }

  public update(_: number) {
    this.updateCamera();
    this.updateMouse();
  }

  private updateCamera() {
    const position = this.me.getActualPosition();
    this.app.stage.pivot.x = position.x;
    this.app.stage.pivot.y = position.y;
    this.app.stage.position.x = this.offsetX();
    this.app.stage.position.y = this.offsetY();
  }

  private updateMouse() {
    const position = this.app.renderer.plugins.interaction.mouse.global;
    const x =
      (position.x - this.offsetX()) / this.app.stage.scale.x +
      this.app.stage.pivot.x;
    const y =
      (position.y - this.offsetY()) / this.app.stage.scale.y +
      this.app.stage.pivot.y;

    // Update cursor position
    this.cursor.x = x;
    this.cursor.y = y;

    // Update selection position
    const tileX = Math.floor(x / this.map.data.tilewidth);
    const tileY = Math.floor(y / this.map.data.tileheight);
    this.selection.position.x = tileX * this.map.data.tilewidth;
    this.selection.position.y = tileY * this.map.data.tileheight;
  }

  private offsetX() {
    return this.app.renderer.width / 2 - this.map.data.tilewidth / 2;
  }

  private offsetY() {
    return this.app.renderer.height / 2 - this.map.data.tileheight / 2;
  }
}
