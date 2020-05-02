import * as PIXI from "pixi.js";
import { ITileSetData } from "./types/interfaces";
import { Tile } from "./Tile";

export class TileSet {
  private baseTexture: PIXI.BaseTexture;
  private tiles: Tile[];

  constructor(public data: ITileSetData, route: string) {
    this.baseTexture = PIXI.BaseTexture.from(route + "/" + data.image);
    this.tiles = [];

    // Split to tile textures
    const margin = data.margin ?? 0;
    const spacing = data.spacing ?? 0;
    const textures: PIXI.Texture[] = [];
    for (let y = margin; y < data.imageheight; y += data.tileheight + spacing) {
      for (let x = margin; x < data.imagewidth; x += data.tilewidth + spacing) {
        const rect = new PIXI.Rectangle(x, y, data.tilewidth, data.tileheight);
        textures.push(new PIXI.Texture(this.baseTexture, rect));
      }
    }

    // Transform to tile objects/sprites
    for (let id = 0; id < textures.length; id++) {
      const frames: PIXI.AnimatedSprite.FrameObject[] = [];
      const animation = data.tiles?.find((tile) => tile.id === id)?.animation;
      if (animation != null && animation.length > 0) {
        for (const frame of animation) {
          frames.push({
            texture: textures[frame.tileid],
            time: frame.duration,
          });
        }
      } else {
        frames.push({
          texture: textures[id],
          time: Number.MAX_VALUE,
        });
      }

      this.tiles.push(new Tile(id, data.firstgid + id, this, frames));
    }
  }

  public createTile(
    gid: number,
    horizontalFlip?: boolean,
    verticalFlip?: boolean,
    diagonalFlip?: boolean
  ): Tile | null {
    if (gid < this.data.firstgid) {
      return null;
    }

    const id = gid - this.data.firstgid;
    if (id >= this.tiles.length) {
      return null;
    }
    return this.tiles[id].clone({ horizontalFlip, verticalFlip, diagonalFlip });
  }
}
