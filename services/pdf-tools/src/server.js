require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const archiver = require('archiver');
const imageSize = require('image-size');

// --- CONFIGURAÇÃO ---
const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3002;

// --- CLIENTE S3 (MINIO) ---
const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

// --- ROTAS ---

// Rota para Juntar PDFs (existente)
app.post('/merge', upload.array('files'), async (req, res) => {
    console.log(`[PDF-Tools] Recebidos ${req.files.length} arquivos para mesclar.`);
    if (!req.files || req.files.length < 2) {
        return res.status(400).json({ error: 'Por favor, envie pelo menos dois arquivos para mesclar.' });
    }
    try {
        const mergedPdf = await PDFDocument.create();
        for (const file of req.files) {
            const pdf = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const mergedPdfBytes = await mergedPdf.save();
        const fileName = `merged-${randomUUID()}.pdf`;

        const putCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: mergedPdfBytes,
            ContentType: 'application/pdf',
        });
        await s3Client.send(putCommand);
        console.log(`[PDF-Tools] Arquivo ${fileName} salvo no bucket.`);

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
        console.error('[PDF-Tools] Erro ao processar PDFs:', error);
        res.status(500).json({ error: 'Falha ao processar os arquivos PDF.' });
    }
});

// Rota para Separar PDF (existente)
app.post('/split', upload.single('file'), async (req, res) => {
    console.log(`[PDF-Tools] Recebido arquivo para separar.`);
    if (!req.file) {
        return res.status(400).json({ error: 'Por favor, envie um arquivo PDF.' });
    }
    try {
        const originalPdf = await PDFDocument.load(req.file.buffer);
        const pageCount = originalPdf.getPageCount();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=paginas_separadas.zip');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', function(err) {
            console.error('[PDF-Tools] Erro no Archiver:', err);
            res.end();
            throw err;
        });
        archive.pipe(res);
        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            const pageName = `pagina-${i + 1}.pdf`;
            archive.append(Buffer.from(pdfBytes), { name: pageName });
        }
        await archive.finalize();
        console.log(`[PDF-Tools] Arquivo zip com ${pageCount} páginas enviado.`);
    } catch (error) {
        console.error('[PDF-Tools] Erro ao separar PDF:', error.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Falha ao separar o arquivo PDF.' });
        }
    }
});

// Rota para JPG para PDF (existente)
app.post('/jpg-to-pdf', upload.array('files'), async (req, res) => {
    console.log(`[PDF-Tools] Recebidos ${req.files.length} arquivos JPG para converter.`);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Por favor, envie pelo menos um arquivo JPG.' });
    }
    try {
        const newPdf = await PDFDocument.create();
        for (const file of req.files) {
            if (file.mimetype !== 'image/jpeg') {
                console.warn(`[PDF-Tools] Arquivo ${file.originalname} ignorado por não ser JPG.`);
                continue;
            }
            const jpgImage = await newPdf.embedJpg(file.buffer);
            const page = newPdf.addPage([jpgImage.width, jpgImage.height]);
            page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
        }
        const pdfBytes = await newPdf.save();
        res.setHeader('Content-Disposition', 'attachment; filename=convertido-jpg.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
        console.log(`[PDF-Tools] PDF com imagens JPG convertido e enviado.`);
    } catch (error) {
        console.error('[PDF-Tools] Erro ao converter JPG para PDF:', error);
        res.status(500).json({ error: 'Falha ao converter as imagens para PDF.' });
    }
});

// --- NOVA ROTA PARA PNG PARA PDF ---
app.post('/png-to-pdf', upload.array('files'), async (req, res) => {
    console.log(`[PDF-Tools] Recebidos ${req.files.length} arquivos PNG para converter.`);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Por favor, envie pelo menos um arquivo PNG.' });
    }

    try {
        const newPdf = await PDFDocument.create();

        for (const file of req.files) {
            if (file.mimetype !== 'image/png') {
                console.warn(`[PDF-Tools] Arquivo ${file.originalname} ignorado por não ser PNG.`);
                continue;
            }
            
            // A única mudança principal é usar embedPng em vez de embedJpg
            const pngImage = await newPdf.embedPng(file.buffer);
            
            const page = newPdf.addPage([pngImage.width, pngImage.height]);
            
            page.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pngImage.width,
                height: pngImage.height,
            });
        }

        const pdfBytes = await newPdf.save();

        res.setHeader('Content-Disposition', 'attachment; filename=convertido-png.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
        console.log(`[PDF-Tools] PDF com imagens PNG convertido e enviado.`);

    } catch (error) {
        console.error('[PDF-Tools] Erro ao converter PNG para PDF:', error);
        res.status(500).json({ error: 'Falha ao converter as imagens para PDF.' });
    }
});

app.listen(PORT, () => {
    console.log(`Microsserviço PDF-Tools rodando em http://localhost:${PORT}`);
});