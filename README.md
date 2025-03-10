# KodiLike Media Server

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Version](https://img.shields.io/badge/version-0.0.1-green.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)

A modern, API-first media server similar to Kodi, combining a robust backend infrastructure for media management and streaming with various frontend clients.

## ✨ Features

- **Media Management**: Organize your movies, TV shows, and music in one place
- **Metadata Enrichment**: Automatically fetch and display detailed information about your media
- **Streaming Capabilities**: Stream your content to any device with adaptive bitrate
- **User Management**: Multiple user profiles with personalized settings
- **Watch Progress Tracking**: Resume playback from where you left off
- **Playlists & Collections**: Create and manage custom media collections
- **Search & Filter**: Powerful search functionality across your media library
- **Thumbnails & Artwork**: Beautiful visual representation of your media
- **Subtitle Support**: Automatic detection and selection of subtitle files

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- FFmpeg (for media transcoding)

### FFmpeg Installation

FFmpeg is required for media processing and transcoding:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) or install via Chocolatey:
```bash
choco install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mediaserver.git
   cd mediaserver
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_DATABASE=mediaserver
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1d
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Media
   MEDIA_ROOT=/path/to/your/media
   THUMBNAILS_DIR=./thumbnails
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

5. The server will be running at `http://localhost:3000`

## 🏗️ Architecture

The project follows a modular architecture based on NestJS:

- **API-First Design**: All functionality is exposed through a well-documented REST API
- **Microservice-Oriented**: Modular components that can be developed and scaled independently
- **Database**: PostgreSQL for metadata storage
- **Media Storage**: Local filesystem with optional cloud storage support
- **Authentication**: JWT-based authentication system

## 📚 API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

The API follows RESTful principles with consistent response formats:

```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/auth/register` | POST | User registration |
| `/media` | GET | List all media |
| `/media/:id` | GET | Get media details |
| `/libraries` | GET | List all libraries |
| `/streaming/:id` | GET | Stream media content |
| `/progress/:mediaId` | GET | Get watch progress |
| `/progress/:mediaId` | POST | Update watch progress |

## 🧩 Core Modules

- **Auth**: User authentication and authorization
- **Media**: Core media management functionality
- **Library**: Media library organization
- **Metadata**: Fetching and storing media metadata
- **Streaming**: Media streaming capabilities
- **User**: User management
- **Playlist**: Custom playlist creation and management
- **Search**: Advanced search functionality
- **Thumbnail**: Media artwork management

## 📋 Supported Media Formats

### Video Formats
- MP4 (H.264, H.265)
- MKV
- AVI
- MOV
- WebM

### Audio Formats
- MP3
- AAC
- FLAC
- OGG
- WAV

### Subtitle Formats
- SRT
- VTT
- SUB
- SSA/ASS

## 🛠️ Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

### Building for Production

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check network connectivity to database server

**Media Scanning Issues**
- Ensure media directories have correct permissions
- Verify FFmpeg is properly installed
- Check logs for specific scanning errors

**Streaming Problems**
- Verify media file is not corrupted
- Check if file format is supported
- Ensure sufficient disk space for transcoding

## 📋 Project Roadmap

- [x] Core API functionality
- [x] User authentication
- [x] Basic media management
- [ ] Advanced search capabilities
- [ ] Media transcoding
- [ ] Mobile client applications
- [ ] Web client applications
- [ ] Media recommendations
- [ ] Social features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation for any changes
- Reference relevant issues in your pull request

## 📜 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Project Link: [https://github.com/yourusername/mediaserver](https://github.com/yourusername/mediaserver) 