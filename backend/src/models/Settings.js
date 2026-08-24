import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static methods for easy access
settingsSchema.statics.get = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.set = async function(key, value) {
  return await this.findOneAndUpdate(
    { key },
    { key, value, updatedAt: new Date() },
    { upsert: true, new: true }
  );
};

settingsSchema.statics.remove = async function(key) {
  return await this.deleteOne({ key });
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
