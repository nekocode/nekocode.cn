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
    tileX: number;
    tileY: number;
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
      args.tileX,
      args.tileY
    );
  }

  private constructor(
    public animations: {
      [key in Direction]: PIXI.Texture[];
    },
    public direction: Direction = Direction.down,
    public map: TiledMap,
    public tileX: number,
    public tileY: number
  ) {
    super(animations[direction]);

    // this.anchor.set(0, 0.4);
    this.animationSpeed = 0.1;
    this.position = this.getActualPosition();
  }

  public getActualPosition(): PIXI.Point {
    return new PIXI.Point(
      this.tileX * this.map.data.tilewidth,
      this.tileY * this.map.data.tileheight,
    );
  }
}
