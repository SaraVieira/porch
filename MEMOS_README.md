# Memos Diary Feature

A comprehensive diary application with rich text editing, mood tracking, and image upload capabilities.

## Features

### ✨ **Core Functionality**
- **Rich Text Editor**: Powered by Quill with full formatting options
- **Mood Tracking**: Track your emotional state with 9 different mood options
- **Image Upload**: Upload images directly into your diary entries using Zipline
- **Auto-Save**: Entries are automatically saved to localStorage
- **Date Organization**: Entries are grouped by date for easy browsing
- **Real-time Preview**: See your entries as you type

### 🎨 **Mood Options**
- **Happy** - Yellow theme with smile icon
- **Excited** - Orange theme with zap icon  
- **Grateful** - Pink theme with heart icon
- **Calm** - Blue theme with sun icon
- **Neutral** - Gray theme with meh icon
- **Energetic** - Green theme with coffee icon
- **Tired** - Slate theme with cloud icon
- **Anxious** - Purple theme with rain cloud icon
- **Sad** - Indigo theme with frown icon

### 📝 **Editor Features**
- Headers (H1, H2, H3)
- Text formatting (bold, italic, underline, strikethrough)
- Lists (ordered and unordered)
- Text and background colors
- Text alignment
- Links
- Image embedding via upload
- Clean text option

## Database Schema

The memos are stored in a PostgreSQL table with the following structure:

```sql
CREATE TABLE memos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'neutral',
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage

### Creating a New Entry

1. Navigate to `/memos`
2. Click "New Entry" button
3. Enter a title for your diary entry
4. Select your current mood from the mood selector
5. Write your content using the rich text editor
6. Upload images by clicking "Add Image" button
7. Click "Save Entry" to save your diary entry

### Editing Existing Entries

1. Click on any entry in the sidebar
2. The entry will load in the editor
3. Make your changes
4. Click "Save Entry" to update

### Image Upload

1. Click the "Add Image" button while editing
2. Select an image file (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)
3. The image will be uploaded to Zipline and embedded in your entry
4. Images are automatically inserted at your cursor position

### Viewing Entries

- **Sidebar Navigation**: Browse all entries organized by date
- **Mood Indicators**: Each entry shows its mood with a colored badge
- **Content Preview**: See a snippet of each entry's content
- **Time Stamps**: View when entries were last updated

### Mood Statistics

The sidebar shows a mood overview with:
- Visual representation of mood distribution
- Percentage bars for each mood type
- Count of entries for each mood

## Technical Implementation

### Dependencies

```json
{
  "quill": "^2.0.3"
}
```

Note: This implementation uses the raw Quill library directly instead of `react-quill` for React 19 compatibility.

### Key Components

- **MemosPage**: Main diary interface with selective SSR
- **QuillEditor**: Custom Quill implementation (client-side only)
- **Mood Selector**: Interactive mood selection interface
- **Sidebar**: Entry navigation and mood statistics
- **Image Upload**: Integration with Zipline upload utility

### Data Storage

Uses PostgreSQL database with Drizzle ORM:
- Server-side data loading with TanStack Start loaders
- Client-side mutations with TanStack Query
- Real-time updates and optimistic UI
- Persistent storage across sessions and devices

### Image Integration

Uses the existing upload utility (`src/lib/upload.ts`):
- Validates image files before upload
- Provides upload progress feedback
- Automatically inserts images into Quill editor using direct API
- Supports all common image formats
- Client-side only implementation for SSR compatibility

## File Structure

```
src/
├── routes/
│   ├── memos.tsx              # Main diary page with selective SSR
│   └── api/
│       ├── memos.ts           # Memos API endpoints
│       └── memos.$id.ts       # Individual memo operations
├── db/
│   ├── index.ts               # Database connection (server-side only)
│   └── schema.ts              # Database schema with memos table
├── lib/
│   ├── memos.ts               # MemosService for database operations
│   └── upload.ts              # Image upload utility
└── components/
    ├── Header.tsx             # Navigation (includes memos link)
    └── ui/                    # Shadcn UI components
```

## Environment Setup

Ensure you have the following environment variables for image upload:

```bash
# Your Zipline instance URL
VITE_ZIPLINE_API_ENDPOINT=https://your-zipline-instance.com

# Your Zipline API token
VITE_ZIPLINE_API_TOKEN=your_api_token_here
```

## Styling

The diary uses:
- **Shadcn UI components** for consistent design
- **Tailwind CSS** for styling
- **Quill Snow theme** for the editor (loaded dynamically)
- **Custom mood color schemes** for visual appeal
- **TanStack Start selective SSR** for optimal performance

## Security Considerations

- **Server-side Data**: Database operations are server-side only
- **Image Upload**: Uses secure Zipline API with token authentication
- **Input Sanitization**: Quill provides built-in XSS protection
- **File Validation**: Only allows safe image file types
- **Environment Variables**: Sensitive config managed server-side
- **SSR Security**: Database code never reaches client bundle

## Future Enhancements

### Potential Features
- **Search Functionality**: Search through entry content
- **Export Options**: Export entries as PDF or markdown
- **Backup/Sync**: Cloud backup and device synchronization
- **Tags System**: Categorize entries with custom tags
- **Mood Analytics**: Advanced mood tracking and insights
- **Sharing Options**: Share entries with others
- **Reminders**: Daily writing prompts and reminders

### Enhanced Features
- Add user authentication and multi-user support
- Implement real-time collaboration features
- Add advanced search and filtering
- Implement data export and backup features

## Troubleshooting

### Common Issues

1. **Quill Styles Not Loading**
   - Quill CSS is loaded dynamically on client-side
   - Check browser console for import errors
   - Verify network connectivity for dynamic imports

2. **Image Upload Fails**
   - Verify Zipline API endpoint and token are configured
   - Check network connectivity and CORS settings
   - Ensure image file types are supported

3. **Entries Not Saving**
   - Check browser localStorage availability
   - Verify JSON serialization is working
   - Check for browser storage quota limits

4. **Editor Not Loading**
   - Ensure quill package is installed
   - Check for JavaScript errors in browser console
   - Verify the page is running client-side (SSR: 'data-only')
   - Check that dynamic imports are working

### Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Required APIs**: File API, Drag & Drop API, Dynamic Imports
- **Optional APIs**: Clipboard API (for better UX)
- **React 19 Compatible**: Uses raw Quill instead of react-quill

## Contributing

When adding new features:
1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Update documentation
5. Test across different browsers
6. Consider accessibility requirements