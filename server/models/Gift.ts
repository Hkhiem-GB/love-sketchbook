import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto {
  id: string;
  url: string;
  caption?: string;
  rotation?: number;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  order?: number;
}

export interface IGift extends Document {
  slug: string;
  recipient_name: string;
  sender_name: string;
  opening_message?: string;
  messages: string[];
  closing_message?: string;
  photos: IPhoto[];
  theme_color?: string;
  created_at: Date;
  updated_at: Date;
}

const PhotoSubSchema = new Schema<IPhoto>(
  {
    id: { type: String, required: true },
    url: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => !v.startsWith('data:image/'),
        message: 'Base64 image strings are not allowed in MongoDB documents. Images must be stored in Cloudinary or file storage.',
      },
    },
    caption: { type: String, default: '', maxlength: 100 },
    rotation: { type: Number, default: 0 },
    publicId: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    bytes: { type: Number },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const GiftSchema = new Schema<IGift>(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'],
    },
    recipient_name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      minlength: [1, 'Recipient name cannot be empty'],
      maxlength: [100, 'Recipient name cannot exceed 100 characters'],
    },
    sender_name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      minlength: [1, 'Sender name cannot be empty'],
      maxlength: [100, 'Sender name cannot exceed 100 characters'],
    },
    opening_message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Opening message cannot exceed 500 characters'],
    },
    messages: {
      type: [String],
      required: [true, 'At least one wish message is required'],
      validate: [
        {
          validator: (arr: string[]) => arr.length > 0 && arr.length <= 15,
          message: 'Number of messages must be between 1 and 15',
        },
      ],
    },
    closing_message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Closing message cannot exceed 500 characters'],
    },
    photos: {
      type: [PhotoSubSchema],
      validate: [
        {
          validator: (arr: IPhoto[]) => arr.length <= 30,
          message: 'Maximum 30 photos allowed per gift',
        },
      ],
      default: [],
    },
    theme_color: {
      type: String,
      default: '#C9757C',
      maxlength: 20,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent compiling model multiple times in dev
export const Gift = mongoose.models.Gift || mongoose.model<IGift>('Gift', GiftSchema);
