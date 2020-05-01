import * as PIXI from "pixi.js";
import * as PF from "pathfinding";
import { Character } from "./Character";
import { TiledMap } from "../tiled";

export class Game {
  private me: Character;
  private cursor: PIXI.Sprite;
  private selection = new PIXI.Graphics();

  // Path finding related
  private pfGrid: PF.Grid;
  private pf = new PF.AStarFinder();

  constructor(private app: PIXI.Application, private map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    // Add map
    this.pfGrid =
      map.collisionLayer?.getPFGrid() ?? new PF.Grid(map.width, map.height);
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
    map.on("pointertap", (event: PIXI.interaction.InteractionEvent) => {
      const { tileX, tileY } = this.getMousePosition(event.data);

      if (this.pfGrid.isWalkableAt(tileX, tileY)) {
        // Find path to click position
        const path = this.pf.findPath(
          this.me.tilePosition.x,
          this.me.tilePosition.y,
          tileX,
          tileY,
          this.pfGrid.clone()
        );
        this.me.movementPath = path as [number, number][];
      }
    });
  }

  public update(_: number) {
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
    if (this.pfGrid.isWalkableAt(tileX, tileY)) {
      this.selection.visible = true;
      this.selection.position.x = tileX * this.map.data.tilewidth;
      this.selection.position.y = tileY * this.map.data.tileheight;
    } else {
      this.selection.visible = false;
    }
  }

  private offsetX() {
    return this.app.renderer.width / 2 - this.map.data.tilewidth / 2;
  }

  private offsetY() {
    return this.app.renderer.height / 2 - this.map.data.tileheight / 2;
  }

  private getMousePosition(
    data?: PIXI.interaction.InteractionData
  ): {
    x: number;
    y: number;
    tileX: number;
    tileY: number;
  } {
    const pos = (data ?? this.app.renderer.plugins.interaction.mouse).global;
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
