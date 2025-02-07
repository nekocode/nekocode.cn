import {
  Application,
  CanvasTextMetrics,
  Container,
  FederatedEvent,
  Graphics,
  Rectangle,
  Text,
  TextStyle,
} from "pixi.js";

const PAD = 0.02;
const HEIGHT = 0.3;
const FONT_SIZE = 0.05;

export class Dialog extends Container {
  private bg: Graphics;
  private titleText: Text;
  private contentText: Text;
  private itemMenu?: ItemMenu;

  public constructor(
    private app: Application,
    private title: string,
    private content: string,
    private items: string[] = []
  ) {
    super();

    this.bg = createBg();
    this.addChild(this.bg);

    this.titleText = new Text({ text: this.title });
    this.titleText.anchor.set(0, 1);
    this.addChild(this.titleText);

    this.contentText = new Text({ text: this.content });
    this.addChild(this.contentText);
  }

  public show(container: Container): Promise<number> {
    return new Promise<number>((resolve: (value: number) => void) => {
      container.addChild(this);
      const onResize = () => {
        this.update(this.getWidth(), this.getHeight());
      };
      window.addEventListener("resize", onResize);
      const exit = (index: number) => {
        window.removeEventListener("resize", onResize);
        container.removeChild(this);
        resolve(index);
      };

      if (this.items.length > 0) {
        this.itemMenu = new ItemMenu(this.items, (index) => {
          exit(index);
        });
        this.addChild(this.itemMenu);
      }
      this.update(this.getWidth(), this.getHeight());

      this.eventMode = "static";
      this.on("pointertap", (_: FederatedEvent) => {
        exit(-1);
      });
    });
  }

  private update(screenWidth: number, screenHeight: number) {
    this.hitArea = new Rectangle(0, 0, screenWidth, screenHeight);

    const y = screenHeight * (1 - HEIGHT);
    const pad = screenHeight * PAD;
    const textStyle = new TextStyle({
      fill: "#fff",
      fontSize: Math.max(screenHeight * FONT_SIZE, 14),
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: screenWidth - pad * 2,
    });

    this.bg.width = screenWidth;
    this.bg.height = screenHeight * HEIGHT;
    this.bg.y = y;

    this.titleText.style = new TextStyle(textStyle);
    this.titleText.x = pad;
    this.titleText.y = y - pad;

    this.contentText.style = new TextStyle(textStyle);
    this.contentText.x = pad;
    this.contentText.y = y + pad;

    this.itemMenu?.update(screenWidth, screenHeight);
  }

  private getWidth() {
    return this.app.renderer.width / this.app.stage.scale.x;
  }

  private getHeight() {
    return this.app.renderer.height / this.app.stage.scale.y;
  }
}

class ItemMenu extends Container {
  private bg: Graphics;
  private itemTexts: Text[] = [];

  public constructor(items: string[] = [], onItemTap: (index: number) => void) {
    super();

    this.bg = createBg();
    this.addChild(this.bg);

    for (let i = 0; i < items.length; i++) {
      const text = new Text(items[i]);
      text.anchor.set(0.5, 0);

      // Interaction
      text.eventMode = "static";
      text.on("pointertap", () => {
        onItemTap(i);
      });

      this.itemTexts.push(text);
      this.addChild(text);
    }
  }

  public update(screenWidth: number, screenHeight: number) {
    const pad = screenHeight * PAD;
    const width = Math.max(screenWidth * 0.3, 120);

    const textStyle = new TextStyle({
      fill: "#fff",
      align: "center",
      fontSize: Math.max(screenHeight * FONT_SIZE, 14),
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: width - pad * 2,
    });

    let height = pad;
    let textMetrics: CanvasTextMetrics;
    for (const text of this.itemTexts) {
      text.style = textStyle;
      text.x = width / 2;
      text.y = height;

      textMetrics = CanvasTextMetrics.measureText(text.text, textStyle);
      height += textMetrics.height + pad;
      text.hitArea = new Rectangle(-width / 2, -pad, width, screenHeight);
    }

    this.bg.width = width;
    this.bg.height = height;

    this.pivot.x = width / 2;
    this.pivot.y = height / 2;
    this.x = screenWidth / 2;
    this.y = (screenHeight * (1 - HEIGHT)) / 2;
  }
}

function createBg() {
  const bg = new Graphics();
  bg.rect(0, 0, 1, 1).fill(0x000000);
  bg.alpha = 0.5;
  return bg;
}
