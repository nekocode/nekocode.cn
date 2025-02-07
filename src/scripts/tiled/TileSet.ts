import { Assets, FrameObject, Rectangle, Texture } from "pixi.js";
import { ITileSetData } from "./types/interfaces";
import { Tile } from "./Tile";

export class TileSet {
  private tiles: Tile[];

  public static async from(data: ITileSetData) {
    const image = await Assets.load(data.image);
    return new TileSet(data, image);
  }

  private constructor(public data: ITileSetData, image: Texture) {
    this.tiles = [];

    // Split to tile textures
    const margin = data.margin ?? 0;
    const spacing = data.spacing ?? 0;
    const textures: Texture[] = [];
    for (let y = margin; y < data.imageheight; y += data.tileheight + spacing) {
      for (let x = margin; x < data.imagewidth; x += data.tilewidth + spacing) {
        const rect = new Rectangle(x, y, data.tilewidth, data.tileheight);
        textures.push(new Texture({ source: image.source, frame: rect }));
      }
    }

    // Transform to tile objects/sprites
    for (let id = 0; id < textures.length; id++) {
      const frames: FrameObject[] = [];
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
