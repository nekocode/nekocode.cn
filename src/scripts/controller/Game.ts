import * as PIXI from "pixi.js";
import { Character } from "./Character";
import { TiledMap } from "../tiled";

export class Game {
  private me: Character;
  private cursor: PIXI.Sprite;
  private selection = new PIXI.Graphics();

  constructor(private app: PIXI.Application, private map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    // Add map
    app.stage.addChild(map);

    // Add mouse selection rect
    this.selection.beginFill(0xff000000);
    this.selection.drawRoundedRect(
      0,
      0,
      map.data.tilewidth,
      map.data.tileheight,
      4
    );
    this.selection.endFill();
    this.selection.alpha = 0.3;
    (map.getChildAt(1) as PIXI.Container).addChild(this.selection);

    // Add character
    this.me = Character.new({
      baseTexture: PIXI.BaseTexture.from("texMe"),
      characterWidth: 32,
      characterHeight: 32,
      map: map,
      tilePosition: new PIXI.Point(13, 11),
    });
    (map.getChildAt(1) as PIXI.Container).addChild(this.me);

    // Add cursor
    this.cursor = PIXI.Sprite.from("texCursor");
    app.stage.addChild(this.cursor);

    // Interactions
    map.interactive = true;
    map.on("pointerdown", () => {
      const { tileX, tileY } = this.getMousePosition();
      this.me.targetTilePosition.x = tileX;
      this.me.targetTilePosition.y = tileY;
    });
  }

  public update(_: number) {
    this.me.update();
    this.updateCamera();
    this.updateMouse();
  }

  private updateCamera() {
    const pos = this.me.getActualPosition();
    this.app.stage.pivot.x = pos.x;
    this.app.stage.pivot.y = pos.y;
    this.app.stage.position.x = this.offsetX();
    this.app.stage.position.y = this.offsetY();
  }

  private updateMouse() {
    const { x, y, tileX, tileY } = this.getMousePosition();

    // Update cursor position
    this.cursor.x = x;
    this.cursor.y = y;

    // Update selection position
    this.selection.position.x = tileX * this.map.data.tilewidth;
    this.selection.position.y = tileY * this.map.data.tileheight;
  }

  private offsetX() {
    return this.app.renderer.width / 2 - this.map.data.tilewidth / 2;
  }

  private offsetY() {
    return this.app.renderer.height / 2 - this.map.data.tileheight / 2;
  }

  private getMousePosition(): {
    x: number;
    y: number;
    tileX: number;
    tileY: number;
  } {
    const pos = this.app.renderer.plugins.interaction.mouse.global;
    const x =
      (pos.x - this.offsetX()) / this.app.stage.scale.x +
      this.app.stage.pivot.x;
    const y =
      (pos.y - this.offsetY()) / this.app.stage.scale.y +
      this.app.stage.pivot.y;
    const tileX = Math.floor(x / this.map.data.tilewidth);
    const tileY = Math.floor(y / this.map.data.tileheight);
    return { x, y, tileX, tileY };
  }
}
