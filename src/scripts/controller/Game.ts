import * as PIXI from "pixi.js";
import * as PF from "pathfinding";
import { Character } from "./Character";
import { TiledMap } from "../tiled";

export class Game {
  private me: Character;

  // Mouse related
  private cursor: PIXI.Sprite;
  private hover: PIXI.Graphics;
  private selection: PIXI.Graphics;

  // Path finding related
  private pfGrid: PF.Grid;
  private pf = new PF.AStarFinder();

  constructor(private app: PIXI.Application, private map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    // Add map
    this.pfGrid =
      map.collisionLayer?.getPFGrid() ?? new PF.Grid(map.width, map.height);
    app.stage.addChild(map);

    const layer1 = map.getChildAt(1) as PIXI.Container;

    // Add mouse related rectangles
    this.hover = new PIXI.Graphics();
    this.hover.beginFill(0xff000000);
    this.hover.drawRoundedRect(
      0,
      0,
      map.data.tilewidth,
      map.data.tileheight,
      4
    );
    this.hover.endFill();
    this.hover.alpha = 0.2;
    layer1.addChild(this.hover);

    this.selection = this.hover.clone();
    this.selection.alpha = 0.2;
    this.selection.visible = false;
    layer1.addChild(this.selection);

    // Add character
    this.me = Character.new({
      baseTexture: PIXI.BaseTexture.from("texMe"),
      characterWidth: 32,
      characterHeight: 32,
      map: map,
      tilePosition: new PIXI.Point(13, 11),
    });
    layer1.addChild(this.me);

    // Add cursor
    this.cursor = PIXI.Sprite.from("texCursor");
    app.stage.addChild(this.cursor);

    // Interactions
    map.interactive = true;
    map.on("pointertap", (event: PIXI.interaction.InteractionEvent) => {
      const { tileX, tileY } = this.getMousePosition(event.data);

      if (this.pfGrid.isWalkableAt(tileX, tileY)) {
        // Update selection position
        this.selection.position.x = tileX * this.map.data.tilewidth;
        this.selection.position.y = tileY * this.map.data.tileheight;

        // Find path to click position
        const path = this.pf
          .findPath(
            this.me.nextTilePos.x,
            this.me.nextTilePos.y,
            tileX,
            tileY,
            this.pfGrid.clone()
          )
          .slice(1) as [number, number][];
        this.me.setMovementPath(path);
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

    // Update hover visibility and position
    if (!this.me.playing && this.pfGrid.isWalkableAt(tileX, tileY)) {
      this.hover.visible = true;
      this.hover.position.x = tileX * this.map.data.tilewidth;
      this.hover.position.y = tileY * this.map.data.tileheight;
    } else {
      this.hover.visible = false;
    }

    // Update selection visibility
    this.selection.visible = this.me.playing;
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
