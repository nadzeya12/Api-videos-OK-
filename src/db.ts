export enum AvailableResolutionsEnum {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export type VideoInputType = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutionsEnum[];
};

export type Video = {
  id: number;
  title: string;
  author: string;
  minAgeRestriction: number;
  canBeDownloaded: boolean;
  createdAt: Date;
  publicationDate: Date;
  availableResolutions: AvailableResolutionsEnum[];
};

export const db = {
  videos: <Video[]>[
    {
      id: 1,
      title: 'Video 1',
      author: 'John Doe',
      canBeDownloaded: false,
      minAgeRestriction: 0,
      createdAt: new Date(),
      publicationDate: new Date(),
      availableResolutions: [AvailableResolutionsEnum.P2160],
    },
    {
      id: 2,
      title: 'Video 2',
      author: 'Michael Dark',
      canBeDownloaded: true,
      minAgeRestriction: 6,
      createdAt: new Date(),
      publicationDate: new Date(),
      availableResolutions: [AvailableResolutionsEnum.P1440],
    },
    {
      id: 3,
      title: 'Video 3',
      author: 'Michael Dark',
      canBeDownloaded: true,
      minAgeRestriction: 12,
      createdAt: new Date(),
      publicationDate: new Date(),
      availableResolutions: [AvailableResolutionsEnum.P1080],
    },
  ],
};
