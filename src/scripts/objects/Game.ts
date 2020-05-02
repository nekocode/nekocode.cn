import * as PIXI from "pixi.js";
import * as PF from "pathfinding";
import { Character } from "./Character";
import { TiledMap, TileLayer } from "../tiled";

export class Game {
  private root: PIXI.Container;
  private me: Character;
  private bubbleLayer: TileLayer;

  // Mouse related
  private cursor: PIXI.Sprite;
  private hover: PIXI.Graphics;
  private selection: PIXI.Graphics;

  // Path finding related
  private pfGrid: PF.Grid;
  private pf = new PF.AStarFinder();

  constructor(private app: PIXI.Application, private map: TiledMap) {
    app.ticker.add((delta) => this.update(delta));

    // Create a root container
    this.root = new PIXI.Container();
    app.stage.addChild(this.root);

    // Add map
    this.pfGrid =
      map.collisionLayer?.getPFGrid() ?? new PF.Grid(map.width, map.height);
    this.root.addChild(map);

    const layer1 = map.getChildAt(1) as PIXI.Container;
    this.bubbleLayer = map.layers["Bubbles"] as TileLayer;
    // Hide all bubbles
    this.bubbleLayer.getTiles().forEach((tile) => {
      tile.visible = false;
    });

    // Add mouse related objects
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
      const pos = this.positionInRoot(this.getMousePosition(event.data));
      const { tileX, tileY } = this.toTilePosition(pos);

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
    map.on("pointermove", (event: PIXI.interaction.InteractionEvent) => {
      const pos = this.positionInRoot(this.getMousePosition(event.data));
      const { tileX, tileY } = this.toTilePosition(pos);

      // Update visibility and position of hover
      if (this.pfGrid.isWalkableAt(tileX, tileY)) {
        this.hover.visible = true;
        this.hover.position.x = tileX * this.map.data.tilewidth;
        this.hover.position.y = tileY * this.map.data.tileheight;
      } else {
        this.hover.visible = false;
      }
    });
  }

  public update(_: number) {
    this.updateCamera();
    this.updateMouse();
    this.updateBubbles();
  }

  private updateCamera() {
    const pos = this.me.getActualPosition();
    this.root.pivot.x = pos.x;
    this.root.pivot.y = pos.y;
    this.root.position.x = this.screenWidth() / 2 - this.map.data.tilewidth / 2;
    this.root.position.y =
      this.screenHeight() / 2 - this.map.data.tileheight / 2;
  }

  private updateMouse() {
    const mousePos = this.getMousePosition();

    // Update cursor position
    this.cursor.x = mousePos.x;
    this.cursor.y = mousePos.y;

    // Hide hover if me is walking
    if (this.me.playing) {
      this.hover.visible = false;
    }

    // Update selection visibility
    this.selection.visible = this.me.playing;
  }

  private updateBubbles() {
    if (this.me.playing) {
      // Hide all bubbles
      this.bubbleLayer.getTiles().forEach((tile) => {
        tile.visible = false;
      });
      return;
    }

    const { x, y } = this.me.nextTilePos;
    const leftTile = this.bubbleLayer.getTile(x - 1, y);
    if (leftTile) {
      leftTile.visible = true;
    }
    const rightTile = this.bubbleLayer.getTile(x + 1, y);
    if (rightTile) {
      rightTile.visible = true;
    }
    const upTile = this.bubbleLayer.getTile(x, y - 1);
    if (upTile) {
      upTile.visible = true;
    }
    const downTile = this.bubbleLayer.getTile(x, y + 1);
    if (downTile) {
      downTile.visible = true;
    }
  }

  private screenWidth() {
    return this.app.renderer.width / this.app.stage.scale.x;
  }

  private screenHeight() {
    return this.app.renderer.height / this.app.stage.scale.y;
  }

  private getMousePosition(data?: PIXI.interaction.InteractionData) {
    const { x, y } = (
      data ?? this.app.renderer.plugins.interaction.mouse
    ).global;
    return new PIXI.Point(
      x / this.app.stage.scale.x,
      y / this.app.stage.scale.y
    );
  }

  private positionInRoot(pos: PIXI.Point) {
    const xInRoot = pos.x - this.root.position.x + this.root.pivot.x;
    const yInRoot = pos.y - this.root.position.y + this.root.pivot.y;
    return new PIXI.Point(xInRoot, yInRoot);
  }

  private toTilePosition(pos: PIXI.Point) {
    const tileX = Math.floor(pos.x / this.map.data.tilewidth);
    const tileY = Math.floor(pos.y / this.map.data.tileheight);
    return { tileX, tileY };
  }
}
