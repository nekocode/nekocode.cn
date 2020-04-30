import * as PIXI from "pixi.js";
import { TiledMap } from "../tiled";

enum Direction {
  down = 0,
  left = 1,
  right = 2,
  up = 3,
}

export class Character extends PIXI.AnimatedSprite {
  public static new(args: {
    baseTexture: PIXI.BaseTexture;
    characterWidth: number;
    characterHeight: number;
    map: TiledMap,
    tilePosition: PIXI.Point;
  }): Character {
    // Generate four directions of animation textures
    const genTextures = (line: number): PIXI.Texture[] => {
      const textures: PIXI.Texture[] = [];
      const y = line * args.characterHeight;
      // Right to left
      for (let column = 3; column >= 0; column--) {
        const x = column * args.characterWidth;
        const rect = new PIXI.Rectangle(
          x,
          y,
          args.characterWidth,
          args.characterHeight
        );
        textures.push(new PIXI.Texture(args.baseTexture, rect));
      }
      return textures;
    };
    const animations = {
      [Direction.down]: genTextures(0),
      [Direction.left]: genTextures(1),
      [Direction.right]: genTextures(2),
      [Direction.up]: genTextures(3),
    };
    return new Character(
      animations,
      Direction.down,
      args.map,
      args.tilePosition
    );
  }

  private constructor(
    public animations: {
      [key in Direction]: PIXI.Texture[];
    },
    public direction: Direction,
    public map: TiledMap,
    public tilePosition: PIXI.Point,
    public targetTilePosition: PIXI.Point = tilePosition,
  ) {
    super(animations[direction]);

    this.animationSpeed = 0.1;
    this.position = this.getActualPosition();
  }

  public update() {
    this.tilePosition.x = this.targetTilePosition.x;
    this.tilePosition.y = this.targetTilePosition.y;

    // Move sprite
    this.position = this.getActualPosition();
  }

  public getActualPosition(): PIXI.Point {
    return new PIXI.Point(
      this.tilePosition.x * this.map.data.tilewidth,
      this.tilePosition.y * this.map.data.tileheight,
    );
  }
}
