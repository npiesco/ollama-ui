# Offline Functionality Testing Guide

This guide provides step-by-step instructions for manually testing the offline capabilities of Ollama UI.

## Prerequisites

1. Build the application:
```bash
npm run build
npm start
```

2. Open Chrome DevTools:
- Press F12 or right-click and select "Inspect"
- Go to the "Application" tab
- Enable "Offline" mode in the "Service Workers" section

## Testing Steps

### 1. Service Worker Registration

1. Open the application in Chrome
2. In DevTools:
   - Go to Application > Service Workers
   - Verify that the service worker is registered
   - Check that the status is "activated and is running"

### 2. Static Asset Caching

1. Load the application while online
2. In DevTools:
   - Go to Application > Cache Storage
   - Verify that static assets are cached
   - Check that all required assets are present

3. Go offline and refresh the page
4. Verify that:
   - The UI loads correctly
   - All static assets are displayed
   - No network errors in the console

### 3. Model Caching

1. Load a model while online:
   - Go to the Models page
   - Select and download a model
   - Wait for download to complete

2. In DevTools:
   - Go to Application > IndexedDB
   - Verify that the model is stored in the database

3. Go offline and try to use the model:
   - Navigate to the Chat page
   - Select the cached model
   - Try to generate a response
   - Verify that inference works without network

### 4. Offline Chat History

1. Create some chat history while online
2. Go offline
3. Verify that:
   - Chat history is still visible
   - Can view previous conversations
   - Can scroll through message history

### 5. Network Status Handling

1. Test online/offline transitions:
   - Start in online mode
   - Go offline (using DevTools)
   - Verify offline indicator appears
   - Go back online
   - Verify offline indicator disappears

2. Test error handling:
   - Go offline
   - Try to download a new model
   - Verify appropriate error message
   - Try to use an uncached model
   - Verify appropriate error message

### 6. Performance Testing

1. Test offline performance:
   - Go offline
   - Measure time to load UI
   - Measure time to load cached models
   - Measure inference time
   - Compare with online performance

2. Test memory usage:
   - Monitor memory usage while offline
   - Check for memory leaks
   - Verify cache size limits

## Common Issues and Solutions

### Service Worker Not Registering

1. Check browser console for errors
2. Verify HTTPS/localhost is being used
3. Clear browser cache and service workers
4. Try in incognito mode

### Model Not Caching

1. Check IndexedDB storage
2. Verify model download completed
3. Check network tab for errors
4. Verify sufficient storage space

### Offline Inference Not Working

1. Verify model is properly cached
2. Check WASM initialization
3. Monitor memory usage
4. Check browser console for errors

## Browser Support Testing

Test the offline functionality in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Reporting Issues

When reporting issues:
1. Include browser version
2. Include steps to reproduce
3. Include console logs
4. Include network tab information
5. Include IndexedDB contents 