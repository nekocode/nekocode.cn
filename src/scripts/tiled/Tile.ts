import * as PIXI from "pixi.js";
import { TileSet } from "./TileSet";

export class Tile extends PIXI.AnimatedSprite {
  constructor(
    public id: number,
    public gid: number,
    public tileSet: TileSet,
    private frames: PIXI.AnimatedSprite.FrameObject[],
    public horizontalFlip: boolean = false,
    public verticalFlip: boolean = false,
    public diagonalFlip: boolean = false
  ) {
    super(frames);
    this.flip();
  }

  public clone(args: {
    horizontalFlip?: boolean;
    verticalFlip?: boolean;
    diagonalFlip?: boolean;
  }): Tile {
    return new Tile(
      this.id,
      this.gid,
      this.tileSet,
      this.frames,
      args.horizontalFlip ?? this.horizontalFlip,
      args.verticalFlip ?? this.verticalFlip,
      args.diagonalFlip ?? this.diagonalFlip
    );
  }

  private flip() {
    if (this.horizontalFlip) {
      this.anchor.x = 1;
      this.scale.x = -1;
    }

    if (this.verticalFlip) {
      this.anchor.y = 1;
      this.scale.y = -1;
    }

    if (this.diagonalFlip) {
      if (this.horizontalFlip) {
        this.anchor.x = 0;
        this.scale.x = 1;
        this.anchor.y = 1;
        this.scale.y = 1;

        this.rotation = PIXI.DEG_TO_RAD * 90;
      }
      if (this.verticalFlip) {
        this.anchor.x = 1;
        this.scale.x = 1;
        this.anchor.y = 0;
        this.scale.y = 1;

        this.rotation = PIXI.DEG_TO_RAD * -90;
      }
    }
  }
}
