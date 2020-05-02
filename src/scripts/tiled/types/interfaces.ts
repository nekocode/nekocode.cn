export interface ITMXData {
  orientation: string;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  backgroundcolor?: string;
  layers: ILayerData[];
  tilesets: ITileSetData[];
}

export interface ITileSetData {
  columns: number;
  firstgid: number;
  image: string;
  imagewidth: number;
  imageheight: number;
  margin?: number;
  name: string;
  spacing?: number;
  tilecount: number;
  tilewidth: number;
  tileheight: number;
  // Only has value if this set includs animations
  tiles?: ITileData[];
  tileoffset?: { x: number; y: number };
}

export interface ITileData {
  id: number;
  animation: IAnimationData[];
}

export interface IAnimationData {
  tileid: number;
  duration: number;
}

export interface ILayerData {
  id: number;
  type: 'tilelayer' | 'imagelayer' | 'objectgroup' | 'group';
  name: string;
  data: number[];
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  x: number;
  y: number;
  // Only has value if this layer is group layer
  layers?: ILayerData[];
  // Only has value if this layer is image layer
  image?: string;
}
