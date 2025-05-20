require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Azure Blob Storage configuration
let blobServiceClient;
let containerClient;
try {
  blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);
  console.log('Azure Blob Storage client initialized successfully');
} catch (error) {
  console.error('Error initializing Azure Blob Storage client:', error);
}

// Azure Form Recognizer configuration
let formRecognizerClient;
try {
  formRecognizerClient = new DocumentAnalysisClient(
    process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
    { key: process.env.AZURE_FORM_RECOGNIZER_KEY }
  );
  console.log('Azure Form Recognizer client initialized successfully');
} catch (error) {
  console.error('Error initializing Azure Form Recognizer client:', error);
}

// SQL Database configuration
const sqlConfig = {
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// SQL Connection pool
let sqlPool;

// Initialize SQL connection pool
async function initializeSqlPool() {
  try {
    sqlPool = await sql.connect(sqlConfig);
    console.log('SQL Connection pool initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing SQL connection pool:', err);
    return false;
  }
}

// Initialize SQL table if not exists
async function initializeDatabase() {
  try {
    if (!sqlPool) {
      await initializeSqlPool();
    }
    
    await sqlPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='recipes' AND xtype='U')
      CREATE TABLE recipes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fileName NVARCHAR(255) NOT NULL,
        blobUrl NVARCHAR(1000) NOT NULL,
        uploadTimestamp DATETIME DEFAULT GETDATE(),
        status NVARCHAR(50) DEFAULT 'pending',
        operationId NVARCHAR(255),
        processingResult NVARCHAR(MAX)
      )
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    // Try to reconnect
    await initializeSqlPool();
  }
}

// Upload and process document
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes`);

    // Validate Azure services are initialized
    if (!blobServiceClient || !containerClient) {
      throw new Error('Azure Blob Storage client not initialized');
    }
    if (!formRecognizerClient) {
      throw new Error('Azure Form Recognizer client not initialized');
    }

    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload to Azure Blob Storage
    console.log('Uploading to Azure Blob Storage...');
    await blockBlobClient.upload(file.buffer, file.size);
    const blobUrl = blockBlobClient.url;
    console.log('File uploaded to blob storage:', blobUrl);

    // Process with Form Recognizer
    console.log('Processing with Form Recognizer...');
    const poller = await formRecognizerClient.beginAnalyzeDocument(
      process.env.AZURE_FORM_RECOGNIZER_MODEL_ID,
      file.buffer
    );
    const result = await poller.pollUntilDone();
    console.log('Form Recognizer processing completed');

    // Store in SQL Database
    console.log('Storing in SQL Database...');
    if (!sqlPool) {
      await initializeSqlPool();
    }
    await sqlPool.request().query`
      INSERT INTO recipes (fileName, blobUrl, status, processingResult)
      VALUES (${file.originalname}, ${blobUrl}, 'completed', ${JSON.stringify(result)})
    `;
    console.log('Data stored in SQL Database');

    res.json({
      message: 'File processed successfully',
      blobUrl,
      processingResult: result
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: 'Error processing file',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get processing history
app.get('/api/history', async (req, res) => {
  try {
    if (!sqlPool) {
      await initializeSqlPool();
    }
    const result = await sqlPool.request().query`SELECT * FROM recipes ORDER BY uploadTimestamp DESC`;
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching history:', error);
    // Try to reconnect if there's a connection error
    if (error.code === 'ECONNCLOSED' || error.code === 'ETIMEDOUT') {
      await initializeSqlPool();
    }
    res.status(500).json({ 
      error: 'Error fetching history',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    services: {
      azureBlobStorage: !!blobServiceClient,
      azureFormRecognizer: !!formRecognizerClient,
      sqlDatabase: !!sqlPool
    }
  };
  res.json(health);
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeSqlPool();
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`CORS enabled for http://localhost:4200`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
