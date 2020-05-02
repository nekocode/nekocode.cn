import * as PIXI from "pixi.js";
import * as PF from "pathfinding";
import { Tile } from "./Tile";
import { TileSet } from "./TileSet";
import { ILayerData, ITMXData } from "./types/interfaces";

export class TileLayer extends PIXI.Container {
  private gids: number[] = [];
  private horizontalFlips: boolean[] = [];
  private verticalFlips: boolean[] = [];
  private diagonalFlips: boolean[] = [];
  private tiles: (Tile | undefined)[] = [];
  private notEmptyTiles: Tile[] = [];

  // Collision related
  private pfGrid?: PF.Grid;

  constructor(
    public data: ILayerData,
    private mapData: ITMXData,
    private tileSets: TileSet[],
    private isCollision: boolean = false
  ) {
    super();

    this.visible = data.visible;
    this.alpha = data.opacity;

    if (this.isCollision) {
      this.pfGrid = new PF.Grid(data.width, data.height);
    }
    this.resolveGids();
    this.create();
  }

  public getPFGrid() {
    return this.pfGrid?.clone();
  }

  public getTile(x: number, y: number) {
    return this.tiles[x + y * this.data.width];
  }

  public getTiles() {
    return this.notEmptyTiles;
  }

  private create() {
    for (let y = 0; y < this.data.height; y++) {
      for (let x = 0; x < this.data.width; x++) {
        const i = x + y * this.data.width;
        const gid = this.data.data[i];

        if (this.pfGrid != null) {
          if (gid > 0) {
            // Set collision position
            this.pfGrid.setWalkableAt(x, y, false);
          }
          // Skip below logic
          continue;
        }

        if (gid !== 0) {
          let tile;
          let tileSet;
          for (const _tileSet of this.tileSets) {
            tileSet = _tileSet;
            tile = tileSet.createTile(
              gid,
              this.horizontalFlips[i],
              this.verticalFlips[i],
              this.diagonalFlips[i]
            );
            if (tile) {
              break;
            }
          }

          if (tile && tileSet) {
            tile.x = x * this.mapData.tilewidth;
            tile.y =
              y * this.mapData.tileheight +
              (this.mapData.tileheight -
                (tile.textures[0] as PIXI.Texture).height);

            // Add offset of tileset
            const offset = tileSet.data.tileoffset;
            if (offset) {
              tile.x += offset.x;
              tile.y += offset.y;
            }

            // Play animation of tile if need be
            if (tile.textures.length > 1) {
              tile.gotoAndPlay(0);
            }

            this.tiles.push(tile);
            this.notEmptyTiles.push(tile);

            this.addChild(tile);
          }
        } else {
          this.tiles.push(undefined);
        }
      }
    }
  }

  // https://github.com/andrewrk/node-tmx-parser/blob/15b19f2a030bc63cc8be41d859294addb7c91d29/index.js#L558
  private resolveGids() {
    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

    /* tslint:disable:no-bitwise*/
    for (let gid of this.data.data) {
      this.horizontalFlips.push(!!(gid & FLIPPED_HORIZONTALLY_FLAG));
      this.verticalFlips.push(!!(gid & FLIPPED_VERTICALLY_FLAG));
      this.diagonalFlips.push(!!(gid & FLIPPED_DIAGONALLY_FLAG));

      gid &= ~(
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG
      );

      this.gids.push(gid);
    }
    /* tslint:enable:no-bitwise */
  }
}
