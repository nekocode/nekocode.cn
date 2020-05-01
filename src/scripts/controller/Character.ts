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
    map: TiledMap;
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

  private movementPath: [number, number][] = [];

  private constructor(
    public animations: {
      [key in Direction]: PIXI.Texture[];
    },
    private direction: Direction,
    public map: TiledMap,
    public tilePosition: PIXI.Point
  ) {
    super(animations[direction]);

    this.animationSpeed = 0.4;
    this.position = this.getActualPosition();
    this.loop = true;
  }

  private lastFrame = 0;
  private nextTilePos?: PIXI.Point;
  private needStop = false;

  public update(deltaTime: number) {
    super.update(deltaTime);

    // If need stop, stop at frame 0
    if (this.needStop && this.currentFrame == 0) {
      // this.tilePosition = this.nextTilePos!;
      this.nextTilePos = undefined;
      this.stop();
      this.needStop = false;
    }

    // If frame changed
    if (this.playing && this.lastFrame != this.currentFrame) {
      if (this.currentFrame == 0) {
        // Skip frame 0
        this.gotoAndPlay(1);
      }

      // Calculate next tile position
      const p = this.nextTilePos!;
      this.tilePosition.x =
        p.x - ((p.x - this.tilePosition.x) / 3) * (3 - this.currentFrame);
      this.tilePosition.y =
        p.y - ((p.y - this.tilePosition.y) / 3) * (3 - this.currentFrame);

      // If whole of the animation finished
      if (this.currentFrame >= 3) {
        if (this.movementPath.length > 0) {
          // Need to move
          const nextPos = this.movementPath.shift()!;
          this.prepareMove(nextPos);
        } else {
          // Need not to move any more
          this.needStop = true;
        }
      }
    }
    this.lastFrame = this.currentFrame;

    // Move sprite
    this.position = this.getActualPosition();
  }

  public getActualPosition(): PIXI.Point {
    return new PIXI.Point(
      this.tilePosition.x * this.map.data.tilewidth,
      this.tilePosition.y * this.map.data.tileheight
    );
  }

  public setMovementPath(movementPath: [number, number][]) {
    this.movementPath = movementPath;
    if (movementPath.length <= 0) {
      return;
    }

    if (!this.playing) {
      this.prepareMove(movementPath.shift()!);

      // Start to play animation
      this.gotoAndPlay(1);
    }
  }

  private prepareMove(nextTilePos: [number, number]) {
    let nextDirection = this.getNextDirection(nextTilePos[0], nextTilePos[1]);
    if (nextDirection !== this.direction) {
      this.textures = this.animations[(this.direction = nextDirection)];
      // Reset to frame 1
      this.gotoAndPlay(1);
    }

    // Set next position
    this.nextTilePos = new PIXI.Point(nextTilePos[0], nextTilePos[1]);
  }

  private getNextDirection(nextTileX: number, nextTileY: number) {
    let nextDirection = this.direction;
    if (nextTileX > this.tilePosition.x) {
      nextDirection = Direction.right;
    } else if (nextTileX < this.tilePosition.x) {
      nextDirection = Direction.left;
    } else if (nextTileY > this.tilePosition.y) {
      nextDirection = Direction.down;
    } else if (nextTileY < this.tilePosition.y) {
      nextDirection = Direction.up;
    }
    return nextDirection;
  }
}
