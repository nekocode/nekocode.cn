import * as PIXI from "pixi.js";
import { TiledMap } from "./tiled";
import { Game } from "./controller/Game";

const rootElement: HTMLElement =
  document.querySelector("#game") ?? document.body;
const app = new PIXI.Application({
  resizeTo: rootElement,
});
rootElement.appendChild(app.view);

// Stop application wait for load to finish
app.stop();

// Set pixi default scale mode before load resources
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

app.loader
  .add("shaderSepia", "assets/shaders/sepia.frag")
  .add("shaderBulgePinch", "assets/shaders/bulge_pinch.frag")
  .add("shaderBrightnessContrast", "assets/shaders/brightness_contrast.frag")
  .add("shaderVignette", "assets/shaders/vignette.frag")
  .add("shaderNoise", "assets/shaders/noise.frag")
  .add("mapMain", "assets/map/main.tiled.json")

  // Preload textures
  .add("texOverworld", "assets/map/overworld.png")
  .add("texMe", "assets/images/me_sprite.png")

  // Add parser middleware of tiled map json file
  .use(TiledMap.middleware)

  .load((_: PIXI.Loader, res: any) => {
    // Add filters
    app.stage.filters = [
      new PIXI.Filter(undefined, res.shaderSepia.data, {
        amount: 0.9,
      }),
      new PIXI.Filter(undefined, res.shaderBulgePinch.data, {
        texSize: [app.screen.width, app.screen.height],
        center: [app.screen.width / 2.0, app.screen.height / 2.0],
        radius: (app.screen.width * 3.0) / 4.0,
        strength: 0.05,
      }),
      new PIXI.Filter(undefined, res.shaderBrightnessContrast.data, {
        brightness: -0.1,
        contrast: 0.1,
      }),
      new PIXI.Filter(undefined, res.shaderVignette.data, {
        size: 0,
        amount: 1,
      }),
      new PIXI.Filter(undefined, res.shaderNoise.data, {
        amount: 0.1,
      }),
    ];

    // Set stage scale
    app.stage.scale.set(2);

    // Init map
    const map = res.mapMain.data() as TiledMap;

    // Start game controlling
    new Game(app, map);

    // Resume application update
    app.start();
  });
