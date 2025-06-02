import 'express';
import { setupApp } from './setup-app';
import express from 'express';
import { db, Video } from './db';

const app = express();
setupApp(app);

const port = 5001;
app.use(express.json());

enum AvailableResolutionsEnum {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export type UpdateVideoInputModel = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutionsEnum[];
  canBeDownloaded: boolean;
  minAgeRestriction: number;
};

export type CreateVideoInputModel = {
  createdAt: string;
  publicationDate: string;
  title: string;
  author: string;
  availableResolutions: AvailableResolutionsEnum[];
};
const isValidDate = (dateString: string | undefined): boolean => {
  if (!dateString) return true; // Пропускаем, если дата не указана (по умолчанию)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // Проверяем, что дата валидна
};
function setPublicationDate() {
  const createdAt = new Date().toISOString();
  const created = new Date(createdAt);
  if (!isNaN(created.getTime())) {
    const publication = new Date(created);
    publication.setDate(created.getDate() + 1);
    return publication;
    // return {
    //   ...videoData,
    //   publicationDate: publication.toISOString(),
    //   createdAt,
    // };
  } else {
    throw new Error('Invalid createdAt date');
  }
}

app.get('/', (req, res) => {
  res.send('Wszystko pracuje');
});

app.get('/videos', (_req, res) => {
  console.log(db.videos);
  const videos = db.videos.map((video) => {
    return {
      ...video,
      createdAt: video.createdAt.toISOString(),
      publicationDate: video.publicationDate.toISOString(),
    };
  });
  res.send(videos).status(200);
});

app.get('/videos/:id', (req, res) => {
  // const videoId = parseInt(req.params.id, 10);
  const video = db.videos.find((video) => video.id === +req.params.id);

  if (video) {
    res.send(video).status(200);
  } else {
    res.status(404).send('video not found');
  }
});

app.post('/videos', (req, res) => {
  const errorsMessages = [];
  if (!('title' in req.body)) {
    errorsMessages.push({ message: 'title is required', field: 'title' });
  } else if (typeof req.body.title !== 'string') {
    errorsMessages.push({ message: 'title must be a string', field: 'title' });
  } else if (req.body.title.trim() === '') {
    errorsMessages.push({ message: 'title cannot be empty', field: 'title' });
  } else if (req.body.title.length > 40) {
    errorsMessages.push({
      message: 'title must be up to 40 symbols',
      field: 'title',
    });
  }
  if (!('author' in req.body)) {
    errorsMessages.push({ message: 'author is required', field: 'author' });
  } else if (typeof req.body.author !== 'string') {
    errorsMessages.push({
      message: 'author must be a string',
      field: 'author',
    });
  } else if (req.body.author.trim() === '') {
    errorsMessages.push({ message: 'author cannot be empty', field: 'author' });
  } else if (req.body.author.length > 20) {
    errorsMessages.push({
      message: 'Author is required and must be up to 20 characters',
      field: 'author',
    });
  }
  if (!('availableResolutions' in req.body)) {
    errorsMessages.push({
      message: 'availableResolutions are required',
      field: 'availableResolutions',
    });
  } else if (!Array.isArray(req.body.availableResolutions)) {
    errorsMessages.push({
      message: 'availableResolutions must be an array',
      field: 'availableResolutions',
    });
  } else if (req.body.availableResolutions.length === 0) {
    errorsMessages.push({
      message: 'availableResolutions cannot be empty',
      field: 'availableResolutions',
    });
  } else {
    const validResolutions = Object.values(AvailableResolutionsEnum);
    const invalidResolutions = req.body.availableResolutions.filter(
      (res: AvailableResolutionsEnum) => !validResolutions.includes(res),
    );
    if (invalidResolutions.length > 0) {
      errorsMessages.push({
        message: `availabelResolutions has invalid data ${invalidResolutions.join(', ')}`,
        field: 'availableResolutions',
      });
    }
  }

  if (errorsMessages.length > 0) {
    res.status(400).json({ errorsMessages });
    return;
  }
  const videoData = req.body;
  //тут плюс один день
  const newVideo = {
    id: Math.floor(Math.random() * 1000),
    ...videoData,
    canBeDownloaded: req.body.canBeDownloaded ?? false,
    minAgeRestriction: null,
    // createdAt: setPublicationDate(videoData).createdAt,
    // publicationDate: setPublicationDate(videoData).publicationDate,
    createdAt: new Date(),
    publicationDate: setPublicationDate(),
  };
  db.videos.push(newVideo);
  res.status(201).send(newVideo);
});

app.put('/videos/:id', (req, res) => {
  let video = db.videos.find((video) => video.id === +req.params.id);
  const updateData: Partial<UpdateVideoInputModel> = req.body;
  const errorsMessages = [];
  if (!video) {
    res.status(404).send({
      errorsMessages: [{ message: 'video not found', field: 'video' }],
    });
  }

  if (updateData.title !== undefined) {
    if (typeof updateData.title === null) {
      errorsMessages.push({
        message: 'title must be a string',
        field: 'title',
      });
    } else if (typeof updateData.title !== 'string') {
      errorsMessages.push({
        message: 'title must be a string',
        field: 'title',
      });
    } else if (updateData.title.length > 40) {
      errorsMessages.push({
        message: 'title cannot be up to 40 symbols',
        field: 'title',
      });
    }
  }
  if (updateData.author !== undefined) {
    if (updateData.author.length > 20) {
      errorsMessages.push({
        message: 'author cannot be up to 20 symbols',
        field: 'author',
      });
    } else if (typeof updateData.author === null) {
      errorsMessages.push({
        message: 'author must be a string',
        field: 'author',
      });
    }
  }
  if (updateData.availableResolutions !== undefined) {
    if (!Array.isArray(updateData.availableResolutions)) {
      errorsMessages.push({
        message: 'availableResolutions must be an array',
        field: 'availableResolutions',
      });
    } else {
      const validResolutions = Object.values(AvailableResolutionsEnum);
      const invalidResolutions = updateData.availableResolutions.filter(
        (res) => !validResolutions.includes(res),
      );
      if (invalidResolutions.length > 0) {
        errorsMessages.push({
          message: `availableResolutions contains invalid values: ${invalidResolutions.join(', ')}`,
          field: 'availableResolutions',
        });
      }
    }
  }
  if (updateData.minAgeRestriction !== undefined) {
    if (updateData.minAgeRestriction > 18) {
      errorsMessages.push({
        message: 'minAge restriction cannot be up to 18 yo',
        field: 'minAgeRestriction',
      });
    }
  }
  if (updateData.canBeDownloaded !== undefined) {
    if (typeof updateData.canBeDownloaded !== 'boolean') {
      errorsMessages.push({
        message: 'canBeDownloaded must be a boolean',
        field: 'canBeDownloaded',
      });
    }
  }
  if (errorsMessages.length > 0) {
    res.status(400).json({ errorsMessages });
    return;
  }

  if (video) {
    const updatedVideo = {
      ...video,
      ...updateData,
    };
    db.videos = db.videos.map((v) => (v.id === video.id ? updatedVideo : v));
    res.status(204);
  }
  res.send(errorsMessages);
});

app.delete('/videos/:id', (req, res) => {
  const video = db.videos.find((video) => video.id === +req.params.id);
  if (!video) {
    res.status(404).send('video for passed id doesnt exist');
  } else {
    //todo delete from db
    db.videos = db.videos.filter((video: Video) => video.id !== video.id);
    res.status(204).send('Video deleted');
  }
});

app.delete('/testing/all-data', (req, res) => {
  db.videos = [];
  res.status(204).send('all videos deleted successfully.');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
