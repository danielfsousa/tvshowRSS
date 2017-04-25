import { Schema } from 'mongoose';
import mongoose from '../../services/mongoose';

const showSchema = new Schema({
  imdbID: String,
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

showSchema.methods.updateMagnets = function updateMagnets(filteredMagnets) {
  // Empties magnets
  this.magnets = []; // eslint-disable-line
  // Push new links
  filteredMagnets.forEach(magnetObj => this.magnets.push(magnetObj));
  // Return save mongoose model promise
  return this.save();
};

const model = mongoose.model('TvShow', showSchema);

export const schema = model.schema;
export default model;
