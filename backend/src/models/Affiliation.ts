import mongoose from 'mongoose'

const AffiliationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  collection: 'affiliations'
})

export default mongoose.models.Affiliation || mongoose.model('Affiliation', AffiliationSchema)
