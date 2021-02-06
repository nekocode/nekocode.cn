import * as PIXI from "pixi.js";

import * as path from 'path-browserify';
import { ImageLayer } from "./ImageLayer";
import { TileLayer } from "./TileLayer";
import { TileSet } from "./TileSet";
import { ITMXData } from "./types/interfaces";

export class TiledMap extends PIXI.Container {
  static middleware(resource: any, next: () => void) {
    if (!resource.url.endsWith(".tiled.json")) return next();

    const mapData = JSON.parse(resource.xhr.responseText);
    const route = path.dirname(resource.url);
    resource.data = () => new TiledMap(mapData, route);
    next();
  }

  public tileSets: TileSet[] = [];
  public layers: { [name: string]: PIXI.Container } = {};
  public collisionLayer?: TileLayer;

  constructor(public data: ITMXData, public route: string) {
    super();

    this.width = this.data.tilewidth * this.data.width;
    this.height = this.data.tileheight * this.data.height;
    this.create();
  }

  public create() {
    const bgColor = this.data?.backgroundcolor;
    if (bgColor) {
      // Draw background color
      const background = new PIXI.Graphics();
      background.beginFill(
        PIXI.utils.string2hex(this.data?.backgroundcolor ?? "#0")
      );
      background.drawRect(0, 0, this.width, this.height);
      background.endFill();
      this.addChild(background);
    }

    // Parse tilesets
    this.data.tilesets.forEach((tileSet) => {
      this.tileSets.push(new TileSet(tileSet, this.route));
    });

    // Parse layers
    this.data.layers.forEach((layerData) => {
      switch (layerData.type) {
        case "tilelayer": {
          if (layerData.name === "Collisions") {
            // Treat collision layer specially
            this.collisionLayer = new TileLayer(
              layerData,
              this.data,
              this.tileSets,
              true
            );
          } else {
            const tileLayer = new TileLayer(
              layerData,
              this.data,
              this.tileSets
            );
            this.layers[layerData.name] = tileLayer;
            this.addChild(tileLayer);
          }
          break;
        }
        case "imagelayer": {
          const imageLayer = new ImageLayer(layerData, this.route);
          this.layers[layerData.name] = imageLayer;
          this.addChild(imageLayer);
          break;
        }
      }
    });
  }
}
