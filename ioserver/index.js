import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { spawn } from 'child_process';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(cors({ origin: '*' }));
dotenv.config();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
    }
});
const streamws = io.of('/stream');

io.on('connection', socket => {
    console.log('Socket Connected', socket.id);
    const payload = socket.handshake.query;

    const rtmpLink = payload.streamUrl;
    // console.log(rtmpLink, payload.streamKey);

    const options = [
        '-i',
        '-',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-r', `${25}`,
        '-g', `${25 * 2}`,
        '-keyint_min', 25,
        '-crf', '25',
        '-pix_fmt', 'yuv420p',
        '-sc_threshold', '0',
        '-profile:v', 'main',
        '-level', '3.1',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', 128000 / 4,
        '-f', 'flv',
        `${rtmpLink}`,
    ];

    // const options2 = [
    //     '-i',
    //     '-',
    //     '-c:v', 'libx264',
    //     '-preset', 'ultrafast',
    //     '-tune', 'zerolatency',
    //     '-r', `${25}`,
    //     '-g', `${25 * 2}`,
    //     '-keyint_min', 25,
    //     '-crf', '25',
    //     '-pix_fmt', 'yuv420p',
    //     '-sc_threshold', '0',
    //     '-profile:v', 'main',
    //     '-level', '3.1',
    //     '-c:a', 'aac',
    //     '-b:a', '128k',
    //     '-ar', 128000 / 4,
    //     '-f', 'flv',
    //     `${process.env.INSTA_RMPT}`
    // ];

    // const ffmpegProcess = spawn('ffmpeg', options);
    // const ffmpegProcess2 = spawn('ffmpeg', options2);

    // ffmpegProcess.stdout.on('data', (data) => {
    //     console.log(`ffmpeg stdout: ${data}`);
    // })
    // ffmpegProcess2.stdout.on('data', (data) => {
    //     console.log(`ffmpeg stdout: ${data}`);
    // })

    // ffmpegProcess.stderr.on('data', (data) => {
    //     console.error(`ffmpeg stderr: ${data}`);
    // });
    // ffmpegProcess2.stderr.on('data', (data) => {
    //     console.error(`ffmpeg stderr: ${data}`);
    // });

    // ffmpegProcess.on('close', (code) => {
    //     console.log(`ffmpeg process exited with code ${code}`);
    // });
    // ffmpegProcess2.on('close', (code) => {
    //     console.log(`ffmpeg process exited with code ${code}`);
    // });

    socket.on('binarystream', stream => {
        console.log('Incoming binary stream', stream);
        // ffmpegProcess.stdin.write(stream, (err) => {
        //     console.log('Err', err);
        // })
        // ffmpegProcess2.stdin.write(stream, (err) => {
        //     console.log('Err', err);
        // })
    })
})

httpServer.listen(5000, () => console.log('App listining to port 5000'));