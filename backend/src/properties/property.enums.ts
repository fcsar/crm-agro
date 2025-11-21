export enum CropType {
  SOJA = 'soja',
  MILHO = 'milho',
  ALGODAO = 'algodao',
}

export const CROP_WEIGHTS = {
  [CropType.SOJA]: 1.0,
  [CropType.MILHO]: 0.7,
  [CropType.ALGODAO]: 1.3,
};

export const CROP_SEASONS = {
  [CropType.SOJA]: {
    plantio: [10, 11, 12],
    adubacaoCobertura: [1, 2],
    colheita: [2, 3, 4],
  },
  [CropType.MILHO]: {
    plantio: [9, 10, 11],
    adubacaoCobertura: [11, 12, 1],
    colheita: [2, 3, 4],
  },
  [CropType.ALGODAO]: {
    plantio: [11, 12, 1],
    adubacaoCobertura: [2, 3],
    colheita: [6, 7, 8],
  },
};
