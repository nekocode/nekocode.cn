import * as PIXI from "pixi.js";
import { default as Sound } from "pixi-sound";
import * as ifvisible from "ifvisible";
import { TiledMap } from "./tiled";
import { Game } from "./objects/Game";

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
  // Maps
  .add("texOverworld", "assets/maps/overworld.png")
  .add("mapMain", "assets/maps/main.tiled.json")

  // Preload textures
  .add("texMe", "assets/images/me_sprite.png")
  .add("texCursor", "assets/images/cursor.png")

  // Shaders
  .add("shaderSepia", "assets/shaders/sepia.frag")
  .add("shaderBrightnessContrast", "assets/shaders/brightness_contrast.frag")
  .add("shaderVignette", "assets/shaders/vignette.frag")
  .add("shaderNoise", "assets/shaders/noise.frag")

  // Add parser middleware of tiled map json file
  .use(TiledMap.middleware)

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
  })
  .onProgress.add((loader: PIXI.Loader, _: PIXI.LoaderResource) => {
    loadingElement.innerHTML = "Loading " + loader.progress.toFixed(0) + "%...";
  });

// Load some big resource files on a separate loader
new PIXI.Loader()
  // Sounds
  .add("bgm", "https://s1.nekocode.cn/nekocodecn_bgm.mp3")

  .load((_: PIXI.Loader, __: any) => {
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
    try {
      Sound.play("bgm", { loop: true });
    } catch {}
  });
