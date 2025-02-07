import {
  BrowserAdapter,
  Color,
  Container,
  ExtensionType,
  Graphics,
  LoaderParser,
  LoaderParserPriority,
} from "pixi.js";
import path from "path-browserify";
import { ImageLayer } from "./ImageLayer";
import { TileLayer } from "./TileLayer";
import { TileSet } from "./TileSet";
import { ITMXData } from "./types/interfaces";

export class TiledMap extends Container {
  static loaderParser: LoaderParser<TiledMap> = {
    name: "Tiled Map Loader Parser",
    extension: {
      name: "Tiled Map Loader Parser",
      priority: LoaderParserPriority.Normal,
      type: ExtensionType.LoadParser,
    },
    test(url: string) {
      return url.endsWith(".tiled.json");
    },
    async load(url: string) {
      const response = await BrowserAdapter.fetch(url);
      const mapData = await response.json();
      return await TiledMap.from(mapData, url);
    },
  };

  public tileSets: TileSet[] = [];
  public layers: { [name: string]: Container } = {};
  public collisionLayer?: TileLayer;

  private constructor(public data: ITMXData) {
    super();

    this.width = this.data.tilewidth * this.data.width;
    this.height = this.data.tileheight * this.data.height;
  }

  public static async from(data: ITMXData, url: string) {
    const baseUrl = path.dirname(url);
    const map = new TiledMap(data);
    let promises: Promise<any>[] = [];

    // replace all image properties with full path
    data.tilesets.forEach((tileset) => {
      if (tileset.image) {
        tileset.image = path.join(baseUrl, tileset.image);
      }
    });
    data.layers.forEach((layer) => {
      if (layer.image) {
        layer.image = path.join(baseUrl, layer.image);
      }
    });

    // Add background
    const bgColor = map.data.backgroundcolor;
    if (bgColor) {
      // Draw background color
      const background = new Graphics();
      background
        .rect(0, 0, map.width, map.height)
        .fill(new Color(map.data.backgroundcolor ?? "#0").toHex());
      map.addChild(background);
    }

    // Parse tilesets
    promises = map.data.tilesets.map(async (i) => {
      map.tileSets.push(await TileSet.from(i));
    });
    await Promise.all(promises);

    // Parse layers
    promises = map.data.layers.map(async (i) => {
      switch (i.type) {
        case "tilelayer": {
          if (i.name === "Collisions") {
            // Treat collision layer specially
            map.collisionLayer = new TileLayer(i, map.data, map.tileSets, true);
          } else {
            const tileLayer = new TileLayer(i, map.data, map.tileSets);
            map.layers[i.name] = tileLayer;
            map.addChild(tileLayer);
          }
          break;
        }
        case "imagelayer": {
          const imageLayer = await ImageLayer.from(i);
          map.layers[i.name] = imageLayer;
          map.addChild(imageLayer);
          break;
        }
      }
    });
    await Promise.all(promises);

    return map;
  }
}
