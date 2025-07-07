import mongoose from 'mongoose';
import User from './User';

// Initialize models
const models = {
  User: mongoose.models.User || User
};

export { User };

export function getModels() {
  return {
    User: mongoose.models.User || User
  };
}

export default models;