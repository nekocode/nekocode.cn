import * as PIXI from "pixi.js";
import { default as Sound } from "pixi-sound";
import * as ifvisible from "ifvisible";
import { TiledMap } from "./tiled";
import { Game } from "./controller/Game";

const rootElement: HTMLElement =
  document.querySelector("#game") ?? document.body;
const app = new PIXI.Application({
  resizeTo: rootElement,
});

// Set pixi settings
PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const loadingElement = rootElement.querySelector("#loading")!;

app.loader
  .add("shaderSepia", "assets/shaders/sepia.frag")
  .add("shaderBrightnessContrast", "assets/shaders/brightness_contrast.frag")
  .add("shaderVignette", "assets/shaders/vignette.frag")
  .add("shaderNoise", "assets/shaders/noise.frag")
  .add("mapMain", "assets/map/main.tiled.json")

  // Sounds
  .add("bgm", "assets/sounds/bgm.mp3")

  // Preload textures
  .add("texOverworld", "assets/map/overworld.png")
  .add("texMe", "assets/images/me_sprite.png")
  .add("texCursor", "assets/images/cursor.png")

  // Add parser middleware of tiled map json file
  .use(TiledMap.middleware)

  .on("progress", (loader: PIXI.Loader, _: PIXI.LoaderResource) => {
    loader.resources;
    loadingElement.innerHTML = "Loading " + loader.progress.toFixed(0) + "%...";
  })
  .load((_: PIXI.Loader, res: any) => {
    // Remove loading text
    loadingElement.remove();
    rootElement.appendChild(app.view);

    // Add filters
    app.stage.filters = [
      new PIXI.Filter(undefined, res.shaderSepia.data, {
        amount: 0.9,
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

    // Play background music
    let volumeAll = 1.0;
    ifvisible.on("blur", function () {
      volumeAll = 0.0;
    });
    ifvisible.on("focus", function () {
      volumeAll = 1.0;
    });
    setInterval(() => {
      if (Sound.volumeAll < volumeAll) {
        const v = Sound.volumeAll + 0.05;
        Sound.volumeAll = Math.min(v, 1.0);
      } else if (Sound.volumeAll > volumeAll) {
        const v = Sound.volumeAll - 0.05;
        Sound.volumeAll = Math.max(v, 0.0);
      }
    }, 100);
    Sound.volumeAll = 1.0;
    Sound.play("bgm", { loop: true });

    // Set stage scale
    const updateScale = () => {
      const maxWh = Math.max(app.screen.width, app.screen.height);
      app.stage.scale.set(maxWh / (11 * 32));
    };
    updateScale();
    window.onresize = updateScale;

    // Init map
    const map = res.mapMain.data() as TiledMap;

    // Start game controlling
    new Game(app, map);

    // Resume application update
    app.start();
  });
