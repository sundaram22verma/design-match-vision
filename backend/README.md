# Figma-to-Code Visual Comparison Backend

A Node.js backend service that compares Figma designs with implemented code using visual analysis. Built with Express.js, Puppeteer, and Resemble.js.

## 🚀 Features

- **Image Download**: Downloads Figma images from URLs
- **Screenshot Capture**: Takes screenshots of web pages using Puppeteer
- **Visual Comparison**: Compares images using Resemble.js
- **Diff Generation**: Creates visual diff images highlighting differences
- **RESTful API**: Clean Express.js API endpoints
- **Error Handling**: Comprehensive error handling and retry logic
- **CORS Support**: Cross-origin resource sharing enabled

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows/Linux/macOS

## 🛠️ Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## 🌐 API Endpoints

### Health Check
```
GET /health
```
Returns server status and basic information.

**Response:**
```json
{
  "status": "OK",
  "message": "Figma-to-Code comparison server is running"
}
```

### Compare Images
```
POST /compare
```

**Request Body:**
```json
{
  "figmaImageUrl": "https://example.com/figma-design.png",
  "pageUrl": "http://localhost:3000"
}
```

**Response:**
```json
{
  "matchScore": "87.55",
  "diffImagePath": "/diff.png",
  "misMatchPercentage": "12.45",
  "analysisTime": "2024-01-15T10:30:00.000Z",
  "originalImages": {
    "figma": "/figma.png",
    "code": "/code.png"
  }
}
```

### Serve Images
```
GET /figma.png    # Original Figma image
GET /code.png     # Screenshot of the page
GET /diff.png     # Visual diff image
```

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── downloadImage.js       # Image download functionality
├── screenshot.js          # Puppeteer screenshot logic
├── compare.js             # Resemble.js comparison logic
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── assets/               # Generated images
    ├── figma.png         # Downloaded Figma image
    ├── code.png          # Page screenshot
    └── diff.png          # Comparison diff image
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Screenshot Options

You can customize screenshot behavior by modifying `screenshot.js`:

```javascript
const options = {
  viewport: {
    width: 1440,
    height: 900
  },
  waitTime: 2000,        // Wait time after page load
  fullPage: false,       // Full page screenshot
  quality: 90,          // JPEG quality
  type: 'png'           // Image format
};
```

### Comparison Options

Customize comparison behavior in `compare.js`:

```javascript
const options = {
  ignore: ['antialiasing', 'colors'],  // What to ignore
  scaleToSameSize: true,               // Scale images to same size
  output: {
    errorColor: { red: 255, green: 0, blue: 255 },
    transparency: 0.3
  }
};
```

## 🧪 Testing

### Using curl

```bash
# Health check
curl http://localhost:5000/health

# Compare images
curl -X POST http://localhost:5000/compare \
  -H "Content-Type: application/json" \
  -d '{
    "figmaImageUrl": "https://example.com/figma.png",
    "pageUrl": "http://localhost:3000"
  }'
```

### Using Postman

1. Create a new POST request to `http://localhost:5000/compare`
2. Set Content-Type header to `application/json`
3. Add request body:
   ```json
   {
     "figmaImageUrl": "https://example.com/figma.png",
     "pageUrl": "http://localhost:3000"
   }
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   - Ensure you have sufficient system resources
   - Try running with `--no-sandbox` flag (already included)

2. **Image download fails**
   - Check if the URL is accessible
   - Verify the URL points to an actual image
   - Check network connectivity

3. **Comparison fails**
   - Ensure both images exist and are valid
   - Check file permissions in assets directory
   - Verify image formats are supported

### Debug Mode

Set `NODE_ENV=development` for detailed error messages:

```bash
NODE_ENV=development npm start
```

## 📊 Performance

- **Image Download**: ~1-5 seconds (depends on image size and network)
- **Screenshot**: ~3-10 seconds (depends on page complexity)
- **Comparison**: ~1-3 seconds (depends on image resolution)

## 🔒 Security

- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Error messages sanitized in production
- No sensitive data stored

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Create an issue with detailed information 