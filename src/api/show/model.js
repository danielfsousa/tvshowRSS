import { Schema } from 'mongoose';
import mongoose from '../../services/mongoose';

const showSchema = new Schema({
  tvmazeID: {
    type: String,
    required: true,
    unique: true,
  },
  imdbID: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  current_season: Number,
  magnets: [{
    sd: {
      title: String,
      link: String,
    },
    _720p: {
      title: String,
      link: String,
    },
    _1080p: {
      title: String,
      link: String,
    },
  }, { timestamps: true }],
});

const model = mongoose.model('TvShow', showSchema);

export const schema = model.schema;
export default model;
